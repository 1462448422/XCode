import { createServiceLogger } from "../logger/serviceLogger.js";
import {
  describeCodeBuddyAccessToken,
  listCodeBuddyAccounts,
  type CodeBuddyRegion,
} from "./codebuddyAuth.js";

/**
 * XCode fork：CodeBuddy 每日签到（billing meter 流程）。
 *
 * 协议从 codebuddy2api（Next.js 参考实现）完整逆向搬运，**与 Qoder 的
 * campaigns 流程完全不同**——走 `/v2/billing/meter/*`，全部 POST 且 body `{}`：
 *
 *   1. POST /v2/billing/meter/checkin-activity-status   → 签到活动状态（主）
 *      404/405（端点未部署）时回退 POST /v2/billing/meter/checkin-status
 *   2. POST /v2/billing/meter/daily-checkin             → 领取（**一次调用**）
 *
 * 关键语义（上游实测，照做即可）：
 *   - 状态字段是宽松查找的 `claimed`（boolean | null）：不同账号/版本的响应
 *     形状可能有差异（顶层 / data 下 / 字符串 CLAIMED 等），用 findValue 递归
 *     查找而不是固定路径解。
 *   - 领取只发一次 daily-checkin；重复领取上游按 already-claimed 处理而非
 *     error，因此多实例/重启竞争是安全的。
 *   - 失败时保留原始错误信息，仅把 `/v2/billing/meter/daily-checkin returned`
 *     替换为 `claim returned` 再展示（与参考实现的展示口径一致）。
 *   - 企业账号（enterprise seat）走 tenant meter，个人资源查询对它返回空——
 *     但签到端点本身不区分个人/企业，enterprise seat 同样可领取。
 *
 * 端点 host 按账号区域分流（与 codebuddyAuth 的 REGION_CONFIGS 一致）：
 * CN=copilot.tencent.com，Intl=www.codebuddy.ai。令牌直接复用账号列表里的
 * accessToken，不另造存储；X-User-Id 取访问令牌 JWT 的 sub（与
 * codebuddyUpstreamModels 的 /v3/config 同一约定）。
 *
 * 同构约束：本模块会被 UI 拖进 renderer bundle（只取类型），因此不能用
 * node:crypto / Buffer；网络走全局 fetch。实际执行发生在 host（RPC）。
 */

export type CodeBuddyCheckinRegion = CodeBuddyRegion;

export type CodeBuddyCheckinStatus =
  /** 本次领取成功。 */
  | "claimed"
  /** 今日已领取（读取状态即claimed，或上游对重复领取按已领取处理）。 */
  | "already"
  /** 账号未开放签到活动（状态端点主/备均 404/405，meter 未部署）。 */
  | "no_activity"
  /** 账号无可用令牌（需要重新登录）。 */
  | "no_token"
  /** 其它错误（网络、上游 5xx、未知响应等）。 */
  | "error";

export interface CodeBuddyCheckinResult {
  /** 账号标识（登录会话 state，与账号列表一致）。 */
  accountId: string;
  /** 账号显示名（列表回显用）。 */
  accountName: string;
  region: CodeBuddyCheckinRegion;
  status: CodeBuddyCheckinStatus;
  /** 上游 claimed 字段原值（boolean | null），与状态查询口径一致。 */
  claimed: boolean | null;
  /** 上游返回的 message（原样透传；无则空串）。 */
  message: string;
  /** 失败时的错误说明（成功/already 为 null）。 */
  error: string | null;
  /** 本次对应的窗口日期（本地时区 YYYY-MM-DD；签到按自然日结算）。 */
  windowDate: string;
  /** 本地累计签到天数（含今天，若今天已记）。 */
  totalClaimDays: number;
}

export interface CodeBuddyCheckinStats {
  /** 本地记录的最近一次领取窗口日期（无则 null）。 */
  lastClaimDate: string | null;
  /** 本地累计签到天数。 */
  totalClaimDays: number;
  /** 最近若干条领取记录（新→旧），供 UI 展示。 */
  recent: Array<{ date: string }>;
}

export interface CodeBuddyCheckinSummary {
  results: CodeBuddyCheckinResult[];
  /** status → 数量，例如 { claimed: 2, already: 1 }。 */
  summary: Record<string, number>;
}

/** 签到端点 host 按区域分流（与 codebuddyAuth 登录端点同域）。 */
const CHECKIN_ORIGIN: Record<CodeBuddyCheckinRegion, string> = {
  cn: "https://copilot.tencent.com",
  intl: "https://www.codebuddy.ai",
};

const CHECKIN_DOMAIN: Record<CodeBuddyCheckinRegion, string> = {
  cn: "copilot.tencent.com",
  intl: "www.codebuddy.ai",
};

/** 主/备状态端点（活动状态端点未部署时回退）。 */
const CHECKIN_ACTIVITY_STATUS_PATH = "/v2/billing/meter/checkin-activity-status";
const CHECKIN_STATUS_FALLBACK_PATH = "/v2/billing/meter/checkin-status";
const DAILY_CHECKIN_PATH = "/v2/billing/meter/daily-checkin";

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * 官方客户端实抓 UA（与 codebuddyUpstreamModels 的 /v3/config 同源；
 * 参考实现的 meter 端点用的是 CLI/2.137.1 同款，这里保持其形态）。
 */
const CHECKIN_UA: Record<CodeBuddyCheckinRegion, string> = {
  cn: "CLI/2.137.1 CodeBuddy/2.137.1",
  intl: "CLI/2.137.1 CodeBuddy/2.137.1",
};

/** 批量签到并发上限（与参考实现的 checkinAccounts 分片一致）。 */
const CHECKIN_CONCURRENCY = 4;

/** 本地签到记录保留条数上限（防止存储无限增长）。 */
const HISTORY_LIMIT = 120;

// 懒创建（与 codebuddyAuth 同理由：UI 会拖入本模块，顶层执行会崩）。
function logger() {
  return createServiceLogger("codebuddy-checkin");
}

// ---------------------------------------------------------------------------
// 本地签到历史（累计天数 + 自动签到"已领取当天"去重）
// ---------------------------------------------------------------------------

/** key: `${region}:${accountId}` → 窗口日期列表（本地时区，升序去重）。 */
type CodeBuddyCheckinHistory = Record<string, string[]>;

export interface CodeBuddyCheckinHistoryStore {
  load(key: string): Promise<string | null>;
  save(key: string, value: string): Promise<void>;
}

const HISTORY_STORE_KEY = "codebuddy:checkin:history";

let historyStore: CodeBuddyCheckinHistoryStore | null = null;
let historyCache: CodeBuddyCheckinHistory | null = null;
/** 串行化 load/save，避免并发签到把历史写丢。 */
let historyWriteChain: Promise<void> = Promise.resolve();

/** node.ts 组装时注入持久化（credentialService，与账号列表同一加密通道）。 */
export function setCodeBuddyCheckinHistoryStore(store: CodeBuddyCheckinHistoryStore | null): void {
  historyStore = store;
  historyCache = null;
}

async function loadHistory(): Promise<CodeBuddyCheckinHistory> {
  if (historyCache) return historyCache;
  const empty: CodeBuddyCheckinHistory = {};
  if (!historyStore) {
    historyCache = empty;
    return empty;
  }
  try {
    const raw = await historyStore.load(HISTORY_STORE_KEY);
    if (!raw) {
      historyCache = empty;
      return empty;
    }
    const parsed = JSON.parse(raw) as CodeBuddyCheckinHistory;
    const normalized: CodeBuddyCheckinHistory = {};
    for (const [key, dates] of Object.entries(parsed ?? {})) {
      if (!Array.isArray(dates)) continue;
      normalized[key] = dates.filter((date): date is string => typeof date === "string");
    }
    historyCache = normalized;
    return normalized;
  } catch (error) {
    logger().warn(undefined, "CodeBuddy 签到历史读取失败", {
      message: error instanceof Error ? error.message : String(error),
    });
    historyCache = empty;
    return empty;
  }
}

function saveHistory(history: CodeBuddyCheckinHistory): Promise<void> {
  historyCache = history;
  if (!historyStore) return Promise.resolve();
  const operation = historyWriteChain.then(async () => {
    try {
      await historyStore?.save(HISTORY_STORE_KEY, JSON.stringify(history));
    } catch (error) {
      logger().warn(undefined, "CodeBuddy 签到历史写入失败", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
  historyWriteChain = operation;
  return operation;
}

function accountKeyOf(region: CodeBuddyCheckinRegion, accountId: string): string {
  return `${region}:${accountId}`;
}

/** 本地时区 YYYY-MM-DD（签到按自然日结算，无 Qoder 那种 10:00 窗口）。 */
function localDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 记录一次成功领取（同日幂等），返回该账号累计天数。 */
async function recordClaim(accountKey: string, date: string): Promise<number> {
  const history = await loadHistory();
  const dates = history[accountKey] ?? [];
  if (dates.includes(date)) return dates.length;
  const next = [...dates, date].sort().slice(-HISTORY_LIMIT);
  history[accountKey] = next;
  await saveHistory(history);
  return next.length;
}

/** 只读统计（不触发任何上游请求）。 */
async function readStats(accountKey: string): Promise<CodeBuddyCheckinStats> {
  const history = await loadHistory();
  const dates = [...(history[accountKey] ?? [])].sort().reverse();
  return {
    lastClaimDate: dates[0] ?? null,
    totalClaimDays: dates.length,
    recent: dates.slice(0, 10).map((date) => ({ date })),
  };
}

// ---------------------------------------------------------------------------
// 协议层
// ---------------------------------------------------------------------------

interface CodeBuddyCheckinHttpResponse {
  /** HTTP 状态码；网络失败为 0。 */
  status: number;
  /** 解析后的 JSON body（解析失败/空 body 为 null）。 */
  body: unknown;
  /** 原始响应体（错误信息截断用）。 */
  raw: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * 在 payload 里递归查找目标键（宽松解析）。
 *
 * 不同账号/上游版本的签到状态形状可能有差异： claimed 可能在顶层、data 下，
 * 也可能是字符串状态值。固定路径解会把形状变化误判成未领取，因此与参考
 * 实现一致地做全递归查找（对象值 + 数组元素）。
 */
function findValue(value: unknown, keys: readonly string[]): unknown {
  const record = asRecord(value);
  if (record) {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null) return record[key];
    }
    for (const nested of Object.values(record)) {
      const found = findValue(nested, keys);
      if (found !== undefined) return found;
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findValue(item, keys);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/** 上游 404/405 = meter 端点未部署（不是错误，走回退/无活动）。 */
function isNotFoundOrMethodMismatch(response: CodeBuddyCheckinHttpResponse): boolean {
  return response.status === 404 || response.status === 405;
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}

/** 签到请求头：与参考实现 fetchJson 对齐，身份头取账号 JWT sub。 */
function checkinHeaders(
  region: CodeBuddyCheckinRegion,
  accessToken: string,
): Record<string, string> {
  const origin = CHECKIN_ORIGIN[region];
  const domain = CHECKIN_DOMAIN[region];
  const userId = describeCodeBuddyAccessToken(accessToken)?.sub ?? "";
  return {
    Accept: "application/json, text/plain, */*",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Origin: origin,
    Referer: `${origin}/`,
    "User-Agent": CHECKIN_UA[region],
    "X-IDE-Name": "CLI",
    "X-IDE-Type": "CLI",
    "X-IDE-Version": "2.137.1",
    "X-Product": "SaaS",
    "X-Requested-With": "XMLHttpRequest",
    "X-Domain": domain,
    ...(userId ? { "X-User-Id": userId } : {}),
  };
}

/** 发送 meter 请求（全部 POST + 空 body `{}`，15s 超时）。 */
async function doMeterRequest(
  region: CodeBuddyCheckinRegion,
  path: string,
  accessToken: string,
): Promise<CodeBuddyCheckinHttpResponse> {
  let response: Response;
  try {
    response = await fetch(`${CHECKIN_ORIGIN[region]}${path}`, {
      method: "POST",
      headers: checkinHeaders(region, accessToken),
      body: "{}",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return {
      status: 0,
      body: null,
      raw: error instanceof Error ? error.message : String(error),
    };
  }
  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }
  return { status: response.status, body, raw };
}

/**
 * 查签到状态：主端点 checkin-activity-status，404/405 回退 checkin-status。
 * 两端点均未部署时返回 null（调用方按 no_activity 处理）。
 */
async function fetchCheckinStatus(
  region: CodeBuddyCheckinRegion,
  accessToken: string,
): Promise<CodeBuddyCheckinHttpResponse | null> {
  const primary = await doMeterRequest(region, CHECKIN_ACTIVITY_STATUS_PATH, accessToken);
  if (!isNotFoundOrMethodMismatch(primary)) return primary;
  const fallback = await doMeterRequest(region, CHECKIN_STATUS_FALLBACK_PATH, accessToken);
  if (isNotFoundOrMethodMismatch(fallback)) return null;
  return fallback;
}

/** claimed 宽松解析：boolean 直取；字符串按 CLAIMED/ALREADY_CLAIMED/CHECKED_IN 归一。 */
function parseClaimed(payload: unknown): { claimed: boolean | null; message: string } {
  const value = findValue(payload, [
    "claimed",
    "isClaimed",
    "checkedIn",
    "today_checked_in",
    "todayCheckedIn",
    "status",
  ]);
  if (typeof value === "boolean") return { claimed: value, message: "" };
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    const claimed = ["CLAIMED", "ALREADY_CLAIMED", "CHECKED_IN", "ALREADY"].includes(normalized)
      ? true
      : ["UNCLAIMED", "NOT_CLAIMED", "PENDING"].includes(normalized)
        ? false
        : null;
    return { claimed, message: value };
  }
  return { claimed: null, message: "" };
}

/**
 * 签到活动是否开启（`active` 字段，宽松查找）。
 *
 * 上游 checkin-activity-status 返回 `{active: boolean, today_checked_in: boolean, ...}`：
 *   - active=false → 该账号未被灰度到签到活动，daily-checkin 必回 400；
 *   - active=true  → 活动已开启（today_checked_in 才是是否已领的判据）。
 * 返回 null 表示字段缺失（老版本响应/形状变化），调用方应保持原行为，
 * 不要把它当成 false。
 */
function parseActiveFlag(payload: unknown): boolean | null {
  const value = findValue(payload, ["active", "isActive", "activity_active"]);
  return typeof value === "boolean" ? value : null;
}

/**
 * 响应里的 message 字段（宽松查找）。
 *
 * 上游对「一切正常」只回 `{"code":0,"msg":"OK"}`，这种文案对用户没有信息量，
 * 一律当空处理，让调用方的兜底文案说话（"今日已领取"/"账号未开放签到活动"）。
 * 真正的失败原因（"今天已签到，请明天再来"等）才会被保留。
 */
function parseMessage(payload: unknown): string {
  const value = findValue(payload, ["message", "msg", "hint"]);
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text || /^ok$/i.test(text)) return "";
  return text;
}

/** 展示口径：把端点路径换成 claim（与参考实现一致）。 */
function toDisplayMessage(message: string): string {
  return message.replace(`${DAILY_CHECKIN_PATH} returned`, "claim returned");
}

// ---------------------------------------------------------------------------
// 账号级入口（复用 codebuddyAuth 账号列表，不另造存储）
// ---------------------------------------------------------------------------

/**
 * 单账号签到。
 *
 * 流程：账号列表取令牌 → 先读状态（已领取则直接返回 already，不浪费一次
 * 领取调用）→ POST daily-checkin 领取 → 再读状态确认 → 本地记账。
 */
export async function codebuddyCheckinAccount(
  region: CodeBuddyCheckinRegion,
  accountId: string,
): Promise<CodeBuddyCheckinResult> {
  const { accounts } = await listCodeBuddyAccounts(region);
  const account = accounts.find((item) => item.id === accountId);
  if (!account) {
    return {
      accountId,
      accountName: accountId,
      region,
      status: "error",
      claimed: null,
      message: "账号不存在或未登录，请先在账号列表登录",
      error: "账号不存在或未登录，请先在账号列表登录",
      windowDate: localDateKey(new Date()),
      totalClaimDays: 0,
    };
  }

  const accessToken = (account.accessToken ?? "").trim();
  if (!accessToken) {
    return {
      accountId,
      accountName: account.displayName || accountId,
      region,
      status: "no_token",
      claimed: null,
      message: "无访问令牌（请重新登录账号）",
      error: "无访问令牌（请重新登录账号）",
      windowDate: localDateKey(new Date()),
      totalClaimDays: 0,
    };
  }

  const windowDate = localDateKey(new Date());
  const accountKey = accountKeyOf(region, accountId);
  const base = {
    accountId,
    accountName: account.displayName || accountId,
    region,
    windowDate,
    totalClaimDays: 0,
    claimed: null as boolean | null,
    message: "",
    error: null as string | null,
  };

  // Step 1：先读状态。已领取直接返回，不消耗一次领取调用（重启/多实例竞争时
  // 上游虽按 already-claimed 处理，但少发一次请求总是更稳）。
  let statusResponse: CodeBuddyCheckinHttpResponse | null;
  try {
    statusResponse = await fetchCheckinStatus(region, accessToken);
  } catch (error) {
    statusResponse = { status: 0, body: null, raw: error instanceof Error ? error.message : String(error) };
  }
  if (statusResponse === null) {
    return {
      ...base,
      status: "no_activity",
      message: "账号未开放签到活动（签到端点未部署）",
      totalClaimDays: (await readStats(accountKey)).totalClaimDays,
    };
  }
  if (statusResponse.status !== 200) {
    return {
      ...base,
      status: "error",
      message: `签到状态查询失败 HTTP ${statusResponse.status}`,
      error: toDisplayMessage(
        `checkin status returned ${statusResponse.status}: ${truncate(statusResponse.raw, 300)}`,
      ),
      totalClaimDays: (await readStats(accountKey)).totalClaimDays,
    };
  }
  const preStatus = parseClaimed(statusResponse.body);
  const preMessage = parseMessage(statusResponse.body) || preStatus.message;
  if (preStatus.claimed === true) {
    // 上游说今天已领取：本地补记账（幂等），返回 already。
    const totalClaimDays = await recordClaim(accountKey, windowDate);
    return {
      ...base,
      status: "already",
      claimed: true,
      message: preMessage || "今日已领取",
      totalClaimDays,
    };
  }

  // 活动未开启（active:false）：上游对 daily-checkin 会回 400
  // {"code":10001,"msg":"签到活动未开启或已过期"}。这不是错误，是账号尚未
  // 被灰度到签到活动——继续发领取请求只会拿到 400，在 UI 上表现为刺眼的
  // 「领取失败 HTTP 400」。实测 intl 账号普遍 active:false、cn 账号 active:true。
  // 注意：active 必须**显式**为 false 才判定，字段缺失（老版本响应）时保持
  // 原行为尝试领取，避免把可能可领的账号误判成无活动。
  if (parseActiveFlag(statusResponse.body) === false) {
    return {
      ...base,
      status: "no_activity",
      // 不用 preMessage：上游对未开启活动回的也是通用 "OK"，没有信息量，
      // 反而会盖掉这句可读结论。
      message: "账号未开放签到活动",
      totalClaimDays: (await readStats(accountKey)).totalClaimDays,
    };
  }

  // Step 2：领取（一次 POST，空 body）。
  const claim = await doMeterRequest(region, DAILY_CHECKIN_PATH, accessToken);
  if (claim.status !== 200) {
    // 失败后回读状态：上游对"重复领取"可能回非 200，此时状态才是真相。
    let postStatus: CodeBuddyCheckinHttpResponse | null = null;
    try {
      postStatus = await fetchCheckinStatus(region, accessToken);
    } catch {
      postStatus = null;
    }
    if (postStatus && postStatus.status === 200) {
      const parsed = parseClaimed(postStatus.body);
      if (parsed.claimed === true) {
        const totalClaimDays = await recordClaim(accountKey, windowDate);
        return {
          ...base,
          status: "already",
          claimed: true,
          message: parseMessage(postStatus.body) || parsed.message || "今日已领取",
          totalClaimDays,
        };
      }
    }
    return {
      ...base,
      status: "error",
      message: `领取失败 HTTP ${claim.status}`,
      // 保留原始错误信息，仅按展示口径替换端点路径（与参考实现一致）。
      error: toDisplayMessage(
        `${DAILY_CHECKIN_PATH} returned ${claim.status}: ${truncate(claim.raw, 300)}`,
      ),
      totalClaimDays: (await readStats(accountKey)).totalClaimDays,
    };
  }

  // Step 3：领取成功，回读状态确认（不一致时以领取调用为准，仅记录差异）。
  const claimMessage = parseMessage(claim.body);
  let postStatus: CodeBuddyCheckinHttpResponse | null = null;
  try {
    postStatus = await fetchCheckinStatus(region, accessToken);
  } catch {
    postStatus = null;
  }
  let confirmed: boolean | null = null;
  if (postStatus && postStatus.status === 200) {
    confirmed = parseClaimed(postStatus.body).claimed;
  }

  const totalClaimDays = await recordClaim(accountKey, windowDate);
  const stats = await readStats(accountKey);
  logger().info(undefined, "CodeBuddy 签到完成", {
    region,
    accountId,
    status: "claimed",
    confirmed,
  });
  return {
    ...base,
    status: "claimed",
    claimed: true,
    message:
      claimMessage ||
      (confirmed === false
        ? "领取成功（状态确认存在延迟，以上游领取记录为准）"
        : "领取成功"),
    totalClaimDays: stats.totalClaimDays || totalClaimDays,
  };
}

/**
 * 批量签到：遍历所有已登录 CodeBuddy 账号。
 *
 * regions 默认 cn + intl 全量。**并发控制在 4**（与参考实现 checkinAccounts
 * 的 `index += 4` 分片一致）：并发过高会被上游限流，过低则大批量账号签到
 * 等待过久。
 */
export async function codebuddyCheckinAll(
  input: { regions?: readonly CodeBuddyCheckinRegion[] } = {},
): Promise<CodeBuddyCheckinSummary> {
  const regions = input.regions?.length ? input.regions : (["cn", "intl"] as const);
  const targets: Array<{ region: CodeBuddyCheckinRegion; accountId: string; accountName: string }> =
    [];
  for (const region of regions) {
    const { accounts } = await listCodeBuddyAccounts(region);
    for (const account of accounts) {
      targets.push({
        region,
        accountId: account.id,
        accountName: account.displayName || account.id,
      });
    }
  }

  const results: CodeBuddyCheckinResult[] = [];
  for (let index = 0; index < targets.length; index += CHECKIN_CONCURRENCY) {
    const chunk = targets.slice(index, index + CHECKIN_CONCURRENCY);
    results.push(
      ...(await Promise.all(
        chunk.map((target) =>
          codebuddyCheckinAccount(target.region, target.accountId).catch(
            (error: unknown): CodeBuddyCheckinResult => ({
              accountId: target.accountId,
              accountName: target.accountName,
              region: target.region,
              status: "error",
              claimed: null,
              message: "签到失败",
              error: error instanceof Error ? error.message : String(error),
              windowDate: localDateKey(new Date()),
              totalClaimDays: 0,
            }),
          ),
        ),
      )),
    );
  }

  const summary: Record<string, number> = {};
  for (const result of results) summary[result.status] = (summary[result.status] ?? 0) + 1;
  return { results, summary };
}

/** 只读获取本地签到统计（不触发任何上游请求）。 */
export async function codebuddyCheckinStats(
  region: CodeBuddyCheckinRegion,
  accountId: string,
): Promise<CodeBuddyCheckinStats> {
  return readStats(accountKeyOf(region, accountId));
}

/** 本地是否已记录"当天已领取"（自动签到调度去重用，不上行）。 */
export async function codebuddyClaimedLocally(
  region: CodeBuddyCheckinRegion,
  accountId: string,
  date: string,
): Promise<boolean> {
  const history = await loadHistory();
  return (history[accountKeyOf(region, accountId)] ?? []).includes(date);
}

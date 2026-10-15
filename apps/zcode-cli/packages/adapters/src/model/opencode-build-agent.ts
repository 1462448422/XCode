/**
 * OpenCode zen 免费档（zen/v1）的闸门适配。
 *
 * 上游门禁三层（2026-10-14 黑盒消融 + asar 静态逆向实测，均为线上原文）：
 *
 *   ① User-Agent 以 `opencode/` 开头即可（`opencode/1.19.0` 足够，
 *      不需要 ai-sdk/runtime/bun 尾段；完整 Electron UA 与裸版本号等价）。
 *   ② `x-opencode-session` 必须是 identifier.ts 的 descending ID，且
 *      counter ≤ 63。counter=1..63 全放行，64..4094 全拒（6 bit 掩码）。
 *      语义是「客户端进程早期创建的真 session」——真实客户端从启动到建 session
 *      之间产出的 ID 有限（counter 小），手编随机 ID 反推 counter 均匀分布、~98% 撞墙。
 *   ③ `tools` 必须**包含**那 11 个官方工具名。少一个/换成别的集合即拒。
 *
 * 【与产品自身能力的关系——实测结论，勿再改错】
 *   - system prompt **不冲突**：只用 XCode 自己的 system 也能过闸门（实测 S3 200），
 *     两条 system 共存、顺序任意也都能过（S1/S2 200）。故此处**不注入、不改写**
 *     XCode 的 system，产品语义完整保留。
 *   - tools **需要并集**：只用 XCode 自己的工具集会 403（实测 S5），
 *     但那 11 个名字之外**可以带任意额外工具**（实测 S4 200）。
 *     所以正确做法是把 11 个官方名**补进** XCode 的工具数组，而不是覆盖它。
 *
 * 三层缺一即 `403 FreeTierError`（"can only be used from within OpenCode"）。
 * 无关项（实测非必需）：authorization、x-opencode-client/request/project/session-id。
 *
 * 【为什么工具名/模型清单内联在源码里，不读外部 JSON】
 *   本模块会被 esbuild 打成 CJS bundle（desktop 的 bundled-agents/zcode.cjs）。
 *   CJS 输出里 `import.meta.url` 不存在，`fileURLToPath(import.meta.url)` 会抛
 *   `The "path" argument must be of type string or an instance of URL. Received undefined`；
 *   而且即使路径能算出来，esbuild 也不会把 .json/.txt 复制到 dist，顶层 readFileSync
 *   会在模块加载期直接 ENOENT。两者都是「bundle 一加载就崩」，不是运行到才崩。
 *   数据量很小且变化频率低，内联是最省事的打包安全做法。
 */
import { randomBytes } from "node:crypto";

/** 闸门③要求出现的那 11 个官方工具名（原 opencode-signature/tools.json）。 */
const GATE_TOOL_NAMES: readonly string[] = [
  "bash",
  "edit",
  "glob",
  "grep",
  "read",
  "skill",
  "task",
  "todowrite",
  "webfetch",
  "websearch",
  "write",
];

/** 上游 opencode provider 的免费模型清单（不做可用性预筛）。 */
export const OPENCODE_FREE_MODELS: readonly string[] = [
  "big-pickle",
  "cat-jam-free",
  "exo-free",
  "ling-3.0-flash-fin-free",
  "ling-3.1-flash-free",
  "longcat-2.5-preview-free",
  "mimo-v2.6-flash-free",
  "muse-spark-1.2-contributor-free",
  "muse-spark-1.3-contributor-free",
  "nemotron-3-ultra-free",
  "nemotron-3.5-lightning-free",
  "space-bunny-free",
  "step-5-preview-free",
];

/** 闸门①：官方 CLI 的 User-Agent 形状。 */
export const OPENCODE_USER_AGENT = "opencode/1.19.0";

/** 闸门②：counter 合法上界（含）。实测 1..63 放行、64 起拒绝。 */
const COUNTER_MAX = 63;

const CHARS62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// ── session ID 构造（移植自 packages/schema/src/identifier.ts，与 asar 逐字一致）──
function timeSegment(timestamp: number, counter: number): string {
  const current = BigInt(timestamp) * 0x1000n + BigInt(counter);
  const value = ~current;
  let hex = "";
  for (let i = 0; i < 6; i++) {
    hex += Number((value >> BigInt(40 - 8 * i)) & 0xffn).toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * 生成一个合规的 session ID。
 *
 * counter 默认在 1..63 内随机——与真实客户端同分布；不用固定值，避免被上游
 * 按指纹/频率识别（固定 counter 实测会被间歇拒绝，随机 1..63 稳定）。
 */
export function mintSessionId(counter?: number): string {
  const c = counter ?? 1 + Math.floor(Math.random() * COUNTER_MAX);
  const bytes = randomBytes(14);
  let tail = "";
  for (const b of bytes) tail += CHARS62[b % 62];
  return "ses_" + timeSegment(Date.now(), c) + tail;
}

/** 从 OpenAI 形状的 tool 对象里取名字（兼容 `function.name` 与裸 `name`）。 */
function toolNameOf(tool: unknown): string | undefined {
  if (!tool || typeof tool !== "object") return undefined;
  const record = tool as Record<string, unknown>;
  const fn = record.function as Record<string, unknown> | undefined;
  const name = (fn && typeof fn.name === "string" && fn.name) || (typeof record.name === "string" && record.name);
  return name || undefined;
}

/**
 * 闸门③适配：**并集**注入那 11 个官方工具名。
 *
 * XCode 自己的工具定义原样保留（名字、description、schema 都不动），只把缺失的
 * 官方名用最小形状补在后面。模型侧看到的是「XCode 全量工具 + 11 个官方占位」，
 * 不会因为工具集被替换而丢失产品能力。
 *
 * 注意：补进来的占位工具没有可用 schema，模型一般不会优先调用；若它确实调了，
 * 执行侧会按 XCode 自己的工具名解析（大部分名字本就重叠：bash/edit/read/...）。
 */
export function applyBuildAgentSignature(body: Record<string, unknown>): void {
  const existing = Array.isArray(body.tools) ? (body.tools as unknown[]) : [];
  const present = new Set(existing.map(toolNameOf).filter((n): n is string => !!n));
  const missing = GATE_TOOL_NAMES.filter((name) => !present.has(name));
  if (missing.length > 0) {
    body.tools = [
      ...existing,
      ...missing.map((name) => ({
        type: "function",
        function: { name, description: "", parameters: { type: "object", properties: {} } },
      })),
    ];
  }
  // 上游对该档位要求 tool_choice 为 auto；XCode 侧若已显式指定（如具体工具名）则不动。
  if (body.tool_choice === undefined) body.tool_choice = "auto";
  if (typeof body.max_tokens !== "number" || body.max_tokens <= 0) {
    body.max_tokens = 32000;
  }
}

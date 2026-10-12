/**
 * XCode fork：推理强度（reasoning level / thinking effort）的规范顺序与供应商值域映射。
 *
 * 存在的原因（用户报告的「档位顺序错乱」根因）：
 *   上游把思考档位放在 **JSON 对象的键**里（Qoder 的
 *   `thinking_config.enabled.efforts`、CodeBuddy 的 `reasoning.supportedEfforts`），
 *   `Object.keys()` 拿到的是上游序列化顺序（Go map 的遍历序），**与强度无关**。
 *   该数组原样写进模型的 `optionSpecs.reasoningLevel.values`，
 *   再原样流到 UI 的思考强度下拉，于是出现「关闭 / 极高 / 低 / 中 / 高」这种非单调序列。
 *   排序必须发生在**读取边界**（已经写坏的历史配置也要能显示对），
 *   写入口排序只保证新配置不再写坏。
 */

/**
 * 关闭思考的档位别名。UI 一律显示「关闭」；请求侧一律**不发**该字段
 * （Qoder / CodeBuddy 网关都没有 none 档，发了会被 400 拒绝）。
 */
const OFF_REASONING_LEVELS: ReadonlySet<string> = new Set([
  "disabled",
  "none",
  "off",
  "no",
  "false",
  "nothink",
  "no-think",
  "no_think",
]);

/**
 * 档位强度秩：值越小越弱。UI 下拉按此升序排列，保证「低 → 中 → 高 → 极高 → 最高」单调递增。
 *
 * - `on` / `enabled` / `true` 语义等于 `high`：旧版思考强度是开关（开=high、关=none），
 *   新版是档位。两套值可能同时出现在同一模型配置里，给同一秩，稳定排序保持其原有相对次序。
 * - `ultra`（极致）排在 `max`（最高）之上：它语义上比「最高」更强，只是部分网关不认识。
 * - 未知值取 `Infinity` 排到末尾并保持原有相对次序——不丢档位，也不猜强度。
 */
const REASONING_LEVEL_INTENSITY: Readonly<Record<string, number>> = {
  ...Object.fromEntries([...OFF_REASONING_LEVELS].map((level) => [level, 0])),
  minimal: 10,
  low: 20,
  medium: 30,
  high: 40,
  on: 40,
  enable: 40,
  enabled: 40,
  true: 40,
  xhigh: 50,
  "extra-high": 50,
  extra_high: 50,
  max: 60,
  ultra: 70,
};

/** 档位值归一化：去空白 + 转小写。比较与查表前必须先过这里。 */
export function normalizeReasoningLevel(value: string): string {
  return value.trim().toLowerCase();
}

/** 是否是「关闭思考」档位（含各家别名）。 */
export function isOffReasoningLevel(value: string): boolean {
  return OFF_REASONING_LEVELS.has(normalizeReasoningLevel(value));
}

/**
 * 按强度升序排列档位。不去重（去重由 `optionSpecs` schema 负责），
 * 未知值保持原有相对次序排到末尾。`Array.prototype.sort` 在 V8 上稳定，
 * 同秩档位的相对次序可预期。
 */
export function sortReasoningLevelsByIntensity<T extends string>(
  values: readonly T[],
): T[] {
  return [...values].sort(
    (left, right) =>
      (REASONING_LEVEL_INTENSITY[normalizeReasoningLevel(left)] ?? Number.POSITIVE_INFINITY) -
      (REASONING_LEVEL_INTENSITY[normalizeReasoningLevel(right)] ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * Qoder `reasoning_effort` 的合法值域。取自上游 400 报错原文：
 * `'reasoning_effort' must be one of: 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'`
 * ——注意 `none` 虽是合法值，但发过去等于让上游走默认思考，语义上等同于不选档位，
 * 因此本函数对关闭族**返回 undefined（不发该字段）**，与官方 CLI 的行为一致。
 */
export type QoderReasoningEffort =
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

/**
 * 输入档位 → Qoder 合法 `reasoning_effort` 的**白名单**。
 * 表外的值（含关闭族与任何未知值）一律不发该字段：非法值会让 Qoder 直接 400
 * 拒绝整个请求，而"不发"只是退回上游默认思考，代价低得多。
 */
const QODER_REASONING_EFFORT_BY_LEVEL: Readonly<Record<string, QoderReasoningEffort>> = {
  minimal: "minimal",
  low: "low",
  medium: "medium",
  high: "high",
  // 开关式旧值：语义等价于 high，翻译成合法档位而不是原样发出。
  on: "high",
  enable: "high",
  enabled: "high",
  true: "high",
  xhigh: "xhigh",
  "extra-high": "xhigh",
  extra_high: "xhigh",
  max: "max",
  // 「极致」不在 Qoder 值域内，语义最接近「最高」。
  ultra: "max",
};

/**
 * 把模型选项层写进 `body.reasoning_effort` 的档位值翻译成 Qoder 合法值；
 * 返回 `undefined` 表示该字段不应出现在请求里（上游按自身默认）。
 *
 * 白名单而非黑名单透传：上游目录里的档位名（`efforts` 的键）不受我们控制，
 * 原样透传等于把上游的一个陌生键直接送进 Qoder 的枚举校验。
 *
 * 关于历史上的 `high → xhigh`：fork 当初按 CN 抓包把值域记成 low/medium/xhigh，
 * 于是把 high 抬成 xhigh。但当前 API 的枚举里 `high` 是合法值——用户选「高」
 * 却实发「极高」是真实的行为错误，故不再改写。
 */
export function mapReasoningEffortForQoder(
  value: unknown,
): QoderReasoningEffort | undefined {
  if (typeof value !== "string") return undefined;
  return QODER_REASONING_EFFORT_BY_LEVEL[normalizeReasoningLevel(value)];
}
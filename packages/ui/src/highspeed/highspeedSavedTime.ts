import type { CodingPlanRegularTpsRequest } from "@zcode/shared";
import type { IUsageStatsService } from "@zcode/services";

export interface HighspeedTimingMetricsForSavedTime {
  outputTokens: number;
  durationMs: number;
  modelDurationMs?: number;
  toolDurationMs?: number;
  otherDurationMs?: number;
}

export function calculateHighspeedSavedDurationMs(params: {
  outputTokens: number;
  regularTps: number;
  highspeedTps: number;
  durationMs: number;
  modelDurationMs?: number;
  toolDurationMs?: number;
  otherDurationMs?: number;
}): number {
  if (
    !Number.isFinite(params.regularTps) ||
    params.regularTps <= 0 ||
    !Number.isFinite(params.highspeedTps) ||
    params.highspeedTps <= 0
  ) {
    return 0;
  }
  const modelSpeedup = params.highspeedTps / params.regularTps;
  if (!Number.isFinite(modelSpeedup) || modelSpeedup <= 0) return 0;
  if (
    params.modelDurationMs !== undefined &&
    params.toolDurationMs !== undefined &&
    Number.isFinite(params.modelDurationMs) &&
    Number.isFinite(params.toolDurationMs) &&
    params.modelDurationMs >= 0 &&
    params.toolDurationMs >= 0
  ) {
    const modelDurationMs = params.modelDurationMs;
    const toolDurationMs = params.toolDurationMs;
    const otherDurationMs =
      params.otherDurationMs !== undefined &&
      Number.isFinite(params.otherDurationMs) &&
      params.otherDurationMs >= 0
        ? params.otherDurationMs
        : Math.max(0, params.durationMs - modelDurationMs - toolDurationMs);
    // CLI å·²æçå®æ¨¡å/å·¥å·åºé´æä¹åï¼å·¥å·ä¸å¶å®ç­å¾ä¸å æ¨¡åæ¢éèç¼©ç­ã
    const regularDurationMs = toolDurationMs + otherDurationMs + modelDurationMs * modelSpeedup;
    const actualDurationMs = modelDurationMs + toolDurationMs + otherDurationMs;
    return Math.max(0, Math.round(regularDurationMs - actualDurationMs));
  }
  // Bug æ ¹å ï¼æ­¤åæå¡çº§ TPS ç´æ¥å½ææ´è½®èæ¶ï¼å·¥å·è°ç¨æ¶é´ä¹è¢«éè¯¯å°ææ¨¡åéåº¦ç¼©ç­ã
  // å·¥å·å  20% ä¸ä¸åï¼åªææ¨¡åæ¨çç 80% æ Highspeed åçç¼©ç­ã
  const highspeedShare = 0.2 + 0.8 / modelSpeedup;
  const estimatedRegularDurationMs = params.durationMs / highspeedShare;
  return Math.max(0, Math.round(estimatedRegularDurationMs - params.durationMs));
}

/**
 * ç»ä¸æå®ææççå®èæ¶æåä¼ å¥è®¡ç®å¨ï¼é¿åæä¹ååæ¼ä¼ æåå­æ®µåéé»åéå° 20/80 ä¼°ç®ã
 */
export function calculateHighspeedSavedDurationFromMetrics(
  metrics: HighspeedTimingMetricsForSavedTime,
  regularTps: number,
  highspeedTps: number,
): number {
  return calculateHighspeedSavedDurationMs({
    ...metrics,
    regularTps,
    highspeedTps,
  });
}

export async function readHighspeedRegularTpsFromHealth(params: {
  usageStatsService: IUsageStatsService;
  preferredProviderId: string;
  /**
   * å½å Coding Plan çè´¦å·è®¿é®ä¸ä¸æãProvider éæåè¯·æ±æé´æåªè½ç±å®è§£æï¼
   * ç¼ºå¤±æ¶ host æ æ³ç¡®å®ç¨åªä¸ªè´¦å·/å¢éé¡¹ç®æ¥è¯¢ï¼å¿å®æéã
   */
  accountAccess: CodingPlanRegularTpsRequest["accountAccess"];
  timeZone?: string;
}): Promise<number | undefined> {
  const getRegularTps = params.usageStatsService.getCodingPlanRegularTps;
  if (!getRegularTps) return undefined;
  return getRegularTps.call(params.usageStatsService, {
    preferredProviderId: params.preferredProviderId,
    accountAccess: params.accountAccess,
    ...(params.timeZone ? { timeZone: params.timeZone } : {}),
  });
}

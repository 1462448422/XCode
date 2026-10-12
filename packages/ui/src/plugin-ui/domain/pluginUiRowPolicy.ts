import type { ConversationRow } from "@zcode/shared/zcode-protocol-v4";
import type { PluginUiRowDisposition } from "./pluginUiInstancePolicy.js";

/** æ¸²æå±æä¾çæ toolCallId çè£å³ï¼æ¨å¯¼ç»æ + ç¨æ·æå¨åºå® / æ¶èµ·ã */
export interface PluginUiRowPinContext {
  disposition?: PluginUiRowDisposition;
  /** ç¨æ·æå¨åºå®ï¼trueï¼ææ¶èµ·ï¼falseï¼ï¼undefined æé»è®¤è§åã */
  manualPinned?: boolean;
}

export type PluginUiRowPinResolver = (toolCallId: string) => PluginUiRowPinContext | undefined;

/**
 * å¸¦æä»¶ UI çå·¥å·è¡æ¯å¦çå¨"å·²å·¥ä½ N ç§"æå åºå¤ï¼
 * å¤±è´¥ / åæ¶çè¡ç§å¸¸æå ï¼è¢«è¾æ°æåç»ææ¿ä»£çè¡è¿æå åºï¼æ®éå·¥å·è®°å½ï¼ï¼å¶ä½æ æå¨ç¶æ â å¼ºå¶å¸¸é©» â æè¿ä¸ååèªå¨å±å¼ã
 * æ²¡æ resolver çè°ç¨æ¹ï¼åªè¯»åäº«æ¶é´çº¿ï¼æ²¿ç¨"å¨é¨å¸¸é©»"ã
 */
export function isPluginUiPinnedToolRow(
  row: ConversationRow,
  resolve?: PluginUiRowPinResolver,
): boolean {
  if (row.kind !== "toolCall") return false;
  if (row.status === "error" || row.status === "cancelled") return false;
  const display = row.display;
  if (display?.kind !== "mcp_tool" || display.ui === undefined) return false;
  // MCP isError ä¸ä¸å®æ å°ä¸ºè¡çº§ errorï¼å¿é¡»åæé¤ï¼ååºç¨åºå®/æè¿ååç­ç¥ï¼é¿åéè¯¯å¡çå¸¸é©»ã
  if (display.ui.isError === true) return false;
  if (!resolve) return true;
  const context = resolve(row.toolCallId);
  if (!context) return true;
  if (context.disposition?.superseded) return false;
  if (context.manualPinned !== undefined) return context.manualPinned;
  if (!context.disposition) return true;
  return context.disposition.forcedInline || context.disposition.autoExpand;
}

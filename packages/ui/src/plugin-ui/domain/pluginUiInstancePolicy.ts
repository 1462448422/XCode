import type { ConversationRow, ToolCallRow } from "@zcode/shared/zcode-protocol-v4";
import { resolvePluginUiLogicalScope } from "./pluginUiLogicalScope.js";

/** ï¼æè¿å ä¸ªååçæä»¶å¡çé»è®¤å±å¼ï¼æ´æ©çæé»è®¤æ¶è¿æå åºã */
export const PLUGIN_UI_AUTO_EXPAND_TURNS = 3;

/** ä¸ä¸ªé»è¾ UIï¼ä»æ¾å¼ surface ææéèå´ä¸è´ç widgetSessionId å±ç¨ï¼å¶ä½è°ç¨ç¬ç«ã */
export interface PluginUiLogicalInstance {
  key: string;
  /** å½åæ¾ç¤ºçè°ç¨ï¼ææ°ä¸æ¬¡æåï¼é isErrorï¼çï¼æ²¡ææåçå°±æ¯ææ°ä¸æ¡ã */
  activeToolCallId: string;
  /** è¢«è¾æ°æåç»ææ¿ä»£çæåè°ç¨ï¼å®ä»¬ä¸å»ºæ²ç®±ï¼åªä¿çæ®éå·¥å·è®°å½ã */
  supersededToolCallIds: string[];
}

/** åæ¡æä»¶å·¥å·è¡çå±ç¤ºè£å³ï¼æ¸²æå±æ®æ­¤å³å®è¿ä¸è¿æå åºãè¦ä¸è¦å»ºæ²ç®±ã */
export interface PluginUiRowDisposition {
  key: string;
  superseded: boolean;
  /** æå¨ååå¨æè¿ PLUGIN_UI_AUTO_EXPAND_TURNS ä¸ªåååã */
  autoExpand: boolean;
  /** å·¥å·çº§ `openai/widgetShowCodexWidgetInline`ï¼display.ui.showInlineï¼ã */
  forcedInline: boolean;
}

export interface PluginUiInstanceDerivation {
  instances: PluginUiLogicalInstance[];
  byToolCallId: Readonly<Record<string, PluginUiRowDisposition>>;
}

export const EMPTY_PLUGIN_UI_INSTANCE_DERIVATION: PluginUiInstanceDerivation = {
  instances: [],
  byToolCallId: {},
};

function isPluginUiToolRow(row: ConversationRow): row is ToolCallRow {
  return (
    row.kind === "toolCall" && row.display?.kind === "mcp_tool" && row.display.ui !== undefined
  );
}

function isSuccessfulUiRow(row: ToolCallRow): boolean {
  return (
    row.status === "success" &&
    !(row.display?.kind === "mcp_tool" && row.display.ui?.isError === true)
  );
}

/**
 * çº¯å½æ°ï¼ä»æå½±è¡æ¨å¯¼é»è¾ UI å®ä¾ä¸æ¯è¡çå±ç¤ºè£å³ï¼V-aï¼ã
 * key åæ¶ç»å®æ¥æºãserverãèµæºãæéä¸é»è¾è§å¾ï¼å key åææ°ä¸æ¬¡æåç»ææ¿ä»£æ´æ©çæåç»æï¼
 * running / failed / isError çè¡æ¢ä¸æ¿ä»£å«äººä¹ä¸è¢«æ¿ä»£ï¼åèªæ¾ç¤ºèªå·±çç¶æï¼ã
 * autoExpand æå¨é¨è¡çååé¡ºåºåæè¿ N ä¸ªååï¼ååéæ²¡ææä»¶å¡çä¹ç®ä¸ä¸ªååï¼ã
 */
export function deriveLogicalUiInstances(
  rows: readonly ConversationRow[],
  options: { autoExpandTurns?: number } = {},
): PluginUiInstanceDerivation {
  // domain ä¸ç¨ Map / Setï¼æ¨¡åè¾¹ççº¦æï¼ï¼å¨é¨ç¨æ°ç»ä¸æ®éå¯¹è±¡ã
  const turnOrder: string[] = [];
  for (const row of rows) {
    if (!turnOrder.includes(row.turnId)) turnOrder.push(row.turnId);
  }
  const recentTurns = turnOrder.slice(-(options.autoExpandTurns ?? PLUGIN_UI_AUTO_EXPAND_TURNS));
  const groupKeys: string[] = [];
  const groups: Record<string, ToolCallRow[]> = {};
  for (const row of rows) {
    if (!isPluginUiToolRow(row)) continue;
    const display = row.display;
    if (display?.kind !== "mcp_tool" || !display.ui) continue;
    const logical = resolvePluginUiLogicalScope(display.ui, {
      kind: "toolCall",
      toolCallId: row.toolCallId,
    });
    const key = JSON.stringify([
      display.ui.pluginId,
      display.serverName,
      display.ui.resourceUri,
      logical,
    ]);
    const group = groups[key];
    if (group) group.push(row);
    else {
      groups[key] = [row];
      groupKeys.push(key);
    }
  }
  const instances: PluginUiLogicalInstance[] = [];
  const byToolCallId: Record<string, PluginUiRowDisposition> = {};
  for (const key of groupKeys) {
    const group = groups[key]!;
    const successes = group.filter(isSuccessfulUiRow);
    const active = successes.at(-1) ?? group.at(-1)!;
    const superseded = successes.filter((row) => row !== active).map((row) => row.toolCallId);
    instances.push({ key, activeToolCallId: active.toolCallId, supersededToolCallIds: superseded });
    for (const row of group) {
      byToolCallId[row.toolCallId] = {
        key,
        superseded: superseded.includes(row.toolCallId),
        autoExpand: recentTurns.includes(row.turnId),
        forcedInline: row.display?.kind === "mcp_tool" && row.display.ui?.showInline === true,
      };
    }
  }
  return { instances, byToolCallId };
}

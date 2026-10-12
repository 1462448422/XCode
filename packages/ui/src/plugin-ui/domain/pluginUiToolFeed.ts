import type { McpAppsToolResultPayload } from "@zcode/shared/mcp-apps";
import { MCP_APPS_TRUNCATED_META_KEY } from "@zcode/shared/mcp-apps";
import type { ConversationRow, ToolCallRow } from "@zcode/shared/zcode-protocol-v4";
import type { PluginUiPresentation } from "../contract.js";
import { parseJsonText, readPluginUiPresentation } from "./readPluginUiPresentation.js";

/** åèå¡çä¸ä¾§æ å±ç¨ç legacy ChatToolCall å­éï¼toolCallRowAdapter è¾åºï¼ã */
export interface PluginUiLegacyToolCall {
  status: string;
  input: unknown;
  output?: unknown;
}

export function readPluginUiToolInput(
  toolCall: PluginUiLegacyToolCall | null,
): Record<string, unknown> | undefined {
  return toolCall &&
    typeof toolCall.input === "object" &&
    toolCall.input !== null &&
    !Array.isArray(toolCall.input)
    ? (toolCall.input as Record<string, unknown>)
    : undefined;
}

/** è¢«åæ­¢çå·¥å·ä¸åä¼ªè£ææ®éç»æï¼èæ¯èµ° ui/notifications/tool-cancelledã */
export function isPluginUiToolCancelled(toolCall: PluginUiLegacyToolCall | null): boolean {
  return toolCall?.status === "stopped";
}

/**
 * å·¥å·è¡ â MCP Apps tool-result éç¥è½½è·ãlegacy ç¶æè¯è¡¨ï¼pending / in_progress / completed / failed / stoppedï¼
 * æªå®æä¸äº§åºï¼stopped ä¸äº§åºï¼æ¹å cancelled éç¥ï¼ãstructuredContent / widgetMeta ä» display.ui ç JSON ææ¬æ¢å¤ã
 */
export function buildPluginUiToolResult(
  toolCall: PluginUiLegacyToolCall | null,
  presentation: PluginUiPresentation | null,
): McpAppsToolResultPayload | undefined {
  if (!toolCall || !presentation) return undefined;
  if (toolCall.status === "pending" || toolCall.status === "in_progress") return undefined;
  if (isPluginUiToolCancelled(toolCall)) return undefined;
  const structured = parseJsonText(presentation.structuredContent);
  const meta = parseJsonText(presentation.widgetMeta);
  // H12ï¼ä¼åç¨ agent æå½±çåå§ content æ°ç»ï¼å¾ç / èµæºåä¸ä¸¢ï¼ï¼æ²¡ææ¶éåçº¯ææ¬ã
  const rawContent = parseJsonText(presentation.content);
  const content = Array.isArray(rawContent)
    ? (rawContent.filter(
        (block): block is Record<string, unknown> => typeof block === "object" && block !== null,
      ) as Array<Record<string, unknown>>)
    : typeof toolCall.output === "string"
      ? [{ type: "text", text: toolCall.output }]
      : [];
  const baseMeta =
    typeof meta === "object" && meta !== null ? (meta as Record<string, unknown>) : {};
  // H12ï¼è¶éå­æ®µå·²è¢« agent çç¥ï¼é¡µé¢ä» _meta["zcode/truncated"].bytes å¾ç¥å¹¶å¯ç¨ tools/call éåã
  const mergedMeta = presentation.truncated
    ? { ...baseMeta, [MCP_APPS_TRUNCATED_META_KEY]: { bytes: presentation.truncatedBytes ?? 0 } }
    : baseMeta;
  return {
    content,
    ...(structured !== undefined ? { structuredContent: structured } : {}),
    ...(toolCall.status === "failed" || presentation.isError ? { isError: true } : {}),
    ...(Object.keys(mergedMeta).length > 0 ? { _meta: mergedMeta } : {}),
  };
}

export function findToolRowById(
  rows: readonly ConversationRow[],
  toolCallId: string,
): ToolCallRow | null {
  const row = rows.find(
    (candidate) => candidate.kind === "toolCall" && candidate.toolCallId === toolCallId,
  );
  return row && row.kind === "toolCall" ? row : null;
}

/** é¢æ¿æåå¿«ç§éçä¸æ¡å·¥å·è¡æè¦ã */
export interface PluginUiSurfaceFeedEntry {
  rowId: number;
  toolCallId: string;
  status: ToolCallRow["status"];
  presentation: PluginUiPresentation;
  input: Record<string, unknown> | undefined;
}

/**
 * é¢æ¿ï¼surfaceï¼æåå¿«ç§ã`latest` æ¯è¯¥ surface ææ°ä¸æ¡å·¥å·è¡ï¼ä»»æç¶æï¼æå tool-inputã
 * å¤æ­ cancelledï¼ï¼`result` æ¯æåä¸æ¬¡æåç»æï¼running / failed / cancelled / MCP isError ä¸è¦çå®ââé¢æ¿å¨ä¸ä¸æ¬¡æåå
 * ä¸ç´æ¾ç¤ºä¸ä¸ä»½å¥½ç»æãä¸¤èåªæ rowId åè°åè¿ï¼æå½±çªå£è¢«è£ææ§è¡æ¶å¿«ç§ä»å¨ã
 */
export interface PluginUiSurfaceFeed {
  latest: PluginUiSurfaceFeedEntry | null;
  result: (PluginUiSurfaceFeedEntry & { toolResult: McpAppsToolResultPayload }) | null;
}

export const EMPTY_PLUGIN_UI_SURFACE_FEED: PluginUiSurfaceFeed = { latest: null, result: null };

// v4 status â buildPluginUiToolResult ç¨ç legacy è¯è¡¨ï¼ä¸ v4/toolCallRowAdapter ç STATUS_MAP åä¹ï¼
// è¿éä¸å¼ adapterï¼domain åªä¾èµåè®®è¡ç±»åï¼ã
const LEGACY_STATUS: Record<ToolCallRow["status"], string> = {
  inputStreaming: "pending",
  pendingApproval: "pending",
  running: "in_progress",
  success: "completed",
  error: "failed",
  cancelled: "stopped",
};

function readSurfacePresentation(
  row: ToolCallRow,
  surfaceId: string,
  pluginId: string,
): PluginUiPresentation | null {
  const display = row.display;
  if (
    display?.kind !== "mcp_tool" ||
    display.ui?.surface !== surfaceId ||
    display.ui.pluginId !== pluginId
  )
    return null;
  return readPluginUiPresentation({ display });
}

function toSurfaceFeedEntry(
  row: ToolCallRow,
  presentation: PluginUiPresentation,
): PluginUiSurfaceFeedEntry {
  return {
    rowId: row.rowId,
    toolCallId: row.toolCallId,
    status: row.status,
    presentation,
    input: readPluginUiToolInput({ status: row.status, input: row.input }),
  };
}

/**
 * çº¯å½çº¦ï¼æä¸æ¹æå½±è¡å¹¶è¿å¿«ç§ãåä¸ rowId åªå¨ç¶æååæ¶æ´æ° `latest`ï¼`result` å¨æåè¡é¦æ¬¡åºç°æ¶æé ä¸æ¬¡ï¼
 * ä¹åå rowId ä¸éå»ºï¼ä¿æå¼ç¨ç¨³å®ï¼å®¿ä¸»æ®å¼ç¨å¤æ­æ¯å¦éå tool-resultï¼ãæ ååæ¶è¿ååå¯¹è±¡ã
 */
export function reducePluginUiSurfaceFeed(
  previous: PluginUiSurfaceFeed,
  rows: readonly ConversationRow[],
  surfaceId: string,
  pluginId: string,
  binding?: { serverName?: string; resourceUri: string },
): PluginUiSurfaceFeed {
  let latest = previous.latest;
  let result = previous.result;
  for (const row of rows) {
    if (row.kind !== "toolCall") continue;
    const presentation = readSurfacePresentation(row, surfaceId, pluginId);
    if (
      !presentation ||
      (binding &&
        (presentation.serverName !== binding.serverName ||
          presentation.resourceUri !== binding.resourceUri))
    )
      continue;
    if (
      !latest ||
      row.rowId > latest.rowId ||
      (row.rowId === latest.rowId && row.status !== latest.status)
    ) {
      latest = toSurfaceFeedEntry(row, presentation);
    }
    // MCP isError çè°ç¨å¨ v4 è¡ä¸æ¯ successï¼æ¨¡åè§è§å·²å®æï¼ï¼å¯¹é¢æ¿æ¥è¯´æ¯å¤±è´¥ï¼ä¸è¦çä¸ä¸ä»½å¥½ç»æã
    if (
      row.status === "success" &&
      !presentation.isError &&
      (!result || row.rowId > result.rowId)
    ) {
      const toolResult = buildPluginUiToolResult(
        { status: LEGACY_STATUS[row.status], input: row.input, output: row.output?.text },
        presentation,
      );
      if (toolResult) result = { ...toSurfaceFeedEntry(row, presentation), toolResult };
    }
  }
  return latest === previous.latest && result === previous.result ? previous : { latest, result };
}

/** ä¸¤ä»½å¿«ç§æ rowId åæ°ï¼store åå¹¶ç¨ï¼ï¼è°çè¡æ´æ°ç¨è°çã */
export function mergePluginUiSurfaceFeed(
  current: PluginUiSurfaceFeed,
  candidate: PluginUiSurfaceFeed,
): PluginUiSurfaceFeed {
  const latest =
    candidate.latest &&
    (!current.latest ||
      candidate.latest.rowId > current.latest.rowId ||
      (candidate.latest.rowId === current.latest.rowId &&
        candidate.latest.status !== current.latest.status))
      ? candidate.latest
      : current.latest;
  const result =
    candidate.result && (!current.result || candidate.result.rowId > current.result.rowId)
      ? candidate.result
      : current.result;
  return latest === current.latest && result === current.result ? current : { latest, result };
}

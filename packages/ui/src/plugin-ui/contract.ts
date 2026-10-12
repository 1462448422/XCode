import type {
  McpAppsAppToolCallRequest,
  McpAppsDisplayMode,
  McpToolUiCsp,
  PluginSandboxHandle,
  PluginUiScopeRef,
} from "@zcode/shared/mcp-apps";
import { buildPluginSandboxScopeId } from "@zcode/shared/mcp-apps";
import type { AttachmentRef, ConversationInputSource } from "@zcode/shared/zcode-protocol-v4";
import type { ReactNode } from "react";
import type { PluginUiImageBlock } from "./domain/pluginUiImageBlocks.js";

/**
 * ä» ToolCallRow.display.ui è¯»åºçæä»¶ UI åç°ä¿¡æ¯ï¼ä¸ agent ä¾§ `display.ui` schema åæï¼
 * ç± `readPluginUiPresentation` è§£æï¼è§£æå¤±è´¥è¿å null å¹¶åéå°æ®é McpToolCallBlockã
 */
export interface PluginUiPresentation {
  /** display.serverNameï¼UI åè°å·¥å·æ¶ç namespaced serverï¼å½å±ç± agent ä¾§æ ¡éªã */
  serverName: string;
  pluginId: string;
  resourceUri: string;
  preferredDisplayMode?: McpAppsDisplayMode;
  prefersBorder?: boolean;
  csp?: McpToolUiCsp;
  structuredContent?: string;
  widgetMeta?: string;
  /** åå§ content æ°ç»ç JSON ææ¬ï¼ç¼ºçæ¶ tool-result éåå·¥å·è¾åºçº¯ææ¬ã */
  content?: string;
  truncated?: boolean;
  truncatedBytes?: number;
  /** MCP ç»æ isErrorï¼v4 è¡ä»æ¯ successï¼ï¼tool-result å¸¦ isErrorï¼é¢æ¿ä¸ç¨å®è¦çæåå¿«ç§ã */
  isError?: true;
  /** å·¥å·çº§å¼ºå¶å¸¸é©»ï¼display.ui.showInlineï¼ã */
  showInline?: true;
  /** å·¥å·ç»æå½å±çé¢æ¿ idï¼å½ä¸­åä¼è¯å·²æå¼çé¢æ¿ tab æ¶ç»æè·¯ç±è¿é¢æ¿ã */
  surface?: string;
}

/**
 * æå¼ä¾§æ  plugin-ui tab çè¯·æ±ï¼å·¥å·å¡çç» toolCallIdï¼é¢æ¿å¥å£ï¼launcher / surface è·¯ç±ï¼ç» surfaceId + serverNameã
 * ä¸¤èæ°æå¶ä¸ã
 */
export type PluginUiOpenTarget =
  | { toolCallId: string; surfaceId?: never; serverName?: string }
  | { surfaceId: string; serverName: string; toolCallId?: never };

export type OpenPluginUiSideTabRequest = PluginUiOpenTarget & {
  parentSessionId: string;
  pluginId: string;
  resourceUri: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string | null;
};

/**
 * ä¾§æ  tabï¼å·¥å·å¡ç id ä¸º `plugin-ui:<ws>:<session>:<pluginId>:<toolCallId>`ï¼é¢æ¿ä¸º `plugin-ui:<ws>:<session>:<pluginId>:surface:<surfaceId>`ï¼
 * æ parentSessionId ä½ç¨åå¯è§ã
 */
export interface PluginUiSidePaneTab {
  id: string;
  type: "plugin-ui";
  ownerTaskId?: string | null;
  workspaceKey?: string | null;
  openedAt?: number;
  parentSessionId: string;
  toolCallId?: string;
  surfaceId?: string;
  serverName?: string;
  pluginId: string;
  resourceUri: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string | null;
}

export const PLUGIN_UI_CARD_DEFAULT_HEIGHT_PX = 240;
/** DOM ä½ç½®å±äºè§å¾ï¼é¡µé¢å®ä¾å±äºçªå£ ownerï¼è·¨å®¹å¨ç§»å¨åªè½èµ°ä¿æ´»æ¿è½½å±ã */
export interface SandboxPagePlacement {
  node: HTMLElement;
  kind: "flow" | "inline" | "sidebar";
  container?: HTMLElement;
  layer?: number;
}
export const PLUGIN_UI_CARD_MIN_HEIGHT_PX = 80;
export const PLUGIN_UI_CARD_MAX_HEIGHT_PX = 1200;
/**
 * ä¾§æ é¢æ¿å¤´é¨ï¼AnimatedSidePanePanel ç TabsListï¼`!h-12` = 48pxï¼ãfullscreen æ¶ç» hostContext.titleBar
 * åè¯æä»¶é¡µé¢è§å£ä¸æ¹è¢«å®¿ä¸»å ç¨çé«åº¦ï¼é¡µé¢è§å£æ¬èº«ä¸ä¸å®éå ï¼æä»¥ inset é½æ¯ 0ã
 */
export const PLUGIN_UI_SIDE_PANE_TITLE_BAR = {
  height: 48,
  leftInset: 0,
  viewportLeftInset: 0,
} as const;

/** è¯·æ± / tab çä½ç¨åï¼surfaceId ä¼åï¼å¦å toolCallIdï¼ä¸¤èé½ç¼ºè§ä¸ºéæ³è¯·æ±ã */
export function readPluginUiScopeRef(
  input: Pick<OpenPluginUiSideTabRequest, "toolCallId" | "surfaceId">,
): PluginUiScopeRef | null {
  if (input.surfaceId) return { kind: "surface", surfaceId: input.surfaceId };
  if (input.toolCallId) return { kind: "toolCall", toolCallId: input.toolCallId };
  return null;
}

/** å¨é¨å®¿ä¸»ç»å®ä½¿ç¨åä¸å·¥ä½åºèº«ä»½ï¼è·¯å¾åªç¨äºæ§è¡åæ¾ç¤ºã */
export interface PluginUiSessionScope {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string | null;
  sessionId: string;
}

/**
 * SessionPane ç»è®°ç»æä»¶ UI çä¼è¯å¨ä½ã4a-0 èµ·åªå©åéåç»­æ¶æ¯ï¼widgetState æ¯å®¿ä¸»åå­
 * ï¼`app/pluginUiWidgetStateStore`ï¼ï¼ä¸åç»ä¼è¯å½ä»¤æä¹åã
 */
export interface PluginUiSessionActions {
  /** images åç»ä¼è¯çéä»¶ä¸ä¼ å¥å£åæ AttachmentRefï¼åé sendText åéã */
  sendFollowUp(input: {
    prompt: string;
    source: ConversationInputSource;
    images?: readonly PluginUiImageBlock[];
  }): Promise<void>;
}

/** ééæ¢æ SessionPane åéå¥å£ï¼ä¸éæ°å®ç° admission / owner / ACKã */
export interface PluginUiSessionCommandPort {
  sendText(
    prompt: string,
    options: { source: ConversationInputSource; attachments?: AttachmentRef[] },
  ): Promise<"sent" | "blocked" | "confirmationRequired" | undefined>;
  /** åèå¾ç â ä¼è¯éä»¶å¼ç¨ï¼èµ° v4 attachmentPutï¼ä¸ composer ç²è´´æªå¾åä¸æ¡é¾è·¯ï¼ã */
  uploadAttachment(input: {
    fileName: string;
    mime: string;
    dataBase64: string;
  }): Promise<AttachmentRef>;
}

export type PluginUiOpenSurfaceRequest = PluginUiOpenTarget & {
  pluginId: string;
  resourceUri: string;
  title: string;
};

export interface PluginUiToolBinding {
  scope: PluginUiSessionScope & { toolCallId: string };
  onOpenSidePane?: (request: PluginUiOpenSurfaceRequest) => void;
}

export function buildPluginUiSessionKey(target: PluginUiSessionScope): string {
  return JSON.stringify([
    target.workspaceIdentity?.trim() || target.workspacePath,
    target.sessionId,
  ]);
}

export function buildPluginUiSurfaceKey(
  target: PluginUiSessionScope & { pluginId: string; serverName?: string; resourceUri?: string },
  scope: PluginUiScopeRef,
): string {
  // ä¿®å¤ï¼surfaceId ç±æä»¶èªè¡å½åï¼å¿é¡»åæ¶éç¦»å·¥ä½åºãä¼è¯åæä»¶ã
  return JSON.stringify([
    buildPluginUiSessionKey(target),
    target.pluginId,
    target.serverName ?? "",
    target.resourceUri ?? "",
    buildPluginSandboxScopeId(scope),
  ]);
}

export function buildPluginUiSidePaneTabId(request: OpenPluginUiSideTabRequest): string {
  const scope = readPluginUiScopeRef(request);
  if (!scope) throw new Error("plugin-ui side tab needs toolCallId or surfaceId");
  return [
    "plugin-ui",
    request.workspaceIdentity?.trim() || request.workspacePath,
    request.parentSessionId,
    request.pluginId,
    request.serverName ?? "",
    request.resourceUri,
    ...(scope.kind === "toolCall" ? [scope.toolCallId] : ["surface", scope.surfaceId]),
  ]
    .map(encodeURIComponent)
    .join(":");
}

export interface PluginUiSidePaneViewProps {
  scopeRef: PluginUiScopeRef;
  host: {
    pageKey: string;
    handle: PluginSandboxHandle | null;
    phase: "idle" | "preparing" | "mounted" | "running" | "error" | "disposed";
    height: number;
    error: string | null;
    /** éè¯¯æ"éæ°å è½½"ã */
    reload(): void;
  };
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
  onWidthChange(width: number): void;
}

export interface PluginUiToolCallViewProps {
  supported: boolean;
  fallback: ReactNode;
  surface?: string;
  preferredDisplayMode: McpAppsDisplayMode;
  sidePaneActive: boolean;
  host: PluginUiSidePaneViewProps["host"];
  prefersBorder: boolean;
  /** è¢«åä¸é»è¾ UI çè¾æ°æåç»ææ¿ä»£ï¼åªçæ®éå·¥å·ç»æï¼ä¸å»ºæ²ç®±æèªå¨å¼ä¾§æ ã */
  superseded: boolean;
  /** æå¨åºå® / æ¶èµ·ï¼undefined æé»è®¤è§åï¼ï¼ç¼ºçæ å¥å£æ¶ä¸æ¾ç¤ºæé®ã */
  pinned?: boolean;
  pinLabel: string;
  unpinLabel: string;
  onTogglePin?: () => void;
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
  openedLabel: string;
  openLabel: string;
  onWidthChange(width: number): void;
  onOpenSidePane?: () => void;
}

/**
 * ä¸ä¸ªæ²ç®±å®ä¾æ¥æ¶ server èµæºéç¥çå¥å£ãå®¿ä¸»æ (ä¼è¯, æä»¶, scopeId, generation=initId)
 * ç»è®°ï¼æå½±éç `pluginUi.resourceUpdated / resourceListChanged` å¢éæ subscribers è·¯ç±å°å¯¹åºå®ä¾ã
 */
export interface PluginUiResourceNotificationTarget {
  notifyInstanceClosed?(): void;
  notifyResourceUpdated(uri: string): void;
  notifyResourceListChanged(): void;
  /** App-Provided Tools çå®ä¾ä¿¡ç®±ï¼æ¨¡ååèµ·çé¡µé¢å·¥å·è°ç¨å°è¾¾æ¬å®ä¾ã */
  notifyAppToolCall(call: McpAppsAppToolCallRequest): void;
}

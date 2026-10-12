import type { McpUiAppCapabilities } from "@modelcontextprotocol/ext-apps/app-bridge";
import type {
  McpAppsDisplayMode,
  McpAppsHostTitleBar,
  McpAppsToolResultPayload,
  PluginSandboxHandle,
} from "@zcode/shared/mcp-apps";
import type {
  PluginUiHostControllerDeps,
  PluginUiHostPhase,
  PluginUiHostScope,
} from "../app/pluginUiHostController.js";
import type { PluginUiPresentation } from "../contract.js";
export interface UsePluginUiHostInput {
  presentation: PluginUiPresentation;
  scope: PluginUiHostScope;
  theme: "light" | "dark";
  locale: string;
  displayMode: McpAppsDisplayMode;
  toolInput: Record<string, unknown> | undefined;
  toolResult: McpAppsToolResultPayload | undefined;
  /** æåçæ¯åªæ¬¡è°ç¨ï¼ååï¼é¢æ¿æ¢å°æ°ä¸æ¬¡è°ç¨ï¼æ¶æ toolInput ä½ä¸º tool-input éç¥æ¨ç»é¡µé¢ã */
  toolCallId?: string;
  /** å®¿ä¸»å·¥å·è¢«åæ­¢ï¼åä¸º true æ¶åé¡µé¢åä¸æ¬¡ tool-cancelledã */
  toolCancelled?: boolean;
  hostVersion: string;
  /** æ¬å®ä¾çå®å¯åæ¢å°çæ¨¡å¼ï¼ç¼ºçä¸¤ç§é½å¯ãååæ¶ç» host-context-changed éç¥é¡µé¢ã */
  availableDisplayModes?: readonly McpAppsDisplayMode[];
  onDisplayModeRequest?: (mode: McpAppsDisplayMode) => McpAppsDisplayMode;
  onOpenExternal?: (url: string) => void;
  /** å®¹å¨å®½åº¦ï¼ç¨äº hostContext.containerDimensionsï¼æªç¥æ¶ 0ã */
  width: number;
  /** fullscreen å®¹å¨çå¤´é¨ï¼inline ä¸ä¼ ã */
  titleBar?: McpAppsHostTitleBar;
  /** false æ¶ä¸åå»ºæ²ç®±ï¼å¦ä¾§æ å·²æ¥ç®¡åä¸ä½ç¨åï¼ï¼é»è®¤ trueã */
  enabled?: boolean;
  /** ä¼è¯äº¤äºåè°ï¼ç¼ºçæ¶å¯¹åºè¯·æ±å -32601ï¼è½åå£°æä¹ä¸å¸¦è¯¥é¡¹ã */
  interactions?: Pick<PluginUiHostControllerDeps, "onSendFollowUpMessage" | "onUpdateModelContext">;
}

export interface UsePluginUiHostResult {
  /** å¹³å°ææå¡ä¸æ¯ææä»¶ UI æ¶ä¸º falseï¼è°ç¨æ¹åéå°æ®é MCP å¡çã */
  pageKey: string;
  supported: boolean;
  phase: PluginUiHostPhase;
  handle: PluginSandboxHandle | null;
  height: number;
  error: string | null;
  /** é¡µé¢ `ui/initialize` å£°æçè½åï¼æ¡æå undefinedã`availableDisplayModes` å³å®å®¿ä¸»è½å¦æå®åå° fullscreenã */
  appCapabilities: McpUiAppCapabilities | undefined;
  /** éæ¯å½åå®ä¾å¹¶éæ° prepareï¼Agent è¿è¡å­è¯æ¢ä»£ï¼ï¼guest å´©æº / å è½½å¤±è´¥åç±éè¯¯ææé®è§¦åã */
  reload(): void;
}

export interface Page {
  readonly kind: "mcp";
  key: string;
  task: string;
  visible: boolean;
  snapshot(): UsePluginUiHostResult;
  subscribe(listener: () => void): () => void;
  update(input: UsePluginUiHostInput): void;
  bind(node: HTMLElement, sidebar: boolean): () => void;
  busy(): boolean;
  running(): boolean;
  suspend(force?: boolean): Promise<boolean>;
  destroy(): void;
}

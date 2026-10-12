import type {
  McpUiAppCapabilities,
  McpUiDisplayMode,
  McpUiHostContext,
  McpUiStyles,
} from "@modelcontextprotocol/ext-apps/app-bridge";
import type { McpAppsHostTitleBar, McpAppsStyleVariables } from "@zcode/shared/mcp-apps";
import { PLUGIN_UI_CARD_MAX_HEIGHT_PX } from "../contract.js";

export interface PluginUiHostContextInput {
  theme: "light" | "dark";
  locale: string;
  displayMode: McpUiDisplayMode;
  /** å®¹å¨å®½åº¦ï¼pxï¼ï¼æªç¥æ¶ 0ã */
  width: number;
  /** å¡çé«åº¦ä¸éï¼è§è `containerDimensions.maxHeight`ï¼é¡µé¢æ®æ­¤è£å³ size-changedï¼ï¼ç¼ºçå®¿ä¸»ä¸éã */
  maxHeight?: number;
  timeZone?: string;
  /** fullscreen å®¹å¨çå¤´é¨ï¼inline ä¸ä¼ ãå®¿ä¸»æä¾çæ©å±é®ï¼hostContext åè®¸éå é®ï¼ã */
  titleBar?: McpAppsHostTitleBar;
  /** æ¬å®ä¾çå®å¯åæ¢å°çæ¨¡å¼ï¼ç¼ºçä¸¤ç§é½å¯ã */
  availableDisplayModes?: readonly McpUiDisplayMode[];
  /** ä¸»é¢ token æ å°æç MCP Apps æ ååéï¼ç¼ºçä¸å¸¦ stylesã */
  styleVariables?: McpAppsStyleVariables;
}

/** hostContext çå¯ä¸æé ç¹ã */
export function buildPluginUiHostContext(input: PluginUiHostContextInput): McpUiHostContext {
  return {
    theme: input.theme,
    locale: input.locale,
    displayMode: input.displayMode,
    availableDisplayModes: [...(input.availableDisplayModes ?? ["inline", "fullscreen"])],
    // è§èï¼åèå¡çé«åº¦è·éåå®¹ï¼size-changedï¼ï¼å®¿ä¸»åªç»ä¸éï¼å®½åº¦æ¯ç¡®å®å¼ã
    containerDimensions: {
      width: Math.max(0, Math.round(input.width)),
      maxHeight: input.maxHeight ?? PLUGIN_UI_CARD_MAX_HEIGHT_PX,
    },
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    platform: "desktop",
    userAgent: "zcode",
    timeZone: input.timeZone ?? resolveTimeZone(),
    // æ¡é¢å®¿ä¸»åºå®æ hoverãæ  touchã
    deviceCapabilities: { hover: true, touch: false },
    ...(input.styleVariables ? { styles: { variables: input.styleVariables as McpUiStyles } } : {}),
    ...(input.titleBar ? { titleBar: input.titleBar } : {}),
  };
}

function resolveTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** é¡µé¢æªå£°æ `availableDisplayModes` è§ä¸ºé½æ¯æï¼å£°æäºå°±åªè½åå°å£°æè¿çæ¨¡å¼ï¼è§è MUST NOTï¼ã */
export function appAllowsDisplayMode(
  capabilities: McpUiAppCapabilities | undefined,
  mode: McpUiDisplayMode,
): boolean {
  const declared = capabilities?.availableDisplayModes;
  return !declared || declared.includes(mode);
}

/** åèå®ä¾æ¶å° `ui/request-display-mode`ï¼åªå¨å®¿ä¸»å¯ç¨éåååæ¢ï¼`pip` ä¸ä¸å¯ç¨çæ¨¡å¼å¦å®åå½åæ¨¡å¼ã */
export function resolveRequestedDisplayMode(
  requested: McpUiDisplayMode,
  current: McpUiDisplayMode,
  available: readonly McpUiDisplayMode[],
): McpUiDisplayMode {
  return requested !== "pip" && available.includes(requested) ? requested : current;
}

/**
 * ä¾§æ å®ä¾æ¶å° `ui/request-display-mode`ï¼åªæè¯¥ä½ç¨åå¨ä¼è¯æµéè¿æåèå¡çå¯æ¥ç®¡æ¶ï¼è¯·æ± inline ææç«
 * ï¼å®¿ä¸»å³é¢æ¿ãå inlineï¼ï¼å¦åå¦å®å fullscreenãpip åæ ·è½å fullscreenã
 */
export function resolveSidePaneDisplayModeRequest(
  requested: McpUiDisplayMode,
  canReturnInline: boolean,
): McpUiDisplayMode {
  return requested === "inline" && canReturnInline ? "inline" : "fullscreen";
}

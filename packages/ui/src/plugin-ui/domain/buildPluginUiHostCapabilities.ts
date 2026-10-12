import type { McpUiHostCapabilities } from "@modelcontextprotocol/ext-apps/app-bridge";
import {
  MCP_APPS_RESOURCE_SUBSCRIBE_EXPERIMENTAL_KEY,
  MCP_APPS_SURFACE_EXPERIMENTAL_KEY,
  MCP_APPS_WIDGET_STATE_EXPERIMENTAL_KEY,
  buildMcpAppsCspExperimentalCapability,
} from "@zcode/shared/mcp-apps";

/** å®¿ä¸»å®ä¾çå®å¯ç¨çäº¤äºï¼ç¼ºçé¡¹å¯¹åºçè½åä¸å£°æï¼æä»¶æ®æ­¤éçº§ã */
export interface PluginUiHostCapabilityInput {
  canSample?: boolean;
  canSendFollowUpMessage: boolean;
  canUpdateModelContext: boolean;
  canSetWidgetState: boolean;
  /** å®¿ä¸»è½ä»£ç resources/subscribe å¹¶æ server éç¥è·¯ç±åæ¬å®ä¾ã */
  canSubscribeResources: boolean;
  /** å¹³å°æ saveFileï¼æ¡é¢ï¼æå£°æ downloadFileã */
  canDownloadFile: boolean;
  /** å¸¸é©»é¢æ¿å®ä¾ï¼å®£å `experimental["zcode/surface"]: { id }`ï¼é¡µé¢æ®æ­¤å¤æ­èªå·±è¿è¡å¨é¢æ¿éã */
  surfaceId?: string;
}

/**
 * hostCapabilities çå¯ä¸æé ç¹ãå£°æä¸ handler ä¸ä¸å¯¹åºï¼æ²¡æä¼è¯å¨ä½ç»å®å°±ä¸å£°æ messageï¼æ²¡æ composer å°±ä¸å£°æ
 * updateModelContextãXCode æ©å±ï¼widgetStateãresourceSubscribeãsurfaceãcsp æ¾å®½ï¼ä¸å¾æ¾ `experimental["zcode/â¦"]`ï¼
 * å®æ¹ SDK ç zod ä¼å¥ææ åä½ä¹å¤çæªç¥è½åé®ã
 */
export function buildPluginUiHostCapabilities(
  input: PluginUiHostCapabilityInput,
): McpUiHostCapabilities {
  return {
    openLinks: {},
    serverTools: {},
    serverResources: input.canSubscribeResources ? { listChanged: true } : {},
    logging: {},
    ...(input.canSample ? { sampling: {} } : {}),
    ...(input.canDownloadFile ? { downloadFile: {} } : {}),
    // image é text ä¸èµ·å£°æï¼png / jpeg / webpï¼åå¼  â¤ 4 MiBï¼ã
    ...(input.canSendFollowUpMessage ? { message: { text: {}, image: {} } } : {}),
    ...(input.canUpdateModelContext
      ? { updateModelContext: { text: {}, structuredContent: {}, image: {} } }
      : {}),
    experimental: {
      ...buildMcpAppsCspExperimentalCapability(),
      ...(input.canSetWidgetState ? { [MCP_APPS_WIDGET_STATE_EXPERIMENTAL_KEY]: {} } : {}),
      ...(input.canSubscribeResources
        ? { [MCP_APPS_RESOURCE_SUBSCRIBE_EXPERIMENTAL_KEY]: {} }
        : {}),
      ...(input.surfaceId ? { [MCP_APPS_SURFACE_EXPERIMENTAL_KEY]: { id: input.surfaceId } } : {}),
    },
  };
}

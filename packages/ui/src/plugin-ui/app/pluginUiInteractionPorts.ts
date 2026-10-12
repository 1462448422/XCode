import { METHOD_NOT_FOUND, ProtocolError } from "@modelcontextprotocol/client";
import { EmptyResultSchema } from "@modelcontextprotocol/core";
import { McpUiMessageResultSchema } from "@modelcontextprotocol/ext-apps/app-bridge";
import type {
  McpAppsDownloadFileItem,
  PluginSandboxHandle,
  PluginSandboxPlatformPort,
} from "@zcode/shared/mcp-apps";
import { MCP_APPS_SET_WIDGET_STATE_METHOD, concatMcpAppsTextContent } from "@zcode/shared/mcp-apps";
import { z } from "zod";
import type { PluginUiHostBridge } from "./pluginUiHostBridge.js";

/** å®¿ä¸»å®ä¾æ³¨å¥çäº¤äºåè°ï¼ç¼ºçæ¶å¯¹åºè¯·æ±å -32601ï¼è½åå£°æä¸åè°ä¸ä¸å¯¹åºï¼ã */
export interface PluginUiInteractionCallbacks {
  /** sendFollowUpMessage è¿å reject è¡¨ç¤ºç¨æ·åæ¶ææ æéã */
  onSendFollowUpMessage?(
    payload: {
      prompt: string;
      content?: Array<Record<string, unknown>>;
      structuredContent?: unknown;
    },
    context: { consumeUserGesture(): Promise<boolean>; assertCurrent(): void },
  ): Promise<void>;
  onUpdateModelContext?(payload: {
    content: Array<Record<string, unknown>>;
    structuredContent?: unknown;
  }): Promise<void>;
  /** é¡µé¢ `ui/set-widget-state { widgetState }`ï¼å®¿ä¸»åæ­¥ååå­ store åååã */
  onUpdateWidgetState?(widgetState: unknown): Promise<void>;
  /** `ui/download-file`ï¼éé¡¹ä¿å­ï¼åæ¶ / å¤±è´¥å `{ isError: true }`ã */
  onDownloadFile?(contents: McpAppsDownloadFileItem[]): Promise<{ isError?: boolean }>;
}

/**
 * `ui/message` çåæ°ï¼å®æ¹ schema åªè®¤ role + contentï¼ä¼å¥æé¡¶å±æªç¥é®ï¼æ©å±ç `structuredContent`
 * è¦çä¸æ¥ï¼æ¼æ ```json åéæ¶æ¯ååºï¼ï¼æä»¥å®¿ä¸»ç¨èªå·±ç loose schema æ³¨åè¿ä¸ªæ¹æ³ï¼èä¸æ¯ `onmessage`ã
 */
const pluginUiMessageParamsSchema = z
  .object({
    role: z.literal("user"),
    content: z.array(z.record(z.string(), z.unknown())).min(1),
    structuredContent: z.unknown().optional(),
  })
  .loose();
const pluginUiSetWidgetStateParamsSchema = z.object({ widgetState: z.unknown() }).loose();

/** åè°æåºçå¸¦ `code` çéè¯¯ï¼-32601 / -32000 / -32602ï¼ç¿»è¯æ JSON-RPC éè¯¯ï¼å¶ä½æåé¨éè¯¯å¤çã */
function toProtocolError(error: unknown): unknown {
  const code = (error as { code?: unknown } | null)?.code;
  if (error instanceof ProtocolError) return error;
  if (error instanceof Error && typeof code === "number")
    return new ProtocolError(code, error.message);
  return error;
}
const unsupported = (method: string) =>
  new ProtocolError(METHOD_NOT_FOUND, `${method} is not available for this app`);

/**
 * ä¼è¯äº¤äºï¼ui/messageãui/update-model-contextãui/download-fileãXCode æ©å± ui/set-widget-stateï¼æ¥å°å®æ¹
 * AppBridgeï¼ç¼ºçåè°å -32601ï¼ui/message çæå¿ token ç± main å¨ guest input-event è®°å½ãä¸æ¬¡æ§æ¶è´¹ï¼æ²¡æå¥æè§ä¸ºæ æå¿ã
 */
export function wirePluginUiInteractions(
  bridge: PluginUiHostBridge,
  deps: PluginUiInteractionCallbacks,
  platform: Pick<PluginSandboxPlatformPort, "consumeUserGesture">,
  currentHandle: () => PluginSandboxHandle | null,
): void {
  bridge.setRequestHandler(
    "ui/message",
    { params: pluginUiMessageParamsSchema, result: McpUiMessageResultSchema },
    async (rawParams) => {
      if (!deps.onSendFollowUpMessage) throw unsupported("ui/message");
      const params = rawParams as z.infer<typeof pluginUiMessageParamsSchema>;
      const handle = currentHandle();
      const assertCurrent = () => {
        if (!handle || currentHandle()?.instance.token !== handle.instance.token)
          throw new Error("MCP App instance was closed");
      };
      assertCurrent();
      try {
        await deps.onSendFollowUpMessage(
          {
            prompt: concatMcpAppsTextContent(params.content),
            content: params.content,
            ...(params.structuredContent !== undefined
              ? { structuredContent: params.structuredContent }
              : {}),
          },
          {
            assertCurrent,
            consumeUserGesture: () =>
              handle ? platform.consumeUserGesture(handle.sandboxId) : Promise.resolve(false),
          },
        );
      } catch (error) {
        throw toProtocolError(error);
      }
      return {};
    },
  );
  bridge.onupdatemodelcontext = async (params) => {
    if (!currentHandle()) throw new Error("MCP App instance was closed");
    if (!deps.onUpdateModelContext) throw unsupported("ui/update-model-context");
    try {
      await deps.onUpdateModelContext({
        content: (params.content ?? []) as Array<Record<string, unknown>>,
        ...(params.structuredContent !== undefined
          ? { structuredContent: params.structuredContent }
          : {}),
      });
    } catch (error) {
      throw toProtocolError(error);
    }
    return {};
  };
  bridge.ondownloadfile = async (params) => {
    if (!deps.onDownloadFile) throw unsupported("ui/download-file");
    try {
      return await deps.onDownloadFile(params.contents as McpAppsDownloadFileItem[]);
    } catch (error) {
      throw toProtocolError(error);
    }
  };
  bridge.setRequestHandler(
    MCP_APPS_SET_WIDGET_STATE_METHOD,
    { params: pluginUiSetWidgetStateParamsSchema, result: EmptyResultSchema },
    async (rawParams) => {
      if (!currentHandle()) throw new Error("MCP App instance was closed");
      if (!deps.onUpdateWidgetState) throw unsupported(MCP_APPS_SET_WIDGET_STATE_METHOD);
      const params = rawParams as z.infer<typeof pluginUiSetWidgetStateParamsSchema>;
      await deps.onUpdateWidgetState(params.widgetState);
      return {};
    },
  );
}

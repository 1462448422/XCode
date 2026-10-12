import type { CallToolResult } from "@modelcontextprotocol/client";
import { INVALID_PARAMS, ProtocolError } from "@modelcontextprotocol/client";
import type { McpUiDisplayMode, McpUiHostContext } from "@modelcontextprotocol/ext-apps/app-bridge";
import type { IPluginUiBridgeService, PluginUiPluginScope } from "@zcode/services";
import { resolveRequestedDisplayMode } from "../domain/buildPluginUiHostContext.js";
import type { PluginUiHostBridge } from "./pluginUiHostBridge.js";

/**
 * é¡µé¢åèµ·çè§èè¯·æ± / éç¥æ¥å°å®æ¹ AppBridgeï¼`ui/request-display-mode`ã`tools/call`ã`ui/open-link`ã
 * `ui/notifications/size-changed`ã`ui/notifications/request-teardown`ã`notifications/message`ã
 * ä¼è¯äº¤äºï¼ui/message ç­ï¼å¨ pluginUiInteractionPortsï¼èµæºè¯·æ±å¨ pluginUiResourceSubscriptionsã
 */
export interface PluginUiHostAppHandlerDeps {
  currentContext(): McpUiHostContext;
  /** å®¿ä¸»è£å³åçæ¨¡å¼åå hostContext å¹¶ï¼å·²æ¡ææ¶ï¼æ¨ host-context-changedã */
  applyDisplayMode(mode: McpUiDisplayMode): void;
  onDisplayModeRequest(mode: McpUiDisplayMode): McpUiDisplayMode;
  pluginScope(): PluginUiPluginScope;
  bridge: Pick<IPluginUiBridgeService, "callTool" | "cancelToolCall">;
  createCallId(): string;
  /** è¿è¡ä¸­çé¡µé¢å·¥å·è°ç¨ idï¼controller dispose æ¶éä¸ªåæ¶å° agentã */
  activeCalls: Set<string>;
  onBusyChange?(): void;
  onOpenExternal(url: string): void;
}

const OPEN_LINK_PROTOCOLS = new Set(["http:", "https:"]);

export function installPluginUiHostAppHandlers(
  bridge: PluginUiHostBridge,
  deps: PluginUiHostAppHandlerDeps,
): void {
  bridge.onrequestdisplaymode = async (params) => {
    const context = deps.currentContext();
    const current = context.displayMode ?? "inline";
    const available = context.availableDisplayModes ?? [current];
    const mode = deps.onDisplayModeRequest(
      resolveRequestedDisplayMode(params.mode, current, available),
    );
    if (mode !== context.displayMode) deps.applyDisplayMode(mode);
    return { mode };
  };
  bridge.oncalltool = async (params, ctx) => {
    const signal = ctx.mcpReq?.signal;
    signal?.throwIfAborted();
    const scope = deps.pluginScope();
    const callId = deps.createCallId();
    deps.activeCalls.add(callId);
    deps.onBusyChange?.();
    // é¡µé¢ä¸­æ­¢è¯·æ±ï¼SDK ç cancelled éç¥è½å° ctx.mcpReq.signalï¼â åæ¶å° agent ç MCP clientã
    const onAbort = () => {
      void deps.bridge.cancelToolCall({ ...scope, callId }).catch(() => undefined);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    try {
      const result = await deps.bridge.callTool({
        ...scope,
        toolName: params.name,
        ...(params.arguments ? { arguments: params.arguments } : {}),
        callId,
      });
      return result as CallToolResult;
    } finally {
      signal?.removeEventListener("abort", onAbort);
      deps.activeCalls.delete(callId);
      deps.onBusyChange?.();
    }
  };
  bridge.onopenlink = async (params) => {
    let url: URL;
    try {
      url = new URL(params.url);
    } catch {
      throw new ProtocolError(INVALID_PARAMS, `invalid link ${params.url}`);
    }
    // åªæ¾è¡ http(s)ï¼file: / èªå®ä¹ scheme äº¤ç»ç³»ç»ä¼æå¼æ¬å°ç¨åºã
    if (!OPEN_LINK_PROTOCOLS.has(url.protocol)) {
      throw new ProtocolError(INVALID_PARAMS, `only http(s) links can be opened (${url.protocol})`);
    }
    deps.onOpenExternal(url.toString());
    return {};
  };
}

export function installPluginUiHostNotificationHandlers(
  bridge: PluginUiHostBridge,
  deps: {
    pluginId: string;
    onHeight(height: number): void;
    log?: (message: string, detail?: Record<string, unknown>) => void;
  },
): void {
  // é¡µé¢è¯·æ±å®¿ä¸»ææèªå·±ï¼æ¬å®¿ä¸»çå®ä¾çå½å¨æè·éå¡ç / é¢æ¿ï¼åªè®°å½ï¼ä¸ä¸»å¨éæ¯ã
  bridge.onrequestteardown = () => {
    deps.log?.("[plugin-ui] app requested teardown", { pluginId: deps.pluginId });
  };
  bridge.onsizechange = (params) => {
    if (typeof params.height === "number") deps.onHeight(params.height);
  };
  bridge.onloggingmessage = (params) => {
    deps.log?.(`[plugin-ui] app log (${params.level})`, {
      pluginId: deps.pluginId,
      data: params.data,
    });
  };
}

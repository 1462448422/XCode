import type { Transport } from "@modelcontextprotocol/client";
import type {
  McpUiAppCapabilities,
  McpUiDisplayMode,
  McpUiHostCapabilities,
  McpUiHostContext,
} from "@modelcontextprotocol/ext-apps/app-bridge";
import type {
  IPluginUiAppToolsService,
  IPluginUiBridgeService,
  IPluginUiSamplingService,
} from "@zcode/services";
import type {
  McpAppsToolInputPayload,
  McpAppsToolResultPayload,
  PluginSandboxHandle,
  PluginSandboxPlatformPort,
  PluginSandboxTransportPort,
  PluginUiScopeRef,
} from "@zcode/shared/mcp-apps";
import type { PluginUiPresentation, PluginUiResourceNotificationTarget } from "../contract.js";
import type { PluginUiHostBridge } from "./pluginUiHostBridge.js";
import { type PluginUiInteractionCallbacks } from "./pluginUiInteractionPorts.js";

/**
 * å®¿ä¸»ä¾§ç¼æï¼prepareSandbox â æ¿å¥ææ webview â ç­ initId å¹éçç«¯å£ â `AppBridge(null)` æ¥ Transport â
 * `initialized` åæå tool-input / tool-result â ååºé¡µé¢ç tools/call / resources/* / open-link / size-changedã
 * ææ IO ç» deps æ³¨å¥ï¼é¡µé¢ç®¡çå¨æ¥æ controllerï¼hook åªç»è®°å±ç¤ºéç¹ã
 */
export type PluginUiHostPhase = "idle" | "preparing" | "mounted" | "running" | "error" | "disposed";

export interface PluginUiHostScope {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sessionId: string;
  /** å·¥å·å¡ç `{ kind: "toolCall" }` æé¢æ¿ `{ kind: "surface" }`ï¼æ å°ä¸ºæ²ç®± scopeId åä¸å¹ç­é®ã */
  scope: PluginUiScopeRef;
}

/** é¡µé¢ä¾§æååå®¹ï¼`initialized` æ¶è¯»ä¸æ¬¡ææ°å¼ï¼ä¹åçååç» notify*ã */
export interface PluginUiToolFeed {
  toolInput?: McpAppsToolInputPayload;
  toolResult?: McpAppsToolResultPayload;
  toolCancelled?: boolean;
}

export interface PluginUiHostControllerDeps extends PluginUiInteractionCallbacks {
  onBusyChange?(): void;
  onInstanceClosed?(): void;
  createTransport(port: PluginSandboxTransportPort): Transport;
  bridge: Pick<
    IPluginUiBridgeService,
    | "closeInstance"
    | "recycleInstance"
    | "validateInstance"
    | "prepareSandbox"
    | "callTool"
    | "cancelToolCall"
    | "readResource"
    | "listResources"
    | "listResourceTemplates"
    | "subscribeResource"
    | "unsubscribeResource"
  >;
  /** App-Provided Tools ééï¼ç¼ºçï¼web / è¿ç¨ï¼æ¶ä¸åç°ãä¸ç»è®°é¡µé¢å·¥å·ã */
  sampling?: IPluginUiSamplingService;
  appTools?: IPluginUiAppToolsService;
  platform: PluginSandboxPlatformPort;
  /**
   * æ Agent å®ä¾ä»£éç»è®°èµæºéç¥å¥å£ï¼å®¿ä¸»ææå½±éç server éç¥è·¯ç±å°è¿éã
   * ç¼ºçä¸ç»è®°ï¼é¡µé¢ä»å¯ subscribeï¼ä½æ¶ä¸å°éç¥ï¼ã
   */
  resourceNotifications?: {
    register(
      generation: number,
      target: PluginUiResourceNotificationTarget,
      instance: PluginSandboxHandle["instance"],
    ): () => void;
  };
  /** UI åèµ·è°ç¨ç id çæï¼ç¼ºç crypto.randomUUIDã */
  createCallId?: () => string;
  /** æ¡æè¶æ¶ / teardown ç­å¾çè®¡æ¶å¨ï¼ç¼ºç setTimeoutãè¿ååæ¶å½æ°ã */
  setTimer?: (callback: () => void, ms: number) => () => void;
  scope: PluginUiHostScope;
  presentation: PluginUiPresentation;
  /** `initialized` æ¶è¯»ä¸æ¬¡ï¼ä¿è¯æ¿å°ææ°å·¥å·è¾å¥ / ç»æã */
  getToolFeed(): PluginUiToolFeed;
  /** widgetState åå¼ï¼å®¿ä¸»åå­ storeï¼å¯ä¸ ownerï¼ï¼ç«¯å£å°è¾¾æ¶è¯»ä¸æ¬¡ï¼undefined = æ²¡æã */
  getWidgetState(): unknown;
  /** ç«¯å£å°è¾¾åå»º AppBridge æ¶è¯»åï¼æå½æ¶çå®å¯ç¨çäº¤äºçæè½åå£°æã */
  getHostCapabilities(): McpUiHostCapabilities;
  initialHostContext: McpUiHostContext;
  hostVersion: string;
  onPhase(
    phase: PluginUiHostPhase,
    detail?: { handle?: PluginSandboxHandle; error?: string },
  ): void;
  onHeight(height: number): void;
  /** `ui/request-display-mode`ï¼å®¿ä¸»è£å³åè¿åå®éæ¨¡å¼ï¼åèå®ä¾æå¼ä¾§æ ãä¾§æ å®ä¾å³é­ tab é½å¨è¿éåçï¼ã */
  onDisplayModeRequest(mode: McpUiDisplayMode): McpUiDisplayMode;
  onOpenExternal(url: string): void;
  /** `initialized` åä¸æ¬¡ï¼é¡µé¢å£°æç appCapabilitiesï¼å¯è½ undefinedï¼ã */
  onAppCapabilities?: (capabilities: McpUiAppCapabilities | undefined) => void;
  log?: (message: string, detail?: Record<string, unknown>) => void;
  /** ç¼ºç `new AppBridge(null, â¦)`ï¼æµè¯æ³¨å¥åæ¡¥ã */
  createAppBridge?: (
    hostInfo: { name: string; version: string },
    hostCapabilities: McpUiHostCapabilities,
    hostContext: McpUiHostContext,
  ) => PluginUiHostBridge;
  handshakeTimeoutMs?: number;
  teardownTimeoutMs?: number;
}

export interface PluginUiHostController {
  isBusy(): boolean;
  tryRecycle(): Promise<boolean>;
  start(): void;
  updateHostContext(patch: Partial<McpUiHostContext>): void;
  /** é¢æ¿æ¢å°æ°ä¸æ¬¡è°ç¨æ¶æ¨é ui/notifications/tool-inputã */
  notifyToolInput(input: McpAppsToolInputPayload): void;
  notifyToolResult(result: McpAppsToolResultPayload): void;
  /** å®¿ä¸»å·¥å·è¢«åæ­¢ â ui/notifications/tool-cancelledã */
  notifyToolCancelled(): void;
  dispose(): Promise<void>;
  readonly phase: PluginUiHostPhase;
}

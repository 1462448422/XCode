import { useXCodeIntl } from "@/i18n/IntlProvider.js";
import {
  buildTaskSidePaneMemoryKey,
  claimPluginUiSidePaneAutoOpen,
} from "@/lib/taskSidePaneMemory.js";
import { createPluginUiInteractions } from "@/plugin-ui/adapters/pluginUiInteractions.js";
import { usePluginUiHost } from "@/plugin-ui/adapters/usePluginUiHost.js";
import {
  getPluginUiManualPin,
  setPluginUiManualPin,
  subscribePluginUiDisclosure,
} from "@/plugin-ui/app/pluginUiDisclosureStore.js";
import {
  getPluginUiRowDisposition,
  subscribePluginUiInstances,
} from "@/plugin-ui/app/pluginUiInstanceStore.js";
import {
  claimPluginUiSurface,
  getPluginUiSurface,
  subscribePluginUiSurfaces,
} from "@/plugin-ui/app/pluginUiSurfaceStore.js";
import { buildPluginUiSurfaceKey } from "@/plugin-ui/contract.js";
import { appAllowsDisplayMode } from "@/plugin-ui/domain/buildPluginUiHostContext.js";
import {
  buildPluginUiToolResult,
  isPluginUiToolCancelled,
  readPluginUiToolInput,
} from "@/plugin-ui/domain/pluginUiToolFeed.js";
import { readPluginUiPresentation } from "@/plugin-ui/domain/readPluginUiPresentation.js";
import type { ToolCallBlockRenderContext } from "@/ToolCallBlocks/fileSummaryTypes.js";
import { resolveTheme } from "@/useTheme.js";
import type {
  McpAppsDisplayMode,
  PluginSandboxHandle,
  PluginUiScopeRef,
} from "@zcode/shared/mcp-apps";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { resolvePluginUiLogicalScope } from "../domain/pluginUiLogicalScope.js";

import type { PluginUiToolCallViewProps } from "@/plugin-ui/contract.js";

const INLINE_AND_FULLSCREEN: readonly McpAppsDisplayMode[] = ["inline", "fullscreen"];
const host_resourceShowInline = (handle: PluginSandboxHandle | null) =>
  handle?.resourceMeta?.showInline === true;
const INLINE_ONLY: readonly McpAppsDisplayMode[] = ["inline"];

/** å·¥å·è¡å°æä»¶ UI çééï¼React çå½å¨æä¸å®¿ä¸»å¨ä½éä¸­äºæ­¤ï¼è§å¾åªæ¥æ¶å±ç¤ºæ¨¡åã */
export function usePluginUiToolCallModel(
  context: ToolCallBlockRenderContext,
): Omit<PluginUiToolCallViewProps, "fallback"> {
  const { intl, locale } = useXCodeIntl();
  const presentation = useMemo(
    () => readPluginUiPresentation(context.toolCallNode.toolCall.raw),
    [context.toolCallNode.toolCall.raw],
  );
  const scope = context.pluginUi?.scope;
  const onOpenSidePane = context.pluginUi?.onOpenSidePane;
  const toolCall = context.toolCallNode.toolCall;
  const [width, setWidth] = useState(0);
  const [displayMode, setDisplayMode] = useState<McpAppsDisplayMode>("inline");
  // èµæºçº§ showInline åªéå¥æå°è¾¾ï¼ç» ref è¯»é¿åæ host ç»æå·è¿æ¸²ææçæ´¾çã
  const hostHandleRef = useRef<PluginSandboxHandle | null>(null);
  const sessionId = scope?.sessionId ?? "";
  const toolScope = useMemo<PluginUiScopeRef>(
    () =>
      presentation?.surface
        ? { kind: "surface", surfaceId: presentation.surface }
        : { kind: "toolCall", toolCallId: toolCall.toolId },
    [toolCall.toolId, presentation?.surface],
  );
  const surfaceTarget = {
    workspacePath: scope?.workspacePath ?? context.workspacePath,
    workspaceIdentity: scope?.workspaceIdentity,
    sessionId,
    pluginId: presentation?.pluginId ?? "",
    serverName: presentation?.serverName,
    resourceUri: presentation?.resourceUri,
  };
  const toolSurfaceKey = buildPluginUiSurfaceKey(
    surfaceTarget,
    resolvePluginUiLogicalScope(presentation ?? {}, toolScope),
  );
  // é¢æ¿è·¯ç±ç®æ ï¼å·¥å·å£°æäº surface æ¶ï¼"ä¾§æ æ¯å¦å·²æ¥ç®¡"çé¢æ¿ tab èä¸æ¯å·¥å·å¡ç tabã
  const routedSurfaceKey = presentation?.surface
    ? buildPluginUiSurfaceKey(surfaceTarget, { kind: "surface", surfaceId: presentation.surface })
    : null;
  const sidePaneActive = useSyncExternalStore(
    subscribePluginUiSurfaces,
    () =>
      getPluginUiSurface(toolSurfaceKey) === "side-pane" ||
      (routedSurfaceKey !== null && getPluginUiSurface(routedSurfaceKey) === "side-pane"),
    () => false,
  );

  const toolInput = useMemo(() => readPluginUiToolInput(toolCall), [toolCall]);
  const toolResult = useMemo(
    () => buildPluginUiToolResult(toolCall, presentation),
    [presentation, toolCall],
  );
  // 4b-1ï¼æ¶é´çº¿æ¨å¯¼çå±ç¤ºè£å³ï¼è¢«æ¿ä»£ / å¼ºå¶å¸¸é©»ï¼ä¸ç¨æ·æå¨åºå®ç¶æã
  const disposition = useSyncExternalStore(
    subscribePluginUiInstances,
    () => getPluginUiRowDisposition(sessionId, toolCall.toolId),
    () => undefined,
  );
  const manualPin = useSyncExternalStore(
    subscribePluginUiDisclosure,
    () => getPluginUiManualPin(sessionId, toolCall.toolId),
    () => undefined,
  );
  const superseded = disposition?.superseded === true;
  const forcedInline =
    disposition?.forcedInline === true || host_resourceShowInline(hostHandleRef.current);
  const pinned = manualPin ?? (forcedInline || disposition?.autoExpand === true);
  const togglePin = useCallback(() => {
    setPluginUiManualPin(sessionId, toolCall.toolId, !pinned);
  }, [pinned, sessionId, toolCall.toolId]);

  const openInSidePane = useCallback(() => {
    if (!presentation) return;

    onOpenSidePane?.({
      // surface å·¥å·æå¼çæ¯é¢æ¿ tabï¼ç»æéåè·¯ç±è¿é¢æ¿ï¼ï¼æ®éå·¥å·æå¼å·¥å·å¡ç tabã
      ...(presentation.surface
        ? { surfaceId: presentation.surface, serverName: presentation.serverName }
        : { toolCallId: toolCall.toolId, serverName: presentation.serverName }),
      pluginId: presentation.pluginId,
      resourceUri: presentation.resourceUri,
      title: toolCall.title ?? presentation.pluginId,
    });
  }, [
    onOpenSidePane,
    presentation,
    routedSurfaceKey,
    toolCall.title,
    toolCall.toolId,
    toolSurfaceKey,
  ]);

  const handleDisplayModeRequest = useCallback(
    (mode: McpAppsDisplayMode) => {
      if (mode === "fullscreen" && onOpenSidePane) {
        openInSidePane();
        return "fullscreen";
      }
      setDisplayMode(mode);
      return mode;
    },
    [onOpenSidePane, openInSidePane],
  );
  const handleOpenExternal = useCallback(
    (url: string) => context.onOpenBrowserUrl?.(url),
    [context.onOpenBrowserUrl],
  );

  // MCP çä¸å¡å¤±è´¥ä»å¯è½æ¯ completed ä¸å¸¦ UI åæ°æ®ï¼åªæ£æ¥æç»æä¼è®©éè¯¯è¡äºæ¢åä¸é¡µé¢å¹¶çä¸ç©ºç½å¡çã
  // å±ç¤ºæ¡ä»¶ï¼å¤±è´¥/åæ¶åªçæ®éè®°å½ï¼ä¸è½å»ºéç¹æèªå¨å¼ä¾§æ ï¼åå§ tool-result ä¸æ¹åã
  const supportedScope =
    Boolean(presentation && scope?.sessionId) &&
    toolCall.status !== "failed" &&
    !isPluginUiToolCancelled(toolCall) &&
    presentation?.isError !== true;
  // é¡µé¢æ¡æå£°æç availableDisplayModes æ¯ç¡¬çº¦æï¼è§è MUST NOTï¼ï¼ä¸å« fullscreen æ¶ä¸ç»ä¾§æ å¥å£ãä¸èªå¨æå¼ã
  // è½åå¨ initialized åæå°ï¼åæ"é½æ¯æ"èµ·æ­¥ï¼å°è¾¾åç» availableDisplayModes ååæ¨ host-context-changedã
  const [appAllowsFullscreen, setAppAllowsFullscreen] = useState(true);
  const canOpenSidePane = Boolean(onOpenSidePane) && appAllowsFullscreen;
  const interactions = useMemo(
    () =>
      scope?.sessionId && presentation
        ? createPluginUiInteractions({
            ...scope,
            sessionId: scope.sessionId,
            pluginId: presentation.pluginId,
            scope: toolScope,
          })
        : undefined,
    [presentation, scope, toolScope],
  );
  // ä¾§æ æ¥ç®¡æ¶åèæ¤æå±ç¤ºéç¹ï¼ç®¡çå¨ç»§ç»­ææåä¸ä¸ªæ´»é¡µé¢ã
  // è¢«æ¿ä»£çè¡åªçæ®éè®°å½ï¼ç»ææªå°±ç»ªï¼pending / runningï¼æ¶åªå ä½ï¼æ²ç®±å¨ç»æå°è¾¾åæå»ºã
  const resultReady = toolResult !== undefined;
  const inlineActive = supportedScope && !sidePaneActive && !superseded && resultReady;
  const host = usePluginUiHost({
    presentation: presentation ?? { serverName: "", pluginId: "", resourceUri: "" },
    scope: {
      workspacePath: scope?.workspacePath ?? context.workspacePath,
      remoteSessionId: scope?.remoteSessionId ?? undefined,
      ...(scope?.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
      sessionId,
      scope: toolScope,
    },
    theme: resolveTheme(context.theme ?? "system"),
    locale,
    displayMode,
    toolInput,
    toolResult,
    toolCancelled: isPluginUiToolCancelled(toolCall),
    hostVersion: "zcode",
    // æ²¡æä¾§æ å¥å£ï¼å¦åªè¯» / éæ¡é¢å£³ï¼æé¡µé¢ä¸æ¯æ fullscreen æ¶åªå£°æ inlineã
    availableDisplayModes: canOpenSidePane ? INLINE_AND_FULLSCREEN : INLINE_ONLY,
    onDisplayModeRequest: handleDisplayModeRequest,
    onOpenExternal: handleOpenExternal,
    width,
    enabled: inlineActive,
    ...(interactions ? { interactions } : {}),
  });
  hostHandleRef.current = host.handle;
  useEffect(() => {
    setAppAllowsFullscreen(appAllowsDisplayMode(host.appCapabilities, "fullscreen"));
  }, [host.appCapabilities]);
  // èµæºçº§ showInlineï¼éå¥æå°è¾¾ï¼ï¼æ²¡ææå¨è®°å½æ¶åæåºå®ï¼ä¹åæå è¾¹çæ®æ­¤éç®ã
  useEffect(() => {
    if (!supportedScope || host.handle?.resourceMeta?.showInline !== true || !sessionId) return;
    if (getPluginUiManualPin(sessionId, toolCall.toolId) === undefined) {
      setPluginUiManualPin(sessionId, toolCall.toolId, true);
    }
  }, [host.handle, sessionId, supportedScope, toolCall.toolId]);

  useEffect(() => {
    if (!inlineActive || !host.supported) return;
    return claimPluginUiSurface(toolSurfaceKey, "inline");
  }, [inlineActive, host.supported, toolSurfaceKey]);

  // preferredDisplayMode: fullscreen â å·¥å·å¡çä¸åºç°å°±èªå¨æå¼ä¾§æ ä¸æ¬¡ã
  // ä¸ç­ç»æï¼replay / æå¿«æ¨¡åä¸ç»æå°è¾¾ä¸ååæ¶èµ·å¯è½å¨åä¸æ¹æäº¤ï¼ç­ç»æä¼è®© effect æ°¸è¿æ²¡æºä¼è·ã
  // ç»æç¨åç±ä¾§æ ä»å®æ¶æå½±æ toolCallId / surfaceId èªè¡è¯»åã
  const autoOpenKey =
    presentation?.preferredDisplayMode === "fullscreen"
      ? buildPluginUiSurfaceKey(surfaceTarget, { kind: "toolCall", toolCallId: toolCall.toolId })
      : null;
  const sidePaneMemoryKey = buildTaskSidePaneMemoryKey({
    workspacePath: surfaceTarget.workspacePath,
    workspaceIdentity: surfaceTarget.workspaceIdentity,
    taskId: sessionId,
  });
  useEffect(() => {
    if (
      !supportedScope ||
      // åå²å±å¼ä¼éæ°æè½½æ§ fullscreen è¡ï¼å¿é¡»åæ­¥ç¦æ­¢èªå¨æå¼ï¼å¦åæ§å¡çä¼æ¢åä¾§æ ã
      superseded ||
      !host.supported ||
      !autoOpenKey ||
      !canOpenSidePane
    )
      return;
    // å·²ç»å¨ä¾§æ çè°ç¨ä¹è¦æ¶è´¹ï¼å¦åå³é­åéæ°æè½½ä¼è¡¥è§¦åï¼è¦çç¨æ·å³é­ç¶æã
    if (!claimPluginUiSidePaneAutoOpen(sidePaneMemoryKey, autoOpenKey)) return;
    if (getPluginUiSurface(routedSurfaceKey ?? toolSurfaceKey) === "side-pane") return;
    openInSidePane();
  }, [
    supportedScope,
    superseded,
    host.supported,
    autoOpenKey,
    sidePaneMemoryKey,
    canOpenSidePane,
    openInSidePane,
    routedSurfaceKey,
    toolSurfaceKey,
  ]);

  return {
    supported: supportedScope && host.supported,
    surface: presentation?.surface,
    preferredDisplayMode: presentation?.preferredDisplayMode ?? "inline",
    sidePaneActive,
    host,
    // èµæºçº§å£°æä¼åï¼å·¥å·çº§ååºï¼é½æ²¡æé»è®¤ç»è¾¹æ¡ã
    prefersBorder: host.handle?.resourceMeta?.prefersBorder ?? presentation?.prefersBorder ?? true,
    superseded,
    ...(supportedScope && !superseded ? { pinned, onTogglePin: togglePin } : {}),
    pinLabel: intl.formatMessage({ id: "pluginUi.pin" }),
    unpinLabel: intl.formatMessage({ id: "pluginUi.unpin" }),
    loadingLabel: intl.formatMessage({ id: "pluginUi.loading" }),
    errorLabel: intl.formatMessage({ id: "pluginUi.loadFailed" }),
    retryLabel: intl.formatMessage({ id: "pluginUi.retry" }),
    openedLabel: intl.formatMessage({ id: "pluginUi.openedInSidePane" }),
    openLabel: intl.formatMessage({ id: "pluginUi.openInSidePane" }),
    onWidthChange: setWidth,
    onOpenSidePane: canOpenSidePane ? openInSidePane : undefined,
  };
}

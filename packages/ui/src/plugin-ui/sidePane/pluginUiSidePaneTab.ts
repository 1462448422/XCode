import type { WorkspaceSidePaneState } from "@/lib/workspaceSidePane.js";
import { activateSidePaneTab } from "@/lib/workspaceSidePane.js";
import type { OpenPluginUiSideTabRequest, PluginUiSidePaneTab } from "../contract.js";
import { buildPluginUiSidePaneTabId, readPluginUiScopeRef } from "../contract.js";

export type OpenScopedPluginUiSideTabRequest = OpenPluginUiSideTabRequest & {
  workspaceKey: string;
};

/**
 * ä¸ plan-detail åæï¼æ workspaceKey + parentSessionId + ä½ç¨åæ´¾çç¨³å® idã
 * å·¥å·å¡ç `â¦:<toolCallId>`ï¼é¢æ¿ `â¦:surface:<surfaceId>`ï¼é¢æ¿ id ä¸ toolCallId ä¸åå½åç©ºé´ï¼åç¼é²æï¼ã
 */
export function createPluginUiSidePaneTab(
  options: OpenScopedPluginUiSideTabRequest,
): PluginUiSidePaneTab {
  const scope = readPluginUiScopeRef(options);
  if (!scope) throw new Error("plugin-ui side tab needs toolCallId or surfaceId");
  return {
    id: buildPluginUiSidePaneTabId(options),
    type: "plugin-ui",
    openedAt: Date.now(),
    workspaceKey: options.workspaceKey,
    workspacePath: options.workspacePath,
    ...(options.workspaceIdentity ? { workspaceIdentity: options.workspaceIdentity } : {}),
    ...(options.remoteSessionId ? { remoteSessionId: options.remoteSessionId } : {}),
    parentSessionId: options.parentSessionId,
    ...(scope.kind === "toolCall"
      ? { toolCallId: scope.toolCallId }
      : { surfaceId: scope.surfaceId }),
    ...(options.serverName ? { serverName: options.serverName } : {}),
    pluginId: options.pluginId,
    resourceUri: options.resourceUri,
    title: options.title,
  };
}

/** åä¸ä½ç¨ååªä¿çä¸ä¸ª tabï¼éå¤æå¼åªå·æ°æ é¢å¹¶æ¿æ´»ã */
export function openPluginUiSidePane(
  current: WorkspaceSidePaneState | null,
  options: OpenScopedPluginUiSideTabRequest,
): WorkspaceSidePaneState {
  const nextTab = createPluginUiSidePaneTab(options);
  const existing = current?.tabs.find(
    (tab): tab is PluginUiSidePaneTab => tab.type === "plugin-ui" && tab.id === nextTab.id,
  );
  return activateSidePaneTab(current, existing ? { ...existing, title: nextTab.title } : nextTab);
}

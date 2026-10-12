// UI ä¾§ v4 æ°æ®å±ï¼M3 m3-ui-coreï¼docs/v4-refactor/06-uiï¼ã
// çº¯æ°å¢ï¼ä¸æ§ store/zcodeSessionStore* å¹¶å­ï¼å é¤åçå¨ç«åå¯ç¨åï¼11-deletion-plan æ³¢æ¬¡ 1ï¼ã
export {
  conversationTopic,
  type ConversationTransport,
} from "@/v4/transport.js";
export {
  ConversationProjectionStore,
  type ConversationStoreState,
  type ConversationStoreStatus,
  type OptimisticCommand,
} from "@/v4/conversationProjectionStore.js";
export {
  SessionDataLayer,
  type SessionDataLayerOptions,
  type SessionLease,
} from "@/v4/sessionDataLayer.js";
export {
  createAgentConversationTransport,
  type AgentConversationTransportTarget,
} from "@/v4/agentConversationTransport.js";
// ââ sessions-index è¯»è·¯å¾ï¼åè¡¨æ´»æ§/detail æ°æ®æºï¼æä¹è¡æ¥èª tasks-indexï¼ââ
export {
  applySessionsIndexFrame,
  SessionsIndexStore,
  EMPTY_SESSIONS_INDEX_STATE,
  type SessionsIndexState,
  type SessionsIndexStoreStatus,
} from "@/v4/sessionsIndexStore.js";
export {
  createAgentSessionsIndexTransport,
  type AgentSessionsIndexTransportTarget,
  type SessionsIndexTransport,
} from "@/v4/agentSessionsIndexTransport.js";
export {
  useSessionsIndex,
  type UseSessionsIndexResult,
} from "@/v4/useSessionsIndex.js";
export {
  LOCAL_SESSIONS_INDEX_ENDPOINT,
  acquireSessionsIndex,
  buildSessionsIndexEntryKey,
  releaseSessionsIndex,
  sessionsIndexRegistrySize,
  type SessionsIndexAgentService,
  type SessionsIndexScope,
} from "@/v4/sessionsIndexRegistry.js";
export {
  createCommandEnvelope,
  getV4ClientId,
  uuidv7,
} from "@/v4/commandFactory.js";
export {
  V4ConversationProvider,
  V4PaneConversationProvider,
  useV4Conversation,
  type V4ConversationContextValue,
  type V4PaneConversationProviderProps,
} from "@/v4/V4ConversationContext.js";
export { useConversationProjection } from "@/v4/useConversationProjection.js";
export { ConversationRowView } from "@/v4/ConversationRowView.js";
export { ConversationTimeline } from "@/v4/ConversationTimeline.js";
export { ConversationComposer } from "@/v4/ConversationComposer.js";
export { SessionPane, type SessionPaneProps } from "@/v4/SessionPane.js";
export { V4ChatPane, type V4ChatPaneProps } from "@/v4/V4ChatPane.js";
// ââ åå±äºæï¼Layout/Focus ä¸¤å±ï¼äºååå²æ ï¼+ workspace å·¥ä½å°å®¿ä¸» ââ
export {
  bindPaneSession,
  canAddPane,
  closePane,
  confirmRestoredPaneSession,
  countPanes,
  effectiveFocusedPaneId,
  focusPane,
  INITIAL_PANE_LAYOUT,
  leafPaneIds,
  MAX_WORKBENCH_PANES,
  openSessionInNewPane,
  paneWorkspaceKey,
  setSplitNodeRatio,
  splitPaneAt,
  usePaneLayoutStore,
  V4_LEGACY_SPLIT_PANE_ID,
  V4_PRIMARY_PANE_ID,
  type PaneBinding,
  type PaneLayoutNode,
  type PaneLayoutSnapshot,
  type PaneLayoutStore,
  type PaneWorkspaceScope,
  type SplitDirection,
} from "@/v4/paneLayoutStore.js";
export {
  acquireWorkspaceConnection,
  buildWorkspaceConnectionKey,
  LOCAL_WORKSPACE_CONNECTION_ENDPOINT,
  WORKSPACE_CONNECTION_KEEP_WARM_MS,
  workspaceConnectionRegistrySize,
  type WorkspaceConnectionAgentService,
  type WorkspaceConnectionLease,
  type WorkspaceConnectionScope,
} from "@/v4/workspaceConnectionRegistry.js";
export {
  V4WorkspaceChatArea,
  type V4WorkspaceChatAreaProps,
} from "@/v4/V4WorkspaceChatArea.js";
export { V4InteractionDialogs } from "@/v4/V4InteractionDialogs.js";
export {
  pendingPermissionToLegacyRequest,
  pendingUserInputToViewModel,
  type V4UserInputViewModel,
} from "@/v4/pendingInteractionAdapter.js";

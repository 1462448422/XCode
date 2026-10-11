// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeAccountAccess,
  ZCodeActiveToolCall,
  ZCodeAutomationCheckTaskBindingProtocolParams,
  ZCodeAutomationCheckTaskBindingProtocolResult,
  ZCodeAutomationCreateProtocolParams,
  ZCodeAutomationCreateProtocolResult,
  ZCodeAutomationDeleteProtocolParams,
  ZCodeAutomationDeleteProtocolResult,
  ZCodeAutomationListProtocolParams,
  ZCodeAutomationListProtocolResult,
  ZCodeAutomationProtocol,
  ZCodeAutomationScheduleRuleProtocol,
  ZCodeAutomationUpdateProtocolParams,
  ZCodeAutomationUpdateProtocolResult,
  ZCodeAvailablePluginSummary,
  ZCodeBrowserAmbientContext,
  ZCodeBrowserExecuteParams,
  ZCodeBrowserExecuteResult,
  ZCodeBrowserListParams,
  ZCodeBrowserListResult,
  ZCodeComputerUseOperationEvent,
  ZCodeDeliveryKind,
  ZCodeInstalledPluginSummary,
  ZCodeInteractionPreferences,
  ZCodeMcpListMode,
  ZCodeMcpListResult,
  ZCodeMcpResourceSample,
  ZCodeMcpServerStatusSnapshot,
  ZCodeMcpTelemetryEvent,
  ZCodeModelContextBudgetStrategy,
  ZCodeModelFormatProperties,
  ZCodeModelIoPreferences,
  ZCodeModelOption,
  ZCodeModelReasoningOptions,
  ZCodeOfficialMcpAuthHeadersRequestParams,
  ZCodeOfficialMcpAuthHeadersResponse,
  ZCodeOffPeakCreateProtocolParams,
  ZCodeOffPeakCreateProtocolResult,
  ZCodeOffPeakListProtocolParams,
  ZCodeOffPeakListProtocolResult,
  ZCodeOffPeakProtocolPermissionMode,
  ZCodeOffPeakTaskProtocolSnapshot,
  ZCodePendingPermission,
  ZCodePermissionRequestParams,
  ZCodePluginComponentGroup,
  ZCodePluginComponentKind,
  ZCodePluginDiagnostic,
  ZCodePluginInfo,
  ZCodePluginMarketplaceSummary,
  ZCodePluginOperationProgressNotification,
  ZCodePluginOperationState,
  ZCodePluginOptionValue,
  ZCodePluginReferenceCatalogEntry,
  ZCodePluginsCancelOperationParams,
  ZCodePluginsCancelOperationResult,
  ZCodePluginsConfigureResult,
  ZCodePluginScope,
  ZCodePluginsDescribeResult,
  ZCodePluginsInstallResult,
  ZCodePluginsListResult,
  ZCodePluginsMarketplaceMutationResult,
  ZCodePluginsOverviewResult,
  ZCodePluginsReferenceCatalogParams,
  ZCodePluginsReferenceCatalogResult,
  ZCodePluginsResetConfigParams,
  ZCodePluginsResolveSuggestedReferenceParams,
  ZCodePluginsResolveSuggestedReferenceResult,
  ZCodePluginsRestoreBuiltinResult,
  ZCodePluginsSetEnabledResult,
  ZCodePluginStoreListing,
  ZCodePluginSuggestedReferenceStatus,
  ZCodePluginsUninstallResult,
  ZCodePluginsValidateResult,
  ZCodePluginUserConfigOption,
  ZCodeProcessChildProcess,
  ZCodeProcessChildProcessesResult,
  ZCodeProcessResourceSample,
  ZCodeProtocolError,
  ZCodeProtocolMcpServer,
  ZCodeProtocolMessage,
  ZCodeProtocolMethod,
  ZCodeProtocolNotification,
  ZCodeProtocolRequest,
  ZCodeProtocolRequestId,
  ZCodeProtocolResponse,
  ZCodeProtocolSessionMethodContract,
  ZCodeProviderAccountAccess,
  ZCodeProviderRuntimeHeadersCancelled,
  ZCodeProviderRuntimeHeadersRequestParams,
  ZCodeProviderRuntimeHeadersResponse,
  ZCodeProviderTestModelConnectivityParams,
  ZCodeProviderTestModelConnectivityResult,
  ZCodeProviderUpdateAccountConfigResult,
  ZCodeSavedWorkflowArgDeclaration,
  ZCodeSavedWorkflowArgsDeclaration,
  ZCodeSavedWorkflowArgType,
  ZCodeSavedWorkflowEntry,
  ZCodeSavedWorkflowFailureReason,
  ZCodeSavedWorkflowInvalidEntry,
  ZCodeSavedWorkflowMeta,
  ZCodeSavedWorkflowRun,
  ZCodeSavedWorkflowRunStatus,
  ZCodeSavedWorkflowScope,
  ZCodeSessionApiRetryStatus,
  ZCodeSessionCancelBackgroundTaskParams,
  ZCodeSessionCancelBackgroundTaskResult,
  ZCodeSessionCloseParams,
  ZCodeSessionCloseResult,
  ZCodeSessionCompactParams,
  ZCodeSessionCompactResult,
  ZCodeSessionContextUsage,
  ZCodeSessionCreateParams,
  ZCodeSessionEndedSubagent,
  ZCodeSessionEvent,
  ZCodeSessionEventsParams,
  ZCodeSessionEventType,
  ZCodeSessionForkParams,
  ZCodeSessionForkResult,
  ZCodeSessionGoal,
  ZCodeSessionGoalAction,
  ZCodeSessionGoalParams,
  ZCodeSessionGoalResult,
  ZCodeSessionGoalStats,
  ZCodeSessionGoalVerification,
  ZCodeSessionGoalVerificationTimeline,
  ZCodeSessionHistoryTarget,
  ZCodeSessionImportHistory,
  ZCodeSessionImportMessage,
  ZCodeSessionKind,
  ZCodeSessionListParams,
  ZCodeSessionMessagesParams,
  ZCodeSessionMode,
  ZCodeSessionPersistence,
  ZCodeSessionProjection,
  ZCodeSessionReadParams,
  ZCodeSessionRequestRuntimePreferencesParams,
  ZCodeSessionResumeParams,
  ZCodeSessionRunningSubagent,
  ZCodeSessionRuntimePreferencesResult,
  ZCodeSessionRuntimePreferencesScope,
  ZCodeSessionSendResult,
  ZCodeSessionSetModelParams,
  ZCodeSessionSetModeParams,
  ZCodeSessionSetThoughtLevelParams,
  ZCodeSessionSettingsState,
  ZCodeSessionStateSnapshot,
  ZCodeSessionSubagentsParams,
  ZCodeSessionSubagentsResult,
  ZCodeSessionSubscribeParams,
  ZCodeSessionTodoGroup,
  ZCodeSkillReferenceCatalogEntry,
  ZCodeSkillsReferenceCatalogParams,
  ZCodeSkillsReferenceCatalogResult,
  ZCodeStateUpdatedNotification,
  ZCodeStorageStartupState,
  ZCodeTaskTokenUsageResult,
  ZCodeToolExecResource,
  ZCodeToolState,
  ZCodeUserInputQuestion,
  ZCodeUserInputRequestParams,
  ZCodeUserInputResponse,
  ZCodeWorkflowsDeleteParams,
  ZCodeWorkflowsDeleteResult,
  ZCodeWorkflowsGetParams,
  ZCodeWorkflowsGetResult,
  ZCodeWorkflowsListParams,
  ZCodeWorkflowsListResult,
  ZCodeWorkflowsMoveParams,
  ZCodeWorkflowsMoveResult,
  ZCodeWorkflowsRunsParams,
  ZCodeWorkflowsRunsResult,
  ZCodeWorkflowsUpdateMetaParams,
  ZCodeWorkflowsUpdateMetaResult,
  ZCodeWorkspaceGenerateTextParams,
  ZCodeWorkspaceGenerateTextResult,
  ZCodeWorkspaceHookTrustGrantParams,
  ZCodeWorkspaceHookTrustGrantReasonCode,
  ZCodeWorkspaceHookTrustGrantResult,
  ZCodeWorkspaceModelMessage,
  ZCodeWorkspaceModelTool,
  ZCodeWorkspacePresentation,
  ZCodeWorkspaceRef,
  ZCodeWorkspaceUpdateDynamicWorkflowPolicyParams,
  ZCodeWorkspaceUpdateDynamicWorkflowPolicyResult,
  ZCodeWorkspaceUpdateInteractionPreferencesParams,
  ZCodeWorkspaceUpdateInteractionPreferencesResult,
  ZCodeWorkspaceUpdateModelIoPreferencesParams,
  ZCodeWorkspaceUpdateModelIoPreferencesResult,
  ZCodeWorkspaceUpdateOffPeakToolPolicyParams,
  ZCodeWorkspaceUpdateOffPeakToolPolicyResult,
} from "../zcode-protocol/index.js";
import {
  DEFAULT_ZCODE_MODEL_CONTEXT_BUDGET_STRATEGY,
  ZCODE_MCP_RESOURCE_SAMPLE_INTERVAL_MS,
  ZCODE_PROTOCOL_NAME,
  ZCODE_PROTOCOL_V4_WIRE_VERSION,
  ZCODE_PROTOCOL_VERSION,
  ZCODE_SESSION_RUNTIME_PREFERENCES_REQUEST_TIMEOUT_MS,
  ZCODE_WORKFLOWS_RUNS_MAX_LIMIT,
} from "../zcode-protocol/index.js";

export const DEFAULT_XCODE_MODEL_CONTEXT_BUDGET_STRATEGY = DEFAULT_ZCODE_MODEL_CONTEXT_BUDGET_STRATEGY;
export const XCODE_MCP_RESOURCE_SAMPLE_INTERVAL_MS = ZCODE_MCP_RESOURCE_SAMPLE_INTERVAL_MS;
export const XCODE_PROTOCOL_NAME = ZCODE_PROTOCOL_NAME;
export const XCODE_PROTOCOL_V4_WIRE_VERSION = ZCODE_PROTOCOL_V4_WIRE_VERSION;
export const XCODE_PROTOCOL_VERSION = ZCODE_PROTOCOL_VERSION;
export const XCODE_SESSION_RUNTIME_PREFERENCES_REQUEST_TIMEOUT_MS = ZCODE_SESSION_RUNTIME_PREFERENCES_REQUEST_TIMEOUT_MS;
export const XCODE_WORKFLOWS_RUNS_MAX_LIMIT = ZCODE_WORKFLOWS_RUNS_MAX_LIMIT;
export type XCodeAccountAccess = ZCodeAccountAccess;
export type XCodeActiveToolCall = ZCodeActiveToolCall;
export type XCodeAutomationCheckTaskBindingProtocolParams = ZCodeAutomationCheckTaskBindingProtocolParams;
export type XCodeAutomationCheckTaskBindingProtocolResult = ZCodeAutomationCheckTaskBindingProtocolResult;
export type XCodeAutomationCreateProtocolParams = ZCodeAutomationCreateProtocolParams;
export type XCodeAutomationCreateProtocolResult = ZCodeAutomationCreateProtocolResult;
export type XCodeAutomationDeleteProtocolParams = ZCodeAutomationDeleteProtocolParams;
export type XCodeAutomationDeleteProtocolResult = ZCodeAutomationDeleteProtocolResult;
export type XCodeAutomationListProtocolParams = ZCodeAutomationListProtocolParams;
export type XCodeAutomationListProtocolResult = ZCodeAutomationListProtocolResult;
export type XCodeAutomationProtocol = ZCodeAutomationProtocol;
export type XCodeAutomationScheduleRuleProtocol = ZCodeAutomationScheduleRuleProtocol;
export type XCodeAutomationUpdateProtocolParams = ZCodeAutomationUpdateProtocolParams;
export type XCodeAutomationUpdateProtocolResult = ZCodeAutomationUpdateProtocolResult;
export type XCodeAvailablePluginSummary = ZCodeAvailablePluginSummary;
export type XCodeBrowserAmbientContext = ZCodeBrowserAmbientContext;
export type XCodeBrowserExecuteParams = ZCodeBrowserExecuteParams;
export type XCodeBrowserExecuteResult = ZCodeBrowserExecuteResult;
export type XCodeBrowserListParams = ZCodeBrowserListParams;
export type XCodeBrowserListResult = ZCodeBrowserListResult;
export type XCodeComputerUseOperationEvent = ZCodeComputerUseOperationEvent;
export type XCodeDeliveryKind = ZCodeDeliveryKind;
export type XCodeInstalledPluginSummary = ZCodeInstalledPluginSummary;
export type XCodeInteractionPreferences = ZCodeInteractionPreferences;
export type XCodeMcpListMode = ZCodeMcpListMode;
export type XCodeMcpListResult = ZCodeMcpListResult;
export type XCodeMcpResourceSample = ZCodeMcpResourceSample;
export type XCodeMcpServerStatusSnapshot = ZCodeMcpServerStatusSnapshot;
export type XCodeMcpTelemetryEvent = ZCodeMcpTelemetryEvent;
export type XCodeModelContextBudgetStrategy = ZCodeModelContextBudgetStrategy;
export type XCodeModelFormatProperties = ZCodeModelFormatProperties;
export type XCodeModelIoPreferences = ZCodeModelIoPreferences;
export type XCodeModelOption = ZCodeModelOption;
export type XCodeModelReasoningOptions = ZCodeModelReasoningOptions;
export type XCodeOfficialMcpAuthHeadersRequestParams = ZCodeOfficialMcpAuthHeadersRequestParams;
export type XCodeOfficialMcpAuthHeadersResponse = ZCodeOfficialMcpAuthHeadersResponse;
export type XCodeOffPeakCreateProtocolParams = ZCodeOffPeakCreateProtocolParams;
export type XCodeOffPeakCreateProtocolResult = ZCodeOffPeakCreateProtocolResult;
export type XCodeOffPeakListProtocolParams = ZCodeOffPeakListProtocolParams;
export type XCodeOffPeakListProtocolResult = ZCodeOffPeakListProtocolResult;
export type XCodeOffPeakProtocolPermissionMode = ZCodeOffPeakProtocolPermissionMode;
export type XCodeOffPeakTaskProtocolSnapshot = ZCodeOffPeakTaskProtocolSnapshot;
export type XCodePendingPermission = ZCodePendingPermission;
export type XCodePermissionRequestParams = ZCodePermissionRequestParams;
export type XCodePluginComponentGroup = ZCodePluginComponentGroup;
export type XCodePluginComponentKind = ZCodePluginComponentKind;
export type XCodePluginDiagnostic = ZCodePluginDiagnostic;
export type XCodePluginInfo = ZCodePluginInfo;
export type XCodePluginMarketplaceSummary = ZCodePluginMarketplaceSummary;
export type XCodePluginOperationProgressNotification = ZCodePluginOperationProgressNotification;
export type XCodePluginOperationState = ZCodePluginOperationState;
export type XCodePluginOptionValue = ZCodePluginOptionValue;
export type XCodePluginReferenceCatalogEntry = ZCodePluginReferenceCatalogEntry;
export type XCodePluginsCancelOperationParams = ZCodePluginsCancelOperationParams;
export type XCodePluginsCancelOperationResult = ZCodePluginsCancelOperationResult;
export type XCodePluginsConfigureResult = ZCodePluginsConfigureResult;
export type XCodePluginScope = ZCodePluginScope;
export type XCodePluginsDescribeResult = ZCodePluginsDescribeResult;
export type XCodePluginsInstallResult = ZCodePluginsInstallResult;
export type XCodePluginsListResult = ZCodePluginsListResult;
export type XCodePluginsMarketplaceMutationResult = ZCodePluginsMarketplaceMutationResult;
export type XCodePluginsOverviewResult = ZCodePluginsOverviewResult;
export type XCodePluginsReferenceCatalogParams = ZCodePluginsReferenceCatalogParams;
export type XCodePluginsReferenceCatalogResult = ZCodePluginsReferenceCatalogResult;
export type XCodePluginsResetConfigParams = ZCodePluginsResetConfigParams;
export type XCodePluginsResolveSuggestedReferenceParams = ZCodePluginsResolveSuggestedReferenceParams;
export type XCodePluginsResolveSuggestedReferenceResult = ZCodePluginsResolveSuggestedReferenceResult;
export type XCodePluginsRestoreBuiltinResult = ZCodePluginsRestoreBuiltinResult;
export type XCodePluginsSetEnabledResult = ZCodePluginsSetEnabledResult;
export type XCodePluginStoreListing = ZCodePluginStoreListing;
export type XCodePluginSuggestedReferenceStatus = ZCodePluginSuggestedReferenceStatus;
export type XCodePluginsUninstallResult = ZCodePluginsUninstallResult;
export type XCodePluginsValidateResult = ZCodePluginsValidateResult;
export type XCodePluginUserConfigOption = ZCodePluginUserConfigOption;
export type XCodeProcessChildProcess = ZCodeProcessChildProcess;
export type XCodeProcessChildProcessesResult = ZCodeProcessChildProcessesResult;
export type XCodeProcessResourceSample = ZCodeProcessResourceSample;
export type XCodeProtocolError = ZCodeProtocolError;
export type XCodeProtocolMcpServer = ZCodeProtocolMcpServer;
export type XCodeProtocolMessage = ZCodeProtocolMessage;
export type XCodeProtocolMethod = ZCodeProtocolMethod;
export type XCodeProtocolNotification = ZCodeProtocolNotification;
export type XCodeProtocolRequest = ZCodeProtocolRequest;
export type XCodeProtocolRequestId = ZCodeProtocolRequestId;
export type XCodeProtocolResponse = ZCodeProtocolResponse;
export type XCodeProtocolSessionMethodContract = ZCodeProtocolSessionMethodContract;
export type XCodeProviderAccountAccess = ZCodeProviderAccountAccess;
export type XCodeProviderRuntimeHeadersCancelled = ZCodeProviderRuntimeHeadersCancelled;
export type XCodeProviderRuntimeHeadersRequestParams = ZCodeProviderRuntimeHeadersRequestParams;
export type XCodeProviderRuntimeHeadersResponse = ZCodeProviderRuntimeHeadersResponse;
export type XCodeProviderTestModelConnectivityParams = ZCodeProviderTestModelConnectivityParams;
export type XCodeProviderTestModelConnectivityResult = ZCodeProviderTestModelConnectivityResult;
export type XCodeProviderUpdateAccountConfigResult = ZCodeProviderUpdateAccountConfigResult;
export type XCodeSavedWorkflowArgDeclaration = ZCodeSavedWorkflowArgDeclaration;
export type XCodeSavedWorkflowArgsDeclaration = ZCodeSavedWorkflowArgsDeclaration;
export type XCodeSavedWorkflowArgType = ZCodeSavedWorkflowArgType;
export type XCodeSavedWorkflowEntry = ZCodeSavedWorkflowEntry;
export type XCodeSavedWorkflowFailureReason = ZCodeSavedWorkflowFailureReason;
export type XCodeSavedWorkflowInvalidEntry = ZCodeSavedWorkflowInvalidEntry;
export type XCodeSavedWorkflowMeta = ZCodeSavedWorkflowMeta;
export type XCodeSavedWorkflowRun = ZCodeSavedWorkflowRun;
export type XCodeSavedWorkflowRunStatus = ZCodeSavedWorkflowRunStatus;
export type XCodeSavedWorkflowScope = ZCodeSavedWorkflowScope;
export type XCodeSessionApiRetryStatus = ZCodeSessionApiRetryStatus;
export type XCodeSessionCancelBackgroundTaskParams = ZCodeSessionCancelBackgroundTaskParams;
export type XCodeSessionCancelBackgroundTaskResult = ZCodeSessionCancelBackgroundTaskResult;
export type XCodeSessionCloseParams = ZCodeSessionCloseParams;
export type XCodeSessionCloseResult = ZCodeSessionCloseResult;
export type XCodeSessionCompactParams = ZCodeSessionCompactParams;
export type XCodeSessionCompactResult = ZCodeSessionCompactResult;
export type XCodeSessionContextUsage = ZCodeSessionContextUsage;
export type XCodeSessionCreateParams = ZCodeSessionCreateParams;
export type XCodeSessionEndedSubagent = ZCodeSessionEndedSubagent;
export type XCodeSessionEvent = ZCodeSessionEvent;
export type XCodeSessionEventsParams = ZCodeSessionEventsParams;
export type XCodeSessionEventType = ZCodeSessionEventType;
export type XCodeSessionForkParams = ZCodeSessionForkParams;
export type XCodeSessionForkResult = ZCodeSessionForkResult;
export type XCodeSessionGoal = ZCodeSessionGoal;
export type XCodeSessionGoalAction = ZCodeSessionGoalAction;
export type XCodeSessionGoalParams = ZCodeSessionGoalParams;
export type XCodeSessionGoalResult = ZCodeSessionGoalResult;
export type XCodeSessionGoalStats = ZCodeSessionGoalStats;
export type XCodeSessionGoalVerification = ZCodeSessionGoalVerification;
export type XCodeSessionGoalVerificationTimeline = ZCodeSessionGoalVerificationTimeline;
export type XCodeSessionHistoryTarget = ZCodeSessionHistoryTarget;
export type XCodeSessionImportHistory = ZCodeSessionImportHistory;
export type XCodeSessionImportMessage = ZCodeSessionImportMessage;
export type XCodeSessionKind = ZCodeSessionKind;
export type XCodeSessionListParams = ZCodeSessionListParams;
export type XCodeSessionMessagesParams = ZCodeSessionMessagesParams;
export type XCodeSessionMode = ZCodeSessionMode;
export type XCodeSessionPersistence = ZCodeSessionPersistence;
export type XCodeSessionProjection = ZCodeSessionProjection;
export type XCodeSessionReadParams = ZCodeSessionReadParams;
export type XCodeSessionRequestRuntimePreferencesParams = ZCodeSessionRequestRuntimePreferencesParams;
export type XCodeSessionResumeParams = ZCodeSessionResumeParams;
export type XCodeSessionRunningSubagent = ZCodeSessionRunningSubagent;
export type XCodeSessionRuntimePreferencesResult = ZCodeSessionRuntimePreferencesResult;
export type XCodeSessionRuntimePreferencesScope = ZCodeSessionRuntimePreferencesScope;
export type XCodeSessionSendResult = ZCodeSessionSendResult;
export type XCodeSessionSetModelParams = ZCodeSessionSetModelParams;
export type XCodeSessionSetModeParams = ZCodeSessionSetModeParams;
export type XCodeSessionSetThoughtLevelParams = ZCodeSessionSetThoughtLevelParams;
export type XCodeSessionSettingsState = ZCodeSessionSettingsState;
export type XCodeSessionStateSnapshot = ZCodeSessionStateSnapshot;
export type XCodeSessionSubagentsParams = ZCodeSessionSubagentsParams;
export type XCodeSessionSubagentsResult = ZCodeSessionSubagentsResult;
export type XCodeSessionSubscribeParams = ZCodeSessionSubscribeParams;
export type XCodeSessionTodoGroup = ZCodeSessionTodoGroup;
export type XCodeSkillReferenceCatalogEntry = ZCodeSkillReferenceCatalogEntry;
export type XCodeSkillsReferenceCatalogParams = ZCodeSkillsReferenceCatalogParams;
export type XCodeSkillsReferenceCatalogResult = ZCodeSkillsReferenceCatalogResult;
export type XCodeStateUpdatedNotification = ZCodeStateUpdatedNotification;
export type XCodeStorageStartupState = ZCodeStorageStartupState;
export type XCodeTaskTokenUsageResult = ZCodeTaskTokenUsageResult;
export type XCodeToolExecResource = ZCodeToolExecResource;
export type XCodeToolState = ZCodeToolState;
export type XCodeUserInputQuestion = ZCodeUserInputQuestion;
export type XCodeUserInputRequestParams = ZCodeUserInputRequestParams;
export type XCodeUserInputResponse = ZCodeUserInputResponse;
export type XCodeWorkflowsDeleteParams = ZCodeWorkflowsDeleteParams;
export type XCodeWorkflowsDeleteResult = ZCodeWorkflowsDeleteResult;
export type XCodeWorkflowsGetParams = ZCodeWorkflowsGetParams;
export type XCodeWorkflowsGetResult = ZCodeWorkflowsGetResult;
export type XCodeWorkflowsListParams = ZCodeWorkflowsListParams;
export type XCodeWorkflowsListResult = ZCodeWorkflowsListResult;
export type XCodeWorkflowsMoveParams = ZCodeWorkflowsMoveParams;
export type XCodeWorkflowsMoveResult = ZCodeWorkflowsMoveResult;
export type XCodeWorkflowsRunsParams = ZCodeWorkflowsRunsParams;
export type XCodeWorkflowsRunsResult = ZCodeWorkflowsRunsResult;
export type XCodeWorkflowsUpdateMetaParams = ZCodeWorkflowsUpdateMetaParams;
export type XCodeWorkflowsUpdateMetaResult = ZCodeWorkflowsUpdateMetaResult;
export type XCodeWorkspaceGenerateTextParams = ZCodeWorkspaceGenerateTextParams;
export type XCodeWorkspaceGenerateTextResult = ZCodeWorkspaceGenerateTextResult;
export type XCodeWorkspaceHookTrustGrantParams = ZCodeWorkspaceHookTrustGrantParams;
export type XCodeWorkspaceHookTrustGrantReasonCode = ZCodeWorkspaceHookTrustGrantReasonCode;
export type XCodeWorkspaceHookTrustGrantResult = ZCodeWorkspaceHookTrustGrantResult;
export type XCodeWorkspaceModelMessage = ZCodeWorkspaceModelMessage;
export type XCodeWorkspaceModelTool = ZCodeWorkspaceModelTool;
export type XCodeWorkspacePresentation = ZCodeWorkspacePresentation;
export type XCodeWorkspaceRef = ZCodeWorkspaceRef;
export type XCodeWorkspaceUpdateDynamicWorkflowPolicyParams = ZCodeWorkspaceUpdateDynamicWorkflowPolicyParams;
export type XCodeWorkspaceUpdateDynamicWorkflowPolicyResult = ZCodeWorkspaceUpdateDynamicWorkflowPolicyResult;
export type XCodeWorkspaceUpdateInteractionPreferencesParams = ZCodeWorkspaceUpdateInteractionPreferencesParams;
export type XCodeWorkspaceUpdateInteractionPreferencesResult = ZCodeWorkspaceUpdateInteractionPreferencesResult;
export type XCodeWorkspaceUpdateModelIoPreferencesParams = ZCodeWorkspaceUpdateModelIoPreferencesParams;
export type XCodeWorkspaceUpdateModelIoPreferencesResult = ZCodeWorkspaceUpdateModelIoPreferencesResult;
export type XCodeWorkspaceUpdateOffPeakToolPolicyParams = ZCodeWorkspaceUpdateOffPeakToolPolicyParams;
export type XCodeWorkspaceUpdateOffPeakToolPolicyResult = ZCodeWorkspaceUpdateOffPeakToolPolicyResult;

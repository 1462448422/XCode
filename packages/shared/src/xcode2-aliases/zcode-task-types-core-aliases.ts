// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeAgentMessageChunk,
  ZCodeAgentThoughtChunk,
  ZCodeApiRetryStatus,
  ZCodeAssistantCheckpointReason,
  ZCodeAssistantCheckpointState,
  ZCodeAssistantMessageFeedback,
  ZCodeAvailableCommandsUpdate,
  ZCodeBackgroundTaskControlItemsUpdate,
  ZCodeBackgroundTurnAttribution,
  ZCodeConfigOption,
  ZCodeConfigOptionUpdate,
  ZCodeConfigSelectValue,
  ZCodeContextCacheUsage,
  ZCodeContextCompactionTimelineMeta,
  ZCodeContextCompactionTimelinePhase,
  ZCodeElicitationOption,
  ZCodeElicitationQuestion,
  ZCodeElicitationRequest,
  ZCodeElicitationResponse,
  ZCodeGlmAgentModelStateOption,
  ZCodeGlmAgentModelStateUpdate,
  ZCodeGlmAgentModelStateUpdatePayload,
  ZCodeGlmAgentModelStateUpdateReason,
  ZCodeGoalIterationStarted,
  ZCodeGoalVerification,
  ZCodeGoalVerificationTimelineMeta,
  ZCodeGoalVerificationTimelineStatus,
  ZCodeGoalVerificationUpdate,
  ZCodeModeUpdate,
  ZCodeOffPeakRunType,
  ZCodePermissionOption,
  ZCodePermissionRequest,
  ZCodePersistedFileChange,
  ZCodePersistedFileSnapshot,
  ZCodePersistedMessage,
  ZCodePersistedMessagePart,
  ZCodePersistedToolCall,
  ZCodePersistedTurnCheckpoint,
  ZCodePlan,
  ZCodePlanStep,
  ZCodePromptAttachment,
  ZCodePromptAudioAttachment,
  ZCodePromptFileAttachment,
  ZCodePromptImageAttachment,
  ZCodePromptPdfAttachment,
  ZCodePromptVideoAttachment,
  ZCodeSessionFile,
  ZCodeSessionForkTimelineMeta,
  ZCodeSessionInfoUpdate,
  ZCodeSessionRuntimeSnapshot,
  ZCodeSlashCommand,
  ZCodeStreamEvent,
  ZCodeTaskChangedFileSummary,
  ZCodeTaskChangeSummary,
  ZCodeTaskClientMode,
  ZCodeTaskComplete,
  ZCodeTaskError,
  ZCodeTaskGoal,
  ZCodeTaskGoalChangedPatch,
  ZCodeTaskGoalStats,
  ZCodeTaskGoalStatus,
  ZCodeTaskInteractionAutoResolution,
  ZCodeTaskLastError,
  ZCodeTaskMeta,
  ZCodeTaskMigrationSource,
  ZCodeTaskMode,
  ZCodeTaskModeInfo,
  ZCodeTaskNetworkDebugStatus,
  ZCodeTaskNetworkDebugStatusType,
  ZCodeTaskPendingInteraction,
  ZCodeTaskPermissionResponse,
  ZCodeTaskPersistStatus,
  ZCodeTaskRunStarted,
  ZCodeTaskRuntimeCommand,
  ZCodeTaskRuntimeCommandBase,
  ZCodeTaskRuntimeCommandStatus,
  ZCodeTaskRuntimeStatus,
  ZCodeTaskSendPromptCommand,
  ZCodeTaskSnapshot,
  ZCodeTaskSnapshotBodyField,
  ZCodeTaskSnapshotBodyRef,
  ZCodeTaskSnapshotFileContentField,
  ZCodeTaskSnapshotFileContentRef,
  ZCodeTaskSnapshotHistory,
  ZCodeTaskSnapshotToolField,
  ZCodeTaskSnapshotToolFieldRef,
  ZCodeTaskSnapshotToolSlice,
  ZCodeTaskSnapshotUpdated,
  ZCodeTaskTargetChangedAction,
  ZCodeTaskTargetChangedSource,
  ZCodeTaskTokenUsageDelta,
  ZCodeTaskWarning,
  ZCodeTimelineMeta,
  ZCodeTimelineStatus,
  ZCodeTimelineTrigger,
  ZCodeTodoGroup,
  ZCodeToolCall,
  ZCodeToolCallUpdate,
  ZCodeTurnFileState,
  ZCodeTurnSteerCommandKind,
  ZCodeTurnSteerQueued,
  ZCodeTurnSteerSource,
  ZCodeTurnSteerStatus,
  ZCodeUsage,
  ZCodeUsageUpdate,
} from "../zcode-task-types-core.js";

export type XCodeAgentMessageChunk = ZCodeAgentMessageChunk;
export type XCodeAgentThoughtChunk = ZCodeAgentThoughtChunk;
export type XCodeApiRetryStatus = ZCodeApiRetryStatus;
export type XCodeAssistantCheckpointReason = ZCodeAssistantCheckpointReason;
export type XCodeAssistantCheckpointState = ZCodeAssistantCheckpointState;
export type XCodeAssistantMessageFeedback = ZCodeAssistantMessageFeedback;
export type XCodeAvailableCommandsUpdate = ZCodeAvailableCommandsUpdate;
export type XCodeBackgroundTaskControlItemsUpdate = ZCodeBackgroundTaskControlItemsUpdate;
export type XCodeBackgroundTurnAttribution = ZCodeBackgroundTurnAttribution;
export type XCodeConfigOption = ZCodeConfigOption;
export type XCodeConfigOptionUpdate = ZCodeConfigOptionUpdate;
export type XCodeConfigSelectValue = ZCodeConfigSelectValue;
export type XCodeContextCacheUsage = ZCodeContextCacheUsage;
export type XCodeContextCompactionTimelineMeta = ZCodeContextCompactionTimelineMeta;
export type XCodeContextCompactionTimelinePhase = ZCodeContextCompactionTimelinePhase;
export type XCodeElicitationOption = ZCodeElicitationOption;
export type XCodeElicitationQuestion = ZCodeElicitationQuestion;
export type XCodeElicitationRequest = ZCodeElicitationRequest;
export type XCodeElicitationResponse = ZCodeElicitationResponse;
export type XCodeGlmAgentModelStateOption = ZCodeGlmAgentModelStateOption;
export type XCodeGlmAgentModelStateUpdate = ZCodeGlmAgentModelStateUpdate;
export type XCodeGlmAgentModelStateUpdatePayload = ZCodeGlmAgentModelStateUpdatePayload;
export type XCodeGlmAgentModelStateUpdateReason = ZCodeGlmAgentModelStateUpdateReason;
export type XCodeGoalIterationStarted = ZCodeGoalIterationStarted;
export type XCodeGoalVerification = ZCodeGoalVerification;
export type XCodeGoalVerificationTimelineMeta = ZCodeGoalVerificationTimelineMeta;
export type XCodeGoalVerificationTimelineStatus = ZCodeGoalVerificationTimelineStatus;
export type XCodeGoalVerificationUpdate = ZCodeGoalVerificationUpdate;
export type XCodeModeUpdate = ZCodeModeUpdate;
export type XCodeOffPeakRunType = ZCodeOffPeakRunType;
export type XCodePermissionOption = ZCodePermissionOption;
export type XCodePermissionRequest = ZCodePermissionRequest;
export type XCodePersistedFileChange = ZCodePersistedFileChange;
export type XCodePersistedFileSnapshot = ZCodePersistedFileSnapshot;
export type XCodePersistedMessage = ZCodePersistedMessage;
export type XCodePersistedMessagePart = ZCodePersistedMessagePart;
export type XCodePersistedToolCall = ZCodePersistedToolCall;
export type XCodePersistedTurnCheckpoint = ZCodePersistedTurnCheckpoint;
export type XCodePlan = ZCodePlan;
export type XCodePlanStep = ZCodePlanStep;
export type XCodePromptAttachment = ZCodePromptAttachment;
export type XCodePromptAudioAttachment = ZCodePromptAudioAttachment;
export type XCodePromptFileAttachment = ZCodePromptFileAttachment;
export type XCodePromptImageAttachment = ZCodePromptImageAttachment;
export type XCodePromptPdfAttachment = ZCodePromptPdfAttachment;
export type XCodePromptVideoAttachment = ZCodePromptVideoAttachment;
export type XCodeSessionFile = ZCodeSessionFile;
export type XCodeSessionForkTimelineMeta = ZCodeSessionForkTimelineMeta;
export type XCodeSessionInfoUpdate = ZCodeSessionInfoUpdate;
export type XCodeSessionRuntimeSnapshot = ZCodeSessionRuntimeSnapshot;
export type XCodeSlashCommand = ZCodeSlashCommand;
export type XCodeStreamEvent = ZCodeStreamEvent;
export type XCodeTaskChangedFileSummary = ZCodeTaskChangedFileSummary;
export type XCodeTaskChangeSummary = ZCodeTaskChangeSummary;
export type XCodeTaskClientMode = ZCodeTaskClientMode;
export type XCodeTaskComplete = ZCodeTaskComplete;
export type XCodeTaskError = ZCodeTaskError;
export type XCodeTaskGoal = ZCodeTaskGoal;
export type XCodeTaskGoalChangedPatch = ZCodeTaskGoalChangedPatch;
export type XCodeTaskGoalStats = ZCodeTaskGoalStats;
export type XCodeTaskGoalStatus = ZCodeTaskGoalStatus;
export type XCodeTaskInteractionAutoResolution = ZCodeTaskInteractionAutoResolution;
export type XCodeTaskLastError = ZCodeTaskLastError;
export type XCodeTaskMeta = ZCodeTaskMeta;
export type XCodeTaskMigrationSource = ZCodeTaskMigrationSource;
export type XCodeTaskMode = ZCodeTaskMode;
export type XCodeTaskModeInfo = ZCodeTaskModeInfo;
export type XCodeTaskNetworkDebugStatus = ZCodeTaskNetworkDebugStatus;
export type XCodeTaskNetworkDebugStatusType = ZCodeTaskNetworkDebugStatusType;
export type XCodeTaskPendingInteraction = ZCodeTaskPendingInteraction;
export type XCodeTaskPermissionResponse = ZCodeTaskPermissionResponse;
export type XCodeTaskPersistStatus = ZCodeTaskPersistStatus;
export type XCodeTaskRunStarted = ZCodeTaskRunStarted;
export type XCodeTaskRuntimeCommand = ZCodeTaskRuntimeCommand;
export type XCodeTaskRuntimeCommandBase = ZCodeTaskRuntimeCommandBase;
export type XCodeTaskRuntimeCommandStatus = ZCodeTaskRuntimeCommandStatus;
export type XCodeTaskRuntimeStatus = ZCodeTaskRuntimeStatus;
export type XCodeTaskSendPromptCommand = ZCodeTaskSendPromptCommand;
export type XCodeTaskSnapshot = ZCodeTaskSnapshot;
export type XCodeTaskSnapshotBodyField = ZCodeTaskSnapshotBodyField;
export type XCodeTaskSnapshotBodyRef = ZCodeTaskSnapshotBodyRef;
export type XCodeTaskSnapshotFileContentField = ZCodeTaskSnapshotFileContentField;
export type XCodeTaskSnapshotFileContentRef = ZCodeTaskSnapshotFileContentRef;
export type XCodeTaskSnapshotHistory = ZCodeTaskSnapshotHistory;
export type XCodeTaskSnapshotToolField = ZCodeTaskSnapshotToolField;
export type XCodeTaskSnapshotToolFieldRef = ZCodeTaskSnapshotToolFieldRef;
export type XCodeTaskSnapshotToolSlice = ZCodeTaskSnapshotToolSlice;
export type XCodeTaskSnapshotUpdated = ZCodeTaskSnapshotUpdated;
export type XCodeTaskTargetChangedAction = ZCodeTaskTargetChangedAction;
export type XCodeTaskTargetChangedSource = ZCodeTaskTargetChangedSource;
export type XCodeTaskTokenUsageDelta = ZCodeTaskTokenUsageDelta;
export type XCodeTaskWarning = ZCodeTaskWarning;
export type XCodeTimelineMeta = ZCodeTimelineMeta;
export type XCodeTimelineStatus = ZCodeTimelineStatus;
export type XCodeTimelineTrigger = ZCodeTimelineTrigger;
export type XCodeTodoGroup = ZCodeTodoGroup;
export type XCodeToolCall = ZCodeToolCall;
export type XCodeToolCallUpdate = ZCodeToolCallUpdate;
export type XCodeTurnFileState = ZCodeTurnFileState;
export type XCodeTurnSteerCommandKind = ZCodeTurnSteerCommandKind;
export type XCodeTurnSteerQueued = ZCodeTurnSteerQueued;
export type XCodeTurnSteerSource = ZCodeTurnSteerSource;
export type XCodeTurnSteerStatus = ZCodeTurnSteerStatus;
export type XCodeUsage = ZCodeUsage;
export type XCodeUsageUpdate = ZCodeUsageUpdate;

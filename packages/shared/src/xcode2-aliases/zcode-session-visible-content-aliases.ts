// 自动生成：fork X 命名 → 1010 Z 命名兼容别名（勿手改）
import type {
  ZCodeGoalIterationCountTimelineItem,
} from "../zcode-session-visible-content.js";
import {
  getZCodeGoalActiveIterationCount,
  getZCodeGoalIterationByAssistantMessageId,
  getZCodeUserVisibleMessages,
  isZCodeCompactSummaryMessage,
  isZCodeGoalContinuationReminderMessage,
  isZCodeGoalContinuationReminderText,
  isZCodeGoalModelOnlyReminderMessage,
  isZCodeGoalStateReminderText,
  isZCodeModelOnlySyntheticUserMessage,
  resolveZCodeVisibleSessionTitle,
} from "../zcode-session-visible-content.js";

export const getXCodeGoalActiveIterationCount = getZCodeGoalActiveIterationCount;
export const getXCodeGoalIterationByAssistantMessageId = getZCodeGoalIterationByAssistantMessageId;
export const getXCodeUserVisibleMessages = getZCodeUserVisibleMessages;
export const isXCodeCompactSummaryMessage = isZCodeCompactSummaryMessage;
export const isXCodeGoalContinuationReminderMessage = isZCodeGoalContinuationReminderMessage;
export const isXCodeGoalContinuationReminderText = isZCodeGoalContinuationReminderText;
export const isXCodeGoalModelOnlyReminderMessage = isZCodeGoalModelOnlyReminderMessage;
export const isXCodeGoalStateReminderText = isZCodeGoalStateReminderText;
export const isXCodeModelOnlySyntheticUserMessage = isZCodeModelOnlySyntheticUserMessage;
export const resolveXCodeVisibleSessionTitle = resolveZCodeVisibleSessionTitle;
export type XCodeGoalIterationCountTimelineItem = ZCodeGoalIterationCountTimelineItem;

import type { FeedbackTicketEvent, FeedbackTicketStatus } from "@zcode/shared";
import {
  FEEDBACK_STATUS_MESSAGE_IDS,
  formatFeedbackStatusLabel,
} from "@/feedback/feedbackMeta.js";

type MessageFormatter = (
  descriptor: { id: string },
  values?: Record<string, string>,
) => string;

export function getUserFacingEventSummary(
  event: FeedbackTicketEvent,
  formatMessage?: MessageFormatter,
) {
  const normalizedSummary = event.summary.trim();
  // Bugfix: åç«¯äºä»¶æè¦ä¼æä¹åä¸ºä¸­æï¼åå°è±æååå²æ°æ®ä»ä¼åæ ·éåºã
  // è¿éä»ç¿»è¯å·²ç¥ç³»ç»æè¦ï¼ä¿çç¨æ·/è¿è¥æååå®¹ï¼é¿åè¯¯æ¹çå®åå¤ã
  const knownSummary = formatKnownSystemEventSummary(normalizedSummary, formatMessage);
  if (knownSummary) {
    return knownSummary;
  }
  // Bugfix: ç¨æ·ä¾§åªéè¦çè§£ãäº§åç»ç / ç åãä¸¤ä¸ªå¤çèº«ä»½ï¼ä¸è½æå·ä½å¼åå§åéåºã
  if (event.type === "assignee_changed" && /^å·²äº¤ç± .+ è·è¿$/.test(normalizedSummary)) {
    return formatOptionalMessage(
      formatMessage,
      "feedback.timeline.assignedToDev",
      "å·²äº¤ç±ç åè·è¿",
    );
  }
  return event.summary;
}

function formatKnownSystemEventSummary(
  summary: string,
  formatMessage?: MessageFormatter,
) {
  const directMessageId = getKnownSystemSummaryMessageId(summary);
  if (directMessageId) {
    return formatOptionalMessage(formatMessage, directMessageId, summary);
  }

  const statusChanged = summary.match(/^ç¶ææ´æ°ä¸ºã(.+)ã$/);
  if (statusChanged) {
    const status = toKnownFeedbackStatus(statusChanged[1]);
    if (!status) return summary;
    return formatOptionalMessage(
      formatMessage,
      "feedback.timeline.event.statusChanged",
      `ç¶ææ´æ°ä¸ºã${status}ã`,
      { status: formatStatusLabel(status, formatMessage) },
    );
  }

  const agentSubmitted = summary.match(/^(.+) éè¿ Agent æäº¤åé¦$/);
  if (agentSubmitted) {
    const name = agentSubmitted[1] ?? "";
    return formatOptionalMessage(
      formatMessage,
      "feedback.timeline.event.agentSubmitted",
      summary,
      { name },
    );
  }

  const progressWithStatus = summary.match(/^è¿åº¦æ´æ°ï¼ç¶æâ(.+)ï¼ï¼(.+)$/);
  if (progressWithStatus) {
    const status = toKnownFeedbackStatus(progressWithStatus[1]);
    const message = progressWithStatus[2] ?? "";
    if (!status) return formatProgressWithMessage(message, formatMessage);
    return formatOptionalMessage(
      formatMessage,
      "feedback.timeline.event.progressUpdatedWithStatus",
      summary,
      { status: formatStatusLabel(status, formatMessage), message },
    );
  }

  const progressWithMessage = summary.match(/^è¿åº¦æ´æ°ï¼(.+)$/);
  if (progressWithMessage) {
    return formatProgressWithMessage(progressWithMessage[1] ?? "", formatMessage);
  }

  const markedStatus = summary.match(/^æ è®°ä¸ºã(.+)ãï¼(.+)$/);
  if (markedStatus) {
    const status = toKnownFeedbackStatus(markedStatus[1]);
    const message = markedStatus[2] ?? "";
    if (!status) return summary;
    return formatOptionalMessage(
      formatMessage,
      "feedback.timeline.event.markedStatus",
      summary,
      { status: formatStatusLabel(status, formatMessage), message },
    );
  }

  return null;
}

function getKnownSystemSummaryMessageId(summary: string) {
  switch (summary) {
    case "åé¦å·²æäº¤":
      return "feedback.timeline.event.submitted";
    case "ä½ è¡¥åäºä¿¡æ¯":
      return "feedback.timeline.yourSupplement";
    case "å®æ¹åå¤":
      return "feedback.timeline.officialReply";
    case "å¤çè¿åº¦æ´æ°":
      return "feedback.timeline.event.progressUpdated";
    case "å¤çç»è®º":
      return "feedback.timeline.event.conclusion";
    case "å®æ´æ¥å¿å·²ä¸ä¼ ï¼åé¦è¿å¥å¾è¯ä¼°":
    case "å®æ´æ¥å¿å·²ä¸ä¼ ï¼åé¦è¿å¥å·²æäº¤":
      return "feedback.timeline.event.fullLogUploaded";
    default:
      return null;
  }
}

function formatProgressWithMessage(
  message: string,
  formatMessage?: MessageFormatter,
) {
  return formatOptionalMessage(
    formatMessage,
    "feedback.timeline.event.progressUpdatedWithMessage",
    `è¿åº¦æ´æ°ï¼${message}`,
    { message },
  );
}

function toKnownFeedbackStatus(value: string | undefined): FeedbackTicketStatus | null {
  if (!value) return null;
  return value in FEEDBACK_STATUS_MESSAGE_IDS ? (value as FeedbackTicketStatus) : null;
}

function formatStatusLabel(
  status: FeedbackTicketStatus,
  formatMessage?: MessageFormatter,
) {
  if (!formatMessage) return status;
  return formatFeedbackStatusLabel(status, formatMessage);
}

function formatOptionalMessage(
  formatMessage: MessageFormatter | undefined,
  id: string,
  fallback: string,
  values?: Record<string, string>,
) {
  return formatMessage ? formatMessage({ id }, values) : fallback;
}

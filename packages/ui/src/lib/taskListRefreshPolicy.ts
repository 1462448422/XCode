import type { XCodeWorkspaceTaskListChanged } from "@zcode/shared";

export type TaskListMembershipWorkspaceEventReason =
  | "task_archived"
  | "task_unarchived"
  | "task_pinned"
  | "task_unpinned";

export type TaskMetaWorkspaceEventSyncMode = "insert-active" | "preserve-membership";

const TASK_META_INCREMENTAL_REASONS = new Set<XCodeWorkspaceTaskListChanged["reason"]>([
  "user_message_saved",
  "assistant_message_saved",
  "task_status_changed",
  "task_meta_changed",
  // Bugfix: åæ¨¡åæ¯çº¯éç½®åæ´ï¼åªéæ meta å¢éååï¼model å­æ®µï¼ï¼
  // ç»ä¸è½è§¦åæ´è¡¨å·æ°æ membership éæââä¹åå®æ··å¨ task_meta_changed éï¼
  // æ¯æ¬¡åæ¨¡åé½ä¼è®©å·¦ä¾§ææåè¡¨ï¼è·¨ workspaceï¼éæå½å±å¹¶æ´ä½éåå¸ã
  "task_model_changed",
  // Bugfix: æ é¢åæ´ï¼é¦æ¡æ¶æ¯å title/èªå¨æ é¢/æå¨éå½åï¼ä¸å½å±æ å³ï¼
  // æ meta å¢éååå³å¯ï¼ä¸è§¦åæ´è¡¨å·æ°æ membership éæã
  "task_title_changed",
]);

const OPTIMISTIC_TASK_LIST_REASONS = new Set<XCodeWorkspaceTaskListChanged["reason"]>([
  "task_meta_changed",
  "task_model_changed",
  "task_title_changed",
  "auto_archive",
]);

const TASK_LIST_MEMBERSHIP_REASONS = new Set<XCodeWorkspaceTaskListChanged["reason"]>([
  "task_archived",
  "task_unarchived",
  "task_pinned",
  "task_unpinned",
]);

export function isTaskListMembershipWorkspaceEvent<
  T extends Pick<XCodeWorkspaceTaskListChanged, "reason">,
>(
  event: T,
): event is T & {
  reason: TaskListMembershipWorkspaceEventReason;
} {
  return TASK_LIST_MEMBERSHIP_REASONS.has(event.reason);
}

export function isTaskListDeletionWorkspaceEvent(
  event: Pick<XCodeWorkspaceTaskListChanged, "reason">,
): boolean {
  return event.reason === "task_deleted";
}

/**
 * ä¾§æ ä»¥ tasks-index è¡å pin/archive/unread å½å±ä¸ºåï¼sessions-index åªè¡¥ detailï¼
 * ç± membershipVersion é©±å¨éæãunreadï¼setTaskUnreadï¼ä¸ rename ç­èµ° task_meta_changedï¼
 * sessions-index ä¸æºå¸¦ unreadï¼æ task_meta_changed ä¹çº³å¥å½å±éæä¿¡å·ï¼ä½é¢ï¼ã
 * task_created ä¼å¢å  tasks-index çæ­£åè¡éåï¼å¿é¡»å¨ task row/grouped order æäº¤åæ¢ä»£è¯»åï¼
 * ä¸è½åªä¾èµ sessions-index detail ææ§ç query-cache å¢éæå¥ã
 * task_model_changedï¼åæ¨¡åï¼ä¸å½å±æ å³ï¼æ¾å¼æé¤ââä¹åå®æ··å¨ task_meta_changed
 * éï¼åä¸æ¬¡æ¨¡åä¼å¨å± bump membershipVersionï¼ææåè¡¨å®ä¾è¿å¸¦éæå½å±ã
 */
export function shouldRefetchTaskListMembershipForWorkspaceEvent(
  event: Pick<XCodeWorkspaceTaskListChanged, "reason">,
): boolean {
  // delete å sessions-index ä»å¯è½ç»§ç»­åå¸ä¿çå¨ CLI store ç sessionï¼
  // task_deleted å¿é¡»æ¢ä»£ deleted tombstone joinï¼ä¸è½åªåä¸æ¬¡ query cache ç§»é¤ã
  return (
    isTaskListMembershipWorkspaceEvent(event) ||
    // ä¾§æ æ¹ä¸º tasks-index row æå¨åï¼task_created ä¸ååªæ¯ session meta äºä»¶ã
    // è¥ä¸æ¢ä»£ membership/task-row Promiseï¼æ°è¡è½å·²è½ SQLiteï¼Project ä»ä¼æç»­æ¾ç¤ºæ§éåã
    event.reason === "task_created" ||
    event.reason === "task_meta_changed" ||
    event.reason === "task_deleted"
  );
}

export function shouldRefreshTaskListForWorkspaceEvent(
  event: Pick<XCodeWorkspaceTaskListChanged, "reason" | "taskId" | "taskMeta">,
): boolean {
  // Bugfix: åéãåæ­¢ãå½æ¡£ååæ°æ®ä¿å­å·²ç»éè¿ä¹è§ task cache / snapshot meta å¢éååã
  // å¦æè¿éç»§ç»­æ realtime invalidation å½ææ´è¡¨æ¥è¯¢ä¿¡å·ï¼å·¦ä¾§ task ä¼å¨è¿äºæä½æ¶éªä¸ä¸ã
  // ä½æ¶æ¯ä¿å­åç¶æåæ´äºä»¶åªæºå¸¦ taskId/reasonï¼ä¸æºå¸¦ææ° metaï¼è¿æ§ observer æ²¡ææ¬å°ä¹è§ç¶æï¼
  // å¿é¡»ä¿çéé»å·æ°æ¥åæ­¥ running/completed/errorï¼å¦åææºç«¯åéåæ¡é¢ä»»å¡åè¡¨ç¶æä¸ä¼æ´æ°ã
  if (getTaskMetaWorkspaceEventSyncMode(event)) {
    return false;
  }
  if (isTaskListMembershipWorkspaceEvent(event)) {
    // Bugfix: membership äºä»¶å¸¦ taskMeta æ¶ï¼UI å¯ä»¥æ ¹æ®å½åç¼å­ä½ç½®æ¨æ­æ§ membership å¹¶å¢éç§»å¨ã
    // åªææ§çæ¬/å¼å¸¸å¹¿æ­ç¼º meta æ¶ææ´è¡¨å·æ°ååºã
    return !event.taskMeta;
  }
  if (isTaskListDeletionWorkspaceEvent(event)) {
    // Bugfix: å é¤äºä»¶éå¸¸åªæ taskIdï¼æ æ³å¤æ­æå /åé¡µéèé¡¹åæ¬å±äº active/pinned/archived åªäºåè¡¨ã
    // è°ç¨æ¹ç¡®è®¤å½ä¸­å¯è§ç¼å­æ¶ä¼æåè·³è¿å·æ°ï¼å¦åå¿é¡»åå°æå¡ç«¯äºå®æºè¡¥é½ total/hasMoreã
    return true;
  }

  return !OPTIMISTIC_TASK_LIST_REASONS.has(event.reason);
}

export function getTaskMetaWorkspaceEventSyncMode(
  event: Pick<XCodeWorkspaceTaskListChanged, "reason" | "taskMeta">,
): TaskMetaWorkspaceEventSyncMode | null {
  if (!event.taskMeta) {
    return null;
  }
  if (event.reason === "task_created") {
    // Bugfix: ææº shared-host åå»º task æ¶ï¼æ¡é¢ renderer æ²¡ææ¬å°ä¹è§æå¥ã
    // task_created å¿é¡»ä½ä¸º active æååæ´æå¥ææå¹é query cacheï¼ä¸è½åªéæå·²å­å¨é¡¹ã
    return "insert-active";
  }
  if (TASK_META_INCREMENTAL_REASONS.has(event.reason)) {
    return "preserve-membership";
  }
  return null;
}

export function shouldApplyTaskMetaFromWorkspaceEvent(
  event: Pick<XCodeWorkspaceTaskListChanged, "reason" | "taskMeta">,
): event is Pick<XCodeWorkspaceTaskListChanged, "reason"> & {
  taskMeta: NonNullable<XCodeWorkspaceTaskListChanged["taskMeta"]>;
} {
  return Boolean(getTaskMetaWorkspaceEventSyncMode(event));
}

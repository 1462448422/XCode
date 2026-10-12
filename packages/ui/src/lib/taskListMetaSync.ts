import type { InputId, XCodeProvider, XCodeTaskMeta } from "@zcode/shared";
import { getTaskMeta, resolveWorkspaceStateKey, useXCodeSessionStore } from "@/store/zcodeSessionStore.js";
import {
  mergeTaskMetaCandidates,
  mergeTaskWithOptimisticMeta,
} from "@/lib/zcodeTaskMetaMerge.js";
import {
  applyTaskQueryCacheMutation,
  removeTaskFromTaskQueryCaches,
  updateTaskQueryCacheTaskMetaPreservingMembership,
  upsertTaskQueryCacheTaskMeta,
  useTaskQueryCacheStore,
  type TaskListMembershipState,
} from "@/store/taskQueryCacheStore.js";
import { buildTaskEntityKey, buildTaskWorkspaceKey } from "@/lib/taskQueryCache.js";

const ABSENT_MEMBERSHIP: TaskListMembershipState = {
  pinned: true,
  archived: true,
};

function inferTaskMembershipFromQueryCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
}): TaskListMembershipState | null {
  const entityKey = buildTaskEntityKey(params);
  const workspaceKey = buildTaskWorkspaceKey(params.workspacePath, params.workspaceIdentity);
  const { resultsByQueryKey } = useTaskQueryCacheStore.getState();
  let foundActive = false;
  let foundPinned = false;

  for (const result of Object.values(resultsByQueryKey)) {
    if (!result.taskKeys.includes(entityKey)) {
      continue;
    }
    if (!result.descriptor.workspaceKeys.includes(workspaceKey)) {
      continue;
    }
    if (result.descriptor.kind === "archived") {
      return { pinned: false, archived: true };
    }
    if (result.descriptor.kind === "pinned") {
      foundPinned = true;
      continue;
    }
    if (
      result.descriptor.kind === "workspace" ||
      result.descriptor.kind === "timeline" ||
      // Bugfix: active æ¯æç´¢/Command Center ä½¿ç¨çæ­£å¼ active åè¡¨ã
      // æ¼æå®ä¼æ active-only å¯è§ task æ¨æ­æ absentï¼ç½®é¡¶/å½æ¡£äºä»¶ä¼è¯¯å¢å totalã
      result.descriptor.kind === "active"
    ) {
      foundActive = true;
    }
  }

  if (foundPinned) {
    return { pinned: true, archived: false };
  }
  if (foundActive) {
    return { pinned: false, archived: false };
  }

  return null;
}

function membershipForWorkspaceEventReason(
  reason: "task_archived" | "task_unarchived" | "task_pinned" | "task_unpinned",
): TaskListMembershipState {
  switch (reason) {
    case "task_archived":
      return { pinned: false, archived: true };
    case "task_pinned":
      return { pinned: true, archived: false };
    case "task_unarchived":
    case "task_unpinned":
      return { pinned: false, archived: false };
  }
}

function sortTasksByUpdatedAt(tasks: readonly XCodeTaskMeta[]): XCodeTaskMeta[] {
  return [...tasks].sort((left, right) => {
    if (right.updatedAt !== left.updatedAt) {
      return right.updatedAt - left.updatedAt;
    }
    if (right.createdAt !== left.createdAt) {
      return right.createdAt - left.createdAt;
    }
    return right.taskId.localeCompare(left.taskId);
  });
}

export function syncTaskMetaToTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  task: XCodeTaskMeta;
  membership?: TaskListMembershipState;
  forceInsertMembership?: boolean;
  ensureInWorkspaceTaskCache?: boolean;
  preserveListMembership?: boolean;
  applyQueryCacheMutation?: boolean;
}): void {
  const store = useXCodeSessionStore.getState();
  const workspaceState = store.getWorkspaceState(params.workspacePath, params.workspaceIdentity);
  const previousTask = getTaskMeta(workspaceState, params.task.taskId);
  const queryTask = useTaskQueryCacheStore.getState().taskMetaByEntityKey[
    buildTaskEntityKey({
      taskId: params.task.taskId,
      workspacePath: params.workspacePath,
      workspaceIdentity: params.workspaceIdentity ?? params.task.workspaceIdentity,
    })
  ];
  // Bugfix: session/readSession å¿«ç§ç updatedAt å¯è½è½åäºé¦å prompt åå¥çåç«¯ä¹è§æ¶é´ã
  // åæ­¥å¿«ç§æ¶å¿é¡»ååæ¬å°å·²æ task meta åè°åå¹¶ï¼å¦åæ°å»ºä»»å¡ä¼å¨ sqlite é¦å±å·æ°åè·³åä¸é¢ã
  // Bugfix: éå¯æ¢å¤æ¶ workspace store å¯è½è¿æ²¡æå½å taskï¼ä½ query cache å·²ç»æ sqlite indexed metaã
  // raw session snapshot ä¸å¸¦ titleOverriddenï¼å¿é¡»ä¸èµ·åå¹¶ï¼é¿åæå¨éå½åæ é¢å¨ renderer è¢«è¿åã
  const task =
    mergeTaskMetaCandidates(params.task, previousTask, queryTask) ?? params.task;
  const cachedTasks = workspaceState.taskListCache ?? [];
  const hasCachedTask = cachedTasks.some((cachedTask) => cachedTask.taskId === task.taskId);
  const shouldExistInWorkspaceTaskCache =
    params.membership?.pinned === false && params.membership.archived === false;
  const nextCachedTasks = params.preserveListMembership
    ? cachedTasks.map((cachedTask) => (cachedTask.taskId === task.taskId ? task : cachedTask))
    : shouldExistInWorkspaceTaskCache
      ? sortTasksByUpdatedAt([
          task,
          ...cachedTasks.filter((cachedTask) => cachedTask.taskId !== task.taskId),
        ])
      : cachedTasks.filter((cachedTask) => cachedTask.taskId !== task.taskId);

  // Bugfix: ç»æ/åæ»ç±»æä½ä¹åç»ä¸ bump æ´ä¸ª taskListVersionï¼åªæ¯ä¸ºäºæææ° snapshot.meta
  // éæ°æååè¡¨ãè¿éæ¹ææ task å¢éåå taskListCacheï¼é¿åææ task åè¡¨æ´è½®éæ¥ã
  if (
    workspaceState.taskListCache !== null &&
    ((params.preserveListMembership && hasCachedTask) ||
      params.ensureInWorkspaceTaskCache ||
      hasCachedTask ||
      !shouldExistInWorkspaceTaskCache)
  ) {
    store.setTaskListCache(params.workspacePath, nextCachedTasks, params.workspaceIdentity);
  }

  // Bugfix: Header / å½åä¼è¯ä¿¡æ¯ä¼ä¼åæ¿ optimistic meta è¦çæ§ç¼å­ã
  // å¦æè¿éåªæ¹ query cacheï¼ä¸è¡¥ optimistic æ± ï¼å½åæ¿æ´» task ä»å¯è½ç»§ç»­æ¾ç¤ºæ§æ é¢/æ§æè¦ã
  store.upsertOptimisticTaskListItem(params.workspacePath, task, params.workspaceIdentity);
  upsertTaskQueryCacheTaskMeta(task);

  if (params.preserveListMembership) {
    updateTaskQueryCacheTaskMetaPreservingMembership(task);
  } else if (params.membership && params.applyQueryCacheMutation !== false) {
    // Bugfix: ææº shared-host åå»º task æ¶ï¼æ¡é¢ renderer åªæ¶å° workspace äºä»¶ï¼
    // æ²¡ææ¬å°é¦åè·¯å¾ç insertTaskIntoTaskCachesãpreviousTask ç¼ºå¤±æ¶ä»è¦æ active
    // æåå³ç³»æå¥ query cacheï¼å¦åè¿æ§é¦é¡µä¼ç»§ç»­åæ­¥æ§åè¡¨é¡ºåºã
    // Bugfix: æ¬å°é¦åä¼åå optimistic metaï¼åæå¥åè¡¨æåï¼æ­¤æ¶ previousTask è½ç¶å­å¨ï¼
    // ä½å®åªä»£è¡¨âå·²æåæ°æ®âï¼ä¸ä»£è¡¨âå·²ç»è®¡å¥åè¡¨ totalâãæ°å»ºä»»å¡å¿é¡»æ¾å¼æ absent -> active
    // å¤çï¼å¦åç¬¬ 6 ä¸ª workspace task ç total ä»åå¨ 5ï¼Show more ä¸ä¼åºç°ã
    applyTaskQueryCacheMutation({
      previousTask: previousTask ?? task,
      nextTask: task,
      previousState:
        previousTask && !params.forceInsertMembership
          ? params.membership
          : ABSENT_MEMBERSHIP,
      nextState: params.membership,
    });
  }
}

export function syncTaskMembershipEventToTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  task: XCodeTaskMeta;
  reason: "task_archived" | "task_unarchived" | "task_pinned" | "task_unpinned";
}): void {
  const previousMembership =
    inferTaskMembershipFromQueryCaches({
      workspacePath: params.workspacePath,
      workspaceIdentity: params.workspaceIdentity,
      taskId: params.task.taskId,
    }) ?? ABSENT_MEMBERSHIP;
  const nextMembership = membershipForWorkspaceEventReason(params.reason);

  // Bugfix: è¿æ§/å¶å®çªå£è§¦åå½æ¡£æç½®é¡¶æ¶ï¼æ¬çªå£æ²¡ææ¬å° optimistic mutationã
  // è¿å»åªè½å¤±ææ´è¡¨ query cacheï¼å¯¼è´ç¹å»ååè¡¨éªçï¼è¿éæ ¹æ®å½åç¼å­ä½ç½®æ¨æ­æ§ membership åå¢éç§»å¨ã
  syncTaskMetaToTaskCaches({
    workspacePath: params.workspacePath,
    workspaceIdentity: params.workspaceIdentity,
    task: params.task,
    membership: nextMembership,
    applyQueryCacheMutation: false,
  });
  applyTaskQueryCacheMutation({
    previousTask: params.task,
    nextTask: params.task,
    previousState: previousMembership,
    nextState: nextMembership,
  });
}

export function removeTaskFromTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
}): boolean {
  const store = useXCodeSessionStore.getState();
  const workspaceState = store.getWorkspaceState(params.workspacePath, params.workspaceIdentity);
  if (workspaceState.taskListCache) {
    store.setTaskListCache(
      params.workspacePath,
      workspaceState.taskListCache.filter((task) => task.taskId !== params.taskId),
      params.workspaceIdentity,
    );
  }
  store.removeTaskState(params.workspacePath, params.taskId, params.workspaceIdentity);
  return removeTaskFromTaskQueryCaches(params);
}

export function patchTaskMetaInTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
  patch: (task: XCodeTaskMeta) => Partial<XCodeTaskMeta>;
}): XCodeTaskMeta | null {
  const store = useXCodeSessionStore.getState();
  const workspaceState = store.getWorkspaceState(params.workspacePath, params.workspaceIdentity);
  const identityWorkspaceState = params.workspaceIdentity
    ? store.workspaces[resolveWorkspaceStateKey(params.workspacePath, params.workspaceIdentity)]
    : undefined;
  const taskCacheState = identityWorkspaceState ?? workspaceState;
  const currentTask =
    getTaskMeta(workspaceState, params.taskId) ??
    (identityWorkspaceState ? getTaskMeta(identityWorkspaceState, params.taskId) : null);
  if (!currentTask) {
    return null;
  }

  const patch = params.patch(currentTask);
  const shouldPreserveManualTitle =
    currentTask.titleOverridden === true &&
    patch.title !== undefined &&
    patch.title !== currentTask.title &&
    patch.titleOverridden !== false;
  const patchedTask = {
    ...currentTask,
    ...patch,
    // Bugfix: ç¨æ·æå¨éå½ååï¼è¿è¡ä¸­ç session_info_update ä»å¯è½å¸¦åèªå¨æ é¢ã
    // è¿äº patch åªè¯¥å·æ°è¿è¡æå­æ®µï¼ä¸è½æ titleOverridden çæå¨æ é¢ç­æå²æã
    title: shouldPreserveManualTitle ? currentTask.title : patch.title ?? currentTask.title,
    titleOverridden: patch.titleOverridden ?? currentTask.titleOverridden,
  };
  // Bugfix: session_info_update / snapshot patch å¯è½åªæ¯å¨è¡¥è¿è¡æï¼å´å¸¦å "New session" å ä½æ é¢ã
  // patch åååå½å meta åå¹¶ä¸æ¬¡ï¼ä¿ç status/target/updatedAt çåæ¶ï¼ä¸è®©å ä½æ é¢åè¿ task/query cacheã
  const nextTask = mergeTaskWithOptimisticMeta(patchedTask, currentTask);

  store.upsertOptimisticTaskListItem(params.workspacePath, nextTask, params.workspaceIdentity);
  if (taskCacheState.taskListCache) {
    store.setTaskListCache(
      params.workspacePath,
      taskCacheState.taskListCache.map((task) =>
        task.taskId === params.taskId ? nextTask : task,
      ),
      params.workspaceIdentity,
    );
  }
  // Bugfix: ææºç«¯ä»èå¤©é¡µè¿åä»»å¡åè¡¨æ¶ï¼è¿è¡å¼å§åªä¼ patch å½å task ç status/updatedAtã
  // å¦æ query cache åªæ¿æ¢ meta ä¸éæï¼ææ´æ°æ¶é´æåºçè¿æ§é¦é¡µä¼ç»§ç»­åå¨æ§é¡ºåºã
  updateTaskQueryCacheTaskMetaPreservingMembership(nextTask);

  return nextTask;
}

export function insertTaskIntoTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  task: XCodeTaskMeta;
  membership: TaskListMembershipState;
}): void {
  // Bugfix: æ°å»º/fork/è¿æ§ shared-host åå»º task é½åºèµ°åä¸æ¡âæ  -> æâæååæ´ã
  // syncTaskMetaToTaskCaches ä¼å¨ previousTask ç¼ºå¤±æ¶æ ABSENT_MEMBERSHIP æå¥ query cacheï¼
  // è¿éä¸è½åäºæ¬¡ apply mutationï¼å¦å total ä¼è¢«éå¤å ä¸ã
  syncTaskMetaToTaskCaches({
    workspacePath: params.workspacePath,
    workspaceIdentity: params.workspaceIdentity,
    task: params.task,
    membership: params.membership,
    forceInsertMembership: true,
    ensureInWorkspaceTaskCache:
      params.membership.pinned === false && params.membership.archived === false,
  });

}

export function initializeBackgroundTaskInTaskCaches(params: {
  workspacePath: string;
  workspaceIdentity?: string;
  task: XCodeTaskMeta;
  provider: XCodeProvider;
  activeInputId: InputId;
}): void {
  const store = useXCodeSessionStore.getState();
  const workspaceState = store.getWorkspaceState(params.workspacePath, params.workspaceIdentity);
  const previousTask = getTaskMeta(workspaceState, params.task.taskId);
  const task = previousTask
    ? mergeTaskWithOptimisticMeta(params.task, previousTask)
    : params.task;

  store.initializeBackgroundTaskRuntime(params.workspacePath, {
    workspaceIdentity: params.workspaceIdentity,
    task,
    provider: params.provider,
    activeInputId: params.activeInputId,
  });
  upsertTaskQueryCacheTaskMeta(task);
  // ä¿®å¤åå ï¼åå°é¦åä¸ååå optimistic å insert cacheï¼query cache ä»éæâæ  -> activeâ
  // æå¥æåï¼ä¿è¯ä¾§æ  total / show more ä¸æ®éé¦åä¸è´ã
  applyTaskQueryCacheMutation({
    previousTask: previousTask ?? task,
    nextTask: task,
    previousState: ABSENT_MEMBERSHIP,
    nextState: { pinned: false, archived: false },
  });
}

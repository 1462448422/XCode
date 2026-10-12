import type {
  XCodeTaskRuntimeStatus,
  XCodeTaskMeta,
  WebRemoteControlTaskDisplayStatus,
  WebRemoteControlTaskTarget,
  WebRemoteControlWorkspaceTarget,
} from "@zcode/shared";
import { resolveWebRemoteControlWorkspaceKey } from "@zcode/shared";
import { buildTaskWorkspaceKey } from "@/lib/taskQueryCache.js";
import { compareTaskListItemsWithRunningFirst } from "@/lib/taskListOrdering.js";
import { isLiveTaskRuntimeStatus } from "@/lib/taskRuntimeDisplayStatus.js";
import type { WorkspaceTabState } from "@/store/tabStore.js";
import {
  getTaskListRowActivity,
  type TaskListRowActivity,
} from "@/v4/taskListRowActivity.js";

export interface WebRemoteControlWorkspaceTaskGroup {
  workspaceKey: string;
  workspace: WebRemoteControlWorkspaceTarget;
  tasks: WebRemoteControlTaskTarget[];
  hasUnread: boolean;
  totalTaskCount?: number;
  collapsed?: boolean;
}

export type WebRemoteControlTaskIndexSortBy = "created" | "updated";
export type WebRemoteControlTaskIndexViewMode = "workspace" | "timeline" | "archived";

export interface WebRemoteControlTaskIndexModel {
  pinnedTasks: WebRemoteControlTaskTarget[];
  groups: WebRemoteControlWorkspaceTaskGroup[];
  timelineTasks: WebRemoteControlTaskTarget[];
  archivedTasks: WebRemoteControlTaskTarget[];
  totalTaskCount: number;
}

export interface WebRemoteControlTaskMembership {
  pinned: boolean;
  archived: boolean;
}

// è¿è¡å±æå = å¾æ å¨è½¬ï¼displayStatus runningï¼ææçåå°å·¥ä½ï¼ä¸æ¡é¢ isTaskListRowActive åä¹ã
// Bugfixï¼åå° workflow run åªæ¨è¿ updatedAtãä¸æ¹ displayStatusï¼åªçå¾æ ä¼è®©ä¸¤ä¸ªè· run ç
// ä¼è¯å¨ææºåè¡¨ééè¿åº¦äºä»¶äºæ¢ä½ç½®ã
const isWebRemoteControlTaskRunning = (task: WebRemoteControlTaskTarget): boolean =>
  task.displayStatus === "running" || task.hasBackgroundWork === true;

function isRemoteWebRemoteControlWorkspaceTarget(
  workspace: Pick<
    WebRemoteControlWorkspaceTarget,
    "kind" | "workspaceIdentity" | "remoteSessionId"
  >,
): boolean {
  return Boolean(
    workspace.kind === "remote" ||
      workspace.workspaceIdentity?.trim() ||
      workspace.remoteSessionId?.trim(),
  );
}

export function getWebRemoteControlTaskMutationWorkspaceTargets({
  activeWorkspaceIdentity,
  workspaces,
}: {
  activeWorkspaceIdentity?: string;
  workspaces: WebRemoteControlWorkspaceTarget[];
}): WebRemoteControlWorkspaceTarget[] {
  const activeBridgeIsRemote = Boolean(activeWorkspaceIdentity?.trim());
  if (!activeBridgeIsRemote) {
    return workspaces;
  }

  // Bugfix: Web remote ç baseServices ä»£è¡¨å½å bridge hostï¼å½å bridge æ¯è¿ç«¯æ¶ï¼
  // ä¸è½ææ¬å° workspace æ å°å°è¿ä¸ªè¿ç«¯ hostï¼å¦å hover æä½ä¼ææ¬å° task mutation åå°è¿ç«¯ sqliteã
  return workspaces.filter(isRemoteWebRemoteControlWorkspaceTarget);
}

export function shouldRetryWebRemoteControlTaskIndexLoad({
  activeTaskId,
  attempt,
  maxAttempts,
  taskCount,
}: {
  activeTaskId: string | null;
  attempt: number;
  maxAttempts: number;
  taskCount: number;
}): boolean {
  return Boolean(activeTaskId) && taskCount === 0 && attempt < maxAttempts;
}

type WebRemoteControlTaskRuntimeSnapshot = Partial<
  Record<string, { status: XCodeTaskRuntimeStatus } | undefined>
>;

type WebRemoteControlTaskRuntimeByWorkspaceKey = Partial<
  Record<string, WebRemoteControlTaskRuntimeSnapshot | undefined>
>;

export function buildWebRemoteControlTaskRuntimeByWorkspaceKey(
  workspaces: Record<
    string,
    { taskRuntimeByTaskId: WebRemoteControlTaskRuntimeSnapshot } | undefined
  >,
): WebRemoteControlTaskRuntimeByWorkspaceKey {
  return Object.fromEntries(
    Object.entries(workspaces).map(([workspaceKey, workspaceState]) => [
      workspaceKey,
      workspaceState?.taskRuntimeByTaskId,
    ]),
  );
}

function resolveWebRemoteControlActivityDisplayStatus(
  phase: TaskListRowActivity["phase"],
): WebRemoteControlTaskDisplayStatus | undefined {
  // Bugfixï¼sessions-index activity æ¯å½å phase çæå¨ï¼æ§ renderer runtime cache å¯è½å¨
  // ä»»æç¶æè¿ç§»åæ»çï¼å æ­¤ runningãcompletedãerror é½å¿é¡»åç±åä¸å®æ¶æ¥æºè£å³ã
  switch (phase) {
    case "prewarming":
    case "running":
      return "running";
    case "completedSuccess":
    case "completedInterrupted":
      return "completed";
    case "error":
      return "error";
    case "draft":
      return undefined;
  }

  const exhaustivePhase: never = phase;
  return exhaustivePhase;
}

function resolveWebRemoteControlTaskDisplayStatus({
  task,
  runtimeStatus,
}: {
  task: XCodeTaskMeta;
  runtimeStatus?: XCodeTaskRuntimeStatus;
}): WebRemoteControlTaskDisplayStatus {
  const activity = getTaskListRowActivity(task);
  if (activity) {
    const activityStatus = resolveWebRemoteControlActivityDisplayStatus(activity.phase);
    if (activityStatus) {
      return activityStatus;
    }
  }

  if (isLiveTaskRuntimeStatus(runtimeStatus)) {
    return "running";
  }

  if (runtimeStatus === "failed" || task.status === "error") {
    return "error";
  }

  if (runtimeStatus === "completed" || task.status === "completed") {
    return "completed";
  }

  // Bugfix: persisted status=running åªæ¯ä¸æ¬¡è½çæ¶æªæ¶å°¾ï¼ä¸è½è¯æå½å desktop host ä»å¨æ§è¡ã
  // ææºè¿æ§é¦é¡µåªéä¿¡æç¡® runtime è¿è¡æï¼é¿åæ° attach åæåå²æªå®æ task è¯¯æ¾ç¤ºä¸º runningã
  return "idle";
}

export function buildWebRemoteControlTaskTargets({
  workspaceTabs,
  tasks,
  taskRuntimeByWorkspaceKey = {},
  pinned = false,
  archived = false,
}: {
  workspaceTabs: WorkspaceTabState[];
  tasks: XCodeTaskMeta[];
  taskRuntimeByWorkspaceKey?: WebRemoteControlTaskRuntimeByWorkspaceKey;
  pinned?: boolean;
  archived?: boolean;
}): WebRemoteControlTaskTarget[] {
  const workspaceByKey = new Map(
    workspaceTabs.map((tab) => [
      buildTaskWorkspaceKey(tab.workspacePath, tab.workspaceIdentity),
      tab,
    ]),
  );

  return tasks
    .map((task): WebRemoteControlTaskTarget | null => {
      const workspaceKey = buildTaskWorkspaceKey(task.workspacePath, task.workspaceIdentity);
      const tab = workspaceByKey.get(workspaceKey);
      if (!tab) {
        return null;
      }

      const isRemote = Boolean(tab.workspaceIdentity || tab.remoteTarget || tab.remoteSessionId);
      const displayStatus = resolveWebRemoteControlTaskDisplayStatus({
        task,
        runtimeStatus: taskRuntimeByWorkspaceKey[workspaceKey]?.[task.taskId]?.status,
      });
      const activity = getTaskListRowActivity(task);
      const hasBackgroundWork = activity?.hasBackgroundWork === true;
      const workflowActivity = activity?.workflowActivity;

      return {
        taskId: task.taskId,
        title: task.title,
        workspacePath: task.workspacePath,
        ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
        ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
        workspaceLabel: tab.label,
        workspaceKind: isRemote ? "remote" : "local",
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        ...(task.provider ? { provider: task.provider } : {}),
        ...(typeof task.unreadAt === "number" ? { unreadAt: task.unreadAt } : {}),
        displayStatus,
        ...(hasBackgroundWork ? { hasBackgroundWork: true } : {}),
        ...(workflowActivity ? { workflowActivity } : {}),
        ...(pinned ? { pinned: true } : {}),
        ...(archived ? { archived: true } : {}),
      };
    })
    .filter((task): task is WebRemoteControlTaskTarget => Boolean(task))
    .sort(compareWebRemoteControlTasksByTime("updated"));
}

export function compareWebRemoteControlTasksByTime(sortBy: WebRemoteControlTaskIndexSortBy) {
  return (left: WebRemoteControlTaskTarget, right: WebRemoteControlTaskTarget): number => {
    return compareTaskListItemsWithRunningFirst(
      left,
      right,
      sortBy,
      isWebRemoteControlTaskRunning,
    );
  };
}

export function sortWebRemoteControlTasksByTime(
  tasks: readonly WebRemoteControlTaskTarget[],
  sortBy: WebRemoteControlTaskIndexSortBy,
): WebRemoteControlTaskTarget[] {
  return [...tasks].sort(compareWebRemoteControlTasksByTime(sortBy));
}

function isSameWebRemoteControlTaskTarget(
  left: Pick<WebRemoteControlTaskTarget, "taskId" | "workspacePath" | "workspaceIdentity">,
  right: Pick<WebRemoteControlTaskTarget, "taskId" | "workspacePath" | "workspaceIdentity">,
): boolean {
  return (
    left.taskId === right.taskId &&
    resolveWebRemoteControlWorkspaceKey(left) === resolveWebRemoteControlWorkspaceKey(right)
  );
}

export function applyWebRemoteControlTaskMembershipUpdate({
  result,
  target,
  membership,
}: {
  result: {
    workspaces: WebRemoteControlWorkspaceTarget[];
    tasks?: WebRemoteControlTaskTarget[];
    activeWorkspaceKey?: string;
    activeTaskId?: string;
  };
  target: WebRemoteControlTaskTarget;
  membership: WebRemoteControlTaskMembership;
}): typeof result {
  return {
    ...result,
    tasks: (result.tasks ?? []).map((task) => {
      if (!isSameWebRemoteControlTaskTarget(task, target)) {
        return task;
      }

      const nextTask = { ...task };
      delete nextTask.pinned;
      delete nextTask.archived;
      // Bugfix: å®½å±è¿æ§ hover å¨ä½åªæ´æ° membership æ è®°ï¼ä¸è½ä¸¢æ workspace identity / remoteSessionIdï¼
      // å¦åä¸ä¸æ¬¡è·¨ workspace æå¼ task ä¼å¤±å» shared-host bridge çèº«ä»½éç¦»ä¿¡æ¯ã
      return {
        ...nextTask,
        ...(membership.pinned ? { pinned: true } : {}),
        ...(membership.archived ? { archived: true } : {}),
      };
    }),
  };
}

export function groupWebRemoteControlTasksByWorkspace({
  workspaces,
  tasks,
  sortBy = "updated",
}: {
  workspaces: WebRemoteControlWorkspaceTarget[];
  tasks: WebRemoteControlTaskTarget[];
  sortBy?: WebRemoteControlTaskIndexSortBy;
}): WebRemoteControlWorkspaceTaskGroup[] {
  const groups = workspaces.map((workspace) => ({
    workspaceKey: resolveWebRemoteControlWorkspaceKey(workspace),
    workspace,
    tasks: [] as WebRemoteControlTaskTarget[],
    hasUnread: false,
  }));
  const groupByKey = new Map(groups.map((group) => [group.workspaceKey, group]));

  for (const task of tasks) {
    const group = groupByKey.get(resolveWebRemoteControlWorkspaceKey(task));
    if (!group) {
      continue;
    }
    group.tasks.push(task);
  }

  return groups.map((group) => ({
    ...group,
    tasks: sortWebRemoteControlTasksByTime(group.tasks, sortBy),
    hasUnread: group.tasks.some((task) => typeof task.unreadAt === "number"),
  }));
}

function matchesWebRemoteControlTaskSearch(
  task: WebRemoteControlTaskTarget,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return [
    task.title,
    task.workspaceLabel,
    task.workspacePath,
    task.workspaceIdentity ?? "",
    task.remoteSessionId ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalizedQuery);
}

function filterWebRemoteControlTasks(
  tasks: readonly WebRemoteControlTaskTarget[],
  searchQuery: string,
): WebRemoteControlTaskTarget[] {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [...tasks];
  }
  return tasks.filter((task) => matchesWebRemoteControlTaskSearch(task, normalizedQuery));
}

export function buildWebRemoteControlTaskIndexModel({
  result,
  viewMode,
  sortBy = "updated",
  searchQuery = "",
  collapsedWorkspaceKeys = new Set(),
}: {
  result: {
    workspaces: WebRemoteControlWorkspaceTarget[];
    tasks?: WebRemoteControlTaskTarget[];
  };
  viewMode: WebRemoteControlTaskIndexViewMode;
  sortBy?: WebRemoteControlTaskIndexSortBy;
  searchQuery?: string;
  collapsedWorkspaceKeys?: ReadonlySet<string>;
}): WebRemoteControlTaskIndexModel {
  const allTasks = result.tasks ?? [];
  // Bugfix: å®½å± Web è¿æ§å·¦æ ä¹åæ pinned / archived æ··è¿æ®é workspace åè¡¨ï¼
  // ä½çªå±è¿æ§å·²ç»æè¿äºæåææç¬ç«ååºãè¿éå¨åä¸äºå®æºä¸æåï¼é¿åå®½å±éå¤å±ç¤ºæè§å¾åæ¢ä¸¢æ°æ®ã
  const pinnedTasks = sortWebRemoteControlTasksByTime(
    filterWebRemoteControlTasks(
      allTasks.filter((task) => task.pinned && !task.archived),
      searchQuery,
    ),
    sortBy,
  );
  const regularTasks = filterWebRemoteControlTasks(
    allTasks.filter((task) => !task.pinned && !task.archived),
    searchQuery,
  );
  const archivedTasks = sortWebRemoteControlTasksByTime(
    filterWebRemoteControlTasks(
      allTasks.filter((task) => task.archived),
      searchQuery,
    ),
    sortBy,
  );
  const timelineTasks = sortWebRemoteControlTasksByTime(regularTasks, sortBy);
  const groups = groupWebRemoteControlTasksByWorkspace({
    workspaces: result.workspaces,
    tasks: regularTasks,
    sortBy,
  })
    .filter((group) => group.tasks.length > 0)
    .map((group) => {
      const collapsed = collapsedWorkspaceKeys.has(group.workspaceKey);
      return {
        ...group,
        totalTaskCount: group.tasks.length,
        collapsed,
        tasks: collapsed ? [] : group.tasks,
      };
    });

  return {
    pinnedTasks,
    groups,
    timelineTasks,
    archivedTasks,
    totalTaskCount:
      viewMode === "archived"
        ? archivedTasks.length
        : viewMode === "timeline"
          ? timelineTasks.length
          : groups.reduce((sum, group) => sum + (group.totalTaskCount ?? group.tasks.length), 0),
  };
}

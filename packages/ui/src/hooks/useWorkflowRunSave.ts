// å®æå¡ä¸ run ä¾§æ¿å±ç¨çãä¿å­ / åæ¬¡è¿è¡ãæ§å¶å¨ï¼docs/dynamic-workflow/transcript-and-notifications.md
// ãSaving the run, and running it againãï¼ã
//
// ä¸ä¸ª hook èä¸æ¯ä¸¤ä»½æ¥çº¿ï¼åä¸ä¸ª run å¨å¡ä¸ä¸ä¾§æ¿ä¸å¿é¡»è¯´åä¸å¥è¯ãèµ°åä¸æ¡å½ä»¤ãå®è´è´£
//   1. è¿æ¬¡ run å¯¹åºåªä¸ªå·²ä¿å­å·¥ä½æµï¼æ¨å¯¼ï¼ç¼å­å¨ workflowRunSavedStoreï¼ï¼
//   2. ãç´æ¥ä¿å­ã= `workflows/save`ï¼æ runId åèæ¬ï¼æ æ¨¡åååï¼ï¼
//   3. ãåæ¬¡è¿è¡ã= ä¸­æ¢é£å°å¯å¨å¨ï¼`useSavedWorkflowLauncher`ï¼ï¼å®ååè¿æ¬¡ run è·è¿çé£ä»½ã
// ãè®© XCode å¸®ææç¼ä¿å­ãä¸å¨è¿éï¼å®åªæ¯æä¸æ¡ç¨æ·æ¶æ¯äº¤åå®¿ä¸»ååºå»ï¼å¡å¨ä¼è¯éãä¾§æ¿å¨ç¶
// ä¼è¯éï¼ï¼å®¿ä¸»åæåçåéè·¯å¾ã
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  resolveWorkspaceKey,
  type XCodeSavedWorkflowEntry,
  type XCodeSavedWorkflowMeta,
  type XCodeSavedWorkflowScope,
  type XCodeWorkflowsForRunCandidate,
  type XCodeWorkflowsSaveResult,
} from "@zcode/shared";
import { useWorkspaceServicesResolution } from "@/hooks/useWorkspaceServices.js";
import {
  selectWorkflowRunSavedState,
  useWorkflowRunSavedStore,
  workflowRunSavedKey,
  type WorkflowRunSavedState,
} from "@/store/workflowRunSavedStore.js";
import {
  useSavedWorkflowLauncher,
  type SavedWorkflowLaunchError,
  type SavedWorkflowLaunchTarget,
} from "@/settings/saved-workflows/useSavedWorkflowLauncher.js";

export interface WorkflowRunSaveTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export interface WorkflowRunSaveHost extends WorkflowRunSaveTarget {
  runId: string;
  /** è½¬åèªå¯¹è¯çåéï¼`buildWorkflowSaveCandidatesByRunId`ï¼ã */
  candidates?: readonly XCodeWorkflowsForRunCandidate[];
  /** å¯å¨æåååå°æ°ä¼è¯ï¼ç¼ºå¸­å³å®¿ä¸»ä¸ä¼å¯¼èªï¼ææºè¿æ§é¦é¡µãéææ¸²æï¼ã */
  onNavigateToRun?: (target: SavedWorkflowLaunchTarget, sessionId: string) => void;
}

export interface WorkflowRunSaveSubmit {
  name: string;
  scope: XCodeSavedWorkflowScope;
  meta: XCodeSavedWorkflowMeta;
  overwrite?: boolean;
}

export interface WorkflowRunSaveController {
  /** è¿æ¬¡ run çå·²ä¿å­å·¥ä½æµï¼æ¨å¯¼ï¼ã`undefined` = è¿æ²¡æ¥åæ¥ã */
  saved: WorkflowRunSavedState | undefined;
  /** å·²ä¿å­çé£ä¸ä»½ï¼ç¼ºå¸­å³æ²¡æã */
  entry: XCodeSavedWorkflowEntry | undefined;
  /** è¿æ¬¡ run è·è¿çå®åï¼ç»ãåæ¬¡è¿è¡ãçå®åçªåé¢å¡«ã */
  runArgs: Record<string, unknown> | undefined;
  /** è agent æ²¡æ `workflows/save`ï¼å¼¹å±åªç XCode é£æ¡è·¯ã */
  directSaveUnsupported: boolean;
  /** è¿ç¨é¡¹ç®ä¸ç»å¨å±æ¡£ï¼`~` å¨ agent æºå¨ä¸ï¼ä¸­æ¢ä»ä¸è¯»å®ã */
  scopeLocked: boolean;
  saving: boolean;
  save: (input: WorkflowRunSaveSubmit) => Promise<XCodeWorkflowsSaveResult>;
  /** åå­æ¯å¦å·²è¢«å ç¨ï¼å¼¹å±è¾å¥æ¶çåç½®æ¢æµï¼ï¼æ¥ä¸å¨æ¶æãä¸å ç¨ãå¤çï¼æç»è£å³å¨ agentã */
  checkNameTaken: (name: string, scope: XCodeSavedWorkflowScope) => Promise<boolean>;
  launching: boolean;
  launchError: SavedWorkflowLaunchError | null;
  clearLaunchError: () => void;
  /** ãåæ¬¡è¿è¡ãï¼æ entry å¯å¨ï¼å®åç¼ºçç¨è¿æ¬¡ run è·è¿çé£ä»½ã */
  launch: (
    entry: XCodeSavedWorkflowEntry,
    args: Record<string, unknown>,
    target?: WorkflowRunSaveTarget,
  ) => Promise<{ ok: true } | { ok: false; error: SavedWorkflowLaunchError }>;
}

export function useWorkflowRunSave(host: WorkflowRunSaveHost): WorkflowRunSaveController {
  const { candidates, runId, onNavigateToRun } = host;
  const resolution = useWorkspaceServicesResolution(
    host.workspacePath,
    host.remoteSessionId ?? null,
    host.workspaceIdentity,
  );
  const { rpcReady, services } = resolution;
  const agentService = services.zcodeAgentService;
  const isRemote = resolution.isRemoteTarget;

  const target = useMemo<WorkflowRunSaveTarget>(
    () => ({
      workspacePath: host.workspacePath,
      ...(host.workspaceIdentity ? { workspaceIdentity: host.workspaceIdentity } : {}),
      ...(resolution.remoteSessionId ? { remoteSessionId: resolution.remoteSessionId } : {}),
    }),
    [host.workspacePath, host.workspaceIdentity, resolution.remoteSessionId],
  );
  const workspaceKey = useMemo(
    () =>
      resolveWorkspaceKey({
        workspacePath: host.workspacePath,
        ...(host.workspaceIdentity ? { workspaceIdentity: host.workspaceIdentity } : {}),
      }),
    [host.workspacePath, host.workspaceIdentity],
  );
  const key = useMemo(
    () => workflowRunSavedKey(workspaceKey, runId, candidates),
    [candidates, runId, workspaceKey],
  );

  const generation = useWorkflowRunSavedStore((state) => state.generation);
  const load = useWorkflowRunSavedStore((state) => state.load);
  const applySaved = useWorkflowRunSavedStore((state) => state.applySaved);
  const saved = useWorkflowRunSavedStore((state) => selectWorkflowRunSavedState(state, key));

  useEffect(() => {
    if (!rpcReady) return;
    // `generation` å¨ä¾èµéï¼ä¸æ¬¡ä½åºè®©ææå¨åºçå¡çéæ¥ï¼ä¿å­ãå é¤ãä¸­æ¢å·æ°é½ä¼ä½åºï¼ã
    void generation;
    void load(key, () =>
      agentService.findSavedWorkflowForRun({
        ...target,
        runId,
        ...(candidates === undefined || candidates.length === 0 ? {} : { candidates }),
      }),
    );
  }, [agentService, candidates, generation, key, load, rpcReady, runId, target]);

  const [saving, setSaving] = useState(false);
  const save = useCallback(
    async (input: WorkflowRunSaveSubmit) => {
      setSaving(true);
      try {
        const result = await agentService.saveSavedWorkflowFromRun({
          ...target,
          runId,
          name: input.name,
          meta: input.meta,
          scope: input.scope,
          ...(input.overwrite === undefined ? {} : { overwrite: input.overwrite }),
        });
        if (result.ok) {
          // ååæçé£ä¸ä»½ç«å»æä¸å»ï¼å¡çç¿»æãå·²ä¿å­ / åæ¬¡è¿è¡ãï¼ï¼åæ¶ä½åºå«çå¡çç­æ¡ã
          applySaved(key, {
            name: result.name,
            description: input.meta.description,
            ...(input.meta.whenToUse === undefined ? {} : { whenToUse: input.meta.whenToUse }),
            ...(input.meta.args === undefined ? {} : { args: input.meta.args }),
            scope: result.scope,
            path: result.path,
          });
        }
        return result;
      } finally {
        setSaving(false);
      }
    },
    [agentService, applySaved, key, runId, target],
  );

  const checkNameTaken = useCallback(
    async (name: string, scope: XCodeSavedWorkflowScope) => {
      try {
        const result = await agentService.getSavedWorkflow({ ...target, name, scope });
        return result.ok;
      } catch {
        // æ¢æµå¤±è´¥ä¸è¯¥æ¡ä½ä¿å­ï¼agent ä»ä¼ç¨ `target_exists` ç»åºæç»ç­æ¡ã
        return false;
      }
    },
    [agentService, target],
  );

  const launcher = useSavedWorkflowLauncher({
    agentService,
    ...(onNavigateToRun === undefined ? {} : { onNavigate: onNavigateToRun }),
  });
  const launch = useCallback(
    async (
      entry: XCodeSavedWorkflowEntry,
      args: Record<string, unknown>,
      launchTarget?: WorkflowRunSaveTarget,
    ) => {
      const destination = launchTarget ?? target;
      const result = await launcher.launch(
        {
          workspacePath: destination.workspacePath,
          ...(destination.workspaceIdentity
            ? { workspaceIdentity: destination.workspaceIdentity }
            : {}),
          ...(destination.remoteSessionId ? { remoteSessionId: destination.remoteSessionId } : {}),
        },
        { name: entry.name, scope: entry.scope, args },
      );
      return result.ok ? { ok: true as const } : { ok: false as const, error: result.error };
    },
    [launcher, target],
  );

  return {
    saved,
    entry: saved?.entry,
    runArgs: saved?.runArgs,
    directSaveUnsupported: saved?.status === "unsupported",
    scopeLocked: isRemote,
    saving,
    save,
    checkNameTaken,
    launching: launcher.pending,
    launchError: launcher.error,
    clearLaunchError: launcher.clearError,
    launch,
  };
}

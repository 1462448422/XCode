import { workflowRunStepCounts, type WorkflowRunState } from "@zcode/shared/zcode-protocol-v4";
import type { ConversationRow } from "@zcode/shared/zcode-protocol-v4";
import {
  ZCODE_WORKFLOWS_FOR_RUN_MAX_CANDIDATES,
  type XCodeWorkflowsForRunCandidate,
} from "@zcode/shared";
import type { WorkflowCausalityGraphData } from "@/components/workflow-graph/types.js";
import type { WorkflowRunCardSummary } from "@/ToolCallBlocks/shared.js";
import { readWorkflowHoleTarget } from "@/ToolCallBlocks/renderers/createWorkflowHoleInput.js";
import { isFillWorkflowHoleToolCall } from "@/lib/workflowToolNames.js";

/**
 * å·¥å·å¡ â dwf run çèæ¥ï¼docs/dynamic-workflow/presentation.mdãThe tool rowãï¼ã
 *
 * æå¨æ¥æºæ¯ `workflowRuns` æå½±éæ¯æ¡ run ç `toolCallId`ï¼schema æ³¨éå°±åçå®æ¯
 * ãå·¥å·å¡ â è¯¦æé¡µçå³èé®ãï¼ï¼å·¥å·è¡èªå·±ç output å¨ v4 ä¸åªå©
 * `formatCreateWorkflowModelContent` æåºçé£å¥æ£æï¼`status` / `backgroundTaskId`
 * è¿äºç»æåå­æ®µæ ¹æ¬ä¸å¨è¡ä¸ã
 *
 * æ¯çº¯å½æ°èä¸æ¯ç»ä»¶éçä¸æ®µ `useMemo`ï¼è®¡æ°è¯­ä¹ï¼settled vs observedï¼æ¯è¿éå¯ä¸
 * å¼å¾ç©·ä¸¾çè§åï¼èç©·ä¸¾ä¸ä¸ª Map ä¸éè¦æ¸²æä»»ä½ä¸è¥¿ã
 */
export function buildWorkflowRunByToolCallId(
  runs: readonly WorkflowRunState[] | undefined,
): ReadonlyMap<string, WorkflowRunCardSummary> {
  const byToolCallId = new Map<string, WorkflowRunCardSummary>();
  for (const run of runs ?? []) {
    // æ²¡æ toolCallId ç run æ²¡æå¯ç¹çå¡çï¼ä¸è¿è¡¨ã
    if (!run.toolCallId) continue;
    const { settled, total } = workflowRunStepCounts(run);
    byToolCallId.set(run.toolCallId, {
      runId: run.runId,
      status: run.status,
      ...(run.stopReason === undefined ? {} : { stopReason: run.stopReason }),
      nodesSettled: settled,
      // å·²æç¨ï¼observedï¼èä¸æ¯å¨ç¨æ»æ°ï¼å¨æå·¥ä½æµçèç¹æ°ç±èæ¬å¨è¿è¡æ¶å³å®ã
      nodesTotal: total,
      agents: run.actors.length,
      // æ´»æå½±æ´æ¡å¸¦ä¸ï¼å¡çåèçæ¶é´çº¿è¦ç¯ãè¯ä¸¸ä¸å¢¨è¿¹ã
      run,
      // å¯æ¢å¤æ§æ¯ç¶æä½ï¼CLI å¨ run-settled è½½è·ä¸æ resume é¨è£å®ï¼reducer æ¬è¿ï¼ï¼UI ä¸æ¨å¯¼ã
      ...(run.resumable === true ? { resumable: true as const } : {}),
    });
  }
  return byToolCallId;
}

/**
 * runId é®çèæ¥è¡¨ï¼run æç´§åå¯ç¹å¡ï¼ã
 *
 * ResumeWorkflowRun çå·¥å·è¡æ toolCallId **æ°¸è¿æ¥ä¸å°** runââæå½±é run.toolCallId è·¨
 * resume æ²¿ç¨åå§ CreateWorkflow è¡ï¼ãè¯¦æé¡µ join ä¸æ­é¾ãçå»æè¯­ä¹ï¼å¿æ¹ï¼ï¼è resume è¡
 * ç display è½½è·å¸¦ç runIdï¼â¡ backgroundTaskId â¡ workIdï¼ï¼æ runId èæ¥åä¸ä»½æå½±å³å¯ã
 * ä¾§æ  run tab çèº«ä»½ä¹æ¯ runId é®ï¼ä» resume è¡æåå§ create è¡æå¼å½ä¸­åä¸ä¸ª tabã
 */
export function buildWorkflowRunByRunId(
  runs: readonly WorkflowRunState[] | undefined,
): ReadonlyMap<string, WorkflowRunCardSummary> {
  const byRunId = new Map<string, WorkflowRunCardSummary>();
  for (const run of runs ?? []) {
    const { settled, total } = workflowRunStepCounts(run);
    byRunId.set(run.runId, {
      runId: run.runId,
      status: run.status,
      ...(run.stopReason === undefined ? {} : { stopReason: run.stopReason }),
      nodesSettled: settled,
      nodesTotal: total,
      agents: run.actors.length,
      run,
      ...(run.resumable === true ? { resumable: true as const } : {}),
      // æå¼è¯·æ±çå³èé®ï¼WorkflowRunSidePane æ¿å®æ¾ CreateWorkflow åèµ·è¡ï¼å¾ä¸èæ¬
      // é½å¨é£æ¡è¡ä¸ï¼ãresume è¡èªå·±ç id ä¸è½ç¨ââå®ç display éæ²¡æå¾ã
      ...(run.toolCallId ? { toolCallId: run.toolCallId } : {}),
    });
  }
  return byRunId;
}

/**
 * æå¼ä¾§æ  run è§å¾æ¶è¯·æ±éç `toolCallId` è¯¥å¡«è°ãä¸æ¯ãç¹ä¸­çé£ä¸è¡ãï¼èæ¯**åèµ· run ç
 * CreateWorkflow è¡**ââ`WorkflowRunSidePane` ç¨å®å»è¡çªå£æ¾åèµ·è¡ï¼causalityGraph ä¸èæ¬
 * åææå¨é£æ¡è¡ç display/å¥åä¸ï¼resume è¡ç display éæ²¡æå¾ï¼å¡«å®èªå·±ä¼è®©è¯¦æé¡µè½
 * ãå¯è§åå²éæ²¡æè¿å¼ å·¥ä½æµå¾ãï¼ãèæ¥æè¦å¸¦æå½±ç `toolCallId` æ¶æç¨æå½±å¼ï¼ç¼ºå¸­
 * åè½ç¹ä¸­è¡ç idââcreate è¡ç¹å¼æ¶ä¸¤èæ¬å°±ç¸ç­ã
 *
 * é¡ºå¸¦æ¡ä½è¦çæ±¡æï¼`openWorkflowRunSidePane` å¯¹å·²å­å¨ tab å `{...existing, ...nextTab}`
 * åå¹¶ï¼è¯·æ±éè¥å¸¦é id ä¼æåæ¬æ­£å¸¸ç tab ä¹ååã
 */
export function resolveWorkflowRunOpenToolCallId(
  rowToolCallId: string,
  workflowRun: WorkflowRunCardSummary | undefined,
): string {
  return workflowRun?.toolCallId ?? rowToolCallId;
}

/**
 * runId â è¯¥ run å½ååé©»ç qid éåãWorkflow éç¥ manifest ç WaitingâAnswered ç¿»è½¬çå¯ä¸æ°æ®æºã
 *
 * é®å¨åº âº run å¨æå½±éï¼å·åæ¾åç»æ run ç pendingQuestions å·²è¢« reducer ç run-settled æ¸ç©ºï¼ï¼å¼æ¯ä¸ä¸ª Setï¼å¯è½ä¸ºç©º = å·²ç­å®æå
 * ä¸ä¸ªï¼ï¼ç¼ºé® = run ä¸å¨åºï¼è¢« 8 æ¡ä¸éæ·æ±°ï¼ä¸­æ§ Questionï¼ã
 *
 * pendingQuestions é¶æ¡æ¶æ´ä¸ªé®ç¼ºå¸­ï¼workflow-runs schema çæ¢ææ¯ä¾ï¼ï¼åç¼©æç©º Setã
 */
export function buildWorkflowRunPendingQuestionsByRunId(
  runs: readonly WorkflowRunState[] | undefined,
): ReadonlyMap<string, ReadonlySet<string>> {
  const byRunId = new Map<string, ReadonlySet<string>>();
  for (const run of runs ?? []) {
    byRunId.set(run.runId, new Set((run.pendingQuestions ?? []).map((question) => question.qid)));
  }
  return byRunId;
}

/**
 * ä¸è¡ä¸æççãåèµ·å¾ãï¼å¾æ¯ **run** çå±æ§ï¼
 * æåèµ·è¯¥ run ç toolCallId æ¾ï¼ä¸é®å®æå¨åªç§è¡ä¸ââ
 * - CreateWorkflow å·¥å·è¡ï¼`display.kind === "create_workflow"` ç `causalityGraph`ï¼
 * - ä¸­æ¢ç´æ¥å¯å¨æ²¡æå·¥å·è¡ï¼å¾æå¨å¯å¨è½® turnHeader / userInput è¡
 *   ç `workflowLaunch` åæ°æ®ä¸ï¼åä¸ä¸ª toolCallIdãåä¸ä¸ª display schemaï¼ã
 *
 * ç©ºå¾ï¼èæ¬éä¸æ¬¡ ask / files.* é½æ²¡æï¼ä¸å¼å¾ä¸æ¡ç©ºè½¨éï¼æãæ å¾ãå¤çï¼ä¸å·¥å·å¡åä¸æ¡å¤å®ã
 */
function workflowGraphOfRow(
  row: ConversationRow,
): { toolCallId: string; graph: WorkflowCausalityGraphData } | undefined {
  if (row.kind === "toolCall") {
    const display = row.display;
    if (display?.kind !== "create_workflow") return undefined;
    const graph = display.causalityGraph;
    return graph !== undefined && graph.steps.length > 0
      ? { toolCallId: row.toolCallId, graph }
      : undefined;
  }
  if (row.kind === "turnHeader" || row.kind === "userInput") {
    const launch = row.workflowLaunch;
    const display = launch?.display;
    if (launch === undefined || display?.kind !== "create_workflow") return undefined;
    const graph = display.causalityGraph;
    return graph !== undefined && graph.steps.length > 0
      ? { toolCallId: launch.toolCallId, graph }
      : undefined;
  }
  return undefined;
}

/**
 * åèµ· toolCallId â å¾çèæ¥è¡¨ï¼è¡çªå£ä¸éå»ºæãè½®å°¾ run å¡ï¼ä¸ç§æ¥æºï¼CreateWorkflow è¡ã
 * ResumeWorkflowRun è¡ãç´æ¥å¯å¨è½®ï¼ä¸ run è¯¦æ / èæ¬ transcript ä¾§æ¿é½ä»è¿ä¸å¼ è¡¨åå¾ââ
 * ãå¾æåèµ· toolCallId æ¾ãåªæè¿ä¸å¤å®ç°ãè¡çªå£æ¯æççï¼èå¯¹è¯éç¿»ä¸å°åèµ·è¡æ¯æ­£å¸¸æåµï¼
 * ä¸æ¯éè¯¯ï¼æ­¤æ¶æ²¡æå¾å¯ç»ï¼å¡çéæåè¡è¡¨å¤´ãä¾§æ¿å¿µä¸å¥ãå¾ä¸å¯ç¨ãã
 */
export function buildWorkflowGraphByToolCallId(
  rows: readonly ConversationRow[] | undefined,
): ReadonlyMap<string, WorkflowCausalityGraphData> {
  const byToolCallId = new Map<string, WorkflowCausalityGraphData>();
  for (const row of rows ?? []) {
    const found = workflowGraphOfRow(row);
    // å¯å¨è½®ç turnHeader ä¸ userInput åå¸¦ä¸ä»½åæ ·çåæ°æ®ï¼é¦è§å³å®ã
    if (found !== undefined && !byToolCallId.has(found.toolCallId)) {
      byToolCallId.set(found.toolCallId, found.graph);
    }
  }
  return byToolCallId;
}

/**
 * runId â ææ°ä¸æ¬¡æåè¡¥å¨ç displayï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãç
 * ãThe modelãï¼ï¼`FillWorkflowHole` è¡çè¾åºæ¯ `CreateWorkflowOutput`ï¼å®ç `causalityGraph` æ¯**ææèæ¬**
 * çå¾ââçç½çä½å·²ç»ç«å¨çç½çä½ç½®ä¸ãå¡ä¸ä¾§æ¿åãrun id æ¯èªå·±çãææ°çé£ä»½ displayãï¼è¡¥å¨ä¹åæ¯
 * è¡¥å¨è¡çï¼ä¹åæ¯åèµ·è¡çãè¡çªå£æåºä¸éï¼åæ¥çè¦çåæ¥çï¼åªè®¤æåä¸ç¼è¿çè¡ï¼ç¼ä¸è¿çè¡¥å¨ä»ä¹
 * é½æ²¡æ¥è¿ runï¼å®çå¾ä¸æ¯è¿æ¡ run çï¼ãåå­ä» display ç `fill` åå¸¦åºï¼è¡¥å¨åççç½å¨å¾ä¸æ²¡æè½ç¹ï¼
 * è¡çå¥åéæ²¡æåå­ââtranscript åªå­æ¨¡åèªå·±çå¥åï¼ï¼ç±»åä¸ä¸çé¢ã
 */
export interface WorkflowFillGraph {
  graph: WorkflowCausalityGraphData;
  holeLabels: ReadonlyMap<string, { name: string }>;
}

function readFillRow(
  row: ConversationRow,
): { runId: string; holeId: string; name?: string; graph: WorkflowCausalityGraphData } | undefined {
  if (row.kind !== "toolCall" || row.status !== "success") return undefined;
  if (!isFillWorkflowHoleToolCall(row)) return undefined;
  const display = row.display;
  if (display?.kind !== "create_workflow" || display.ok !== true) return undefined;
  const graph = display.causalityGraph;
  if (graph === undefined || graph.steps.length === 0) return undefined;
  const target = readWorkflowHoleTarget(row.input, display.fill);
  if (target?.runId === undefined || target.holeId === undefined) return undefined;
  return {
    runId: target.runId,
    holeId: target.holeId,
    ...(target.name === undefined ? {} : { name: target.name }),
    graph,
  };
}

export function buildWorkflowFillGraphByRunId(
  rows: readonly ConversationRow[] | undefined,
): ReadonlyMap<string, WorkflowFillGraph> {
  const byRunId = new Map<string, WorkflowFillGraph>();
  for (const row of rows ?? []) {
    const fill = readFillRow(row);
    if (fill === undefined) continue;
    // åå­è·¨è¡¥å¨ç´¯ç§¯ï¼ç¬¬äºæ¬¡è¡¥å¨çå¾ä¸ä»æç¬¬ä¸æ¬¡çå¤´ï¼å®çåå­åªå¨ç¬¬ä¸è¡çå¥åéã
    const labels = new Map(byRunId.get(fill.runId)?.holeLabels ?? []);
    if (fill.name !== undefined) labels.set(fill.holeId, { name: fill.name });
    byRunId.set(fill.runId, { graph: fill.graph, holeLabels: labels });
  }
  return byRunId;
}

/** å¡ä¸ä¾§æ¿åå¾çå¯ä¸å¥å£ï¼è¡¥å¨è¿å°±æ¯è¡¥å¨è¡çå¾ï¼å¦åæåèµ· toolCallIdï¼å«ãéç½®ãçåå¾è§åï¼ã */
export function resolveWorkflowRunGraphForRun(
  graphs: ReadonlyMap<string, WorkflowCausalityGraphData>,
  fills: ReadonlyMap<string, WorkflowFillGraph> | undefined,
  toolCallId: string | undefined,
  runId: string | undefined,
  runs: readonly WorkflowRunState[] | undefined,
): WorkflowCausalityGraphData | undefined {
  const fill = runId === undefined ? undefined : fills?.get(runId);
  if (fill !== undefined) return fill.graph;
  return toolCallId === undefined ? undefined : resolveWorkflowRunGraph(graphs, toolCallId, runs);
}

/** ãéç½®ãä¿®è®¢åºæ¥ç run çåèµ· toolCallId åç¼ï¼agent é¸ `settings-<uuid>`ï¼docs/dynamic-workflow/launch.mdï¼ã */
export const WORKFLOW_SETTINGS_TOOL_CALL_PREFIX = "settings-";

/**
 * æåèµ· toolCallId åå¾ï¼å¤å å¯ä¸ä¸æ¡åå¾è§åï¼
 * ãéç½®ãä¿®è®¢åºæ¥ç runï¼`settings-â¦`ï¼å¨å®çè®¾ç½®è½®è½å°ä¹åââä¸»ä»£çæ­£å¨ä¸è½®å¯¹è¯éï¼è®¾ç½®è½®è¦ç­é£ä¸è½®
 * ç»æââè¡çªå£éè¿æ²¡æå®çå¾ï¼æ­¤æ¶ç» `resumedFrom` ååé©±çå¾ï¼å®çèæ¬ææé å°±æ¯åé©±é£ä¸ä»½ã
 * å¶ä» run ä¸æ¦ä¸åââæ¹è¿çèæ¬ç»çæ¯å¦ä¸å¼ å¾ãåé©±èªå·±ä¹å¯è½æ¯ä¸æ¬¡ãéç½®ãï¼æä»¥æ²¿é¾ä¸æº¯ï¼å¸¦ç¯ä¿æ¤ã
 */
export function resolveWorkflowRunGraph(
  graphs: ReadonlyMap<string, WorkflowCausalityGraphData>,
  toolCallId: string,
  runs: readonly WorkflowRunState[] | undefined,
): WorkflowCausalityGraphData | undefined {
  const visited = new Set<string>();
  let current: string | undefined = toolCallId;
  while (current !== undefined && !visited.has(current)) {
    visited.add(current);
    const graph = graphs.get(current);
    if (graph !== undefined) return graph;
    if (!current.startsWith(WORKFLOW_SETTINGS_TOOL_CALL_PREFIX)) return undefined;
    const settingsToolCallId: string = current;
    const run: WorkflowRunState | undefined = runs?.find(
      (candidate) => candidate.toolCallId === settingsToolCallId,
    );
    const predecessorId: string | undefined = run?.resumedFrom;
    current =
      predecessorId === undefined
        ? undefined
        : runs?.find((candidate) => candidate.runId === predecessorId)?.toolCallId;
  }
  return undefined;
}

/**
 * ãæ¨¡åæè¿æ¬¡ run å­æäºåªä¸ªå·¥ä½æµãçè½¬åï¼docs/dynamic-workflow/transcript-and-notifications.md
 * ãWhich workflow a run is saved asãï¼ï¼è¡çªå£éæåç `SaveWorkflow` è¡ï¼æå®å¥åè®¤é¢ç
 * `run_id` å½å°é£æ¡ run åä¸ã
 *
 * è¿æ¯**åé**èä¸æ¯ç»è®ºï¼è¡åªè¯´ãæ¨¡åå½æ¶å­äºè¿ä¸ªåå­ãï¼æä»¶è¿å¨ä¸å¨ãæ¯ä¸æ¯é£ä¸ä»½ï¼ç±
 * agent ä¾§ç `workflows/forRun` åè§£æä¸éãæä»¥è¿éä¸è¯» outputï¼ä¹ä¸å¤æ­æè´¥ä¹å¤çä»»ä½ä¸è¥¿ââ
 * `status === "success"` ä¹å¤çè¡ï¼ç¼è¯å¤±è´¥ãè¢«æãè¿å¨æµå¼ï¼æ¬æ¥å°±æ²¡æåææä»¶ã
 *
 * ä¸å¶ä»èæ¥åä¸æ¡çºªå¾ï¼çº¯å½æ°ãä¸éè¡çªå£ãèº«ä»½åªè®¤å¥åééï¼display ä¸æ²¡æè¿ä»¶äºï¼ã
 */
export type WorkflowSaveCandidate = XCodeWorkflowsForRunCandidate;

function readWorkflowSaveCandidate(
  row: ConversationRow,
): { runId: string; candidate: WorkflowSaveCandidate } | undefined {
  if (row.kind !== "toolCall" || row.toolName !== "SaveWorkflow" || row.status !== "success") {
    return undefined;
  }
  const input = row.input;
  if (typeof input !== "object" || input === null) return undefined;
  const record = input as Record<string, unknown>;
  const runId = typeof record.run_id === "string" ? record.run_id.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (runId.length === 0 || name.length === 0) return undefined;
  const scope = record.scope === "global" || record.scope === "project" ? record.scope : undefined;
  return { runId, candidate: { name, ...(scope === undefined ? {} : { scope }) } };
}

export function buildWorkflowSaveCandidatesByRunId(
  rows: readonly ConversationRow[] | undefined,
): ReadonlyMap<string, readonly WorkflowSaveCandidate[]> {
  const byRunId = new Map<string, WorkflowSaveCandidate[]>();
  for (const row of rows ?? []) {
    const found = readWorkflowSaveCandidate(row);
    if (found === undefined) continue;
    const list = byRunId.get(found.runId) ?? [];
    // ååéå­ï¼æ¹äºåæ°æ®åå­ä¸æ¬¡ï¼åªçä¸ä¸ªåéï¼è§£æä¸éä¸è§£æä¸éç­æ¡ç¸åã
    if (list.some((entry) => entry.name === found.candidate.name)) continue;
    // åè®®çåéä¸çå¨è¿éå°±å®ä½ï¼è¶åºé¨åçææ©çé£å ä¸ªï¼åå­ä¸çé£ä»½æ´å¯è½è¿å¨ï¼ã
    if (list.length >= ZCODE_WORKFLOWS_FOR_RUN_MAX_CANDIDATES) continue;
    list.push(found.candidate);
    byRunId.set(found.runId, list);
  }
  return byRunId;
}

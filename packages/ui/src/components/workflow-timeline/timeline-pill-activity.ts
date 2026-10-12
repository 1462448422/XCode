import type { WorkflowRunState } from "@zcode/shared/zcode-protocol-v4";
import { workflowRunOverlay } from "@/components/workflow-graph/run-status.js";
import type { WorkflowCausalityGraphData } from "@/components/workflow-graph/types.js";
import type { TimelinePill } from "./timeline-model.js";

// åå¨ timeline-model.tsï¼dwf-recursive ä¸ dwf-pipeline-display åå¹¶åé£ä¸ªæä»¶å°äº 430 è¡ï¼oxlint
// max-lines ä¸é 400ï¼ãè¯ä¸¸çæ´»å¨æ ç­¾åªè¯» display ä¸ runï¼ä¸åä¸æ¨¡åæå ï¼æä»¥åç¬ææä»¶ã

/** ä¸æè¯ä¸¸ãæ­£å¨åä»ä¹ãï¼ä¼åæ­£å¨è·ç step ç labelï¼å¶æ¬¡æåä¸ä¸ªå·²ç»ç®çï¼åæ¬¡ç¬¬ä¸ä¸ªã */
export function pillActivity(
  graph: WorkflowCausalityGraphData,
  run: WorkflowRunState | undefined,
  pill: TimelinePill,
): { label: string; asks: number; reads: number } {
  const stepsById = new Map(graph.steps.map((step) => [step.id, step]));
  const statuses = run === undefined ? {} : workflowRunOverlay(run, graph).statuses;
  let asks = 0;
  let reads = 0;
  let running: string | undefined;
  let done: string | undefined;
  let first: string | undefined;
  for (const id of pill.stepIds) {
    const step = stepsById.get(id);
    // çç½èªå·±çç«ç¹ï¼kind `hole`ï¼ä¸æ¯ askï¼ä¹ä¸ç»è¯ä¸¸æ ç­¾ã
    if (step === undefined || step.kind === "hole") continue;
    if (step.kind === "world-read") reads += 1;
    else asks += 1;
    first ??= step.label;
    const status = statuses[id];
    if (status === "running") running ??= step.label;
    else if (status === "done" || status === "failed") done = step.label;
  }
  return { asks, label: running ?? done ?? first ?? "", reads };
}

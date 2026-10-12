import {
  isSyntheticLaneId,
  type WorkflowCausalityGraphData,
} from "@/components/workflow-graph/types.js";
import { isPlainRecord } from "@/ToolCallBlocks/renderers/createWorkflowInput.js";

/**
 * FillWorkflowHole è¡çç®æ çç½ï¼docs/dynamic-workflow/presentation.mdãThe fill rowãï¼ï¼`run_id` /
 * `hole_id` æ¥èªè¡çå¥åï¼æ¨¡ååçï¼ï¼**åå­ãèç¨¿è·¯å¾ä¸è¡å·æ¥èª display ç `fill` å**ï¼å·¥å·ä»è§£æ
 * åºççç½åè¿è¾åºãæå½±åæ ·å¸¦ä¸ãå¥åéç `hole` åæ¯ resolveInput ç»æéè§ååå¡«çï¼transcript
 * ä¸å­å®ï¼2026-09-28 é¦æ¬¡æ¥é¾å®æµï¼åªè¯»å¥åçè¡æ é¢æäº `hole#1`ï¼ââè¿éä»è¯»å®ï¼åªä¸ºç¡®è®¤çªé£æ¡
 * æ¿å¾å°è§£æå¥åçè·¯ï¼display å¨åºæ¶ä»¥ display ä¸ºåãä» createWorkflowInput.ts æåºï¼max-lines é¨ï¼ã
 */
export interface WorkflowHoleTarget {
  runId: string | undefined;
  holeId: string | undefined;
  name: string | undefined;
  draftPath: string | undefined;
  line: number | undefined;
}

/** display ç `fill` åï¼ä¸ shared ç toolCallCreateWorkflowDisplaySchema.fill åå½¢ï¼ï¼æªè§£æçåæ ·ã */
export interface WorkflowDisplayFill {
  siteId: string;
  name: string;
  draftPath?: string;
  line?: number;
}

function trimmed(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length > 0 ? text : undefined;
}

export function readWorkflowHoleTarget(
  input: unknown,
  fill?: WorkflowDisplayFill,
): WorkflowHoleTarget | undefined {
  if (!isPlainRecord(input)) return undefined;
  const hole = isPlainRecord(input.hole) ? input.hole : undefined;
  const line = fill?.line ?? hole?.line;
  return {
    runId: trimmed(input.run_id),
    holeId: trimmed(input.hole_id) ?? trimmed(fill?.siteId),
    name: trimmed(fill?.name) ?? trimmed(hole?.name),
    draftPath: trimmed(fill?.draftPath) ?? trimmed(hole?.draft_path),
    line: typeof line === "number" && Number.isInteger(line) && line > 0 ? line : undefined,
  };
}

/** è¡¥å¨çä½ï¼`script`ï¼ï¼ä¸ CreateWorkflow çèæ¬åä¸ééï¼æµå¼èç¨¿çç¬ä»å®éæ«é¶æ®µã */
export function readWorkflowHoleBody(input: unknown): string | undefined {
  return isPlainRecord(input) && typeof input.script === "string" ? input.script : undefined;
}

/**
 * ä¸æ¬¡è¡¥å¨åä¸äºå ä¸ªé¶æ®µãå ä¸ªå­ä»£çï¼ãçç½å·²è¡¥å¨ Â· {name} Â· {k} ä¸ªé¶æ®µ Â· {m} ä¸ªå­ä»£çãï¼ï¼
 * ææèæ¬çå¾ä¸å¸¦ `fill === holeId` çé¶æ®µä¸ç«ç¹ãçç½èªå·±çé¶æ®µï¼æ é¶æ®µçè¡¥å¨ï¼ä¸ç®é¶æ®µã
 */
export function workflowFillCounts(
  graph: WorkflowCausalityGraphData | undefined,
  holeId: string,
): { phases: number; agents: number } {
  if (graph === undefined) return { agents: 0, phases: 0 };
  const phases = (graph.phases ?? []).filter((phase) => phase.fill === holeId).length;
  const lanes = new Set<string>();
  for (const step of graph.steps) {
    // è¡¥å¨åè¿æ¥çå¼ççåå±çç½ï¼kind `hole`ãè½¦é `main`ï¼ä¸æ¯å­ä»£çã
    if (step.fill === holeId && step.kind !== "hole" && !isSyntheticLaneId(step.lane)) {
      lanes.add(step.lane);
    }
  }
  return { agents: lanes.size, phases };
}

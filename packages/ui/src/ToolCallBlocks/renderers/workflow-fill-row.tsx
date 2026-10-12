import { useMemo, type ReactNode } from "react";
import type { WorkflowRunState } from "@zcode/shared/zcode-protocol-v4";
import type { WorkflowCausalityGraphData } from "@/components/workflow-graph/types.js";
import { draftTimeline, scanWorkflowDraft } from "@/components/workflow-timeline/draft-scan.js";
import { narrowTimelineToFill } from "@/components/workflow-timeline/timeline-holes.js";
import {
  buildWorkflowTimeline,
  type WorkflowTimelineModel,
} from "@/components/workflow-timeline/timeline-model.js";
import { readWorkflowDisplay } from "@/ToolCallBlocks/renderers/createWorkflowDisplay.js";
import {
  readWorkflowHoleTarget,
  type WorkflowHoleTarget,
} from "@/ToolCallBlocks/renderers/createWorkflowHoleInput.js";
import type { WorkflowKindVocabulary } from "@/ToolCallBlocks/renderers/createWorkflowInput.js";
import { isFillWorkflowHoleToolCall } from "@/lib/workflowToolNames.js";

/**
 * çç½è¡¥å¨è¡å¨ create-workflow æ¸²æå¨éçé£å æ ·ï¼docs/dynamic-workflow/presentation.mdãThe fill rowãï¼ã
 * ä» create-workflow.tsx æåºï¼max-lines é¨ï¼ï¼åä¸ä¸ªæ¸²æå¨æ¢çç½è¯æ±ï¼ä¸»ææ¬æ¯çç½çåå­ï¼æ¥èª display
 * ç `fill` åââè¡çå¥åæ²¡æåå­ï¼ï¼èç¨¿é¶æ®µçº¿æ¯ç¶è½¨éä¸è¡¥å¨æå¨çé£ä¸æªï¼æ°çç«å¨å¢¨ãä¸¤ä¾§é»ç« ghostï¼ã
 */
export function useWorkflowHoleRow(
  toolCall: {
    toolName?: string | null;
    kind?: string | null;
    title?: string | null;
    raw?: unknown;
    input?: unknown;
  },
  amend: boolean,
): {
  fill: boolean;
  holeTarget: WorkflowHoleTarget | undefined;
  vocabulary: WorkflowKindVocabulary;
} {
  const fill = isFillWorkflowHoleToolCall(toolCall);
  const holeTarget = useMemo(
    () =>
      fill
        ? readWorkflowHoleTarget(toolCall.input, readWorkflowDisplay(toolCall.raw)?.fill)
        : undefined,
    [fill, toolCall.input, toolCall.raw],
  );
  return { fill, holeTarget, vocabulary: fill ? "hole" : amend };
}

/** å¡ä¸çæ¶é´çº¿æ¨¡åï¼æå¾æå¾ï¼è¡¥å¨è¡æ¶çªå°è¡¥å¨é£ä¸æªï¼ï¼æµå¼ä¸­æèç¨¿æ«æï¼å¶ä½æ²¡æã */
export function useWorkflowCardModel({
  graph,
  holeTarget,
  run,
  scriptText,
  writing,
}: {
  graph: WorkflowCausalityGraphData | undefined;
  run: WorkflowRunState | undefined;
  holeTarget: WorkflowHoleTarget | undefined;
  scriptText: string | undefined;
  writing: boolean;
}): WorkflowTimelineModel | undefined {
  return useMemo(() => {
    if (graph !== undefined) {
      // è¡¥å¨è¡ï¼ææèæ¬çå¾æ¶çªå°è¡¥å¨æå¨çé£ä¸æªï¼é»ç« ghostï¼ï¼åå­æ¥èªå·¥å·åå¡«çå¥åã
      if (holeTarget?.holeId !== undefined) {
        const labels = new Map(
          holeTarget.name === undefined ? [] : [[holeTarget.holeId, { name: holeTarget.name }]],
        );
        const whole = buildWorkflowTimeline(graph, undefined, labels);
        return narrowTimelineToFill(whole, holeTarget.holeId) ?? whole;
      }
      return buildWorkflowTimeline(graph, run);
    }
    // æµå¼èç¨¿ï¼display è¿æ²¡å°ï¼ç«åä»åæªèæ¬éæ«åºæ¥ï¼display ä¸å°æ´ä¸ªæ¨¡åè¢«æ¿æ¢ã
    if (writing && scriptText !== undefined) return draftTimeline(scanWorkflowDraft(scriptText));
    return undefined;
  }, [graph, holeTarget, run, scriptText, writing]);
}

/**
 * å¯å¨å / åé¦è¡çä¸»ææ¬ãToolLayout æ¯ memo ç»ä»¶ï¼äº¤ç»å®çèç¹å¿é¡»å¼ç¨ç¨³å®ãè¡¥å¨è¡æ¯
 * `Â· <çç½å>`ï¼å¶ä½åªæåå­ãçç½çç±»åä¸ä¸çé¢ã
 */
export function useWorkflowRowPrimaryText(fill: boolean, name: string): ReactNode {
  return useMemo(
    () =>
      fill ? (
        <span className="inline-flex min-w-0 items-center gap-2 text-foreground-subtlest">
          <span aria-hidden>Â·</span>
          <span className="truncate" data-testid="workflow-fill-hole-name">
            {name}
          </span>
        </span>
      ) : (
        <span className="truncate text-foreground-subtlest">{name}</span>
      ),
    [fill, name],
  );
}

// å·¥ä½æµè¿è¡çè¿·ä½ è½¨éï¼docs/dynamic-workflow/presentation.mdãThe sidebar run lineãï¼ï¼6px ç¯æ
// å£°æåºæå¼ï¼ä¹é´æ¯ 6Ã1px çè½¨æ®µââæ§å¶æµèµ°è¿çæ®µç¨å¼ºè²ï¼å¹¶è¡çä¸¤ç«ä¹é´ç»åçº¿æ®µï¼è¶è¿å­ç«æ¶æå°
// è¿è¡ç« Â±2 å¹¶å¸¦ã+nãå°¾ãä¾§æ è¿è¡è¡ä¸ä»»å¡å²ç run è¡å±ç¨è¿ä¸ä¸ªç»ä»¶ï¼ä¸æ¡ run å¨ä¸¤å¤é¿å¾ä¸æ ·ã
import { cn } from "@/components/lib/utils.js";
import { STATUS_DOT } from "@/components/workflow-graph/run-status-presentation.js";
import type { WorkflowRunRail as WorkflowRunRailModel } from "@/lib/workflowRunLine.js";

export interface WorkflowRunRailIntl {
  formatMessage: (desc: { id: string }, values?: Record<string, string>) => string;
}

const TRACE_FAINT = "var(--color-workflow-trace)";
const TRACE_STRONG = "var(--color-workflow-trace-strong)";

export function WorkflowRunRail({
  rail,
  intl,
}: {
  rail: WorkflowRunRailModel;
  intl: WorkflowRunRailIntl;
}) {
  if (rail.implicit) {
    return (
      <span
        data-workflow-run-rail="true"
        data-implicit="true"
        className="flex shrink-0 items-center"
      >
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", STATUS_DOT.running)} />
      </span>
    );
  }
  return (
    <span data-workflow-run-rail="true" className="flex shrink-0 items-center">
      {rail.stations.map((station, index) => (
        <span key={`${station.name}:${index}`} className="flex items-center">
          {index > 0 ? (
            station.twin === true ? (
              // åçº¿æ®µï¼æ¬ç«ä¸åä¸ç«å¹¶è¡ï¼æ§å¶æµæ²¡æä»é£ç«èµ°å°è¿ç«ãä¸¤æ¡ 1px çº¿ç¸è· 2px
              // ï¼å®¹å¨ 4pxï¼ä¸ä¸åè´´ä¸æ¡ï¼ï¼å®½åº¦ä¸å¢¨è²è§åä¸æ®éæ®µå®å¨ç¸åã
              <span
                aria-hidden="true"
                data-rail-segment={station.reached ? "strong" : "faint"}
                data-rail-twin="true"
                className="flex h-1 w-1.5 flex-col justify-between"
              >
                <span
                  className="h-px w-full"
                  style={{ backgroundColor: station.reached ? TRACE_STRONG : TRACE_FAINT }}
                />
                <span
                  className="h-px w-full"
                  style={{ backgroundColor: station.reached ? TRACE_STRONG : TRACE_FAINT }}
                />
              </span>
            ) : (
              <span
                aria-hidden="true"
                data-rail-segment={station.reached ? "strong" : "faint"}
                className="h-px w-1.5"
                style={{ backgroundColor: station.reached ? TRACE_STRONG : TRACE_FAINT }}
              />
            )
          ) : null}
          {station.hole === undefined ? (
            <span
              aria-hidden="true"
              data-rail-station={station.status}
              title={station.name}
              className={cn("size-1.5 rounded-full", STATUS_DOT[station.status])}
            />
          ) : (
            // çç½ï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãçãThe sidebarãï¼ï¼
            // èçº¿ 6px ç¯ï¼ç­å¾æ¶è­¦ç¤ºè²ãè¡¥å¨åå®å°±æ¯æ®éç«ï¼è¿ä¸æ¯ä¸åèµ°ã
            <span
              aria-hidden="true"
              data-rail-station={station.status}
              data-rail-hole={station.hole}
              title={station.name}
              className={cn(
                "size-1.5 rounded-full border border-dashed bg-transparent",
                station.hole === "waiting" ? "border-warning" : "border-foreground-subtlest",
              )}
            />
          )}
        </span>
      ))}
      {rail.hidden > 0 ? (
        <span className="ml-1 text-ui-xs leading-none text-foreground-subtlest">
          {intl.formatMessage(
            { id: "taskList.workflowRun.moreStations" },
            { count: String(rail.hidden) },
          )}
        </span>
      ) : null}
    </span>
  );
}

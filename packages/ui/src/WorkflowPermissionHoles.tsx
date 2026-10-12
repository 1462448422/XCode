import { PenIcon } from "lucide-react";
import type { ToolCallCreateWorkflowCausalityGraph } from "@zcode/shared/zcode-protocol-v4";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";

/**
 * ç¡®è®¤çªççç½è¡ï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãçãThe hole stationãï¼ï¼
 * è¿å¼çççç½ææºç åºææä¸è¡è¯çï¼ç¬ãåå­ï¼ç±»åä¸ä¸çé¢ï¼ï¼åé¢ä¸å¥ãè¿è¡å°çç½å¤ä¼æåï¼ç­ä¸»ä»£ç
 * è¡¥å¨åç»§ç»­ããââç¨æ·æ¹åçæ¯ä¸ä¸ªä¼åä¸æ¥ç­ä»£ç ç runï¼è¿ä¸å¥è¦å¨æä¸åè®¸ä¹åè¯»å°ãæ²¡æçç½æ¶æ´è¡ç¼ºå¸­ã
 * ä» WorkflowPermissionBlock.tsx æåºï¼max-lines é¨ï¼ã
 */
export function WorkflowPermissionHoles({
  holes,
}: {
  holes: NonNullable<ToolCallCreateWorkflowCausalityGraph["holes"]> | undefined;
}) {
  const { intl } = useXCodeIntl();
  if (holes === undefined || holes.length === 0) return null;
  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
      data-testid="workflow-permission-holes"
    >
      <span className="shrink-0 text-ui-sm text-foreground-subtlest">
        {intl.formatMessage({ id: "chat.permission.workflow.holes.label" })}
      </span>
      {holes.map((hole) => (
        <span
          className="inline-flex h-6 min-w-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-ui-sm text-foreground"
          data-hole-id={hole.siteId}
          data-testid="workflow-permission-hole"
          key={hole.siteId}
          title={hole.name}
        >
          <PenIcon aria-hidden className="size-3.5 shrink-0 text-foreground-subtle" />
          <span className="min-w-0 truncate">{hole.name}</span>
        </span>
      ))}
      <span className="text-ui-sm text-foreground-subtlest">
        {intl.formatMessage({ id: "chat.permission.workflow.holes.note" })}
      </span>
    </div>
  );
}

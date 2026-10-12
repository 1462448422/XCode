import { Pen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkflowNotificationMeta, WorkflowRunHole } from "@zcode/shared/zcode-protocol-v4";
import { ToolLayout } from "@/ToolCallBlocks/ToolLayout.js";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";
import { workflowRunQuestionWaitedLabel } from "@/app-shell/workflowRunQuestions.js";

/**
 * çç½éç¥è¡ï¼docs/dynamic-workflow/transcript-and-notifications.mdãThe notification rowãç hole ä¸è¡ã
 * ãThe hole row's live stateãï¼ãä» WorkflowNotificationToolRow.tsx æåºï¼max-lines é¨ï¼ï¼åä¸å¥
 * ToolLayout è¯­æ³ï¼ç¬å¾æ ï¼ç§ç±»è¯æ run æå½±ç `holes` æ´»ç¿»è½¬ââ
 *   run å¨åºä¸æ­¤ siteId æ¯ waiting â ãå·¥ä½æµçç½ Â· ç­å¾è¡¥å¨ãï¼ç­å¾æ¶é¿æ¯ 30 ç§å·ä¸æ¬¡ï¼
 *   run å¨åºä¸å·² filled â ãçç½å·²è¡¥å¨ãï¼
 *   run ä¸å¨æå½±éï¼`holes` ç¼ºå¸­ï¼â ä¸­æ§çãå·¥ä½æµçç½ãã
 * ä¸»ææ¬ `Â· <run å> Â· <çç½å>` å ç±»åå¾½æ ï¼å±å¼ä½æ¯æç¤ºå¨æãå®ç«å¨åªä¸¤ç«ä¹é´ãé¡»è¿åä»ä¹ãèç¨¿
 * è·¯å¾ãç­äºå¤ä¹ãrun é¾æ¥ã**æ°¸ä¸ shimmer**ï¼çç½ç­çæ¯ä¸»ä»£çï¼ä¸æ¯å·¥ä½ãä½ä¸å¼ç¨è¡¥å¨ä»£ç ââé£å¨ç¸é»
 * ç FillWorkflowHole å·¥å·å¡ä¸ã
 */
export type WorkflowHoleNotification = Extract<WorkflowNotificationMeta, { kind: "hole" }>;

export type HoleRowState = "waiting" | "filled" | "left";

export function holeRowState(
  holes: readonly WorkflowRunHole[] | undefined,
  siteId: string,
): HoleRowState {
  if (holes === undefined) return "left";
  const hole = holes.find((candidate) => candidate.siteId === siteId);
  if (hole === undefined) return "left";
  return hole.state === "waiting" ? "waiting" : "filled";
}

const KIND_LABEL_ID: Record<HoleRowState, string> = {
  waiting: "chat.backgroundResult.workflow.hole.waiting",
  filled: "chat.backgroundResult.workflow.hole.filled",
  left: "chat.backgroundResult.workflow.hole.left",
};

const HOLE_ICON = <Pen className="size-4 shrink-0 text-foreground-subtle" />;

const PANEL_CLASS =
  "whitespace-pre-wrap break-words rounded-lg border border-border bg-panel px-4 py-3 text-ui-base leading-5 text-foreground";

export function WorkflowNotificationHoleRow({
  forceOpen = false,
  holes,
  notification,
  onOpenRun,
  runName,
  toolId,
}: {
  notification: WorkflowHoleNotification;
  runName: string;
  toolId: string;
  /** run æå½±éççç½è¡¨ï¼undefined = run ä¸å¨æ´»æå½±ï¼ä¸­æ§è¯ï¼ã */
  holes: readonly WorkflowRunHole[] | undefined;
  onOpenRun?: () => void;
  forceOpen?: boolean;
}) {
  const { intl } = useXCodeIntl();
  const state = holeRowState(holes, notification.siteId);

  // ç­å¾æ¶é¿è¦å¨æ²¡æäºä»¶æµæ¶ä¹ç§èµ°ï¼åé©»ç run æ°æ°ä¸åäºä»¶ï¼ï¼30 ç§åä¸æ¬¡æ°çãç°å¨ãï¼åªå¨ç­å¾æ¶èµ°ã
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state !== "waiting") return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [state]);
  const waited =
    state === "waiting"
      ? workflowRunQuestionWaitedLabel(notification.reachedAt, now, (descriptor, values) =>
          intl.formatMessage(descriptor, values),
        )
      : undefined;

  const primaryText = useMemo(
    () => (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span aria-hidden>Â·</span>
        <span className="min-w-0 truncate">{runName}</span>
        <span aria-hidden>Â·</span>
        <span className="min-w-0 truncate" data-testid="workflow-hole-notification-name">
          {notification.name}
        </span>
      </span>
    ),
    [notification.name, runName],
  );

  const renderContent = useCallback(() => {
    const { after, before, draftPath, line, prompt } = notification;
    const standsId =
      before !== undefined && after !== undefined
        ? "chat.toolCall.workflow.hole.stands.between"
        : before !== undefined
          ? "chat.toolCall.workflow.hole.stands.after"
          : after !== undefined
            ? "chat.toolCall.workflow.hole.stands.before"
            : undefined;
    return (
      <div className="space-y-3" data-testid="workflow-hole-notification-body">
        {prompt === undefined || prompt.length === 0 ? null : (
          <p className={PANEL_CLASS}>{prompt}</p>
        )}
        <p className="text-ui-sm text-foreground-subtle">
          {standsId === undefined
            ? null
            : intl.formatMessage({ id: standsId }, { before: before ?? "", after: after ?? "" })}
        </p>
        {draftPath === undefined ? null : (
          <p className="text-ui-sm text-foreground-subtle">
            <span className="text-foreground-subtlest">
              {intl.formatMessage({ id: "chat.toolCall.workflow.hole.draftPath" })}
            </span>{" "}
            <span className="font-mono" data-testid="workflow-hole-notification-draft">
              {line === undefined ? draftPath : `${draftPath}:L${line}`}
            </span>
          </p>
        )}
        {waited ? (
          <p
            className="text-ui-sm text-foreground-subtle"
            data-testid="workflow-hole-notification-waited"
          >
            {intl.formatMessage({ id: "chat.toolCall.workflow.hole.waited" }, { time: waited })}
          </p>
        ) : null}
        {onOpenRun ? (
          <button
            type="button"
            onClick={onOpenRun}
            className="text-ui-sm text-foreground-subtle decoration-dotted underline-offset-2 hover:text-foreground hover:underline"
          >
            {intl.formatMessage({ id: "chat.toolCall.workflow.openRunDetails" })}
          </button>
        ) : null}
      </div>
    );
  }, [intl, notification, onOpenRun, waited]);

  return (
    <div data-testid={toolId} data-hole-state={state}>
      <ToolLayout
        toolId={toolId}
        persistOpenKey={toolId}
        icon={HOLE_ICON}
        canToggle
        forceOpen={forceOpen}
        kindLabel={intl.formatMessage({ id: KIND_LABEL_ID[state] })}
        primaryText={primaryText}
        title={runName}
        renderContent={renderContent}
      />
    </div>
  );
}

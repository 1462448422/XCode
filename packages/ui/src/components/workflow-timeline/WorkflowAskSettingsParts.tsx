// ============================================================
// ç¡®è®¤çªä¸¤å¥è®¾ç½®çé¶ä»¶ï¼docs/dynamic-workflow/presentation.mdãThe confirmation windowãï¼
// ============================================================
// ä» WorkflowAskSettingsLines.tsx æåºï¼max-lines é¨ï¼ï¼ä¸¤å¥å±ç¨çç±»åä¸ãÂ· åä¸º X âºãå°¾å·´ãä¸çé£ä¸å¥ã
// ä»¥ååç¼ºå¸­ï¼æ§ agentï¼æ¶ççº¯ææ¬æ¡ä»¶è¡ãç¶æé½å¨ WorkflowAskSettings éï¼è¿éçç»ä»¶åªæ¶ç¹ççå¼ã

import { MinusIcon, PlusIcon, Undo2Icon } from "lucide-react";
import { cn } from "@/components/lib/utils.js";
import { Button } from "@/components/ui/button.js";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.js";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";
import { clampWorkflowRunSettingsBound } from "./workflowRunSettings.js";

/** å¥ä¸­çå¼ç»æä¸æè¯çï¼å¹³æ¶æ¯ä¸å°å surfaceï¼æ¬åæåºè¾¹æ¡ä¸è¾å¥åºè²ï¼composer æ¨¡åè§¦åå¨çè¯­æ±ï¼ã */
export const WORKFLOW_ASK_CHIP_CLASS_NAME =
  "h-6 min-w-0 max-w-[260px] gap-1 rounded-md border border-transparent bg-surface pl-[7px] pr-1 text-ui-sm text-foreground hover:border-border-hover hover:bg-input focus-visible:border-input-border-focused data-[state=open]:border-border-hover data-[state=open]:bg-input [&_svg]:size-3";
export const WORKFLOW_ASK_LINE_CLASS_NAME =
  "flex min-h-6 min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-ui-sm text-foreground-subtle";
export const WORKFLOW_ASK_TAIL_CLASS_NAME = "text-foreground-subtlest";

/** ãÂ· åä¸º X âºãï¼æ¹è¿çé£ä¸è¡ææï¼âº æè¿ä¸è¡æ¾åèµ·ç¹ã */
export function WorkflowAskWasTail({
  disabled,
  onReset,
  testId,
  value,
}: {
  disabled: boolean;
  onReset: () => void;
  testId: string;
  value: string;
}) {
  const { intl } = useXCodeIntl();
  const resetLabel = intl.formatMessage({ id: "chat.permission.workflow.settings.reset" });
  // æé®åªæå¾æ ï¼aria-label ç»è¯»å±ï¼title ç»æ¬åï¼specï¼ãæ¢å¤åå¼ãï¼ã
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-0.5", WORKFLOW_ASK_TAIL_CLASS_NAME)}>
      <span className="min-w-0 truncate" data-testid={`${testId}-was`}>
        Â· {intl.formatMessage({ id: "chat.permission.workflow.settings.was" }, { value })}
      </span>
      <Button
        aria-label={resetLabel}
        className="text-foreground-subtlest hover:text-foreground"
        data-testid={`${testId}-reset`}
        disabled={disabled}
        onClick={onReset}
        size="icon-xs"
        title={resetLabel}
        type="button"
        variant="ghost"
      >
        <Undo2Icon className="size-3" />
      </Button>
    </span>
  );
}

export function WorkflowAskBoundLine({
  bound,
  changed,
  defaultConcurrency,
  disabled,
  initial,
  onChange,
  onReset,
}: {
  bound: number | null;
  changed: boolean;
  /** é»è®¤å¹¶å Dï¼åªç¨æ¥åãÂ· é»è®¤ Nãä¸å¤ã= é»è®¤ãï¼ä¸æ¯æ­¥è¿å¨çä¸çã */
  defaultConcurrency: number | undefined;
  disabled: boolean;
  initial: number | null;
  onChange: (bound: number) => void;
  onReset: () => void;
}) {
  const { intl } = useXCodeIntl();
  const format = intl.formatMessage.bind(intl);
  const tail =
    defaultConcurrency === undefined
      ? bound === null
        ? format({ id: "chat.permission.workflow.settings.limit.none" })
        : undefined
      : bound === defaultConcurrency
        ? format({ id: "chat.toolCall.workflow.run.settings.limit.atDefault" })
        : format(
            { id: "chat.toolCall.workflow.run.settings.limit.default" },
            { n: defaultConcurrency },
          );
  const initialText =
    initial === null
      ? format({ id: "chat.permission.workflow.settings.limit.none" })
      : String(initial);
  return (
    <div
      className={WORKFLOW_ASK_LINE_CLASS_NAME}
      data-changed={changed ? "true" : undefined}
      data-testid="workflow-permission-settings-bound"
    >
      <span>{format({ id: "chat.permission.workflow.settings.limit.lead" })}</span>
      <InputGroup className="h-6 w-auto shrink-0">
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            aria-label={format({ id: "chat.toolCall.workflow.run.settings.limit.decrease" })}
            data-testid="workflow-permission-settings-bound-decrease"
            disabled={disabled || bound === null || bound <= 1}
            onClick={() => bound !== null && onChange(clampWorkflowRunSettingsBound(bound - 1))}
            size="icon-xs"
          >
            <MinusIcon className="size-3" />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput
          aria-label={format({ id: "chat.toolCall.workflow.run.settings.limit" })}
          className={cn(
            "h-6 w-[30px] px-0 text-center font-mono text-ui-sm tabular-nums",
            changed && "font-medium",
          )}
          data-testid="workflow-permission-settings-bound-value"
          disabled={disabled}
          inputMode="numeric"
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            if (Number.isFinite(parsed)) onChange(clampWorkflowRunSettingsBound(parsed));
          }}
          placeholder="â"
          value={bound === null ? "" : String(bound)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={format({ id: "chat.toolCall.workflow.run.settings.limit.increase" })}
            data-testid="workflow-permission-settings-bound-increase"
            disabled={disabled || bound === null}
            onClick={() => bound !== null && onChange(clampWorkflowRunSettingsBound(bound + 1))}
            size="icon-xs"
          >
            <PlusIcon className="size-3" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <span>{format({ id: "chat.permission.workflow.settings.limit.trail" })}</span>
      {tail === undefined ? null : (
        <span
          className={WORKFLOW_ASK_TAIL_CLASS_NAME}
          data-testid="workflow-permission-settings-bound-tail"
        >
          Â· {tail}
        </span>
      )}
      {changed ? (
        <WorkflowAskWasTail
          disabled={disabled}
          onReset={onReset}
          testId="workflow-permission-settings-bound"
          value={initialText}
        />
      ) : null}
    </div>
  );
}

/**
 * åç¼ºå¸­æ¶ççº¯ææ¬æ¡ä»¶è¡ï¼æ§ agentï¼ï¼åªæè°ç¨è®¾äºçå­æ®µï¼æ¨¡åå¨ä¸ãä¸çå¨ä¸ï¼`text-ui-xs` ææ·¡è²ã
 * ä¸å¯è°çä¸¤è¡åä¸ä¸ªæ¬¡åºï¼å¥½è®©æ°æ§ä¸¤ç§çªè¯»èµ·æ¥æ¯åä¸ä»¶äºãæ¨¡åè¯´è§£æå¥½çåå­ï¼è§èä¸²åªè¿ tooltipã
 */
export function WorkflowAskPlainSettings({
  maxConcurrency,
  scriptNamesModels = false,
  subagentModel,
}: {
  maxConcurrency: number | undefined;
  /** èæ¬ç»æäºå­ä»£çç¹åäºæ¨¡åï¼æ¨¡åé£ä¸å¥è¯´ãé»è®¤ãï¼å®ä¸åæ¿æ¯ä¸ä¸ªå­ä»£çè¯´è¯ï¼ã */
  scriptNamesModels?: boolean;
  subagentModel: { text: string; tooltip: string } | undefined;
}) {
  const { intl } = useXCodeIntl();
  if (maxConcurrency === undefined && subagentModel === undefined) return null;
  return (
    <div className="space-y-1">
      {subagentModel === undefined ? null : (
        <p
          className="min-w-0 text-ui-xs text-foreground-subtlest"
          data-testid="workflow-permission-subagent-model"
          title={subagentModel.tooltip}
        >
          {intl.formatMessage(
            {
              id: scriptNamesModels
                ? "chat.permission.workflow.subagentModelDefault"
                : "chat.permission.workflow.subagentModel",
            },
            { model: subagentModel.text },
          )}
        </p>
      )}
      {maxConcurrency === undefined ? null : (
        <p
          className="min-w-0 text-ui-xs text-foreground-subtlest"
          data-testid="workflow-permission-max-concurrency"
        >
          {intl.formatMessage(
            { id: "chat.permission.workflow.maxConcurrency" },
            { count: String(maxConcurrency) },
          )}
        </p>
      )}
    </div>
  );
}

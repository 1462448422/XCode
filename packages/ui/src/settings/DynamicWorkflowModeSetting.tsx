import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import {
  DYNAMIC_WORKFLOW_MODES,
  isDynamicWorkflowOffered,
  normalizeDynamicWorkflowMode,
  TID_SETTINGS_DYNAMIC_WORKFLOW_MODE_ITEM,
  TID_SETTINGS_DYNAMIC_WORKFLOW_MODE_TRIGGER,
  testId,
  type AppSettings,
  type DynamicWorkflowMode,
} from "@zcode/shared";
import {
  DynamicWorkflowAlwaysOnIcon,
  DynamicWorkflowOffIcon,
  DynamicWorkflowOnCommandIcon,
} from "@/components/icons/dynamicWorkflowModeIcons.js";
import {
  Select,
  SelectContent,
  SelectRichItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.js";
import { toast } from "@/components/ui/toast.js";
import { useDynamicWorkflowAvailability } from "@/hooks/useDynamicWorkflowAvailability.js";
import { useSettings } from "@/hooks/useSettingService.js";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";
import { logger } from "@/logger.js";
import { SettingsRow } from "@/settings/SettingsPageParts.js";
import type { DynamicWorkflowAvailabilitySnapshot } from "@/store/dynamicWorkflowAvailabilityStore.js";

const MODE_ICONS: Record<DynamicWorkflowMode, ComponentType<SVGProps<SVGSVGElement>>> = {
  disabled: DynamicWorkflowOffIcon,
  onDemand: DynamicWorkflowOnCommandIcon,
  alwaysOn: DynamicWorkflowAlwaysOnIcon,
};

/**
 * è®¾ç½®è¡è¦æ¾ç¤ºä»ä¹ï¼docs/dynamic-workflow/launch.mdãThe user's choiceãï¼ãå¿«ç§å è½½ä¸­ãè¯»åå¤±è´¥ã
 * æå¡ç«¯æªæä¾åè½æ¶é½è¿å nullï¼è¡ä¸æ¸²æï¼ç°åº¦å¯¹ç¨æ·ä¸å¯è§ãå¼ä¸ãé»è®¤ãé½å Host ç®å¥½çç»æï¼
 * renderer ä¸èªå·±å¥ç¨æ·éæ©ã
 */
export function resolveDynamicWorkflowModeSettingView(
  snapshot: DynamicWorkflowAvailabilitySnapshot,
): { value: DynamicWorkflowMode; offeredMode: DynamicWorkflowMode } | null {
  const config = snapshot.config;
  if (snapshot.status !== "ready" || !config || !isDynamicWorkflowOffered(config)) return null;
  return { value: config.mode, offeredMode: config.offeredMode };
}

/** éåæå¡ç«¯æä¾çæ¨¡å¼ç­äºå é¤éæ©ï¼ç©ºä¸²å¨åµï¼æå¡å±å½ä¸æå é¤ï¼ï¼å®è£ç»§ç»­è·éæå¡ç«¯ç¿»è½¬ã */
export function buildDynamicWorkflowModePatch(
  next: DynamicWorkflowMode,
  offeredMode: DynamicWorkflowMode,
): Pick<AppSettings, "dynamicWorkflowMode"> {
  return {
    dynamicWorkflowMode: (next === offeredMode ? "" : next) as AppSettings["dynamicWorkflowMode"],
  };
}

export function DynamicWorkflowModeSetting() {
  const { intl } = useXCodeIntl();
  const { update } = useSettings();
  const view = resolveDynamicWorkflowModeSettingView(useDynamicWorkflowAvailability());
  // éæ©è½ç â Root éç¥ Host éåç­ç¥ â å¿«ç§éè¯»ï¼æ´æ¡é¾è¦å ç¾æ¯«ç§ï¼æé´è§¦åå¨åæ¾ç¤ºç¨æ·åéçå¼ã
  // è¡å¯è§å³åè½å·²æä¾ï¼æ­¤æ¶çææ¨¡å¼å¿ç¶ç­äºç¨æ·æéï¼æä»¥ä¹è§å¼ä¸æç»å¼ä¸è´ã
  const [pending, setPending] = useState<DynamicWorkflowMode | null>(null);
  const settledValue = view?.value;
  useEffect(() => {
    if (pending !== null && settledValue === pending) setPending(null);
  }, [pending, settledValue]);

  if (!view) return null;
  const value = pending ?? view.value;
  const label = intl.formatMessage({ id: "settings.dynamicWorkflow" });

  const handleValueChange = async (rawValue: string) => {
    const next = normalizeDynamicWorkflowMode(rawValue);
    if (!next || next === value) return;
    setPending(next);
    try {
      await update(buildDynamicWorkflowModePatch(next, view.offeredMode));
    } catch (error) {
      setPending(null);
      logger.warn("[settings] ä¿å­å¨æå·¥ä½æµæ¨¡å¼å¤±è´¥", { error: String(error) });
      toast(intl.formatMessage({ id: "settings.dynamicWorkflow.saveError" }));
    }
  };

  // ä¸åå¤å±åç´ ï¼SettingsRow é  first:border-t-0 ç»è¡é´åéçº¿ï¼åä¸å±ä¼è®©å®åæé¦è¡èä¸¢æä¸è¾¹æ¡ã
  return (
    <SettingsRow
      label={label}
      description={intl.formatMessage({ id: "settings.dynamicWorkflowDescription" })}
      // Bugfixï¼é»è®¤æ§ä»¶ååªæ 192pxï¼flex ä¼æ 260px çè§¦åå¨åå° 192pxï¼è·éè§¦åå¨å®½åº¦çåè¡¨ä¹éä¹è¿çªï¼
      // wide å¸å±ç» 280px æ§ä»¶åï¼ææºå®½åº¦ä¸æ¢å°æ ç­¾ä¸æ¹ï¼ï¼è§¦åå¨ä¸åè¡¨é½æè®¾è®¡ç¨¿ç 260px æ¾ç¤ºã
      controlLayout="wide"
      control={
        <Select value={value} onValueChange={(next) => void handleValueChange(next)}>
          <SelectTrigger
            size="lg"
            className="w-[260px] min-w-0 justify-between"
            aria-label={label}
            data-testid={TID_SETTINGS_DYNAMIC_WORKFLOW_MODE_TRIGGER}
          >
            <SelectValue />
          </SelectTrigger>
          {/* ä¸¤è¡éé¡¹ç¨ popper å±å¼å¨è§¦åå¨ä¸æ¹ï¼item-aligned ä¼çä½æ¬è¡çæ ç­¾ä¸è¯´æã
              Bugfixï¼popper åªç»äº min-widthï¼åè¡¨å®½åº¦ä¼è¢«æé¿çä¸è¡è¯´ææå¼ï¼åºå®ä¸ºè§¦åå¨å®½åº¦ï¼260pxï¼ï¼
              è¯´æå¨åè¡¨åæè¡ï¼ä¸è®¾è®¡ç¨¿ä¸è´ã */}
          <SelectContent
            position="popper"
            align="end"
            sideOffset={4}
            className="w-(--radix-select-trigger-width)"
          >
            {DYNAMIC_WORKFLOW_MODES.map((mode) => {
              const Icon = MODE_ICONS[mode];
              return (
                <SelectRichItem
                  key={mode}
                  value={mode}
                  data-testid={testId(TID_SETTINGS_DYNAMIC_WORKFLOW_MODE_ITEM, mode)}
                  icon={<Icon className="size-4.5" />}
                  title={intl.formatMessage({ id: `settings.dynamicWorkflow.option.${mode}` })}
                  titleAdornment={
                    mode === view.offeredMode ? (
                      <span className="inline-flex h-4 shrink-0 items-center rounded-sm bg-tag px-1 text-ui-xs font-medium text-foreground-subtle">
                        {intl.formatMessage({ id: "settings.dynamicWorkflow.defaultTag" })}
                      </span>
                    ) : null
                  }
                  description={intl.formatMessage({
                    id: `settings.dynamicWorkflow.option.${mode}.description`,
                  })}
                />
              );
            })}
          </SelectContent>
        </Select>
      }
    />
  );
}

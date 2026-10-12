// ============================================================
// ä¾§æ èçº¿çé¶ä»¶
// ============================================================
// ä» WorkflowRunPhaseList.tsx æåºï¼max-lines 400ï¼ï¼æ¸åæä»¶æ¿è½½å±å¼ç¶æãé®é¢å½å±ä¸è¯ä¸¸æ¥çº¿ï¼
// æ¬æä»¶æ¿è½½çº¯å±ç¤ºä»¶ââè½¨éæ®µãæ¥å¤´è¡ãç¯ãæå èå¤´ä¸çå¤´åä¸²ãè½®æ¬¡ãå­ä»£çè¡çå°¾å·´ï¼è®¡æ°ä¸æ¨¡ååï¼ã

import { useId, useMemo, type CSSProperties } from "react";
import { Repeat2Icon } from "lucide-react";
import { cn } from "@/components/lib/utils.js";
import { STATUS_DOT } from "@/components/workflow-graph/run-status-presentation.js";
import type { StepRunStatus } from "@/components/workflow-graph/types.js";
import type {
  TimelineInk,
  TimelinePill,
  TimelineStation,
} from "@/components/workflow-timeline/timeline-model.js";
import { workflowActorModelLabels } from "@/components/workflow-timeline/subagent-model-label.js";
import { LaneGlyph, agentColor } from "@/components/workflow-timeline/WorkflowAgentPill.js";
import { MarchLight } from "@/components/workflow-timeline/WorkflowMarchLight.js";
import { StreamChevronsBox } from "@/components/workflow-timeline/WorkflowStreamChevrons.js";
import {
  SPINE_JOINT_PX,
  SPINE_TRACK_X,
  type SpineJoint,
  type SpineSection,
} from "@/app-shell/workflowRunSpine.js";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";

/** å¼å£æ¥å¤´è¡çä¸»è½¨æè¡å¤ä¼¸åºçé¿åº¦ï¼å¡ä¸ç TAILï¼ã */
const SPINE_STUB_PX = 4;

/** æµè½¨çä¸¤ååå¨èè¾¹çååè®©åºè¿ä¹å¤ï¼ç¼ºå£éç«ä¸¤ææä¸ç chevronã */
const SPINE_STREAM_GAP_PX = 7;

/** æå èå¤´ä¸æå¤å æå¤´åï¼å¶ä½è¿ `+n`ã */
const CLUSTER_MAX = 3;

/**
 * è½¨éæ®µçä¸åãç¸é»ä¸¤ç«ä¹é´çä¸æ®µè½¨éææä¸¤æªç»ï¼ä¸ä¸ç«ä»ç¯åºå°èåºï¼ä¸ä¸ç«ä»èé¡¶å°ç¯é¡¶ââ
 * ä¸¤æªåä¸å¢¨è²ï¼æ¥å¨èçè¾¹çä¸ãè¿æ ·è½¨ééèçå±å¼ / æå èªå·±é¿ç­ï¼ä¸ç¨éã
 *
 * å¸¦éè¿æç¬¬ä¸ç§ï¼`full` æ´èç©¿è¿ï¼ä¸»è½¨ç»è¿åæ¯ç«ãåæ¯è½¨ç»è¿å«äººçç«ï¼ï¼æ¥å¤´è¡éçä¸»è½¨ä¹æ¯å®ã
 * è½¨é t > 0 ç x ç¨åèæ ·å¼ç»ï¼`21 + pitchÂ·t`ï¼ââå®æ¯ç®åºæ¥çï¼Tailwind çä¸åºè¿ä¸ªç±»ã
 *
 * è¡è¿æ®µï¼`march`ï¼æ¯ä¸æ¡ 1.5px ç**äº®çç**è½¨éï¼ä¸å¨ï¼å®è¯´çæ¯æ§å¶æµå·²ç»èµ°è¿çé£æ¡è¾¹ï¼å¨ä½çç»
 * æ­£å¨è¿è¡çç¯ãäº®åº¦æ²¿çæ§å¶æµçæ¹åæ¶¨ââ`data-rail-position` å°±æ¯ç»æ ·å¼è¡¨éæ¸åç¨çï¼ä¸¤æªé½å¾å¸¦ç
 * å®ï¼`below`ï¼ä¸ä¸èçä¸åæªï¼ä»éææ·¡å¥å°ä¸æè­¦ç¤ºè²ï¼`above`ï¼è¿è¡é£ä¸èçä¸åæªï¼ä»ä¸ææ¶¨å°æ»¡ï¼
 * ä¸ç´äº®è¿ç¯éï¼`full` æ¯å¹³çä¸æã
 */
export function SpineRail({
  ink,
  overhang,
  pitch,
  position,
  stream,
  track = 0,
}: {
  ink: TimelineInk;
  position: "above" | "below" | "full";
  /** æµè½¨çä¸åï¼å¨èè¾¹çè®©åº `SPINE_STREAM_GAP_PX`ï¼ä¸å è¡è¿çåã */
  stream?: true;
  track?: number;
  /** è½¨è·ï¼`workflowRunSpine.ts`ï¼ï¼åªæ track > 0 æè¯»å®ã */
  pitch: number;
  /** å¼å£æ¥å¤´è¡çä¸»è½¨ï¼åè¡å¤ä¼¸åº `SPINE_STUB_PX`ââæ ¹å¨ä¸ãæ±ç¹å¨ä¸ã */
  overhang?: "top" | "bottom";
}) {
  const x = SPINE_TRACK_X + pitch * track;
  const style: CSSProperties = {};
  // æµè½¨çå¢¨å¨ chevron ä¸ï¼å®çä¸¤åå§ç»æ¯ 1px çå¹³å¢¨ã
  const lit = ink === "march" && stream !== true;
  if (track > 0) style.left = lit ? x - 0.75 : x - 0.5;
  if (stream === true && position === "below") style.bottom = SPINE_STREAM_GAP_PX;
  if (stream === true && position === "above") {
    style.top = SPINE_STREAM_GAP_PX;
    style.height = 12 - SPINE_STREAM_GAP_PX;
  }
  if (overhang !== undefined) {
    style.top = overhang === "top" ? -SPINE_STUB_PX : 0;
    style.bottom = overhang === "bottom" ? -SPINE_STUB_PX : 0;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "wf-ink absolute rounded-full",
        lit ? "left-[20.25px] w-[1.5px]" : "left-[20.5px] w-px",
        position === "above" ? "top-0 h-3" : position === "below" ? "bottom-0 top-6" : "inset-y-0",
        !lit && "bg-foreground-subtlest",
        lit && "wf-spine-march",
      )}
      data-rail-ink={ink}
      data-rail-kind={stream === true ? "stream" : undefined}
      data-rail-position={position}
      data-rail-track={track}
      data-testid="workflow-run-spine-rail"
      style={Object.keys(style).length === 0 ? undefined : style}
    />
  );
}

/**
 * ä¸èéå¨é¨çç«è½¨ï¼`workflowRunSpine.ts` ç®å¥½çï¼ï¼ä¸å£æ°ç»åºæ¥ãæµè½¨çä¸åæªå¨èåºè¾¹çæ­£ä¸­
 * æ¾ä¸¤ææä¸ç chevronï¼presentation.mdãThe spineãï¼ï¼z-index 1ï¼ä¸ä¸èçèå¤´æ¬ååºè²åä¸ä½å®ã
 */
export function SpinePieces({ pitch, section }: { pitch: number; section: SpineSection }) {
  return (
    <>
      {section.rails.map((rail) => (
        <SpineRail key={`${rail.track}:${rail.position}`} pitch={pitch} {...rail} />
      ))}
      {section.rails.map((rail) =>
        rail.stream === true && rail.position === "below" ? (
          <StreamChevronsBox
            count={2}
            direction="down"
            ink={rail.ink}
            key={`stream:${rail.track}`}
            style={{ left: SPINE_TRACK_X + pitch * rail.track, top: "100%", zIndex: 1 }}
          />
        ) : null,
      )}
    </>
  );
}

/**
 * æ¥å¤´è¡ï¼presentation.mdãThe spineãï¼ï¼ååææ±åå¨ä¸¤è**ä¹é´**å ä¸è¡ 16pxãä¸»è½¨ä»ä¸­ç´ç©¿ï¼æ¯æ¡
 * åæ¯æ²¿åä¸æ ¹ y = 8 çæ¯çº¿ç¦»å¼ï¼æåå°ï¼ä¸»è½¨ââç«ä¸ãåå¾ min(6, pitch/2) çä¸ä¸ªè½¬è§ãæ¨ªå°èªå·±
 * çåãåä¸ä¸ªè½¬è§ç«ä¸å°è¡åºï¼åªæä¸æ¡åæ¯æ¶ä¸¤ä¸ªè½¬è§æ¥æä¸ä¸ª Sãæ±åæ¯ååçéåã
 *
 * æ²çº¿ä¸å¾åç»åºå¢¨ï¼è¡è¿çåæ²¿åä¸æ¡è·¯å¾å ä¸æ¡äº®ççåï¼`MarchLight`ï¼ï¼ä»æ§å¶æµæ¥çé£ä¸å¤´æ·¡å¥ã
 * å°ç¯é£ä¸å¤´æäº®ï¼ä¸å¨ãæ¸åçä¸¤ç«¯å°±æ¯ç» `path` çé¦å°¾ä¸¤ç¹ï¼`id` ç¨ `useId()`ï¼ä¸å¼  SVG éå¯ä¸ã
 * å¼å£çè¡ï¼æ²¡æåé©±çååãæ²¡ææ±åç«çæ±åï¼ä¸»è½¨ä¸æ¥ä¸ä¸è / ä¸ä¸èï¼èæ¯æè¡å¤ä¼¸åº 4px æ¶æåå¤´ï¼
 * ä¸ä¸ªæ ¹ãä¸ä¸ªæ±ç¹ï¼å¡ä¸ç TAIL / STUBï¼ãæ´è¡æ¯è£é¥°ï¼`aria-hidden`ï¼ï¼å®è¯´çäºç¯ä¸èå¤´å·²ç»è¯´äºã`joint` ç¼ºå¸­å³è¿éæ²¡ææ¥å¤´ï¼ä»ä¹é½ä¸ç»ã
 */
export function SpineJointRow({
  joint,
  kind,
  pitch,
}: {
  joint: SpineJoint | undefined;
  kind: "fork" | "merge";
  pitch: number;
}) {
  const lightBase = useId();
  if (joint === undefined) return null;
  const main = SPINE_TRACK_X - 0.5;
  const r = Math.min(6, pitch / 2);
  const bus = SPINE_JOINT_PX / 2;
  const curves = joint.branches.map((branch) => {
    const x = main + pitch * branch.track;
    const d =
      kind === "fork"
        ? `M${main},0 V${bus - r} Q${main},${bus} ${main + r},${bus} H${x - r} Q${x},${bus} ${x},${bus + r} V${SPINE_JOINT_PX}`
        : `M${x},0 V${bus - r} Q${x},${bus} ${x - r},${bus} H${main + r} Q${main},${bus} ${main},${bus + r} V${SPINE_JOINT_PX}`;
    const from = kind === "fork" ? { x: main, y: 0 } : { x, y: 0 };
    const to = kind === "fork" ? { x, y: SPINE_JOINT_PX } : { x: main, y: SPINE_JOINT_PX };
    return { ...branch, d, from, to };
  });
  const width = main + pitch * Math.max(1, ...joint.branches.map((branch) => branch.track)) + 8;
  return (
    <div
      aria-hidden
      className="relative shrink-0"
      data-joint-kind={kind}
      data-joint-open={joint.open === true ? "true" : undefined}
      data-testid="workflow-run-spine-joint"
      style={{ height: SPINE_JOINT_PX }}
    >
      <SpineRail
        ink={joint.main}
        pitch={pitch}
        position="full"
        {...(joint.open === true ? { overhang: kind === "fork" ? "top" : "bottom" } : {})}
      />
      <svg
        className="absolute left-0 top-0 overflow-visible"
        height={SPINE_JOINT_PX}
        viewBox={`0 0 ${width} ${SPINE_JOINT_PX}`}
        width={width}
      >
        {curves.map((curve) => (
          <g
            data-curve-ink={curve.ink}
            data-curve-track={curve.track}
            data-testid={`workflow-run-spine-${kind}`}
            key={curve.track}
          >
            <path
              className="wf-ink"
              d={curve.d}
              fill="none"
              stroke="var(--color-foreground-subtlest)"
              strokeLinecap="round"
              strokeWidth={1}
            />
          </g>
        ))}
        {/* åå å¨å¨é¨åºå¢¨ä¹ä¸ï¼å æ¡åæ¯å±ç¨æ¯çº¿ï¼åç»çåºå¢¨ä¸è½æåä¸æ¡çåçä½ã */}
        {curves.map((curve) =>
          curve.ink === "march" ? (
            <g data-testid={`workflow-run-spine-${kind}-lit`} key={`lit:${curve.track}`}>
              <MarchLight
                d={curve.d}
                from={curve.from}
                id={`${lightBase}lit-${curve.track}`}
                to={curve.to}
              />
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}

/**
 * è½¨éä¸çç¯ï¼ç©ºå¿ = æªå°ï¼ç»¿ = å·²è¿ï¼çº¢å¸¦ç¯ = å¤±è´¥ï¼ç¥çå¸¦æå¨ = æ­£å¨è¿è¡ãè¿è¡ä¸­çç¯ä¸å¡ä¸çç¯
 * åä¸æ¡å½ï¼`wf-lamp-running`ï¼ï¼å¸¸äº®çåæå ä¸ä¸å¿è·³ï¼`motion-reduce` æ¶åªå©åæã
 */
export function SpineLamp({
  pitch,
  status,
  track = 0,
}: {
  status: StepRunStatus;
  track?: number;
  pitch: number;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "wf-lamp absolute left-4 top-[13px] size-2.5 rounded-full",
        STATUS_DOT[status],
        status === "pending" && "bg-background",
        status === "running" && "wf-lamp-running motion-reduce:animate-none",
      )}
      data-lamp={status}
      data-testid="workflow-run-phase-lamp"
      style={track === 0 ? undefined : { left: 16 + pitch * track }}
    />
  );
}

/** æå èå¤´ä¸çå¤´åä¸²ï¼è°å¨è¿ä¸ç«ï¼ä¸ç¼å¯è§ï¼å­ä»£çæ¯æç¼å·å®è²çç¦çè¸ï¼å·¥ä½åºæ¯ç»ç«¯å­å½¢ã */
export function AvatarCluster({
  pills,
  nameOf,
}: {
  pills: readonly TimelinePill[];
  nameOf: (pill: TimelinePill) => string;
}) {
  if (pills.length === 0) return null;
  const shown = pills.slice(0, CLUSTER_MAX);
  const more = pills.length - shown.length;
  return (
    <span className="flex items-center gap-1" data-testid="workflow-run-phase-cluster">
      {shown.map((pill) => {
        const tinted = pill.laneClass === "agent";
        const color = tinted ? agentColor(pill.avatarIndex, nameOf(pill)) : undefined;
        return (
          <span
            className={cn(
              "contents",
              tinted ? "text-[var(--wf-avatar)]" : "text-foreground-subtle",
            )}
            key={pill.key}
            style={color === undefined ? undefined : { ["--wf-avatar" as string]: color }}
            title={nameOf(pill)}
          >
            <LaneGlyph
              className="size-4 shrink-0"
              avatarIndex={pill.avatarIndex}
              laneClass={pill.laneClass}
              name={nameOf(pill)}
              status={pill.status}
            />
          </span>
        );
      })}
      {more > 0 ? (
        <span className="ml-1 font-mono text-ui-xs tabular-nums text-foreground-subtlest">
          +{more}
        </span>
      ) : null}
    </span>
  );
}

/** è½®æ¬¡ï¼`â³ n`ï¼åªå¨åè¾¹ä¸¤ç«¯ä¸è³å°è·è¿ä¸è½®æ¶å¨åºï¼ä¸å¡ä¸åä¸æ¡è§åï¼ã */
export function Rounds({ station }: { station: TimelineStation }) {
  const { intl } = useXCodeIntl();
  if (!station.onLoop || station.rounds === 0) return null;
  return (
    <span
      className="flex items-center gap-[3px]"
      data-testid="workflow-run-phase-rounds"
      title={intl.formatMessage(
        { id: "chat.toolCall.workflow.timeline.rounds" },
        { count: station.rounds },
      )}
    >
      <Repeat2Icon aria-hidden className="size-[11px]" />
      <span>{station.rounds}</span>
    </span>
  );
}

/**
 * å­ä»£çè¡çå°¾å·´ï¼è®¡æ°ï¼ã{n} ä¸ªä»»å¡ Â· {n} æ¬¡è¯»åãï¼ï¼persona ç¹åäºæ¨¡åæ¶åè·æ¨¡åå
 * ï¼presentation.mdãThe spineãï¼ãæ¨¡ååå¯ä»¥å¾é¿ï¼èªå®ä¹ provider çãåå­/æ¨¡åãï¼ï¼å®ä¸å­ä»£çå
 * ä¸èµ·è®©ä½ï¼è®¡æ°ä¸è®©ã
 */
export function SpinePillTrailer({
  counts,
  modelName,
}: {
  counts: readonly string[];
  modelName: string | undefined;
}) {
  return (
    <>
      {counts.length === 0 ? null : (
        <span className="shrink-0 font-mono text-ui-xs tabular-nums text-foreground-subtlest">
          {counts.join(" Â· ")}
        </span>
      )}
      {modelName === undefined ? null : (
        <span
          className="min-w-0 max-w-[45%] truncate font-mono text-ui-xs text-foreground-subtlest"
          data-testid="workflow-run-agent-model"
        >
          {counts.length === 0 ? modelName : `Â· ${modelName}`}
        </span>
      )}
    </>
  );
}

/** {@link workflowActorModelLabels} æ actors è¡¨ä¸è¯­è¨è®°å¿ä¸æ¬¡ï¼èçº¿æ¯æ¬¡éæ¸²æé½è¦æ¥ï¼ã */
export function useWorkflowActorModelLabels(
  actors: readonly { siteId: string; ordinal: number; model?: string }[] | undefined,
  providerName: ((providerId: string) => string | undefined) | undefined,
): ReadonlyMap<string, { name: string; canonical: string }> {
  const { intl } = useXCodeIntl();
  return useMemo(
    () =>
      workflowActorModelLabels(actors, {
        formatMessage: intl.formatMessage.bind(intl),
        ...(providerName === undefined ? {} : { providerName }),
      }),
    [actors, intl, providerName],
  );
}

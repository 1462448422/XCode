import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRightIcon, CircleHelpIcon } from "lucide-react";
import type { WorkflowRunPendingQuestion, WorkflowRunState } from "@zcode/shared/zcode-protocol-v4";
import { cn } from "@/components/lib/utils.js";
import { phaseDisplayName } from "@/components/workflow-graph/phase-name.js";
import type { WorkflowCausalityGraphData } from "@/components/workflow-graph/types.js";
import type { WorkflowTimelineModel } from "@/components/workflow-timeline/timeline-model.js";
import {
  ROSTER_PINS_PANE,
  pillInstanceKey,
  rosterMore,
  rosterRestCounts,
  rosterRoll,
  stationRosterOf,
} from "@/components/workflow-timeline/roster-model.js";
import { WorkflowAgentPill } from "@/components/workflow-timeline/WorkflowAgentPill.js";
import { WorkflowMoreRow } from "@/components/workflow-timeline/WorkflowMoreRow.js";
import { WorkflowRoll } from "@/components/workflow-timeline/WorkflowRoll.js";
import { RosterMeter } from "@/components/workflow-timeline/WorkflowRosterParts.js";
import { WorkflowRunQuestionRow } from "@/app-shell/WorkflowRunQuestionRow.js";
import {
  AvatarCluster,
  Rounds,
  SpineJointRow,
  SpineLamp,
  SpinePieces,
  useWorkflowActorModelLabels,
} from "@/app-shell/WorkflowRunSpineParts.js";
import { phasePillRenderers } from "@/app-shell/WorkflowRunPhasePills.js";
import { spineLayout } from "@/app-shell/workflowRunSpine.js";
import {
  FillHeadingRow,
  HoleWaitingBody,
  SpineHoleLamp,
} from "@/app-shell/WorkflowRunHoleParts.js";
import { useSpineFillFrames } from "@/app-shell/WorkflowRunFillFrames.js";
import { HoleFillMark } from "@/components/workflow-timeline/WorkflowHoleParts.js";
import type { WorkflowActorInstance } from "@/app-shell/workflowRunPanel.js";
import { useXCodeIntl } from "@/i18n/IntlProvider.js";

/**
 * è¿è¡è¯¦æé¡µçèçº¿ï¼å¡ä¸çæ¨ªåæ¶é´çº¿å¨
 * è¿éç«çè¯»ãä¸æ ¹è½¨éä»ä¸å°ä¸è´´çå·¦ç¼ï¼é¶æ®µæ¯è½¨éä¸çç¯ï¼è½¨éçå¢¨è¿¹éæ§å¶æµç»è¿èåæ·±ãå¨è¿å¥
 * æ­£å¨è¿è¡çé¶æ®µé£ä¸æ®µè¡è¿ï¼å­ä»£çæ¯æå¨ç¯å³ä¾§ãææ»¡æ¬åçè¯ä¸¸ï¼ä¸å¡ä¸åä¸æï¼ï¼åçº§é®é¢æå¨
 * æé®èé£ä¸è¡ä¸é¢ï¼åéä¸æ­¥ã**ä¸ç»åè¾¹**ï¼é£æ¯å¡çäºï¼èå¤´ä¸ç `â³ n` å·²ç»è¯´äºè¿ç«è·è¿å è½®ã
 *
 * è½¨éæ®µä¸ç¯çå¢¨è¿¹ãç¶æé½è¯» `buildWorkflowTimeline` çåä¸ä¸ªæ¨¡åï¼ä¸åå¼ 1ï¼ä¸ä¸ªæ¨¡åï¼ä¸å¤
 * æ¶è´¹ï¼ãè½¨éæ®µåªå¨æ¨¡åæ `rails` çç¸é»ä¸¤ç«ä¹é´ç»ââä¸å¡åä¸æ¡è§åï¼ç¸é»æ è¾¹çç©ºã
 *
 * å¹¶è¡çé¶æ®µï¼æ¨¡åç**å¸¦**ï¼å¨è¿éè¯»ä½æäº¤å¾ï¼åæ¯è½¨éå¨ä¸»è½¨å³è¾¹ï¼ç¯è½å¨èªå·±çè½¨éä¸ï¼èèå¤´ã
 * è¯ä¸¸ä¸é®é¢ä¸å¾ä»åä¸æ¡æå­åèµ·ï¼`39 + gutter`ï¼ââè½¨éä¸æå­ä¸å±ç¨ä¸åãååä¸æ±ååå ä¸¤è
 * ä¹é´çä¸è¡æ¥å¤´ï¼åªå¨åé©± / æ±åç«å­å¨æ¶ææãæ¯ä¸èè¦ç»åªäºç«è½¨ãåªéææ¥å¤´ç±
 * `workflowRunSpine.ts` ç®å¥½ï¼è¿éåªç§çæã**ä¸ç»åè¾¹**ï¼åä¸ï¼ã
 *
 * æèµ·çé¶æ®µå¨èå¤´å¸¦ä¸ä¸²å¤´åï¼è³å¤ 3 æ + `+n`ï¼ï¼æå ä¸è½è®©ãè°å¨è¿ä¸ç«ãä¸å¯è§ã
 * æ­£å¨è¿è¡çé¶æ®µèªå·±å±å¼ï¼**æ¯ä¸ä¸ª**æ­£å¨è·çç«é½å¼ï¼å¸¦éä¸¤æ¡è½¨éå¯ä»¥åæ¶å¨è·ï¼ï¼å·²å±å¼çä¸å¨ã
 *
 * åä¸èè¿äºéå¼çç«æ¯ååï¼è¿½è®°ãé¶æ®µååãããä¸æé¨ä¸ä¸å·ååãï¼ï¼é 5 æè¯ä¸¸ï¼asking â running â
 * failed â è¡¥ä½ï¼ï¼ç¬¬å­ææ¯é¨ï¼å³çå¸¦å¶ä½äººçè®¡æ°è¡ï¼ï¼é¨åæ¯å¶ä½äººçååââæ¯äººä¸æ¬¡ãæç¶æåç»ã
 * ä¸¤å `row` è¯ä¸¸ï¼æå èå¤´ä¸å¤´åä¸²æ¢æè¿·ä½ éæ¡ãçä¸åä¸åºæ¥çå­ä»£çï¼`station.unlisted`ï¼è¿é¨ç
 * äººæ°ãè®¡æ°è¡ä¸éæ¡ï¼å´æ²¡æè¡å¯è½ï¼æä»¥ååæ«å°¾ç¨ä¸è¡æ·¡å­äº¤ä»£è¿ä¸ªå·®é¢ã
 *
 * è½ç¹ï¼å¡ä¸ãè¿æ n ä¸ªãé£ä¸è¡æç«å¤´æç« id äº¤ç»å®¿ä¸»ï¼tab å¸¦ç
 * `focusPhaseId` å°è¿éââå±å¼è¿ä¸ç«ãæé¨æå¼ãèå¤´æ»å°é¡¶ãåºè²äº®ä¸ä¸åéåãä¸æ¬¡æå¼åªè½ä¸æ¬¡
 * ï¼é®å« openedAtï¼åä¸ç«åç¹ä¸æ¬¡ä¼åè½ï¼ï¼ä¹åç¨æ·æ»èµ°ä¸è¿½ã
 */
const QUESTION_TICK_MS = 30_000;
/** è½ç¹äº®ä¸ä¸çæ¶é¿ï¼æ 400 ms åç¨ 800 ms éåï¼`.wf-landed`ï¼ã */
const LANDING_MS = 1200;

function questionKey(question: WorkflowRunPendingQuestion): string | undefined {
  return question.actorSiteId === undefined || question.actorOrdinal === undefined
    ? undefined
    : `${question.actorSiteId}@${question.actorOrdinal}`;
}

const pillKey = pillInstanceKey;

export const WorkflowRunPhaseList = memo(function WorkflowRunPhaseList({
  graph,
  landing,
  model,
  onOpenActor,
  onOpenWorkspace,
  pendingQuestions,
  run,
  subagentModelProviderName,
}: {
  graph: WorkflowCausalityGraphData;
  model: WorkflowTimelineModel;
  run: WorkflowRunState | undefined;
  pendingQuestions: readonly WorkflowRunPendingQuestion[];
  /** å¼ actor transcript tabï¼æ²¡æä¼è¯çæ§½ä½å¼å ä½ï¼ãç¼ºå¸­å³è¡ä¸å¯ç¹ââåè°çå­å¨æ¬èº«å°±æ¯é¨æ§ã */
  onOpenActor?: (instance: WorkflowActorInstance) => void;
  /** å¼èæ¬ transcript tabãè½å°è¿ä¸ç«ï¼ç¼ºå¸­å³èæ¬è¡ä¸å¯ç¹ã */
  onOpenWorkspace?: (phaseId: string) => void;
  /** è½ç¹ï¼`key` æ¯æ¬¡æå¼é½ä¸åï¼`phaseId@openedAt`ï¼ï¼åä¸ç«åç¹ä¸æ¬¡ä¹åè½ã */
  landing?: { phaseId: string; key: string };
  /** providerId â æ¨¡åæ¸åéç provider åï¼å­ä»£çèªå·±çæ¨¡åååç¨ï¼ä¸æè¦è¡åä¸ä¸ªæ¥æºï¼ã */
  subagentModelProviderName?: (providerId: string) => string | undefined;
}) {
  const { intl } = useXCodeIntl();
  const format = intl.formatMessage.bind(intl);
  // persona ç¹åäºæ¨¡åçå­ä»£çï¼è¡å°¾è¯´æ¨¡ååï¼tooltip å¸¦è§èä¸²ï¼presentation.mdãThe spineãï¼ã
  const actorModels = useWorkflowActorModelLabels(run?.actors, subagentModelProviderName);
  // æ­£å¨è¿è¡çç«èªå·±å±å¼ââå¸¦éä¸¤æ¡è½¨éå¯ä»¥åæ¶å¨è·ï¼**æ¯ä¸ä¸ª**é½è¦å¼ï¼ä¸åªæå³é£ä¸ªã
  // ç¨ä¸ä¸ªç¨³å®çé®è®°ä½è¿ä¸ç» idï¼æå½±æ¯å¨ä¸æ¬¡æ¨¡åé½æ¢èº«ä»½ï¼ä½è¿ä¸ç»éå¸¸ä¸åã
  const runningKey = model.stations
    .filter((station) => station.status === "running")
    .map((station) => station.id)
    .join("\u0000");
  const runningIds = useMemo(
    () => (runningKey === "" ? [] : runningKey.split("\u0000")),
    [runningKey],
  );
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(runningIds));
  useEffect(() => {
    setOpen((previous) =>
      runningIds.every((id) => previous.has(id)) ? previous : new Set([...previous, ...runningIds]),
    );
  }, [runningIds]);
  const toggle = useCallback((id: string) => {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  // ååç«çé¨ï¼å¼çå³ååºååï¼æ¸åçå±é¨ç¶æï¼æç«è®°ã
  const [listed, setListed] = useState<ReadonlySet<string>>(() => new Set());
  const toggleListed = useCallback((id: string) => {
    setListed((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // è½ç¹ï¼å±å¼ + å¼é¨ + äº®ä¸ä¸ï¼æ»å¨å¨ä¸ä¸æ¬¡æäº¤ä¹åï¼é£ä¸èå¾åå±å¼ææèå¤´å¯æ»ï¼ã
  // `landed` æè½ç¹çé®è®°ï¼ä¸æ¯æç«ï¼ï¼åä¸ç«åè½ä¸æ¬¡ï¼é®åäºãæ»å¨ä¸äº®ä¸ä¸å°±é½åæ¥ä¸éã
  const rootRef = useRef<HTMLDivElement>(null);
  const landedOnceRef = useRef<string | undefined>(undefined);
  const [landed, setLanded] = useState<{ phaseId: string; key: string } | undefined>(undefined);
  useEffect(() => {
    if (landing === undefined || landedOnceRef.current === landing.key) return undefined;
    landedOnceRef.current = landing.key;
    const { phaseId } = landing;
    setOpen((previous) => (previous.has(phaseId) ? previous : new Set([...previous, phaseId])));
    setListed((previous) => (previous.has(phaseId) ? previous : new Set([...previous, phaseId])));
    setLanded(landing);
    const timer = setTimeout(
      () => setLanded((current) => (current?.key === landing.key ? undefined : current)),
      LANDING_MS,
    );
    return () => clearTimeout(timer);
  }, [landing]);
  useEffect(() => {
    if (landed === undefined) return;
    const root = rootRef.current;
    if (root === null) return;
    const section = [...root.querySelectorAll<HTMLElement>("[data-phase-id]")].find(
      (candidate) => candidate.getAttribute("data-phase-id") === landed.phaseId,
    );
    const head = section?.querySelector<HTMLElement>('[data-testid="workflow-run-phase-toggle"]');
    if (head === undefined || head === null || typeof head.scrollIntoView !== "function") return;
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    head.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [landed]);

  // ç­å¾æ¶é¿è¦èªå·±èµ°ï¼ä¸ä¸ªå¨ç­ç­æ¡ï¼æç­è¡¥å¨ï¼ç run **æ°æ°ä¸åäºä»¶**ãå®æ¶å¨åªå¨æäººå¨ç­æ¶å­å¨ã
  const [now, setNow] = useState(() => Date.now());
  const hasQuestions =
    pendingQuestions.length > 0 ||
    model.stations.some((station) => station.hole?.state === "waiting");
  useEffect(() => {
    if (!hasQuestions) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), QUESTION_TICK_MS);
    return () => clearInterval(timer);
  }, [hasQuestions]);
  // æ­£å¨ç­è¡¥å¨ççç½èªå·±å±å¼ï¼ä¸æ­£å¨è¿è¡çç«åä¸æ¡è§åï¼å®æ¯å½åç«ï¼ã
  const waitingHoleKey = model.stations
    .filter((station) => station.hole?.state === "waiting")
    .map((station) => station.id)
    .join("\u0000");
  useEffect(() => {
    if (waitingHoleKey === "") return;
    const ids = waitingHoleKey.split("\u0000");
    setOpen((previous) =>
      ids.every((id) => previous.has(id)) ? previous : new Set([...previous, ...ids]),
    );
  }, [waitingHoleKey]);

  const questionsByInstance = useMemo(() => {
    const byKey = new Map<string, WorkflowRunPendingQuestion[]>();
    for (const question of pendingQuestions) {
      const key = questionKey(question);
      if (key === undefined) continue;
      const list = byKey.get(key) ?? [];
      list.push(question);
      byKey.set(key, list);
    }
    return byKey;
  }, [pendingQuestions]);
  const attachedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const station of model.stations) {
      for (const pill of station.pills) {
        const key = pillKey(pill);
        if (key !== undefined) keys.add(key);
      }
    }
    return keys;
  }, [model]);
  const orphanQuestions = pendingQuestions.filter((question) => {
    const key = questionKey(question);
    return key === undefined || !attachedKeys.has(key);
  });
  // æ¯ä¸èè¦ç»çç«è½¨ä¸èé´çæ¥å¤´è¡ï¼`workflowRunSpine.ts`ï¼ï¼æå­åæ´æ ¹èçº¿å±ç¨ä¸ä¸ªå·¦ç¼ã
  const spine = spineLayout(model);
  // è¡¥å¨çæ¡ï¼WorkflowRunFillFrames.tsxï¼ï¼å¤´ï¼æ é¢è¡ / ç¬æ ï¼ä¸æ¬åæé®çç¦ç¹æ¶ç»åºé£ä¸ä¸ªã
  const fillFrames = useSpineFillFrames(rootRef, model);
  const textColumn = spine.gutter === 0 ? undefined : { paddingLeft: 39 + spine.gutter };
  // è¯ä¸¸çå½åãæå¼ä¸å°¾æ§½ï¼WorkflowRunPhasePills.tsxï¼ã
  const { nameOf, pillProps, renderPill } = phasePillRenderers({
    actorModels,
    format,
    graph,
    model,
    now,
    questionsByInstance,
    run,
    ...(onOpenActor === undefined ? {} : { onOpenActor }),
    ...(onOpenWorkspace === undefined ? {} : { onOpenWorkspace }),
  });

  return (
    <div
      className="wf-motion relative flex min-h-0 flex-1 flex-col overflow-auto pb-3 pt-2.5"
      data-testid="workflow-run-phases"
      ref={rootRef}
      {...fillFrames.handlers}
    >
      {fillFrames.frames}
      {model.stations.map((station, index) => {
        const expanded = open.has(station.id);
        const name = phaseDisplayName(station.naming, format);
        const status = station.status ?? "pending";
        const pending = status === "pending";
        const section = spine.sections[index] ?? { rails: [] };
        const roster = stationRosterOf(station, ROSTER_PINS_PANE);
        // çç½ï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãçãThe paneãï¼ï¼èå¤´æ¢èçº¿ç¯ï¼
        // ç­å¾æ¶èä½è¯´ç­äºå¤ä¹ãæé¶æ®µçè¡¥å¨å¨å®åä¸çç¬¬ä¸èåå¤ä¸è¡æ é¢ï¼é£å èä¸ç¼©è¿ï¼åµå¥ç±æ¡è¯´åºï¼ã
        const hole = station.hole;
        // åèµ·äºè¿ä¸èçè¡¥å¨åæä¸è¡æ é¢ï¼å¤å±å¨åï¼æ¨¡åçæ¬¡åºï¼ï¼åå±çæ¡ä»å®èªå·±çæ é¢éèµ·ã
        const headings = (model.fills ?? []).filter((fill) => fill.from === index);
        const column = textColumn;
        return (
          <Fragment key={station.id}>
            <SpineJointRow joint={section.fork} kind="fork" pitch={spine.pitch} />
            {headings.map((heading) => (
              <FillHeadingRow
                fill={heading}
                fresh={fillFrames.fresh.has(heading.holeId)}
                key={heading.holeId}
                on={fillFrames.active === heading.holeId}
                onSelect={() => toggle(station.id)}
                textColumn={textColumn}
              />
            ))}
            <section
              className="relative"
              data-phase-fill={station.fill}
              data-phase-hole={hole?.state}
              data-phase-id={station.id}
              data-phase-landed={landed?.phaseId === station.id ? "true" : undefined}
              data-phase-open={expanded ? "true" : "false"}
              data-phase-status={status}
              data-phase-track={station.track}
              data-testid="workflow-run-phase"
            >
              <SpinePieces pitch={spine.pitch} section={section} />
              <button
                aria-expanded={expanded}
                aria-label={intl.formatMessage(
                  {
                    id: expanded
                      ? "chat.toolCall.workflow.run.phase.collapse"
                      : "chat.toolCall.workflow.run.phase.expand",
                  },
                  { name },
                )}
                className={cn(
                  "wf-station-open relative flex h-9 w-full items-center gap-2 pl-[39px] pr-3 text-left outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring/40",
                  landed?.phaseId === station.id && "wf-landed",
                )}
                data-testid="workflow-run-phase-toggle"
                // åè½æ¶æ¢ key éæèå¤´ï¼åä¸ä¸ªç±»åä¸ä¼è®© CSS å¨ç»éæ¥ã
                key={landed?.phaseId === station.id ? landed.key : "head"}
                onClick={() => toggle(station.id)}
                style={column}
                type="button"
              >
                {hole !== undefined && hole.state !== "filled" ? (
                  <SpineHoleLamp hole={hole} pitch={spine.pitch} track={station.track} />
                ) : (
                  <SpineLamp pitch={spine.pitch} status={status} track={station.track} />
                )}
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-ui-base",
                    pending ? "text-foreground-subtle" : "font-medium text-foreground",
                  )}
                >
                  {name}
                </span>
                {hole?.state === "filled" ? <HoleFillMark holeId={hole.siteId} /> : null}
                <span className="flex shrink-0 items-center gap-2.5 font-mono text-ui-xs tabular-nums text-foreground-subtlest">
                  {expanded ? null : roster !== undefined ? (
                    <RosterMeter counts={roster.counts} mini />
                  ) : (
                    <AvatarCluster nameOf={nameOf} pills={station.pills} />
                  )}
                  {station.fraction === undefined ? null : (
                    <span data-testid="workflow-run-phase-fraction">
                      {station.fraction.settled}/{station.fraction.observed}
                    </span>
                  )}
                  <Rounds station={station} />
                  <ChevronRightIcon
                    aria-hidden
                    className={cn("size-3.5 transition-transform", expanded && "rotate-90")}
                  />
                </span>
              </button>
              {expanded ? (
                <div
                  className="wf-unfold flex flex-col gap-1.5 pb-3 pl-[39px] pr-3 pt-0.5"
                  data-testid="workflow-run-phase-body"
                  style={column}
                >
                  {hole?.state === "waiting" ? <HoleWaitingBody hole={hole} now={now} /> : null}
                  {roster === undefined ? (
                    station.pills.map(renderPill)
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5" data-testid="workflow-roster-pins">
                        {roster.pinned.map(renderPill)}
                      </div>
                      <WorkflowMoreRow
                        door={{
                          open: listed.has(station.id),
                          tally: rosterRestCounts(roster),
                        }}
                        more={rosterMore(roster)}
                        onOpen={() => toggleListed(station.id)}
                      />
                      {listed.has(station.id) ? (
                        <WorkflowRoll
                          groups={rosterRoll(roster)}
                          unlisted={roster.unlisted.actors}
                          renderRow={(pill, enterDelayMs) => (
                            <WorkflowAgentPill
                              enterDelayMs={enterDelayMs}
                              key={pill.key}
                              size="row"
                              {...pillProps(pill)}
                            >
                              {/* ç¬¬å­ä¸ªåä»¥åçæé®èè½å¨ååéï¼å°¾æ§½åä¸æ ?ï¼é®é¢æ¬èº«ä¸å¨è¿ééå¤ã */}
                              {pill.asking === true ? (
                                <CircleHelpIcon
                                  aria-hidden
                                  className="size-3 shrink-0 text-warning"
                                  data-testid="workflow-roll-asking"
                                />
                              ) : null}
                            </WorkflowAgentPill>
                          )}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </section>
            <SpineJointRow joint={section.merge} kind="merge" pitch={spine.pitch} />
          </Fragment>
        );
      })}
      {orphanQuestions.length === 0 ? null : (
        <div
          className="flex flex-col gap-1 pl-[39px] pr-3 pt-2"
          data-testid="workflow-run-orphan-questions"
          style={textColumn}
        >
          <span className="text-ui-xs font-medium text-foreground-subtle">
            {intl.formatMessage({ id: "chat.toolCall.workflow.run.questions.title" })}
          </span>
          {orphanQuestions.map((question) => (
            <WorkflowRunQuestionRow key={question.qid} now={now} question={question} showAsker />
          ))}
        </div>
      )}
    </div>
  );
});

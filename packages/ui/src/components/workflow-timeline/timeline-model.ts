import type { WorkflowRunState } from "@zcode/shared/zcode-protocol-v4";
import { laneRefsById, type LaneRef } from "@/components/workflow-graph/lane-name.js";
import {
  collapseStatuses,
  liveParticipantView,
  participantStatus,
  participantsOfPhase,
  withImplicitPhase,
} from "@/components/workflow-graph/participant-model.js";
import { phaseBinder } from "@/components/workflow-graph/instance-phases.js";
import type { PhaseNaming } from "@/components/workflow-graph/phase-name.js";
import { phaseMembers } from "@/components/workflow-graph/phase-model.js";
import { workflowRunOverlay } from "@/components/workflow-graph/run-status.js";
import {
  laneClassOf,
  type LaneClass,
  type StepRunStatus,
  type WorkflowCausalityGraphData,
} from "@/components/workflow-graph/types.js";
import { sharedTimelineModel } from "./timeline-cache.js";
import {
  isCurrentPhase,
  phaseStreamIndexes,
  stageStatuses,
  stationStatus,
  streamInk,
} from "./stage-lamps.js";
import {
  holeTable,
  railTouchesHole,
  stationFillOf,
  tailStubOf,
  timelineHoleGraph,
  type HoleLabels,
  type TimelineFill,
  type TimelineHole,
} from "./timeline-holes.js";
import {
  observePhase,
  phaseEntryFor,
  siteIdsOf,
  stationUnlisted,
  type StationUnlisted,
} from "./station-observation.js";
import {
  assignAirLanes,
  bandOf,
  foldPhaseBands,
  foldPhaseEdges,
  trackOf,
  type RailSpec,
  type TimelineRailKind,
} from "./timeline-bands.js";

/**
 * æ¶é´çº¿æ¨¡åã
 *
 * ä¸ä¸ªçº¯å½æ°ææç display ä¸ `workflowRuns` æå½±ææä¸æ ·ä¸è¥¿ï¼ç«ï¼é¶æ®µï¼ãè½¨éæ®µï¼ç¸é»ä¸
 * æè¾¹çä¸¤ç«ä¹é´ï¼ãå¼§ï¼éç¸é»çè¾¹ï¼ãèå¤©å¡ãç¡®è®¤çªä¸ä¾§æ æ¸åé½ä»è¿éåºåââä¸åå¼ 1
 * ãä¸ä¸ªæ¨¡åï¼ä¸å¤æ¶è´¹ããæ  Reactãæ  DOMãæ æ¶é´ã
 *
 * é¡ºåºæ¯**å£°æåº**ï¼è½½è· `phases[]` = é¦ä¸ª `phase()` æ è®°çé¡ºåºï¼ï¼ä¸ååç§©ï¼ä¸¤ä¸ªåªå±äº«åé©±ç
 * åå¼é¶æ®µç§å£°æåºææä¸åï¼å®ä»¬ä¹é´çè¾¹æä¸ºå¼§ãåè¾¹æ**æ¹å**å¤å®ï¼ç®æ ç«å¨å·¦ï¼ï¼ä¸è¯»è½½è·
 * ç `back`ââåæå¨æåå¥ï¼ç¬¬äºä¸ª `phase("plan")` æ è®°ï¼æ æååè¾¹ï¼ç»é¢ä¸å®ä»ç¶åå·¦ã
 */

export type TimelineInk = "faint" | "strong" | "march";
export type { TimelineRailKind } from "./timeline-bands.js";
// å¼§çåéæ¯çº¯ä¸æ çç»åå­¦ï¼ä¸å¸¦çæå åä½ timeline-bands.tsï¼è¿éè½¬åºå»ï¼æ¸²æå±çå¥å£ä¸åã
export { arcLaneCount, assignArcLanes } from "./timeline-bands.js";

export interface TimelinePill {
  /** æååçåä¸è idï¼å®ä¾å¡ `${participant}@${ordinal}`ï¼ï¼React key ä¸æå¼å®ä¾çææã */
  key: string;
  lane: LaneRef;
  laneClass: LaneClass;
  /** å¼æååºçè¿è¡æ¶åï¼persona å¯è½æ¹åèæ¬éçåå­ï¼ï¼ç¼ºå¸­æ¶æ¸²æè½¦éæ¾ç¤ºåã */
  runtimeName?: string;
  /** workflow åæä»£çèº«ä»½åéçå¤´åç¼å·ï¼è·¨é¶æ®µå¤ç¨ã */
  avatarIndex?: number;
  /** æ  run æ¶ undefinedï¼éæè¯ä¸¸ï¼ä¸ pending éåç´ ç¸åï¼ã */
  status: StepRunStatus | undefined;
  /** è¯¥è¯ä¸¸å¨æå½±éå¯¹åºçå®ä¾ï¼åæè½¦éï¼workspace / unknownï¼æ²¡æã */
  instance?: { siteId: string; ordinal: number; sessionId?: string };
  /**
   * è¯ä¸¸äº¤åºçæ§½ä½èº«ä»½ï¼æå®ä¾å°±æ¯å®ä¾çåºå·ï¼æ²¡æå®ä¾å°±æ¯å®**å°æ¥**
   * çåºå·ââæåå¡ `member.index + 1`ï¼åå¡ä¸ `many` å¡ 1ï¼å¼ææç«ç¹é¡ºåºåå·ï¼ãåªææ´»ç run
   * éç agent è½¦éææï¼æäºå®ï¼è¿æ²¡å¯å¨çå­ä»£çä¹è½å¼ä¸ä¸ªå ä½ç transcript tabã
   */
  slot?: { siteId: string; ordinal: number };
  /**
   * èæ¬è¯ä¸¸äº¤åºçææï¼
   * å®æ²¡æå®ä¾ãæ²¡æä¼è¯ï¼è½å¼çæ¯**æ´ä¸ª run çèæ¬ transcript**ï¼è½å°è¿ä¸ç«çç¬¬ä¸å¼ å¡ã
   * ä¸ `slot` äºæ¥ï¼åªææ´»ç run éç workspace è½¦éææï¼æ²¡æ run å°±æ²¡æå¯å¼çä¸è¥¿ã
   */
  workspace?: { phaseId: string };
  /** è¯¥åä¸èå¨æ¬é¶æ®µç step idï¼ä¾§æ è¡çæ´»å¨ä¸è®¡æ°ç´ æï¼ã */
  stepIds: string[];
  /** è¯¥å®ä¾æå¾ç­çåçº§é®é¢ï¼`run.pendingQuestions`ï¼ï¼ååçéä½è§åè¯»å®ã */
  asking?: true;
}

export interface TimelineStation {
  id: string;
  naming: PhaseNaming;
  pills: TimelinePill[];
  /** æå step ç¶æçæå ï¼æ  run æ¶ undefinedã */
  status: StepRunStatus | undefined;
  /** æå½±éå­å¨ä»»ä¸èç¹è½å¨è¯¥ç«çç«ç¹ä¸ã */
  visited: boolean;
  /** è¯¥ç«ç«ç¹ä¸èç¹çæå¤§ ordinalï¼0 = æªå°ã */
  rounds: number;
  /** æ¯ä»»ä¸åè¾¹ï¼åå·¦çå¼§ï¼çæºæç®æ ââåªæè¿æ ·çç«ææ¾ç¤º `â³ n`ã */
  onLoop: boolean;
  /** æå¨çè½¨éï¼`timeline-bands.ts`ï¼ï¼å¸¦å¤ä¸å¾ 0ï¼ä¹å°±æ¯ä¸»çº¿ã */
  track: number;
  /** `settled / observed`ï¼ä¸ä¸ªèç¹é½æ²¡è§å¯å°æ¶ç¼ºå¸­ãè¡¨å¤å·²ç»ç®çå®ä¾ä¹å¨è¿ä¸¤ä¸ªæ°éã */
  fraction?: { settled: number; observed: number };
  /** çå¨è¿ä¸ç«è±æçè¡¨å¤æ¡ç®ï¼`station-observation.ts`ï¼ï¼ä¸æ¡é½æ²¡å°æ¶ç¼ºå¸­ã */
  unlisted?: StationUnlisted;
  /** æµå¼èç¨¿éå°æªé­åçæåä¸ç«ã */
  typing?: true;
  /** è¿ä¸ç«æ¯ä¸å¤çç½ï¼`timeline-holes.ts`ï¼ï¼èçº¿ç¯ãç±»åå¾½æ ï¼ç­å¾æ¶æ¯å½åç«ã */
  hole?: TimelineHole;
  /** è¿ä¸ç«æ¯ææ¬¡è¡¥å¨åè¿æ¥çï¼display é¶æ®µä¸ç `fill`ï¼ï¼æ¬åæ¶å®æå¨çè¡¥å¨åºåäº®èµ·ã */
  fill?: string;
  /** è¡¥å¨è¡çèç¨¿é¶æ®µçº¿éçé»ç«ï¼åªä½ä¸ä¸æï¼40% å¢¨ã */
  ghost?: true;
}

/** ä¸æ¡è½¨éä¸ååç¸æ¥çä¸¤ç«ä¹é´çä¸æ®µè½¨éï¼ä¸æ æå `stations`ã */
export interface TimelineRail {
  from: number;
  to: number;
  ink: TimelineInk;
  /**
   * ç¼ºå¸­ = ä¸æ¡è½¨éä¸çæ®éæ®µï¼å¸¦çä¸¤ç«¯æ¯ `fork` / `merge`ï¼å¸¦åè·¨è½¨éçç¸é»ä¸¤ç«æ¯ `twin`ï¼åä¸æ¡
   * è½¨éä¸ç¸é»ä¸¤ç«ä¹é´çé¶æ®µæµæ¯ `stream`ï¼å¢¨ï¼ä¸¤ç«¯é½å¨è· `march`ï¼æä¸è¥¿è¿å»è¿ `strong`ï¼ã
   */
  kind?: TimelineRailKind;
  /** è§¦å°å¼ç / ç­çççç½ï¼ç»æèçº¿ï¼é£éè¿ä¸æ¯ä»£ç ï¼ã */
  dashed?: true;
}

/**
 * éç¸é»çè¾¹ï¼`to < from` æ¯åè¾¹ã`lane` ä» 0 èµ·ï¼è´´è¿è½¨éçæ¯ 0ï¼åªæå¨ x ä¸**ç¸äº¤**çå¼§æåé
 * ï¼è§ {@link assignArcLanes}ï¼ï¼äºä¸ç¸å¹²çå¼§åé«ã
 */
export interface TimelineArc {
  from: number;
  to: number;
  lane: number;
  ink: TimelineInk;
  /** ç»å¨åªæ¡è½¨éçç©ºä¸­ï¼åéæç©ºåç®åçï¼æä»¥ `arcLaneCount` è¦åæ `air` ç­ã */
  air: number;
  /** ä¸ç¸é»çé¶æ®µæµï¼å¢¨ææµçè§åï¼ä¸è¡è¿ï¼ä¸è®©ç«ä¸ç¯ã */
  stream?: true;
}

/** å¸¦åçä¸æ¡è½¨éï¼`stations` æ¯å®çæåï¼å£°æåºã */
export interface TimelineTrack {
  stations: number[];
  /** ååè¿å¥è¿æ¡è½¨éçå¢¨ï¼æ²¡æåé©±æ¶æé¦ç«å°æ²¡å°è¿ã */
  entry: TimelineInk;
  /** è¿æ¡è½¨éæ±ååºå»çå¢¨ï¼æ²¡ææ±åç«æ¶ææ«ç«å°æ²¡å°è¿ã */
  exit: TimelineInk;
}

/** ä¸æ¡å¸¦ï¼å£°æåºä¸è¿ç»­çä¸æ®µç«ï¼æå°è¥å¹²è½¨éä¸ï¼å¼§æå®å½ä¸ä¸ªèç¹ï¼`timeline-bands.ts`ï¼ã */
export interface TimelineBand {
  from: number;
  to: number;
  /** ååæå¨çåé©±ç«ï¼ç¼ºå¸­æ¶ç»é¢ä¸åªæä¸å°æªå°¾å·´ã */
  pred?: number;
  /** æ±åæå¨çåç»§ç«ï¼ç¼ºå¸­æ¶ç»é¢ä¸åªæä¸å°æªæ®æ®µã */
  join?: number;
  tracks: TimelineTrack[];
}

export interface WorkflowTimelineModel {
  stations: TimelineStation[];
  rails: TimelineRail[];
  arcs: TimelineArc[];
  /** å¹¶è¡é¶æ®µææçå¸¦ï¼æ `from` ååºï¼æ²¡æ `alongside` çæ¶é´çº¿æ¯ç©ºçã */
  bands: TimelineBand[];
  /** æ­£å¨è¿è¡çç«ï¼å¤ä¸ªæ¶åæå³ï¼ï¼æ å undefinedã */
  runningIndex: number | undefined;
  /** æ¯å¦æ run æå½±åä¸ï¼å³å®ç¯ / å¢¨è¿¹æ¯å¦æè¯è¯´ï¼ã */
  live: boolean;
  /** æµå¼èç¨¿ï¼ç«ç±ç¬éå­ååºï¼å­ä»£çåªè®¡æ°ä¸ç»ï¼`draft-scan.ts`ï¼ãåæå¨çæ¨¡åæ²¡æå®ã */
  draft?: { agents: number };
  /** æé¶æ®µçè¡¥å¨çä¸çå¤´ï¼`timeline-holes.ts`ï¼ï¼æ `from` ååºï¼æ²¡æè¡¥å¨æ¶ä¸ºç©ºã */
  fills?: TimelineFill[];
  /** çç½ id â åçå®ççç½ idï¼`timeline-holes.ts` ç holeParentsOfï¼ï¼æ¬åæ¶å¤å±åºåæ®æ­¤äº®èµ·ã */
  holeParents?: Readonly<Record<string, string>>;
  /** æ«ç«æ¯å°¾å·´çç½ï¼`open` ç» 40px æ·¡åºçèçº¿æ®æ®µï¼`filled` åªç 40px ä½å°ã */
  tailStub?: "open" | "filled";
}

/**
 * ä¸ä¸ªæ¨¡åï¼ä¸å¤æ¶è´¹ï¼ä¸åå¼ 1ï¼ï¼å¡ãè¯¦æé¡µä¸ä¾§æ æ¸åå¨åä¸å¸§éæ¿å°**åä¸ä¸ª**æ¨¡åå¯¹è±¡ï¼
 * æ (graph, run) çå¯¹è±¡èº«ä»½è®°å¿ââä¸ºä»ä¹èº«ä»½æ¯æ­£ç¡®çé®è§ `timeline-cache.ts`ãæ¨¡åæ¯åªè¯»çï¼
 * æ²¡ææ¶è´¹èæ¹å®ï¼æä»¥å±äº«é¡ºå¸¦ä¹æ¯å¼ç¨ç¨³å®æ§çæ¥æºã
 */
export function buildWorkflowTimeline(
  input: WorkflowCausalityGraphData,
  run: WorkflowRunState | undefined,
  /**
   * è¡¥å¨è¿ççç½çåä¸ç±»åï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãï¼ï¼æ²¡æ run ç
   * éæå¾ï¼ç¡®è®¤çªãè¡¥å¨è¡ï¼ä»å·¥å·å¥åéè¿æ¥ãç»äºå®å°±ä¸èµ°å±äº«ç¼å­ââé£å¼ è¡¨æ¯æ (graph, run) é®çã
   */
  holeLabels?: HoleLabels,
): WorkflowTimelineModel {
  if (holeLabels !== undefined) return computeWorkflowTimeline(input, run, holeLabels);
  return sharedTimelineModel(input, run, () => computeWorkflowTimeline(input, run, undefined));
}

function computeWorkflowTimeline(
  input: WorkflowCausalityGraphData,
  run: WorkflowRunState | undefined,
  holeLabels: HoleLabels | undefined,
): WorkflowTimelineModel {
  // å¤´å·²ä»£è¡¨ççç½é¶æ®µä¸æç«ï¼ç¶è¡¨ä»æ¶ç¼©ä¹åçå¾ç®ï¼åµå¥æä¸æ­ï¼timeline-holes.tsï¼ã
  const { graph, parents, phases } = timelineHoleGraph(withImplicitPhase(input));
  const index = new Map(phases.map((phase, i) => [phase.id, i]));
  const members = phaseMembers(graph);
  const holes = holeTable(graph, phases, run, holeLabels, parents);
  const overlay = workflowRunOverlay(run, graph);
  const live = liveParticipantView(graph, run);
  const binder = phaseBinder(graph, run);
  const laneRefs = laneRefsById(graph.lanes);
  const sessionByInstance = new Map(
    (run?.actors ?? []).map((actor) => [`${actor.siteId}@${actor.ordinal}`, actor.sessionId]),
  );
  const askingInstances = new Set(
    (run?.pendingQuestions ?? [])
      .filter(
        (question) => question.actorSiteId !== undefined && question.actorOrdinal !== undefined,
      )
      .map((question) => `${question.actorSiteId}@${question.actorOrdinal}`),
  );

  // è¾¹ï¼åæä¸æ å»éï¼èªç¯ä¸æåæªååºé¶æ®µçè¾¹å¨è¿ä¸ç²åº¦ä¸æ²¡æè¯è¯´ï¼ï¼åäº¤ç»å¸¦çæå ââ
  // ç¸é»çæè½¨éæ®µï¼å¶ä½æå¼§ï¼å¸¦æååä¸æ±åé£å æ¡åæï¼`timeline-bands.ts`ï¼ã
  const edges: { from: number; to: number }[] = [];
  const seen = new Set<string>();
  for (const edge of graph.phaseEdges ?? []) {
    const from = index.get(edge.from);
    const to = index.get(edge.to);
    if (from === undefined || to === undefined || from === to) continue;
    const key = `${from}>${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ from, to });
  }
  // é¶æ®µæµï¼specãStreamsãï¼ï¼åæ ·æä¸æ å»éï¼å®ä»¬æä¸æ¡çº¿ä¸ç stage ä»å¸¦éæ¿åºæ¥ã
  const streams = phaseStreamIndexes(graph.phaseStreams, index);
  const alongsideIndexes = phases.map((phase) =>
    (phase.alongside ?? []).flatMap((id) => {
      const at = index.get(id);
      return at === undefined ? [] : [at];
    }),
  );
  const folded = foldPhaseBands(phases.length, alongsideIndexes, streams);
  const fold = foldPhaseEdges(phases.length, folded, edges, streams);
  const arcPairs = [...fold.arcs].sort(
    (left, right) => Math.abs(left.from - left.to) - Math.abs(right.from - right.to),
  );
  // åè¾¹çä¸¤ç«¯ä¸ç¯ï¼ç«¯ç¹å¨å¸¦éæ¶æ´æ¡å¸¦é½ä¸ç¯ââå¸¦æ¯ä¸ä¸ªèç¹ï¼åå¥çæ¯æ´æ¡å¸¦ã
  const onLoop = new Set<number>();
  for (const arc of arcPairs) {
    if (arc.to >= arc.from || arc.stream) continue;
    for (const end of [arc.from, arc.to]) {
      const band = bandOf(folded, end);
      if (band === undefined) onLoop.add(end);
      else for (let i = band.from; i <= band.to; i += 1) onLoop.add(i);
    }
  }

  // åç§°åå¸ä¼ç¢°æï¼ä»¥å®ä¾èº«ä»½åéè¿ç»­ç¼å·ï¼åä¸ä»£çè·¨é¶æ®µä¿æåä¸å¤´åã
  const avatarIndexes = new Map<string, number>();
  const nodeStatuses: (StepRunStatus | undefined)[] = [];
  const entered: boolean[] = [];
  const hasMembers: boolean[] = [];
  const stations: TimelineStation[] = phases.map((phase, i) => {
    const memberSteps = members.get(phase.id) ?? [];
    const unlisted = stationUnlisted(run, binder, phase.id);
    const observed = observePhase(
      run,
      siteIdsOf(memberSteps),
      phaseEntryFor(run, phase.name),
      (node) => binder.has(phase.id, node.phaseName),
      unlisted,
    );
    const pills: TimelinePill[] = participantsOfPhase(live.graph, phase.id).map((participant) => {
      const instance = live.instances[participant.id];
      const lane = laneRefs.get(participant.lane) ?? {
        id: participant.lane,
        laneClass: laneClassOf(participant.lane),
      };
      // æå ä¸ºç©º = è¿ä¸ªå­ä»£çå¨è¿ä¸ç«ãè¿ä¸æ¬¡ run éä»ä¹é½æ²¡åï¼ç©ºå¿æ¯è¯å®çãundefined åªçç»
      // æ  run çéæè¯ä¸¸ã
      const status =
        run === undefined
          ? undefined
          : (participantStatus(participant, overlay.statuses, live.participantStatuses) ??
            "pending");
      const sessionId =
        instance === undefined
          ? undefined
          : sessionByInstance.get(`${participant.lane}@${instance.ordinal}`);
      const slot =
        run !== undefined && lane.laneClass === "agent"
          ? {
              ordinal: instance?.ordinal ?? (participant.member?.index ?? 0) + 1,
              siteId: participant.lane,
            }
          : undefined;
      const avatarKey = `${participant.lane}@${instance?.ordinal ?? (participant.member?.index ?? 0) + 1}`;
      if (lane.laneClass === "agent" && !avatarIndexes.has(avatarKey)) {
        avatarIndexes.set(avatarKey, avatarIndexes.size);
      }
      return {
        ...(lane.laneClass === "agent" ? { avatarIndex: avatarIndexes.get(avatarKey)! } : {}),
        key: participant.id,
        lane,
        laneClass: lane.laneClass,
        ...(instance?.name === undefined ? {} : { runtimeName: instance.name }),
        status,
        ...(instance === undefined
          ? {}
          : {
              instance: {
                ordinal: instance.ordinal,
                siteId: participant.lane,
                ...(sessionId === undefined ? {} : { sessionId }),
              },
            }),
        ...(slot === undefined ? {} : { slot }),
        ...(run !== undefined && lane.laneClass === "workspace"
          ? { workspace: { phaseId: phase.id } }
          : {}),
        stepIds: [...participant.steps],
        ...(instance !== undefined && askingInstances.has(`${participant.lane}@${instance.ordinal}`)
          ? { asking: true as const }
          : {}),
      };
    });
    const nodeStatus = collapseStatuses(
      memberSteps.map((step) => step.id),
      overlay.statuses,
    );
    nodeStatuses.push(nodeStatus);
    entered.push(observed.entered);
    hasMembers.push(memberSteps.length > 0);
    // åå¨çç½ä¸ç runï¼é£ä¸ç«å°±æ¯å½åç«ï¼è¿å¥å®çæ®µè¡è¿ãéå¤´å¯¹åå®ï¼ï¼ç¯çç»æ³ç± `hole` è¯´ã
    const hole = holes.byPhase.get(phase.id);
    const waiting = hole?.state === "waiting";
    return {
      id: phase.id,
      naming: { id: phase.id, ...(phase.name === undefined ? {} : { name: phase.name }) },
      pills,
      status: waiting
        ? "running"
        : stationStatus(run, nodeStatus, isCurrentPhase(run, phase.name), observed.entered),
      visited: observed.visited || waiting,
      rounds: observed.rounds,
      ...(hole === undefined ? {} : { hole }),
      ...stationFillOf(phase, hole),
      onLoop: onLoop.has(i),
      track: trackOf(folded, i),
      ...(observed.observed === 0
        ? {}
        : { fraction: { observed: observed.observed, settled: observed.settled } }),
      ...(unlisted === undefined ? {} : { unlisted }),
    };
  });

  // stage çç¯ï¼specãStation statusãï¼ï¼å¹¶è¡æææµãä¸ææå step çç«åªçèªå·±çèç¹ä¸åå®çç«ã
  const staged = stageStatuses({
    alongside: alongsideIndexes,
    entered,
    hasMembers,
    nodeStatuses,
    run,
    sequential: stations.map((station) => station.status),
    streams,
  });
  // ç­çè¡¥å¨ççç½ç§æ§æ¯ runningï¼run åå¨å®ä¸é¢ï¼ï¼å®å¨ future éæ¶ä¹æ¯å¹¶è¡ç«ï¼ä¸è®© stage è§å
  // æãæ²¡æèç¹ â pendingãæå®æ¹æï¼dwf-recursive ä¸ dwf-pipeline-display åå¹¶æ¶å¯¹é½çä¸¤æ¡è§åï¼ã
  stations.forEach((station, i) => {
    if (station.hole?.state !== "waiting") station.status = staged[i];
  });

  const visited = (i: number): boolean => stations[i]?.visited === true;
  let runningIndex: number | undefined;
  for (let i = stations.length - 1; i >= 0; i -= 1) {
    if (stations[i]?.status === "running") {
      runningIndex = i;
      break;
    }
  }

  const rails: TimelineRail[] = fold.rails.map((rail: RailSpec) => ({
    from: rail.from,
    ink:
      rail.kind === "stream"
        ? streamInk(stations[rail.from]!, stations[rail.to]!)
        : visited(rail.from) && visited(rail.to)
          ? ("strong" as TimelineInk)
          : "faint",
    ...(rail.kind === undefined ? {} : { kind: rail.kind }),
    to: rail.to,
    ...(railTouchesHole(stations, rail) ? { dashed: true as const } : {}),
  }));
  const lanes = assignAirLanes(arcPairs);
  const arcs: TimelineArc[] = arcPairs.map((arc, at) => {
    const back = arc.to < arc.from;
    const strong = back
      ? visited(arc.from) && (stations[arc.to]?.rounds ?? 0) >= 2
      : visited(arc.from) && visited(arc.to);
    return {
      air: arc.air,
      from: arc.from,
      ink: arc.stream
        ? streamInk(stations[arc.from]!, stations[arc.to]!)
        : strong
          ? "strong"
          : "faint",
      lane: lanes[at] ?? 0,
      ...(arc.stream ? { stream: true as const } : {}),
      to: arc.to,
    };
  });

  // è¡è¿è¾¹ï¼ä»ä¸ä¸ä¸ªå·²ç»ç®çé¶æ®µè¿å¥æ­£å¨è¿è¡çé¶æ®µçé£ä¸æ¡ãæå½±æ²¡ææ¶é´æ³ï¼æä»¥æä¸æ¡è§å
  // åæè¯å®çä¸æ¡ï¼åå¥çåè¾¹ > è¿å¥è¯¥ç«çè½¨éæ®µ > ä»»ä¸è½å¨è¯¥ç«çå¼§ã
  // æ¯ä¸ªæ­£å¨è¿è¡çç«åèµ°ä¸éââå¸¦éä¸¤æ¡è½¨éå¯ä»¥åæ¶å¨è·ï¼å®ä»¬åèªçååé½è¯¥äº®ã
  for (let r = 0; r < stations.length; r += 1) {
    if (stations[r]?.status !== "running") continue;
    const entry = bandOf(folded, r)?.from ?? r;
    // æµè½¨ä¸æµå¼§ä¸åä¸ï¼specãMarchãæ«æ®µï¼ï¼å®ä»¬çå¢¨å·²ç»è¯´äºææ²¡æä¸è¥¿å¨è¿ã
    const reentry = arcs.find(
      (arc) =>
        !arc.stream &&
        arc.to === entry &&
        arc.from > arc.to &&
        visited(arc.from) &&
        stations[r]!.rounds >= 2,
    );
    if (reentry !== undefined) {
      reentry.ink = "march";
      continue;
    }
    // åçº¿æ®µä¸æ¯æ§å¶æµèµ°çè·¯ï¼å®åªè¯´ãè¿ä¸¤ç«å¹¶è¡ãï¼æ°¸ä¸è¡è¿ã
    const inbound = rails.filter(
      (rail) =>
        rail.to === r && rail.kind !== "twin" && rail.kind !== "stream" && visited(rail.from),
    );
    if (inbound.length > 0) {
      for (const rail of inbound) rail.ink = "march";
      continue;
    }
    const landing = arcs.find((arc) => !arc.stream && arc.to === r && visited(arc.from));
    if (landing !== undefined) landing.ink = "march";
  }

  const railInk = (from: number, to: number): TimelineInk =>
    rails.find((rail) => rail.from === from && rail.to === to && rail.kind !== "twin")?.ink ??
    "faint";
  const bands: TimelineBand[] = fold.bands.map((band) => ({
    from: band.from,
    ...(band.join === undefined ? {} : { join: band.join }),
    ...(band.pred === undefined ? {} : { pred: band.pred }),
    to: band.to,
    tracks: band.tracks.map((members) => {
      const head = members[0]!;
      const tail = members[members.length - 1]!;
      return {
        entry:
          band.pred === undefined
            ? ((visited(head) ? "strong" : "faint") as TimelineInk)
            : railInk(band.pred, head),
        exit:
          band.join === undefined
            ? ((visited(tail) ? "strong" : "faint") as TimelineInk)
            : railInk(tail, band.join),
        stations: [...members],
      };
    }),
  }));

  const tailStub = tailStubOf(stations);
  return {
    arcs,
    bands,
    fills: holes.fills,
    ...(Object.keys(holes.parents).length === 0 ? {} : { holeParents: holes.parents }),
    live: run !== undefined,
    rails,
    runningIndex,
    stations,
    ...(tailStub === undefined ? {} : { tailStub }),
  };
}

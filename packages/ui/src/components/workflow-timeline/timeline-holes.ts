import {
  WORKFLOW_HOLE_SITE_ID_PATTERN,
  type WorkflowRunState,
} from "@zcode/shared/zcode-protocol-v4";
import type { WorkflowCausalityGraphData } from "@/components/workflow-graph/types.js";
import type { TimelineRail, TimelineStation, WorkflowTimelineModel } from "./timeline-model.js";

/**
 * çç½å¨æ¶é´çº¿æ¨¡åä¸çæ´¾çï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãï¼ã
 * ä» timeline-model.ts æåºï¼max-lines é¨ï¼ï¼é£éåªå¨å»ºç«æ¶é®ä¸å¥ãè¿ä¸ç«æ¯çç½åããå¨æ¶å°¾æ¶
 * é®ä¸å¥ãå¤´å¨åªãå°¾å·´è¦ä¸è¦å¤ 40pxãï¼è§åå¨å¨è¿éãæ  Reactãæ  DOMãæ æ¶é´ã
 *
 * ä¸ä¸ªçç½å°±æ¯ä¸ä¸ªé¶æ®µï¼id = ç«ç¹ idãname = å­é¢éï¼è§å 9012 ä¿è¯åå­å¯ä¸ï¼ï¼
 *   - **å¼ç**ï¼display ç `holes[]` ååºå®ï¼æ¯å¦å°¾å·´ï¼ï¼run åå¨å®ä¸æ¶ `run.holes` è¯´å® waitingã
 *   - **è¡¥å¨äº**ï¼display ç `holes[]` ä¸ååå®ï¼å®åä¸çé¶æ®µä¸ç«ç¹å¸¦ `fill: <å®ç id>`ãæé¶æ®µçè¡¥å¨ï¼
 *     ä½çç«ç«å¨çç½çä½ç½®ï¼çç½åªå©ä¸ä¸ª**å¤´**ï¼ç¬ Â· åï¼æ¬å¨å®ä»¬ä¹ä¸ï¼æ²¡æé¶æ®µçè¡¥å¨ï¼çç½èªå·±
 *     çé¶æ®µè£çä½ç askï¼ç«ä¿çåå­ãåå­æè¿ä¸æç¬æ ã
 * è¡¥å¨åçåå­å¨ display ä¸æ²¡æè½ç¹ï¼å®ä¸æ¯ç«ç¹äºï¼ï¼æä»¥ä» `run.holes` åï¼æ²¡æ run çéæå¾
 * ï¼ç¡®è®¤çªãè¡¥å¨è¡ï¼ç±è°ç¨æ¹é `holeLabels`ï¼ä¸¤å¤é½æ²¡ææ¶éåç«ç¹ idââæ»æ¯ç©ºçå¼ºã
 * çç½çç±»åï¼`hole<T>` ç Tï¼çº¿ä¸æãçé¢ä¸æ²¡æï¼å®æ¯ç¼è¯å¥çº¦ï¼ä¸æ¯ç»ç¨æ·è¯»çã
 *
 * **åµå¥**ï¼è¡¥å¨éå¯ä»¥åçç½ãçç½ id æ¯åå­é®ï¼`hole#<8 ä½åå­è¿å¶>`ï¼ï¼ä¸éæ·±åº¦å¢é¿ï¼æä»¥åµå¥
 * å³ç³»ä¸å¨ id éï¼ä¸ä¸ªçç½**èªå·±ç**é¶æ®µ / ç«å¸¦ `fill: <åçå®ççç½>`ï¼é¡¶å±çç½æ²¡æï¼ï¼ç±æ­¤å¾åº
 * ç¶è¡¨ {@link HoleTable.parents}ãå¤å±çå¤´è¦çã`fill` æ¯å®æå®éé¢ä»»ä¸å±çç½ãçå¨é¨ç«ï¼åå±çåºå
 * è½å¨å¤å±çéé¢ï¼å¤´æ `from` ååºãåèµ·ç¹å¤å±å¨åï¼åºååç»å¤å±ãåå±å å¨ä¸é¢ï¼ã
 * ä¿®å¤åå ï¼2026-09-29 ä¹å id éå±æ¼æ¥ï¼`hole#1/hole#1`ï¼ï¼æ¥é¾å«ä¹æ­¥å°±é¡¶å°åè®®ç 64 å­ç¬¦ä¸çã
 *
 * ç«ç `fill` åç­ãè¿ä¸ç«å±äºåªçè¡¥å¨åºåãï¼ä¸è¬å°±æ¯é¶æ®µç `fill`ï¼**å·²è¡¥å¨ççç½èªå·±çç«**å±äº
 * å®èªå·±çåºåï¼æ¬åå®äº®å®èªå·±ãå®åè¡¥å¨æ¶å®ä¸èµ·è½å°ï¼ï¼æä»¥åå®èªå·±ç idï¼è§ {@link stationFillOf}ã
 */
export type TimelineHoleState = "open" | "waiting" | "filled";

export interface TimelineHole {
  siteId: string;
  state: TimelineHoleState;
  /** ä¸»ä»£çæ¶å°çæç¤ºè¯­ï¼ç­å¾ä¸­ï¼æ¥èª `run.holes`ï¼ï¼ä¾§æ¿çç­å¾ä½ç»å®ã */
  prompt?: string;
  /** èæ¬çå°¾å·´ï¼è½¨éå¨å®ä¹åå¤è· 40pxã */
  tail?: true;
  /** å°è¾¾æ¶å»ï¼ç­å¾ä¸­ï¼ï¼è¡¥å¨æ¶å»ï¼è¡¥å¨åï¼ã */
  since?: number;
  filledAt?: number;
  filledBy?: string;
}

/** ä¸æ¬¡æé¶æ®µçè¡¥å¨çä¸çå¤´ï¼è¦ç `from..to` è¿å ç«ï¼ä¸æ æå `stations`ï¼ã */
export interface TimelineFill {
  holeId: string;
  name: string;
  from: number;
  to: number;
  filledAt?: number;
}

export type HoleLabels = ReadonlyMap<string, { name: string }>;

export function isHoleSiteId(id: string): boolean {
  return WORKFLOW_HOLE_SITE_ID_PATTERN.test(id);
}

/** çç½ id â åçå®ççç½ idï¼é¡¶å±çç½ä¸å¨è¡¨éï¼ã */
export type HoleParents = Readonly<Record<string, string>>;

/** `id` èµ·ãæ²¿ç¶è¡¨ä¸è·¯åå¤çæ¯ä¸å±çç½ï¼èªå·±å¨æåï¼ï¼é²ç¯ï¼åä¸ä¸ª id ä¸èµ°ç¬¬äºæ¬¡ã */
function holeAncestors(id: string, parents: HoleParents): string[] {
  const out: string[] = [];
  for (
    let cur: string | undefined = id;
    cur !== undefined && !out.includes(cur);
    cur = parents[cur]
  ) {
    if (isHoleSiteId(cur)) out.push(cur);
  }
  return out;
}

/** `id` æ¯è¡¥å¨ `holeId` æ¬èº«ãè¿æ¯å®éé¢ï¼ä»»ææ·±åº¦ï¼ççç½ã */
export function fillContains(holeId: string, id: string, parents: HoleParents): boolean {
  return holeAncestors(id, parents).includes(holeId);
}

/**
 * ç¶è¡¨ï¼æ¯ä¸ªçç½èªå·±çé¶æ®µä¸ç«ä¸ç `fill` å°±æ¯åçå®ççç½ï¼åæå¨ççº¦å®ï¼docs/analysis.mdãSitesãï¼ã
 * é¶æ®µä¼åï¼è¡¥å¨è¿ççç½åªå©é¶æ®µï¼ï¼ç«ååºï¼å¼çççç½å¨ display ä¸æ¯ä¸ä¸ª kind hole çç«ï¼ã
 */
export function holeParentsOf(
  graph: Pick<WorkflowCausalityGraphData, "steps">,
  phases: readonly { id: string; fill?: string }[],
): HoleParents {
  const parents: Record<string, string> = {};
  for (const step of graph.steps) {
    if (step.kind === "hole" && step.fill !== undefined && step.fill !== step.id)
      parents[step.id] = step.fill;
  }
  for (const phase of phases) {
    if (isHoleSiteId(phase.id) && phase.fill !== undefined && phase.fill !== phase.id)
      parents[phase.id] = phase.fill;
  }
  return parents;
}

/**
 * æãå¤´å·²ç»ä»£è¡¨äºå®ãççç½é¶æ®µä»æ¶é´çº¿ä¸æ¿æï¼å·²è¡¥å¨ãèªå·±æ²¡ææåãèå®çä½éå¦æç«ççç½ã
 * åæå¨æè¿ç§é¶æ®µçå¨è¡¨éï¼ä¾§æ ä¸ `phaseNames` é å®å¿µå¾åºæ¥é¾æ¯ä¸æ­¥çåå­ï¼docs/analysis.md
 * ãSitesãï¼ï¼ä½æ¶é´çº¿ä¸å®åªä¼æ¯ä½åé¢ä¸çç©ºç¯ââå¤´å·²ç»è¯´äºå®çåå­ãæ¿ææ¶æè¿å®çè¾¹æ¥å°åºå®ç
 * è¾¹ä¸ï¼`a â h â b` æ `a â b`ï¼ï¼è½¨éå æ­¤ä¸æ­ï¼æ²¡æä½ç«çè¡¥å¨ä¸æ¿ï¼å®çç«å¸¦ç¬æ ï¼æ¯å¯ä¸ççè¿¹ï¼ã
 */
export function withoutHeadedHolePhases(
  graph: WorkflowCausalityGraphData,
): WorkflowCausalityGraphData {
  const phases = graph.phases ?? [];
  const open = new Set((graph.holes ?? []).map((hole) => hole.siteId));
  const withMembers = new Set(
    graph.steps.flatMap((step) => (step.phase === undefined ? [] : [step.phase])),
  );
  const parents = holeParentsOf(graph, phases);
  const hidden = new Set(
    phases
      .filter(
        (phase) => isHoleSiteId(phase.id) && !open.has(phase.id) && !withMembers.has(phase.id),
      )
      .filter((hole) =>
        phases.some(
          (phase) =>
            phase.id !== hole.id &&
            phase.fill !== undefined &&
            fillContains(hole.id, phase.fill, parents),
        ),
      )
      .map((phase) => phase.id),
  );
  if (hidden.size === 0) return graph;
  // éä¸ªæ¶ç¼©ï¼æ¯æ¿æä¸ä¸ªå°±æç»è¿å®çè·¯å¾æ¥ä¸ï¼è¿ç»­çå ä¸ªè¢«æ¿æçé¶æ®µå æ­¤ä¹æ¥å¾éã
  let edges = [...(graph.phaseEdges ?? [])];
  for (const id of hidden) {
    const into = edges.filter((edge) => edge.to === id && edge.from !== id);
    const out = edges.filter((edge) => edge.from === id && edge.to !== id);
    edges = edges.filter((edge) => edge.from !== id && edge.to !== id);
    for (const a of into)
      for (const b of out)
        edges.push({ from: a.from, to: b.to, ...(b.back === true ? { back: true } : {}) });
  }
  const seen = new Set<string>();
  const phaseEdges = edges.filter((edge) => {
    const key = `${edge.from}>${edge.to}>${edge.back === true ? 1 : 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    ...graph,
    phaseEdges,
    phases: phases
      .filter((phase) => !hidden.has(phase.id))
      .map((phase) =>
        phase.alongside === undefined
          ? phase
          : { ...phase, alongside: phase.alongside.filter((id) => !hidden.has(id)) },
      ),
  };
}

/**
 * æ¶é´çº¿ä»åªå¼ å¾å»ºç«ï¼å¤´å·²ä»£è¡¨ççç½é¶æ®µæ¿æï¼{@link withoutHeadedHolePhases}ï¼ï¼ç¶è¡¨å´ä»**æ¿æ
 * ä¹å**çå¾ç®ââè¢«æ¿æççç½ä»æ¯å®ä½éçç½çç¶ï¼åµå¥æä¸æ­ã
 */
export function timelineHoleGraph(full: WorkflowCausalityGraphData): {
  graph: WorkflowCausalityGraphData;
  phases: NonNullable<WorkflowCausalityGraphData["phases"]>;
  parents: HoleParents;
} {
  const graph = withoutHeadedHolePhases(full);
  return { graph, parents: holeParentsOf(full, full.phases ?? []), phases: graph.phases ?? [] };
}

/** ä¸ç«å±äºåªçè¡¥å¨åºåï¼æè¿ç«çå­æ®µï¼ï¼å·²è¡¥å¨ççç½èªå·±çç«å±äºå®èªå·±ï¼å¶ä½ç«å±äºé¶æ®µç `fill`ã */
export function stationFillOf(
  phase: { id: string; fill?: string },
  hole: TimelineHole | undefined,
): { fill?: string } {
  const fill = hole?.state === "filled" ? phase.id : phase.fill;
  return fill === undefined ? {} : { fill };
}

export interface HoleTable {
  /** é¶æ®µ id â è¿ä¸ç«æ¯çç½ï¼èªå·±çé¶æ®µè¿å¨è¡¨éçé£äºï¼ã */
  byPhase: ReadonlyMap<string, TimelineHole>;
  /** æé¶æ®µçè¡¥å¨çå¤´ï¼æ `from` ååºã */
  fills: TimelineFill[];
  /** çç½ä¹é´çåå«å³ç³»ï¼è§ {@link holeParentsOf}ï¼ã */
  parents: HoleParents;
}

/**
 * ä» display ä¸ run è¯»åºçç½è¡¨ã`phases` æ¯æ¨¡åå»ºç«ç¨çé£å¼ é¶æ®µè¡¨ï¼éå¼é¶æ®µå·²åæï¼ï¼ä¸æ ä¸ç«ä¸è´ã
 */
export function holeTable(
  graph: WorkflowCausalityGraphData,
  phases: readonly NonNullable<WorkflowCausalityGraphData["phases"]>[number][],
  run: WorkflowRunState | undefined,
  labels: HoleLabels | undefined,
  /** ä»**æ¶ç¼©ä¹å**çå¾ç®åºçç¶è¡¨ï¼è¢«æ¿æççç½é¶æ®µä»ç¶æ¯å®ä½éçç½çç¶ï¼ï¼ç¼ºå¸­æ¶å°±å°ç®ã */
  parents: HoleParents = holeParentsOf(graph, phases),
): HoleTable {
  const runHoles = new Map((run?.holes ?? []).map((hole) => [hole.siteId, hole]));
  const index = new Map(phases.map((phase, i) => [phase.id, i]));
  const byPhase = new Map<string, TimelineHole>();
  const open = new Set<string>();
  for (const hole of graph.holes ?? []) {
    open.add(hole.siteId);
    const live = runHoles.get(hole.siteId);
    const waiting = live?.state === "waiting";
    byPhase.set(hole.siteId, {
      siteId: hole.siteId,
      state: waiting ? "waiting" : "open",
      ...(hole.tail === true ? { tail: true as const } : {}),
      ...(waiting && live.since !== undefined ? { since: live.since } : {}),
      ...(waiting && live.prompt !== undefined ? { prompt: live.prompt } : {}),
    });
  }
  // è¡¥å¨è¿ççç½ï¼run è®°è¿ filled çãè¢«æä¸ªé¶æ®µ / ç«ç¹ç `fill` ç¹åçãé¶æ®µ id æ¬èº«å°±æ¯çç½ id çã
  const filled = new Set<string>();
  for (const hole of runHoles.values()) if (hole.state === "filled") filled.add(hole.siteId);
  // è¢«ç¹åççç½è¿åå®çæ¯ä¸å±å¤å±ï¼åå±è¡¥å¨åå¤å±å¯è½ä¸åè¢«ä»»ä½é¶æ®µç´æ¥ç¹åã
  for (const phase of phases) {
    if (phase.fill !== undefined)
      for (const id of holeAncestors(phase.fill, parents)) filled.add(id);
    if (isHoleSiteId(phase.id)) filled.add(phase.id);
  }
  for (const step of graph.steps) {
    if (step.fill !== undefined) for (const id of holeAncestors(step.fill, parents)) filled.add(id);
  }
  for (const id of open) filled.delete(id);

  const fills: TimelineFill[] = [];
  const last = phases.length - 1;
  for (const holeId of filled) {
    const live = runHoles.get(holeId);
    const label = labels?.get(holeId);
    const own = index.get(holeId);
    // ä½ï¼`fill` æ¯å®ãææ¯å®éé¢ä»»ä¸å±çç½çç«ââå¤å±çè·¨åº¦çä½åå±çãå®èªå·±çç«ä¸å¨ä½é
    // ï¼å®ç `fill` æ¯å¤å±ï¼ï¼ç´§æ¨å¨ä½ä¹åæ¶ä¸é¢æå®å½è¿å¤´ä¸ã
    const body = phases.flatMap((phase, i) =>
      phase.fill !== undefined && fillContains(holeId, phase.fill, parents) ? [i] : [],
    );
    if (own !== undefined) {
      byPhase.set(holeId, {
        siteId: holeId,
        state: "filled",
        // ç«å¨è¡¨æ«ççç½å°±æ¯èæ¬çå°¾å·´ï¼è¡¥å¨åä»ç 40pxï¼å¤´ææ¾å¾ä¸ã
        ...(own === last && body.length === 0 ? { tail: true as const } : {}),
        ...(live?.filledAt === undefined ? {} : { filledAt: live.filledAt }),
        ...(live?.filledBy === undefined ? {} : { filledBy: live.filledBy }),
      });
    }
    if (body.length === 0) continue;
    // çç½èªå·±çé¶æ®µç´§æ¨å¨ä½ä¹åæ¶ä¹å½è¿å¤´ä¸ï¼ä½å¨é¦ä¸ªæ è®°ä¹åçè¯­å¥è½å¨é£ä¸ç«ï¼ã
    const from = own !== undefined && own === Math.min(...body) - 1 ? own : Math.min(...body);
    fills.push({
      holeId,
      name: live?.name ?? label?.name ?? holeId,
      from,
      to: Math.max(...body),
      ...(live?.filledAt === undefined ? {} : { filledAt: live.filledAt }),
    });
  }
  // åèµ·ç¹çå¤å±å¨åï¼è·¨åº¦é¿çå¨åï¼è·¨åº¦ä¹ç¸åæ¶æåµå¥æ·±åº¦ï¼å¤å±æµï¼ãä¿®å¤åå ï¼id ä¸åéå±
  // æ¼æ¥åï¼æ²¿ç¶è¡¨æ¶éçæ¬¡åºæ¯ç±ååå¤çï¼é æå¥æ¬¡åºä¼æåå±çå¤´æå°å¤å±åé¢ã
  const depth = (id: string): number => holeAncestors(id, parents).length;
  fills.sort(
    (left, right) =>
      left.from - right.from || right.to - left.to || depth(left.holeId) - depth(right.holeId),
  );
  return { byPhase, fills, parents };
}

/** å°¾å·´çç½ï¼å¼ç / ç­ç â èçº¿æ®æ®µ 40px æ·¡åºï¼æ é¶æ®µè¡¥å¨å â åªç 40px çä½å°ï¼å¤´è¦è½ä¸ï¼ã */
export function tailStubOf(stations: readonly TimelineStation[]): "open" | "filled" | undefined {
  const hole = stations[stations.length - 1]?.hole;
  if (hole === undefined || hole.tail !== true) return undefined;
  return hole.state === "filled" ? "filled" : "open";
}

/** è§¦å°å¼ç / ç­çççç½çè½¨éæ®µæ¯èçº¿ï¼é£éè¿ä¸æ¯ä»£ç ã */
export function railTouchesHole(
  stations: readonly TimelineStation[],
  rail: Pick<TimelineRail, "from" | "to">,
): boolean {
  const at = (i: number): boolean => {
    const state = stations[i]?.hole?.state;
    return state === "open" || state === "waiting";
  };
  return at(rail.from) || at(rail.to);
}

/**
 * è¡¥å¨è¡çèç¨¿é¶æ®µçº¿ï¼docs/dynamic-workflow/presentation.mdãThe fill rowãï¼ï¼ç¶è½¨éä¸è¡¥å¨æå¨çé£ä¸æª
 * ââè¡¥å¨çç«å¨å¢¨ãä¸¤ä¾§åä¸ä¸ªé»ç« ghostï¼40%ï¼ââå¶ä½ç«ä¸ç»ãå¼§ãå¸¦ãè¿è¡æä¸å¾ä¸å¸¦ï¼è¿æ¯ä¸å¼ è¯´
 * ãæ°çç«è½å¨åªä¸¤ç«ä¹é´ãçéæå¾ãçç½ä¸è®¤è¯æ¶ undefinedã
 */
export function narrowTimelineToFill(
  model: WorkflowTimelineModel,
  holeId: string,
): WorkflowTimelineModel | undefined {
  const fill = model.fills?.find((candidate) => candidate.holeId === holeId);
  let from: number;
  let to: number;
  if (fill !== undefined) {
    from = fill.from;
    to = fill.to;
  } else {
    const own = model.stations.findIndex(
      (station) => station.hole?.siteId === holeId && station.hole.state === "filled",
    );
    if (own < 0) return undefined;
    from = own;
    to = own;
  }
  const start = Math.max(0, from - 1);
  const end = Math.min(model.stations.length - 1, to + 1);
  const stations = model.stations.slice(start, end + 1).map((station, i) => {
    const at = start + i;
    const ghost = at < from || at > to;
    const { typing: _typing, ...rest } = station;
    void _typing;
    return ghost ? { ...rest, ghost: true as const } : rest;
  });
  const rails = model.rails.flatMap((rail) =>
    rail.kind === undefined && rail.from >= start && rail.to <= end && rail.to === rail.from + 1
      ? [{ ...rail, from: rail.from - start, to: rail.to - start }]
      : [],
  );
  const includesLast = end === model.stations.length - 1;
  return {
    arcs: [],
    bands: [],
    fills: fill === undefined ? [] : [{ ...fill, from: from - start, to: to - start }],
    live: false,
    rails,
    runningIndex: undefined,
    stations,
    ...(includesLast && model.tailStub !== undefined ? { tailStub: model.tailStub } : {}),
  };
}

import type { TimelineStation } from "./timeline-model.js";
import { fillContains, type HoleParents, type TimelineFill } from "./timeline-holes.js";
import {
  HEAD_ROW,
  MARK_X,
  RAIL_ROW,
  STATION_WIDTH,
  stationX,
  type TimelineLayout,
} from "./timeline-geometry.js";

/**
 * è¡¥å¨çæ¡ï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãçãFilled with phasesãä¸
 * ãThe strokeãï¼ï¼ä¸æ ¹ 1px ççº¿ãåè§ 8ï¼å´ä½ä¸æ¬¡è¡¥å¨åä¸çä¸è¥¿ï¼åªå¨æéè½å¨å®ç**å¤´**ä¸ï¼æé®ç
 * ç¦ç¹å¨å¤´ä¸ï¼æ¶ç»åºï¼è¡¥å¨æ¥è¿ run åçä¸¤ç§éå®èªå·±ç»ä¸éãçº¿æ¯**ä¸ç¬**ï¼ä»ä¸ç¼çèµ·ç¹åºåãé¡ºæ¶é
 * ç»ä¸ååå°èµ·ç¹ââæå¤´çè¡¥å¨èµ·ç¹æ¯ç¬ç xï¼å¤´æ¯å¾ä¾ï¼çº¿ä»åå­çå³ç«¯ååºæ¥ãæ¶å¨ç¬ä¸ï¼ï¼æ²¡æå¤´ç
 * ä»å·¦ä¸è§èµ·ãçº¯å ä½ï¼æ  Reactãæ  DOMã
 *
 * ä¿®å¤åå ï¼2026-09-29 å®æµï¼ï¼æ­¤åçãåºåãæ¯ä¸åçè²çåºï¼æéè½å¨è¡¥å¨éä»»ä¸ç« / è¯ä¸¸ä¸é½ä¼äº®ï¼
 * æ¨ªæ«å¡çæ¶ä¸è·¯éªï¼åµå¥çè¡¥å¨å ææ·±æµä¸¤åï¼è¯»èµ·æ¥åé¢æ¿ï¼ä¾§æ¿ä¸åä»ä¹é½æ²¡æã
 */

/** æ¡è¶è¿å®æå´çåä¸¤ä¾§çéã */
export const FRAME_OUTSET = 8;
/** åèµ·äºä¸åçåµå¥æ¡æ¯å±åéæ¶çéã */
export const FRAME_NEST_INSET = 4;
/** æ¡çåè§ã */
export const FRAME_RADIUS = 8;
/** å¤´é£ä¸è¡ä¸¤ä¾§ç»çº¿ççç©ºã */
export const FRAME_LEGEND_GAP = 4;

/** æ¡çå¤æ¥ç©å½¢ï¼æ´æ°åç´ ï¼ï¼`start` æ¯ç¬å¨ä¸ç¼ç xï¼ç¼ºå¸­å³ä»å·¦ä¸è§èµ·ç¬ã */
export interface FrameBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  start?: number;
}

export interface TimelineFrame {
  holeId: string;
  box: FrameBox;
  /** è¡¥å¨çæ¶å»ï¼æ°é²æï¼ä¸¤ç§ï¼æå®ç®ã */
  filledAt?: number;
}

/**
 * ä¸ç¬ç»å®çè·¯å¾ï¼ä»ä¸ç¼ç `start` åºåï¼åå³ãé¡ºæ¶éç»ä¸åãåå° `start`ã1px ççº¿è½å¨ååç´ ä¸
 * æä¸ç³ï¼ç©å½¢åéæ¶åä¸ªåç´ ã`pathLength` ç±è°ç¨æ¹ç» 1ï¼èçº¿åç§»ä» 1 èµ°å° 0 å°±æ¯ãç»åºæ¥ãã
 */
export function framePath(box: FrameBox, radius = FRAME_RADIUS): string {
  const x0 = box.x0 + 0.5;
  const y0 = box.y0 + 0.5;
  const x1 = box.x1 - 0.5;
  const y1 = box.y1 - 0.5;
  const r = Math.max(0, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
  const start = Math.min(Math.max(box.start ?? x0 + r, x0 + r), x1 - r);
  return [
    `M${start},${y0}`,
    `H${x1 - r}`,
    `Q${x1},${y0} ${x1},${y0 + r}`,
    `V${y1 - r}`,
    `Q${x1},${y1} ${x1 - r},${y1}`,
    `H${x0 + r}`,
    `Q${x0},${y1} ${x0},${y1 - r}`,
    `V${y0 + r}`,
    `Q${x0},${y0} ${x0 + r},${y0}`,
    `H${start}`,
  ].join(" ");
}

/** æ é¶æ®µçè¡¥å¨ï¼çç½èªå·±çç«å¸¦ç¬æ ãä¸å¨ `fills` éçé£äºï¼å®ä»¬çæ¡åªå´èªå·±ä¸åï¼ã */
export interface FillMark {
  holeId: string;
  index: number;
  filledAt?: number;
}

export function fillMarksOf(
  stations: readonly Pick<TimelineStation, "hole">[],
  fills: readonly Pick<TimelineFill, "holeId">[],
): FillMark[] {
  const headed = new Set(fills.map((fill) => fill.holeId));
  return stations.flatMap((station, index) => {
    const hole = station.hole;
    if (hole?.state !== "filled" || headed.has(hole.siteId)) return [];
    return [
      {
        holeId: hole.siteId,
        index,
        ...(hole.filledAt === undefined ? {} : { filledAt: hole.filledAt }),
      },
    ];
  });
}

/** ä¸ `fill` åèµ·äºä¸åãååçå®çè¡¥å¨æå å±ï¼æ¡æå±åéæ¶ã */
function sameStartDepth(
  fill: TimelineFill,
  fills: readonly TimelineFill[],
  parents: HoleParents,
): number {
  return fills.filter(
    (other) =>
      other.holeId !== fill.holeId &&
      other.from === fill.from &&
      fillContains(other.holeId, fill.holeId, parents),
  ).length;
}

/** åç `holeId` çè¡¥å¨æå å±ï¼ä¾§æ¿çæ¡æå®åéæ¶ï¼ã */
export function fillDepthOf(
  holeId: string,
  fills: readonly Pick<TimelineFill, "holeId">[],
  parents: HoleParents,
): number {
  return fills.filter(
    (other) => other.holeId !== holeId && fillContains(other.holeId, holeId, parents),
  ).length;
}

/**
 * å¡ä¸çæ¡ãæå¤´çè¡¥å¨ï¼x ä»é¦åå·¦ç¼ â 8 å°æ«åå³ç¼ + 8ï¼y ä»å¤´é£ä¸è¡çä¸­çº¿å°å®æé«é£ä¸åè¯ä¸¸ä¹ä¸ 8px
 * ï¼é£å åæ²¡æè¯ä¸¸ââæ¯å¦å¡æ¶èµ·æ¶ââå°±å°è½¨éè¡ / ç«å°è¡ä¹ä¸ 4pxï¼ï¼åèµ·äºä¸åçåµå¥æ¡æ¯å±å·¦ãå³ã
 * ä¸åæ¶ 4pxãæ é¶æ®µçè¡¥å¨ï¼å®é£ä¸åï¼è½¨éè¡ä¹ä¸ 4px å°å®çè¯ä¸¸ä¹ä¸ 8pxï¼ä»å·¦ä¸è§èµ·ç¬ãä¸å¾å¤¹å¨
 * æ¶é´çº¿çç»å¸éï¼é¦åä¸æ«åçæ¡æä¸ä¼è¢«æ»å¨å±è£æåæ ¹çº¿ï¼ã
 */
export function timelineFrames({
  columnHeight,
  fills,
  height,
  inset,
  layout,
  parents,
  stations,
  width,
}: {
  fills: readonly TimelineFill[];
  stations: readonly Pick<TimelineStation, "hole" | "track">[];
  layout: Pick<TimelineLayout, "pillsTop" | "rowY">;
  /** ç¬¬ i ç«è¯ä¸¸åçé«ï¼æ²¡æè¯ä¸¸ä¸º 0ï¼ã */
  columnHeight: (index: number) => number;
  height: number;
  width: number;
  inset: number;
  parents: HoleParents;
}): TimelineFrame[] {
  const bottomOf = (from: number, to: number): number => {
    let tallest = 0;
    for (let i = from; i <= to; i += 1) tallest = Math.max(tallest, columnHeight(i));
    // è¯ä¸¸åé¡¶ = è½¨éè¡ï¼æç«å°è¡ï¼åº + 8ï¼æä»¥æ²¡æè¯ä¸¸æ¶ pillsTop â 4 å°±æ¯é£ä¸è¡ä¹ä¸ 4pxã
    return tallest > 0 ? layout.pillsTop + tallest + FRAME_OUTSET : layout.pillsTop - 4;
  };
  const clamp = (box: FrameBox): FrameBox => ({
    ...box,
    x0: Math.max(0, box.x0),
    x1: Math.min(width, box.x1),
    y0: Math.max(0, box.y0),
    y1: Math.min(height, box.y1),
  });
  const frames: TimelineFrame[] = fills.map((fill) => {
    const k = sameStartDepth(fill, fills, parents) * FRAME_NEST_INSET;
    return {
      holeId: fill.holeId,
      box: clamp({
        x0: stationX(fill.from, inset) - FRAME_OUTSET + k,
        x1: stationX(fill.to, inset) + STATION_WIDTH + FRAME_OUTSET - k,
        y0: HEAD_ROW / 2,
        y1: bottomOf(fill.from, fill.to) - k,
        start: stationX(fill.from, inset) + MARK_X,
      }),
      ...(fill.filledAt === undefined ? {} : { filledAt: fill.filledAt }),
    };
  });
  for (const mark of fillMarksOf(stations, fills)) {
    const rowY = layout.rowY[stations[mark.index]?.track ?? 0] ?? layout.rowY[0]!;
    frames.push({
      holeId: mark.holeId,
      box: clamp({
        x0: stationX(mark.index, inset) - FRAME_OUTSET,
        x1: stationX(mark.index, inset) + STATION_WIDTH + FRAME_OUTSET,
        y0: rowY - RAIL_ROW / 2 - 4,
        y1: bottomOf(mark.index, mark.index),
      }),
      ...(mark.filledAt === undefined ? {} : { filledAt: mark.filledAt }),
    });
  }
  return frames;
}

/** å¤´é£ä¸è¡å¨ä¸ç¼ä¸æçç©ºï¼å¾ä¾ï¼ï¼ä¸è¡ä¸ä¸ªç©å½¢ï¼ä¸¤ä¾§åè®© 4pxãå®½åº¦éä¸å°ï¼0ï¼æ¶ä¸æã */
export function legendGaps(
  rows: readonly { left: number; width: number }[],
): { x: number; width: number }[] {
  return rows
    .filter((row) => row.width > 0)
    .map((row) => ({ x: row.left - FRAME_LEGEND_GAP, width: row.width + 2 * FRAME_LEGEND_GAP }));
}

/**
 * ä¾§æ¿çæ¡ï¼x ä» 8 å°åè¡¨å³ç¼ â 12ï¼æ¯å±åµå¥åæ¶ 4pxï¼ææ é¢çè¡¥å¨ä»æ é¢çä¸­çº¿èµ·ãå°å®æåä¸èä¹ä¸
 * 4pxï¼èµ·ç¬å¨è½¨éç xï¼21ï¼ç¬ççé£ä¸æªï¼ï¼æ é¶æ®µçè¡¥å¨å´èªå·±é£ä¸èï¼ä¸ä¸åæ¶ 2pxï¼ä»å·¦ä¸è§èµ·ç¬ã
 * çºµåä½ç½®ç±è°ç¨æ¹ä» DOM éæ¥ï¼èçå±å¼ / æå ä¼æ¹å®ä»¬ï¼ã
 */
export const SPINE_FRAME_LEFT = 8;
export const SPINE_FRAME_RIGHT = 12;
export const SPINE_RAIL_X = 21;

export function spineFrameBox({
  bottom,
  depth,
  headed,
  top,
  width,
}: {
  /** æ é¢è¡çé¡¶ï¼æå¤´ï¼æé£ä¸èçé¡¶ï¼æ å¤´ï¼ï¼ç¸å¯¹åè¡¨åå®¹ã */
  top: number;
  /** æåä¸èçåºã */
  bottom: number;
  width: number;
  depth: number;
  headed: boolean;
}): FrameBox {
  const k = depth * FRAME_NEST_INSET;
  return headed
    ? {
        x0: SPINE_FRAME_LEFT + k,
        x1: width - SPINE_FRAME_RIGHT - k,
        y0: Math.round(top + HEAD_ROW / 2),
        y1: Math.round(bottom + 4),
        start: SPINE_RAIL_X,
      }
    : {
        x0: SPINE_FRAME_LEFT + k,
        x1: width - SPINE_FRAME_RIGHT - k,
        y0: Math.round(top + 2),
        y1: Math.round(bottom - 2),
      };
}

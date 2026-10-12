import { useEffect, useState, type CSSProperties } from "react";
import { STATION_PITCH } from "./timeline-geometry.js";
import type { WorkflowTimelineModel } from "./timeline-model.js";

/**
 * è¡¥å¨ççé¿ï¼docs/dynamic-workflow/presentation.mdãHoles on the timelineãçãGrowthãï¼ï¼è¡¥å¨æ¥è¿ run æ¶
 * æå¥åå³ä¾§çç«ææå¥å®½åº¦æ»å¼ââä¸æ®µ 320ms ç transformï¼æ­å®å³è½å¨æ°ä½ç½®ï¼æ°ä½ç½®å°±æ¯å¸å±ä½ç½®ï¼
 * å¨ç»åªä» âå®½åº¦ èµ·æ­¥ï¼ãæ°ç«èªå·±ä»¥ `wf-land` / `wf-rail-grow` è½å°ãåºåä¸¤ç§æ°é²ï¼é½å¨å«å¤ã
 *
 * æ¨¡åæ²¡ææ¶é´ä¹æ²¡æåå²ï¼æä»¥ãæå¥äºå ç«ãç±ç»ä»¶å¯¹æ¯ååä¸¤å¸§å¾åºï¼æ°åºç°çè¡¥å¨å¤´ + ç«æ°å¢éã
 * é¦å¸§æ²¡æåä¸å¸§ï¼å·å¼ä¸æ¡å·²è¡¥å¨çæ¶é´çº¿ä¸æ»ãéå¤´ä¸å¨ï¼è¡¥å¨çç¬¬ä¸ç«ä¸çç½åä¸æ ãå xï¼
 * `scrollLeft` ä¸åå°±æ¯ãéå¤´åå¨ç­å¾ç«ç x ä¸ããreduced-motion ä¸ `.wf-slide` çå¨ç»ä¸º noneï¼æ°è¡ç´æ¥åºç°ã
 */
export const SLIDE_MS = 320;

export interface FillSlide {
  /** ä¸æ å¤§äºå®çç«æ»å¨ã */
  after: number;
  /** æå¥çå®½åº¦ï¼pxï¼ï¼ç«ä» âshift æ»å° 0ã */
  shift: number;
  /** æ¯æ¬¡çé¿æ¢ä¸ä¸ª keyï¼è®©è¿çä¸¤æ¬¡çé¿åæ­ä¸éã */
  key: number;
}

interface SeenShape {
  key: string;
  stations: number;
  fills: readonly string[];
}

function shapeOf(model: WorkflowTimelineModel): SeenShape {
  const fills = (model.fills ?? []).map((fill) => fill.holeId);
  return {
    key: `${model.stations.map((station) => station.id).join("\u0000")}\u0001${fills.join("\u0000")}`,
    stations: model.stations.length,
    fills,
  };
}

/** åä¸å¸§å°è¿ä¸å¸§é¿åºäºä»ä¹ï¼æ°çè¡¥å¨å¤´ä¸ç«æ°å¢å æç®çé¿ã */
export function fillGrowth(
  previous: Pick<SeenShape, "stations" | "fills">,
  model: WorkflowTimelineModel,
): Pick<FillSlide, "after" | "shift"> | undefined {
  const grown = (model.fills ?? []).filter((fill) => !previous.fills.includes(fill.holeId));
  const delta = model.stations.length - previous.stations;
  if (grown.length === 0 || delta <= 0) return undefined;
  return { after: Math.max(...grown.map((fill) => fill.to)), shift: delta * STATION_PITCH };
}

export function useFillGrowth(model: WorkflowTimelineModel): FillSlide | undefined {
  const shape = shapeOf(model);
  const [seen, setSeen] = useState(shape);
  const [slide, setSlide] = useState<FillSlide | undefined>(undefined);
  // æ¸²æææ´¾çï¼React çãä» props æ´¾çç¶æãåæ³ï¼ï¼ä¸ä¸ä¸å¸§å½¢ç¶ä¸åæ¶å°±å°è®°ä¸è¿ä¸å¸§ï¼æçé¿å°±èµ·ä¸ç­æ»å¨ã
  if (seen.key !== shape.key) {
    const growth = fillGrowth(seen, model);
    setSeen(shape);
    if (growth !== undefined) setSlide((current) => ({ ...growth, key: (current?.key ?? 0) + 1 }));
  }
  // å¨ç»æ­å®ï¼æ reduced-motion ä¸æ ¹æ¬æ²¡æ­ï¼å°±ææç±»ï¼åå¾ä¹åéæçç«åæ­ä¸éã
  useEffect(() => {
    if (slide === undefined) return undefined;
    const timer = setTimeout(() => setSlide(undefined), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [slide]);
  return slide;
}

export function slideClass(index: number, slide: FillSlide | undefined): string | undefined {
  return slide !== undefined && index > slide.after ? "wf-slide" : undefined;
}

export function slideStyle(index: number, slide: FillSlide | undefined): CSSProperties {
  return slide !== undefined && index > slide.after
    ? ({ "--wf-slide": `${-slide.shift}px` } as CSSProperties)
    : {};
}

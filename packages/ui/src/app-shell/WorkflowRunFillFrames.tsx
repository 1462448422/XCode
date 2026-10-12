import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/components/lib/utils.js";
import type { WorkflowTimelineModel } from "@/components/workflow-timeline/timeline-model.js";
import {
  fillDepthOf,
  fillMarksOf,
  framePath,
  spineFrameBox,
  type FrameBox,
} from "@/components/workflow-timeline/timeline-frames.js";
import {
  useFillHeadTarget,
  useFreshFills,
} from "@/components/workflow-timeline/WorkflowTimelineFills.js";

/**
 * ä¾§æ¿ä¸è¡¥å¨çæ¡ï¼docs/dynamic-workflow/presentation.mdãThe paneãï¼ï¼ä¸å¡ä¸åä¸ä¸ªæ¡ç«çç»ââåå¢¨ãååè§ã
 * åä¸ç¬ãå¡ä¸çæ¡æåå ä½ç®å¾åºï¼è¿éèçé«éå±å¼ / æå ãååå¼åèåï¼æä»¥çºµåä½ç½®ä» DOM éï¼
 * æ é¢è¡ï¼`data-fill-heading`ï¼çé¡¶ä¸è¡¥å¨æåä¸èï¼`data-phase-id`ï¼çåºï¼ç¸å¯¹åè¡¨åå®¹ï¼ç®ä¸æ»å¨ï¼ã
 * æ¯æ¬¡æäº¤åéä¸éï¼åè¡¨å°ºå¯¸åäºç± ResizeObserver è¡¥éï¼éå°çä¸ä¸æ¬¡ç¸åå°±ä¸å¨ stateã
 *
 * ç¹äº®åªè®¤å¤´ï¼`useFillHeadTarget`ï¼ä¸å¡å±ç¨ï¼ï¼æ é¢è¡ä¸ç¬æ å¸¦ `data-fill-head`ã
 * ä¾§æ¿ä¸ç¼©è¿ï¼ç¨æ·ä¿®è®¢ï¼åµå¥ç±æ¡å¥æ¡è¯´åºï¼ï¼åµå¥çæ¡æ¯å±åæ¶ 4pxã
 */
interface SpineFrameGeometry {
  width: number;
  height: number;
  boxes: Readonly<Record<string, FrameBox>>;
}

const EMPTY: SpineFrameGeometry = { width: 0, height: 0, boxes: {} };

function sectionOf(root: HTMLElement, attribute: string, value: string): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>(`[${attribute}]`)].find(
    (element) => element.getAttribute(attribute) === value,
  );
}

export function useSpineFillFrames(
  rootRef: RefObject<HTMLDivElement | null>,
  model: WorkflowTimelineModel,
): {
  /** æå¨åè¡¨æ ¹ä¸çå§æï¼æ²¡æè¡¥å¨æ¶ä¸ºç©ºå¯¹è±¡ï¼ã */
  handlers: ReturnType<typeof useFillHeadTarget>["handlers"];
  /** æ­¤å»ç»åºçæ¡ï¼æéæç¦ç¹æå¨çå¤´ï¼ã */
  active: string | undefined;
  fresh: ReadonlySet<string>;
  frames: ReactNode;
} {
  const fills = model.fills ?? [];
  const marks = fillMarksOf(model.stations, fills);
  const parents = model.holeParents ?? {};
  const fresh = useFreshFills([...fills, ...marks]);
  const [geometry, setGeometry] = useState<SpineFrameGeometry>(EMPTY);
  const any = fills.length + marks.length > 0;

  const measure = () => {
    const root = rootRef.current;
    if (root === null || !any) return;
    const rootTop = root.getBoundingClientRect().top - root.scrollTop;
    const top = (element: HTMLElement) => element.getBoundingClientRect().top - rootTop;
    const bottom = (element: HTMLElement) => top(element) + element.getBoundingClientRect().height;
    const width = root.clientWidth;
    const boxes: Record<string, FrameBox> = {};
    for (const fill of fills) {
      const heading = sectionOf(root, "data-fill-heading", fill.holeId);
      const last = model.stations[fill.to];
      const section = last === undefined ? undefined : sectionOf(root, "data-phase-id", last.id);
      if (heading === undefined || section === undefined) continue;
      boxes[fill.holeId] = spineFrameBox({
        bottom: bottom(section),
        depth: fillDepthOf(fill.holeId, fills, parents),
        headed: true,
        top: top(heading),
        width,
      });
    }
    for (const mark of marks) {
      const station = model.stations[mark.index];
      const section =
        station === undefined ? undefined : sectionOf(root, "data-phase-id", station.id);
      if (section === undefined) continue;
      boxes[mark.holeId] = spineFrameBox({
        bottom: bottom(section),
        depth: fillDepthOf(mark.holeId, fills, parents),
        headed: false,
        top: top(section),
        width,
      });
    }
    const next: SpineFrameGeometry = { boxes, height: root.scrollHeight, width };
    setGeometry((previous) =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
    );
  };
  // è§å¯èåªå»ºä¸æ¬¡ï¼å´æ»è¦è°å°ææ°çä¸çéæ³ï¼å®é­åéæè¿ä¸å¸§ç fills ä¸ç«ï¼ã
  const measureRef = useRef(measure);
  measureRef.current = measure;
  useLayoutEffect(() => measureRef.current());
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || !any || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(root);
    // èå±å¼ / æå æ¶åè¡¨èªå·±ççå­ä¸åãåå®¹é«åº¦åï¼è¿åæ¯ä¸èä¸èµ·è§å¯ãæ¡èªå·±ç svg ä¸è§å¯ã
    for (const child of root.children) if (!(child instanceof SVGElement)) observer.observe(child);
    return () => observer.disconnect();
  }, [any, rootRef]);

  const { active, handlers } = useFillHeadTarget(any);
  if (!any) return { active: undefined, fresh, frames: null, handlers };

  const frames = (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      data-testid="workflow-run-fill-frames"
      height={geometry.height}
      width={geometry.width}
    >
      {[...fills, ...marks].map(({ holeId }) => {
        const box = geometry.boxes[holeId];
        const isFresh = fresh.has(holeId);
        return (
          <path
            className={cn("wf-fill-frame", isFresh && "wf-fill-frame-fresh")}
            d={box === undefined ? "" : framePath(box)}
            data-fill-frame={holeId}
            data-fill-fresh={isFresh ? "true" : undefined}
            data-fill-on={isFresh || active === holeId ? "true" : undefined}
            data-testid="workflow-run-fill-frame"
            key={holeId}
            pathLength={1}
          />
        );
      })}
    </svg>
  );
  return { active, fresh, frames, handlers };
}

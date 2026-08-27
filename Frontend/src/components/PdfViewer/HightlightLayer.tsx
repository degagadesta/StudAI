import { useEffect, useState } from "react";
import type { Highlight } from "../../api/HighlightApi";
import {
  offsetsToRange,
  getRangeRectsRelativeToPage,
} from "../../utils/textLayerOffsets";

const COLOR_MAP: Record<string, string> = {
  yellow: "rgba(255, 235, 59, 0.45)",
  green: "rgba(76, 175, 80, 0.4)",
  blue: "rgba(33, 150, 243, 0.35)",
  pink: "rgba(233, 30, 99, 0.35)",
  orange: "rgba(255, 152, 0, 0.4)",
};

interface Props {
  pageEl: HTMLElement;
  highlights: Highlight[];
  textLayerReady: boolean;
  onHighlightClick: (highlight: Highlight, anchorRect: DOMRect) => void;
}

type BoxEntry = {
  highlight: Highlight;
  rects: ReturnType<typeof getRangeRectsRelativeToPage>;
};

function computeBoxes(
  pageEl: HTMLElement,
  highlights: Highlight[],
): BoxEntry[] {
  return highlights
    .map((h) => {
      const range = offsetsToRange(
        pageEl,
        h.position.startOffset,
        h.position.endOffset,
        h.textContent,
      );
      if (!range) {
        console.log(
          "[HighlightLayer] offsetsToRange FAILED for",
          h.id,
          h.position,
          "expected text:",
          h.textContent,
        );
        return null;
      }
      const rects = getRangeRectsRelativeToPage(pageEl, range);
      if (rects.length === 0) {
        console.log(
          "[HighlightLayer] zero rects for highlight",
          h.id,
          "— text layer may not be painted yet",
        );
        return null;
      }
      console.log(
        "[HighlightLayer] highlight",
        h.id,
        "color:",
        h.color,
        "rects:",
        rects,
      );
      return { highlight: h, rects };
    })
    .filter((x): x is BoxEntry => x !== null);
}

export default function HighlightLayer({
  pageEl,
  highlights,
  textLayerReady,
  onHighlightClick,
}: Props) {
  const [boxes, setBoxes] = useState<BoxEntry[]>([]);

  useEffect(() => {
    if (!textLayerReady || highlights.length === 0) {
      setBoxes([]);
      return;
    }

    // Defer to next animation frame so that react-pdf's text layer has fully
    // painted into the DOM before we try to query it.
    let rafId = requestAnimationFrame(() => {
      const computed = computeBoxes(pageEl, highlights);
      console.log("[HighlightLayer] boxes after 1st rAF:", computed.length);

      if (computed.length > 0) {
        setBoxes(computed);
      } else {
        // react-pdf occasionally paints the text layer one extra frame later.
        // Retry once more.
        rafId = requestAnimationFrame(() => {
          const retry = computeBoxes(pageEl, highlights);
          console.log("[HighlightLayer] boxes after 2nd rAF (retry):", retry.length);
          setBoxes(retry);
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [highlights, textLayerReady, pageEl]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {boxes.map(({ highlight, rects }) =>
        rects.map((rect, i) => (
          <div
            key={`${highlight.id}-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onHighlightClick(
                highlight,
                e.currentTarget.getBoundingClientRect(),
              );
            }}
            className="absolute pointer-events-auto cursor-pointer rounded-[2px] transition-opacity hover:opacity-80"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              backgroundColor:
                COLOR_MAP[highlight.color] ?? COLOR_MAP["yellow"],
            }}
            title={highlight.note ?? undefined}
          />
        )),
      )}
    </div>
  );
}

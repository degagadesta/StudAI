import { useEffect, useState } from "react";
import type { Highlight } from "../../api/HighlightApi";
import {
  offsetsToRange,
  getRangeRectsRelativeToPage,
} from "../../utils/textLayerOffsets";

const COLOR_MAP: Record<string, string> = {
  yellow: "rgba(255, 235, 59, 0.4)",
  green: "rgba(76, 175, 80, 0.35)",
  blue: "rgba(33, 150, 243, 0.3)",
  pink: "rgba(233, 30, 99, 0.3)",
  orange: "rgba(255, 152, 0, 0.35)",
};

interface Props {
  pageEl: HTMLElement;
  highlights: Highlight[];
  textLayerReady: boolean;
  onHighlightClick: (highlight: Highlight, anchorRect: DOMRect) => void;
}

export default function HighlightLayer({
  pageEl,
  highlights,
  textLayerReady,
  onHighlightClick,
}: Props) {
  const [boxes, setBoxes] = useState<
    {
      highlight: Highlight;
      rects: ReturnType<typeof getRangeRectsRelativeToPage>;
    }[]
  >([]);

  useEffect(() => {
    if (!textLayerReady || highlights.length === 0) {
      setBoxes([]);
      return;
    }

    const computed = highlights
      .map((h) => {
        const range = offsetsToRange(
          pageEl,
          h.position.startOffset,
          h.position.endOffset,
        );
        if (!range) return null;
        const rects = getRangeRectsRelativeToPage(pageEl, range);
        return { highlight: h, rects };
      })
      .filter(
        (
          x,
        ): x is {
          highlight: Highlight;
          rects: ReturnType<typeof getRangeRectsRelativeToPage>;
        } => x !== null && x.rects.length > 0,
      );

    setBoxes(computed);
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
            className="absolute pointer-events-auto cursor-pointer rounded-[2px]"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              backgroundColor: COLOR_MAP[highlight.color] ?? COLOR_MAP.yellow,
            }}
            title={highlight.note ?? undefined}
          />
        )),
      )}
    </div>
  );
}

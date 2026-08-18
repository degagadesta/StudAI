/**
 * Walks all text nodes inside a react-pdf text layer element in document order,
 * concatenating them exactly the way PDF.js lays them out per page.
 */
function getTextLayerRoot(pageEl: HTMLElement): HTMLElement | null {
  return pageEl.querySelector(".react-pdf__Page__textContent");
}

function getAllTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

/**
 * Given a page wrapper element and a DOM Range (from window.getSelection()),
 * returns character offsets relative to the full page text, plus the text itself.
 */
export function rangeToOffsets(
  pageEl: HTMLElement,
  range: Range,
): { startOffset: number; endOffset: number; text: string } | null {
  const root = getTextLayerRoot(pageEl);
  if (!root) return null;

  const textNodes = getAllTextNodes(root);
  let cursor = 0;
  let startOffset = -1;
  let endOffset = -1;

  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0;

    if (startOffset === -1 && node === range.startContainer) {
      startOffset = cursor + range.startOffset;
    }
    if (node === range.endContainer) {
      endOffset = cursor + range.endOffset;
    }
    cursor += len;
  }

  if (startOffset === -1 || endOffset === -1 || endOffset <= startOffset) {
    return null;
  }

  const text = range.toString().trim();
  if (!text) return null;

  return { startOffset, endOffset, text };
}

/**
 * Given stored offsets, rebuilds a Range spanning those characters in the
 * CURRENT text layer for that page, so we can compute bounding rects to draw
 * highlight overlays. Returns null if the text layer isn't rendered yet.
 */
export function offsetsToRange(
  pageEl: HTMLElement,
  startOffset: number,
  endOffset: number,
): Range | null {
  const root = getTextLayerRoot(pageEl);
  if (!root) return null;

  const textNodes = getAllTextNodes(root);
  let cursor = 0;
  let startNode: Text | null = null;
  let startNodeOffset = 0;
  let endNode: Text | null = null;
  let endNodeOffset = 0;

  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0;
    const nodeStart = cursor;
    const nodeEnd = cursor + len;

    if (
      startNode === null &&
      startOffset >= nodeStart &&
      startOffset <= nodeEnd
    ) {
      startNode = node;
      startNodeOffset = startOffset - nodeStart;
    }
    if (endOffset >= nodeStart && endOffset <= nodeEnd) {
      endNode = node;
      endNodeOffset = endOffset - nodeStart;
      break;
    }
    cursor += len;
  }

  if (!startNode || !endNode) return null;

  try {
    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);
    return range;
  } catch {
    return null;
  }
}

/**
 * Returns rects (relative to the page wrapper element) for a range so we can
 * draw <mark>-style overlay boxes, one per visual line.
 */
export function getRangeRectsRelativeToPage(
  pageEl: HTMLElement,
  range: Range,
): { top: number; left: number; width: number; height: number }[] {
  const pageRect = pageEl.getBoundingClientRect();
  const clientRects = Array.from(range.getClientRects());

  return clientRects
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => ({
      top: r.top - pageRect.top,
      left: r.left - pageRect.left,
      width: r.width,
      height: r.height,
    }));
}

/**
 * Walks all text nodes inside a react-pdf text layer element in document order,
 * concatenating them exactly the way PDF.js lays them out per page.
 */
function getTextLayerRoot(pageEl: HTMLElement): HTMLElement | null {
  return (
    pageEl.querySelector<HTMLElement>(".react-pdf__Page__textContent") ??
    pageEl.querySelector<HTMLElement>(".textLayer")
  );
}

function getAllTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

interface TextMapEntry {
  node: Text;
  /** Character offset of the first character of this node in fullText. */
  nodeStart: number;
}

interface TextMap {
  fullText: string;
  entries: TextMapEntry[];
}

/**
 * Builds a full concatenated text string AND an entry per text-node so we can
 * translate back from a character offset in fullText to a (node, nodeOffset)
 * pair.  This replaces the old scattered cursor-incrementing loops so both
 * rangeToOffsets and offsetsToRange share one consistent view of the layer.
 */
function buildTextMap(root: HTMLElement): TextMap {
  const nodes = getAllTextNodes(root);
  let fullText = "";
  const entries: TextMapEntry[] = [];
  for (const node of nodes) {
    entries.push({ node, nodeStart: fullText.length });
    fullText += node.textContent ?? "";
  }
  return { fullText, entries };
}

/**
 * Given a character offset into fullText, returns the text node and the
 * intra-node offset.  Returns null if the offset is out of range.
 */
function resolveOffset(
  offset: number,
  entries: TextMapEntry[],
  fullTextLength: number,
): { node: Text; nodeOffset: number } | null {
  // Clamp to the very last character so endOffset == fullText.length works.
  const clampedOffset = Math.min(offset, fullTextLength);

  for (let i = entries.length - 1; i >= 0; i--) {
    const { node, nodeStart } = entries[i];
    const nodeLen = node.textContent?.length ?? 0;
    if (clampedOffset >= nodeStart && clampedOffset <= nodeStart + nodeLen) {
      return { node, nodeOffset: clampedOffset - nodeStart };
    }
  }
  return null;
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
 * highlight overlays.
 *
 * When `expectedText` is provided the function first verifies that
 * `fullText.slice(start, end)` matches it.  If the slice doesn't match
 * (text-layer drift caused by react-pdf re-renders / ResizeObserver reflows)
 * it searches for `expectedText` near the original offset, then falls back to
 * a full-string search.  Returns null only when the text truly cannot be
 * found anywhere in the layer.
 */
export function offsetsToRange(
  pageEl: HTMLElement,
  startOffset: number,
  endOffset: number,
  expectedText?: string,
): Range | null {
  const root = getTextLayerRoot(pageEl);
  if (!root) return null;

  const { fullText, entries } = buildTextMap(root);
  if (!fullText) return null;

  let resolvedStart = startOffset;
  let resolvedEnd = endOffset;

  // ── Drift detection ────────────────────────────────────────────────────────
  if (expectedText) {
    const trimmedExpected = expectedText.trim();
    const slicedText = fullText.slice(startOffset, endOffset).trim();

    if (slicedText !== trimmedExpected) {
      // The stored offsets no longer point at the right text.  Try to find the
      // stored text nearby first (cheaper), then anywhere in the layer.
      const searchFrom = Math.max(0, startOffset - 50);
      let found = fullText.indexOf(trimmedExpected, searchFrom);

      if (found === -1) {
        // Fallback: search the whole page text.
        found = fullText.indexOf(trimmedExpected);
      }

      if (found === -1) {
        // The highlight text is genuinely absent from the current text layer
        // (page not yet rendered, or content mismatch).  Return null so the
        // caller skips drawing rather than drawing at a wrong position.
        return null;
      }

      resolvedStart = found;
      resolvedEnd = found + trimmedExpected.length;
    }
  }
  // ── Resolve offsets → (node, nodeOffset) pairs ────────────────────────────
  const startResolved = resolveOffset(resolvedStart, entries, fullText.length);
  const endResolved = resolveOffset(resolvedEnd, entries, fullText.length);

  if (!startResolved || !endResolved) return null;

  try {
    const range = document.createRange();
    range.setStart(startResolved.node, startResolved.nodeOffset);
    range.setEnd(endResolved.node, endResolved.nodeOffset);
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

// components/PdfViewerPage.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {
  getMaterials,
  updateMaterialProgress,
  type Material,
} from "../api/Materialsapi";
import { getApiErrorMessage } from "../api/authApi";
import { api } from "../api/client";
import {
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  type Highlight,
  type HighlightColor,
} from "../api/HighlightApi";
import { rangeToOffsets } from "../utils/textLayerOffsets";
import HighlightLayer from "../components/PdfViewer/HightlightLayer";
import SelectionPopover from "../components/PdfViewer/SelectionPopover";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SAVE_DEBOUNCE_MS = 800;
const SELECTION_DEBOUNCE_MS = 150;

type PendingSelection = {
  pageNumber: number;
  pageEl: HTMLElement;
  startOffset: number;
  endOffset: number;
  text: string;
  x: number;
  y: number;
};

type ActiveHighlight = {
  highlight: Highlight;
  x: number;
  y: number;
};

interface PdfViewerPageProps {
  scale?: number;
  onMetaLoaded?: (meta: { fileName: string; courseName: string }) => void;
  onProgressChange?: (percent: number) => void;
  onAskAI?: (selectedText: string) => void;
}

/**
 * Custom Hook: Fetches material details & PDF binary stream
 */
function useMaterialPdf(
  id?: string,
  onMetaLoaded?: (meta: { fileName: string; courseName: string }) => void,
) {
  const [material, setMaterial] = useState<Material | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onMetaLoadedRef = useRef(onMetaLoaded);
  useEffect(() => {
    onMetaLoadedRef.current = onMetaLoaded;
  }, [onMetaLoaded]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMaterials()
      .then(async (materials) => {
        if (cancelled) return;
        const found = materials.find((m) => m.id === id);
        if (found) {
          setMaterial(found);
          onMetaLoadedRef.current?.({
            fileName: found.fileName,
            courseName: found.courseName,
          });

          const res = await api.get(`/student/pdfs/${found.id}/file`, {
            responseType: "arraybuffer",
          });

          if (!cancelled) {
            setPdfData(new Uint8Array(res.data));
          }
        } else {
          setError("Material not found.");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load this material."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { material, pdfData, isLoading, error, setError };
}

export default function PdfViewerPage({
  scale = 1.0,
  onMetaLoaded,
  onProgressChange,
  onAskAI,
}: PdfViewerPageProps) {
  const { id } = useParams<{ id: string }>();

  const { material, pdfData, isLoading, error, setError } = useMaterialPdf(
    id,
    onMetaLoaded,
  );

  const [numPages, setNumPages] = useState<number | null>(null);
  const [furthestPage, setFurthestPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(640);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [, setRenderTick] = useState(0);
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [activeHighlight, setActiveHighlight] =
    useState<ActiveHighlight | null>(null);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasRestoredStartingPage = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderedPages = useRef<Set<number>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);
  const preserveSelectionRef = useRef(false);

  const onProgressChangeRef = useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  const fileSource = useMemo(
    () => (pdfData ? { data: pdfData } : null),
    [pdfData],
  );

  const documentOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    [],
  );

  // Responsive Container Resizer Observer
  useEffect(() => {
    if (!containerRef.current) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableWidth = entry.contentRect.width - 48;
        if (availableWidth > 0) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setContainerWidth(availableWidth);
          }, 200);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // Fetch initial highlights
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getHighlights(id)
      .then((data) => {
        if (!cancelled) setHighlights(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle PDF document loaded
  const onDocumentLoad = ({ numPages: total }: { numPages: number }): void => {
    setNumPages(total);

    if (!hasRestoredStartingPage.current && material) {
      const startingPage = Math.max(
        1,
        Math.round(((material.progress || 0) / 100) * total),
      );
      setFurthestPage(startingPage);
      hasRestoredStartingPage.current = true;

      setTimeout(() => {
        const el = document.getElementById(`pdf-page-${startingPage}`);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  // Track page reading visibility
  useEffect(() => {
    if (!numPages || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageAttr = entry.target.getAttribute("data-page-number");
            if (pageAttr) {
              const visiblePage = parseInt(pageAttr, 10);
              setFurthestPage((prev) => Math.max(prev, visiblePage));
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.15 },
    );

    const pageElements =
      containerRef.current.querySelectorAll(".pdf-page-wrapper");
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [numPages]);

  // Update progress notifications and auto-save
  useEffect(() => {
    const percent = numPages ? Math.round((furthestPage / numPages) * 100) : 0;
    onProgressChangeRef.current?.(percent);
  }, [furthestPage, numPages]);

  const saveProgress = useCallback(
    (page: number, total: number) => {
      if (!id) return;
      const percent = Math.round((page / total) * 100);
      updateMaterialProgress(id, percent).catch(() => {});
    },
    [id],
  );

  useEffect(() => {
    if (!numPages) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress(furthestPage, numPages);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [furthestPage, numPages, saveProgress]);

  // Text layer rendered callbacks
  const handleTextLayerRendered = useCallback((pageNumber: number) => {
    if (!renderedPages.current.has(pageNumber)) {
      renderedPages.current.add(pageNumber);
      setRenderTick((t) => t + 1);
    }
  }, []);

  const registerPageRef = useCallback(
    (pageNumber: number, el: HTMLDivElement | null) => {
      if (el && pageRefs.current.get(pageNumber) !== el) {
        pageRefs.current.set(pageNumber, el);
        setRenderTick((t) => t + 1);
      }
    },
    [],
  );

  // Text Selection Handling
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleSelectionChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (preserveSelectionRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0)
          return;

        const range = selection.getRangeAt(0);
        const anchorNode = range.startContainer;
        const pageWrapper = (
          anchorNode instanceof Element ? anchorNode : anchorNode.parentElement
        )?.closest<HTMLElement>(".pdf-page-wrapper");

        if (!pageWrapper || !containerRef.current?.contains(pageWrapper))
          return;

        const pageAttr = pageWrapper.getAttribute("data-page-number");
        if (!pageAttr) return;

        const pageNumber = parseInt(pageAttr, 10);
        const offsets = rangeToOffsets(pageWrapper, range);
        if (!offsets) return;

        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        preserveSelectionRef.current = true;

        setPendingSelection({
          pageNumber,
          pageEl: pageWrapper,
          startOffset: offsets.startOffset,
          endOffset: offsets.endOffset,
          text: offsets.text,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setActiveHighlight(null);
      }, SELECTION_DEBOUNCE_MS);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      clearTimeout(debounceTimer);
    };
  }, []);

  // Handle outside click popover closes
  useEffect(() => {
    if (!pendingSelection && !activeHighlight) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;

      preserveSelectionRef.current = false;
      window.getSelection()?.removeAllRanges();
      setPendingSelection(null);
      setActiveHighlight(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pendingSelection, activeHighlight]);

  // Highlight CRUD Operations
  const handleCreateHighlight = useCallback(
    async (color: HighlightColor, note?: string) => {
      if (!pendingSelection || !id) return;
      setHighlightError(null);

      try {
        const created = await createHighlight(id, {
          pageNumber: pendingSelection.pageNumber,
          textContent: pendingSelection.text,
          position: {
            startOffset: pendingSelection.startOffset,
            endOffset: pendingSelection.endOffset,
          },
          color,
          note: note || undefined,
        });
        setHighlights((prev) => [...prev, created]);

        preserveSelectionRef.current = false;
        window.getSelection()?.removeAllRanges();
        setPendingSelection(null);
      } catch (err) {
        setHighlightError(getApiErrorMessage(err, "Could not save highlight."));
      }
    },
    [pendingSelection, id],
  );

  const handleUpdateHighlight = useCallback(
    async (
      highlightId: string,
      payload: { color?: HighlightColor; note?: string },
    ) => {
      setHighlightError(null);
      try {
        const updated = await updateHighlight(highlightId, payload);
        setHighlights((prev) =>
          prev.map((h) => (h.id === highlightId ? updated : h)),
        );
      } catch (err) {
        setHighlightError(
          getApiErrorMessage(err, "Could not update highlight."),
        );
      }
    },
    [],
  );

  const handleDeleteHighlight = useCallback(async (highlightId: string) => {
    setHighlightError(null);
    try {
      await deleteHighlight(highlightId);
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    } catch (err) {
      setHighlightError(getApiErrorMessage(err, "Could not delete highlight."));
    } finally {
      setActiveHighlight(null);
    }
  }, []);

  const calculatedWidth = Math.max(300, Math.min(containerWidth * scale, 1400));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 size={24} className="text-accent animate-spin" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-2xl mx-auto flex items-center gap-2 text-sm text-error bg-error/10 border border-error rounded-lg px-3.5 py-2.5">
        {error ?? "Material not found."}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      {highlightError && (
        <div className="mb-3 text-xs text-error bg-error/10 border border-error rounded-lg px-3 py-2 flex-shrink-0">
          {highlightError}
        </div>
      )}

      {/* Document Viewport - Uses full vertical height cleanly */}
      <div
        ref={containerRef}
        className="h-full flex-1 w-full overflow-y-auto bg-surface border border-default rounded-2xl p-6 scroll-smooth relative flex flex-col items-center"
      >
        {fileSource ? (
          <Document
            file={fileSource}
            options={documentOptions}
            onLoadSuccess={onDocumentLoad}
            onLoadError={(err) => {
              console.error("PDF.js Load Error:", err);
              setError("Failed to parse and render PDF document.");
            }}
            loading={
              <div className="flex justify-center py-24">
                <Loader2 size={24} className="text-accent animate-spin" />
              </div>
            }
            error={
              <div className="flex justify-center py-24">
                <p className="text-sm text-error">Could not render this PDF.</p>
              </div>
            }
            className="flex flex-col items-center gap-6 w-full"
          >
            {numPages &&
              Array.from({ length: numPages }, (_, index) => {
                const pageNo = index + 1;
                return (
                  <PdfPageItem
                    key={`page_${pageNo}`}
                    pageNo={pageNo}
                    calculatedWidth={calculatedWidth}
                    highlights={highlights.filter(
                      (h) => h.pageNumber === pageNo,
                    )}
                    pageEl={pageRefs.current.get(pageNo)}
                    isTextLayerReady={renderedPages.current.has(pageNo)}
                    onRegisterRef={registerPageRef}
                    onTextLayerRendered={handleTextLayerRendered}
                    onHighlightClick={(highlight, rect) =>
                      setActiveHighlight({
                        highlight,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      })
                    }
                  />
                );
              })}
          </Document>
        ) : (
          <div className="flex justify-center py-24 text-sm text-muted">
            No PDF data available.
          </div>
        )}
      </div>

      {/* Popovers */}
      {pendingSelection && (
        <div ref={popoverRef}>
          <SelectionPopover
            x={pendingSelection.x}
            y={pendingSelection.y}
            mode="create"
            selectedText={pendingSelection.text}
            onPickColor={(color) => handleCreateHighlight(color)}
            onSaveNote={(note) => handleCreateHighlight("yellow", note)}
            onAskAI={onAskAI}
            onClose={() => {
              preserveSelectionRef.current = false;
              window.getSelection()?.removeAllRanges();
              setPendingSelection(null);
            }}
          />
        </div>
      )}

      {activeHighlight && (
        <div ref={popoverRef}>
          <SelectionPopover
            x={activeHighlight.x}
            y={activeHighlight.y}
            mode="edit"
            initialNote={activeHighlight.highlight.note ?? ""}
            onPickColor={(color) =>
              handleUpdateHighlight(activeHighlight.highlight.id, { color })
            }
            onSaveNote={(note) =>
              handleUpdateHighlight(activeHighlight.highlight.id, { note })
            }
            onDelete={() => handleDeleteHighlight(activeHighlight.highlight.id)}
            onClose={() => setActiveHighlight(null)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Isolated PDF Page Sub-Component
 */
interface PdfPageItemProps {
  pageNo: number;
  calculatedWidth: number;
  highlights: Highlight[];
  pageEl?: HTMLDivElement;
  isTextLayerReady: boolean;
  onRegisterRef: (pageNo: number, el: HTMLDivElement | null) => void;
  onTextLayerRendered: (pageNo: number) => void;
  onHighlightClick: (highlight: Highlight, rect: DOMRect) => void;
}

function PdfPageItem({
  pageNo,
  calculatedWidth,
  highlights,
  pageEl,
  isTextLayerReady,
  onRegisterRef,
  onTextLayerRendered,
  onHighlightClick,
}: PdfPageItemProps) {
  return (
    <div
      id={`pdf-page-${pageNo}`}
      data-page-number={pageNo}
      ref={(el) => onRegisterRef(pageNo, el)}
      style={{ width: `${calculatedWidth}px` }}
      className="pdf-page-wrapper relative min-h-[400px] max-w-full bg-white shadow-md rounded-lg overflow-hidden flex justify-center items-center transition-all duration-150"
    >
      <Page
        pageNumber={pageNo}
        width={calculatedWidth}
        renderAnnotationLayer={false}
        renderTextLayer={true}
        onRenderTextLayerSuccess={() => onTextLayerRendered(pageNo)}
        loading={
          <div className="flex items-center gap-2 text-sm text-muted py-12">
            <Loader2 size={16} className="animate-spin" />
            Loading Page {pageNo}...
          </div>
        }
      />

      {highlights.length > 0 && pageEl && (
        <HighlightLayer
          pageEl={pageEl}
          highlights={highlights}
          textLayerReady={isTextLayerReady}
          onHighlightClick={onHighlightClick}
        />
      )}
    </div>
  );
}

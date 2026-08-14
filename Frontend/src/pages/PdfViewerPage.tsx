import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  onAskAI?: (selectedText: string) => void;
}

export default function PdfViewerPage({ onAskAI }: PdfViewerPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<Material | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [furthestPage, setFurthestPage] = useState(1);

  // --- Highlight state ---
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  // Bumped manually (not per text-layer event) so we don't cause a
  // re-render storm that can wipe an in-progress native selection.
  const [renderTick, setRenderTick] = useState(0);
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
  const preserveSelectionRef = useRef(false); // Flag to prevent clearing selection

  // 1. Fetch material details
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getMaterials()
      .then((materials) => {
        if (cancelled) return;
        const found = materials.find((m) => m.id === id);
        if (found) {
          setMaterial(found);
        } else {
          setError("Material not found.");
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load this material."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 2. Fetch PDF binary blob
  useEffect(() => {
    if (!material) return;

    let cancelled = false;
    let createdObjectUrl = "";
    setIsPdfLoading(true);

    api
      .get(`/student/pdfs/${material.id}/file`, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        if (!cancelled) {
          const blob = new Blob([res.data], { type: "application/pdf" });
          createdObjectUrl = URL.createObjectURL(blob);
          setPdfUrl(createdObjectUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to download PDF file."));
        }
      })
      .finally(() => {
        if (!cancelled) setIsPdfLoading(false);
      });

    return () => {
      cancelled = true;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [material]);

  // 2b. Fetch existing highlights once we know the material id
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getHighlights(id)
      .then((data) => {
        if (!cancelled) setHighlights(data);
      })
      .catch(() => {
        // Non-fatal: viewer still works without highlights loaded
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 3. Document initial load handler
  const onDocumentLoad = ({ numPages: total }: { numPages: number }): void => {
    setNumPages(total);

    if (!hasRestoredStartingPage.current && material) {
      const startingPage = Math.max(
        1,
        Math.round((material.progress / 100) * total),
      );
      setFurthestPage(startingPage);
      hasRestoredStartingPage.current = true;

      setTimeout(() => {
        const el = document.getElementById(`pdf-page-${startingPage}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    }
  };

  // 4. Track reading progress via IntersectionObserver
  useEffect(() => {
    if (!numPages || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageAttr = entry.target.getAttribute("data-page-number");
            if (pageAttr) {
              const currentVisiblePage = parseInt(pageAttr, 10);
              setFurthestPage((prev) => Math.max(prev, currentVisiblePage));
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.15,
      },
    );

    const pageElements =
      containerRef.current.querySelectorAll(".pdf-page-wrapper");
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [numPages]);

  // 5. Debounce backend progress saves
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

  useEffect(() => {
    return () => {
      if (numPages) saveProgress(furthestPage, numPages);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 6. Text-layer ready tracking — only re-renders once per page, not per
  // event storm, and never mid-drag since it's driven by PDF.js's own
  // render-complete callback rather than by mouse events.
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

  // 7. Selection handling - Completely rewritten to prevent deselection
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleSelectionChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Don't process if we're preserving selection
        if (preserveSelectionRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          return;
        }

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

        // Set flag to preserve selection
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

  // 8. Close popovers on outside click
  useEffect(() => {
    if (!pendingSelection && !activeHighlight) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      // Clear selection when closing popover via outside click
      preserveSelectionRef.current = false;
      window.getSelection()?.removeAllRanges();
      setPendingSelection(null);
      setActiveHighlight(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pendingSelection, activeHighlight]);

  // 9. CRUD handlers
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
        
        // Clear selection and popover AFTER successful creation
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

  const percent = numPages ? Math.round((furthestPage / numPages) * 100) : 0;

  if (isLoading || isPdfLoading) {
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
    <div className="max-w-4xl mx-auto flex flex-col w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-primary">
            {material.fileName}
          </p>
          <p className="text-xs text-muted">{material.courseName}</p>
        </div>

        <span className="text-xs font-mono text-secondary w-20 text-right">
          {percent}% read
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden mb-4 flex-shrink-0">
        <div
          className="h-full bg-accent-secondary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {highlightError && (
        <div className="mb-3 text-xs text-error bg-error/10 border border-error rounded-lg px-3 py-2 flex-shrink-0">
          {highlightError}
        </div>
      )}

      {/* Scrollable Container with Explicit Height */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-180px)] w-full overflow-y-auto bg-surface border border-default rounded-2xl p-6 scroll-smooth relative"
      >
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoad}
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
              Array.from(new Array(numPages), (_, index) => {
                const pageNo = index + 1;
                const pageHighlights = highlights.filter(
                  (h) => h.pageNumber === pageNo,
                );
                const pageEl = pageRefs.current.get(pageNo);

                return (
                  <div
                    key={`page_${pageNo}`}
                    id={`pdf-page-${pageNo}`}
                    data-page-number={pageNo}
                    ref={(el) => registerPageRef(pageNo, el)}
                    /* Reserved min-height prevents 0px layout collapse */
                    className="pdf-page-wrapper relative min-h-[880px] w-[640px] max-w-full bg-white shadow-md rounded-lg overflow-hidden flex justify-center items-center"
                  >
                    <Page
                      pageNumber={pageNo}
                      width={640}
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                      onRenderTextLayerSuccess={() =>
                        handleTextLayerRendered(pageNo)
                      }
                      loading={
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Loader2 size={16} className="animate-spin" />
                          Loading Page {pageNo}...
                        </div>
                      }
                    />

                    {pageHighlights.length > 0 && pageEl && (
                      <HighlightLayer
                        pageEl={pageEl}
                        highlights={pageHighlights}
                        textLayerReady={renderedPages.current.has(pageNo)}
                        onHighlightClick={(highlight, rect) =>
                          setActiveHighlight({
                            highlight,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          })
                        }
                      />
                    )}
                  </div>
                );
              })}
          </Document>
        )}
      </div>

      {/* Popover for creating a new highlight from a text selection */}
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

      {/* Popover for editing/deleting an existing highlight */}
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

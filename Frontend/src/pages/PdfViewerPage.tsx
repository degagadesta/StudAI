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

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SAVE_DEBOUNCE_MS = 800;

export default function PdfViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<Material | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [furthestPage, setFurthestPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasRestoredStartingPage = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      {/* Scrollable Container with Explicit Height */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-180px)] w-full overflow-y-auto bg-surface border border-default rounded-2xl p-6 scroll-smooth"
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
                return (
                  <div
                    key={`page_${pageNo}`}
                    id={`pdf-page-${pageNo}`}
                    data-page-number={pageNo}
                    /* Reserved min-height prevents 0px layout collapse */
                    className="pdf-page-wrapper min-h-[880px] w-[640px] max-w-full bg-white shadow-md rounded-lg overflow-hidden flex justify-center items-center"
                  >
                    <Page
                      pageNumber={pageNo}
                      width={640}
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                      loading={
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Loader2 size={16} className="animate-spin" />
                          Loading Page {pageNo}...
                        </div>
                      }
                    />
                  </div>
                );
              })}
          </Document>
        )}
      </div>
    </div>
  );
}

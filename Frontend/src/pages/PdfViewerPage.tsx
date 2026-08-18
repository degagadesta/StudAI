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

// Set worker source via reliable unpkg CDN matching installed pdfjs version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SAVE_DEBOUNCE_MS = 800;

interface PdfViewerPageProps {
  scale?: number;
  onMetaLoaded?: (meta: { fileName: string; courseName: string }) => void;
  onProgressChange?: (percent: number) => void;
}

export default function PdfViewerPage({
  scale = 1.0,
  onMetaLoaded,
  onProgressChange,
}: PdfViewerPageProps) {
  const { id } = useParams<{ id: string }>();

  const [material, setMaterial] = useState<Material | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [furthestPage, setFurthestPage] = useState(1);

  // Container width state
  const [containerWidth, setContainerWidth] = useState<number>(640);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasRestoredStartingPage = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preserve latest prop references to prevent unnecessary re-fetches
  const onMetaLoadedRef = useRef(onMetaLoaded);
  const onProgressChangeRef = useRef(onProgressChange);

  useEffect(() => {
    onMetaLoadedRef.current = onMetaLoaded;
    onProgressChangeRef.current = onProgressChange;
  }, [onMetaLoaded, onProgressChange]);

  // Memoize Document source payload safely
  const fileSource = useMemo(() => {
    if (!pdfData) return null;
    return { data: pdfData };
  }, [pdfData]);

  // Memoize worker options
  const documentOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    [],
  );

  // Resizing container observer with debounce
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

  // 1. Fetch material details & PDF binary together
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

          // Fetch PDF binary
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

  // 2. Document initial load handler
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
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    }
  };

  // 3. Track reading progress via IntersectionObserver
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

  // Notify parent of reading percentage changes
  useEffect(() => {
    const percent = numPages ? Math.round((furthestPage / numPages) * 100) : 0;
    onProgressChangeRef.current?.(percent);
  }, [furthestPage, numPages]);

  // 4. Debounce backend progress saves
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

  const calculatedWidth = Math.max(300, Math.min(containerWidth * scale, 1400));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 size={24} className="text-[#253D31] animate-spin" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-2xl mx-auto flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
        {error ?? "Material not found."}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center overflow-y-auto"
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
              <Loader2 size={24} className="text-[#253D31] animate-spin" />
            </div>
          }
          error={
            <div className="flex justify-center py-24">
              <p className="text-sm text-red-600">Could not render this PDF.</p>
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
                  style={{ width: `${calculatedWidth}px` }}
                  className="pdf-page-wrapper min-h-[400px] max-w-full bg-white shadow-md rounded-lg overflow-hidden flex justify-center items-center transition-all duration-150"
                >
                  <Page
                    pageNumber={pageNo}
                    width={calculatedWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                    loading={
                      <div className="flex items-center gap-2 text-sm text-[#5B6156] py-12">
                        <Loader2 size={16} className="animate-spin" />
                        Loading Page {pageNo}...
                      </div>
                    }
                  />
                </div>
              );
            })}
        </Document>
      ) : (
        <div className="flex justify-center py-24 text-sm text-[#5B6156]">
          No PDF data available.
        </div>
      )}
    </div>
  );
}

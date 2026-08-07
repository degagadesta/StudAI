import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  getMaterial,
  updateMaterialProgress,
  type Material,
} from "../api/Materialsapi";
import { getApiErrorMessage } from "../api/authApi";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SAVE_DEBOUNCE_MS = 800;

export default function PdfViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [furthestPage, setFurthestPage] = useState(1);
  const hasRestoredStartingPage = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMaterial(id)
      .then((data) => {
        if (!cancelled) setMaterial(data);
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

  const onDocumentLoad = ({ numPages: total }: { numPages: number }): void => {
    setNumPages(total);

    if (!hasRestoredStartingPage.current && material) {
      const startingPage = Math.max(
        1,
        Math.round((material.progress / 100) * total),
      );
      setPageNumber(startingPage);
      setFurthestPage(startingPage);
      hasRestoredStartingPage.current = true;
    }
  };

  const saveProgress = useCallback(
    (page: number, total: number) => {
      if (!id) return;
      const percent = Math.round((page / total) * 100);
      updateMaterialProgress(id, percent).catch(() => {
        // Non-fatal fallback
      });
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

  const changePage = (newPage: number): void => {
    setPageNumber(newPage);
    setFurthestPage((prev) => Math.max(prev, newPage));
  };

  const goPrev = (): void => changePage(Math.max(1, pageNumber - 1));
  const goNext = (): void =>
    changePage(numPages ? Math.min(numPages, pageNumber + 1) : pageNumber);

  const percent = numPages ? Math.round((furthestPage / numPages) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 size={24} className="text-[#2F4A3D] animate-spin" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="max-w-2xl mx-auto flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5">
        {error ?? "Material not found."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#5B6156] hover:text-[#253D31] transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-[#253D31]">
            {material.fileName}
          </p>
          <p className="text-xs text-[#A9A18A]">{material.courseName}</p>
        </div>

        <span className="text-xs font-mono text-[#5B6156] w-16 text-right">
          {percent}%
        </span>
      </div>

      <div className="h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#8CA37E] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-center bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-4 min-h-[600px]">
        <Document
          file={material.fileUrl}
          onLoadSuccess={onDocumentLoad}
          loading={
            <Loader2 size={24} className="text-[#2F4A3D] animate-spin my-24" />
          }
          error={
            <p className="text-sm text-[#8B3A3A] my-24">
              Could not render this PDF.
            </p>
          }
        >
          <Page pageNumber={pageNumber} width={640} />
        </Document>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageNumber <= 1}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#5B6156] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[#253D31] transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="text-sm text-[#5B6156] font-mono">
          Page {pageNumber} of {numPages ?? "…"}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={!numPages || pageNumber >= numPages}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#5B6156] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[#253D31] transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

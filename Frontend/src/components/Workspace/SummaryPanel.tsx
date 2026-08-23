import { useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { generateSummary } from "../../api/aiApi";
import FormattedMarkdown from "../common/FormattedMarkdown";

interface SummaryPanelProps {
  materialId: string;
  materialName?: string;
}

export default function SummaryPanel({
  materialId,
  materialName,
}: SummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async (forceRegenerate: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateSummary(materialId, forceRegenerate);
      setSummary(result.summary);
      setIsCached(result.cached);
    } catch (err: any) {
      console.error("Failed to generate summary:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate summary. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (materialId) {
      loadSummary(false);
    }
  }, [materialId]);

  const handleRegenerate = () => {
    if (!isLoading) {
      loadSummary(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-default bg-elevated/40 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <FileText size={16} />
          </div>
          <div className="truncate">
            {materialName ? (
              <p className="text-xs font-semibold text-primary truncate">
                {materialName}
              </p>
            ) : (
              <p className="text-xs font-semibold text-primary">
                Document Summary
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-inverse bg-accent hover:opacity-90 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0 ml-2"
          title="Regenerate summary with AI"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span>{isLoading ? "Regenerating..." : "Regenerate Summary"}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center">
            <Loader2 size={32} className="text-accent animate-spin mb-3" />
            <p className="text-sm font-medium text-primary">
              Generating AI summary...
            </p>
            <p className="text-xs text-secondary mt-1">
              Analyzing course material and building key takeaways...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center px-4">
            <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-error" />
            </div>
            <p className="text-sm font-medium text-primary mb-1">
              Failed to generate summary
            </p>
            <p className="text-xs text-secondary mb-4">{error}</p>
            <button
              onClick={() => loadSummary(false)}
              className="px-4 py-2 text-xs font-semibold text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity cursor-pointer shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Cached indicator */}
            {isCached && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success-bg border border-success/30 rounded-lg w-fit">
                <CheckCircle2 size={13} className="text-success" />
                <span className="text-[11px] font-medium text-success">
                  Loaded from cache
                </span>
              </div>
            )}

            {/* Summary content */}
            <FormattedMarkdown content={summary} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center px-4">
            <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-3">
              <FileText size={24} className="text-secondary" />
            </div>
            <p className="text-sm font-medium text-primary">
              No summary available
            </p>
            <p className="text-xs text-secondary mt-1">
              Click the button below to generate a summary of this material
            </p>
            <button
              onClick={() => loadSummary(false)}
              className="mt-4 px-4 py-2 text-xs font-semibold text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity cursor-pointer shadow-sm"
            >
              Generate Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

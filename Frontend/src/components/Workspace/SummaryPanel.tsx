import { useEffect, useState } from "react";
import { FileText, RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { generateSummary } from "../../api/aiApi";

interface SummaryPanelProps {
  materialId: string;
  materialName?: string;
}

export default function SummaryPanel({ materialId, materialName }: SummaryPanelProps) {
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
      setError(err.response?.data?.message || "Failed to generate summary. Please try again.");
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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-default">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Summary</h3>
            {materialName && (
              <p className="text-xs text-secondary truncate">{materialName}</p>
            )}
          </div>
        </div>

        {summary && !isLoading && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary hover:text-accent hover:bg-elevated rounded-lg transition-colors cursor-pointer"
            title="Regenerate summary"
          >
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 size={32} className="text-accent animate-spin mb-3" />
            <p className="text-sm font-medium text-primary">Generating summary...</p>
            <p className="text-xs text-secondary mt-1">
              This may take a moment for long documents
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-error" />
            </div>
            <p className="text-sm font-medium text-primary mb-1">Failed to generate summary</p>
            <p className="text-xs text-secondary mb-4">{error}</p>
            <button
              onClick={() => loadSummary(false)}
              className="px-4 py-2 text-xs font-medium text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Cached indicator */}
            {isCached && (
              <div className="flex items-center gap-2 px-3 py-2 bg-success-bg border border-success/30 rounded-lg">
                <CheckCircle2 size={14} className="text-success" />
                <span className="text-xs text-success">Loaded from cache</span>
              </div>
            )}

            {/* Summary content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-sm text-primary leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-3">
              <FileText size={24} className="text-secondary" />
            </div>
            <p className="text-sm font-medium text-primary">No summary available</p>
            <p className="text-xs text-secondary mt-1">
              Click the button below to generate a summary of this material
            </p>
            <button
              onClick={() => loadSummary(false)}
              className="mt-4 px-4 py-2 text-xs font-medium text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity"
            >
              Generate Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

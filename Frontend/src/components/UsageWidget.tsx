import { useState, useEffect } from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { getUsageSummary, isNearLimit, isLimitExceeded, type UsageSummary } from "../api/usageApi";

interface UsageWidgetProps {
  onClick?: () => void;
}

export default function UsageWidget({ onClick }: UsageWidgetProps) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [hasWarnings, setHasWarnings] = useState(false);

  useEffect(() => {
    loadUsage();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUsage = async () => {
    try {
      const data = await getUsageSummary();
      setUsage(data);

      // Check if any limits are near or exceeded
      const warnings = [
        data.usage.pdfUploads,
        data.usage.chatMessages,
        data.usage.summary,
        data.usage.quizGeneration,
      ].some(limit => isNearLimit(limit) || isLimitExceeded(limit));

      setHasWarnings(warnings || data.isExpired);
    } catch (err) {
      console.error("Failed to load usage:", err);
    }
  };

  if (!usage || usage.plan === "PRO") {
    return null; // Don't show for PRO users (unlimited)
  }

  const planColors = {
    FREE: "border-border text-secondary",
    STUDENT: "border-accent/30 text-accent",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:bg-surface-hover cursor-pointer ${
        hasWarnings
          ? "border-warning/40 text-warning bg-warning/5"
          : planColors[usage.plan as keyof typeof planColors] || planColors.FREE
      }`}
      title="View usage limits"
    >
      {hasWarnings ? (
        <AlertTriangle size={14} className="text-warning" />
      ) : (
        <Activity size={14} />
      )}
      <span>{usage.plan}</span>
      {hasWarnings && (
        <span className="flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-warning opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-warning"></span>
        </span>
      )}
    </button>
  );
}

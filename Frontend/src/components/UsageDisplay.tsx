import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, Zap, Calendar } from "lucide-react";
import { getUsageSummary, getUsagePercentage, isNearLimit, type UsageSummary } from "../api/usageApi";

interface UsageDisplayProps {
  compact?: boolean;
  onUpgradeClick?: () => void;
}

export default function UsageDisplay({ compact = false, onUpgradeClick }: UsageDisplayProps) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const data = await getUsageSummary();
      setUsage(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load usage:", err);
      setError(err?.response?.data?.error || "Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-default rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-border rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-border rounded"></div>
          <div className="h-3 bg-border rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="bg-surface border border-default rounded-xl p-6">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle size={20} />
          <p className="text-sm">{error || "Unable to load usage data"}</p>
        </div>
      </div>
    );
  }

  const features = [
    { name: "PDF Uploads", data: usage.usage.pdfUploads, icon: "📄" },
    { name: "AI Chat Messages", data: usage.usage.chatMessages, icon: "💬" },
    { name: "Flashcards", data: usage.usage.flashcards, icon: "🎴" },
    { name: "AI Summaries", data: usage.usage.summary, icon: "📝" },
    { name: "Quiz Generations", data: usage.usage.quizGeneration, icon: "🎯" },
    { name: "Active Courses", data: usage.usage.activeCourses, icon: "📚" },
  ];

  const planColors = {
    FREE: "text-secondary",
    STUDENT: "text-accent",
    PRO: "text-purple-500",
  };

  const planBadges = {
    FREE: "bg-border text-secondary",
    STUDENT: "bg-accent/10 text-accent border-accent/20",
    PRO: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  if (compact) {
    const criticalFeatures = features.filter(f => f.data.limit !== null && isNearLimit(f.data));
    
    if (criticalFeatures.length === 0) {
      return null; // Don't show if nothing near limit
    }

    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-warning mb-1">Usage Warning</p>
            <p className="text-xs text-secondary">
              You're running low on {criticalFeatures[0].name}
            </p>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors whitespace-nowrap"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-default rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-default bg-elevated">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={20} className={planColors[usage.plan as keyof typeof planColors]} />
            <h3 className="font-semibold text-primary">Usage & Limits</h3>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              planBadges[usage.plan as keyof typeof planBadges]
            }`}
          >
            {usage.plan} Plan
          </span>
        </div>

        {/* Subscription Expiry Warning */}
        {usage.isExpired && (
          <div className="flex items-center gap-2 p-2 bg-error/10 border border-error/20 rounded-lg">
            <AlertCircle size={14} className="text-error shrink-0" />
            <p className="text-xs text-error">
              Your subscription has expired. Upgrade to restore access.
            </p>
          </div>
        )}

        {/* Billing Period */}
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Calendar size={14} />
          <span>
            Resets on {new Date(usage.billingPeriodEnd).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Usage Items */}
      <div className="p-4 space-y-4">
        {features.map((feature) => {
          const percentage = getUsagePercentage(feature.data);
          const nearLimit = isNearLimit(feature.data);
          const exceeded = feature.data.limit !== null && feature.data.used >= feature.data.limit;
          const unlimited = feature.data.limit === null;

          return (
            <div key={feature.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{feature.icon}</span>
                  <span className="text-sm font-medium text-primary">
                    {feature.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {nearLimit && !exceeded && (
                    <AlertCircle size={14} className="text-warning" />
                  )}
                  {exceeded && (
                    <AlertCircle size={14} className="text-error" />
                  )}
                  <span className={`text-sm font-mono ${
                    exceeded ? "text-error" : nearLimit ? "text-warning" : "text-secondary"
                  }`}>
                    {feature.data.used}
                    {unlimited ? " " : ` / ${feature.data.limit}`}
                    {unlimited && <span className="text-xs ml-1">∞</span>}
                  </span>
                </div>
              </div>

              {!unlimited && (
                <div className="relative h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                      exceeded
                        ? "bg-error"
                        : nearLimit
                        ? "bg-warning"
                        : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {usage.plan === "FREE" && onUpgradeClick && (
        <div className="p-4 border-t border-default bg-elevated">
          <button
            onClick={onUpgradeClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingUp size={16} />
            <span>Upgrade for More</span>
          </button>
        </div>
      )}
    </div>
  );
}

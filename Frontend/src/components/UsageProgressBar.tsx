import { getUsagePercentage, isNearLimit, isLimitExceeded, type UsageLimit } from "../api/usageApi";

interface UsageProgressBarProps {
  usage: UsageLimit;
  featureName: string;
  showLabel?: boolean;
  compact?: boolean;
}

export default function UsageProgressBar({
  usage,
  featureName,
  showLabel = true,
  compact = false,
}: UsageProgressBarProps) {
  const percentage = getUsagePercentage(usage);
  const nearLimit = isNearLimit(usage);
  const exceeded = isLimitExceeded(usage);
  const unlimited = usage.limit === null;

  if (unlimited) {
    return showLabel ? (
      <div className="flex items-center gap-2">
        <span className="text-xs text-secondary">{featureName}</span>
        <span className="text-xs text-accent font-medium">Unlimited ∞</span>
      </div>
    ) : null;
  }

  const barColor = exceeded
    ? "bg-error"
    : nearLimit
    ? "bg-warning"
    : "bg-accent";

  const textColor = exceeded
    ? "text-error"
    : nearLimit
    ? "text-warning"
    : "text-secondary";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-xs text-secondary min-w-[80px]">
            {featureName}
          </span>
        )}
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${textColor} min-w-[60px] text-right`}>
          {usage.used} / {usage.limit}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">{featureName}</span>
          <span className={`text-sm font-mono ${textColor}`}>
            {usage.used} / {usage.limit}
          </span>
        </div>
      )}
      <div className="relative h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {exceeded && (
        <p className="text-xs text-error">
          Limit reached! Upgrade to continue using this feature.
        </p>
      )}
      {nearLimit && !exceeded && (
        <p className="text-xs text-warning">
          Running low! Consider upgrading soon.
        </p>
      )}
    </div>
  );
}

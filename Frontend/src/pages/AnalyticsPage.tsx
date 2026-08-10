import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  CalendarCheck2,
  type LucideIcon,
} from "lucide-react";
import {
  getAnalytics,
  type AnalyticsSummary,
  type ActivityBreakdown,
  type MaterialProgressRow,
} from "../api/AnalyticsApi";
import { getApiErrorMessage } from "../api/authApi";
import ActivityBarChart from "../components/Analytics/ActivityBarChart";
import MaterialsProgressTable from "../components/Analytics/MaterialsProgressTable";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  dark?: boolean;
}

function StatCard({ icon: Icon, label, value, dark = false }: StatCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl ${
        dark ? "bg-accent text-inverse" : "bg-surface border border-default"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon
          size={15}
          className={dark ? "text-accent-light" : "text-accent"}
        />
        <p className={`text-xs ${dark ? "text-inverse/70" : "text-secondary"}`}>
          {label}
        </p>
      </div>
      <p
        className={`font-serif text-2xl ${dark ? "text-inverse" : "text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [activity, setActivity] = useState<ActivityBreakdown | null>(null);
  const [materials, setMaterials] = useState<MaterialProgressRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data (summary, activity, and materials) on mount
  useEffect(() => {
    let cancelled = false;
    getAnalytics()
      .then(({ summary, activity, materials }) => {
        if (cancelled) return;
        setSummary(summary);
        setActivity(activity);
        setMaterials(materials);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load your analytics."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-elevated animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-elevated animate-pulse" />
        <div className="h-96 rounded-2xl bg-elevated animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-error bg-error border border-error rounded-lg px-3.5 py-2.5">
        {error}
      </div>
    );
  }

  if (!summary || !activity) return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen}
          label="Courses enrolled"
          value={String(summary.enrolledCourses)}
        />
        <StatCard
          icon={FileText}
          label="PDFs uploaded"
          value={String(summary.totalPdfsUploaded)}
        />
        <StatCard
          icon={CalendarCheck2}
          label="Events saved"
          value={String(summary.totalEvents)}
          dark
        />
      </div>

      <ActivityBarChart data={activity} />

      <MaterialsProgressTable rows={materials} />
    </div>
  );
}

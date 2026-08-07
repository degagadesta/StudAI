import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  CalendarCheck2,
  type LucideIcon,
} from "lucide-react";
import {
  getAnalytics,
  getMaterialsProgress,
  type AnalyticsSummary,
  type ActivityBreakdown,
  type MaterialProgressRow,
} from "../api/AnalyticsApi";
import { getApiErrorMessage } from "../api/authApi";
import ActivityBarChart from "../components/analytics/ActivityBarChart";
import MaterialsProgressTable from "../components/analytics/MaterialsProgressTable";

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
        dark
          ? "bg-[#253D31] text-[#F6F1E3]"
          : "bg-[#FFFDF7] border border-[#DCD2B4]"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon
          size={15}
          className={dark ? "text-[#C7D3B9]" : "text-[#2F4A3D]"}
        />
        <p
          className={`text-xs ${dark ? "text-[#F6F1E3]/70" : "text-[#5B6156]"}`}
        >
          {label}
        </p>
      </div>
      <p
        className={`font-serif text-2xl ${dark ? "text-[#F6F1E3]" : "text-[#253D31]"}`}
      >
        {value}
      </p>
    </div>
  );
}

const MATERIALS_PAGE_SIZE = 8;

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [activity, setActivity] = useState<ActivityBreakdown | null>(null);
  const [materials, setMaterials] = useState<MaterialProgressRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on mount
  useEffect(() => {
    let cancelled = false;
    getAnalytics()
      .then(({ summary, activity }) => {
        if (cancelled) return;
        setSummary(summary);
        setActivity(activity);
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

  // Fetch materials progress (disabled until backend endpoint is ready)
  useEffect(() => {
    let cancelled = false;
    getMaterialsProgress(page, MATERIALS_PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setMaterials(res.rows);
        setTotalPages(Math.max(1, Math.ceil(res.total / res.limit)));
      })
      .catch((err: unknown) => {
        // Silently fail - endpoint doesn't exist yet
        console.log('Materials endpoint not available yet');
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[#EFE8D4] animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-[#EFE8D4] animate-pulse" />
        <div className="h-96 rounded-2xl bg-[#EFE8D4] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5">
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

      <MaterialsProgressTable
        rows={materials}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

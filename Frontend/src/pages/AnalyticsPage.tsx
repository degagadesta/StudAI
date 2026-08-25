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
import { useSocket } from "../hooks/useSocket";
import ActivityBarChart from "../components/Analytics/ActivityBarChart";
import MaterialsProgressTable from "../components/Analytics/MaterialsProgressTable";
import SocketStatus from "../components/SocketStatus";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  dark?: boolean;
}

function StatCard({ icon: Icon, label, value, dark = false }: StatCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl ${dark ? "bg-accent text-inverse" : "bg-surface border border-default"
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
  const [materialsPage, setMaterialsPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MATERIALS_PAGE_SIZE = 10;
  const materialsTotalPages = Math.max(1, Math.ceil(materials.length / MATERIALS_PAGE_SIZE));
  const pagedMaterials = materials.slice(
    (materialsPage - 1) * MATERIALS_PAGE_SIZE,
    materialsPage * MATERIALS_PAGE_SIZE
  );


  // Function to fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const { summary, activity, materials } = await getAnalytics();
      setSummary(summary);
      setActivity(activity);
      setMaterials(materials);
      setError(null); // Clear any previous errors
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not load your analytics."));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch analytics data on mount
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        await fetchAnalytics();
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load your analytics."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for real-time analytics updates
  useSocket('analytics:updated', (data: { trigger: string; sessionId?: string; duration?: number }) => {
    console.log('[Analytics] Real-time update received:', data);
    fetchAnalytics().catch(err => {
      console.error('[Analytics] Failed to refresh after real-time update:', err);
    });
  }, []);

  useSocket("course:added", () => {
    console.log('[Analytics] Course added, refreshing stats...');
    fetchAnalytics().catch(err => console.error('[Analytics] Failed to refresh after course add:', err));
  });

  useSocket("course:dropped", () => {
    console.log('[Analytics] Course dropped, refreshing stats...');
    fetchAnalytics().catch(err => console.error('[Analytics] Failed to refresh after course drop:', err));
  });

  useSocket("courses:cleared", () => {
    console.log('[Analytics] Courses cleared, refreshing stats...');
    fetchAnalytics().catch(err => console.error('[Analytics] Failed to refresh after courses cleared:', err));
  });

  useSocket("materials:batch_deleted", () => {
    console.log('[Analytics] Materials batch deleted, refreshing stats...');
    fetchAnalytics().catch(err => console.error('[Analytics] Failed to refresh after batch delete:', err));
  });

  useSocket("material:ready", () => {
    console.log('[Analytics] Material became ready, refreshing stats...');
    fetchAnalytics().catch(err => console.error('[Analytics] Failed to refresh after material ready:', err));
  });

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
      {/* Header with Socket Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            Analytics Dashboard
            {isRefreshing && (
              <span className="ml-2 text-sm text-secondary animate-pulse">
                • Updating...
              </span>
            )}
          </h1>
          <p className="text-sm text-secondary">Real-time insights into your learning progress</p>
        </div>
        <div className="flex items-center gap-3">
          <SocketStatus />
        </div>
      </div>

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
        rows={pagedMaterials}
        page={materialsPage}
        totalPages={materialsTotalPages}
        onPageChange={setMaterialsPage}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  BookOpen,
  FileCheck2,
  TrendingUp,
  Clock,
  GraduationCap,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  getDashboardSummary,
  getRecentActivity,
  type DashboardSummary,
  type ActivityRow,
} from "../api/Dashboardapi";
import { getAcademicProfile, type AcademicProfile } from "../api/Coursesapi";
import { getMaterials, type Material } from "../api/Materialsapi";
import { getUpcomingEvents, type ScheduleEvent } from "../api/Scheduleapi";
import { getApiErrorMessage } from "../api/authApi";
import Gauge from "../components/ui/Gauge";
import Sparkline from "../components/ui/Sparkiline";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: number[];
  dark?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  dark = false,
}: StatCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl flex items-center justify-between gap-3 ${
        dark
          ? "bg-[#253D31] text-[#F6F1E3]"
          : "bg-[#FFFDF7] border border-[#DCD2B4]"
      }`}
    >
      <div>
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
          className={`font-serif text-xl ${dark ? "text-[#F6F1E3]" : "text-[#253D31]"}`}
        >
          {value}
        </p>
      </div>
      <Sparkline points={trend} color={dark ? "#C7D3B9" : "#8CA37E"} />
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDashboardSummary(),
      getRecentActivity(),
      getAcademicProfile(),
      getMaterials(),
      getUpcomingEvents(),
    ])
      .then(
        ([
          summaryData,
          activityData,
          profileData,
          materialsData,
          eventsData,
        ]) => {
          if (cancelled) return;
          setSummary(summaryData);
          setActivity(activityData);
          setProfile(profileData);
          setMaterials(materialsData);
          setEvents(eventsData);
        },
      )
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load your dashboard."));
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
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-[#EFE8D4] animate-pulse"
          />
        ))}
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

  if (!summary || !profile) return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      {/* Row 1 — stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Active courses"
          value={String(summary.activeCourses)}
          trend={[3, 5, 4, 6, summary.activeCourses]}
        />
        <StatCard
          icon={FileText}
          label="Materials uploaded"
          value={String(materials.length)}
          trend={[1, 2, 2, 4, materials.length]}
        />
        <StatCard
          icon={FileCheck2}
          label="Past exams done"
          value={String(summary.pastExamsCompleted)}
          trend={[2, 3, 3, 5, summary.pastExamsCompleted]}
        />
        <StatCard
          icon={Clock}
          label="Days to next quiz"
          value={
            summary.daysUntilNextQuiz !== null
              ? String(summary.daysUntilNextQuiz)
              : "—"
          }
          trend={[8, 6, 5, 3, summary.daysUntilNextQuiz ?? 0]}
          dark
        />
      </div>

      {/* Row 2 — progress table, gauge, profile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
        <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-serif text-lg text-[#253D31]">
                Recent uploads
              </p>
              <p className="text-xs text-[#5B6156] mt-0.5">
                This semester's activity
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2F4A3D] bg-[#EAF3DE] px-2.5 py-1 rounded-full">
              <TrendingUp size={12} /> On track
            </span>
          </div>

          {activity.length === 0 ? (
            <p className="text-sm text-[#5B6156]">
              No uploads yet this semester.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#A9A18A] uppercase tracking-wide">
                  <th className="pb-2.5 font-medium">Roll No.</th>
                  <th className="pb-2.5 font-medium">PDF Name</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activity.slice(0, 5).map((row, i) => (
                  <tr
                    key={`${row.rollNumber}-${i}`}
                    className="border-t border-[#EFE8D4]"
                  >
                    <td className="py-2.5 text-[#5B6156] font-mono text-xs">
                      {row.rollNumber}
                    </td>
                    <td className="py-2.5 text-[#253D31] font-medium truncate max-w-[140px]">
                      {row.pdfName}
                    </td>
                    <td className="py-2.5 text-[#5B6156]">
                      {new Date(row.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-[#DCD2B4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8CA37E]"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#5B6156]">
                          {row.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6 flex flex-col items-center justify-between">
          <div className="w-full">
            <p className="font-serif text-lg text-[#253D31]">Exam readiness</p>
            <p className="text-xs text-[#5B6156] mt-0.5">
              Avg. course progress
            </p>
          </div>
          <Gauge value={summary.averageCourseProgress} />
          <p className="font-serif text-2xl text-[#253D31] -mt-2">
            {summary.averageCourseProgress}%
          </p>
        </div>

        <div className="bg-[#253D31] text-[#F6F1E3] rounded-2xl p-6 flex flex-col">
          <div className="w-14 h-14 rounded-full bg-[#2C4739] border border-[#F6F1E3]/15 flex items-center justify-center mb-4">
            <GraduationCap size={24} className="text-[#C7D3B9]" />
          </div>
          <p className="font-serif text-lg leading-tight">{profile.fullName}</p>
          <p className="text-xs text-[#F6F1E3]/60 mt-0.5">
            {profile.university}
          </p>
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[#F6F1E3]/10">
            <div>
              <p className="font-serif text-lg leading-none">{profile.year}</p>
              <p className="text-[10px] text-[#F6F1E3]/50 mt-1">Year</p>
            </div>
            <div>
              <p className="font-serif text-lg leading-none">
                {profile.semester}
              </p>
              <p className="text-[10px] text-[#F6F1E3]/50 mt-1">Semester</p>
            </div>
            <div>
              <p className="font-serif text-lg leading-none">
                {materials.length}
              </p>
              <p className="text-[10px] text-[#F6F1E3]/50 mt-1">Materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — materials stack, upcoming quizzes, AI tutor prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
          <p className="font-serif text-lg text-[#253D31] mb-1">
            Recent materials
          </p>
          <p className="text-xs text-[#5B6156] mb-4">Your latest uploads</p>
          {materials.length === 0 ? (
            <p className="text-sm text-[#5B6156]">No materials uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {materials.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4EFDD] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EFE8D4] flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-[#2F4A3D]" />
                  </div>
                  <p className="text-sm text-[#253D31] truncate">
                    {m.fileName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
          <p className="font-serif text-lg text-[#253D31] mb-1">
            Upcoming quizzes
          </p>
          <p className="text-xs text-[#5B6156] mb-4">From your Schedule</p>
          {events.length === 0 ? (
            <p className="text-sm text-[#5B6156]">Nothing scheduled yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-l-2 border-[#8CA37E] pl-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#253D31]">
                      {event.title}
                    </p>
                    <p className="text-xs text-[#A9A18A]">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#8A6B34] bg-[#EFE8D4] px-2 py-0.5 rounded-full shrink-0">
                    {daysUntil(event.date)}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-full bg-[#EAF3DE] flex items-center justify-center mb-4">
            <Sparkles size={19} className="text-[#2F4A3D]" />
          </div>
          <p className="font-serif text-base text-[#253D31] mb-1">
            Ask your AI tutor
          </p>
          <p className="text-xs text-[#5B6156] mb-4">
            Stuck on a topic? Ask a question grounded in your course material.
          </p>
          <button
            type="button"
            className="px-5 py-2 bg-[#2F4A3D] hover:bg-[#253D31] text-[#F6F1E3] text-xs font-semibold rounded-lg transition-colors"
          >
            Start a chat
          </button>
        </div>
      </div>
    </div>
  );
}

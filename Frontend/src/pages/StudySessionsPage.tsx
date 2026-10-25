import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Flame,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";
import { getCourses, type Course } from "../api/Coursesapi";
import {
  getStudyCalendar,
  getStudyHistory,
  getStudyStatistics,
  type StudyCalendarDay,
  type StudySession,
  type StudySessionStatistics,
} from "../api/studySessionApi";
import { getApiErrorMessage } from "../api/authApi";
import { usePomodoro } from "../hooks/usePomodoro";
import { useStudySession } from "../hooks/useStudySession";

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

function formatTimer(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthRange(date: Date): { startDate: string; endDate: string } {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59));
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-default bg-surface p-5">
      <div className="mb-3 flex items-center gap-2 text-secondary">
        <Icon size={17} className="text-accent" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-serif text-2xl text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

export default function StudySessionsPage() {
  const {
    activeSession,
    isLoading: isSessionLoading,
    error: activeSessionError,
    startSession,
    endSession,
    completePomodoro,
  } = useStudySession();
  const [statistics, setStatistics] = useState<StudySessionStatistics | null>(null);
  const [history, setHistory] = useState<StudySession[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [calendar, setCalendar] = useState<StudyCalendarDay[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [month, setMonth] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const refreshData = useCallback(async () => {
    try {
      const [stats, sessions] = await Promise.all([
        getStudyStatistics(),
        getStudyHistory({ limit: 20 }),
      ]);
      setStatistics(stats);
      setHistory(sessions.sessions);
      setTotalHistory(sessions.total);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load study session data."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refreshData);
    getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [refreshData]);

  useEffect(() => {
    const range = monthRange(month);
    getStudyCalendar(range.startDate, range.endDate)
      .then(setCalendar)
      .catch(() => setCalendar([]));
  }, [month]);

  useEffect(() => {
    if (!activeSession) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  const onFocusComplete = useCallback(async () => {
    if (activeSession?.type === "POMODORO") {
      try {
        await completePomodoro();
      } catch (err) {
        setActionError(getApiErrorMessage(err, "Could not save the completed Pomodoro."));
      }
    }
  }, [activeSession, completePomodoro]);
  const pomodoro = usePomodoro(onFocusComplete);

  const calendarByDate = useMemo(
    () => new Map(calendar.map((day) => [day.date, day])),
    [calendar],
  );
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index - mondayOffset + 1);
    return {
      date,
      inMonth: date.getMonth() === month.getMonth(),
      activity: calendarByDate.get(localDateKey(date)),
    };
  });
  const courseNames = useMemo(
    () => new Map(courses.map((course) => [course.id, course.name])),
    [courses],
  );
  const activeElapsed = activeSession
    ? Math.max(0, Math.floor((now - new Date(activeSession.startTime).getTime()) / 1000))
    : 0;
  const activeDuration = `${String(Math.floor(activeElapsed / 3600)).padStart(2, "0")}:${String(Math.floor((activeElapsed % 3600) / 60)).padStart(2, "0")}:${String(activeElapsed % 60).padStart(2, "0")}`;
  const isPomodoroActive = activeSession?.type === "POMODORO";
  const phaseLabel = pomodoro.phase === "focus"
    ? "Focus"
    : pomodoro.phase === "longBreak" ? "Long break" : "Short break";

  const handleStart = async (type: "REGULAR" | "POMODORO") => {
    setActionError(null);
    setIsBusy(true);
    try {
      await startSession(type, selectedCourse || undefined);
      if (type === "POMODORO") pomodoro.start();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not start a study session."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleEnd = async () => {
    setActionError(null);
    setIsBusy(true);
    try {
      await endSession();
      pomodoro.reset();
      await refreshData();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not end your study session."));
    } finally {
      setIsBusy(false);
    }
  };

  const handlePomodoroToggle = () => {
    if (!isPomodoroActive) {
      if (activeSession) {
        setActionError("End your regular study session before starting a Pomodoro.");
      } else {
        void handleStart("POMODORO");
      }
      return;
    }
    if (pomodoro.isRunning) pomodoro.pause();
    else pomodoro.start();
  };

  const changeMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      <header>
        <p className="mb-2 text-sm font-medium text-accent">Build a steady rhythm</p>
        <h1 className="font-serif text-3xl text-primary sm:text-4xl">Study sessions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
          Keep track of focused time, build a study streak, and take intentional breaks with Pomodoro.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">
          <span>{error}</span>
          <button type="button" onClick={() => void refreshData()} className="font-medium underline">Retry</button>
        </div>
      )}
      {activeSessionError && (
        <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">
          {activeSessionError}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Study statistics">
        <StatCard icon={Clock3} label="Today" value={statistics ? formatMinutes(statistics.today.minutes) : "—"} detail={`${statistics?.today.sessions ?? 0} sessions today`} />
        <StatCard icon={CalendarDays} label="This week" value={statistics ? formatMinutes(statistics.thisWeek.minutes) : "—"} detail={`${statistics?.thisWeek.sessions ?? 0} sessions in the last 7 days`} />
        <StatCard icon={Flame} label="Current streak" value={`${statistics?.streak.current ?? 0} days`} detail={`Longest: ${statistics?.streak.longest ?? 0} days`} />
        <StatCard icon={BookOpen} label="All time" value={statistics ? formatMinutes(statistics.totalMinutes) : "—"} detail={`${statistics?.totalSessions ?? 0} completed sessions`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-default bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-accent">
                <Timer size={18} />
                <span className="text-sm font-medium">Pomodoro timer</span>
              </div>
              <h2 className="font-serif text-2xl text-primary">{phaseLabel} time</h2>
              <p className="mt-1 text-sm text-secondary">25 minutes of focus, followed by a short break.</p>
            </div>
            <div className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              {activeSession?.pomodoroCount ?? 0} completed
            </div>
          </div>
          <div className="flex flex-col items-center py-7">
            <div className="flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-accent/15">
              <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-page">
                <span className="font-mono text-5xl font-semibold tabular-nums text-primary">{formatTimer(pomodoro.remainingSeconds)}</span>
                <span className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{phaseLabel}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePomodoroToggle}
                disabled={isBusy || isSessionLoading}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-inverse transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isBusy ? <Loader2 size={16} className="animate-spin" /> : pomodoro.isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isPomodoroActive ? (pomodoro.isRunning ? "Pause" : "Resume") : "Start focus"}
              </button>
              <button type="button" onClick={pomodoro.reset} aria-label="Reset Pomodoro timer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-default text-secondary hover:bg-elevated">
                <RotateCcw size={16} />
              </button>
            </div>
            <p className="mt-4 text-xs text-muted">Cycle {pomodoro.completedCycles + 1} · 4 focus sessions before a long break</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-secondary">
            <Coffee size={14} className="text-accent" />
            {pomodoro.phase === "focus" ? "A little focus goes a long way." : "Take a moment to reset."}
          </div>
        </div>

        <div className="flex flex-col rounded-3xl bg-accent p-6 text-inverse sm:p-8">
          <div className="flex items-center gap-2 text-inverse/70">
            <Clock3 size={18} />
            <span className="text-sm">Active session</span>
          </div>
          {activeSession ? (
            <>
              <p className="mt-7 font-serif text-3xl">{activeSession.type === "POMODORO" ? "Pomodoro in progress" : "You're in the zone"}</p>
              <p className="mt-2 text-sm text-inverse/70">
                {activeSession.courseId
                  ? courseNames.get(activeSession.courseId) ?? "Study session"
                  : "No course selected"}
              </p>
              <p className="mt-7 font-mono text-5xl tabular-nums">{activeDuration}</p>
              <button
                type="button"
                onClick={() => void handleEnd()}
                disabled={isBusy}
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-inverse px-5 py-3 text-sm font-semibold text-accent hover:opacity-90 disabled:opacity-50"
              >
                {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Finish session
              </button>
            </>
          ) : (
            <>
              <p className="mt-7 font-serif text-3xl">Ready when you are.</p>
              <p className="mt-2 text-sm leading-6 text-inverse/70">Start a regular study session to track focused time, or use the Pomodoro timer for structured focus and breaks.</p>
              <label className="mt-6 block text-xs font-medium text-inverse/80" htmlFor="study-course">Course (optional)</label>
              <select
                id="study-course"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="mt-2 w-full rounded-xl border border-inverse/20 bg-inverse/10 px-3 py-3 text-sm text-inverse outline-none focus:border-inverse/60"
              >
                <option value="" className="text-primary">Choose a course</option>
                {courses.map((course) => <option key={course.id} value={course.id} className="text-primary">{course.name}</option>)}
              </select>
              <button
                type="button"
                onClick={() => void handleStart("REGULAR")}
                disabled={isBusy || isSessionLoading}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-inverse px-5 py-3 text-sm font-semibold text-accent hover:opacity-90 disabled:opacity-50"
              >
                {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Start study session
              </button>
            </>
          )}
        </div>
      </section>

      {actionError && (
        <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">{actionError}</p>
      )}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-default bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-primary">Study calendar</h2>
              <p className="mt-1 text-xs text-secondary">Your completed study days</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-lg p-2 text-secondary hover:bg-elevated"><ArrowLeft size={16} /></button>
              <span className="min-w-28 text-center text-sm font-medium text-primary">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-lg p-2 text-secondary hover:bg-elevated"><ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={`${day}-${index}`} className="py-2 text-[10px] font-medium uppercase text-muted">{day}</div>
            ))}
            {calendarCells.map(({ date, inMonth, activity }) => (
              <div
                key={localDateKey(date)}
                title={activity ? `${activity.minutes} minutes, ${activity.sessions} sessions` : undefined}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs ${inMonth ? "text-primary" : "text-muted/50"} ${activity ? "bg-accent/15 font-semibold text-accent" : "hover:bg-elevated"}`}
              >
                {date.getDate()}
                {activity && <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>Less</span>
            <div className="flex gap-1">
              {["bg-elevated", "bg-accent/20", "bg-accent/50", "bg-accent"].map((color) => <span key={color} className={`h-3 w-3 rounded-sm ${color}`} />)}
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="rounded-3xl border border-default bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl text-primary">Recent sessions</h2>
              <p className="mt-1 text-xs text-secondary">A record of your completed focus time</p>
            </div>
            <span className="text-xs text-muted">{totalHistory} total</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-accent" /></div>
          ) : history.length ? (
            <div className="divide-y divide-default">
              {history.map((session) => (
                <HistoryRow key={session.id} session={session} courseName={session.courseId ? courseNames.get(session.courseId) : undefined} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-page px-5 py-10 text-center">
              <CalendarDays size={24} className="mx-auto text-muted" />
              <p className="mt-3 text-sm font-medium text-primary">No completed sessions yet</p>
              <p className="mt-1 text-xs text-secondary">Your study history will appear here.</p>
            </div>
          )}
          {!isLoading && history.length > 0 && totalHistory > history.length && (
            <p className="mt-4 text-center text-xs text-muted">Showing your latest {history.length} sessions</p>
          )}
        </div>
      </section>
    </div>
  );
}

function HistoryRow({ session, courseName }: { session: StudySession; courseName?: string }) {
  const date = new Date(session.startTime);
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-accent">
          {session.type === "POMODORO" ? <Timer size={16} /> : <BookOpen size={16} />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-primary">{courseName || (session.type === "POMODORO" ? "Pomodoro session" : "Study session")}</p>
          <p className="text-xs text-muted">{date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-primary">{formatMinutes(session.duration ?? 0)}</p>
        {session.pomodoroCount > 0 && <p className="text-xs text-muted">{session.pomodoroCount} pomodoros</p>}
      </div>
    </div>
  );
}

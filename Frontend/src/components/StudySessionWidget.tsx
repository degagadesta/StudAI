import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Loader2, Square, Timer } from "lucide-react";
import { useStudySession } from "../hooks/useStudySession";

function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function StudySessionWidget() {
  const { activeSession, endSession } = useStudySession();
  const [now, setNow] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSession) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(activeSession.startTime).getTime()) / 1000),
  );

  const handleEnd = async () => {
    setIsEnding(true);
    setEndError(null);
    try {
      await endSession();
    } catch {
      setEndError("Could not end session.");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <aside className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-2xl border border-default bg-surface p-3 shadow-lg">
      {endError && <span role="alert" className="max-w-36 text-xs text-error">{endError}</span>}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {activeSession.type === "POMODORO" ? <Timer size={19} /> : <Clock3 size={19} />}
      </div>
      <div className="min-w-24">
        <p className="text-xs font-medium text-secondary">
          {activeSession.type === "POMODORO" ? "Pomodoro" : "Study session"}
        </p>
        <p className="font-mono text-lg font-semibold tabular-nums text-primary">
          {formatElapsed(elapsed)}
        </p>
      </div>
      <Link
        to="/app/study-sessions"
        className="rounded-lg px-2 py-2 text-xs font-medium text-accent hover:bg-accent/10"
      >
        Open
      </Link>
      <button
        type="button"
        onClick={() => void handleEnd()}
        disabled={isEnding}
        aria-label="End study session"
        title="End session"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
      >
        {isEnding ? <Loader2 size={16} className="animate-spin" /> : <Square size={15} />}
      </button>
    </aside>
  );
}

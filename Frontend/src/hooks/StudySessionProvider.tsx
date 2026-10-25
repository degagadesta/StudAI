import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  endStudySession as endStudySessionRequest,
  getActiveStudySession,
  incrementPomodoro as incrementPomodoroRequest,
  startStudySession as startStudySessionRequest,
  type StudySession,
  type StudySessionType,
} from "../api/studySessionApi";
import { StudySessionContext } from "./studySessionContext";

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const session = await getActiveStudySession();
      setActiveSession(session);
      setError(null);
    } catch {
      setError("Could not load your active study session.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const startSession = useCallback(async (
    type: StudySessionType = "REGULAR",
    courseId?: string,
  ) => {
    const session = await startStudySessionRequest({
      type,
      ...(courseId ? { courseId } : {}),
    });
    setActiveSession(session);
    setError(null);
    return session;
  }, []);

  const endSession = useCallback(async () => {
    if (!activeSession) return;
    await endStudySessionRequest(activeSession.id);
    setActiveSession(null);
  }, [activeSession]);

  const completePomodoro = useCallback(async () => {
    if (!activeSession || activeSession.type !== "POMODORO") return;
    const updated = await incrementPomodoroRequest(activeSession.id);
    setActiveSession((current) =>
      current?.id === updated.id
        ? { ...current, pomodoroCount: updated.pomodoroCount }
        : current,
    );
  }, [activeSession]);

  return (
    <StudySessionContext.Provider
      value={{
        activeSession,
        isLoading,
        error,
        refresh,
        startSession,
        endSession,
        completePomodoro,
      }}
    >
      {children}
    </StudySessionContext.Provider>
  );
}

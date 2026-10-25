import { createContext } from "react";
import type { StudySession, StudySessionType } from "../api/studySessionApi";

export interface StudySessionContextValue {
  activeSession: StudySession | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  startSession: (type?: StudySessionType, courseId?: string) => Promise<StudySession>;
  endSession: () => Promise<void>;
  completePomodoro: () => Promise<void>;
}

export const StudySessionContext = createContext<StudySessionContextValue | null>(null);

import { api } from "./client";

export type StudySessionType = "REGULAR" | "POMODORO";

export interface StudySession {
  id: string;
  startTime: string;
  endTime?: string | null;
  duration?: number;
  type: StudySessionType;
  courseId?: string | null;
  materialId?: string | null;
  pomodoroCount: number;
  status: "ACTIVE" | "COMPLETED";
}

export interface StudySessionHistory {
  sessions: StudySession[];
  total: number;
  limit: number;
  offset: number;
}

export interface StudySessionStatistics {
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string | null;
  };
  totalMinutes: number;
  totalSessions: number;
  today: { minutes: number; sessions: number };
  thisWeek: { minutes: number; sessions: number; average: number };
  thisMonth: { minutes: number; sessions: number };
}

export interface StudyStreak {
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalMinutes: number;
  totalSessions: number;
}

export interface StudyCalendarDay {
  date: string;
  minutes: number;
  sessions: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const BASE_PATH = "/student/study-sessions";

export async function startStudySession(options: {
  type?: StudySessionType;
  courseId?: string;
  materialId?: string;
} = {}): Promise<StudySession> {
  const response = await api.post<ApiResponse<StudySession>>(
    `${BASE_PATH}/start`,
    options,
  );
  return response.data.data;
}

export async function endStudySession(sessionId: string): Promise<StudySession> {
  const response = await api.post<ApiResponse<StudySession>>(
    `${BASE_PATH}/${encodeURIComponent(sessionId)}/end`,
    {},
  );
  return response.data.data;
}

export async function getActiveStudySession(): Promise<StudySession | null> {
  const response = await api.get<ApiResponse<StudySession | null>>(
    `${BASE_PATH}/active`,
  );
  return response.data.data;
}

export async function incrementPomodoro(
  sessionId: string,
): Promise<{ id: string; pomodoroCount: number }> {
  const response = await api.post<ApiResponse<{ id: string; pomodoroCount: number }>>(
    `${BASE_PATH}/${encodeURIComponent(sessionId)}/pomodoro`,
  );
  return response.data.data;
}

export async function getStudyHistory(options: {
  limit?: number;
  offset?: number;
  courseId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<StudySessionHistory> {
  const response = await api.get<ApiResponse<StudySessionHistory>>(
    `${BASE_PATH}/history`,
    { params: options },
  );
  return response.data.data;
}

export async function getStudyStatistics(): Promise<StudySessionStatistics> {
  const response = await api.get<ApiResponse<StudySessionStatistics>>(
    `${BASE_PATH}/stats`,
  );
  return response.data.data;
}

export async function getStudyStreak(): Promise<StudyStreak> {
  const response = await api.get<ApiResponse<StudyStreak>>(
    `${BASE_PATH}/streak`,
  );
  return response.data.data;
}

export async function getStudyCalendar(
  startDate: string,
  endDate: string,
): Promise<StudyCalendarDay[]> {
  const response = await api.get<ApiResponse<StudyCalendarDay[]>>(
    `${BASE_PATH}/calendar`,
    { params: { startDate, endDate } },
  );
  return response.data.data;
}

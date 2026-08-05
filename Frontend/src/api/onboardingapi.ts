import { api } from "./client";

export interface OnboardingPayload {
  university: string;
  department: string;
  year: number;
  semester: number;
}

export interface OnboardingResponse {
  id: string;
  university: string;
  department: string;
  year: number;
  semester: number;
  createdAt: string;
}

/**
 * Saves the student's academic onboarding selections (Phase 3 of the
 * project docs: AASTU → Software Engineering → Year/Semester). The
 * access token is already attached automatically by the request
 * interceptor in client.ts, so this call doesn't need to handle auth
 * itself — the backend identifies the student from that token.
 */
export async function submitOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResponse> {
  const res = await api.post<OnboardingResponse>("/onboarding", payload);
  return res.data;
}

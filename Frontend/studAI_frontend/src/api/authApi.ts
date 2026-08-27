import { AxiosError } from "axios";
import { api, setAccessToken } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface ApiErrorPayload {
  error: string;
}

/**
 * Thin wrapper so LoginPage never talks to axios directly — it just
 * calls login(values) and handles success/failure. Keeps the HTTP
 * client swappable and the error-shape parsing in one place.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  setAccessToken(res.data.accessToken);
  return res.data;
}

/**
 * Pulls a user-safe message out of an axios error, falling back to a
 * generic message for network failures, timeouts, or unexpected shapes
 * — never surfaces raw error.message (which can leak stack/URL details)
 * directly to the UI.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorPayload | undefined;
    if (data?.error) return data.error;

    if (err.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    if (!err.response)
      return "Unable to reach the server. Check your connection.";
  }
  return fallback;
}

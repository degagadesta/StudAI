import { AxiosError } from "axios";
import { api, setAccessToken, clearTokens } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  accessToken: string;
  student: {
    id: string;
    email: string;
    firstName: string;
  };
}

export interface ApiErrorPayload {
  error: string;
}

/**
 * Login with email/password
 * Refresh token is automatically set as httpOnly cookie by backend
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  setAccessToken(res.data.accessToken);
  // Refresh token is now in httpOnly cookie - no need to store it
  return res.data;
}

/**
 * Google Sign-In
 * Refresh token is automatically set as httpOnly cookie by backend
 */
export async function googleSignIn(idToken: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/google", { idToken });
  setAccessToken(res.data.accessToken);
  // Refresh token is now in httpOnly cookie - no need to store it
  return res.data;
}

/**
 * Logout - clears tokens from server and local memory
 * Backend will clear the httpOnly cookie
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    // Clear tokens even if request fails
    clearTokens();
  }
}

/**
 * Pulls a user-safe message out of an axios error, falling back to a
 * generic message for network failures, timeouts, or unexpected shapes
 * — never surfaces raw error.message (which can leak stack/URL details)
 * directly to the UI.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
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

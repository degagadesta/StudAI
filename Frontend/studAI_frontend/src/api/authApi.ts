import { AxiosError } from "axios";
import { api, setAccessToken, clearTokens } from "./client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  student: {
    id: string;
    email: string;
  };
}

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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ApiErrorPayload {
  error: string;
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Register a new user account
 * Sends verification email, user must verify before logging in
 */
export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register", payload);
  return res.data;
}

/**
 * Verify email address using token from email
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const res = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
  return res.data;
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
 * Google Sign-In (works for both login and registration)
 * Refresh token is automatically set as httpOnly cookie by backend
 */
export async function googleSignIn(idToken: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/google", { idToken });
  setAccessToken(res.data.accessToken);
  // Refresh token is now in httpOnly cookie - no need to store it
  return res.data;
}

/**
 * Request password reset email
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  const res = await api.post<ForgotPasswordResponse>("/auth/forgot-password", payload);
  return res.data;
}

/**
 * Reset password using token from email
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  const res = await api.post<ResetPasswordResponse>("/auth/reset-password", payload);
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

// ============================================================================
// ERROR HANDLING UTILITY
// ============================================================================

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

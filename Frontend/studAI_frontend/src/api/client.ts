import axios, { AxiosError } from "axios";

/**
 * Single shared axios instance for the whole app — don't create a new
 * axios() per component/page. One instance means one place to configure
 * base URL, timeouts, cookies, and auth headers.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000, // fail fast rather than hang indefinitely on a dead backend
  withCredentials: true, // sends/receives the httpOnly refresh-token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * In-memory access token store. Deliberately NOT localStorage/sessionStorage
 * — either is readable by any injected script, which turns a single XSS
 * bug into full account takeover. Living in memory means it's gone on
 * page refresh, which is expected: your app should silently call the
 * refresh endpoint (using the httpOnly cookie) on load to get a new one.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// Attach the access token to every outgoing request automatically —
// components/pages never need to set this header themselves.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Centralized response handling: on a 401, the access token has
// expired or is invalid. Clear it here so stale state doesn't linger
// in memory; the calling code (see authApi.ts) decides what to do next
// (e.g. redirect to /login).
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
    }
    return Promise.reject(error);
  },
);

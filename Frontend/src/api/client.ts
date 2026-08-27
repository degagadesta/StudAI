import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Single shared axios instance for the whole app — don't create a new
 * axios() per component/page. One instance means one place to configure
 * base URL, timeouts, cookies, and auth headers.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 120000, // fail fast rather than hang indefinitely on a dead backend
  withCredentials: true, // IMPORTANT: sends/receives httpOnly cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * In-memory access token store. Deliberately NOT localStorage/sessionStorage
 * — either is readable by any injected script, which turns a single XSS
 * bug into full account takeover. Living in memory means token is gone on
 * page refresh, which is expected: your app should silently call the
 * refresh endpoint (using the httpOnly cookie) on load to get a new one.
 */
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearTokens(): void {
  accessToken = null;
  // Note: Refresh token in httpOnly cookie is cleared by backend on logout
}

// Attach the access token to every outgoing request automatically —
// components/pages never need to set this header themselves.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Centralized response handling with automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't retried yet, try to refresh using httpOnly cookie
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint - refresh token is sent automatically via httpOnly cookie
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {}, // Empty body - token is in cookie
          { withCredentials: true } // Send cookies
        );

        const { accessToken: newAccessToken } = response.data;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        
        // Only redirect if we're not already on a public auth page
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
        const currentPath = typeof window !== "undefined" ? window.location.pathname : '';
        const isOnPublicPage = publicPaths.some(path => currentPath.includes(path));
        
        if (typeof window !== "undefined" && !isOnPublicPage) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

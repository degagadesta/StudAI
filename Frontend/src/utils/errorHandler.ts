/**
 * Global error handler utilities for API errors
 */

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

/**
 * Check if error is a limit exceeded error
 */
export function isLimitError(error: any): boolean {
  return error?.response?.status === 429 || error?.response?.data?.code === "LIMIT_EXCEEDED";
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: any): boolean {
  return error?.response?.status === 401;
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: any): boolean {
  return !error?.response && error?.message === "Network Error";
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: any): string {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyError(error: any): string {
  if (isLimitError(error)) {
    return "You've reached your usage limit. Please upgrade to continue.";
  }
  if (isAuthError(error)) {
    return "Your session has expired. Please log in again.";
  }
  if (isNetworkError(error)) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  return getErrorMessage(error);
}

/**
 * Extract limit error details
 */
export function getLimitErrorDetails(error: any): {
  feature: string;
  used: number;
  limit: number;
  plan: string;
} | null {
  if (!isLimitError(error)) return null;

  const details = error?.response?.data?.details;
  if (!details) return null;

  return {
    feature: details.feature || "UNKNOWN",
    used: details.used || 0,
    limit: details.limit || 0,
    plan: details.plan || "FREE",
  };
}

/**
 * Handle API error with toast notifications
 * Returns true if error was handled, false otherwise
 */
export function handleApiErrorWithToast(
  error: any,
  onLimitError?: (details: any) => void,
  showToast?: (message: string, type: "error" | "warning" | "info") => void
): boolean {
  if (isLimitError(error)) {
    const details = getLimitErrorDetails(error);
    if (details && onLimitError) {
      onLimitError(details);
      return true;
    }
  }

  if (isAuthError(error)) {
    if (showToast) {
      showToast("Your session has expired. Redirecting to login...", "warning");
    }
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return true;
  }

  if (showToast) {
    showToast(getUserFriendlyError(error), "error");
  }

  return false;
}

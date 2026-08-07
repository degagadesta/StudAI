import { AppError } from "./AppError.js";

/**
 * Wrapper for network requests to handle common network errors
 * and provide user-friendly error messages
 */
export async function withNetworkErrorHandling(asyncFn, customMessage) {
    try {
        return await asyncFn();
    } catch (error) {
        // Network timeout errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
            throw new AppError(
                customMessage || "Request timed out. Please check your internet connection and try again",
                503
            );
        }

        // Connection refused
        if (error.code === 'ECONNREFUSED') {
            throw new AppError(
                customMessage || "Unable to connect to the service. Please try again later",
                503
            );
        }

        // DNS lookup failed
        if (error.code === 'ENOTFOUND') {
            throw new AppError(
                customMessage || "Service not available. Please check your internet connection",
                503
            );
        }

        // Connection reset
        if (error.code === 'ECONNRESET' || error.code === 'EPIPE') {
            throw new AppError(
                customMessage || "Connection was interrupted. Please try again",
                503
            );
        }

        // Network errors
        if (error.code === 'ENETUNREACH' || error.code === 'EHOSTUNREACH') {
            throw new AppError(
                customMessage || "Network is unreachable. Please check your internet connection",
                503
            );
        }

        // Re-throw if it's already an AppError
        if (error instanceof AppError) {
            throw error;
        }

        // Re-throw original error if not a network issue
        throw error;
    }
}

/**
 * Axios-specific error handler
 */
export function handleAxiosError(error, customMessage) {
    if (error.code === 'ECONNABORTED') {
        throw new AppError(
            customMessage || "Request timed out. Please try again",
            503
        );
    }

    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status >= 500) {
            throw new AppError(
                customMessage || "Service is temporarily unavailable. Please try again later",
                503
            );
        }

        throw new AppError(message || error.message, status);
    }

    if (error.request) {
        // Request was made but no response received
        throw new AppError(
            customMessage || "No response from server. Please check your internet connection",
            503
        );
    }

    // Something else happened
    throw new AppError(
        customMessage || "An unexpected error occurred. Please try again",
        500
    );
}

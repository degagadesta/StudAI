import { useState, useEffect, useCallback, useRef } from "react";
import { api, getAccessToken, setAccessToken, clearTokens } from "../api/client";

interface User {
  id: string;
  email: string;
  firstName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  // Prevent multiple simultaneous auth checks
  const isCheckingAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent concurrent auth checks
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    try {
      // If we have an access token in memory, we're authenticated
      const token = getAccessToken();
      if (token) {
        setAuthState({
          user: null, // Will be set by login or fetched if needed
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      // Try to refresh using httpOnly cookie
      // The refresh token is sent automatically via cookie
      try {
        const response = await api.post("/auth/refresh", {}); // Empty body - token in cookie
        setAccessToken(response.data.accessToken);
        setAuthState({
          user: null,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch (error) {
        // Refresh failed, clear tokens
        clearTokens();
      }

      // No valid tokens, user needs to login
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } finally {
      isCheckingAuth.current = false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const setUser = useCallback((user: User | null) => {
    setAuthState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  // Only run checkAuth once on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    setUser,
    logout,
    checkAuth,
  };
}

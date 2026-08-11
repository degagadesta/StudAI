import { useState, useEffect, useCallback, useRef } from "react";
import { api, getAccessToken, setAccessToken, clearTokens } from "../api/client";
import { activityTracker } from "../services/activityTracker";

interface User {
  id: string;
  email: string;
  firstName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasProfile: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasProfile: false,
  });

  // Prevent multiple simultaneous auth checks
  const isCheckingAuth = useRef(false);
  // Track the timestamp of the most recent explicit auth action (login, verify, etc.)
  const lastExplicitAuthTime = useRef<number>(0);

  const checkAuth = useCallback(async (isExplicitAuth = false) => {
    console.log('[useAuth] checkAuth called, isExplicitAuth:', isExplicitAuth);

    // If this is an explicit auth action (login, verify, google), update timestamp
    if (isExplicitAuth) {
      lastExplicitAuthTime.current = Date.now();
    }

    // Prevent concurrent auth checks
    if (isCheckingAuth.current) {
      console.log('[useAuth] Auth check already in progress, skipping');
      return;
    }
    isCheckingAuth.current = true;

    try {
      // If we have an access token in memory, check profile
      const token = getAccessToken();
      if (token) {
        console.log('[useAuth] Found access token, checking profile...');
        try {
          const response = await api.get<{ hasProfile: boolean; student: User }>("/auth/check-profile");
          console.log('[useAuth] Profile check response:', response.data);

          // Only update state if not superseded by explicit auth
          if (isExplicitAuth || Date.now() < lastExplicitAuthTime.current + 1000) {
            setAuthState({
              user: response.data.student,
              isAuthenticated: true,
              isLoading: false,
              hasProfile: response.data.hasProfile,
            });
            console.log('[useAuth] Auth state updated, hasProfile:', response.data.hasProfile);

            // Start activity tracking for authenticated user
            activityTracker.start();
          } else {
            console.log('[useAuth] Skipping state update (superseded by explicit auth)');
          }
          return;
        } catch (error) {
          console.log('[useAuth] Profile check failed, clearing tokens');
          clearTokens();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasProfile: false,
          });
          return;
        }
      }

      // Try to refresh using httpOnly cookie
      console.log('[useAuth] No access token, attempting refresh...');
      try {
        const response = await api.post("/auth/refresh", {});
        setAccessToken(response.data.accessToken);
        console.log('[useAuth] Refresh successful');

        // Check if this refresh was superseded by explicit auth
        // If explicit auth happened less than 1 second ago, skip this update
        if (!isExplicitAuth && Date.now() < lastExplicitAuthTime.current + 1000) {
          console.log('[useAuth] Refresh superseded by recent explicit auth, skipping state update');
          return;
        }

        // After refresh, check profile
        try {
          const profileResponse = await api.get<{ hasProfile: boolean; student: User }>("/auth/check-profile");
          console.log('[useAuth] Profile after refresh:', profileResponse.data);

          setAuthState({
            user: profileResponse.data.student,
            isAuthenticated: true,
            isLoading: false,
            hasProfile: profileResponse.data.hasProfile,
          });

          // Start activity tracking after successful refresh
          activityTracker.start();
        } catch (error) {
          console.log('[useAuth] Profile check after refresh failed');
          setAuthState({
            user: null,
            isAuthenticated: true,
            isLoading: false,
            hasProfile: false,
          });
        }
        return;
      } catch (error) {
        console.log('[useAuth] Refresh failed');
        // Refresh failed, only clear tokens if no explicit auth happened recently
        if (!isExplicitAuth && Date.now() < lastExplicitAuthTime.current + 1000) {
          console.log('[useAuth] Not clearing tokens (recent explicit auth)');
          return;
        }
        clearTokens();
      }

      // No valid tokens, user needs to login
      console.log('[useAuth] No valid auth, setting unauthenticated state');
      // Only update state if this is explicit auth OR no recent explicit auth happened
      if (isExplicitAuth || Date.now() > lastExplicitAuthTime.current + 1000) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasProfile: false,
        });
      } else {
        console.log('[useAuth] Skipping unauthenticated state (recent explicit auth)');
      }
    } finally {
      isCheckingAuth.current = false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Stop activity tracking before logout
      await activityTracker.stop();
      await api.post("/auth/logout");
    } finally {
      clearTokens();
      lastExplicitAuthTime.current = Date.now();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasProfile: false,
      });
    }
  }, []);

  const setUser = useCallback((user: User | null, hasProfile?: boolean) => {
    console.log('[useAuth] setUser called, user:', user, 'hasProfile:', hasProfile);
    // Mark this as an explicit auth action
    lastExplicitAuthTime.current = Date.now();
    setAuthState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      isLoading: false,
      hasProfile: hasProfile !== undefined ? hasProfile : prev.hasProfile,
    }));

    // Start activity tracking when user is set (after login/register)
    if (user) {
      activityTracker.start();
    }
  }, []);

  // Only run checkAuth once on mount
  useEffect(() => {
    console.log('[useAuth] Component mounted, starting auth check');
    checkAuth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    hasProfile: authState.hasProfile,
    setUser,
    logout,
    checkAuth,
  };
}

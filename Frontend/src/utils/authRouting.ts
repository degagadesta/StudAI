import type { NavigateFunction } from "react-router-dom";
import { checkProfile } from "../api/authApi";

/**
 * Centralized routing logic after successful authentication.
 * ALWAYS checks if user has completed onboarding before routing.
 * 
 * @param navigate - React Router navigate function
 * @param hasProfile - Whether the user has completed onboarding (from backend)
 * @param requestedPath - Optional path the user was trying to access before auth
 * @param replace - Whether to replace current history entry (default: true)
 */
export async function routeAfterAuth(
  navigate: NavigateFunction,
  hasProfile: boolean | undefined,
  requestedPath?: string,
  replace = true
): Promise<void> {
  console.log('[routeAfterAuth] Starting with hasProfile:', hasProfile, 'requestedPath:', requestedPath);

  // If hasProfile is undefined or we need to be absolutely sure, fetch from backend
  if (hasProfile === undefined) {
    console.log('[routeAfterAuth] hasProfile is undefined, fetching from backend...');
    try {
      const result = await checkProfile();
      hasProfile = result.hasProfile;
      console.log('[routeAfterAuth] Backend returned hasProfile:', hasProfile);
    } catch (error) {
      console.error('[routeAfterAuth] Failed to check profile status:', error);
      // Default to onboarding on error (safe fallback)
      hasProfile = false;
      console.log('[routeAfterAuth] Defaulting to hasProfile:', hasProfile, '(error fallback)');
    }
  }

  // CRITICAL: Check profile status BEFORE any navigation
  // If user doesn't have a profile, they MUST go to onboarding
  // NO EXCEPTIONS!
  if (hasProfile === false) {
    console.log('[routeAfterAuth] No profile found, redirecting to /onboarding');
    navigate("/onboarding", { replace });
    return;
  }

  // If we have a specific requested path AND user has profile, go there
  if (requestedPath && hasProfile === true) {
    console.log('[routeAfterAuth] User has profile, going to requested path:', requestedPath);
    navigate(requestedPath, { replace });
    return;
  }

  // User has completed onboarding, send to dashboard
  console.log('[routeAfterAuth] User has profile, redirecting to /dashboard');
  navigate("/dashboard", { replace });
}

/**
 * Determines the target route based on onboarding status,
 * useful for conditional rendering or checking where user should go
 * 
 * @param hasProfile - Whether the user has completed onboarding
 * @param requestedPath - Optional path the user was trying to access
 * @returns The path to navigate to
 */
export function getAuthTargetRoute(
  hasProfile: boolean | undefined,
  requestedPath?: string
): string {
  // ALWAYS check profile first
  if (hasProfile === false || hasProfile === undefined) {
    return "/onboarding";
  }

  if (requestedPath) {
    return requestedPath;
  }

  return "/dashboard";
}

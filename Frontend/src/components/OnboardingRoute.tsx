import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

interface OnboardingRouteProps {
  children: React.ReactNode;
}

/**
 * OnboardingRoute - Protects the onboarding page
 * Only checks authentication, NOT hasProfile
 * This prevents redirect loops when user needs to complete onboarding
 */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated - allow them to see onboarding
  // regardless of hasProfile status
  return <>{children}</>;
}

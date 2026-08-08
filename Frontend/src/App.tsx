import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import OnboardingPage from "./pages/OnboardingPage";

// Dashboard tab routes (sidebar + topbar shell)
import DashboardLayout from "./layouts/DashboardLayout";
import StartStudyingPage from "./pages/StartStudyingPage";
import CoursesPage from "./pages/Coursepage";
import SchedulePage from "./pages/Schedulepage";
import ProfilePage from "./pages/Profilepage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotificationsPage from "./pages/NotificationsModal";
import SettingsModal from "./pages/SettingsModal";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Wrapper component to safely adapt SettingsModal to React Router navigation
function SettingsModalWrapper() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Return to previous route or default to analytics
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/app/analytics", { replace: true });
    }
  };

  return <SettingsModal isOpen={true} onClose={handleClose} />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Onboarding Flow */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect /dashboard legacy route to /app/analytics */}
            <Route
              path="/dashboard"
              element={<Navigate to="/app/analytics" replace />}
            />

            {/* Main Application Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="analytics" replace />} />
              <Route path="start-studying" element={<StartStudyingPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsModalWrapper />} />
            </Route>

            {/* Root & Catch-all Fallbacks */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

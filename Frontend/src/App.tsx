import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OnboardingRoute } from "./components/OnboardingRoute";
import NotificationToast from "./components/NotificationToast";

// Temporarily commented out landing page due to missing assets
// import LandingPage from "./pages/LandingPage";
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
import WorkspacePage from "./pages/workspacepage";
import SchedulePage from "./pages/Schedulepage";
import ProfilePage from "./pages/Profilepage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotificationsModal from "./pages/NotificationsModal";
import SettingsModal from "./pages/SettingsModal";

// Exam routes
import AdminExamDashboard from "./pages/AdminExamDashboard";
import ExamPracticePage from "./pages/ExamPracticePage";

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

// Wrapper component for NotificationsModal
function NotificationsModalWrapper() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Return to previous route or default to analytics
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/app/analytics", { replace: true });
    }
  };

  return <NotificationsModal isOpen={true} onClose={handleClose} />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <BrowserRouter>
          <ProfileProvider>
            <AuthProvider>
              <SocketProvider>
                <Routes>
                  {/* Landing Page Route */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Public Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/workspace/:id" element={<WorkspacePage />} />

                  {/* Protected Onboarding Flow - Uses OnboardingRoute instead of ProtectedRoute */}
                  <Route
                    path="/onboarding"
                    element={
                      <OnboardingRoute>
                        <OnboardingPage />
                      </OnboardingRoute>
                    }
                  />

                  {/* Redirect /dashboard legacy route to /app/analytics */}
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/app/analytics" replace />}
                  />

                  {/* Admin Exam Dashboard & Student Practice */}
                  <Route
                    path="/admin/exams"
                    element={
                      <ProtectedRoute>
                        <AdminExamDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams/practice/:courseId"
                    element={
                      <ProtectedRoute>
                        <ExamPracticePage />
                      </ProtectedRoute>
                    }
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
                    <Route path="notifications" element={<NotificationsModal />} />
                    {/* <Route path="notifications" element={<NotificationsPage />} /> */}
                    <Route path="settings" element={<SettingsModalWrapper />} />
                  </Route>

                  {/* Root & Catch-all Fallbacks */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Global notification toasts for Socket.IO events */}
                <NotificationToast />
              </SocketProvider>
            </AuthProvider>
          </ProfileProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

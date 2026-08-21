import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  getAcademicProfile,
  getCourses,
  addCourseSelection,
  dropCourseSelection,
  updateAcademicProfile,
  type AcademicProfile,
  type Course,
} from "../api/Coursesapi";
import { deleteAccount } from "../api/authApi";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import DeleteAccountConfirm from "../components/settings/DeleteAccountConfirm";
import ProfileTab from "../components/settings/tabs/ProfileTab";
import PlanTab from "../components/settings/tabs/PlanTab";
import CourseTab from "../components/settings/tabs/CourseTab";
import ThemeTab from "../components/settings/tabs/ThemeTab";
import type { SubscriptionTier } from "../utils/PlanData";

type TabType = "profile" | "plan" | "course" | "theme";

interface SettingsModalProps {
  isOpen: boolean;
  initialTab?: TabType;
  onClose: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export default function SettingsModal({
  isOpen,
  initialTab,
  onClose,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "profile");

  // Update active tab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [requirePassword, setRequirePassword] = useState(false);

  // Plan
  const [currentPlan, setCurrentPlan] = useState<SubscriptionTier>("free");

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Load profile when modal opens
  useEffect(() => {
    if (!isOpen) return;
    loadProfile();
  }, [isOpen]);

  // Load courses when modal opens or when switching to course tab
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === "course") {
      loadCourses();
    }
  }, [isOpen, activeTab]);

  const loadProfile = async () => {
    console.log('[SettingsModal] Loading profile...');
    setIsLoadingProfile(true);
    setErrorMessage(null);
    try {
      const data = await getAcademicProfile();
      console.log('[SettingsModal] Profile loaded:', data);
      setProfile(data);
      // Set subscription plan if available in the profile
      if (data.subscriptionPlan) {
        setCurrentPlan(data.subscriptionPlan.toLowerCase() as SubscriptionTier);
      }
      
      // Determine if password is required for account deletion
      // If user has Google sign-in only, password is not required
      // This would need to be part of the profile response from backend
      // For now, we'll assume password is required unless specified otherwise
      setRequirePassword(true);
    } catch (err: any) {
      console.error("Error loading academic profile:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          "Unable to load profile from server. Please check your connection.",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadCourses = async () => {
    setIsLoadingCourses(true);
    setCoursesError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error("Error loading courses:", err);
      setCoursesError(
        err?.response?.data?.message ||
          "Unable to load your courses. Please check your connection.",
      );
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleLogout = () => {
    onClose();
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleConfirmDelete = async (password?: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteAccount(password);
      
      // Account deleted successfully
      // Close modal and redirect to login
      onClose();
      
      // Clear any remaining local storage
      localStorage.clear();
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.error ||
                      "Failed to delete account. Please try again.";
      setDeleteError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProfile = async (updates: {
    firstName: string;
    lastName: string;
    currentYear: number;
    currentSemester: number;
  }) => {
    try {
      console.log('[SettingsModal] Updating profile with:', updates);
      const result = await updateAcademicProfile(updates);
      console.log('[SettingsModal] Update result:', result);
      
      await loadProfile(); // Refresh profile
      
      if (result.courseSelectionsCleared) {
        window.dispatchEvent(new CustomEvent("courses:cleared"));
      } else {
        window.dispatchEvent(new CustomEvent("courses:updated"));
      }

      // Show warning if course selections were cleared
      if (result.warning) {
        alert(result.warning);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      throw error; // Re-throw to let ProfileTab handle the error
    }
  };

  const handleAddCourse = async (curriculumCourseId: string) => {
    try {
      const result = await addCourseSelection(curriculumCourseId);
      console.log("Course added:", result.message);
      // Refresh courses to show the newly added course
      await loadCourses();
    } catch (error: any) {
      console.error("Failed to add course:", error);
      const errorMsg = error?.response?.data?.message || "Failed to add course";
      alert(errorMsg);
      throw error; // Re-throw so AddCourseModal knows it failed
    }
  };

  const handleRemoveCourse = async (curriculumCourseId: string) => {
    try {
      const result = await dropCourseSelection(curriculumCourseId);
      console.log("Course removed:", result.message);
      // Refresh courses to update the list
      await loadCourses();
      
      // Show warning about deleted PDFs if any
      if (result.data.deletedPDFs > 0) {
        alert(`Course dropped successfully. ${result.data.deletedPDFs} PDF${result.data.deletedPDFs > 1 ? 's' : ''} deleted.`);
      }
    } catch (error: any) {
      console.error("Failed to remove course:", error);
      const errorMsg = error?.response?.data?.message || "Failed to remove course";
      alert(errorMsg);
      throw error; // Re-throw so CourseTab knows it failed
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-page/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-default rounded-2xl w-full max-w-4xl h-[640px] shadow-xl relative flex overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-primary transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto relative">
          <div className="flex-1 flex flex-col justify-between">
            {activeTab === "profile" && (
              <ProfileTab
                isLoading={isLoadingProfile}
                profile={profile}
                errorMessage={errorMessage}
                onLogout={handleLogout}
                onRequestDelete={() => setShowDeleteConfirm(true)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === "plan" && (
              <PlanTab
                currentPlan={currentPlan}
                onChangePlan={setCurrentPlan}
                profile={profile}
              />
            )}

            {activeTab === "course" && (
              <CourseTab
                isLoadingCourses={isLoadingCourses}
                coursesError={coursesError}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                onRefreshCourses={loadCourses}
              />
            )}

            {activeTab === "theme" && <ThemeTab />}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-default/40 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-inverse text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <DeleteAccountConfirm
            isDeleting={isDeleting}
            requirePassword={requirePassword}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeleteError(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  getAcademicProfile,
  getCourses,
  addCourseSelection,
  dropCourseSelection,
  type AcademicProfile,
  type Course,
} from "../api/Coursesapi";
// import { updateBasicInfo, updateAcademicInfo } from "../api/studentApi";
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
  onClose: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsLoadingProfile(true);
    setErrorMessage(null);
    try {
      const data = await getAcademicProfile();
      setProfile(data);
      setCurrentPlan(data.subscriptionPlan.toLowerCase() as SubscriptionTier);
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

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteAccount) await onDeleteAccount();
      onClose();
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdateProfile = async (updates: {
    firstName: string;
    lastName: string;
  }) => {
    await updateBasicInfo(updates);
    await loadProfile(); // Refresh profile
  };

  const handleUpdateAcademic = async (updates: {
    currentYear: number;
    currentSemester: number;
  }) => {
    const result = await updateAcademicInfo(updates);
    await loadProfile(); // Refresh profile
    await loadCourses(); // Refresh courses as they may have changed

    // Show warning if course selections were cleared
    if (result.warning) {
      alert(result.warning);
    }
  };

  const handleAddCourse = async (curriculumCourseId: string) => {
    const result = await addCourseSelection(curriculumCourseId);
    console.log("Course added:", result.message);
  };

  const handleRemoveCourse = async (curriculumCourseId: string) => {
    const result = await dropCourseSelection(curriculumCourseId);
    console.log("Course removed:", result.message);
    if (result.warning) {
      alert(result.warning);
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
                onUpdateAcademic={handleUpdateAcademic}
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
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </div>
  );
}

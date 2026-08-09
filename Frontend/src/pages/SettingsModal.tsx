import { useState, useEffect } from "react";
import { X } from "lucide-react";
// import {
//   getAcademicProfile,
//   getCourses,
//   createCourse,
//   type AcademicProfile,
//   type Course,
//   type CreateCoursePayload,
// } from "../../api/Coursesapi";

import {
  getAcademicProfile,
  getCourses,
  createCourse,
  type AcademicProfile,
  type Course,
} from "../api/Coursesapi";

import SettingsSidebar from "../components/settings/SettingsSidebar";
import DeleteAccountConfirm from "../components/settings/DeleteAccountConfirm";
import ProfileTab from "../components/settings/tabs/ProfileTab";
import PlanTab from "../components/settings/tabs/PlanTab";
import CourseTab from "../components/settings/tabs/CourseTab";
import ThemeTab from "../components/settings/tabs/ThemeTab";
import type { SubscriptionTier } from "../utils/PlanData";

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
  const [autoLoadMaterials, setAutoLoadMaterials] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    (async () => {
      setIsLoadingProfile(true);
      setErrorMessage(null);
      try {
        const data = await getAcademicProfile();
        if (isMounted) setProfile(data);
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading academic profile:", err);
          setErrorMessage(
            err?.response?.data?.message ||
              "Unable to load profile from server. Please check your connection.",
          );
        }
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    (async () => {
      setIsLoadingCourses(true);
      setCoursesError(null);
      try {
        const data = await getCourses();
        if (isMounted) setCourses(data);
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading courses:", err);
          setCoursesError(
            err?.response?.data?.message ||
              "Unable to load your courses. Please check your connection.",
          );
        }
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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

  const resetAddCourseForm = () => {
    setNewCode("");
    setNewName("");
    setNewCredits("");
    setCreateError(null);
  };

  const handleCreateCourse = async () => {
    const code = newCode.trim();
    const name = newName.trim();
    const credits = Number(newCredits);

    if (!code) return setCreateError("Course code is required.");
    if (!name) return setCreateError("Course name is required.");
    if (!Number.isFinite(credits) || credits <= 0 || credits > 20) {
      return setCreateError("Credits must be a number between 1 and 20.");
    }

    setIsCreatingCourse(true);
    setCreateError(null);
    try {
      // Note: The actual API signature needs updating - using courseId for now
      await createCourse(code);
      // Refresh courses list after creation
      const updated = await getCourses();
      setCourses(updated);
      resetAddCourseForm();
      setShowAddCourse(false);
    } catch (err: any) {
      console.error("Failed to create course:", err);
      setCreateError(
        err?.response?.data?.message ||
          "Could not add this course. Please try again.",
      );
    } finally {
      setIsCreatingCourse(false);
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
                autoLoadMaterials={autoLoadMaterials}
                onToggleAutoLoad={setAutoLoadMaterials}
                showAddCourse={showAddCourse}
                onToggleAddCourse={() => setShowAddCourse((s) => !s)}
                newCode={newCode}
                newName={newName}
                newCredits={newCredits}
                onChangeCode={setNewCode}
                onChangeName={setNewName}
                onChangeCredits={setNewCredits}
                createError={createError}
                isCreatingCourse={isCreatingCourse}
                onSaveCourse={handleCreateCourse}
                onCancelAddCourse={() => {
                  setShowAddCourse(false);
                  resetAddCourseForm();
                }}
                isLoadingCourses={isLoadingCourses}
                coursesError={coursesError}
                courses={courses}
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

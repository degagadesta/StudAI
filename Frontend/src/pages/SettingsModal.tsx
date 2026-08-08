import { useState, useEffect } from "react";
import {
  X,
  User,
  CreditCard,
  BookOpen,
  Palette,
  Loader2,
  Check,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Trash2,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  getAcademicProfile,
  getCourses,
  // createCourse,
  type AcademicProfile,
  type Course,
  // type CreateCoursePayload,
} from "../api/Coursesapi";
import { stripControlChars, capLength } from "../utils/security/sanitize";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

type TabType = "profile" | "plan" | "course" | "theme";
type SubscriptionTier = "free" | "standard" | "premium";

const CODE_MAX_LEN = 20;
const NAME_MAX_LEN = 100;

export default function SettingsModal({
  isOpen,
  onClose,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state for Delete Account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription Plan State (Default: free)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionTier>("free");

  // Course Preferences State
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

  // App Theme State
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >("light");
  const [accentColor, setAccentColor] = useState("forest");

  // Load academic profile whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadProfile() {
      setIsLoadingProfile(true);
      setErrorMessage(null);

      try {
        const data = await getAcademicProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading academic profile:", err);
          setErrorMessage(
            err?.response?.data?.message ||
              "Unable to load profile from server. Please check your connection.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load courses whenever the modal opens — separate from profile so a
  // slow/failed courses fetch doesn't block the Profile tab from working.
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadCourses() {
      setIsLoadingCourses(true);
      setCoursesError(null);

      try {
        const data = await getCourses();
        if (isMounted) {
          setCourses(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading courses:", err);
          setCoursesError(
            err?.response?.data?.message ||
              "Unable to load your courses. Please check your connection.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    }

    loadCourses();

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
      if (onDeleteAccount) {
        await onDeleteAccount();
      }
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

    if (!code) {
      setCreateError("Course code is required.");
      return;
    }
    if (!name) {
      setCreateError("Course name is required.");
      return;
    }
    if (!Number.isFinite(credits) || credits <= 0 || credits > 20) {
      setCreateError("Credits must be a number between 1 and 20.");
      return;
    }

    const payload: CreateCoursePayload = { code, name, credits };

    setIsCreatingCourse(true);
    setCreateError(null);
    try {
      const created = await createCourse(payload);
      setCourses((prev) => [...prev, created]);
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
    <div className="fixed inset-0 bg-[#253D31]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl w-full max-w-4xl h-[640px] shadow-xl relative flex overflow-hidden">
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A9A18A] hover:text-[#253D31] transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-[#DCD2B4]/60 bg-[#F9F6EE] p-6 flex flex-col justify-between shrink-0">
          <div>
            <h2 className="font-serif text-xl text-[#253D31] mb-6">Settings</h2>
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-[#253D31] text-[#F6F1E3]"
                    : "text-[#5B6156] hover:bg-[#EFE8D4] hover:text-[#253D31]"
                }`}
              >
                <User size={18} />
                Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("plan")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "plan"
                    ? "bg-[#253D31] text-[#F6F1E3]"
                    : "text-[#5B6156] hover:bg-[#EFE8D4] hover:text-[#253D31]"
                }`}
              >
                <CreditCard size={18} />
                Plan
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("course")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "course"
                    ? "bg-[#253D31] text-[#F6F1E3]"
                    : "text-[#5B6156] hover:bg-[#EFE8D4] hover:text-[#253D31]"
                }`}
              >
                <BookOpen size={18} />
                Course
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("theme")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "theme"
                    ? "bg-[#253D31] text-[#F6F1E3]"
                    : "text-[#5B6156] hover:bg-[#EFE8D4] hover:text-[#253D31]"
                }`}
              >
                <Palette size={18} />
                App Theme
              </button>
            </nav>
          </div>

          <p className="text-xs text-[#A9A18A]">StudAI Preferences v1.0</p>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto relative">
          <div className="flex-1 flex flex-col justify-between">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-xl text-[#253D31]">
                    Profile Details
                  </h3>
                  <p className="text-xs text-[#5B6156] mt-0.5">
                    Your current academic information from the system.
                  </p>
                </div>

                {isLoadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#253D31] gap-2">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-xs text-[#5B6156]">
                      Loading profile...
                    </span>
                  </div>
                ) : profile ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                      <p className="text-xs text-[#5B6156]">Full Name</p>
                      <p className="text-sm font-medium text-[#253D31] mt-0.5">
                        {profile.fullName || "—"}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                      <p className="text-xs text-[#5B6156]">University</p>
                      <p className="text-sm font-medium text-[#253D31] mt-0.5">
                        {profile.university || "—"}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                      <p className="text-xs text-[#5B6156]">Department</p>
                      <p className="text-sm font-medium text-[#253D31] mt-0.5">
                        {profile.department || "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                        <p className="text-xs text-[#5B6156]">Year</p>
                        <p className="text-sm font-medium text-[#253D31] mt-0.5">
                          Year {profile.year}
                        </p>
                      </div>
                      <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                        <p className="text-xs text-[#5B6156]">Semester</p>
                        <p className="text-sm font-medium text-[#253D31] mt-0.5">
                          Semester {profile.semester}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl text-xs text-[#8A3A3A]">
                    {errorMessage || "Failed to load academic profile."}
                  </div>
                )}

                {/* Account Actions */}
                <div className="pt-4 border-t border-[#DCD2B4]/60 space-y-2">
                  <p className="text-xs font-medium text-[#5B6156]">
                    Account Actions
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCD2B4] bg-[#FFFDF7] text-[#253D31] hover:bg-[#EFE8D4] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      Log Out
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5C3C3] bg-[#FDF2F2] text-[#8A3A3A] hover:bg-[#FADBD2] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PLAN TAB CONTENT */}
            {activeTab === "plan" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl text-[#253D31]">
                    Subscription Plans
                  </h3>
                  <p className="text-xs text-[#5B6156] mt-0.5">
                    Choose the plan that fits your study workload and resource
                    needs.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3.5 pt-1">
                  {/* FREE TIER */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      currentPlan === "free"
                        ? "bg-[#FFFDF7] border-[#253D31] shadow-sm ring-1 ring-[#253D31]"
                        : "bg-[#FFFDF7] border-[#DCD2B4]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-base text-[#253D31]">
                          Free
                        </span>
                        {currentPlan === "free" && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-[#253D31] text-[#F6F1E3] rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[#253D31] mb-3">
                        $0{" "}
                        <span className="text-xs font-normal text-[#5B6156]">
                          /month
                        </span>
                      </p>

                      <ul className="text-xs text-[#5B6156] space-y-2 border-t border-[#DCD2B4]/50 pt-3">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>5</b> PDF uploads
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>5</b> previous exam questions
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>5</b> notes
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>10</b> generated questions{" "}
                            <span className="text-[10px] text-[#A9A18A] block">
                              (No difficulty level)
                            </span>
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>50</b> Flash cards
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#8CA37E] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>15</b> chat conversations / day
                          </span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={currentPlan === "free"}
                      onClick={() => setCurrentPlan("free")}
                      className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        currentPlan === "free"
                          ? "bg-[#EFE8D4] text-[#253D31] cursor-default"
                          : "border border-[#DCD2B4] hover:bg-[#EFE8D4] text-[#253D31]"
                      }`}
                    >
                      {currentPlan === "free"
                        ? "Active Plan"
                        : "Switch to Free"}
                    </button>
                  </div>

                  {/* STANDARD TIER */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      currentPlan === "standard"
                        ? "bg-[#FFFDF7] border-[#253D31] shadow-sm ring-1 ring-[#253D31]"
                        : "bg-[#FFFDF7] border-[#DCD2B4]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-base text-[#253D31] flex items-center gap-1">
                          <Zap size={15} className="text-[#1E5652]" />
                          Standard
                        </span>
                        {currentPlan === "standard" && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-[#253D31] text-[#F6F1E3] rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[#253D31] mb-3">
                        299 birr{" "}
                        <span className="text-xs font-normal text-[#5B6156]">
                          /month
                        </span>
                      </p>

                      <ul className="text-xs text-[#5B6156] space-y-2 border-t border-[#DCD2B4]/50 pt-3">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>15</b> PDF uploads
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>10</b> previous exam questions
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>15</b> notes
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>100</b> generated questions{" "}
                            <span className="text-[10px] text-[#A9A18A] block">
                              (No difficulty level)
                            </span>
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>500</b> Flash cards
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={14}
                            className="text-[#1E5652] shrink-0 mt-0.5"
                          />
                          <span>
                            <b>150</b> chat conversations / day
                          </span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPlan("standard")}
                      className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        currentPlan === "standard"
                          ? "bg-[#EFE8D4] text-[#253D31] cursor-default"
                          : "bg-[#253D31] text-[#F6F1E3] hover:bg-[#1E3228]"
                      }`}
                    >
                      {currentPlan === "standard"
                        ? "Active Plan"
                        : "Upgrade to Standard"}
                    </button>
                  </div>

                  {/* PREMIUM TIER */}
                  <div
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative bg-gradient-to-b from-[#253D31] to-[#1B2E25] text-[#F6F1E3] ${
                      currentPlan === "premium"
                        ? "ring-2 ring-[#8CA37E] shadow-md"
                        : "border-[#253D31]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-base font-medium flex items-center gap-1.5 text-[#EFE8D4]">
                          <Sparkles size={15} className="text-[#DCD2B4]" />
                          Premium
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-[#EFE8D4] text-[#253D31] rounded-full">
                          Best Value
                        </span>
                      </div>
                      <p className="text-lg font-bold text-[#FFFDF7] mb-3">
                        499 birr{" "}
                        <span className="text-xs font-normal text-[#DCD2B4]">
                          /month
                        </span>
                      </p>

                      <div className="border-t border-[#DCD2B4]/20 pt-3 space-y-2">
                        <p className="text-xs text-[#EFE8D4] font-medium">
                          Everything Unlimited:
                        </p>
                        <ul className="text-xs text-[#DCD2B4] space-y-2">
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited PDF uploads</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited exam questions</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited notes & study cards</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited question generation</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited Flash cards</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-[#8CA37E] shrink-0"
                            />
                            <span>Unlimited chat conversations</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPlan("premium")}
                      className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        currentPlan === "premium"
                          ? "bg-[#EFE8D4] text-[#253D31] cursor-default font-semibold"
                          : "bg-[#FFFDF7] text-[#253D31] hover:bg-[#EFE8D4]"
                      }`}
                    >
                      {currentPlan === "premium"
                        ? "Active Plan"
                        : "Upgrade to Premium"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COURSE TAB CONTENT */}
            {activeTab === "course" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#253D31]">
                      Course Preferences
                    </h3>
                    <p className="text-xs text-[#5B6156] mt-0.5">
                      Manage the courses tied to your account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCourse((s) => !s)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#253D31] hover:bg-[#1E3228] text-[#F6F1E3] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Course
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#253D31]">
                      Auto-load Course Materials
                    </p>
                    <p className="text-xs text-[#5B6156]">
                      Directly load uploaded files as cards on the current page
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoLoadMaterials}
                    onChange={(e) => setAutoLoadMaterials(e.target.checked)}
                    className="w-4 h-4 accent-[#253D31] cursor-pointer"
                  />
                </div>

                {/* Add-course form */}
                {showAddCourse && (
                  <div className="p-4 bg-[#F9F6EE] border border-[#DCD2B4] rounded-xl space-y-3">
                    {createError && (
                      <p className="text-xs text-[#8A3A3A]">{createError}</p>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#5B6156] mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          value={newCode}
                          maxLength={CODE_MAX_LEN}
                          onChange={(e) =>
                            setNewCode(
                              capLength(
                                stripControlChars(e.target.value),
                                CODE_MAX_LEN,
                              ),
                            )
                          }
                          placeholder="SE3103"
                          className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5B6156] mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newName}
                          maxLength={NAME_MAX_LEN}
                          onChange={(e) =>
                            setNewName(
                              capLength(
                                stripControlChars(e.target.value),
                                NAME_MAX_LEN,
                              ),
                            )
                          }
                          placeholder="Database Management Systems"
                          className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5B6156] mb-1">
                          Credits
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={newCredits}
                          onChange={(e) => setNewCredits(e.target.value)}
                          placeholder="4"
                          className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCourse(false);
                          resetAddCourseForm();
                        }}
                        className="px-3.5 py-2 border border-[#DCD2B4] text-[#253D31] hover:bg-[#EFE8D4] text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isCreatingCourse}
                        onClick={handleCreateCourse}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#253D31] hover:bg-[#1E3228] disabled:opacity-60 disabled:cursor-not-allowed text-[#F6F1E3] text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        {isCreatingCourse && (
                          <Loader2 size={13} className="animate-spin" />
                        )}
                        Save Course
                      </button>
                    </div>
                  </div>
                )}

                {/* Course list — fetched from GET /courses */}
                <div>
                  <p className="text-xs font-medium text-[#5B6156] mb-2">
                    Your courses
                  </p>

                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center py-8 text-[#253D31] gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-xs text-[#5B6156]">
                        Loading courses...
                      </span>
                    </div>
                  ) : coursesError ? (
                    <div className="p-4 bg-[#FDF2F2] border border-[#E5C3C3] rounded-xl text-xs text-[#8A3A3A]">
                      {coursesError}
                    </div>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-[#5B6156]">
                      No courses found for your current year and semester yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#253D31]">
                              {course.name}
                            </p>
                            <p className="text-xs text-[#A9A18A] font-mono mt-0.5">
                              {course.code}
                            </p>
                          </div>
                          <span className="text-xs text-[#5B6156] bg-[#EFE8D4] px-2.5 py-1 rounded-full shrink-0">
                            {course.credits} Credit Hours
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* APP THEME TAB CONTENT */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl text-[#253D31]">
                    App Theme
                  </h3>
                  <p className="text-xs text-[#5B6156] mt-0.5">
                    Customize your visual workspace interface appearance.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#253D31]">
                    Interface Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTheme("light")}
                      className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                        selectedTheme === "light"
                          ? "border-[#253D31] bg-[#EFE8D4] text-[#253D31]"
                          : "border-[#DCD2B4] bg-[#FFFDF7] text-[#5B6156] hover:bg-[#F9F6EE]"
                      }`}
                    >
                      <Sun size={20} className="text-[#2F4A3D]" />
                      Light Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTheme("dark")}
                      className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                        selectedTheme === "dark"
                          ? "border-[#253D31] bg-[#253D31] text-[#F6F1E3]"
                          : "border-[#DCD2B4] bg-[#FFFDF7] text-[#5B6156] hover:bg-[#F9F6EE]"
                      }`}
                    >
                      <Moon
                        size={20}
                        className={
                          selectedTheme === "dark"
                            ? "text-[#C7D3B9]"
                            : "text-[#2F4A3D]"
                        }
                      />
                      Dark Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTheme("system")}
                      className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                        selectedTheme === "system"
                          ? "border-[#253D31] bg-[#EFE8D4] text-[#253D31]"
                          : "border-[#DCD2B4] bg-[#FFFDF7] text-[#5B6156] hover:bg-[#F9F6EE]"
                      }`}
                    >
                      <Monitor size={20} className="text-[#2F4A3D]" />
                      System Default
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-medium text-[#253D31]">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAccentColor("forest")}
                      className={`w-9 h-9 rounded-full bg-[#253D31] flex items-center justify-center transition-transform cursor-pointer ${
                        accentColor === "forest"
                          ? "ring-2 ring-offset-2 ring-[#253D31] scale-105"
                          : ""
                      }`}
                    >
                      {accentColor === "forest" && (
                        <Check size={16} className="text-[#F6F1E3]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccentColor("teal")}
                      className={`w-9 h-9 rounded-full bg-[#1E5652] flex items-center justify-center transition-transform cursor-pointer ${
                        accentColor === "teal"
                          ? "ring-2 ring-offset-2 ring-[#1E5652] scale-105"
                          : ""
                      }`}
                    >
                      {accentColor === "teal" && (
                        <Check size={16} className="text-[#F6F1E3]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccentColor("sage")}
                      className={`w-9 h-9 rounded-full bg-[#8CA37E] flex items-center justify-center transition-transform cursor-pointer ${
                        accentColor === "sage"
                          ? "ring-2 ring-offset-2 ring-[#8CA37E] scale-105"
                          : ""
                      }`}
                    >
                      {accentColor === "sage" && (
                        <Check size={16} className="text-[#FFFDF7]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCD2B4]/40 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#253D31] hover:bg-[#1E3228] text-[#F6F1E3] text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Overlay Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-[#253D31]/60 backdrop-blur-xs flex items-center justify-center p-6 z-20">
            <div className="bg-[#FFFDF7] border border-[#E5C3C3] p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#E5C3C3] flex items-center justify-center mx-auto text-[#8A3A3A]">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#253D31]">
                  Delete Account?
                </h4>
                <p className="text-xs text-[#5B6156] mt-1">
                  This action is permanent and cannot be undone. All your course
                  materials, PDF reading history, and settings will be
                  permanently removed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-[#DCD2B4] text-[#253D31] hover:bg-[#F9F6EE] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-[#8A3A3A] hover:bg-[#722F2F] text-[#FFFDF7] text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

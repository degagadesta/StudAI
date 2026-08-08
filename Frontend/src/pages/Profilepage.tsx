import { useState, useEffect } from "react";
import { GraduationCap, Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAcademicProfile, type AcademicProfile } from "../api/Coursesapi";
import { logout, getApiErrorMessage } from "../api/authApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAcademicProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load your profile."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">Profile</h1>
      <p className="text-sm text-[#5B6156] mb-8">
        Your account and academic details.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="h-40 rounded-2xl bg-[#EFE8D4] animate-pulse" />
      ) : (
        profile && (
          <div className="p-6 bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl">
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#DCD2B4]">
              <div className="w-14 h-14 rounded-full bg-[#2F4A3D] text-[#F6F1E3] flex items-center justify-center font-serif text-xl">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-serif text-lg text-[#253D31]">
                  {profile.fullName}
                </p>
                <p className="text-xs text-[#5B6156] flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} /> Email on file
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GraduationCap
                size={18}
                className="text-[#8CA37E] mt-0.5 shrink-0"
              />
              <div className="text-sm text-[#5B6156]">
                <p className="text-[#253D31] font-medium">
                  {profile.university}
                </p>
                <p>{profile.department}</p>
                <p className="font-mono text-xs mt-1">
                  Year {profile.year} · Semester {profile.semester}
                </p>
                <p className="font-mono text-xs mt-1">
                  Subscription plan: {profile.subscriptionPlan}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 mt-6 px-5 py-2.5 border border-[#DCD2B4] rounded-lg text-sm font-medium text-[#8B3A3A] hover:bg-[#F7E8E8] transition-colors"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}

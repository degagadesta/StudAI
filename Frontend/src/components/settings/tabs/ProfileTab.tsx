import { Loader2, LogOut, Trash2 } from "lucide-react";
import type { AcademicProfile } from "../../../api/Coursesapi";

interface ProfileTabProps {
  isLoading: boolean;
  profile: AcademicProfile | null;
  errorMessage: string | null;
  onLogout: () => void;
  onRequestDelete: () => void;
}

export default function ProfileTab({
  isLoading,
  profile,
  errorMessage,
  onLogout,
  onRequestDelete,
}: ProfileTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-xl text-[#253D31]">Profile Details</h3>
        <p className="text-xs text-[#5B6156] mt-0.5">
          Your current academic information from the system.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#253D31] gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs text-[#5B6156]">Loading profile...</span>
        </div>
      ) : profile ? (
        <div className="space-y-3 pt-1">
          <InfoRow label="Full Name" value={profile.fullName} />
          <InfoRow label="University" value={profile.university} />
          <InfoRow label="Department" value={profile.department} />
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Year" value={`Year ${profile.year}`} />
            <InfoRow label="Semester" value={`Semester ${profile.semester}`} />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl text-xs text-[#8A3A3A]">
          {errorMessage || "Failed to load academic profile."}
        </div>
      )}

      <div className="pt-4 border-t border-[#DCD2B4]/60 space-y-2">
        <p className="text-xs font-medium text-[#5B6156]">Account Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCD2B4] bg-[#FFFDF7] text-[#253D31] hover:bg-[#EFE8D4] text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            Log Out
          </button>

          <button
            type="button"
            onClick={onRequestDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5C3C3] bg-[#FDF2F2] text-[#8A3A3A] hover:bg-[#FADBD2] text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="p-3.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
      <p className="text-xs text-[#5B6156]">{label}</p>
      <p className="text-sm font-medium text-[#253D31] mt-0.5">
        {value ?? "—"}
      </p>
    </div>
  );
}

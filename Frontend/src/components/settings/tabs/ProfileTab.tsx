import { useState, useEffect } from "react";
import { Loader2, LogOut, Trash2, Edit, Check } from "lucide-react";
// import updateAcademicProfile, type { AcademicProfile } from "../../../api/Coursesapi";
import {
  updateAcademicProfile,
  type AcademicProfile,
} from "../../../api/Coursesapi";

interface ProfileTabProps {
  isLoading: boolean;
  profile: AcademicProfile | null;
  errorMessage: string | null;
  onLogout: () => void;
  onRequestDelete: () => void;
  onEdit?: () => void;
  onUpdateProfile?: (updates: {
    firstName: string;
    lastName: string;
    currentYear: number;
    currentSemester: number;
  }) => Promise<void>;
}

export default function ProfileTab({
  isLoading,
  profile,
  errorMessage,
  onLogout,
  onRequestDelete,
  onEdit,
  onUpdateProfile,
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    year: number;
    semester: number;
  }>({
    firstName: "",
    lastName: "",
    year: 1,
    semester: 1,
  });

  // Sync local form state with incoming profile prop
  useEffect(() => {
    console.log('[ProfileTab] Profile changed:', profile);
    if (profile) {
      // Parse firstName and lastName from fullName if available
      const names = profile.fullName?.split(" ") || [];
      const firstName = profile.firstName || names[0] || "";
      const lastName = profile.lastName || names.slice(1).join(" ") || "";
      
      setFormData({
        firstName,
        lastName,
        year: profile.year || profile.currentYear || 1,
        semester: profile.semester || profile.currentSemester || 1,
      });
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (onEdit) {
      onEdit();
    }
    if (isEditing && profile) {
      // Revert edits if cancelling
      const names = profile.fullName?.split(" ") || [];
      const firstName = profile.firstName || names[0] || "";
      const lastName = profile.lastName || names.slice(1).join(" ") || "";
      
      setFormData({
        firstName,
        lastName,
        year: profile.year || profile.currentYear || 1,
        semester: profile.semester || profile.currentSemester || 1,
      });
    }
    setIsEditing((prev) => !prev);
    setSaveError(null);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Call parent's onUpdateProfile which will handle the update and refresh
      if (onUpdateProfile) {
        await onUpdateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          currentYear: formData.year,
          currentSemester: formData.semester,
        });
      } else {
        // Fallback if no parent handler (shouldn't happen but safety net)
        const result = await updateAcademicProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          currentYear: formData.year,
          currentSemester: formData.semester,
        });
        
        if (result.warning) {
          alert(result.warning);
        }
      }

      setIsEditing(false);
      console.log("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMsg = error?.response?.data?.message || error.message || "Failed to update profile. Please try again.";
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-primary">Profile Details</h3>
          <p className="text-xs text-secondary mt-0.5">
            Your current academic information from the system.
          </p>
        </div>

        {profile && !isLoading && !isEditing && (
          <button
            type="button"
            onClick={handleEditToggle}
            className="p-2 text-secondary hover:text-primary hover:bg-elevated rounded-lg transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit size={18} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-primary gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs text-secondary">Loading profile...</span>
        </div>
      ) : profile ? (
        <div className="space-y-3 pt-1">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-3"
            >
              {/* Editable Fields */}
              <EditInputRow
                label="First Name"
                value={formData.firstName}
                onChange={(val) => handleChange("firstName", val)}
              />
              <EditInputRow
                label="Last Name"
                value={formData.lastName}
                onChange={(val) => handleChange("lastName", val)}
              />

              <div className="grid grid-cols-2 gap-3">
                <EditInputRow
                  label="Year"
                  type="number"
                  min={1}
                  max={7}
                  value={formData.year}
                  onChange={(val) =>
                    handleChange("year", val === "" ? "" : Number(val))
                  }
                />
                <EditInputRow
                  label="Semester"
                  type="number"
                  min={1}
                  max={3}
                  value={formData.semester}
                  onChange={(val) =>
                    handleChange("semester", val === "" ? "" : Number(val))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-inverse text-xs font-medium transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-default bg-surface text-secondary hover:text-primary text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              
              {/* Error Message */}
              {saveError && (
                <div className="p-3 bg-[#FDF2F2] border border-[#E5C3C3] rounded-xl text-xs text-[#8A3A3A]">
                  {saveError}
                </div>
              )}
            </form>
          ) : (
            <>
              {/* Read-Only Display */}
              <InfoRow label="Full Name" value={profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '—'} />
              <InfoRow label="University" value={profile.university} />
              <InfoRow label="Department" value={profile.department} />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Year" value={`Year ${profile.year || profile.currentYear || 1}`} />
                <InfoRow
                  label="Semester"
                  value={`Semester ${profile.semester || profile.currentSemester || 1}`}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="p-4 bg-surface border border-default rounded-xl text-xs text-[#8A3A3A]">
          {errorMessage || "Failed to load academic profile."}
        </div>
      )}

      {/* Account Actions */}
      <div className="pt-4 border-t border-default/60 space-y-2">
        <p className="text-xs font-medium text-secondary">Account Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-default bg-surface text-primary hover:bg-elevated text-xs font-medium transition-colors cursor-pointer"
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
    <div className="p-3.5 bg-surface border border-default rounded-xl">
      <p className="text-xs text-secondary">{label}</p>
      <p className="text-sm font-medium text-primary mt-0.5">{value ?? "—"}</p>
    </div>
  );
}

interface EditInputRowProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  max?: number;
}

function EditInputRow({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
}: EditInputRowProps) {
  return (
    <div className="p-2.5 bg-surface border border-default rounded-xl flex flex-col gap-1 focus-within:border-primary transition-colors">
      <label className="text-xs text-secondary font-medium">{label}</label>
      <input
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-medium text-primary outline-none"
      />
    </div>
  );
}

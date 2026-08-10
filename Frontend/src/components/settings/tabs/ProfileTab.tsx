import { Loader2, LogOut, Trash2, Check, X, Edit2 } from "lucide-react";
import type { FullProfile } from "../../../api/profileApi";
import { useState } from "react";

interface ProfileTabProps {
  isLoading: boolean;
  profile: FullProfile | null;
  errorMessage: string | null;
  onLogout: () => void;
  onRequestDelete: () => void;
  onUpdateBasic: (firstName: string, lastName: string) => Promise<void>;
  onUpdateAcademic: (year: number, semester: number) => Promise<void>;
}

export default function ProfileTab({
  isLoading,
  profile,
  errorMessage,
  onLogout,
  onRequestDelete,
  onUpdateBasic,
  onUpdateAcademic,
}: ProfileTabProps) {
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [editingAcademic, setEditingAcademic] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [savingAcademic, setSavingAcademic] = useState(false);

  const handleEditName = () => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) return;

    setSavingName(true);
    try {
      await onUpdateBasic(firstName.trim(), lastName.trim());
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelName = () => {
    setEditingName(false);
    setFirstName("");
    setLastName("");
  };

  const handleEditAcademic = () => {
    if (profile) {
      setSelectedYear(profile.profile.currentYear);
      setSelectedSemester(profile.profile.currentSemester);
      setEditingAcademic(true);
    }
  };

  const handleSaveAcademic = async () => {
    setSavingAcademic(true);
    try {
      await onUpdateAcademic(selectedYear, selectedSemester);
      setEditingAcademic(false);
    } catch (error) {
      console.error("Failed to update academic info:", error);
    } finally {
      setSavingAcademic(false);
    }
  };

  const handleCancelAcademic = () => {
    setEditingAcademic(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-xl text-primary">Profile Details</h3>
        <p className="text-xs text-secondary mt-0.5">
          Your current academic information from the system.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-primary gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs text-secondary">Loading profile...</span>
        </div>
      ) : profile ? (
        <div className="space-y-3 pt-1">
          {/* Editable Name Section */}
          <div className="p-3.5 bg-surface border border-default rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-secondary">Full Name</p>
              {!editingName && (
                <button
                  type="button"
                  onClick={handleEditName}
                  className="text-accent hover:text-accent-hover transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full px-2 py-1.5 text-sm bg-page border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={savingName}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full px-2 py-1.5 text-sm bg-page border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={savingName}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName || !firstName.trim() || !lastName.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-inverse text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    disabled={savingName}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-default text-primary hover:bg-elevated text-xs rounded-lg transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-primary">
                {profile.firstName} {profile.lastName}
              </p>
            )}
          </div>

          <InfoRow label="University" value={profile.profile.university.name} />
          <InfoRow label="Department" value={profile.profile.department.name} />

          {/* Editable Academic Info Section */}
          <div className="p-3.5 bg-surface border border-default rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-secondary">Academic Year & Semester</p>
              {!editingAcademic && (
                <button
                  type="button"
                  onClick={handleEditAcademic}
                  className="text-accent hover:text-accent-hover transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {editingAcademic ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-2 py-1.5 text-sm bg-page border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={savingAcademic}
                  >
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="px-2 py-1.5 text-sm bg-page border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={savingAcademic}
                  >
                    {[1, 2].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAcademic}
                    disabled={savingAcademic}
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-inverse text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingAcademic ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAcademic}
                    disabled={savingAcademic}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-default text-primary hover:bg-elevated text-xs rounded-lg transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-secondary">
                  Note: Changing year or semester will reset your course selections
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium text-primary">
                Year {profile.profile.currentYear}, Semester {profile.profile.currentSemester}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-surface border border-default rounded-xl text-xs text-[#8A3A3A]">
          {errorMessage || "Failed to load academic profile."}
        </div>
      )}

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
      <p className="text-sm font-medium text-primary mt-1">{value}</p>
    </div>
  );
}


import { useState, type FormEvent } from "react";
import { Check, Copy, LoaderCircle, X } from "lucide-react";
import { getApiErrorMessage } from "../../api/authApi";
import { updateStudyGroup, type StudyGroup } from "../../api/studyGroupApi";

export default function GroupSettingsModal({
  group,
  onClose,
  onSave,
}: {
  group: StudyGroup;
  onClose: () => void;
  onSave: (group: StudyGroup) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateStudyGroup(group.id, {
        name,
        subject,
      });
      onSave(updated);
      onClose();
    } catch (saveError: unknown) {
      setError(getApiErrorMessage(saveError, "Could not update this group."));
    } finally {
      setIsSaving(false);
    }
  };

  const copyInviteCode = async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setIsCopied(true);
    } catch {
      setError("Could not copy the invite code. Please copy it manually.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-settings-title"
        className="w-full max-w-md rounded-3xl border border-default bg-surface p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id="group-settings-title"
              className="font-serif text-2xl text-primary"
            >
              Group settings
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Update your group details and share its invite code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close group settings"
            className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="settings-group-name"
              className="mb-1.5 block text-sm font-medium text-primary"
            >
              Group name
            </label>
            <input
              id="settings-group-name"
              name="name"
              required
              minLength={3}
              maxLength={100}
              defaultValue={group.name}
              className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="settings-group-subject"
              className="mb-1.5 block text-sm font-medium text-primary"
            >
              Subject
            </label>
            <input
              id="settings-group-subject"
              name="subject"
              maxLength={100}
              defaultValue={group.subject ?? ""}
              className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <p className="mb-1.5 block text-sm font-medium text-primary">
              Invite code
            </p>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-default bg-page px-3.5 py-3">
              <code className="font-mono text-lg font-semibold tracking-[0.2em] text-primary">
                {group.inviteCode}
              </code>
              <button
                type="button"
                onClick={() => void copyInviteCode()}
                aria-label="Copy invite code"
                className="rounded-lg p-1.5 text-secondary hover:bg-elevated hover:text-primary"
              >
                {isCopied ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-secondary hover:bg-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <LoaderCircle size={16} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

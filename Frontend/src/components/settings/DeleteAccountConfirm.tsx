import { useState } from "react";
import { AlertTriangle, Loader2, Lock } from "lucide-react";

interface DeleteAccountConfirmProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (password?: string) => void;
  requirePassword?: boolean; // If true, show password input
}

export default function DeleteAccountConfirm({
  isDeleting,
  onCancel,
  onConfirm,
  requirePassword = false,
}: DeleteAccountConfirmProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    // Validate password if required
    if (requirePassword && !password.trim()) {
      setError("Password is required to delete your account");
      return;
    }

    setError(null);
    onConfirm(requirePassword ? password : undefined);
  };

  return (
    <div className="absolute inset-0 bg-accent/60 backdrop-blur-xs flex items-center justify-center p-6 z-20">
      <div className="bg-surface border border-[#E5C3C3] p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#E5C3C3] flex items-center justify-center mx-auto text-[#8A3A3A]">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-serif text-lg text-primary">Delete Account?</h4>
          <p className="text-xs text-secondary mt-1">
            This action is permanent and cannot be undone. All your course
            materials, PDF reading history, and settings will be permanently
            removed.
          </p>
        </div>

        {requirePassword && (
          <div className="pt-2">
            {/* Decoy username input to prevent browser/password managers from autofilling the global search input */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: "0",
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: "0",
              }}
              readOnly
            />
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="password"
                name="delete-confirm-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your password to confirm"
                className="w-full pl-10 pr-4 py-2.5 bg-page border border-default rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-[#8A3A3A]"
                disabled={isDeleting}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-[#8A3A3A] mt-2 text-left">{error}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 border border-default text-primary hover:bg-surface-hover text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#8A3A3A] hover:bg-[#722F2F] text-[#FFFDF7] text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

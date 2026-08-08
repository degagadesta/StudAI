import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountConfirmProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountConfirm({
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteAccountConfirmProps) {
  return (
    <div className="absolute inset-0 bg-[#253D31]/60 backdrop-blur-xs flex items-center justify-center p-6 z-20">
      <div className="bg-[#FFFDF7] border border-[#E5C3C3] p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#E5C3C3] flex items-center justify-center mx-auto text-[#8A3A3A]">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-serif text-lg text-[#253D31]">Delete Account?</h4>
          <p className="text-xs text-[#5B6156] mt-1">
            This action is permanent and cannot be undone. All your course
            materials, PDF reading history, and settings will be permanently
            removed.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 border border-[#DCD2B4] text-[#253D31] hover:bg-[#F9F6EE] text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-[#8A3A3A] hover:bg-[#722F2F] text-[#FFFDF7] text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

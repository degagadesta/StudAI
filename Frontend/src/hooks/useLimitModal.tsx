import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LimitReachedModal from "../components/LimitReachedModal";
import { normalizeSubscriptionTier, type SubscriptionTier } from "../utils/PlanData";

interface LimitError {
  feature: string;
  used: number;
  limit: number;
  plan: string;
}

export function useLimitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const navigate = useNavigate();

  /**
   * Show limit reached modal
   */
  const showLimitModal = useCallback((error: LimitError) => {
    setLimitError(error);
    setIsOpen(true);
  }, []);

  /**
   * Handle upgrade click - navigate to checkout
   */
  const handleUpgrade = useCallback(
    (plan: SubscriptionTier) => {
      setIsOpen(false);
      // Navigate to checkout with selected plan
      navigate(`/checkout?plan=${plan}&cycle=monthly`);
    },
    [navigate]
  );

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Parse API error and show modal if it's a limit error
   */
  const handleApiError = useCallback(
    (error: any) => {
      // Check if it's a limit exceeded error (status 429)
      if (error?.response?.status === 429) {
        const data = error.response.data;
        const details = data.details;

        if (details) {
          showLimitModal({
            feature: formatFeatureName(details.feature),
            used: details.used,
            limit: details.limit,
            plan: details.plan,
          });
          return true; // Error was handled
        }
      }
      return false; // Error not handled
    },
    [showLimitModal]
  );

  const modalComponent = limitError ? (
    <LimitReachedModal
      isOpen={isOpen}
      onClose={closeModal}
      featureName={limitError.feature}
      currentPlan={normalizeSubscriptionTier(limitError.plan)}
      limitUsed={limitError.used}
      limitTotal={limitError.limit}
      onUpgrade={handleUpgrade}
    />
  ) : null;

  return {
    showLimitModal,
    handleApiError,
    closeModal,
    LimitModal: modalComponent,
  };
}

/**
 * Format feature name from backend to display name
 */
function formatFeatureName(feature: string): string {
  const nameMap: Record<string, string> = {
    PDF_UPLOAD: "PDF Uploads",
    CHAT_MESSAGE: "AI Chat Messages",
    CHAT_MESSAGES: "AI Chat Messages",
    FLASHCARDS: "Flashcards",
    SUMMARY: "AI Summaries",
    QUIZ_GENERATION: "Quiz Generations",
    NOTES_GENERATION: "Notes Generation",
    MAX_COURSES: "Active Courses",
  };

  return nameMap[feature] || feature.replace(/_/g, " ");
}

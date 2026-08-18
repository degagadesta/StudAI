import { useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { generateFlashcards } from "../../api/aiApi";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardsPanelProps {
  materialId: string;
  materialName?: string;
}

export default function FlashcardsPanel({
  materialId,
  materialName,
}: FlashcardsPanelProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFlashcards = async (forceRegenerate: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateFlashcards(materialId, 10, forceRegenerate);
      setFlashcards(result.flashcards);
      setIsCached(result.cached);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error("Failed to generate flashcards:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate flashcards. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (materialId) {
      loadFlashcards(false);
    }
  }, [materialId]);

  const handleRegenerate = () => {
    if (!isLoading) {
      loadFlashcards(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD2B4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Flashcards</h3>
            {materialName && (
              <p className="text-xs text-secondary truncate">{materialName}</p>
            )}
          </div>
        </div>

        {flashcards.length > 0 && !isLoading && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary hover:text-accent hover:bg-elevated rounded-lg transition-colors"
            title="Regenerate flashcards"
          >
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 size={32} className="text-accent animate-spin mb-3" />
            <p className="text-sm font-medium text-primary">
              Generating flashcards...
            </p>
            <p className="text-xs text-secondary mt-1">
              This may take a moment
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-primary mb-1">
              Failed to generate flashcards
            </p>
            <p className="text-xs text-secondary mb-4">{error}</p>
            <button
              onClick={() => loadFlashcards(false)}
              className="px-4 py-2 text-xs font-medium text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : flashcards.length > 0 ? (
          <>
            {/* Cached indicator */}
            {isCached && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs text-green-700">
                  Loaded from cache
                </span>
              </div>
            )}

            {/* Card counter */}
            <div className="text-center mb-4">
              <p className="text-xs font-medium text-secondary">
                Card {currentIndex + 1} of {flashcards.length}
              </p>
            </div>

            {/* Flashcard */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div
                onClick={handleFlip}
                className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
                style={{ perspective: "1000px" }}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front (Question) */}
                  <div
                    className="absolute inset-0 w-full h-full bg-surface border-2 border-accent rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">
                      Question
                    </p>
                    <p className="text-sm text-primary font-medium leading-relaxed">
                      {currentCard?.question}
                    </p>
                    <p className="text-xs text-secondary mt-4">
                      Click to reveal answer
                    </p>
                  </div>

                  {/* Back (Answer) */}
                  <div
                    className="absolute inset-0 w-full h-full bg-accent/10 border-2 border-accent rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">
                      Answer
                    </p>
                    <p className="text-sm text-primary leading-relaxed">
                      {currentCard?.answer}
                    </p>
                    <p className="text-xs text-secondary mt-4">
                      Click to see question
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-secondary hover:text-accent hover:bg-elevated rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-secondary disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleFlip}
                className="px-6 py-2 text-xs font-medium text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity"
              >
                {isFlipped ? "Show Question" : "Show Answer"}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-secondary hover:text-accent hover:bg-elevated rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-secondary disabled:hover:bg-transparent"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-3">
              <Sparkles size={24} className="text-secondary" />
            </div>
            <p className="text-sm font-medium text-primary">
              No flashcards available
            </p>
            <p className="text-xs text-secondary mt-1">
              Click the button below to generate flashcards from this material
            </p>
            <button
              onClick={() => loadFlashcards(false)}
              className="mt-4 px-4 py-2 text-xs font-medium text-inverse bg-accent hover:opacity-90 rounded-lg transition-opacity"
            >
              Generate Flashcards
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

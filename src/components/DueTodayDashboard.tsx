import React, { useState, useEffect } from 'react';
import { CardProgress } from '../types/neet';
import { calculateSM2, SM2Rating, getTodayDateString } from '../lib/sm2';
import { Check, Flag, ArrowLeft } from 'lucide-react';

interface DueTodayDashboardProps {
  dueCards: CardProgress[];
  onUpdateCardSM2: (chapterId: string, cardId: string, updates: Partial<CardProgress>) => Promise<void>;
  onToggleCardFlag: (chapterId: string, cardId: string, flagged: boolean) => Promise<void>;
  onBackToHome: () => void;
}

export const DueTodayDashboard: React.FC<DueTodayDashboardProps> = ({
  dueCards,
  onUpdateCardSM2,
  onToggleCardFlag,
  onBackToHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCardIds, setReviewedCardIds] = useState<Set<string>>(new Set());

  const remainingDue = dueCards.filter((c) => !reviewedCardIds.has(c.cardId));
  const currentCard = remainingDue[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleRating = async (quality: SM2Rating) => {
    if (!currentCard) return;

    const nextSM2 = calculateSM2(
      {
        easeFactor: currentCard.easeFactor ?? 2.5,
        interval: currentCard.interval ?? 0,
        repetitions: currentCard.repetitions ?? 0,
        dueDate: currentCard.dueDate || getTodayDateString(),
      },
      quality
    );

    await onUpdateCardSM2(currentCard.chapterId, currentCard.cardId, {
      easeFactor: nextSM2.easeFactor,
      interval: nextSM2.interval,
      repetitions: nextSM2.repetitions,
      dueDate: nextSM2.dueDate,
    });

    setReviewedCardIds((prev) => new Set(prev).add(currentCard.cardId));

    if (currentIndex >= remainingDue.length - 1) {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRating(0);
        else if (e.key === '2') handleRating(3);
        else if (e.key === '3') handleRating(4);
        else if (e.key === '4') handleRating(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentCard]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chapters</span>
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
            Due Today Queue
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Cross-chapter spaced repetition reviews scheduled on or before today
          </p>
        </div>

        <span className="text-xs font-mono text-stone-500">
          {remainingDue.length} remaining · {reviewedCardIds.size} completed
        </span>
      </div>

      {/* Review Box or Done State */}
      {remainingDue.length === 0 ? (
        <div className="max-w-md mx-auto bg-white border border-stone-200/90 rounded-xl p-8 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-8 h-8 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-900">
            <Check className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-normal text-stone-900">Queue Complete</h2>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              All scheduled spaced-repetition reviews for today have been completed. Next retention reviews will be scheduled automatically by SM-2.
            </p>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition shadow-xs"
          >
            Return to Chapters
          </button>
        </div>
      ) : currentCard ? (
        <div className="space-y-4">
          {/* Physical Paper Card */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="relative min-h-[320px] w-full rounded-xl bg-white border border-stone-200/90 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer select-none transition hover:border-stone-300"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900">{currentCard.chapterTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{currentCard.topic}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{currentCard.difficulty}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCardFlag(currentCard.chapterId, currentCard.cardId, !currentCard.flagged);
                }}
                className={`p-1 rounded ${
                  currentCard.flagged ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt vs Answer */}
            <div className="py-6 my-auto text-center">
              {!isFlipped ? (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wider font-mono text-stone-400">
                    NCERT Prompt
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 leading-snug max-w-xl mx-auto">
                    {currentCard.front}
                  </h3>
                  <p className="text-xs text-stone-400 pt-4 font-sans">
                    Click or press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-600 font-mono">Space</kbd> to reveal
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <p className="text-xs uppercase tracking-wider font-mono text-stone-400">
                    NCERT Answer
                  </p>
                  <div className="font-sans text-base sm:text-lg text-stone-800 leading-relaxed bg-stone-50/70 p-5 rounded-lg border border-stone-200/70">
                    {currentCard.back}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
              <span>Scheduled Due: {currentCard.dueDate || 'Today'}</span>
              <span>{isFlipped ? 'Rate retention below' : 'Click to flip'}</span>
            </div>
          </div>

          {/* SM-2 Rating Controls */}
          {isFlipped ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRating(0)}
                  className="py-2.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-medium text-center transition"
                >
                  <span className="block font-semibold">Again (1)</span>
                  <span className="text-[10px] text-stone-500 font-mono">1 day</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRating(3)}
                  className="py-2.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-medium text-center transition"
                >
                  <span className="block font-semibold">Hard (2)</span>
                  <span className="text-[10px] text-stone-500 font-mono">1-2 days</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRating(4)}
                  className="py-2.5 px-2 rounded-lg bg-stone-900 border border-stone-900 hover:bg-stone-800 text-white text-xs font-medium text-center transition shadow-xs"
                >
                  <span className="block font-semibold">Good (3)</span>
                  <span className="text-[10px] text-stone-300 font-mono">Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRating(5)}
                  className="py-2.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-medium text-center transition"
                >
                  <span className="block font-semibold">Easy (4)</span>
                  <span className="text-[10px] text-stone-500 font-mono">Extended</span>
                </button>
              </div>
              <p className="text-[11px] text-center text-stone-400 font-mono">
                Shortcuts: 1 = Again · 2 = Hard · 3 = Good · 4 = Easy
              </p>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
              >
                Reveal Answer
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

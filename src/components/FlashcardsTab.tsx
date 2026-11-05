import React, { useState, useEffect } from 'react';
import { CardProgress, DifficultyLevel, BloomLevel } from '../types/neet';
import { calculateSM2, SM2Rating, getTodayDateString } from '../lib/sm2';
import {
  Download,
  Flag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';

interface FlashcardsTabProps {
  cards: CardProgress[];
  chapterId: string;
  onUpdateCardSM2: (cardId: string, updates: Partial<CardProgress>) => Promise<void>;
  onToggleFlag: (cardId: string, flagged: boolean) => Promise<void>;
  selectedDifficulty: 'all' | DifficultyLevel;
  chapterTitle: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  cards,
  chapterId,
  onUpdateCardSM2,
  onToggleFlag,
  selectedDifficulty,
  chapterTitle,
}) => {
  const [viewMode, setViewMode] = useState<'review' | 'browse'>('review');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedBloom, setSelectedBloom] = useState<'all' | BloomLevel>('all');

  const filteredCards = cards.filter((card) => {
    if (selectedDifficulty !== 'all' && card.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedBloom !== 'all' && card.bloom_level !== selectedBloom) {
      return false;
    }
    return true;
  });

  const currentCard = filteredCards[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, selectedDifficulty, selectedBloom]);

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

    await onUpdateCardSM2(currentCard.cardId, {
      easeFactor: nextSM2.easeFactor,
      interval: nextSM2.interval,
      repetitions: nextSM2.repetitions,
      dueDate: nextSM2.dueDate,
    });

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFlipped(false);
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

  const handleExportAnki = () => {
    if (cards.length === 0) return;

    const lines = cards.map((c) => {
      const cleanFront = c.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const cleanBack = c.back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      return `${cleanFront}\t${cleanBack}\t${c.topic}\t${c.difficulty}\t${c.bloom_level}`;
    });

    const header = '#separator:tab\n#html:true\n#tags column:3\n';
    const content = header + lines.join('\n');

    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = chapterTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `NEET_${safeTitle}_anki_deck.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex p-0.5 bg-stone-100 rounded-md border border-stone-200/80">
            <button
              onClick={() => setViewMode('review')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                viewMode === 'review'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Review Mode
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                viewMode === 'browse'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Index Grid ({cards.length})
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-stone-500">
            <span>Bloom:</span>
            <select
              value={selectedBloom}
              onChange={(e) => {
                setSelectedBloom(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="py-1 px-2 rounded bg-white border border-stone-200 text-stone-700 text-xs focus:outline-none"
            >
              <option value="all">All</option>
              <option value="recall">Recall</option>
              <option value="understanding">Understanding</option>
              <option value="application">Application</option>
              <option value="analysis">Analysis</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportAnki}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 transition"
          title="Download Anki-compatible TSV"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>Export Anki (.txt)</span>
        </button>
      </div>

      {/* Review Mode (Tactile Paper Card) */}
      {viewMode === 'review' && (
        <div className="space-y-5">
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/90 rounded-xl space-y-2">
              <p className="text-sm font-medium text-stone-800">No cards match this filter</p>
              <p className="text-xs text-stone-500">Switch filter to "All" to review the full deck.</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Counter & SM-2 Status */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                <span>
                  Ease: {currentCard.easeFactor ?? 2.5} · Interval: {currentCard.interval ?? 0}d
                </span>
              </div>

              {/* Physical Paper Card */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative min-h-[320px] w-full rounded-xl bg-white border border-stone-200/90 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer select-none transition hover:border-stone-300"
              >
                {/* Header Metadata (Zero Pills) */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-medium text-stone-800">{currentCard.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{currentCard.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{currentCard.bloom_level}</span>
                    {currentCard.pyq_inspired && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-700 font-medium">PYQ Trend</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFlag(currentCard.cardId, !currentCard.flagged);
                    }}
                    className={`p-1 rounded transition ${
                      currentCard.flagged ? 'text-amber-700 bg-amber-50' : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title={currentCard.flagged ? 'Marked for review' : 'Flag item'}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Face Content */}
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
                        Click card or press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-600 font-mono">Space</kbd> to reveal
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

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
                  <span>Due: {currentCard.dueDate || 'Today'}</span>
                  <span>{isFlipped ? 'Rate retention below' : 'Click to flip'}</span>
                </div>
              </div>

              {/* SM-2 Retention Buttons */}
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
                <div className="flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 disabled:opacity-40 flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
                  >
                    Reveal Answer
                  </button>

                  <button
                    disabled={currentIndex === filteredCards.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(filteredCards.length - 1, prev + 1))}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 disabled:opacity-40 flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Browse Grid */}
      {viewMode === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card, idx) => (
            <div
              key={card.cardId}
              className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-stone-400">#{idx + 1}</span>
                  <span className="font-medium text-stone-800">{card.topic}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{card.difficulty}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFlag(card.cardId, !card.flagged)}
                  className={`p-1 rounded ${card.flagged ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase text-stone-400">Question</p>
                <p className="text-sm font-medium text-stone-900 mt-0.5 leading-snug">{card.front}</p>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <p className="text-[11px] font-mono uppercase text-stone-400">NCERT Answer</p>
                <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{card.back}</p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-stone-400">
                <span>Bloom: {card.bloom_level}</span>
                <span>Due: {card.dueDate || 'Today'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

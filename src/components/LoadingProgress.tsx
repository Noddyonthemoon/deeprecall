import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface LoadingProgressProps {
  subject: string;
  chapterTitle?: string;
}

const STEPS = [
  {
    seconds: 0,
    title: 'Parsing NCERT chapter document',
    desc: 'Extracting definitions, terminology, and core biological mechanisms.',
  },
  {
    seconds: 4,
    title: 'Surveying NEET exam patterns',
    desc: 'Benchmarking historical NEET PYQ trends and coaching distractor frameworks.',
  },
  {
    seconds: 9,
    title: 'Synthesizing exam-accurate questions',
    desc: 'Constructing 4-option MCQs with distractor rationale and Assertion-Reason pairs.',
  },
  {
    seconds: 15,
    title: 'Structuring spaced-repetition deck',
    desc: 'Calibrating Bloom-tagged flashcards and SM-2 initial retention schedules.',
  },
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ subject, chapterTitle }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let currentStepIndex = 0;
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (elapsed >= STEPS[i].seconds) {
      currentStepIndex = i;
      break;
    }
  }

  // Asymptotic progress calculation that continuously moves without stalling
  const progressPercent = Math.min(
    95,
    Math.round(100 * (1 - Math.exp(-elapsed / 14)))
  );

  const getSubStatusMessage = () => {
    if (elapsed > 35) {
      return 'Deep analysis in progress — finalizing question rationale & Bloom ratings...';
    }
    if (elapsed > 20) {
      return 'Cross-referencing NCERT formulas, exceptions, and distractor traps...';
    }
    return STEPS[currentStepIndex].desc;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-20 space-y-8">
      {/* Calm, un-hyped status indicator */}
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
          Generating Study Kit
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-sans">
          {chapterTitle ? `${subject} · "${chapterTitle}"` : subject}
        </p>

        <div className="flex items-center justify-center space-x-2 pt-1">
          <div className="inline-block text-[11px] font-mono text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded">
            Elapsed: {elapsed}s (typically 12–25s)
          </div>
          <div className="inline-block text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {progressPercent}%
          </div>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-64 max-w-xs mx-auto h-1 bg-stone-200/80 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-stone-800 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Editorial Process Steps */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        {STEPS.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={s.title}
              className={`flex items-start space-x-3 p-2.5 rounded-lg transition-colors ${
                isCurrent ? 'bg-stone-50' : ''
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <Check className="w-4 h-4 text-stone-900" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-900 border-t-transparent animate-spin my-0.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-stone-300 my-0.5" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${isCurrent ? 'text-stone-900' : 'text-stone-500'}`}>
                  {s.title}
                </p>
                {isCurrent && (
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {getSubStatusMessage()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-stone-400 text-center leading-relaxed font-sans max-w-md mx-auto">
        Generation occurs strictly in a single optimized direct synthesis call to preserve free-tier quotas and ensure complete grounding in your textbook file.
      </p>
    </div>
  );
};

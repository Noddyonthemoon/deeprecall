import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Brain, Check, Clock } from 'lucide-react';

interface LoadingProgressProps {
  subject: string;
  chapterTitle?: string;
}

const STEPS = [
  {
    seconds: 0,
    title: 'Parsing NCERT chapter document',
    desc: 'Extracting definitions, terminology, and key biological mechanisms.',
  },
  {
    seconds: 7,
    title: 'Surveying previous-year exam patterns',
    desc: 'Analyzing historical NEET questions and common coaching distractor formats.',
  },
  {
    seconds: 18,
    title: 'Synthesizing exam-accurate questions',
    desc: 'Constructing 4-option MCQs with distractor rationale and Assertion-Reason pairs.',
  },
  {
    seconds: 28,
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

  const activeStep = STEPS[currentStepIndex];

  return (
    <div className="max-w-xl mx-auto px-4 py-20 space-y-8">
      {/* Calm, un-hyped status indicator */}
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
          Generating Study Kit
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-sans">
          {chapterTitle ? `${subject} · "${chapterTitle}"` : subject}
        </p>
        <div className="inline-block text-[11px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
          Elapsed: {elapsed}s (typically 15–35s)
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
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{s.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-stone-400 text-center leading-relaxed font-sans max-w-md mx-auto">
        Generation occurs strictly in a single pipeline call to preserve free-tier quotas and ensure complete grounding in your textbook file.
      </p>
    </div>
  );
};

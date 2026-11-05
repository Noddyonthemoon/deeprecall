import React, { useState } from 'react';
import {
  MCQItem,
  ShortAnswerQuestion,
  ApplicationQuestion,
  DifficultyLevel,
  QuestionStyle,
} from '../types/neet';
import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Flag,
  Eye,
} from 'lucide-react';

interface QuizTabProps {
  mcqs: MCQItem[];
  shortAnswerQuestions: ShortAnswerQuestion[];
  applicationQuestions: ApplicationQuestion[];
  selectedDifficulty: 'all' | DifficultyLevel;
  chapterTitle: string;
  subject: string;
  onToggleQuestionFlag?: (questionId: string, flagged: boolean) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  mcqs,
  shortAnswerQuestions,
  applicationQuestions,
  selectedDifficulty,
  chapterTitle,
  subject,
  onToggleQuestionFlag,
}) => {
  const [activeSection, setActiveSection] = useState<'mcq' | 'short_answer' | 'application'>('mcq');

  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedPerQuestion, setRevealedPerQuestion] = useState<Record<number, boolean>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const filteredMcqs = mcqs.filter((m) => {
    if (selectedDifficulty !== 'all' && m.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  const currentMcq = filteredMcqs[currentMcqIndex];

  const handleSelectOption = (index: number) => {
    if (revealedPerQuestion[currentMcqIndex]) return;
    setSelectedOption(index);
    setUserAnswers((prev) => ({ ...prev, [currentMcqIndex]: index }));
    setRevealedPerQuestion((prev) => ({ ...prev, [currentMcqIndex]: true }));
  };

  const handleNextQuestion = () => {
    if (currentMcqIndex < filteredMcqs.length - 1) {
      setCurrentMcqIndex((prev) => prev + 1);
      const nextAnswer = userAnswers[currentMcqIndex + 1];
      setSelectedOption(nextAnswer !== undefined ? nextAnswer : null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentMcqIndex > 0) {
      setCurrentMcqIndex((prev) => prev - 1);
      const prevAnswer = userAnswers[currentMcqIndex - 1];
      setSelectedOption(prevAnswer !== undefined ? prevAnswer : null);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentMcqIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setRevealedPerQuestion({});
    setIsQuizCompleted(false);
  };

  const toggleAnswerReveal = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFlag = (id: string) => {
    const nextState = !flaggedQuestions[id];
    setFlaggedQuestions((prev) => ({ ...prev, [id]: nextState }));
    onToggleQuestionFlag?.(id, nextState);
  };

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  filteredMcqs.forEach((mcq, idx) => {
    const ans = userAnswers[idx];
    if (ans === undefined) {
      unattemptedCount++;
    } else if (ans === mcq.correct_index) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const neetScore = correctCount * 4 - wrongCount * 1;
  const maxPossibleScore = filteredMcqs.length * 4;

  return (
    <div className="space-y-6">
      {/* Segmented Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-200/80">
        <div className="flex p-0.5 bg-stone-100 rounded-md border border-stone-200/80 text-xs">
          <button
            onClick={() => setActiveSection('mcq')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeSection === 'mcq'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            NEET MCQs ({filteredMcqs.length})
          </button>
          <button
            onClick={() => setActiveSection('short_answer')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeSection === 'short_answer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Short Answer ({shortAnswerQuestions.length})
          </button>
          <button
            onClick={() => setActiveSection('application')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeSection === 'application'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Application Cases ({applicationQuestions.length})
          </button>
        </div>

        {activeSection === 'mcq' && (
          <div className="text-xs text-stone-500 font-mono">
            NEET marking: +4 correct · -1 incorrect
          </div>
        )}
      </div>

      {/* MCQs Section */}
      {activeSection === 'mcq' && (
        <div>
          {filteredMcqs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/90 rounded-xl space-y-2">
              <p className="text-sm font-medium text-stone-800">No MCQs match this filter</p>
              <p className="text-xs text-stone-500">Switch filter to "All" to view all generated items.</p>
            </div>
          ) : !isQuizCompleted && currentMcq ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question Card */}
              <div className="bg-white border border-stone-200/90 rounded-xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                {/* Header Metadata (Zero Pills) */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">
                      Item {currentMcqIndex + 1} of {filteredMcqs.length}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{currentMcq.question_style.replace(/_/g, ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentMcq.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{currentMcq.difficulty}</span>
                  </div>

                  <button
                    onClick={() => handleFlag(`mcq_${currentMcqIndex}`)}
                    className={`p-1 rounded transition ${
                      flaggedQuestions[`mcq_${currentMcqIndex}`]
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Flag item"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Question Statement */}
                <div className="font-serif text-lg sm:text-xl font-normal text-stone-900 leading-relaxed whitespace-pre-line">
                  {currentMcq.question}
                </div>

                {/* 4 Single-Best-Answer Options */}
                <div className="space-y-2.5 pt-2">
                  {currentMcq.options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = currentMcq.correct_index === optIdx;
                    const isRevealed = Boolean(revealedPerQuestion[currentMcqIndex]);

                    let stateStyles = 'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50/50';

                    if (isRevealed) {
                      if (isCorrect) {
                        stateStyles = 'bg-stone-900 border-stone-900 text-white font-medium';
                      } else if (isSelected && !isCorrect) {
                        stateStyles = 'bg-stone-100 border-stone-300 text-stone-500 line-through';
                      } else {
                        stateStyles = 'bg-white border-stone-200 text-stone-400 opacity-60';
                      }
                    } else if (isSelected) {
                      stateStyles = 'bg-stone-100 border-stone-400 text-stone-900 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isRevealed}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-lg border text-left text-xs sm:text-sm transition flex items-start space-x-3 ${stateStyles}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                        {isRevealed && isCorrect && (
                          <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        )}
                        {isRevealed && isSelected && !isCorrect && (
                          <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Distractor Analysis */}
                {revealedPerQuestion[currentMcqIndex] && (
                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                      <p className="text-xs font-semibold text-stone-900">
                        NCERT Explanation:
                      </p>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                        {currentMcq.explanation}
                      </p>
                    </div>

                    {currentMcq.distractor_logic && (
                      <div className="p-3.5 rounded-lg bg-stone-50/50 border border-stone-200 text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-stone-800">
                          Distractor Rationale & Exam Trap:
                        </p>
                        <p className="leading-relaxed">
                          {currentMcq.distractor_logic}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  disabled={currentMcqIndex === 0}
                  onClick={handlePrevQuestion}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 disabled:opacity-40 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {currentMcqIndex === filteredMcqs.length - 1 ? (
                    <button
                      onClick={() => setIsQuizCompleted(true)}
                      className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
                    >
                      Complete & View Scorecard
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white shadow-xs flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Score Summary Card */
            <div className="max-w-xl mx-auto bg-white border border-stone-200/90 rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase font-mono text-stone-400">Scorecard</p>
                <h3 className="font-serif text-3xl font-normal text-stone-900">Quiz Completed</h3>
                <p className="text-xs text-stone-500">{chapterTitle} · {subject}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-sans">NEET Marks</p>
                  <p className="text-2xl font-serif font-medium text-stone-900 mt-1 font-tabular">
                    {neetScore}
                    <span className="text-xs font-sans text-stone-400"> / {maxPossibleScore}</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-sans">Correct</p>
                  <p className="text-2xl font-serif font-medium text-stone-900 mt-1 font-tabular">{correctCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-sans">Incorrect</p>
                  <p className="text-2xl font-serif font-medium text-stone-900 mt-1 font-tabular">{wrongCount}</p>
                </div>
              </div>

              <div className="text-xs text-stone-500 font-mono">
                Accuracy: {filteredMcqs.length > 0 ? Math.round((correctCount / filteredMcqs.length) * 100) : 0}% · Unattempted: {unattemptedCount}
              </div>

              <button
                onClick={handleRestartQuiz}
                className="px-4 py-2 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Question Set</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Short Answer Section */}
      {activeSection === 'short_answer' && (
        <div className="space-y-4">
          {shortAnswerQuestions.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No short-answer questions generated for this depth.
            </div>
          ) : (
            shortAnswerQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400">SA {String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-stone-800">{q.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{q.difficulty}</span>
                  </div>

                  <button
                    onClick={() => handleFlag(q.id || `sa_${idx}`)}
                    className={`p-1 rounded ${flaggedQuestions[q.id || `sa_${idx}`] ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="font-serif text-lg font-normal text-stone-900">{q.question}</p>

                <div className="pt-2">
                  <button
                    onClick={() => toggleAnswerReveal(q.id || `sa_${idx}`)}
                    className="text-xs font-medium text-stone-700 hover:text-stone-900 underline flex items-center space-x-1"
                  >
                    <span>
                      {revealedAnswers[q.id || `sa_${idx}`] ? 'Hide model answer' : 'Reveal model answer'}
                    </span>
                  </button>

                  {revealedAnswers[q.id || `sa_${idx}`] && (
                    <div className="mt-3 p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                      <p className="text-[11px] font-mono uppercase text-stone-400 mb-1">
                        NCERT Model Answer:
                      </p>
                      {q.model_answer}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Application / Case Scenarios */}
      {activeSection === 'application' && (
        <div className="space-y-4">
          {applicationQuestions.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No application scenarios generated for this depth.
            </div>
          ) : (
            applicationQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400">Case {String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-stone-800">{q.topic}</span>
                  </div>

                  <button
                    onClick={() => handleFlag(q.id || `app_${idx}`)}
                    className={`p-1 rounded ${flaggedQuestions[q.id || `app_${idx}`] ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-700 leading-relaxed font-sans">
                  <span className="block font-semibold text-stone-900 mb-1">Experimental Context:</span>
                  "{q.scenario}"
                </div>

                <p className="font-serif text-lg font-normal text-stone-900">{q.question}</p>

                <div className="pt-2">
                  <button
                    onClick={() => toggleAnswerReveal(q.id || `app_${idx}`)}
                    className="text-xs font-medium text-stone-700 hover:text-stone-900 underline flex items-center space-x-1"
                  >
                    <span>
                      {revealedAnswers[q.id || `app_${idx}`] ? 'Hide model evaluation' : 'Reveal model evaluation'}
                    </span>
                  </button>

                  {revealedAnswers[q.id || `app_${idx}`] && (
                    <div className="mt-3 p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                      <p className="text-[11px] font-mono uppercase text-stone-400 mb-1">
                        Application Evaluation:
                      </p>
                      {q.model_answer}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

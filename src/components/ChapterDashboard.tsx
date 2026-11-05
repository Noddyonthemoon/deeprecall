import React, { useState } from 'react';
import { ChapterDocument, DifficultyLevel, CardProgress } from '../types/neet';
import { ConceptSummaryTab } from './ConceptSummaryTab';
import { FlashcardsTab } from './FlashcardsTab';
import { QuizTab } from './QuizTab';
import { PyqInsightsTab } from './PyqInsightsTab';
import { ExternalResourcesTab } from './ExternalResourcesTab';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Award,
  TrendingUp,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface ChapterDashboardProps {
  chapter: ChapterDocument;
  cards: CardProgress[];
  onBackToHome: () => void;
  onRegenerate: () => void;
  onUpdateCardSM2: (cardId: string, updates: Partial<CardProgress>) => Promise<void>;
  onToggleCardFlag: (cardId: string, flagged: boolean) => Promise<void>;
  isGenerating?: boolean;
}

export const ChapterDashboard: React.FC<ChapterDashboardProps> = ({
  chapter,
  cards,
  onBackToHome,
  onRegenerate,
  onUpdateCardSM2,
  onToggleCardFlag,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<
    'flashcards' | 'summary' | 'quiz' | 'pyq' | 'resources'
  >('flashcards');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');

  const meta = chapter.chapter_meta;

  const tabs = [
    { id: 'flashcards', label: 'Flashcards', count: cards.length },
    { id: 'summary', label: 'Summaries', count: chapter.concept_summaries?.length || 0 },
    { id: 'quiz', label: 'Questions & CBT', count: chapter.mcqs?.length || 0 },
    { id: 'pyq', label: 'Exam Trends', count: chapter.pyq_trend_insights?.length || 0 },
    { id: 'resources', label: 'Literature & Open Banks', count: chapter.external_resources?.length || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Bar: Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200/80">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Chapters</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Difficulty Segmented Filter (Client-Side, Zero API calls) */}
          <div className="flex items-center p-0.5 bg-stone-100 rounded-md border border-stone-200/70 text-xs">
            <span className="text-[11px] font-medium text-stone-500 px-2">Filter:</span>
            {(['all', 'easy', 'medium', 'hard'] as ('all' | DifficultyLevel)[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition ${
                  difficultyFilter === d
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Regenerate Action */}
          <button
            onClick={() => {
              if (confirm('Regenerate this chapter? This will invoke a fresh AI call.')) {
                onRegenerate();
              }
            }}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 flex items-center space-x-1.5 transition"
            title="Regenerate this study kit (uses another AI call)"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Chapter Title & Editorial Metadata */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
          <span>{meta.subject}</span>
          <span aria-hidden="true">·</span>
          <span>NCERT Class {meta.ncert_class}</span>
          <span aria-hidden="true">·</span>
          <span>{chapter.depth} depth</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-900 leading-tight">
          {meta.chapter_title}
        </h1>

        {meta.topics_covered && meta.topics_covered.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-stone-600">
            {meta.topics_covered.map((t, idx) => (
              <span key={idx} className="after:content-['·'] last:after:content-none after:ml-3 after:text-stone-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* NotebookLM-Style Quiet Tab Bar */}
      <div className="border-b border-stone-200">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs sm:text-sm font-medium transition border-b-2 flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] font-mono text-stone-400">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === 'flashcards' && (
          <FlashcardsTab
            cards={cards}
            chapterId={chapter.id}
            onUpdateCardSM2={onUpdateCardSM2}
            onToggleFlag={onToggleCardFlag}
            selectedDifficulty={difficultyFilter}
            chapterTitle={meta.chapter_title}
          />
        )}

        {activeTab === 'summary' && (
          <ConceptSummaryTab
            summaries={chapter.concept_summaries || []}
            chapterTitle={meta.chapter_title}
            subject={meta.subject}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            mcqs={chapter.mcqs || []}
            shortAnswerQuestions={chapter.short_answer_questions || []}
            applicationQuestions={chapter.application_questions || []}
            selectedDifficulty={difficultyFilter}
            chapterTitle={meta.chapter_title}
            subject={meta.subject}
          />
        )}

        {activeTab === 'pyq' && (
          <PyqInsightsTab
            insights={chapter.pyq_trend_insights || []}
            chapterTitle={meta.chapter_title}
            subject={meta.subject}
          />
        )}

        {activeTab === 'resources' && (
          <ExternalResourcesTab
            resources={chapter.external_resources || []}
            chapterTitle={meta.chapter_title}
          />
        )}
      </div>
    </div>
  );
};

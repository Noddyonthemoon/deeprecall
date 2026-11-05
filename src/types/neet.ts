export type SubjectType = 'Physics' | 'Chemistry' | 'Biology';
export type ClassLevel = '11' | '12';
export type DepthSetting = 'quick' | 'standard' | 'deep';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type BloomLevel = 'recall' | 'understanding' | 'application' | 'analysis';
export type QuestionStyle = 'direct' | 'assertion_reason' | 'numerical' | 'match_the_following' | 'case_based';
export type ResourceType = 'open_question_bank' | 'anki_export_text' | 'discussion_thread' | 'reference_article';

export interface ChapterMeta {
  subject: SubjectType;
  chapter_title: string;
  ncert_class: ClassLevel;
  topics_covered: string[];
}

export interface ConceptSummary {
  topic: string;
  summary: string;
  ncert_section_reference?: string;
}

export interface FlashcardItem {
  id?: string;
  front: string;
  back: string;
  topic: string;
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  pyq_inspired?: boolean;
  flagged?: boolean;
}

export interface MCQItem {
  id?: string;
  question: string;
  question_style: QuestionStyle;
  options: string[];
  correct_index: number;
  explanation: string;
  distractor_logic?: string;
  difficulty: DifficultyLevel;
  topic: string;
  pyq_trend_note?: string;
  flagged?: boolean;
}

export interface ShortAnswerQuestion {
  id?: string;
  question: string;
  model_answer: string;
  topic: string;
  difficulty: DifficultyLevel;
  flagged?: boolean;
}

export interface ApplicationQuestion {
  id?: string;
  scenario: string;
  question: string;
  model_answer: string;
  topic: string;
  flagged?: boolean;
}

export interface PyqTrendInsight {
  observation: string;
  source_titles?: string[];
  source_urls?: string[];
}

export interface ExternalResource {
  title: string;
  url: string;
  resource_type: ResourceType;
  note?: string;
}

export interface StudyKitData {
  chapter_meta: ChapterMeta;
  concept_summaries: ConceptSummary[];
  flashcards: FlashcardItem[];
  mcqs: MCQItem[];
  short_answer_questions: ShortAnswerQuestion[];
  application_questions: ApplicationQuestion[];
  pyq_trend_insights: PyqTrendInsight[];
  external_resources: ExternalResource[];
}

export interface ChapterDocument extends StudyKitData {
  id: string;
  userId: string;
  depth: DepthSetting;
  createdAt: string; // ISO date
  updatedAt?: string;
  cardCount: number;
  mcqCount: number;
}

// SM-2 Spaced Repetition Card State in Firestore:
// users/{uid}/chapters/{chapterId}/cards/{cardId}
export interface CardProgress {
  cardId: string;
  chapterId: string;
  chapterTitle: string;
  subject: SubjectType;
  front: string;
  back: string;
  topic: string;
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  pyq_inspired?: boolean;
  easeFactor: number; // default 2.5
  interval: number; // in days
  repetitions: number; // review count
  dueDate: string; // ISO string YYYY-MM-DD
  lastReviewed?: string; // ISO timestamp
  flagged?: boolean;
}

export interface QuizAttempt {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: SubjectType;
  timestamp: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}

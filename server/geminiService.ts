import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { StudyKitData, DepthSetting, SubjectType, ClassLevel } from '../src/types/neet';

// Initialize Gemini client strictly with server environment variable
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment. Please configure it in your secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `You are a senior NEET exam author and curriculum specialist who has authored question banks for premier Indian test-prep institutes (Allen, Aakash, Physics Wallah). You will receive one chapter of an NCERT Class 11 or 12 Physics/Chemistry/Biology textbook as a PDF document. Produce a rigorous, clinically accurate study kit.

Rules:
1. Ground every fact strictly in the provided NCERT PDF chapter. Do not invent data, constants, or assertions not present in the chapter text.
2. Leverage deep parametric mastery of historical NEET previous-year questions (PYQ, 2010–2024) and top test series distractor patterns. Match standard phrasing ("Which of the following is correct/incorrect?", Assertion–Reason, Match-the-following, case-based questions).
3. Distractors must represent authentic student misconceptions, near-miss calculations, or common botanical/anatomical traps, never arbitrary nonsense.
4. For Biology, emphasize exact NCERT terminology, summary statements, diagram labels, and table values.
5. For Physics/Chemistry, include numerical calculations grounded in the chapter's stated formulas and exact constants.
6. Tag every flashcard and question with topic, difficulty (easy/medium/hard), and Bloom taxonomy level (recall, understanding, application, analysis).
7. Report 2–6 concise, high-yield PYQ trend observations for this chapter, plus verified open educational resources.
8. Output ONLY JSON strictly matching the provided schema — no markdown fences, no surrounding prose.`;

export const STUDY_KIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chapter_meta: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, enum: ['Physics', 'Chemistry', 'Biology'] },
        chapter_title: { type: Type.STRING },
        ncert_class: { type: Type.STRING, enum: ['11', '12'] },
        topics_covered: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['subject', 'chapter_title', 'ncert_class', 'topics_covered'],
    },
    concept_summaries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          summary: { type: Type.STRING },
          ncert_section_reference: { type: Type.STRING },
        },
        required: ['topic', 'summary'],
      },
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING },
          back: { type: Type.STRING },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
          bloom_level: { type: Type.STRING, enum: ['recall', 'understanding', 'application', 'analysis'] },
          pyq_inspired: { type: Type.BOOLEAN },
        },
        required: ['front', 'back', 'topic', 'difficulty', 'bloom_level'],
      },
    },
    mcqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          question_style: {
            type: Type.STRING,
            enum: ['direct', 'assertion_reason', 'numerical', 'match_the_following', 'case_based'],
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correct_index: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          distractor_logic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
          topic: { type: Type.STRING },
          pyq_trend_note: { type: Type.STRING },
        },
        required: ['question', 'question_style', 'options', 'correct_index', 'explanation', 'difficulty', 'topic'],
      },
    },
    short_answer_questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          model_answer: { type: Type.STRING },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
        },
        required: ['question', 'model_answer', 'topic', 'difficulty'],
      },
    },
    application_questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING },
          question: { type: Type.STRING },
          model_answer: { type: Type.STRING },
          topic: { type: Type.STRING },
        },
        required: ['scenario', 'question', 'model_answer', 'topic'],
      },
    },
    pyq_trend_insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          observation: { type: Type.STRING },
          source_titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          source_urls: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['observation'],
      },
    },
    external_resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          resource_type: {
            type: Type.STRING,
            enum: ['open_question_bank', 'anki_export_text', 'discussion_thread', 'reference_article'],
          },
          note: { type: Type.STRING },
        },
        required: ['title', 'url', 'resource_type'],
      },
    },
  },
  required: [
    'chapter_meta',
    'concept_summaries',
    'flashcards',
    'mcqs',
    'short_answer_questions',
    'application_questions',
    'pyq_trend_insights',
    'external_resources',
  ],
};

function getCountsForDepth(depth: DepthSetting) {
  switch (depth) {
    case 'quick':
      return {
        flashcards: 8,
        mcqs: 4,
        shortAnswer: 0,
        application: 0,
        desc: 'Quick depth: exactly 8 flashcards, exactly 4 MCQs (include at least 1 Assertion-Reason).',
      };
    case 'deep':
      return {
        flashcards: 25,
        mcqs: 12,
        shortAnswer: 4,
        application: 3,
        desc: 'Deep depth: exactly 25 flashcards, exactly 12 MCQs (with Assertion-Reason, Match the following, and Case-based), 4 short-answer questions, and 3 application questions.',
      };
    case 'standard':
    default:
      return {
        flashcards: 15,
        mcqs: 8,
        shortAnswer: 2,
        application: 2,
        desc: 'Standard depth: exactly 15 flashcards, exactly 8 MCQs (include at least 1 Assertion-Reason), 2 short-answer questions, and 2 application questions.',
      };
  }
}

/**
 * Exponential backoff wrapper for 429 rate-limiting resilience
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 2500): Promise<T> {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('rate limit');

      if (is429 && attempt < maxRetries) {
        console.warn(`[Gemini API] 429 rate limit encountered. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error('Rate limit retry loop exhausted.');
}

export interface GenerateStudyKitParams {
  pdfBase64: string;
  subject: SubjectType;
  classLevel: ClassLevel;
  depth: DepthSetting;
  chapterTitleHint?: string;
}

export async function generateStudyKit(params: GenerateStudyKitParams): Promise<StudyKitData> {
  const ai = getGenAIClient();
  const depthConfig = getCountsForDepth(params.depth);

  const promptText = `Analyze the provided NCERT Class ${params.classLevel} ${params.subject} textbook chapter PDF${
    params.chapterTitleHint ? ` ("${params.chapterTitleHint}")` : ''
  }.

Target generation depth:
${depthConfig.desc}

Instructions:
1. Ground every concept summary, flashcard, and question strictly in the provided NCERT chapter content.
2. Formulate authentic NEET MCQs reflecting actual NTA exam patterns (single-correct 4 options, Assertion-Reason items with standard option keys, Match the following, and numerical problems using exact NCERT constants).
3. Distractors must reflect real student traps and near-miss values based on established NEET coaching benchmarks (Allen, Aakash, Physics Wallah).
4. Provide genuine PYQ trend insights based on historical NEET patterns (2010–2024) for this specific chapter.
5. Calibrate flashcards across Bloom levels (recall, understanding, application, analysis) with difficulty ratings (easy, medium, hard).`;

  // Format the document part
  const pdfPart = {
    inlineData: {
      mimeType: 'application/pdf',
      data: params.pdfBase64,
    },
  };

  const candidateModels = [
    { name: 'gemini-3.8-flash', lowLatencyThinking: true },
    { name: 'gemini-flash-latest', lowLatencyThinking: false },
    { name: 'gemini-3.1-flash-lite', lowLatencyThinking: false },
  ];

  let lastError: any = null;

  for (const candidate of candidateModels) {
    try {
      console.log(`[StudyKit] Generating study kit using ${candidate.name} (Direct NCERT Grounding)...`);
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: STUDY_KIT_SCHEMA as any,
        maxOutputTokens: 8192,
      };

      if (candidate.lowLatencyThinking) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model: candidate.name,
          contents: [pdfPart, { text: promptText }],
          config,
        });
      }, 2, 1200);

      const text = response.text?.trim();
      if (!text) {
        throw new Error(`Empty response received from ${candidate.name}`);
      }

      const parsed = JSON.parse(text) as StudyKitData;
      console.log(`[StudyKit] Successfully generated study kit using ${candidate.name}!`);
      return parsed;
    } catch (err: any) {
      console.warn(`[StudyKit] Attempt with ${candidate.name} failed:`, err?.status, err?.message?.slice(0, 120));
      lastError = err;

      // Fail fast on auth errors
      if (
        err?.status === 401 ||
        err?.message?.includes('401') ||
        err?.message?.includes('UNAUTHENTICATED') ||
        err?.message?.includes('API key not valid')
      ) {
        throw new Error(
          'Gemini API authentication failed (401). Please verify your GEMINI_API_KEY secret in the AI Studio Secrets panel.'
        );
      }
    }
  }

  if (
    lastError?.status === 429 ||
    lastError?.message?.includes('RESOURCE_EXHAUSTED') ||
    lastError?.message?.includes('quota')
  ) {
    throw new Error(
      "You've hit today's free-tier limit across available models — check your quota at https://aistudio.google.com/rate-limit"
    );
  }

  throw new Error(`Failed to generate study kit: ${lastError?.message || 'Unknown generation error'}`);
}

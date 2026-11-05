import { GoogleGenAI, Type } from '@google/genai';
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

const SYSTEM_INSTRUCTION = `You are a senior NEET content expert who has authored question banks for a top Indian test-prep company. You will receive one chapter of an NCERT Class 11 or 12 Physics/Chemistry/Biology textbook as a PDF, plus the ability to research the web for how NEET actually tests this chapter. Produce a rigorous, exam-accurate study kit.

Rules:
1. Ground every fact strictly in the provided NCERT PDF. Do not invent data, constants, or claims not present in the chapter.
2. Before writing questions, research previous-year questions (PYQ), how major coaching institutes (Physics Wallah, Aakash, Allen) frame questions on this chapter, openly available text-based NEET question banks on GitHub (plain-text, CSV, or markdown decks only; explicitly skip binary .apkg Anki files), and frequently-discussed traps on forums like r/NEET. Prefer reputable, high-signal sources; ignore paywalled or low-quality content.
3. Never copy question text verbatim from any source. Use what you find only to identify patterns — common distractor traps, realistic numerical ranges, phrasing conventions (e.g. "Which of the following is/are correct?", Assertion–Reason, Match-the-following, case-based) — then write fresh, original questions in that style, sourced strictly from this NCERT chapter's content.
4. Match authentic NEET conventions: single-best-answer MCQs with 4 options; distractors must reflect real misconceptions or near-miss values, never arbitrary nonsense; include at least one Assertion-Reason item; for Physics/Chemistry include at least one numerical problem using exact NCERT constants/values; spread items across Bloom's levels (recall, understanding, application, analysis).
5. Tag every flashcard and question with topic, difficulty (easy/medium/hard), and Bloom level, so the app can filter by difficulty without another API call.
6. Report 2–6 short, genuinely useful PYQ-trend observations with the real source titles/URLs you used. List any genuinely useful open external resources you found, with real URLs. Never fabricate a URL.
7. Output ONLY JSON matching the provided schema — no prose outside it.`;

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
1. Search online using Google Search for:
   - NEET previous-year questions (PYQ) on this specific chapter.
   - Coaching institute patterns (Physics Wallah, Aakash, Allen) and high-yield traps.
   - Openly available text-based NEET question banks or markdown/CSV decks on GitHub (plain-text only, NO binary .apkg).
   - High-signal Reddit discussion (r/NEET) regarding tricky NCERT lines, diagrams, and confusing definitions.
2. Read the most promising source pages via url_context.
3. Ground all questions and facts strictly in the NCERT text. Never fabricate data or URLs.
4. Distribute difficulty (easy/medium/hard) realistically for NEET. Distractors must reflect authentic student misconceptions.
5. Provide concept summaries with exact NCERT section references.
6. Provide genuine PYQ trend insights with actual URLs.`;

  // Format the document part
  const pdfPart = {
    inlineData: {
      mimeType: 'application/pdf',
      data: params.pdfBase64,
    },
  };

  // Approach A: Gemini 3.8 Flash with tools + structured responseSchema in one call
  try {
    console.log('[StudyKit] Attempting Approach A (Gemini 3.8 Flash single-call with tools + responseSchema)...');
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [pdfPart, { text: promptText }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: STUDY_KIT_SCHEMA as any,
          maxOutputTokens: 8192,
        },
      });
    }, 2, 1500);

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response received from Gemini in Approach A');
    }

    const parsed = JSON.parse(text) as StudyKitData;
    console.log('[StudyKit] Approach A succeeded!');
    return parsed;
  } catch (errApproachA: any) {
    console.warn('[StudyKit] Approach A failed or tools limited:', errApproachA?.status, errApproachA?.message);

    // If key is invalid (401), fail fast with clear actionable instruction
    if (
      errApproachA?.status === 401 ||
      errApproachA?.message?.includes('401') ||
      errApproachA?.message?.includes('UNAUTHENTICATED') ||
      errApproachA?.message?.includes('API key not valid')
    ) {
      throw new Error(
        'Gemini API authentication failed (401). Please verify that your GEMINI_API_KEY secret is valid and active in the AI Studio Secrets panel.'
      );
    }

    // Approach B (Fallback): Direct NCERT grounding synthesis with model fallback chain
    // (Bypasses search tool limitations and single-model quota exhaustion)
    console.log('[StudyKit] Falling back to Direct NCERT Synthesis (PDF + Comprehensive NEET Prompt, no search tools)...');
    
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    const directPrompt = `${promptText}

Note: Ground all concept summaries, flashcards, MCQs, distractor logic, and assertion-reason questions strictly in the provided NCERT chapter content and established NEET exam patterns. Report verified high-yield PYQ trends and reputable open resources.`;

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        console.log(`[StudyKit] Attempting synthesis with model: ${modelName}...`);
        const directResponse = await callWithRetry(async () => {
          return await ai.models.generateContent({
            model: modelName,
            contents: [pdfPart, { text: directPrompt }],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: STUDY_KIT_SCHEMA as any,
              maxOutputTokens: 8192,
            },
          });
        }, 1, 1000);

        const text = directResponse.text?.trim();
        if (text) {
          const parsed = JSON.parse(text) as StudyKitData;
          console.log(`[StudyKit] Direct NCERT Synthesis succeeded using ${modelName}!`);
          return parsed;
        }
      } catch (errModel: any) {
        console.warn(`[StudyKit] Model ${modelName} failed:`, errModel?.status, errModel?.message?.slice(0, 100));
        lastError = errModel;
        // If authentication error, no need to retry with other models
        if (
          errModel?.status === 401 ||
          errModel?.message?.includes('401') ||
          errModel?.message?.includes('UNAUTHENTICATED')
        ) {
          break;
        }
      }
    }

    if (
      lastError?.status === 401 ||
      lastError?.message?.includes('401') ||
      lastError?.message?.includes('UNAUTHENTICATED') ||
      lastError?.message?.includes('API key not valid')
    ) {
      throw new Error(
        'Gemini API authentication failed (401). Please check that your GEMINI_API_KEY secret is valid in the AI Studio Secrets panel.'
      );
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
    throw new Error(`Failed to generate study kit: ${lastError?.message || 'Unknown error'}`);
  }
}

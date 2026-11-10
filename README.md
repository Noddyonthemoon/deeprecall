# NEET Deep-Recall

An NCERT-grounded study kit generator and spaced-repetition revision engine built for NEET-UG aspirants.

Upload a single NCERT textbook chapter PDF (Class 11 or 12 Biology, Chemistry, or Physics), and the system generates an exam-accurate revision kit in a single Gemini API call:
- Section-referenced concept summaries
- Bloom-classified flashcards powered by the SM-2 spaced-repetition algorithm
- authentic Computer-Based Test (CBT) question sets (MCQs, Assertion–Reason pairs, Match-the-following, and Application scenarios) with distractor rationale
- Previous-Year Question (PYQ) trend insights and curated external references

---

## Why This Exists

In NEET-UG, Biology alone accounts for 360 out of 720 marks (50% of the entire paper), and virtually 100% of the questions are drawn directly from the lines, diagrams, and tables of NCERT textbooks.

Generic AI flashcard tools usually fail for NEET for two reasons:
1. **Hallucinated or Out-of-Syllabus Facts**: They draw from broad medical literature or college textbooks rather than strictly adhering to NCERT conventions, values, and terminology.
2. **Poor Distractor Design**: Generic question generators produce obviously wrong distractors. Real NEET MCQs use near-miss numerical values, subtle terminology flips (e.g., *anterior* vs. *posterior* pituitary hormones), or commonly confused exceptions mentioned in NCERT footnotes.

NEET Deep-Recall enforces strict NCERT grounding from the uploaded PDF and structures distractors around authentic student misconceptions identified from historical exam patterns.

---

## Core Capabilities

### 1. Single-Call AI Pipeline
- **Budget-Conscious Architecture**: Each chapter is processed in a single server-side generation call using Gemini Flash models with structured JSON schema enforcement (`responseMimeType: "application/json"`). No background auto-refresh calls.
- **Resilient Fallback Chain**: Attempts `gemini-3.8-flash` first with Google Search grounding. If rate-limited (HTTP 429) or tool-restricted, it automatically falls back to direct NCERT synthesis via `gemini-flash-latest` or `gemini-3.1-flash-lite`.
- **Zero Client-Side Keys**: The Gemini API key remains strictly on the Node.js/Express backend; the client never touches `@google/genai`.

### 2. Spaced Repetition (SuperMemo-2 / SM-2)
- Implements the authentic SM-2 algorithm client-side:
  - Quality ratings: `0` (Again), `3` (Hard), `4` (Good), `5` (Easy)
  - Formula: $EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$
  - Minimum Ease Factor clamped at $1.3$
- **Global Due Today Queue**: Collects scheduled reviews across all generated chapters in one unified session, sorted oldest-due first.
- **Keyboard Shortcuts**: `Space` / `Enter` to flip card, `1`–`4` to submit retention rating.
- **Anki Export**: Exports decks as standard tab-separated `.txt` files with tags and HTML formatting (`#separator:tab`, `#tags column:3`), ready for direct import into Anki desktop/mobile.

### 3. Exam-Grade CBT Quiz Engine
- Authentic NEET scoring: `+4` for correct responses, `-1` for incorrect responses, and `0` for unattempted questions.
- Question styles:
  - **Single-Best-Answer MCQs** with full distractor analysis explaining *why* each wrong option was tempting.
  - **Assertion–Reason (A-R)** pairs matching NTA examination phrasing.
  - **Short Answer** and **Application Scenarios** with self-grading model answer reveal toggles.
- Post-quiz diagnostic scorecards broken down across Bloom's Taxonomy (Recall, Understanding, Application, Analysis).

### 4. Persistence & Auth
- **Dual Session Model**: First-time visitors receive an immediate persistent session with Firestore storage (`users/{uid}/chapters/...`) without forced login prompts.
- **Dedicated Aspirant Auth Modal**: Full email/password sign-up with target exam year and target score, plus 1-click Google authentication.
- **Offline / Sample Kits**: Ships with pre-loaded high-yield chapters (*Cell: The Unit of Life* and *Human Reproduction*) for instant offline study.

### 5. Account Dashboard & Custom API Key
- Clicking the account name in the top navigation opens the **Account & Engine Settings** panel.
- Shows student target year (e.g. NEET 2026) and target score (e.g. 680+/720).
- **Personal Gemini Key Override**: Students can optionally supply their own Gemini API key to bypass shared free-tier rate limits or demand spikes. Keys are stored locally in the browser and passed securely to the server proxy with instant validation.

---

## Prompts & Sample Study Kit Output

This repository includes the complete prompts and verified output format used by NEET Deep-Recall:

1. **System Prompt**: [`prompt/system_prompt.txt`](prompt/system_prompt.txt)
   - The exact system instruction sent to the Gemini models (`gemini-3.8-flash` / `gemini-3.1-flash-lite`).
   - Enforces strict NCERT ground truth, authentic exam distractor patterns (near-miss values, subtle terminology flips), Bloom's taxonomy tagging, and structured JSON output without prose.

2. **Sample Generated Output**: [`sample_chapter_output.json`](sample_chapter_output.json)
   - A complete, representative study kit for NCERT Class 11 Biology: *Cell: The Unit of Life*.
   - Contains NCERT section-referenced concept summaries, Bloom-classified SM-2 flashcards, high-yield MCQs with distractor breakdown, assertion-reason items, and PYQ trend analysis.

3. **Initial Project Specification**: [`prompt/initial_project_prompt.txt`](prompt/initial_project_prompt.txt)
   - The full foundational brief and system requirements used to architect NEET Deep-Recall, including the single-call constraint, Firestore schema, and SuperMemo-2 mathematical rules.

---

## Architecture & Tech Stack

```
├── Client (React 19 + TypeScript + Tailwind CSS v4)
│   ├── src/components/UploadScreen.tsx           # Drag-and-drop PDF dropzone & parameter selector
│   ├── src/components/ChapterDashboard.tsx       # 5-tab study kit workspace
│   ├── src/components/FlashcardsTab.tsx          # SM-2 card reviewer & Anki exporter
│   ├── src/components/QuizTab.tsx                # NEET CBT exam engine & score analyzer
│   ├── src/components/DueTodayDashboard.tsx      # Cross-chapter daily review queue
│   ├── src/components/AccountDashboardModal.tsx  # Aspirant profile & custom Gemini API key manager
│   ├── src/lib/sm2.ts                            # Pure SM-2 mathematical implementation
│   ├── src/lib/firebase.ts                       # Firestore operations & auth listeners
│   └── src/lib/apiKeyStorage.ts                  # Local storage manager for user Gemini key
│
├── Server (Node.js + Express)
│   ├── server/apiRouter.ts                       # POST /api/generate & /api/validate-key
│   └── server/geminiService.ts                   # Gemini SDK client, schema, & model fallback chain
│
├── Prompts & Sample Data
│   ├── prompt/initial_project_prompt.txt         # Foundational project specifications & prompt
│   ├── prompt/system_prompt.txt                  # Exact system prompt sent to Gemini models
│   └── sample_chapter_output.json                # Complete sample study kit JSON for Cell Biology
│
└── Configuration
    ├── firestore.rules                           # Attribute-based Firestore access rules
    ├── firebase-blueprint.json                   # Intermediate representation schema
    └── vite.config.ts                            # Vite dev server + Express middleware mount
```

---

## Getting Started

### Prerequisites
- Node.js 20+ or 22+
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- (Optional) A Firebase project with Firestore and Google Authentication enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Noddyonthemoon/deeprecall.git
   cd deeprecall
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

5. **Production build**:
   ```bash
   npm run build
   npm start
   ```

---

## Firestore Data Model

```
users/
  └── {userId}/
        ├── chapters/
        │     └── {chapterId}/
        │           ├── chapter_meta: { subject, chapter_title, ncert_class, topics_covered }
        │           ├── concept_summaries: [ { topic, summary, ncert_section_reference } ]
        │           ├── mcqs: [ { question, options, correct_index, explanation, distractor_logic, ... } ]
        │           ├── short_answer_questions: [ ... ]
        │           ├── application_questions: [ ... ]
        │           ├── pyq_trend_insights: [ ... ]
        │           ├── createdAt: ISO timestamp
        │           │
        │           └── cards/
        │                 └── {cardId}/
        │                       ├── front: string
        │                       ├── back: string
        │                       ├── easeFactor: number (default 2.5)
        │                       ├── interval: number (days)
        │                       ├── repetitions: number
        │                       ├── dueDate: "YYYY-MM-DD"
        │                       └── flagged: boolean
```

---

## Design Principles

- **No Generic AI Slop**: Zero decorative purple gradients, no glowing neon rings, no static metadata pills, and no decorative sparkle icons.
- **Editorial Legibility**: Set in `Newsreader` (optical serif) for chapter headlines and `Plus Jakarta Sans` for dense scientific prose, paired with `JetBrains Mono` for tabular metrics and countdown timers.
- **Natural Paper Canvas**: Calibrated `#fbfbfa` canvas with subtle hairline stone dividers (`border-stone-200`) providing high readability during long study sessions.

---

## License

This project is licensed under the [MIT License](LICENSE).

import React, { useState, useRef } from 'react';
import { SubjectType, ClassLevel, DepthSetting, ChapterDocument } from '../types/neet';
import { SAMPLE_CHAPTERS, SampleChapterOption } from '../lib/sampleChapters';
import {
  UploadCloud,
  FileText,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  FilePlus,
  Clock,
} from 'lucide-react';

interface UploadScreenProps {
  onGenerate: (params: {
    pdfBase64: string;
    filename: string;
    subject: SubjectType;
    classLevel: ClassLevel;
    depth: DepthSetting;
    chapterTitleHint?: string;
  }) => void;
  onSelectSavedChapter: (chapter: ChapterDocument) => void;
  onSelectSampleChapter: (sample: SampleChapterOption) => void;
  onDeleteChapter?: (chapterId: string) => void;
  existingChapters: ChapterDocument[];
  isGenerating: boolean;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onGenerate,
  onSelectSavedChapter,
  onSelectSampleChapter,
  onDeleteChapter,
  existingChapters,
  isGenerating,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [subject, setSubject] = useState<SubjectType>('Biology');
  const [classLevel, setClassLevel] = useState<ClassLevel>('11');
  const [depth, setDepth] = useState<DepthSetting>('standard');
  const [chapterTitleHint, setChapterTitleHint] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if saved kit matches subject + title hint
  const matchingSavedChapter = existingChapters.find((ch) => {
    if (!chapterTitleHint.trim()) return false;
    const sameSubject = ch.chapter_meta.subject.toLowerCase() === subject.toLowerCase();
    const cleanHint = chapterTitleHint.toLowerCase().trim();
    const cleanTitle = ch.chapter_meta.chapter_title.toLowerCase().trim();
    return sameSubject && (cleanTitle.includes(cleanHint) || cleanHint.includes(cleanTitle));
  });

  const handleFileProcess = (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select an NCERT textbook chapter in PDF format.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25MB limit. Please upload an individual chapter PDF.');
      return;
    }

    setFile(selectedFile);

    if (!chapterTitleHint) {
      const cleanName = selectedFile.name
        .replace(/\.pdf$/i, '')
        .replace(/^ch(apter)?[-_ ]*\d*[-_ ]*/i, '')
        .replace(/[-_]/g, ' ')
        .trim();
      if (cleanName.length > 3) {
        setChapterTitleHint(cleanName);
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setFileBase64(base64);
    };
    reader.onerror = () => {
      setErrorMsg('Unable to read the PDF file. Please try again.');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleStartGeneration = (forceRegenerate = false) => {
    if (!fileBase64 || !file) {
      setErrorMsg('Please select an NCERT chapter PDF.');
      return;
    }

    if (matchingSavedChapter && !forceRegenerate) {
      onSelectSavedChapter(matchingSavedChapter);
      return;
    }

    onGenerate({
      pdfBase64: fileBase64,
      filename: file.name,
      subject,
      classLevel,
      depth,
      chapterTitleHint: chapterTitleHint.trim() || undefined,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Editorial Header (NotebookLM / DeepMind style) */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-widest font-mono text-stone-500">
          NCERT Study Kit & Spaced Repetition
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-stone-900 leading-tight">
          Grounded revision for competitive NEET preparation.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans max-w-2xl">
          Upload an official NCERT chapter PDF. The system researches previous-year trends, distractor traps, and produces a complete study kit with SM-2 spaced repetition cards.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Source Upload & Parameters (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Add NCERT Chapter Source</h2>
              <p className="text-xs text-stone-500 mt-0.5">Single PDF per generation call</p>
            </div>
            <span className="text-[11px] font-mono text-stone-400">PDF · Max 25MB</span>
          </div>

          {/* Clean Paper Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors duration-150 ${
              dragActive
                ? 'border-stone-900 bg-stone-50'
                : file
                ? 'border-stone-300 bg-stone-50/70'
                : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-stone-700" />
                <div>
                  <p className="text-sm font-medium text-stone-900">{file.name}</p>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for analysis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setFileBase64(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline transition"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-sm font-medium text-stone-800">
                  Drop chapter PDF here, or browse
                </p>
                <p className="text-xs text-stone-500">
                  Direct chapter downloads from ncert.nic.in work best
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-stone-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chapter Metadata & Parameters */}
          <div className="space-y-5 pt-1">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                NEET Subject
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Biology', 'Chemistry', 'Physics'] as SubjectType[]).map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSubject(subj)}
                    className={`py-2 px-3 rounded-md text-xs font-medium transition border ${
                      subject === subj
                        ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <span>{subj}</span>
                    {subj === 'Biology' && (
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">50% Weightage</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Class & Optional Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  NCERT Class
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['11', '12'] as ClassLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setClassLevel(lvl)}
                      className={`py-2 px-3 rounded-md text-xs font-medium transition border ${
                        classLevel === lvl
                          ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Class {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Chapter Title (Optional)
                </label>
                <input
                  type="text"
                  value={chapterTitleHint}
                  onChange={(e) => setChapterTitleHint(e.target.value)}
                  placeholder="e.g. Cell: The Unit of Life"
                  className="w-full py-2 px-3 rounded-md text-xs bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition"
                />
              </div>
            </div>

            {/* Depth Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-stone-700">
                  Generation Depth
                </label>
                <span className="text-[11px] text-stone-400">Single API call</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'quick', title: 'Quick', desc: '8 Cards · 4 MCQs' },
                  { id: 'standard', title: 'Standard', desc: '15 Cards · 8 MCQs · 2 SA' },
                  { id: 'deep', title: 'Deep', desc: '25 Cards · 12 MCQs · 4 SA' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDepth(d.id as DepthSetting)}
                    className={`p-2.5 rounded-md text-left transition border ${
                      depth === d.id
                        ? 'bg-stone-50 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <p className="text-xs font-semibold text-stone-900">{d.title}</p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matching chapter notice */}
          {matchingSavedChapter && (
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-2">
              <p className="font-medium text-stone-900">
                A study kit already exists for "{matchingSavedChapter.chapter_meta.chapter_title}".
              </p>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Opening the saved kit avoids consuming additional API quotas. You can still regenerate if you wish.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectSavedChapter(matchingSavedChapter)}
                  className="px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition"
                >
                  Open Saved Kit
                </button>
                <button
                  type="button"
                  onClick={() => handleStartGeneration(true)}
                  className="px-3 py-1.5 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium text-xs transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate fresh</span>
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!matchingSavedChapter && (
            <button
              type="button"
              disabled={isGenerating || !fileBase64}
              onClick={() => handleStartGeneration(false)}
              className={`w-full py-3 px-4 rounded-md font-medium text-sm flex items-center justify-center space-x-2 transition ${
                isGenerating || !fileBase64
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm active:scale-[0.99]'
              }`}
            >
              <span>Generate Study Kit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Column: Pre-configured Exemplars & User Library (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant NCERT Chapter Kits */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-900">Featured NCERT Chapters</h3>
              <span className="text-[11px] text-stone-500">Ready to study</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore fully analyzed high-weightage chapters with authentic previous-year question patterns and SM-2 flashcard decks:
            </p>

            <div className="space-y-3">
              {SAMPLE_CHAPTERS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onSelectSampleChapter(sample)}
                  className="p-3.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50/60 transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-serif text-sm font-medium text-stone-900 group-hover:text-stone-950 transition">
                      {sample.title}
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                      Class {sample.ncertClass}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{sample.badge}</span>
                    <span className="text-stone-900 font-medium group-hover:underline flex items-center">
                      Open Kit <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User's Saved Chapters */}
          {existingChapters.length > 0 && (
            <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="text-sm font-semibold text-stone-900">Your Generated Chapters</h3>
                <span className="text-[11px] font-mono text-stone-500">{existingChapters.length} saved</span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {existingChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50/60 flex items-center justify-between group transition"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => onSelectSavedChapter(ch)}
                    >
                      <p className="text-xs font-semibold text-stone-900 group-hover:text-stone-950">
                        {ch.chapter_meta.chapter_title}
                      </p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {ch.chapter_meta.subject} (Class {ch.chapter_meta.ncert_class}) · {ch.cardCount || ch.flashcards.length} cards
                      </p>
                    </div>
                    {onDeleteChapter && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete saved kit for "${ch.chapter_meta.chapter_title}"?`)) {
                            onDeleteChapter(ch.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

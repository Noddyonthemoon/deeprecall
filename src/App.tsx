import React, { useState, useEffect, useCallback } from 'react';
import {
  auth,
  logOut,
  getOrCreateGuestUser,
  UserProfile,
  getUserChapters,
  getChapterCards,
  saveStudyKitToFirestore,
  updateCardSM2State,
  toggleCardFlag,
  getDueTodayCards,
  deleteChapter,
} from './lib/firebase';
import {
  ChapterDocument,
  CardProgress,
  StudyKitData,
  SubjectType,
  ClassLevel,
  DepthSetting,
} from './types/neet';
import { SAMPLE_CHAPTERS, SampleChapterOption } from './lib/sampleChapters';
import { Navbar } from './components/Navbar';
import { UploadScreen } from './components/UploadScreen';
import { LoadingProgress } from './components/LoadingProgress';
import { ChapterDashboard } from './components/ChapterDashboard';
import { DueTodayDashboard } from './components/DueTodayDashboard';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ExternalLink, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(getOrCreateGuestUser);

  // View state
  const [activeView, setActiveView] = useState<'home' | 'chapter' | 'dueToday'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingInfo, setGeneratingInfo] = useState<{ subject: string; title?: string }>({
    subject: 'Biology',
  });

  // Data state
  const [chapters, setChapters] = useState<ChapterDocument[]>([]);
  const [activeChapter, setActiveChapter] = useState<ChapterDocument | null>(null);
  const [activeChapterCards, setActiveChapterCards] = useState<CardProgress[]>([]);
  const [dueCards, setDueCards] = useState<CardProgress[]>([]);

  // Modals & alerts
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [errorMessage, setErrorMessage] = useState<{ text: string; isRateLimit?: boolean } | null>(
    null
  );

  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userChapters = await getUserChapters(uid);
      setChapters(userChapters);

      const due = await getDueTodayCards(uid);
      setDueCards(due);
    } catch (err) {
      console.warn('Notice loading user data from Firestore:', err);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    // Load initial guest or cached data immediately
    const initialUser = getOrCreateGuestUser();
    loadUserData(initialUser.uid);

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const profile: UserProfile = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          isAnonymous: currentUser.isAnonymous,
        };
        setUser(profile);
        await loadUserData(currentUser.uid);
      } else {
        const guest = getOrCreateGuestUser();
        setUser(guest);
        await loadUserData(guest.uid);
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (newUser: UserProfile) => {
    setUser(newUser);
    await loadUserData(newUser.uid);
  };

  const handleSignOut = async () => {
    await logOut();
    const guest = getOrCreateGuestUser();
    setUser(guest);
    await loadUserData(guest.uid);
  };

  const handleOpenChapter = async (chapter: ChapterDocument) => {
    setActiveChapter(chapter);
    if (user) {
      const cards = await getChapterCards(user.uid, chapter.id);
      setActiveChapterCards(cards);
    }
    setActiveView('chapter');
  };

  const handleGenerate = async (params: {
    pdfBase64: string;
    filename: string;
    subject: SubjectType;
    classLevel: ClassLevel;
    depth: DepthSetting;
    chapterTitleHint?: string;
  }) => {
    setIsGenerating(true);
    setGeneratingInfo({ subject: params.subject, title: params.chapterTitleHint || params.filename });
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: params.pdfBase64,
          subject: params.subject,
          classLevel: params.classLevel,
          depth: params.depth,
          chapterTitleHint: params.chapterTitleHint,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        let errorText = data.error || 'Failed to generate study kit from server.';
        if (response.status === 401 || data.isAuthError) {
          errorText = 'Gemini API authentication failed (401). Please verify your GEMINI_API_KEY secret in the AI Studio Secrets panel.';
        }
        setErrorMessage({
          text: errorText,
          isRateLimit: data.isRateLimit,
        });
        setIsGenerating(false);
        return;
      }

      const generatedKit: StudyKitData = data.studyKit;
      const savedDoc = await saveStudyKitToFirestore(user.uid, generatedKit, params.depth);

      await loadUserData(user.uid);
      await handleOpenChapter(savedDoc);
    } catch (err: any) {
      console.error('Generation network error:', err);
      setErrorMessage({
        text: err.message || 'Network error communicating with the generation server.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSample = async (sample: SampleChapterOption) => {
    if (!user) return;
    try {
      const savedDoc = await saveStudyKitToFirestore(user.uid, sample.studyKit, 'standard');
      await loadUserData(user.uid);
      await handleOpenChapter(savedDoc);
    } catch (e) {
      console.error('Error saving sample chapter:', e);
      const fallbackDoc: ChapterDocument = {
        ...sample.studyKit,
        id: sample.id,
        userId: user.uid,
        depth: 'standard',
        createdAt: new Date().toISOString(),
        cardCount: sample.studyKit.flashcards.length,
        mcqCount: sample.studyKit.mcqs.length,
      };
      setActiveChapter(fallbackDoc);
      setActiveChapterCards(
        sample.studyKit.flashcards.map((f, i) => ({
          cardId: `card_${i + 1}`,
          chapterId: sample.id,
          chapterTitle: sample.studyKit.chapter_meta.chapter_title,
          subject: sample.studyKit.chapter_meta.subject,
          front: f.front,
          back: f.back,
          topic: f.topic,
          difficulty: f.difficulty,
          bloom_level: f.bloom_level,
          pyq_inspired: f.pyq_inspired,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          dueDate: new Date().toISOString().split('T')[0],
        }))
      );
      setActiveView('chapter');
    }
  };

  const handleUpdateCardSM2 = async (
    chapterId: string,
    cardId: string,
    updates: Partial<CardProgress>
  ) => {
    if (!user) return;
    await updateCardSM2State(user.uid, chapterId, cardId, updates);

    setActiveChapterCards((prev) =>
      prev.map((c) => (c.cardId === cardId ? { ...c, ...updates } : c))
    );

    const updatedDue = await getDueTodayCards(user.uid);
    setDueCards(updatedDue);
  };

  const handleToggleCardFlag = async (
    chapterId: string,
    cardId: string,
    flagged: boolean
  ) => {
    if (!user) return;
    await toggleCardFlag(user.uid, chapterId, cardId, flagged);

    setActiveChapterCards((prev) =>
      prev.map((c) => (c.cardId === cardId ? { ...c, flagged } : c))
    );
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!user) return;
    await deleteChapter(user.uid, chapterId);
    if (activeChapter?.id === chapterId) {
      setActiveChapter(null);
      setActiveView('home');
    }
    await loadUserData(user.uid);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      {/* Navbar */}
      <Navbar
        user={user}
        dueCardCount={dueCards.length}
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onNavigateDueToday={() => setActiveView('dueToday')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
      />

      {/* Subtle Notice Banner */}
      {errorMessage && (
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2.5 text-xs text-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-4xl mx-auto">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-stone-600" />
            <span>{errorMessage.text}</span>
            {errorMessage.isRateLimit && (
              <a
                href="https://aistudio.google.com/rate-limit"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-stone-900 inline-flex items-center space-x-1 ml-2"
              >
                <span>Live Quota Status</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-stone-950 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1">
        {isGenerating ? (
          <LoadingProgress
            subject={generatingInfo.subject}
            chapterTitle={generatingInfo.title}
          />
        ) : activeView === 'chapter' && activeChapter ? (
          <ChapterDashboard
            chapter={activeChapter}
            cards={activeChapterCards}
            onBackToHome={() => setActiveView('home')}
            onRegenerate={() => {
              setActiveView('home');
            }}
            onUpdateCardSM2={(cardId, updates) =>
              handleUpdateCardSM2(activeChapter.id, cardId, updates)
            }
            onToggleCardFlag={(cardId, flagged) =>
              handleToggleCardFlag(activeChapter.id, cardId, flagged)
            }
            isGenerating={isGenerating}
          />
        ) : activeView === 'dueToday' ? (
          <DueTodayDashboard
            dueCards={dueCards}
            onUpdateCardSM2={handleUpdateCardSM2}
            onToggleCardFlag={handleToggleCardFlag}
            onBackToHome={() => setActiveView('home')}
          />
        ) : (
          <UploadScreen
            onGenerate={handleGenerate}
            onSelectSavedChapter={handleOpenChapter}
            onSelectSampleChapter={handleSelectSample}
            onDeleteChapter={handleDeleteChapter}
            existingChapters={chapters}
            isGenerating={isGenerating}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-200/80 py-8 text-xs text-stone-500 font-sans mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            NEET Deep-Recall · Grounded NCERT Revision
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-stone-800 transition"
            >
              System Quota
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="https://aistudio.google.com/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-800 transition inline-flex items-center space-x-1"
            >
              <span>AI Studio Rate Limits</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      {/* Auth Modal (Sign in / Create Account) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}

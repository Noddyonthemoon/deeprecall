import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChapterDocument, CardProgress, StudyKitData, DepthSetting, SubjectType } from '../types/neet';
import { getTodayDateString } from './sm2';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (use custom database ID if provided)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  targetYear?: string;
  targetScore?: string;
  createdAt?: string;
}

const ACTIVE_USER_KEY = 'neet_recall_active_user_v2';
const GUEST_KEY = 'neet_recall_guest_id_v2';

async function hashCredential(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text + '_neet_recall_salt_2026');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getOrCreateGuestUser(): UserProfile {
  if (typeof window !== 'undefined') {
    const savedActive = localStorage.getItem(ACTIVE_USER_KEY);
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.uid) return parsed;
      } catch (_e) {}
    }
  }

  let guestId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_KEY) : null;
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_KEY, guestId);
    }
  }
  return {
    uid: guestId,
    displayName: 'Guest Aspirant',
    email: null,
    photoURL: null,
    isAnonymous: true,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(profile));
  }
  try {
    const userRef = doc(db, 'users', profile.uid, 'profile', 'info');
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Notice saving profile to Firestore:', err);
  }
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid, 'profile', 'info');
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Notice loading profile from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(ACTIVE_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.uid === uid) return parsed;
      } catch (_e) {}
    }
  }
  return null;
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const existing = await loadUserProfile(result.user.uid);
    const profile: UserProfile = {
      uid: result.user.uid,
      displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Aspirant',
      email: result.user.email,
      photoURL: result.user.photoURL,
      isAnonymous: false,
      targetYear: existing?.targetYear || '2026',
      targetScore: existing?.targetScore || '680+',
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    await saveUserProfile(profile);
    return profile;
  } catch (err: any) {
    console.warn('Google sign-in error:', err.code, err.message);
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error(`Google Auth: Domain (${window.location.hostname}) is not authorized in Firebase Console. You can create an account using email below!`);
    }
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed or blocked. Please try again or create an account with email below.');
    }
    throw new Error(err.message || 'Authentication failed. Please try with email below.');
  }
}

export async function createAspirantAccount(params: {
  email: string;
  password: string;
  displayName?: string;
  targetYear?: string;
  targetScore?: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.toLowerCase().trim();
  const name = params.displayName?.trim() || cleanEmail.split('@')[0];

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
    if (name) {
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (_e) {}
    }
    const profile: UserProfile = {
      uid: cred.user.uid,
      displayName: name,
      email: cleanEmail,
      photoURL: null,
      isAnonymous: false,
      targetYear: params.targetYear || '2026',
      targetScore: params.targetScore || '680+',
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(profile);
    return profile;
  } catch (err: any) {
    // If Firebase project doesn't have Email Provider enabled in console,
    // seamlessly provide full account creation and Firestore persistence!
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
      console.log('Firebase Email Auth disabled in console; using direct Firestore aspirant account.');
      const passHash = await hashCredential(params.password);
      const emailHash = (await hashCredential(cleanEmail)).slice(0, 16);
      const uid = `user_${emailHash}`;

      const existingSnap = await getDoc(doc(db, 'users', uid, 'profile', 'info'));
      if (existingSnap.exists()) {
        throw new Error('An account with this email address already exists. Please choose "Sign In".');
      }

      const profile: UserProfile = {
        uid,
        displayName: name,
        email: cleanEmail,
        photoURL: null,
        isAnonymous: false,
        targetYear: params.targetYear || '2026',
        targetScore: params.targetScore || '680+',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid, 'profile', 'info'), {
        ...profile,
        credentialHash: passHash,
      });

      await saveUserProfile(profile);
      return profile;
    }

    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (err.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters long.');
    }
    throw new Error(err.message || 'Failed to create account. Please try again.');
  }
}

export async function loginAspirantAccount(params: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.toLowerCase().trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
    const existing = await loadUserProfile(cred.user.uid);
    const profile: UserProfile = existing || {
      uid: cred.user.uid,
      displayName: cred.user.displayName || cleanEmail.split('@')[0],
      email: cred.user.email,
      photoURL: cred.user.photoURL,
      isAnonymous: false,
    };
    await saveUserProfile(profile);
    return profile;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
      console.log('Firebase Email Auth disabled in console; validating via direct Firestore aspirant account.');
      const passHash = await hashCredential(params.password);
      const emailHash = (await hashCredential(cleanEmail)).slice(0, 16);
      const uid = `user_${emailHash}`;

      const snap = await getDoc(doc(db, 'users', uid, 'profile', 'info'));
      if (!snap.exists()) {
        throw new Error('No account found for this email. Please switch to "Create Account" first.');
      }

      const data = snap.data();
      if (data.credentialHash && data.credentialHash !== passHash) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      const profile: UserProfile = {
        uid: data.uid || uid,
        displayName: data.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoURL: data.photoURL || null,
        isAnonymous: false,
        targetYear: data.targetYear || '2026',
        targetScore: data.targetScore || '680+',
        createdAt: data.createdAt,
      };

      await saveUserProfile(profile);
      return profile;
    }

    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    throw new Error(err.message || 'Login failed. Please check your credentials.');
  }
}

export async function signInAsGuest(): Promise<UserProfile> {
  try {
    const result = await signInAnonymously(auth);
    const profile: UserProfile = {
      uid: result.user.uid,
      displayName: 'Guest Aspirant',
      email: null,
      photoURL: null,
      isAnonymous: true,
    };
    return profile;
  } catch (_e) {
    return getOrCreateGuestUser();
  }
}

export async function logOut(): Promise<UserProfile> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Sign-out notice:', e);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem(GUEST_KEY);
  }
  return getOrCreateGuestUser();
}

// Chapter ID generation from Subject + Title
export function generateChapterId(subject: string, title: string): string {
  const cleanSubj = subject.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);
  return `${cleanSubj}_${cleanTitle}`;
}

// Firestore Database Operations

/**
 * Check if a chapter already exists in Firestore for the current user
 */
export async function checkChapterExists(
  userId: string,
  chapterId: string
): Promise<ChapterDocument | null> {
  try {
    const chapterRef = doc(db, 'users', userId, 'chapters', chapterId);
    const snap = await getDoc(chapterRef);
    if (snap.exists()) {
      return snap.data() as ChapterDocument;
    }
    return null;
  } catch (error) {
    console.error('Error checking chapter existence:', error);
    return null;
  }
}

/**
 * Save full study kit to Firestore under users/{uid}/chapters/{chapterId}
 * and initialize flashcard SM-2 states under users/{uid}/chapters/{chapterId}/cards/{cardId}
 */
export async function saveStudyKitToFirestore(
  userId: string,
  studyKit: StudyKitData,
  depth: DepthSetting
): Promise<ChapterDocument> {
  const chapterId = generateChapterId(studyKit.chapter_meta.subject, studyKit.chapter_meta.chapter_title);
  const todayStr = getTodayDateString();

  // Create clean ChapterDocument
  const chapterDoc: ChapterDocument = {
    ...studyKit,
    id: chapterId,
    userId,
    depth,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cardCount: studyKit.flashcards.length,
    mcqCount: studyKit.mcqs.length,
  };

  const chapterRef = doc(db, 'users', userId, 'chapters', chapterId);
  await setDoc(chapterRef, chapterDoc);

  // Initialize SM-2 cards in subcollection
  for (let index = 0; index < studyKit.flashcards.length; index++) {
    const card = studyKit.flashcards[index];
    const cardId = `card_${index + 1}`;
    const cardRef = doc(db, 'users', userId, 'chapters', chapterId, 'cards', cardId);

    const initialCardState: CardProgress = {
      cardId,
      chapterId,
      chapterTitle: studyKit.chapter_meta.chapter_title,
      subject: studyKit.chapter_meta.subject,
      front: card.front,
      back: card.back,
      topic: card.topic,
      difficulty: card.difficulty,
      bloom_level: card.bloom_level,
      pyq_inspired: card.pyq_inspired,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueDate: todayStr, // immediately due for first learning session
      flagged: false,
    };

    await setDoc(cardRef, initialCardState);
  }

  return chapterDoc;
}

/**
 * Fetch all chapters for a user
 */
export async function getUserChapters(userId: string): Promise<ChapterDocument[]> {
  try {
    const chaptersRef = collection(db, 'users', userId, 'chapters');
    const snapshot = await getDocs(chaptersRef);
    const chapters: ChapterDocument[] = [];
    snapshot.forEach((d) => {
      chapters.push(d.data() as ChapterDocument);
    });
    // Sort newest first
    return chapters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching user chapters:', error);
    return [];
  }
}

/**
 * Fetch all cards for a specific chapter
 */
export async function getChapterCards(userId: string, chapterId: string): Promise<CardProgress[]> {
  try {
    const cardsRef = collection(db, 'users', userId, 'chapters', chapterId, 'cards');
    const snapshot = await getDocs(cardsRef);
    const cards: CardProgress[] = [];
    snapshot.forEach((d) => {
      cards.push(d.data() as CardProgress);
    });
    return cards;
  } catch (error) {
    console.error(`Error fetching cards for chapter ${chapterId}:`, error);
    return [];
  }
}

/**
 * Update SM-2 state for a card
 */
export async function updateCardSM2State(
  userId: string,
  chapterId: string,
  cardId: string,
  updates: Partial<CardProgress>
): Promise<void> {
  const cardRef = doc(db, 'users', userId, 'chapters', chapterId, 'cards', cardId);
  await updateDoc(cardRef, {
    ...updates,
    lastReviewed: new Date().toISOString(),
  });
}

/**
 * Toggle flagged status for a flashcard
 */
export async function toggleCardFlag(
  userId: string,
  chapterId: string,
  cardId: string,
  flagged: boolean
): Promise<void> {
  const cardRef = doc(db, 'users', userId, 'chapters', chapterId, 'cards', cardId);
  await updateDoc(cardRef, { flagged });
}

/**
 * Fetch all cards due today across ALL of the user's chapters (SM-2 cross-chapter dashboard)
 * Sorted oldest-due first
 */
export async function getDueTodayCards(userId: string): Promise<CardProgress[]> {
  try {
    const chapters = await getUserChapters(userId);
    const todayStr = getTodayDateString();
    const allCards: CardProgress[] = [];

    for (const ch of chapters) {
      const cards = await getChapterCards(userId, ch.id);
      for (const card of cards) {
        if (!card.dueDate || card.dueDate <= todayStr) {
          allCards.push(card);
        }
      }
    }

    // Sort oldest-due first
    return allCards.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  } catch (error) {
    console.error('Error fetching due cards:', error);
    return [];
  }
}

/**
 * Delete a chapter and its cards
 */
export async function deleteChapter(userId: string, chapterId: string): Promise<void> {
  const cards = await getChapterCards(userId, chapterId);
  for (const c of cards) {
    await deleteDoc(doc(db, 'users', userId, 'chapters', chapterId, 'cards', c.cardId));
  }
  await deleteDoc(doc(db, 'users', userId, 'chapters', chapterId));
}

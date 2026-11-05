import React, { useState } from 'react';
import { UserProfile, signInWithGoogle, createAspirantAccount, loginAspirantAccount } from '../lib/firebase';
import { X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetYear, setTargetYear] = useState('2026');
  const [targetScore, setTargetScore] = useState('680+');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      setSuccessNotice('Signed in with Google successfully.');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError(err.message || 'Google Sign-In could not be completed. You can create an account with email below.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await createAspirantAccount({
          email: email.trim(),
          password,
          displayName: name.trim() || email.split('@')[0],
          targetYear,
          targetScore,
        });
        setSuccessNotice('Account created successfully! Welcome to NEET Deep-Recall.');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 600);
      } else {
        const user = await loginAspirantAccount({
          email: email.trim(),
          password,
        });
        setSuccessNotice('Logged in successfully. Loading your study kits...');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200/90 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-stone-800 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
            NEET Aspirant Portal
          </p>
          <h2 className="font-serif text-2xl font-normal text-stone-900 tracking-tight">
            {mode === 'signup' ? 'Create Aspirant Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed font-sans">
            {mode === 'signup'
              ? 'Save study kits, sync SM-2 spaced repetition decks, and track test scores.'
              : 'Sign in to access your saved chapters and due flashcard queues.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-lg text-xs font-medium border border-stone-200/60">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-1.5 rounded-md transition ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-300 text-stone-800 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-stone-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-400 text-stone-900 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-stone-700" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 1-Click Google Sign-In */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-lg border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium flex items-center justify-center space-x-2.5 transition shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Subtle Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-mono text-stone-400 uppercase tracking-wider relative">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swarnav Chand"
                className="w-full py-2 px-3 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aspirant@example.com"
              className="w-full py-2 px-3 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full py-2 px-3 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 transition"
            />
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Target NEET Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 bg-white transition"
                >
                  <option value="2025">NEET 2025</option>
                  <option value="2026">NEET 2026</option>
                  <option value="2027">NEET 2027</option>
                  <option value="2028">NEET 2028</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Target Score
                </label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 bg-white transition"
                >
                  <option value="650+">650+ / 720</option>
                  <option value="680+">680+ / 720</option>
                  <option value="700+">700+ / 720</option>
                  <option value="720">720 (AIIMS Cutoff)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center space-x-2 transition shadow-sm ${
              loading
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-[11px] text-stone-400 text-center leading-relaxed">
          Your decks and test performance are stored securely in Firestore and synced with your account.
        </p>
      </div>
    </div>
  );
};

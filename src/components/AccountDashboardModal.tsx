import React, { useState, useEffect } from 'react';
import { UserProfile } from '../lib/firebase';
import { getCustomApiKey, setCustomApiKey, clearCustomApiKey } from '../lib/apiKeyStorage';
import { X, Key, Check, AlertCircle, Eye, EyeOff, ExternalLink, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

interface AccountDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenAuthModal?: () => void;
}

export const AccountDashboardModal: React.FC<AccountDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  onOpenAuthModal,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getCustomApiKey();
      setApiKeyInput(existing);
      setHasSavedKey(Boolean(existing));
      setValidationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTestKey = async () => {
    setValidationResult(null);
    const cleanKey = apiKeyInput.trim();

    if (!cleanKey) {
      clearCustomApiKey();
      setHasSavedKey(false);
      setValidationResult({
        success: true,
        message: 'Reverted to server default API key.',
      });
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });
      const data = await res.json();

      if (data.valid) {
        setCustomApiKey(cleanKey);
        setHasSavedKey(true);
        setValidationResult({
          success: true,
          message: 'API key validated successfully and saved locally!',
        });
      } else {
        setValidationResult({
          success: false,
          message: data.error || 'Failed to authenticate with this API key.',
        });
      }
    } catch (err: any) {
      setValidationResult({
        success: false,
        message: err?.message || 'Network error validating API key.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleClearKey = () => {
    clearCustomApiKey();
    setApiKeyInput('');
    setHasSavedKey(false);
    setValidationResult({
      success: true,
      message: 'Custom key removed. The application is now using the server default key.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-[#fbfbfa] border border-stone-300/80 rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200/80 pb-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
              Account & Engine Settings
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Manage your NEET aspirant profile and generation API credentials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-sm font-semibold">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  (user?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {user?.isAnonymous ? 'Guest Aspirant' : user?.displayName || 'NEET Aspirant'}
                </p>
                <p className="text-xs text-stone-500">
                  {user?.isAnonymous ? 'Session saved locally in Firestore' : user?.email}
                </p>
              </div>
            </div>

            {user && !user.isAnonymous ? (
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition flex items-center space-x-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            ) : onOpenAuthModal ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-md transition"
              >
                Sign in / Create Account
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
            <div className="bg-stone-50 p-2 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">
                Target Exam
              </span>
              <span className="text-stone-700 font-medium font-mono">
                NEET {user?.targetYear || '2026'}
              </span>
            </div>
            <div className="bg-stone-50 p-2 rounded-lg">
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-semibold">
                Target Score
              </span>
              <span className="text-stone-700 font-medium font-mono">
                {user?.targetScore || '680+'} / 720
              </span>
            </div>
          </div>
        </div>

        {/* Custom Gemini API Key Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-stone-700" />
              <label htmlFor="custom-api-key" className="text-xs font-medium text-stone-800">
                Gemini API Key (Optional)
              </label>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                hasSavedKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {hasSavedKey ? 'Custom Key Active' : 'Using Server Default'}
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            By default, NEET Deep-Recall runs on the server&apos;s shared Gemini key. If you encounter shared free-tier rate limits or high-demand spikes, provide your own personal Gemini API key here. It is saved locally in your browser and used exclusively for your calls.
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                id="custom-api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 pr-10 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Validation Notice */}
            {validationResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start space-x-2 ${
                  validationResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {validationResult.success ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{validationResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center space-x-1 transition underline"
              >
                <span>Get a free API key</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center space-x-2">
                {hasSavedKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAndTestKey}
                  disabled={validating}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-md transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {validating && (
                    <div className="w-3 h-3 rounded-full border border-stone-200 border-t-transparent animate-spin" />
                  )}
                  <span>{validating ? 'Validating...' : 'Save & Validate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Key stays in client localStorage</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

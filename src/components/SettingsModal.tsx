import React from 'react';
import { UserProfile } from '../lib/firebase';
import { ExternalLink, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-stone-200/90 rounded-xl w-full max-w-lg p-7 shadow-xl space-y-6 relative text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-stone-400">
            System & Quotas
          </p>
          <h2 className="font-serif text-2xl font-normal text-stone-900">
            Architecture & Rate Limits
          </h2>
        </div>

        {/* AI Studio Rate Limits */}
        <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-900">
              Live AI Studio Quota Dashboard
            </span>
            <a
              href="https://aistudio.google.com/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-medium text-stone-900 underline"
            >
              <span>View Quota</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Free-tier quotas (TPM, RPM, RPD) are project-specific. Check your live limits and token usage at{' '}
            <a
              href="https://aistudio.google.com/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-900 underline font-mono"
            >
              aistudio.google.com/rate-limit
            </a>. Generation calls are bounded strictly to 1 call per chapter to avoid hitting limits.
          </p>
        </div>

        {/* SM-2 Details */}
        <div className="space-y-1 text-xs">
          <h3 className="font-semibold text-stone-900">SuperMemo SM-2 Engine</h3>
          <p className="text-stone-600 leading-relaxed font-sans">
            Spaced repetition operates purely client-side without consuming AI quota. The algorithm tunes interval days and ease factors dynamically based on your recall quality.
          </p>
        </div>

        {/* Storage Details */}
        <div className="space-y-1 text-xs">
          <h3 className="font-semibold text-stone-900">Cloud Firestore Persistence</h3>
          <p className="text-stone-600 leading-relaxed font-sans">
            Study kits and flashcard review states are persisted under{' '}
            <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono text-[11px]">
              users/{user?.uid || 'user'}/chapters
            </code>
            , retaining progress across devices.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

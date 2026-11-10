import React from 'react';
import { UserProfile } from '../lib/firebase';
import { ChevronDown, Key, LogOut } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  dueCardCount: number;
  activeView: 'home' | 'chapter' | 'dueToday';
  onNavigateHome: () => void;
  onNavigateDueToday: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenAccountDashboard: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  dueCardCount,
  activeView,
  onNavigateHome,
  onNavigateDueToday,
  onOpenSettings,
  onOpenAuthModal,
  onOpenAccountDashboard,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fbfbfa]/90 backdrop-blur-md border-b border-stone-200/80 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Zone 1: Single Brand Wordmark in Editorial Face */}
        <div
          onClick={onNavigateHome}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center text-xs font-serif font-bold tracking-tighter">
            DR
          </div>
          <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-stone-900 group-hover:text-stone-700 transition">
            NEET Deep-Recall
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean typography, no pill enclosures) */}
        <nav className="flex items-center space-x-1 sm:space-x-3 text-sm">
          <button
            onClick={onNavigateHome}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
              activeView === 'home'
                ? 'text-stone-950 font-semibold bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Chapters
          </button>

          <button
            onClick={onNavigateDueToday}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
              activeView === 'dueToday'
                ? 'text-stone-950 font-semibold bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <span>Due Today</span>
            <span
              className={`text-xs font-tabular px-1.5 py-0.2 rounded ${
                dueCardCount > 0
                  ? 'bg-stone-900 text-stone-100 font-semibold'
                  : 'bg-stone-200/70 text-stone-600'
              }`}
            >
              {dueCardCount}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 rounded-md text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
            title="Rate Limits & Quota"
          >
            Quota
          </button>
        </nav>

        {/* Zone 3: Authentication & User Actions */}
        <div className="flex items-center space-x-2">
          {user && !user.isAnonymous ? (
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                type="button"
                onClick={onOpenAccountDashboard}
                className="flex items-center space-x-1.5 text-stone-700 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-950 cursor-pointer transition select-none group border border-transparent hover:border-stone-200"
                title="Account Profile & Custom API Key Dashboard"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full border border-stone-300 object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-[10px] font-semibold">
                    {(user.displayName?.[0] || user.email?.[0] || 'A').toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-stone-800 max-w-[130px] truncate group-hover:text-stone-950">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 transition" />
              </button>

              <button
                onClick={onSignOut}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={onOpenAccountDashboard}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition"
                title="API Key & Account Settings"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                Sign in
              </button>
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-100 transition shadow-xs"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

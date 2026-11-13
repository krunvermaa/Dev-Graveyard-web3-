import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';

const STORAGE_KEY = 'devgraveyard_cookie_consent';

export const CookieNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'acknowledged');
    } catch {
      // ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and cookies notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-xs space-y-3 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-zinc-300 font-mono font-medium">
          <Shield className="w-4 h-4 text-[#c53030] shrink-0" />
          <span>Sanctuary Storage &amp; Privacy</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-zinc-400 font-sans leading-relaxed">
        DevGraveyard utilizes local browser storage strictly for Avalanche wallet state, ambient sound preferences, and memorial crypt caching. No private code is ever inspected, sold, or shared.
      </p>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          Avalanche C-Chain
        </span>
        <button
          onClick={handleDismiss}
          className="px-3.5 py-1.5 rounded-lg bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-[0_0_15px_rgba(197,48,48,0.3)] active:scale-95"
        >
          Accept &amp; Enter
        </button>
      </div>
    </aside>
  );
};

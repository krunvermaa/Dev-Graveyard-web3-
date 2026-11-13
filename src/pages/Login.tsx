import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldCheck, ArrowLeft, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { account, loading, connectWallet, isAvalanche, switchNetwork } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#c53030]" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Checking catacomb authentication...
        </p>
      </div>
    );
  }

  if (account) {
    return <Navigate to="/home" replace />;
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await connectWallet();
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to connect Web3 wallet. Please verify MetaMask or Core is unlocked.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in relative z-10 px-4">
      {/* Ambient Crimson Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-44 bg-[#c53030]/15 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 border border-zinc-800/90 bg-zinc-950/80 backdrop-blur-md rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c53030]/60 to-transparent" />

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c53030]/40 bg-[#c53030]/10 text-xs font-mono text-[#f87171] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse" />
            <span>Avalanche Web3 Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white font-mono">
            Enter The Crypt
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
            Connect your Web3 wallet to bury abandoned projects, pay respects, and archive post-mortems on Avalanche C-Chain.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-red-300 text-xs font-mono flex items-start gap-2 shadow-inner">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 flex items-center justify-center gap-3 text-xs sm:text-sm tracking-widest font-mono uppercase bg-[#c53030] hover:bg-[#b02727] text-white rounded-xl shadow-[0_0_20px_rgba(197,48,48,0.4)] transition-all cursor-pointer font-bold"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span>{isLoggingIn ? 'Connecting...' : 'Connect Wallet'}</span>
          </Button>

          {/* Privacy features bullet list */}
          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-900 space-y-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#c53030]" />
              <span>Non-Custodial & Sovereign</span>
            </div>
            <ul className="space-y-1 list-disc pl-5 text-zinc-500">
              <li>No passwords, emails, or personal tracking.</li>
              <li>Compatible with Core, MetaMask, Rabby, Rainbow.</li>
              <li>Supported on Avalanche C-Chain &amp; Fuji testnet.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-4 text-center">
          <Link
            to="/cemetery"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Cemetery Without Connecting</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

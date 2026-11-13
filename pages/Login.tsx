import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { account, loading, connectWallet } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
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
      setError(err.message || `Failed to connect wallet`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in relative z-10">
      <div className="max-w-md w-full space-y-8 p-8 border border-zinc-800 bg-surface/50 backdrop-blur-sm rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-code-red/40 blur-sm"></div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-[#c53030] font-sans">
            Web3 Authentication
          </h1>
          <p className="text-sm text-zinc-400 font-mono">
            Connect your wallet to enter the graveyard. (Avalanche)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn} variant="secondary"
            className="w-full h-12 flex items-center justify-center space-x-3 text-sm tracking-widest font-mono border border-zinc-700 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/50 transition-all shadow-lg"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span>{isLoggingIn ? 'Connecting...' : 'Connect Wallet'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

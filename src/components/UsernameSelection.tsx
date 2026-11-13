import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkUsernameAvailability, createUserProfile } from '../services/userService';
import { Button } from './ui/Button';
import { Loader2, Check, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { AVATARS } from '../pixelAvatars';
import { playGraveSound, playRespectSound } from './Atmosphere';

const AVATAR_NAMES: Record<string, string> = {
  '/avatars/skull.svg': 'Crypt Skull',
  '/avatars/ghost.svg': 'Ethereal Ghost',
  '/avatars/reaper.svg': 'Grim Reaper',
  '/avatars/tombstone.svg': 'Ancient Headstone',
  '/avatars/lantern.svg': 'Grave Lantern',
  '/avatars/raven.svg': 'Obsidian Raven',
  '/avatars/candle.svg': 'Vigil Candle',
  '/avatars/eye.svg': 'All-Seeing Eye',
  '/avatars/crystal.svg': 'Soul Crystal',
  '/avatars/pumpkin.svg': 'Jack-o-Lantern',
};

export const UsernameSelection: React.FC = () => {
  const { account, refreshProfile, disconnectWallet } = useAuth();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
    playGraveSound();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    
    const cleanUsername = username.trim().toLowerCase();
    const validFormat = /^[a-zA-Z0-9_]{3,30}$/;
    if (!validFormat.test(cleanUsername)) {
      setError('Username must be 3-30 characters, alphanumeric or underscores.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const isAvailable = await checkUsernameAvailability(cleanUsername);
      if (!isAvailable) {
        setError('This alias has already been claimed by another soul.');
        setLoading(false);
        return;
      }
      
      await createUserProfile(account, '', cleanUsername, selectedAvatar);
      playRespectSound();
      await refreshProfile();
    } catch (err: any) {
      console.error("Failed to register persona:", err);
      setError(err?.message || 'Failed to register undertaker persona on Avalanche.');
      setLoading(false);
    }
  };

  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center relative z-10 px-4 py-8 font-sans">
      <div className="max-w-2xl w-full space-y-6 p-6 sm:p-8 border border-zinc-800 bg-zinc-950/90 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(197,48,48,0.2)] text-center relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-80" />
        
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c53030]">
            Avalanche Web3 Onboarding
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide uppercase">
            Claim Your Undertaker Alias
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-md mx-auto">
            Every gravedigger needs an identity etched into stone. Choose your emblem and name.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>Wallet:</span>
            <span className="text-emerald-400 font-semibold">{shortAddress}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2 text-left">
          
          {/* Avatar Grid */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 text-center block w-full">
              Choose Undertaker Emblem
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {AVATARS.map((avatar, idx) => {
                const isSelected = selectedAvatar === avatar;
                const name = AVATAR_NAMES[avatar] || `Emblem ${idx + 1}`;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => handleAvatarClick(avatar)}
                    className={`group/btn relative aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'border-[#c53030] bg-[#c53030]/15 scale-105 shadow-[0_0_20px_rgba(197,48,48,0.4)]' 
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                    title={name}
                  >
                    <img 
                      src={avatar} 
                      alt={name} 
                      className="w-10 h-10 object-contain filter drop-shadow-md transition-transform group-hover/btn:scale-110" 
                    />
                    <span className="text-[9px] font-mono text-zinc-400 mt-1 truncate max-w-full">
                      {name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#c53030] flex items-center justify-center text-white text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
              Gravedigger Alias (Username)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-500 font-mono text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="grim_reaper_42"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 focus:ring-1 focus:ring-[#c53030]/40 transition-colors"
                disabled={loading}
                maxLength={30}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              3 to 30 characters. Letters, numbers, and underscores only.
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              type="submit" 
              variant="danger"
              disabled={!username.trim() || loading}
              className="w-full h-12 text-xs font-mono uppercase tracking-widest font-bold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inscribing Persona to Chain...</span>
                </span>
              ) : (
                'Inscribe Undertaker Persona'
              )}
            </Button>

            <button
              type="button"
              onClick={disconnectWallet}
              className="w-full py-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-center"
            >
              Cancel &amp; Disconnect Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

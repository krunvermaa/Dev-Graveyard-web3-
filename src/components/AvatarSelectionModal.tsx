import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Loader2, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { updateAvatar } from '../services/userService';
import { AVATARS } from '../pixelAvatars';
import { playGraveSound, playRespectSound } from './Atmosphere';

interface AvatarSelectionModalProps {
  onClose: () => void;
}

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

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ onClose }) => {
  const { account, userProfile, refreshProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    userProfile?.photoURL || userProfile?.avatarUrl || AVATARS[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    playGraveSound();
  };

  const handleSave = async () => {
    if (!account || !selectedAvatar) return;
    setLoading(true);
    setError(null);
    try {
      await updateAvatar(selectedAvatar);
      playRespectSound();
      await refreshProfile();
      onClose();
    } catch (err: any) {
      console.error("Failed to update avatar:", err);
      setError(err?.message || 'Failed to update avatar on Avalanche.');
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans" role="dialog" aria-modal="true">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(197,48,48,0.25)] overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-80" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c53030]">
              Persona Selection
            </span>
            <h2 className="text-2xl font-bold font-serif text-zinc-100 tracking-wide uppercase">
              Select Your Undertaker Avatar
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Choose an immutable emblem to represent your soul across the crypt.
            </p>
          </div>

          {/* 10 Gothic Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 py-2">
            {AVATARS.map((avatar, idx) => {
              const isSelected = selectedAvatar === avatar;
              const name = AVATAR_NAMES[avatar] || `Emblem ${idx + 1}`;
              return (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleSelect(avatar)}
                  className={`group/avatar relative aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-[#c53030] bg-[#c53030]/15 scale-105 shadow-[0_0_20px_rgba(197,48,48,0.4)]' 
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 hover:scale-102'
                  }`}
                  title={name}
                >
                  <img 
                    src={avatar} 
                    alt={name} 
                    className="w-12 h-12 object-contain filter drop-shadow-md transition-transform group-hover/avatar:scale-110" 
                  />
                  <span className="text-[9px] font-mono text-zinc-400 mt-1 truncate max-w-full">
                    {name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#c53030] flex items-center justify-center text-white text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono border-l-2 border-red-500 pl-2">
              {error}
            </p>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
            <span className="text-xs font-mono text-zinc-500">
              Selected: <span className="text-zinc-200 font-bold">{selectedAvatar ? AVATAR_NAMES[selectedAvatar] || 'Custom' : 'None'}</span>
            </span>

            <div className="flex gap-2.5">
              <Button 
                variant="secondary" 
                onClick={onClose} 
                disabled={loading} 
                className="text-xs font-mono"
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={handleSave} 
                disabled={loading || !selectedAvatar || selectedAvatar === (userProfile?.photoURL || userProfile?.avatarUrl)} 
                className="text-xs font-mono font-semibold min-w-[120px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Inscribe Avatar'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

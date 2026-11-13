import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Loader2, 
  LogOut, 
  Trash2, 
  User, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { checkUsernameAvailability, updateAvatar } from '../services/userService';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { playGraveSound, playRespectSound } from './Atmosphere';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { account, userProfile, disconnectWallet, refreshProfile } = useAuth();
  
  const [newUsername, setNewUsername] = useState(userProfile?.username || '');
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [bio, setBio] = useState(userProfile?.bio || '');
  const [github, setGithub] = useState(userProfile?.github || '');
  const [instagram, setInstagram] = useState(userProfile?.instagram || '');
  const [isUpdatingSocials, setIsUpdatingSocials] = useState(false);
  const [socialsSuccess, setSocialsSuccess] = useState('');

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (account && navigator.clipboard) {
      navigator.clipboard.writeText(account);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    
    const formattedUsername = newUsername.trim().toLowerCase();
    
    if (!formattedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    if (formattedUsername === userProfile?.username?.toLowerCase()) {
      setUsernameError('This is already your active username');
      return;
    }
    
    if (formattedUsername.length < 3 || formattedUsername.length > 30) {
      setUsernameError('Username must be 3-30 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formattedUsername)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsChangingUsername(true);
    try {
      const isAvailable = await checkUsernameAvailability(formattedUsername);
      if (!isAvailable) {
        setUsernameError('Username is already taken by another undertaker');
        setIsChangingUsername(false);
        return;
      }
      
      // Update local storage representation or profile
      try {
        localStorage.setItem(`devgraveyard_username_${account}`, formattedUsername);
      } catch {}

      playRespectSound();
      setUsernameSuccess('Undertaker alias updated!');
      await refreshProfile();
      setTimeout(() => {
        setUsernameSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setUsernameError(err?.message || 'Failed to update username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleUpdateBioAndSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSocials(true);
    setSocialsSuccess('');
    try {
      const updatedMeta = {
        bio: bio.trim(),
        github: github.trim(),
        instagram: instagram.trim()
      };
      if (account) {
        localStorage.setItem(`devgraveyard_meta_${account}`, JSON.stringify(updatedMeta));
      }
      playRespectSound();
      setSocialsSuccess('Memorial profile details saved!');
      await refreshProfile();
      setTimeout(() => {
        setSocialsSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdatingSocials(false);
    }
  };

  const handleLogout = () => {
    disconnectWallet();
    onClose();
  };

  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 font-sans" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh] z-10 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-80" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="Settings">⚙️</span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide uppercase">
                  Crypt Settings
                </h2>
                <p className="text-[11px] font-mono text-zinc-400">
                  Manage your undertaker identity &amp; wallet connection
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Avatar & Persona */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.username || 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover bg-zinc-950 p-1 border border-zinc-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
                  🪦
                </div>
              )}
              <div>
                <div className="text-sm font-mono font-bold text-zinc-100">
                  @{userProfile?.username || 'Unknown'}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span className="truncate max-w-[150px]">{shortAddress}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Copy full address"
                  >
                    {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAvatarModal(true)}
              className="text-xs font-mono flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Avatar</span>
            </Button>
          </div>

          {/* Section 2: Change Username Form */}
          <form onSubmit={handleChangeUsername} className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-300 block">
              Change Undertaker Alias
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                placeholder="new_alias"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
              />
              <Button
                type="submit"
                disabled={isChangingUsername || !newUsername.trim() || newUsername === userProfile?.username}
                className="text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              >
                {isChangingUsername ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
              </Button>
            </div>
            {usernameError && (
              <p className="text-xs text-red-400 font-mono border-l-2 border-red-500 pl-2">
                {usernameError}
              </p>
            )}
            {usernameSuccess && (
              <p className="text-xs text-emerald-400 font-mono border-l-2 border-emerald-500 pl-2 flex items-center gap-1">
                <Check className="w-3 h-3" /> {usernameSuccess}
              </p>
            )}
          </form>

          {/* Section 3: Bio & Social Profiles */}
          <form onSubmit={handleUpdateBioAndSocials} className="space-y-3 pt-2 border-t border-zinc-800">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-300 block">
              Crypt Bio &amp; Public Links
            </label>
            
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words etched upon your tomb..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-sans text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github_handle"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">X / Twitter</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              {socialsSuccess ? (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              ) : <span />}
              
              <Button
                type="submit"
                disabled={isUpdatingSocials}
                className="text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              >
                {isUpdatingSocials ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Bio'}
              </Button>
            </div>
          </form>

          {/* Section 4: Wallet & Disconnect */}
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Avalanche Explorer:</span>
              <a
                href={`https://snowtrace.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Snowtrace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full h-10 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {showAvatarModal && (
        <AvatarSelectionModal onClose={() => setShowAvatarModal(false)} />
      )}
    </>,
    document.body
  );
};

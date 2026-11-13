import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Grave, Eulogy } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  pressF, 
  dropEulogy, 
  unpressF, 
  deleteEulogy, 
  deleteGrave, 
  getEulogies, 
  checkHasPressedF 
} from '../services/graveService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Loader2, 
  Share2, 
  Trash2, 
  X, 
  GitBranch, 
  Clock, 
  Send, 
  Heart, 
  MessageSquare, 
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareCardModal } from './ShareCardModal';
import { AuthPromptModal } from './AuthPromptModal';
import { playRespectSound, playGraveSound } from './Atmosphere';

interface GraveModalProps {
  grave: Grave;
  onClose: () => void;
}

export const GraveModal: React.FC<GraveModalProps> = ({ grave, onClose }) => {
  const { account, userProfile } = useAuth();
  const currentUserDisplayName = userProfile?.username || (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown');
  
  const [respects, setRespects] = useState<number>(grave.respects || 0);
  const [ripsList, setRipsList] = useState<string[]>(grave.rips || []);
  const [eulogies, setEulogies] = useState<Eulogy[]>(grave.eulogies || []);
  const [hasRespected, setHasRespected] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  
  const [eulogyText, setEulogyText] = useState('');
  const [submittingEulogy, setSubmittingEulogy] = useState(false);
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingGrave, setIsDeletingGrave] = useState(false);
  
  const [graveOwnerUsername, setGraveOwnerUsername] = useState<string | null>(
    (grave.user_id && account && grave.user_id.toLowerCase() === account.toLowerCase() && userProfile?.username) 
      ? userProfile.username 
      : grave.user_name || null
  );
  const [graveOwnerAvatar, setGraveOwnerAvatar] = useState<string | null>(grave.user_avatar || null);

  const [showShareCard, setShowShareCard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('pay respects');

  const [showRipersList, setShowRipersList] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  // Body scroll lock compensation to prevent layout shift
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Fetch eulogies & check respected status
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (!grave.eulogies || grave.eulogies.length === 0) {
          const fetched = await getEulogies(grave.id);
          if (isMounted) setEulogies(fetched);
        }
        if (account && grave.id) {
          const hasPressed = await checkHasPressedF(grave.id, account);
          if (isMounted) setHasRespected(hasPressed);
        }
      } catch (err) {
        console.error("Error loading grave modal data:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [grave.id, account]);

  // Fetch owner profile if needed
  useEffect(() => {
    if (grave.user_id && !graveOwnerUsername) {
      getUserProfile(grave.user_id).then(profile => {
        if (profile?.username) {
          setGraveOwnerUsername(profile.username);
          if (profile.photoURL) setGraveOwnerAvatar(profile.photoURL);
        }
      }).catch(() => {});
    }
  }, [grave.user_id, graveOwnerUsername]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePointerDown = () => {
    isLongPressing.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      setShowRipersList(prev => !prev);
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClickF = async (e: React.MouseEvent) => {
    if (isLongPressing.current) {
      e.preventDefault();
      return;
    }
    if (!account) {
      setAuthActionText('pay respects (Press F)');
      setShowAuthModal(true);
      return;
    }
    if (isPressing) return;

    setIsPressing(true);
    playRespectSound();

    const prevRespected = hasRespected;
    const nextRespected = !prevRespected;
    setHasRespected(nextRespected);
    setRespects(prev => nextRespected ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (nextRespected) {
        await pressF(grave.id, currentUserDisplayName);
      } else {
        await unpressF(grave.id, currentUserDisplayName);
      }
    } catch (err) {
      console.error(err);
      setHasRespected(prevRespected);
      setRespects(prev => prevRespected ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsPressing(false);
    }
  };

  const handleDropEulogy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setAuthActionText('leave an eternal eulogy');
      setShowAuthModal(true);
      return;
    }
    if (!eulogyText.trim() || submittingEulogy) return;

    setSubmittingEulogy(true);
    const textToSubmit = eulogyText.trim();
    setEulogyText('');

    try {
      const newEulogy = await dropEulogy(
        grave.id,
        textToSubmit,
        userProfile?.username || `${account.slice(0, 6)}...${account.slice(-4)}`,
        account
      );
      playRespectSound();
      setEulogies(prev => [newEulogy, ...prev]);
    } catch (err) {
      console.error("Failed to drop eulogy:", err);
      setEulogyText(textToSubmit);
    } finally {
      setSubmittingEulogy(false);
    }
  };

  const handleDeleteEulogy = async (eulogyToDelete: Eulogy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) return;
    if (confirm("Are you sure you want to erase this eulogy from stone?")) {
      setEulogies(prev => prev.filter(item => item.id !== eulogyToDelete.id));
      try {
        await deleteEulogy(grave.id, eulogyToDelete);
      } catch (err) {
        console.error("Failed to delete eulogy:", err);
        setEulogies(prev => [eulogyToDelete, ...prev]);
      }
    }
  };

  const handleDeleteGrave = async () => {
    if (!account || !grave.user_id) return;
    if (grave.user_id.toLowerCase() !== account.toLowerCase()) return;
    
    setIsDeletingGrave(true);
    try {
      await deleteGrave(grave.id);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error deleting grave:", err);
      setIsDeletingGrave(false);
      setIsConfirmingDelete(false);
    }
  };

  const isOwner = Boolean(account && grave.user_id && account.toLowerCase() === grave.user_id.toLowerCase());

  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 font-sans" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-7 flex flex-col gap-4 max-h-[92vh] overflow-y-auto overscroll-contain z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-80" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Area */}
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <div className="inline-block px-3 py-1 rounded-full border border-red-800/80 bg-red-950/60 text-red-400 text-[10px] font-mono uppercase tracking-widest shadow-sm">
              {grave.cause_of_death}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight leading-tight">
              {grave.project_name}
            </h2>

            {/* Author */}
            {graveOwnerUsername && !grave.is_anonymous ? (
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>Laid to rest on Avalanche by</span>
                <Link 
                  to={`/user/${graveOwnerUsername}`} 
                  className="text-zinc-200 hover:text-white font-semibold underline decoration-[#c53030]/60 underline-offset-4"
                  onClick={onClose}
                >
                  @{graveOwnerUsername}
                </Link>
              </p>
            ) : (
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Unmarked Memorial • Anonymous Creator
              </p>
            )}
          </div>

          <div className="w-16 h-px bg-zinc-800 mx-auto" />

          {/* Epitaph / Lessons Learned */}
          <div className="max-w-xl mx-auto w-full p-4 rounded-xl bg-black/50 border-l-4 border-[#c53030]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5">
              Epitaph &amp; Lessons Learned
            </span>
            <p className="text-sm sm:text-base text-zinc-200 font-serif italic leading-relaxed">
              "{grave.lesson_learned}"
            </p>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-zinc-800/80 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Lived For</span>
              <span className="text-xs text-zinc-200 font-bold mt-0.5 block">{grave.lived_for || "Unknown"}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 truncate">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Tech Stack</span>
              <span className="text-xs text-zinc-200 font-bold mt-0.5 block truncate" title={grave.tech_stack}>
                {grave.tech_stack || "Code"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Shelved Year</span>
              <span className="text-xs text-zinc-200 font-bold mt-0.5 block">{new Date(grave.created_at).getFullYear()}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 truncate">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">GitHub</span>
              {grave.github_link ? (
                <a
                  href={grave.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold mt-0.5 flex items-center justify-center gap-1 transition-colors truncate"
                  title="Verified GitHub Repository"
                >
                  <span>Verified</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs text-zinc-500 font-bold mt-0.5 block">Unlinked</span>
              )}
            </div>
          </div>

          {/* Action Row: Pay Respects, Share Card, Delete Grave */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {/* Press [F] to Pay Respects */}
              <button
                type="button"
                onClick={handleClickF}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                disabled={isPressing}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  hasRespected
                    ? 'bg-[#c53030] text-white border-red-500 shadow-[0_0_15px_rgba(197,48,48,0.5)]'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-[#c53030]'
                }`}
                title="Click or hold to see mourners"
              >
                <span>🌹</span>
                <span>{hasRespected ? 'Respect Paid' : 'Press [F] to Pay Respects'}</span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-xs">{respects}</span>
              </button>

              {/* Share Tombstone */}
              <button
                type="button"
                onClick={() => setShowShareCard(true)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Generate High-Res Share Card"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            </div>

            {/* Owner Delete Option */}
            {isOwner && (
              <div>
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteGrave}
                      disabled={isDeletingGrave}
                      className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-700 text-red-300 hover:bg-red-900 text-xs font-mono uppercase tracking-wider font-bold cursor-pointer"
                    >
                      {isDeletingGrave ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Erase'}
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Exhume and permanently delete tombstone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Eulogies Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#c53030]" />
                <span>Eulogies &amp; Condolences ({eulogies.length})</span>
              </span>
            </div>

            {/* Eulogy Input Box */}
            <form onSubmit={handleDropEulogy} className="flex gap-2">
              <input
                type="text"
                placeholder={account ? "Drop a parting word for this project..." : "Connect wallet to leave a eulogy..."}
                value={eulogyText}
                onChange={(e) => setEulogyText(e.target.value)}
                maxLength={280}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-sans text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
              />
              <button
                type="submit"
                disabled={submittingEulogy || !eulogyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#c53030] hover:bg-[#b02727] text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shadow-sm"
              >
                {submittingEulogy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Drop</span>
              </button>
            </form>

            {/* Eulogies List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {eulogies.length === 0 ? (
                <div className="p-4 text-center text-zinc-600 font-mono text-xs border border-dashed border-zinc-800/80 rounded-xl">
                  No eulogies spoken yet. Be the first to lay a flower upon this tomb.
                </div>
              ) : (
                eulogies.map((e) => {
                  const canDelete = Boolean(
                    account && 
                    ((e.user_id && e.user_id.toLowerCase() === account.toLowerCase()) || isOwner)
                  );
                  return (
                    <div
                      key={e.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 truncate flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-200">
                            @{e.user_name || 'Anonymous Mourner'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(e.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-sans text-zinc-300 break-words leading-relaxed">
                          {e.text}
                        </p>
                      </div>

                      {canDelete && (
                        <button
                          onClick={(evt) => handleDeleteEulogy(e, evt)}
                          className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer shrink-0"
                          title="Delete eulogy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCardModal
          grave={grave}
          respects={respects}
          eulogiesCount={eulogies.length}
          graveOwnerUsername={graveOwnerUsername}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <AuthPromptModal
          isOpen={showAuthModal}
          actionText={authActionText}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>,
    document.body
  );
};

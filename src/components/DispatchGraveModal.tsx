import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Loader2, 
  Send, 
  Check, 
  Ghost, 
  Sparkles, 
  AlertCircle,
  Users,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGraves, getGraves } from '../services/graveService';
import { findUserByUsername } from '../services/userService';
import { getContract } from '../services/web3Service';
import { Grave, Friend, SharedGrave } from '../types';
import { playRespectSound } from './Atmosphere';

interface DispatchGraveModalProps {
  isOpen: boolean;
  onClose: () => void;
  grave?: Grave | null;
  onSuccess?: (dispatch: { graveName: string; toUsername: string; toAddress?: string }) => void;
}

export const DispatchGraveModal: React.FC<DispatchGraveModalProps> = ({
  isOpen,
  onClose,
  grave: initialGrave,
  onSuccess
}) => {
  const { account, userProfile } = useAuth();

  // Data states
  const [myGraves, setMyGraves] = useState<Grave[]>([]);
  const [allGraves, setAllGraves] = useState<Grave[]>([]);
  const [following, setFollowing] = useState<{ uid: string; username: string }[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Selection states
  const [graveSourceTab, setGraveSourceTab] = useState<'my' | 'all'>('my');
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(initialGrave || null);
  const [selectedRecipient, setSelectedRecipient] = useState<{ uid: string; username: string } | null>(null);
  
  // Custom manual recipient entry
  const [customInput, setCustomInput] = useState('');
  const [resolvingRecipient, setResolvingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const [graveSearch, setGraveSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Keep selectedGrave in sync if initialGrave changes
  useEffect(() => {
    if (initialGrave) {
      setSelectedGrave(initialGrave);
    }
  }, [initialGrave]);

  // Load graves
  useEffect(() => {
    if (!isOpen || !account) return;
    let isMounted = true;
    setLoadingGraves(true);

    const fetchGraveData = async () => {
      try {
        const [userG, publicG] = await Promise.all([
          getUserGraves(account),
          getGraves()
        ]);
        if (isMounted) {
          setMyGraves(userG);
          setAllGraves(publicG);
          if (userG.length === 0 && publicG.length > 0 && !initialGrave) {
            setGraveSourceTab('all');
          }
        }
      } catch (err) {
        console.error("Error loading graves for dispatch modal:", err);
      } finally {
        if (isMounted) setLoadingGraves(false);
      }
    };

    fetchGraveData();
    return () => { isMounted = false; };
  }, [isOpen, account, initialGrave]);

  // Load followed users from contract
  useEffect(() => {
    if (!isOpen || !account) return;
    let isMounted = true;
    setLoadingFriends(true);

    const fetchSocial = async () => {
      try {
        const contract = await getContract();
        const followingAddresses: string[] = await contract.getFollowing(account);
        
        const friendsList = await Promise.all(
          followingAddresses.map(async (addr: string) => {
            try {
              const profile = await contract.getProfile(addr);
              return {
                uid: addr,
                username: profile.exists ? profile.username : `${addr.slice(0, 6)}...${addr.slice(-4)}`
              };
            } catch {
              return { uid: addr, username: `${addr.slice(0, 6)}...${addr.slice(-4)}` };
            }
          })
        );

        if (isMounted) {
          setFollowing(friendsList);
        }
      } catch (err) {
        console.error("Error loading following contacts:", err);
      } finally {
        if (isMounted) setLoadingFriends(false);
      }
    };

    fetchSocial();
    return () => { isMounted = false; };
  }, [isOpen, account]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered graves
  const filteredGraves = useMemo(() => {
    const list = graveSourceTab === 'my' ? myGraves : allGraves;
    if (!graveSearch.trim()) return list;
    const q = graveSearch.toLowerCase().trim();
    return list.filter(g => 
      (g.project_name || '').toLowerCase().includes(q) ||
      (g.cause_of_death || '').toLowerCase().includes(q) ||
      (g.tech_stack || '').toLowerCase().includes(q)
    );
  }, [graveSourceTab, myGraves, allGraves, graveSearch]);

  // Filtered friends
  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return following;
    const q = friendSearch.toLowerCase().trim();
    return following.filter(f => (f.username || '').toLowerCase().includes(q));
  }, [following, friendSearch]);

  const handleResolveCustomRecipient = async () => {
    if (!customInput.trim()) return;
    setResolvingRecipient(true);
    setRecipientError(null);

    const trimmed = customInput.trim();
    try {
      if (trimmed.startsWith('0x') && trimmed.length === 42) {
        // Direct address
        setSelectedRecipient({
          uid: trimmed.toLowerCase(),
          username: `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`
        });
        setCustomInput('');
      } else {
        // Lookup username
        const found = await findUserByUsername(trimmed);
        if (found) {
          setSelectedRecipient({ uid: found.uid, username: found.username });
          setCustomInput('');
        } else {
          setRecipientError(`No undertaker found with username @${trimmed}`);
        }
      }
    } catch {
      setRecipientError('Could not verify recipient.');
    } finally {
      setResolvingRecipient(false);
    }
  };

  const handleDispatch = async () => {
    if (!account || !selectedGrave || !selectedRecipient || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Store in local storage inbox for cross-session / demo persistence
      const newShare: SharedGrave = {
        id: `dispatch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        graveId: selectedGrave.id,
        graveName: selectedGrave.project_name,
        fromUserId: account,
        fromUsername: userProfile?.username || `${account.slice(0, 6)}...${account.slice(-4)}`,
        toUserId: selectedRecipient.uid,
        toUsername: selectedRecipient.username,
        direction: 'sent',
        createdAt: new Date().toISOString()
      };

      try {
        const stored = localStorage.getItem('devgraveyard_shared_graves');
        const list: SharedGrave[] = stored ? JSON.parse(stored) : [];
        list.unshift(newShare);
        localStorage.setItem('devgraveyard_shared_graves', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('devgraveyard_shared_graves_update'));
      } catch {}

      playRespectSound();
      setStatusMessage({
        type: 'success',
        text: `Grave dispatched to @${selectedRecipient.username}!`
      });

      onSuccess?.({
        graveName: selectedGrave.project_name,
        toUsername: selectedRecipient.username,
        toAddress: selectedRecipient.uid
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to dispatch grave.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 z-10 max-h-[90vh] overflow-y-auto font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="Dispatch">✉️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wider uppercase">
                Dispatch Grave to Friend
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Direct tombstone dispatch on Avalanche C-Chain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Grave */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-300 flex items-center justify-between">
            <span>1. Select Memorial</span>
            {selectedGrave && (
              <span className="text-emerald-400 text-[10px]">✓ Selected: {selectedGrave.project_name}</span>
            )}
          </label>

          {!initialGrave && (
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setGraveSourceTab('my')}
                className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer border ${
                  graveSourceTab === 'my' 
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Crypt ({myGraves.length})
              </button>
              <button
                type="button"
                onClick={() => setGraveSourceTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer border ${
                  graveSourceTab === 'all' 
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Public Cemetery ({allGraves.length})
              </button>
            </div>
          )}

          {loadingGraves ? (
            <div className="p-4 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#c53030]" />
              <span>Summoning graves...</span>
            </div>
          ) : filteredGraves.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
              No graves found in this crypt.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-1 border border-zinc-800 rounded-xl bg-zinc-950">
              {filteredGraves.slice(0, 15).map(g => {
                const isSelected = selectedGrave?.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrave(g)}
                    className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>🪦</span>
                      <span className="truncate">{g.project_name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({g.cause_of_death})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Recipient */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-300 flex items-center justify-between">
            <span>2. Choose Friend or Enter Address</span>
            {selectedRecipient && (
              <span className="text-emerald-400 text-[10px]">✓ Recipient: @{selectedRecipient.username}</span>
            )}
          </label>

          {/* Followed friends list */}
          {loadingFriends ? (
            <div className="p-3 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#c53030]" />
              <span>Finding followed contacts...</span>
            </div>
          ) : following.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
              {following.map(f => {
                const isSelected = selectedRecipient?.uid === f.uid;
                return (
                  <button
                    key={f.uid}
                    type="button"
                    onClick={() => setSelectedRecipient(f)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#c53030] border-red-500 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <Users className="w-3 h-3 text-zinc-400" />
                    <span>@{f.username}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] font-mono text-zinc-500 italic">
              You aren't following anyone yet. Enter a username or 0x wallet address below:
            </p>
          )}

          {/* Manual username or wallet entry */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Enter username (e.g. shadow_dev) or 0x... address"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleResolveCustomRecipient();
                }
              }}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
            />
            <button
              type="button"
              onClick={handleResolveCustomRecipient}
              disabled={resolvingRecipient || !customInput.trim()}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-lg border border-zinc-700 disabled:opacity-50 cursor-pointer"
            >
              {resolvingRecipient ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Set'}
            </button>
          </div>

          {recipientError && (
            <p className="text-xs text-red-400 font-mono border-l-2 border-red-500 pl-2">
              {recipientError}
            </p>
          )}
        </div>

        {/* Status feedback */}
        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            disabled={!selectedGrave || !selectedRecipient || isSubmitting}
            className="px-5 py-2 rounded-lg bg-[#c53030] hover:bg-[#b02727] text-white text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Memorial</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

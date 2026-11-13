import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { findUserByUsername, followUser, unfollowUser } from '../services/userService';
import { getContract } from '../services/web3Service';
import { Button } from './ui/Button';
import { Loader2, UserPlus, UserMinus, Search, Users, ExternalLink, Send, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DispatchGraveModal } from './DispatchGraveModal';
import { playRespectSound } from './Atmosphere';

interface SocialContact {
  uid: string;
  username: string;
  avatarUrl?: string;
}

export const FriendsManager: React.FC = () => {
  const { account, userProfile } = useAuth();
  const [following, setFollowing] = useState<SocialContact[]>([]);
  const [followers, setFollowers] = useState<SocialContact[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SocialContact | null>(null);
  const [searchError, setSearchError] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmUnfollowId, setConfirmUnfollowId] = useState<string | null>(null);
  
  // Dispatch modal trigger
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  const loadData = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const contract = await getContract();
      
      const followersAddresses: string[] = await contract.getFollowers(account);
      const followingAddresses: string[] = await contract.getFollowing(account);
      
      const followersData = await Promise.all(
        followersAddresses.map(async (addr: string) => {
          try {
            const profile = await contract.getProfile(addr);
            return { 
              uid: addr, 
              username: profile.exists ? profile.username : `${addr.slice(0, 6)}...${addr.slice(-4)}`,
              avatarUrl: profile.exists ? profile.avatarUrl : undefined
            };
          } catch {
            return { uid: addr, username: `${addr.slice(0, 6)}...${addr.slice(-4)}` };
          }
        })
      );
      
      const followingData = await Promise.all(
        followingAddresses.map(async (addr: string) => {
          try {
            const profile = await contract.getProfile(addr);
            return { 
              uid: addr, 
              username: profile.exists ? profile.username : `${addr.slice(0, 6)}...${addr.slice(-4)}`,
              avatarUrl: profile.exists ? profile.avatarUrl : undefined
            };
          } catch {
            return { uid: addr, username: `${addr.slice(0, 6)}...${addr.slice(-4)}` };
          }
        })
      );
      
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      console.error("Error loading social data from Avalanche:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !userProfile || !account) return;
    
    const query = searchQuery.trim();
    if (query.toLowerCase() === userProfile.username?.toLowerCase() || query.toLowerCase() === account.toLowerCase()) {
      setSearchError("You cannot follow your own crypt.");
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      if (query.startsWith('0x') && query.length === 42) {
        // Direct address lookup
        const contract = await getContract();
        const profile = await contract.getProfile(query);
        setSearchResult({
          uid: query.toLowerCase(),
          username: profile.exists ? profile.username : `${query.slice(0, 6)}...${query.slice(-4)}`,
          avatarUrl: profile.exists ? profile.avatarUrl : undefined
        });
      } else {
        // Username lookup
        const result = await findUserByUsername(query);
        if (result) {
          const contract = await getContract();
          let avatarUrl = undefined;
          try {
            const profile = await contract.getProfile(result.uid);
            if (profile.exists) avatarUrl = profile.avatarUrl;
          } catch {}
          setSearchResult({ uid: result.uid, username: result.username, avatarUrl });
        } else {
          setSearchError(`No undertaker found matching "${query}".`);
        }
      }
    } catch (err) {
      setSearchError('Error searching for undertaker.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFollow = async (targetUser: SocialContact) => {
    if (!account) return;
    setActionLoadingId(targetUser.uid);
    try {
      await followUser(account, userProfile?.username || account, targetUser.uid, targetUser.username);
      playRespectSound();
      await loadData();
      setSearchResult(null);
      setSearchQuery('');
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!account) return;
    if (confirmUnfollowId === targetId) {
      setActionLoadingId(targetId);
      try {
        await unfollowUser(account, targetId);
        setConfirmUnfollowId(null);
        await loadData();
      } catch (err) {
        console.error("Unfollow error:", err);
      } finally {
        setActionLoadingId(null);
      }
    } else {
      setConfirmUnfollowId(targetId);
      setTimeout(() => {
        setConfirmUnfollowId((prev) => (prev === targetId ? null : prev));
      }, 4000);
    }
  };

  const isUserFollowing = (uid: string) => following.some(f => f.uid.toLowerCase() === uid.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <Users className="w-5 h-5 text-[#c53030]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100">
              Covens &amp; Companions
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Decentralized social mourning on Avalanche C-Chain
            </p>
          </div>
        </div>

        <button
          onClick={() => setDispatchModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Grave</span>
        </button>
      </div>

      {/* Main Grid: Search Box & Follow Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Search & Add */}
        <div className="space-y-4">
          <div className="p-5 border border-zinc-800 bg-zinc-950/70 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Summon Undertaker by Name or Address</span>
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username or 0x address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
              />
              <Button 
                type="submit" 
                disabled={searchLoading || !searchQuery.trim()} 
                className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 text-xs px-3"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </form>

            {searchError && (
              <p className="text-xs text-red-400 font-mono border-l-2 border-red-500 pl-2">
                {searchError}
              </p>
            )}

            {searchResult && (
              <div className="p-3.5 bg-black/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5 truncate">
                  {searchResult.avatarUrl ? (
                    <img
                      src={searchResult.avatarUrl}
                      alt={searchResult.username}
                      className="w-7 h-7 rounded-full object-cover bg-zinc-950 p-0.5 border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                      👤
                    </div>
                  )}
                  <div className="truncate">
                    <Link
                      to={`/user/${searchResult.username}`}
                      className="text-xs font-mono font-bold text-zinc-100 hover:text-red-400 transition-colors truncate block"
                    >
                      @{searchResult.username}
                    </Link>
                    <span className="text-[10px] font-mono text-zinc-500 truncate block">
                      {searchResult.uid.slice(0, 6)}...{searchResult.uid.slice(-4)}
                    </span>
                  </div>
                </div>

                {isUserFollowing(searchResult.uid) ? (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Following
                  </span>
                ) : (
                  <Button
                    onClick={() => handleFollow(searchResult)}
                    disabled={actionLoadingId === searchResult.uid}
                    className="h-8 px-3 text-xs bg-[#c53030] hover:bg-[#b02727] text-white flex items-center gap-1.5"
                  >
                    {actionLoadingId === searchResult.uid ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    <span>Follow</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Following & Followers Tabs */}
        <div className="space-y-4">
          <div className="p-5 border border-zinc-800 bg-zinc-950/70 rounded-2xl space-y-4">
            
            {/* Tab switch */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <button
                onClick={() => setActiveTab('following')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === 'following'
                    ? 'bg-[#c53030]/20 text-white font-bold border border-[#c53030]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Following ({following.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === 'followers'
                    ? 'bg-[#c53030]/20 text-white font-bold border border-[#c53030]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Followers ({followers.length})
              </button>
            </div>

            {loading ? (
              <div className="p-8 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#c53030]" />
                <span>Consulting the ledger...</span>
              </div>
            ) : (activeTab === 'following' ? following : followers).length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-xl">
                {activeTab === 'following'
                  ? 'You are not following any crypts yet.'
                  : 'No mourners are following your crypt yet.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(activeTab === 'following' ? following : followers).map((contact) => (
                  <div
                    key={contact.uid}
                    className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {contact.avatarUrl ? (
                        <img
                          src={contact.avatarUrl}
                          alt={contact.username}
                          className="w-7 h-7 rounded-full object-cover bg-zinc-950 p-0.5 border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                          👤
                        </div>
                      )}
                      <div className="truncate">
                        <Link
                          to={`/user/${contact.username}`}
                          className="text-xs font-mono font-bold text-zinc-200 hover:text-white transition-colors truncate block"
                        >
                          @{contact.username}
                        </Link>
                        <span className="text-[10px] font-mono text-zinc-500 truncate block">
                          {contact.uid.slice(0, 6)}...{contact.uid.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {activeTab === 'following' && (
                        <button
                          onClick={() => handleUnfollow(contact.uid)}
                          disabled={actionLoadingId === contact.uid}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                            confirmUnfollowId === contact.uid
                              ? 'bg-red-950 border-red-500 text-red-200'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {actionLoadingId === contact.uid ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : confirmUnfollowId === contact.uid ? (
                            'Confirm?'
                          ) : (
                            'Unfollow'
                          )}
                        </button>
                      )}
                      {activeTab === 'followers' && !isUserFollowing(contact.uid) && (
                        <button
                          onClick={() => handleFollow(contact)}
                          disabled={actionLoadingId === contact.uid}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#c53030] hover:bg-[#b02727] text-white border border-red-500 cursor-pointer"
                        >
                          Follow back
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchModalOpen && (
        <DispatchGraveModal
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { findUserByUsername, removeFollower, unfollowUser } from '../services/userService';
import { getContract } from '../services/web3Service';
import { Button } from './ui/Button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FriendsManager: React.FC = () => {
  const { account, userProfile } = useAuth();
  const [following, setFollowing] = useState<{uid: string, username?: string}[]>([]);
  const [followers, setFollowers] = useState<{uid: string, username?: string}[]>([]);
  
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{uid: string, username: string} | null>(null);
  const [searchError, setSearchError] = useState('');
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const contract = await getContract();
      
      const followersAddresses = await contract.getFollowers(account);
      const followingAddresses = await contract.getFollowing(account);
      
      const followersData = await Promise.all(followersAddresses.map(async (addr: string) => {
         try {
            const profile = await contract.getProfile(addr);
            return { uid: addr, username: profile.exists ? profile.username : addr };
         } catch { return { uid: addr, username: addr }; }
      }));
      
      const followingData = await Promise.all(followingAddresses.map(async (addr: string) => {
         try {
            const profile = await contract.getProfile(addr);
            return { uid: addr, username: profile.exists ? profile.username : addr };
         } catch { return { uid: addr, username: addr }; }
      }));
      
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      console.error("Error loading social data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim() || !userProfile) return;
    
    if (searchUsername.toLowerCase() === userProfile.username) {
      setSearchError("You can't add yourself.");
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const result = await findUserByUsername(searchUsername);
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('User not found.');
      }
    } catch (err) {
      setSearchError('Error searching for user.');
    } finally {
      setSearchLoading(false);
    }
  };


  const [confirmUnfollowId, setConfirmUnfollowId] = useState<string | null>(null);
  const [confirmFollowerId, setConfirmFollowerId] = useState<string | null>(null);

  const handleUnfollow = async (targetId: string) => {
    if (!account) return;
    if (confirmUnfollowId === targetId) {
      try {
        await unfollowUser(account, targetId);
        setConfirmUnfollowId(null);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    } else {
      setConfirmUnfollowId(targetId);
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!account) return;
    if (confirmFollowerId === followerId) {
      try {
        await removeFollower(account, followerId);
        setConfirmFollowerId(null);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    } else {
      setConfirmFollowerId(followerId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold font-sans text-zinc-200">
          Covens & Contacts
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Following & Search */}
        <div className="space-y-6">
          <div className="p-6 border border-[#c53030]/20 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Find User</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search username..."
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-colors"
              />
              <Button type="submit" disabled={searchLoading || !searchUsername.trim()} className="bg-zinc-800 text-white border-zinc-700 hover:border-[#c53030]/50 text-xs px-3">
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            {searchError && <p className="text-xs text-code-red font-mono">{searchError}</p>}
            {searchResult && (
               <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded-lg">
                <Link to={`/user/${searchResult.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4">
                  @{searchResult.username}
                </Link>
                <Link to={`/user/${searchResult.username}`}>
                  <Button className="bg-[#c53030]/20 text-[#c53030] border border-[#c53030]/30 hover:bg-[#c53030]/30 h-8 text-xs">
                    View Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Following ({following.length})</h3>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : following.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">Not following anyone.</p>
            ) : (
              <ul className="space-y-2">
                {following.map(user => (
                  <li key={user.uid} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <Link to={`/user/${user.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4 break-all">
                      @{user.username}
                    </Link>
                    <div className="flex gap-2">
                      {confirmUnfollowId === user.uid ? (
                        <>
                          <Button onClick={() => setConfirmUnfollowId(null)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700">
                            Cancel
                          </Button>
                          <Button onClick={() => handleUnfollow(user.uid)} className="h-7 px-2 text-[10px] bg-code-red/20 text-code-red border border-code-red/30 hover:bg-code-red/30">
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleUnfollow(user.uid)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-code-red/20 hover:text-code-red hover:border-code-red/30">
                          Unfollow
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Followers */}
        <div className="space-y-6">
          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Followers ({followers.length})</h3>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : followers.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">No followers yet.</p>
            ) : (
              <ul className="space-y-2">
                {followers.map(follower => (
                  <li key={follower.uid} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    {follower.username ? (
                      <Link to={`/user/${follower.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4 break-all">
                        @{follower.username}
                      </Link>
                    ) : (
                      <span className="text-sm text-zinc-500 font-mono">Unknown user</span>
                    )}
                    <div className="flex gap-2">
                      {confirmFollowerId === follower.uid ? (
                        <>
                          <Button onClick={() => setConfirmFollowerId(null)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700">
                            Cancel
                          </Button>
                          <Button onClick={() => handleRemoveFollower(follower.uid)} className="h-7 px-2 text-[10px] bg-code-red/20 text-code-red border border-code-red/30 hover:bg-code-red/30">
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleRemoveFollower(follower.uid)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-code-red/20 hover:text-code-red hover:border-code-red/30">
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

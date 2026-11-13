import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findUserByUsername, followUser, unfollowUser, getUserProfile } from '../services/userService';
import { getUserGraves, getGraves, checkHasPressedF } from '../services/graveService';
import { Grave, User } from '../types';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageCircle, 
  Flame, 
  UserPlus, 
  UserMinus,
  ArrowLeft,
  Ghost
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getContract } from '../services/web3Service';

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const UserProfile: React.FC = () => {
  const { username: identifier } = useParams<{ username: string }>();
  const { account, userProfile: myProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'buried' | 'respected'>('buried');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [buriedGraves, setBuriedGraves] = useState<Grave[]>([]);
  const [respectedGraves, setRespectedGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);

  // If viewing own username, redirect to /profile
  if (myProfile?.username && identifier && myProfile.username.toLowerCase() === identifier.toLowerCase()) {
    return <Navigate to="/profile" replace />;
  }

  useEffect(() => {
    if (!identifier) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        let foundUser: User | null = null;

        // Try lookup by address or by username
        if (identifier.startsWith('0x')) {
          foundUser = await getUserProfile(identifier);
        } else {
          const userMeta = await findUserByUsername(identifier);
          if (userMeta) {
            foundUser = await getUserProfile(userMeta.uid);
          }
        }

        if (!foundUser) {
          // Fallback user object
          foundUser = {
            uid: identifier,
            username: identifier,
            createdAt: new Date().toISOString()
          };
        }

        setProfileUser(foundUser);
        
        // Fetch user's buried graves
        const userGraves = await getUserGraves(foundUser.uid);
        setBuriedGraves(userGraves);

        // Fetch respected graves
        const allGraves = await getGraves();
        const respected = allGraves.filter(g => 
          g.rips && g.rips.includes(foundUser!.username)
        );
        setRespectedGraves(respected);

        // Fetch following / follower counts
        try {
          const contract = await getContract();
          const followers = await contract.getFollowers(foundUser.uid);
          const following = await contract.getFollowing(foundUser.uid);
          setFollowersCount(followers.length);
          setFollowingCount(following.length);

          if (account) {
            const followingStatus = await contract.isFollowing(account, foundUser.uid);
            setIsFollowing(followingStatus);
          }
        } catch (e) {
          // Handled gracefully
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [identifier, account]);

  const handleFollowToggle = async () => {
    if (!account || !profileUser) {
      alert("Please connect your wallet first.");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(account, profileUser.uid);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(account, myProfile?.username || 'Undertaker', profileUser.uid, profileUser.username);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  const copyAddress = () => {
    if (!profileUser?.uid) return;
    navigator.clipboard.writeText(profileUser.uid);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const totalRespects = useMemo(() => {
    return buriedGraves.reduce((sum, g) => sum + (g.respects || 0), 0);
  }, [buriedGraves]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 text-[#c53030] animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Summoning undertaker crypt from Avalanche...
        </p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <Ghost className="w-16 h-16 text-zinc-700 animate-pulse" />
        <h2 className="text-2xl font-mono font-bold text-white">Undertaker Not Found</h2>
        <p className="text-zinc-500 font-mono text-xs max-w-sm">
          No records in the cemetery archives match this developer.
        </p>
        <Link to="/cemetery">
          <Button variant="secondary" className="border-zinc-800 text-[#c53030] hover:border-[#c53030]/50 font-mono text-xs uppercase">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Return to Cemetery
          </Button>
        </Link>
      </div>
    );
  }

  const displayedGraves = activeTab === 'buried' ? buriedGraves : respectedGraves;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto pb-16 pt-2 px-4 sm:px-6 relative z-10 mb-20"
    >
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <Link 
          to="/cemetery" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cemetery</span>
        </Link>

        {/* Profile Card */}
        <div className="p-6 sm:p-8 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#c53030]/60 to-zinc-800" />
          
          {/* Undertaker Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-zinc-700 overflow-hidden bg-zinc-900 shadow-xl shrink-0 flex items-center justify-center">
            {profileUser.photoURL ? (
              <img src={profileUser.photoURL} alt={profileUser.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-[#c53030] font-serif uppercase">
                {profileUser.username.charAt(0)}
              </span>
            )}
          </div>
          
          {/* User Details */}
          <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-sans text-white">
                  @{profileUser.username}
                </h1>
                
                {/* Wallet Address Badge */}
                {profileUser.uid.startsWith('0x') && (
                  <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-black/60 border border-zinc-800 text-xs font-mono text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{profileUser.uid.slice(0, 6)}...{profileUser.uid.slice(-4)}</span>
                    <button 
                      type="button"
                      onClick={copyAddress}
                      className="hover:text-white transition-colors cursor-pointer" 
                      title="Copy Address"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a 
                      href={`https://snowtrace.io/address/${profileUser.uid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      title="View on Snowtrace Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Follow Button */}
              {account && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  variant={isFollowing ? "secondary" : "default"}
                  className={`text-xs font-mono uppercase px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 ${
                    isFollowing 
                      ? 'border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400' 
                      : 'bg-[#c53030] hover:bg-[#b02727] text-white shadow-md'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow Undertaker</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              "{profileUser.bio || "Passionate builder. Honoring lessons from the crypt."}"
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {profileUser.github && (
                <a
                  href={profileUser.github.startsWith('http') ? profileUser.github : `https://github.com/${profileUser.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-zinc-300" />
                  <span>GitHub</span>
                </a>
              )}
              {profileUser.instagram && (
                <a
                  href={profileUser.instagram.startsWith('http') ? profileUser.instagram : `https://instagram.com/${profileUser.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
              {profileUser.whatsapp && (
                <a
                  href={profileUser.whatsapp.startsWith('http') ? profileUser.whatsapp : `https://wa.me/${profileUser.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            {/* Metrics Bar */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 sm:gap-8 pt-2 border-t border-zinc-900">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold font-mono text-white">{buriedGraves.length}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Graves Buried</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1 text-[#c53030]">
                  <Flame className="w-4 h-4" />
                  <span className="text-xl font-bold font-mono text-white">{totalRespects}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Respects Earned</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold font-mono text-white">{followingCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Following</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold font-mono text-white">{followersCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: "Buried Projects" and "Respected Graves" */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('buried')}
              className={`text-sm sm:text-base font-mono uppercase tracking-wider transition-colors pb-1 cursor-pointer ${
                activeTab === 'buried'
                  ? 'text-white border-b-2 border-[#c53030] font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Buried Projects ({buriedGraves.length})
            </button>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={() => setActiveTab('respected')}
              className={`text-sm sm:text-base font-mono uppercase tracking-wider transition-colors pb-1 cursor-pointer ${
                activeTab === 'respected'
                  ? 'text-white border-b-2 border-[#c53030] font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Respected Graves ({respectedGraves.length})
            </button>
          </div>

          {displayedGraves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 border border-zinc-800/60 bg-surface/30 rounded-2xl text-center space-y-3">
              <span className="text-4xl" role="img" aria-label="tombstone">🪦</span>
              <h3 className="text-lg font-bold font-mono text-zinc-200">
                {activeTab === 'buried' ? 'No Buried Projects' : 'No Respected Graves'}
              </h3>
              <p className="text-zinc-500 font-mono text-xs max-w-sm">
                This undertaker has no public records in this section yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-32 md:gap-y-40 mt-10">
              {displayedGraves.map((grave) => (
                <GraveCard 
                  key={grave.id} 
                  grave={grave} 
                  onClick={() => setSelectedGrave(grave)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

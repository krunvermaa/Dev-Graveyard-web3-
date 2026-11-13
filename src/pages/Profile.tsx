import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Grave } from '../types';
import { getUserGraves, getGraves, checkHasPressedF } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { FriendsManager } from '../components/FriendsManager';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageCircle, 
  Flame, 
  Trophy,
  Edit3
} from 'lucide-react';
import { AvatarSelectionModal } from '../components/AvatarSelectionModal';
import { SettingsModal } from '../components/SettingsModal';
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

export const Profile: React.FC = () => {
  const { account, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'buried' | 'respected'>('buried');
  const [buriedGraves, setBuriedGraves] = useState<Grave[]>([]);
  const [respectedGraves, setRespectedGraves] = useState<Grave[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Bio state (stored locally or on profile)
  const [bio, setBio] = useState<string>(() => {
    if (userProfile?.bio) return userProfile.bio;
    if (account) {
      return localStorage.getItem(`devgraveyard_bio_${account}`) || "Crypt Undertaker & Code Archeologist. Honoring the fallen builds.";
    }
    return "Crypt Undertaker & Code Archeologist. Honoring the fallen builds.";
  });

  // Social Links
  const socialLinks = useMemo(() => {
    const savedGithub = account ? localStorage.getItem(`devgraveyard_github_${account}`) : null;
    const savedInstagram = account ? localStorage.getItem(`devgraveyard_instagram_${account}`) : null;
    const savedWhatsapp = account ? localStorage.getItem(`devgraveyard_whatsapp_${account}`) : null;

    return {
      github: userProfile?.github || savedGithub || (localStorage.getItem('devgraveyard_gh_username') ? `https://github.com/${localStorage.getItem('devgraveyard_gh_username')}` : null),
      instagram: userProfile?.instagram || savedInstagram,
      whatsapp: userProfile?.whatsapp || savedWhatsapp,
    };
  }, [userProfile, account]);

  useEffect(() => {
    if (account) {
      setLoadingGraves(true);
      // Fetch user's buried graves
      getUserGraves(account).then((data) => {
        setBuriedGraves(data);
      });

      // Fetch all graves and check which ones this account respected
      getGraves().then(async (allGraves) => {
        const respected: Grave[] = [];
        for (const g of allGraves) {
          const hasRespected = await checkHasPressedF(g.id, account);
          if (hasRespected || (g.rips && g.rips.includes(userProfile?.username || ''))) {
            respected.push(g);
          }
        }
        setRespectedGraves(respected);
        setLoadingGraves(false);
      }).catch(() => setLoadingGraves(false));
      
      const loadSocials = async () => {
        try {
          const contract = await getContract();
          const followers = await contract.getFollowers(account);
          const following = await contract.getFollowing(account);
          setFollowersCount(followers.length);
          setFollowingCount(following.length);
        } catch(e) {
          // Fallback gracefully
        }
      };
      loadSocials();
    }
  }, [account, userProfile]);

  const copyWalletAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const totalRespectsReceived = useMemo(() => {
    return buriedGraves.reduce((sum, g) => sum + (g.respects || 0), 0);
  }, [buriedGraves]);

  const techStats = useMemo(() => {
    const stats: Record<string, number> = {};
    buriedGraves.forEach(grave => {
      if (grave.tech_stack) {
        const tags = grave.tech_stack.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => {
          stats[tag] = (stats[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [buriedGraves]);

  if (loading) return null;
  if (!account) return <Navigate to="/login" replace />;

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
        {showAvatarModal && (
          <AvatarSelectionModal onClose={() => setShowAvatarModal(false)} />
        )}
        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-2 text-center pt-4 pb-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-white font-serif uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
            My Yard
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm uppercase tracking-widest">
            Your Personal Necrological Crypt on Avalanche
          </p>
        </header>

        {/* Undertaker Profile Card */}
        <div className="p-6 sm:p-8 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#c53030]/60 to-zinc-800" />
          
          {/* Undertaker Avatar */}
          <button 
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-zinc-700 overflow-hidden bg-zinc-900 shadow-xl hover:border-[#c53030] transition-all cursor-pointer shrink-0"
            title="Click to change avatar"
          >
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-4xl text-[#c53030] font-serif uppercase">
                  {userProfile?.username?.charAt(0) || account.charAt(2) || '?'}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Edit
              </span>
            </div>
          </button>
          
          {/* User Details */}
          <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white">
                  @{userProfile?.username || 'Undertaker'}
                </h2>
                
                {/* Wallet Address Badge */}
                <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-black/60 border border-zinc-800 text-xs font-mono text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                  <button 
                    type="button"
                    onClick={copyWalletAddress}
                    className="hover:text-white transition-colors cursor-pointer" 
                    title="Copy Address"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a 
                    href={`https://snowtrace.io/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    title="View on Snowtrace Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Button
                variant="secondary"
                onClick={() => setShowSettingsModal(true)}
                className="text-xs font-mono uppercase border-zinc-700 hover:border-[#c53030] flex items-center gap-1.5 px-4 py-2 self-center md:self-start rounded-xl cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#c53030]" />
                <span>Edit Profile</span>
              </Button>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              "{bio}"
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {socialLinks.github && (
                <a
                  href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://github.com/${socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-zinc-300" />
                  <span>GitHub</span>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
              {!socialLinks.github && !socialLinks.instagram && !socialLinks.whatsapp && (
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                >
                  + Add Social Links
                </button>
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
                  <span className="text-xl font-bold font-mono text-white">{totalRespectsReceived}</span>
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

        {/* Tech Stack Distribution */}
        {techStats.length > 0 && (
          <div className="space-y-4 bg-zinc-950/40 p-5 sm:p-6 rounded-3xl border border-zinc-800/40 backdrop-blur-sm shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Tech Stack Graveyard
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {techStats.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-zinc-300 font-mono">{tag}</span>
                  <span className="text-[10px] font-mono font-bold text-[#c53030] bg-[#c53030]/10 px-1.5 py-0.5 rounded-md">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tabs: "Buried Projects" and "Respected Graves" */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
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

            {activeTab === 'buried' && (
              <Link to="/submit">
                <Button className="h-8 px-3 text-xs font-mono uppercase bg-[#c53030] hover:bg-[#b02727] text-white rounded-lg">
                  + Bury Project
                </Button>
              </Link>
            )}
          </div>

          {loadingGraves ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#c53030] animate-spin" />
            </div>
          ) : displayedGraves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 border border-[#c53030]/20 bg-surface/30 rounded-2xl text-center space-y-3">
              <span className="text-4xl" role="img" aria-label="tombstone">🪦</span>
              <h3 className="text-lg font-bold font-mono text-zinc-200">
                {activeTab === 'buried' ? 'No Buried Projects Yet' : 'No Respected Graves Yet'}
              </h3>
              <p className="text-zinc-500 font-mono text-xs max-w-sm">
                {activeTab === 'buried' 
                  ? "Your catacomb is empty. Lay your first abandoned repository to rest."
                  : "Explore the cemetery and press F to pay homage to departed builds."}
              </p>
              {activeTab === 'buried' ? (
                <Link to="/submit">
                  <Button className="mt-2 text-xs font-mono uppercase bg-[#c53030] hover:bg-[#b02727]">
                    Bury a Project
                  </Button>
                </Link>
              ) : (
                <Link to="/cemetery">
                  <Button variant="secondary" className="mt-2 text-xs font-mono uppercase border-zinc-700">
                    Visit Cemetery
                  </Button>
                </Link>
              )}
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

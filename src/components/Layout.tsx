import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atmosphere, toggleGothicAudio, gothicAudio } from './Atmosphere';
import { SoulBackground } from './SoulBackground';
import { CookieNotice } from './CookieNotice';
import { useAuth } from '../contexts/AuthContext';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { 
  Home as HomeIcon, 
  PlusCircle, 
  Ghost, 
  MessageSquare, 
  Trophy, 
  Clock, 
  User, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Wallet, 
  ExternalLink,
  Users,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { account, userProfile, connectWallet, disconnectWallet } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [networkName, setNetworkName] = useState('Avalanche C-Chain');

  // Track route change: close menus
  useEffect(() => {
    setMobileMenuOpen(false);
    setWalletDropdownOpen(false);
  }, [location.pathname]);

  // Sync ambient audio state
  useEffect(() => {
    setIsAudioActive(gothicAudio.isActive());

    const handleAudioChange = (e: any) => {
      setIsAudioActive(!!e.detail?.isPlaying);
    };

    window.addEventListener('devgraveyard-audio-change', handleAudioChange);
    return () => {
      window.removeEventListener('devgraveyard-audio-change', handleAudioChange);
    };
  }, []);

  // Detect network if window.ethereum exists
  useEffect(() => {
    const detectChain = async () => {
      if (window.ethereum?.request) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId === '0xa869' || chainId === 43113) {
            setNetworkName('Fuji Testnet');
          } else if (chainId === '0xa86a' || chainId === 43114) {
            setNetworkName('Avalanche C-Chain');
          } else {
            setNetworkName('Avalanche');
          }
        } catch {}
      }
    };
    detectChain();
  }, [account]);

  const handleToggleAudio = () => {
    const active = toggleGothicAudio();
    setIsAudioActive(active);
  };

  const handleConnect = async () => {
    setIsConnectingWallet(true);
    try {
      await connectWallet();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text selection:bg-[#c53030]/20 selection:text-[#c53030] overflow-x-hidden font-sans">
      {/* Background layers */}
      <Atmosphere />
      <SoulBackground />
      <div className="fixed inset-0 bg-gradient-radial from-transparent to-background/90 pointer-events-none z-0" />
      
      {/* Top Header */}
      <header className="sticky top-0 inset-x-0 z-[90] border-b border-border/40 bg-zinc-950/85 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <Link 
            to={account ? "/home" : "/"} 
            className="flex items-center gap-2.5 sm:gap-3 text-zinc-200 hover:text-white transition-colors group shrink-0"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-surface border border-zinc-800 group-hover:border-[#c53030]/60 transition-colors duration-300 shadow-inner">
              <span className="text-xl sm:text-2xl leading-none opacity-90 group-hover:opacity-100" role="img" aria-label="grave">🪦</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base sm:text-lg md:text-xl uppercase font-mono group-hover:text-[#ef4444] transition-colors duration-300 text-[#c53030]">
                Dev Graveyard
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {networkName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {account ? (
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              <Link
                to="/home"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/home' || location.pathname === '/'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <HomeIcon className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Cemetery</span>
              </Link>

              <Link
                to="/submit"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/submit'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Bury Project</span>
              </Link>

              <Link
                to="/confessions"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/confessions'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Ghost className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Confessions</span>
              </Link>

              <Link
                to="/chats"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/chats'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Inbox</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/leaderboard'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Pantheon</span>
              </Link>

              <Link
                to="/collaborations"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/collaborations'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span>Collabs</span>
              </Link>

              <Link
                to="/profile"
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  location.pathname === '/profile'
                    ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c53030]/60'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
                <span className="uppercase truncate max-w-[120px]">
                  @{userProfile?.username || 'CRYPT'}
                </span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                to="/confessions"
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 font-mono text-xs text-zinc-300 hover:text-white transition-colors"
              >
                Confessions
              </Link>
              <Link
                to="/leaderboard"
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 font-mono text-xs text-zinc-300 hover:text-white transition-colors"
              >
                Pantheon
              </Link>
            </nav>
          )}

          {/* Right Controls: Ambient Audio Toggle & Wallet Button */}
          <div className="flex items-center gap-2">
            
            {/* Ambient Audio Synth Button with Animated Wave */}
            <button
              onClick={handleToggleAudio}
              className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                isAudioActive
                  ? 'bg-[#c53030]/20 border-[#c53030] text-white shadow-[0_0_15px_rgba(197,48,48,0.4)]'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title={isAudioActive ? "Mute Gothic Ambient Drone" : "Turn ON Gothic Ambient Drone"}
              aria-label="Toggle Gothic ambient sound"
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
                  {/* Haunting Audio Waveform Animation */}
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-0.5 bg-[#ef4444] animate-[bounce_1.2s_infinite_ease-in-out] h-2" />
                    <span className="w-0.5 bg-[#ef4444] animate-[bounce_0.8s_infinite_ease-in-out_0.2s] h-3.5" />
                    <span className="w-0.5 bg-[#ef4444] animate-[bounce_1.4s_infinite_ease-in-out_0.4s] h-1.5" />
                  </div>
                  <span className="hidden sm:inline text-[11px]">HYMN</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline text-[11px]">SOUND OFF</span>
                </>
              )}
            </button>

            {/* Web3 Wallet Button */}
            {account ? (
              <div className="relative">
                <button
                  onClick={() => setWalletDropdownOpen(prev => !prev)}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-[#c53030]/80 text-white flex items-center gap-2 text-xs font-mono shadow-sm transition-all cursor-pointer"
                  aria-label="Account options"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.username || 'Avatar'}
                      className="w-4 h-4 rounded-full object-cover bg-zinc-950 p-0.5 border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                  <span className="font-semibold text-zinc-200">{shortAddress}</span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {walletDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 text-xs font-mono space-y-1"
                    >
                      <div className="p-2 border-b border-zinc-800/80 mb-1">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Connected Grave</div>
                        <div className="text-white font-bold truncate">@{userProfile?.username || 'undead'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">{account}</div>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#c53030]" />
                        <span>My Crypt &amp; Graves</span>
                      </Link>

                      <a
                        href={`https://snowtrace.io/address/${account}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                          <span>View on Snowtrace</span>
                        </span>
                        <span className="text-[10px] text-zinc-500">↗</span>
                      </a>

                      <button
                        onClick={disconnectWallet}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect Wallet</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnectingWallet}
                className="min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs font-semibold border border-red-500/50 shadow-[0_0_15px_rgba(197,48,48,0.4)] hover:shadow-[0_0_22px_rgba(197,48,48,0.7)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-200" />
                <span className="tracking-wide">
                  {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </button>
            )}

            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden min-h-[38px] min-w-[38px] p-2 flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md overflow-hidden px-4 py-4 space-y-3 shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/home"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/home' || location.pathname === '/'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <HomeIcon className="w-4 h-4 text-[#c53030]" />
                  <span>Cemetery</span>
                </Link>

                <Link
                  to="/submit"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/submit'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-[#c53030]" />
                  <span>Bury Project</span>
                </Link>

                <Link
                  to="/confessions"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/confessions'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Ghost className="w-4 h-4 text-[#c53030]" />
                  <span>Confessions</span>
                </Link>

                <Link
                  to="/chats"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/chats'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#c53030]" />
                  <span>Inbox</span>
                </Link>

                <Link
                  to="/leaderboard"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/leaderboard'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-[#c53030]" />
                  <span>Pantheon</span>
                </Link>

                <Link
                  to="/collaborations"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/collaborations'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#c53030]" />
                  <span>Collabs</span>
                </Link>

                <Link
                  to="/upcoming"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/upcoming'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#c53030]" />
                  <span>Upcoming</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 text-[#c53030]" />
                  <span>My Crypt</span>
                </Link>
              </div>

              {account && (
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400">
                    Wallet: <span className="text-white font-bold">{shortAddress}</span>
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="relative flex-grow container mx-auto px-4 sm:px-6 pb-12 pt-6 md:pt-10 z-10">
        {children}
      </main>

      {/* Gothic Footer */}
      <footer className="relative border-t border-zinc-800/80 bg-zinc-950/90 py-10 mt-auto z-10">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-6">
          
          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2.5 text-xs font-mono text-zinc-400">
            <Link to="/home" className="hover:text-[#c53030] transition-colors">
              Cemetery
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/leaderboard" className="hover:text-[#c53030] transition-colors">
              Pantheon
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <Link to="/confessions" className="hover:text-[#c53030] transition-colors">
              Confessions
            </Link>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <a 
              href={`https://snowtrace.io/address/${CONTRACT_ADDRESS}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <span>Avalanche Contract</span>
              <span className="text-[10px] text-zinc-500">↗</span>
            </a>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <a 
              href="https://github.com/krunvermaa/DevGraveyard" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <span className="text-[10px] text-zinc-500">↗</span>
            </a>
          </div>

          <div className="w-12 h-px bg-zinc-800" />

          {/* Gothic Quote */}
          <p className="text-zinc-300 text-sm font-serif italic text-center max-w-sm">
            "Not every project survives.<br />Some still teach."
          </p>

          {/* Disclaimer & Latin Motto */}
          <div className="text-center space-y-1">
            <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">
              Requiescat in Pace • Avalanche Web3 Crypt
            </p>
            <p className="text-zinc-600 text-[10px] font-sans max-w-md mx-auto">
              DevGraveyard is an immutable tribute to shelved software, hackathons, and abandoned builds.
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie / Storage Banner */}
      <CookieNotice />
    </div>
  );
};

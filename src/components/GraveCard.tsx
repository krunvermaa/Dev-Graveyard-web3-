import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Grave } from '../types';
import { Link } from 'react-router-dom';
import { calculateGraveScore, getGraveTier } from '../services/graveScoreService';
import { pressF, unpressF, checkHasPressedF } from '../services/graveService';
import { useAuth } from '../contexts/AuthContext';
import { ShareCardModal } from './ShareCardModal';
import { DispatchGraveModal } from './DispatchGraveModal';
import { AuthPromptModal } from './AuthPromptModal';
import { GraveModal } from './GraveModal';
import { playGraveSound, playRespectSound } from './Atmosphere';
import { 
  Share2, 
  Send, 
  GitBranch, 
  Sparkles, 
  Clock, 
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GraveCardProps {
  grave: Grave;
  index?: number;
  className?: string;
  onClick?: () => void;
}

interface RisingSoul {
  id: number;
  x: number;
  label: string;
}

export const GraveCard: React.FC<GraveCardProps> = ({ 
  grave, 
  index = 0, 
  className = '', 
  onClick 
}) => {
  const { account, userProfile } = useAuth();
  const [respectsCount, setRespectsCount] = useState<number>(grave.respects || 0);
  const [hasRespected, setHasRespected] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [risingSouls, setRisingSouls] = useState<RisingSoul[]>([]);

  // Modals
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Hover & keyboard focus state for 'F' shortcut
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const year = new Date(grave.created_at).getFullYear();
  const score = useMemo(() => calculateGraveScore(grave), [grave]);
  const tier = useMemo(() => getGraveTier(score), [score]);

  // Check if current user has already respected
  useEffect(() => {
    let isMounted = true;
    if (account && grave.id && grave.id !== 'preview' && grave.id !== 'new') {
      checkHasPressedF(grave.id, account).then((res) => {
        if (isMounted) setHasRespected(res);
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [account, grave.id]);

  // Handle 'F' or 'f' keyboard shortcut when card is hovered or focused
  useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        triggerPressF();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, hasRespected, account, respectsCount, grave.id]);

  const triggerPressF = async () => {
    if (!account) {
      setShowAuthModal(true);
      return;
    }
    if (isPressing) return;

    setIsPressing(true);
    playRespectSound();

    // Spawn rising soul particle
    const soulId = Date.now() + Math.random();
    setRisingSouls((prev) => [
      ...prev,
      { id: soulId, x: Math.random() * 40 - 20, label: hasRespected ? '-1 RIP' : '+1 RESPECT' }
    ]);

    setTimeout(() => {
      setRisingSouls((prev) => prev.filter((s) => s.id !== soulId));
    }, 1500);

    const prevRespected = hasRespected;
    const nextRespected = !prevRespected;
    setHasRespected(nextRespected);
    setRespectsCount((prev) => nextRespected ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (nextRespected) {
        await pressF(grave.id, userProfile?.username || account);
      } else {
        await unpressF(grave.id, userProfile?.username || account);
      }
    } catch (err) {
      console.error("Failed to update respects on-chain:", err);
      // Revert optimistic update on failure
      setHasRespected(prevRespected);
      setRespectsCount((prev) => prevRespected ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsPressing(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetailsModal(true);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Thematic Cause of Death badge colors
  const getCauseColor = (cause: string) => {
    switch (cause) {
      case 'Market Fit Missing':
        return 'border-red-800/80 bg-red-950/60 text-red-400';
      case 'Technical Roadblocks':
        return 'border-cyan-800/80 bg-cyan-950/60 text-cyan-400';
      case 'Lack of Time':
        return 'border-amber-800/80 bg-amber-950/60 text-amber-400';
      case 'Scope Creep':
        return 'border-purple-800/80 bg-purple-950/60 text-purple-400';
      case 'Loss of Interest':
        return 'border-zinc-700 bg-zinc-900/80 text-zinc-400';
      case 'Co-founder Conflict':
        return 'border-orange-800/80 bg-orange-950/60 text-orange-400';
      default:
        return 'border-zinc-700 bg-zinc-900/80 text-zinc-300';
    }
  };

  const techStackList = useMemo(() => {
    if (!grave.tech_stack) return [];
    return grave.tech_stack.split(/[,;/|•\n+]/).map(t => t.trim()).filter(Boolean);
  }, [grave.tech_stack]);

  return (
    <>
      <div 
        ref={cardRef}
        className={`group relative flex flex-col justify-between w-full rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black hover:-translate-y-1.5 hover:shadow-2xl font-sans overflow-hidden ${tier.borderColor} ${className}`}
        style={{
          boxShadow: isHovered ? `0 15px 35px -5px ${tier.glowColor}` : '0 10px 30px -10px rgba(0,0,0,0.8)',
        }}
        tabIndex={0}
        role="button"
        aria-label={`View tombstone for ${grave.project_name}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onMouseEnter={() => {
          setIsHovered(true);
          playGraveSound();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Arch Texture / Stone Grain */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Ambient Top Glow Line */}
        <div 
          className="absolute top-0 inset-x-0 h-1 transition-opacity duration-300"
          style={{
            backgroundColor: tier.glowColor,
            opacity: isHovered ? 0.9 : 0.4
          }}
        />

        {/* Card Header: Tier Badge & RIP Cross */}
        <div className="relative p-5 pb-3 flex items-start justify-between gap-2 z-10">
          
          {/* GraveScore Tier Badge */}
          <div 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${tier.badgeColor}`}
            title={tier.description}
          >
            <span>{tier.icon}</span>
            <span>{tier.name}</span>
          </div>

          {/* RIP Year & Cross */}
          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-xs font-semibold">
            <span className="text-zinc-600">✟ RIP</span>
            <span className="text-zinc-400">{year}</span>
          </div>
        </div>

        {/* Center Stone Content: Title, Cause of Death, Lifespan, Lesson */}
        <div className="relative px-5 py-2 space-y-3 z-10">
          
          {/* Project Name */}
          <h3 className="font-bold text-lg sm:text-xl font-serif text-zinc-100 group-hover:text-white transition-colors leading-tight line-clamp-2">
            {grave.project_name}
          </h3>

          {/* Badges Row: Cause of Death & Lifespan */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${getCauseColor(grave.cause_of_death)}`}>
              {grave.cause_of_death}
            </span>

            {grave.lived_for && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-zinc-500" />
                <span>{grave.lived_for}</span>
              </span>
            )}
          </div>

          {/* Lessons Learned Snippet */}
          {grave.lesson_learned && (
            <div className="p-3 rounded-xl bg-black/40 border-l-2 border-zinc-700 group-hover:border-[#c53030]/80 transition-colors">
              <p className="font-serif italic text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                "{grave.lesson_learned}"
              </p>
            </div>
          )}

          {/* Tech Stack Pills */}
          {techStackList.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {techStackList.slice(0, 3).map((tech, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/90 text-zinc-400 border border-zinc-800"
                >
                  {tech}
                </span>
              ))}
              {techStackList.length > 3 && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                  +{techStackList.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Undertaker Author & Interactive Action Buttons */}
        <div className="relative p-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 z-10 bg-zinc-950/60">
          
          {/* Author info */}
          <div className="truncate">
            {!grave.is_anonymous && grave.user_name ? (
              <Link
                to={`/user/${grave.user_name}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors truncate group/user"
                title={`View @${grave.user_name}'s crypt`}
              >
                {grave.user_avatar ? (
                  <img
                    src={grave.user_avatar}
                    alt={grave.user_name}
                    className="w-4 h-4 rounded-full object-cover bg-zinc-950 border border-zinc-700 shrink-0"
                  />
                ) : (
                  <span className="text-[10px]">👤</span>
                )}
                <span className="text-[11px] font-mono truncate">@{grave.user_name}</span>
              </Link>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <span>👻</span> Unmarked
              </span>
            )}
          </div>

          {/* Interactive Button Group */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            
            {/* Press [F] to Pay Respects */}
            <div className="relative">
              <button
                type="button"
                onClick={triggerPressF}
                disabled={isPressing}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  hasRespected
                    ? 'bg-[#c53030] text-white border-red-500 shadow-[0_0_12px_rgba(197,48,48,0.5)]'
                    : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:text-white hover:border-[#c53030]/80 hover:bg-zinc-800'
                }`}
                title="Press [F] or click to Pay Respects"
              >
                <span className="text-[11px]">🌹</span>
                <span>{respectsCount}</span>
                <span className="hidden sm:inline text-[9px] opacity-75 font-normal">[F]</span>
              </button>

              {/* Rising Soul Embers on Press */}
              <AnimatePresence>
                {risingSouls.map((soul) => (
                  <motion.div
                    key={soul.id}
                    initial={{ opacity: 1, y: 0, x: soul.x, scale: 0.8 }}
                    animate={{ opacity: 0, y: -45, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute -top-3 left-1/2 pointer-events-none -translate-x-1/2 whitespace-nowrap z-50 text-[10px] font-mono font-bold text-[#f87171] drop-shadow-[0_0_8px_rgba(197,48,48,0.8)]"
                  >
                    {soul.label}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Share Card Modal Button */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Generate Memorial Share Card"
              aria-label="Share card"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Dispatch to Friend Button */}
            <button
              type="button"
              onClick={() => setShowDispatchModal(true)}
              className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#c53030]/60 transition-colors flex items-center justify-center cursor-pointer"
              title="Dispatch to Friend"
              aria-label="Dispatch to friend"
            >
              <Send className="w-3.5 h-3.5" />
            </button>

            {/* GitHub Repo icon if linked */}
            {grave.github_link && (
              <a
                href={grave.github_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center justify-center"
                title="View Verified GitHub Repository"
              >
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Internal Modals */}
      {showShareModal && (
        <ShareCardModal
          grave={grave}
          respects={respectsCount}
          eulogiesCount={Array.isArray(grave.eulogies) ? grave.eulogies.length : 0}
          graveOwnerUsername={grave.user_name || null}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showDispatchModal && (
        <DispatchGraveModal
          isOpen={showDispatchModal}
          grave={grave}
          onClose={() => setShowDispatchModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthPromptModal
          isOpen={showAuthModal}
          actionText="pay respects (Press F)"
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showDetailsModal && !onClick && (
        <GraveModal
          grave={grave}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Grave, User } from '../types';
import { getGraves } from '../services/graveService';
import { Loader2, Flame, ScrollText, Link as LinkIcon, ExternalLink, Trophy, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GraveModal } from '../components/GraveModal';
import { AnimatePresence, motion } from 'motion/react';

interface UndertakerStat {
  address: string;
  username: string;
  avatarUrl?: string;
  gravesCount: number;
  totalRespects: number;
}

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'undertakers'>('projects');
  const [graves, setGraves] = useState<Grave[]>([]);
  const [undertakers, setUndertakers] = useState<UndertakerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const allGraves = await getGraves();
        
        // Sort projects by Respects paid (primary) then by date
        const sortedGraves = [...allGraves].sort((a, b) => (b.respects || 0) - (a.respects || 0));
        setGraves(sortedGraves);

        // Aggregate Top Undertakers by number of buried graves
        const undertakerMap: Record<string, UndertakerStat> = {};
        allGraves.forEach(g => {
          const key = (g.user_id || g.user_name || 'unknown').toLowerCase();
          if (!undertakerMap[key]) {
            undertakerMap[key] = {
              address: g.user_id || '',
              username: g.user_name || (g.user_id ? `${g.user_id.slice(0, 6)}...${g.user_id.slice(-4)}` : 'Anonymous'),
              avatarUrl: g.user_avatar,
              gravesCount: 0,
              totalRespects: 0
            };
          }
          undertakerMap[key].gravesCount += 1;
          undertakerMap[key].totalRespects += (g.respects || 0);
        });

        const sortedUndertakers = Object.values(undertakerMap)
          .sort((a, b) => b.gravesCount - a.gravesCount || b.totalRespects - a.totalRespects);

        setUndertakers(sortedUndertakers);
      } catch (err) {
        console.error("Failed to load leaderboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Gothic Medal Badge Renderer: Gold Skull, Silver Raven, Bronze Tombstone
  const renderMedalBadge = (index: number) => {
    if (index === 0) {
      return (
        <div 
          className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-amber-950/40 border-2 border-amber-400 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.35)]" 
          title="Gold Skull — 1st Place"
        >
          <span className="text-xl select-none" role="img" aria-label="gold skull">💀</span>
          <span className="text-[9px] font-mono font-bold text-amber-300 uppercase leading-none">1st</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div 
          className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-zinc-900 border-2 border-zinc-300 rounded-2xl shadow-[0_0_15px_rgba(212,212,216,0.25)]" 
          title="Silver Raven — 2nd Place"
        >
          <span className="text-xl select-none" role="img" aria-label="silver raven">🦅</span>
          <span className="text-[9px] font-mono font-bold text-zinc-200 uppercase leading-none">2nd</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div 
          className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-stone-900 border-2 border-amber-700 rounded-2xl shadow-[0_0_15px_rgba(180,83,9,0.25)]" 
          title="Bronze Tombstone — 3rd Place"
        >
          <span className="text-xl select-none" role="img" aria-label="bronze tombstone">🪦</span>
          <span className="text-[9px] font-mono font-bold text-amber-600 uppercase leading-none">3rd</span>
        </div>
      );
    }
    return (
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/60 border border-zinc-800 rounded-2xl">
        <span className="text-zinc-500 font-mono font-bold text-sm">#{index + 1}</span>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 sm:p-6 md:p-8 pb-20">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(197,48,48,0.5)] border-b border-white/10 pb-4 inline-block">
            The Pantheon
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto">
            Honoring legendary abandoned builds and tireless cemetery undertakers on Avalanche.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#c53030] text-white shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Projects</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('undertakers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'undertakers'
                  ? 'bg-[#c53030] text-white shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Top Undertakers</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 text-[#c53030] animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Consulting the necrological archives...
            </p>
          </div>
        ) : activeTab === 'projects' ? (
          /* TAB 1: TOP PROJECTS */
          <div className="space-y-3 sm:space-y-4">
            {graves.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-500 font-mono text-sm">No worthy projects found in the Pantheon yet.</p>
              </div>
            ) : (
              graves.map((grave, index) => {
                const eulogiesCount = Array.isArray(grave.eulogies) ? grave.eulogies.length : 0;
                return (
                  <div 
                    key={grave.id} 
                    onClick={() => setSelectedGrave(grave)} 
                    className="block cursor-pointer group"
                  >
                    <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-[#c53030]/60 hover:bg-black/90 transition-all duration-300 shadow-xl">
                      {/* Gothic Medal Badge */}
                      {renderMedalBadge(index)}
                      
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="font-bold text-lg sm:text-xl text-zinc-100 group-hover:text-red-400 transition-colors truncate">
                            {grave.project_name}
                          </h3>
                          {grave.cause_of_death && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {grave.cause_of_death}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-500 font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                          <span>By @{grave.user_name || 'anonymous'}</span>
                          {grave.tech_stack && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-400 truncate max-w-[200px]">{grave.tech_stack}</span>
                            </>
                          )}
                          {grave.github_link && (
                            <>
                              <span>•</span>
                              <a 
                                href={grave.github_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={e => e.stopPropagation()} 
                                className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                              >
                                <LinkIcon size={11} /> 
                                <span>Source</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Metrics: Respects & Eulogies */}
                      <div className="flex items-center gap-5 shrink-0 bg-black/50 px-4 py-2 rounded-xl border border-white/5">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-[#c53030]">
                            <Flame size={15} />
                            <span className="text-sm font-mono font-bold text-zinc-100">{grave.respects || 0}</span>
                          </div>
                          <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Respects</span>
                        </div>
                        <div className="w-px h-6 bg-zinc-800" />
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <ScrollText size={15} />
                            <span className="text-sm font-mono font-bold text-zinc-100">{eulogiesCount}</span>
                          </div>
                          <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Eulogies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* TAB 2: TOP UNDERTAKERS */
          <div className="space-y-3 sm:space-y-4">
            {undertakers.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-500 font-mono text-sm">No registered undertakers found.</p>
              </div>
            ) : (
              undertakers.map((undertaker, index) => (
                <div 
                  key={undertaker.address || undertaker.username}
                  onClick={() => {
                    if (undertaker.username && undertaker.username !== 'Anonymous') {
                      navigate(`/user/${undertaker.username}`);
                    }
                  }}
                  className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-[#c53030]/60 hover:bg-black/90 transition-all duration-300 shadow-xl cursor-pointer group"
                >
                  {/* Gothic Medal Badge */}
                  {renderMedalBadge(index)}

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
                    {undertaker.avatarUrl ? (
                      <img src={undertaker.avatarUrl} alt={undertaker.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-lg text-[#c53030]">
                        {undertaker.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-zinc-100 group-hover:text-red-400 transition-colors truncate">
                      @{undertaker.username}
                    </h3>
                    {undertaker.address && (
                      <p className="font-mono text-xs text-zinc-500 truncate">
                        {undertaker.address}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 shrink-0 bg-black/50 px-4 py-2 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center">
                      <span className="text-base font-mono font-bold text-zinc-100">{undertaker.gravesCount}</span>
                      <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Buried</span>
                    </div>
                    <div className="w-px h-6 bg-zinc-800" />
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[#c53030]">
                        <Flame size={14} />
                        <span className="text-base font-mono font-bold text-zinc-100">{undertaker.totalRespects}</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Respects</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

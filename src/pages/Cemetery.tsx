import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type SortOption = 'newest' | 'most-respected' | 'oldest';

const CAUSE_FILTERS = [
  'All',
  'Scope Creep',
  'Framework Fatigue',
  'Burnout',
  'Abandoned Prototypes',
  'Solitary Maintenance',
  'Lack of Time',
  'Market Fit Missing',
  'Technical Roadblocks',
  'Other'
];

export const Cemetery: React.FC = () => {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [developerSearch, setDeveloperSearch] = useState('');
  const [selectedCause, setSelectedCause] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleDeveloperSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (developerSearch.trim()) {
      navigate(`/user/${developerSearch.trim()}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGraves();
        setGraves(data);
      } catch (error) {
        console.error("Failed to fetch graves", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGraves = useMemo(() => {
    let result = [...graves];

    // Filter by Cause of Death
    if (selectedCause !== 'All') {
      result = result.filter(g => 
        (g.cause_of_death || '').toLowerCase().includes(selectedCause.toLowerCase())
      );
    }

    // Filter by Search Query (name, tech stack, cause of death, username)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter(grave => 
        grave.project_name.toLowerCase().includes(lowerQuery) || 
        (grave.tech_stack && grave.tech_stack.toLowerCase().includes(lowerQuery)) ||
        (grave.cause_of_death && grave.cause_of_death.toLowerCase().includes(lowerQuery)) ||
        (grave.user_name && grave.user_name.toLowerCase().includes(lowerQuery)) ||
        (grave.lesson_learned && grave.lesson_learned.toLowerCase().includes(lowerQuery))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'most-respected') {
        return (b.respects || 0) - (a.respects || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [graves, searchQuery, selectedCause, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-10 md:space-y-14 max-w-6xl mx-auto mb-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto mb-2 mt-4 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
          The Cemetery
        </h1>
        <p className="text-zinc-400 font-mono text-xs sm:text-sm uppercase tracking-widest">
          Where dead code finds eternal peace on Avalanche C-Chain
        </p>
      </div>

      {/* Search & Grid Controls */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#c53030]/60" />
            </div>
            <input
              type="text"
              placeholder="Search graves by project name, tech stack, cause of death..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-[#c53030]/25 rounded-xl leading-5 bg-surface/90 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c53030]/50 focus:border-[#c53030]/60 text-sm transition-all shadow-inner"
            />
          </div>
          
          {/* Sort & Developer Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative shrink-0 flex items-center">
              <ArrowUpDown className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-9 pr-8 py-2.5 bg-black/60 border border-zinc-800 rounded-xl text-xs font-mono uppercase tracking-wider text-zinc-300 focus:outline-none focus:border-[#c53030]/60 cursor-pointer appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="most-respected">Most Respected</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Developer Search Form */}
            <form onSubmit={handleDeveloperSearch} className="relative flex-1 sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Find undertaker..."
                value={developerSearch}
                onChange={(e) => setDeveloperSearch(e.target.value)}
                className="block w-full pl-8 pr-3 py-2.5 border border-zinc-800 rounded-xl text-xs bg-black/60 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-all font-mono"
              />
            </form>

            {/* Graves count badge */}
            <span className="text-xs font-mono text-zinc-400 border border-zinc-800 px-3.5 py-2 rounded-xl bg-surface/90 shrink-0 select-none">
              {loading ? '...' : `${filteredGraves.length} GRAVES`}
            </span>
          </div>
        </div>

        {/* Cause of Death Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
          <span className="text-[11px] font-mono uppercase text-zinc-500 shrink-0 mr-1">Filter:</span>
          {CAUSE_FILTERS.map((cause) => {
            const isSelected = selectedCause === cause;
            return (
              <button
                key={cause}
                type="button"
                onClick={() => setSelectedCause(cause)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c53030] text-white border border-[#c53030] shadow-[0_0_15px_rgba(197,48,48,0.4)]'
                    : 'bg-zinc-950/70 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cause}
              </button>
            );
          })}
        </div>

        {/* Graves Grid / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-10 h-10 text-[#c53030] animate-spin opacity-80" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              Summoning memorials from Avalanche...
            </p>
          </div>
        ) : filteredGraves.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4 bg-surface/60 border border-[#c53030]/20 rounded-2xl shadow-[0_0_30px_rgba(223,54,54,0.05)] text-center space-y-4"
          >
            <span className="text-4xl" role="img" aria-label="tombstone">🪦</span>
            <div className="space-y-1">
              <h3 className="font-mono text-lg font-bold text-zinc-200">
                No graves match your summoning ritual.
              </h3>
              <p className="text-zinc-500 font-mono text-xs max-w-md mx-auto">
                {searchQuery || selectedCause !== 'All' 
                  ? "Adjust your cause filter or search query to summon other departed builds."
                  : "The sacred grounds are waiting for the first burial."}
              </p>
            </div>
            {(searchQuery || selectedCause !== 'All') ? (
              <Button 
                variant="secondary" 
                onClick={() => { setSearchQuery(''); setSelectedCause('All'); }}
                className="mt-2 text-xs font-mono uppercase border-zinc-700 hover:border-[#c53030]"
              >
                Clear Filters
              </Button>
            ) : (
              <Link to={account ? "/submit" : "/login"}>
                <Button className="mt-2 text-xs font-mono uppercase bg-[#c53030] hover:bg-[#b02727]">
                  Bury a Project
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-28 md:gap-y-36 mt-8 pb-16">
            {filteredGraves.map((grave, index) => (
              <div 
                key={grave.id} 
                className="group relative hover:z-50 transition-all duration-300 animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min((index % 6) * 0.05, 0.3)}s`,
                  animationFillMode: 'both'
                }}
              >
                <GraveCard 
                  grave={grave} 
                  index={index} 
                  onClick={() => setSelectedGrave(grave)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

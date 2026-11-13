import React, { useState, useEffect } from 'react';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { Loader2, Trophy, Flame, ScrollText, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getContract } from '../services/web3Service';

export const Leaderboard: React.FC = () => {
  const [graves, setGraves] = useState<(Grave & { eulogiesCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const allGraves = await getGraves();
        const contract = await getContract();
        
        // Filter those with github link
        const eligibleGraves = allGraves.filter(g => g.github_link);
        
        // Fetch eulogy counts for scoring
        const gravesWithScores = await Promise.all(eligibleGraves.map(async (g) => {
            let eulogiesCount = 0;
            try {
                // Grave object has eulogyCount in DevGraveyard.sol but not exported via getGraves easily,
                // so we can query getEulogies length or modify getGraves. Since we want to display it,
                // we'll fetch them (or just read from grave tuple). Wait, getGraves doesn't return eulogyCount.
                // We can fetch eulogies list.
                const eulogies = await contract.getEulogies(g.id);
                eulogiesCount = eulogies.length;
            } catch(e) {}
            return { ...g, eulogiesCount };
        }));
        
        // Score = (respects * 2) + eulogies 
        gravesWithScores.sort((a, b) => {
          const scoreA = ((a.respects || 0) * 2) + a.eulogiesCount;
          const scoreB = ((b.respects || 0) * 2) + b.eulogiesCount;
          return scoreB - scoreA;
        });
        
        setGraves(gravesWithScores.slice(0, 50)); // Top 50
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#c53030] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-6 md:p-8 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(197,48,48,0.5)]">
          The Pantheon of the Dead
        </h1>
        <p className="text-zinc-400 font-mono text-sm max-w-2xl mx-auto">
          Honoring the most legendary abandoned projects. Only those with actual Github links are eligible for eternal glory.
        </p>
      </div>
      
      <div className="space-y-4">
        {graves.map((grave, index) => {
          return (
            <div key={grave.id} onClick={() => navigate(`/grave/${grave.id}`)} className="block cursor-pointer">
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-[#c53030]/50 hover:bg-black/80 transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black rounded-full border border-zinc-700 shadow-inner">
                  {index === 0 ? <Trophy className="text-yellow-500" size={24} /> : 
                   index === 1 ? <Trophy className="text-zinc-400" size={24} /> : 
                   index === 2 ? <Trophy className="text-amber-700" size={24} /> : 
                   <span className="text-zinc-500 font-mono font-bold">#{index + 1}</span>}
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="font-bold text-xl text-zinc-200 truncate">{grave.project_name}</h3>
                  <div className="text-xs text-zinc-500 font-mono flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <span>By @{grave.user_name || 'unknown'}</span>
                    <span>•</span>
                    <a href={grave.github_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline">
                      <LinkIcon size={12} /> Source
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                  <div className="flex flex-col items-center">
                    <Flame className="text-[#c53030] mb-1" size={16} />
                    <span className="text-xs font-mono font-bold text-zinc-300">{grave.respects || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ScrollText className="text-zinc-400 mb-1" size={16} />
                    <span className="text-xs font-mono font-bold text-zinc-300">{grave.eulogiesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

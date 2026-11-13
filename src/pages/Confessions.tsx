import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Trash2, Flame, Skull } from 'lucide-react';
import { Confession } from '../types';

const COLORS = [
  '#27272a', // zinc-800
  '#3f3f46', // zinc-700
  '#292524', // stone-800
  '#44403c', // stone-700
  '#1e293b', // slate-800
  '#334155', // slate-700
];

const PROFANITY_REGEX = /fuck|shit|bitch|asshole|cunt|dick|pussy|whore|slut/i;

const INITIAL_CONFESSIONS: Confession[] = [
  {
    id: 'confession-prod-db',
    text: 'I dropped the primary Postgres production DB 20 minutes before a holiday weekend and blamed an upstream cloud outage.',
    color: '#27272a',
    rotation: -2.5,
    createdAt: Date.now() - 3600000 * 24 * 3,
    reactions: { skulls: 34, candles: 51 }
  },
  {
    id: 'confession-rust-engine',
    text: 'Spent 14 months architecting a custom Rust game engine with ECS & custom shaders. Never wrote actual gameplay. Repo archived.',
    color: '#3f3f46',
    rotation: 1.8,
    createdAt: Date.now() - 3600000 * 24 * 5,
    reactions: { skulls: 62, candles: 28 }
  },
  {
    id: 'confession-ai-wrapper',
    text: 'Billed 120 billable hours for an "enterprise cognitive synthesis pipeline" that was literally a 4-line curl call to OpenAI.',
    color: '#292524',
    rotation: -1.2,
    createdAt: Date.now() - 3600000 * 24 * 7,
    reactions: { skulls: 19, candles: 44 }
  },
  {
    id: 'confession-aws-key',
    text: 'Hardcoded our root AWS API key directly into a public test repo at 4 AM. Woke up to a $12,400 EC2 mining invoice.',
    color: '#44403c',
    rotation: 3.1,
    createdAt: Date.now() - 3600000 * 24 * 10,
    reactions: { skulls: 88, candles: 95 }
  },
  {
    id: 'confession-framework-churn',
    text: 'Rewrote the same marketing website in React, Next.js, Remix, Astro, and Svelte before ever buying a domain name.',
    color: '#1e293b',
    rotation: -2.1,
    createdAt: Date.now() - 3600000 * 24 * 14,
    reactions: { skulls: 47, candles: 31 }
  }
];

export const getConfessions = async (): Promise<Confession[]> => {
  const stored = localStorage.getItem('devgraveyard_web3_confessions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading confessions from storage:", e);
    }
  }
  localStorage.setItem('devgraveyard_web3_confessions', JSON.stringify(INITIAL_CONFESSIONS));
  return INITIAL_CONFESSIONS;
};

export const addConfession = async (text: string): Promise<Confession> => {
  const existing = await getConfessions();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const rotation = Math.random() * 8 - 4; // between -4 and 4 degrees

  const newConfession: Confession = {
    id: `confession-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    text: text.trim(),
    color,
    rotation,
    createdAt: Date.now(),
    reactions: { skulls: 0, candles: 0 }
  };

  const updated = [newConfession, ...existing];
  localStorage.setItem('devgraveyard_web3_confessions', JSON.stringify(updated));
  return newConfession;
};

const BatsAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: -100,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 400,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 100 : 1200,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 400,
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut",
          }}
        >
          <span className="text-4xl grayscale opacity-30 drop-shadow-md inline-block select-none" style={{ transform: 'scaleX(-1)' }}>🦇</span>
        </motion.div>
      ))}
    </div>
  );
};

export const Confessions: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [myConfessionIds, setMyConfessionIds] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, 'skulls' | 'candles'>>({});

  useEffect(() => {
    const savedIds = localStorage.getItem('my_confession_ids');
    if (savedIds) {
      try {
        setMyConfessionIds(JSON.parse(savedIds));
      } catch (e) {}
    }

    const savedReactions = localStorage.getItem('devgraveyard_confession_reactions');
    if (savedReactions) {
      try {
        setUserReactions(JSON.parse(savedReactions));
      } catch (e) {}
    }

    getConfessions().then(data => {
      setConfessions(data);
      setLoading(false);
    });
  }, []);

  const handleReact = (confessionId: string, type: 'skulls' | 'candles') => {
    const key = `${confessionId}_${type}`;
    const alreadyReacted = userReactions[confessionId] === type;

    setConfessions(prev => {
      const updated = prev.map(c => {
        if (c.id !== confessionId) return c;
        const currentReactions = c.reactions || { skulls: 0, candles: 0 };
        const change = alreadyReacted ? -1 : 1;
        return {
          ...c,
          reactions: {
            ...currentReactions,
            [type]: Math.max(0, (currentReactions[type] || 0) + change)
          }
        };
      });
      localStorage.setItem('devgraveyard_web3_confessions', JSON.stringify(updated));
      return updated;
    });

    setUserReactions(prev => {
      const updated = { ...prev };
      if (alreadyReacted) {
        delete updated[confessionId];
      } else {
        updated[confessionId] = type;
      }
      localStorage.setItem('devgraveyard_confession_reactions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDelete = (id: string) => {
    const updated = confessions.filter(c => c.id !== id);
    setConfessions(updated);
    localStorage.setItem('devgraveyard_web3_confessions', JSON.stringify(updated));

    const newIds = myConfessionIds.filter(i => i !== id);
    setMyConfessionIds(newIds);
    localStorage.setItem('my_confession_ids', JSON.stringify(newIds));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (text.length > 140) {
      setError("Maximum 140 characters allowed.");
      return;
    }

    if (PROFANITY_REGEX.test(text)) {
      setError("Please keep it clean. Even in the graveyard, respect reigns.");
      return;
    }

    // Rate limit check: 2 per hour
    const now = Date.now();
    const historyStr = localStorage.getItem('confession_history');
    let history: number[] = historyStr ? JSON.parse(historyStr) : [];
    
    history = history.filter(t => now - t < 60 * 60 * 1000);
    
    if (history.length >= 2) {
      setError("You can only confess twice per hour. Contemplate in silence.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newConfession = await addConfession(text);
      setConfessions(prev => [newConfession, ...prev]);

      history.push(now);
      localStorage.setItem('confession_history', JSON.stringify(history));
      
      const newIds = [...myConfessionIds, newConfession.id];
      setMyConfessionIds(newIds);
      localStorage.setItem('my_confession_ids', JSON.stringify(newIds));

      setText('');
    } catch (err) {
      console.error(err);
      setError("Failed to bury confession.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-4 relative overflow-hidden flex flex-col items-center">
      {/* Dark Haunted Wall Background */}
      <div 
        className="fixed inset-0 z-[-2] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #121216 0%, #0a0a0c 40%, #050507 100%)',
          contain: 'strict',
        }}
      />
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(39, 39, 42, 0.25) 0%, transparent 70%)',
          contain: 'strict',
        }}
      />
      
      {/* Wall Cracks SVG Overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-25 z-[-1]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M15,0 L20,15 L10,30 L18,50 L12,75 L25,100" fill="none" stroke="#000" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M85,0 L78,25 L88,45 L75,65 L82,100" fill="none" stroke="#000" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35,20 L48,28 L42,45 L55,55 L48,78 L38,85" fill="none" stroke="#000" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0,40 L15,48 L8,65 L22,70" fill="none" stroke="#000" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100,30 L85,40 L92,55 L78,65" fill="none" stroke="#000" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Fog effects and Bats Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      <BatsAnimation />

      <div className="w-full max-w-2xl mx-auto mb-16 mt-6 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-3 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
          Confessions
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
          Anonymous developer secrets. Max 140 characters. 2 posts per hour.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left bg-zinc-950/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c53030]/60 to-transparent" />
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              maxLength={140}
              placeholder="I pushed straight to production on Friday at 5 PM without testing..."
              className="w-full h-28 bg-black/60 border border-zinc-800 rounded-2xl p-5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c53030]/60 transition-colors resize-none font-mono text-sm sm:text-base shadow-inner"
            />
            <span className={`absolute bottom-4 right-4 text-xs font-mono font-bold ${text.length > 130 ? 'text-[#c53030]' : 'text-zinc-600'}`}>
              {text.length}/140
            </span>
          </div>

          {error && (
            <p className="text-[#c53030] text-xs font-mono text-center bg-[#c53030]/10 py-2.5 rounded-xl border border-[#c53030]/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="w-full py-3.5 bg-zinc-900 border border-zinc-700 hover:border-[#c53030]/80 text-zinc-100 hover:text-white rounded-2xl font-mono text-xs uppercase tracking-widest hover:bg-zinc-800 hover:shadow-[0_0_25px_-5px_rgba(197,48,48,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 font-bold shadow-lg cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin text-[#c53030]" />}
            <span>Bury Confession</span>
          </button>
        </form>
      </div>

      {/* Confessions Wall */}
      <div className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10">
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-10 h-10 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
            <AnimatePresence>
              {confessions.map((confession) => {
                const isMine = myConfessionIds.includes(confession.id);
                const hasReactedSkull = userReactions[confession.id] === 'skulls';
                const hasReactedCandle = userReactions[confession.id] === 'candles';
                const skullsCount = confession.reactions?.skulls || 0;
                const candlesCount = confession.reactions?.candles || 0;

                return (
                  <motion.div
                    key={confession.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotate: confession.rotation
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: 0, 
                      zIndex: 30,
                      transition: { duration: 0.2 } 
                    }}
                    style={{ backgroundColor: confession.color }}
                    className="w-64 sm:w-72 p-5 rounded-2xl shadow-2xl border border-white/10 relative flex flex-col justify-between min-h-[180px] backdrop-blur-sm"
                  >
                    {/* Push Pin */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600/80 border-2 border-red-400 shadow-md" />

                    {isMine && (
                      <button
                        type="button"
                        onClick={() => handleDelete(confession.id)}
                        className="absolute top-3 right-3 text-zinc-400 hover:text-red-400 p-1 rounded-md transition-colors cursor-pointer"
                        title="Delete your confession"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <p className="font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed pt-2 pb-4 select-text">
                      "{confession.text}"
                    </p>

                    {/* Reactions Bar: Skulls and Candles */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleReact(confession.id, 'skulls')}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            hasReactedSkull 
                              ? 'bg-red-500/30 text-red-300 border border-red-500/50' 
                              : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-white border border-transparent'
                          }`}
                          title="Pay tribute with a skull"
                        >
                          <Skull className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{skullsCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReact(confession.id, 'candles')}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            hasReactedCandle 
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50' 
                              : 'bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-white border border-transparent'
                          }`}
                          title="Light a memorial candle"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>{candlesCount}</span>
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(confession.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

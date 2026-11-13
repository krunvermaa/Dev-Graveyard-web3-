import React from 'react';
import { motion } from 'motion/react';
import { Ghost, Skull } from 'lucide-react';

const BatsAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: -100,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 100 : 1000,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500,
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut",
          }}
        >
          <span className="text-4xl grayscale opacity-30 drop-shadow-md inline-block" style={{ transform: 'scaleX(-1)' }}>🦇</span>
        </motion.div>
      ))}
    </div>
  );
};

export const Confessions: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-4 relative overflow-hidden flex flex-col items-center">
      {/* Dark Haunted Wall Background */}
      <div className="fixed inset-0 z-[-2] bg-[#0a0a0c]" />
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
        }}
      />
      
      {/* Fog effects */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      <BatsAnimation />

      <div className="w-full max-w-2xl mx-auto mb-16 mt-16 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-6 inline-block">
          Confessions
        </h1>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
          Anonymous developer secrets.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 w-full border border-zinc-800/50 bg-black/40 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center gap-6 min-h-[300px] backdrop-blur-sm shadow-2xl"
        >
          <Ghost className="w-16 h-16 text-zinc-700 opacity-50 mb-4 animate-pulse" />
          <h2 className="font-sans text-xl text-zinc-300 tracking-wide font-bold">
            Upgrading to Web3 Privacy
          </h2>
          <p className="font-mono text-zinc-500 text-sm uppercase tracking-widest text-center leading-relaxed max-w-sm">
            Confessions are currently being rebuilt on Avalanche utilizing zero-knowledge proofs (ZK-SNARKs) to ensure eternal on-chain anonymity.
          </p>
          <p className="font-mono text-[#c53030] text-xs uppercase tracking-widest text-center mt-4 border border-[#c53030]/30 bg-[#c53030]/10 px-4 py-2 rounded-lg">
            Returning in V2
          </p>
        </motion.div>
      </div>
    </div>
  );
};

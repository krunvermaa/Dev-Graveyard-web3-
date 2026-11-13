import React from 'react';
import { motion } from 'motion/react';
import { Users, Skull } from 'lucide-react';

export const Collaborations: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start min-h-screen relative pt-8 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 mb-16 text-center z-10 w-full"
      >
        <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-full bg-zinc-900/50 border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-mono uppercase tracking-tighter drop-shadow-lg">
          Collaborations
        </h1>
        <p className="text-zinc-500 font-serif italic text-lg sm:text-xl max-w-xl">
          Where dead projects meet new allies.
        </p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full z-20">
        {/* Left Column: Current Collaborations */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
            <h2 className="text-2xl font-mono text-zinc-300 uppercase tracking-widest">
              Current
            </h2>
          </div>
          
          <div className="w-full border border-zinc-800/50 bg-black/40 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center gap-6 min-h-[500px] backdrop-blur-sm">
            <Skull className="w-12 h-12 text-zinc-700 opacity-50 mb-2" />
            <p className="font-mono text-zinc-500 text-sm uppercase tracking-widest text-center leading-relaxed">
              No active alliances<br/>found in the crypt.
            </p>
          </div>
        </motion.section>

        {/* Right Column: Upcoming Collaborations */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
            <h2 className="text-2xl font-mono text-zinc-300 uppercase tracking-widest">
              Upcoming
            </h2>
          </div>
          
          <div className="w-full border border-zinc-800/50 bg-black/40 rounded-2xl flex flex-col items-center justify-end relative overflow-hidden backdrop-blur-sm min-h-[500px] p-6 pb-12">
            
            {/* Spiderman Swinging Animation inside the box */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center origin-top"
              initial={{ rotate: -5 }}
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="100%" height="400" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 drop-shadow-[0_0_5px_rgba(255,255,255,0.7)] z-0">
                {/* Anchor Points at the top of the container (narrower spread) */}
                <path d="M140 0 Q145 30 150 60" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <path d="M145 0 Q147 25 150 60" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                <path d="M148 0 Q149 35 150 60" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
                <path d="M150 0 Q150 35 150 60" stroke="rgba(255,255,255,1)" strokeWidth="3" />
                <path d="M152 0 Q151 35 150 60" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
                <path d="M155 0 Q153 25 150 60" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                <path d="M160 0 Q155 30 150 60" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                
                {/* Main Strand dropping to Spiderman's right hand */}
                <path d="M150 60 Q180 160 215 220" stroke="url(#fadeGrad2)" strokeWidth="2.5" fill="none" />
                <path d="M150 60 Q175 160 215 220" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
                
                <defs>
                  <linearGradient id="fadeGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Foreground Card Attached to Spiderman's Left Hand */}
              <div className="absolute top-[210px] left-[45%] -translate-x-[90%] z-20 w-[240px] bg-black/80 border border-zinc-800/80 rounded-xl p-5 flex flex-col items-center justify-center gap-3 backdrop-blur-md shadow-[0_15px_30px_rgba(0,0,0,0.9)] pointer-events-auto group transform -rotate-12 origin-top-right">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/11/Spider-Man-Logo.png" 
                  alt="Spiderman Logo" 
                  className="w-4/5 object-contain filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500"
                />
                <p className="font-mono text-zinc-400 text-[11px] uppercase tracking-widest text-center leading-relaxed">
                  Swinging into the graveyard soon.
                </p>
              </div>

              {/* Spiderman Image */}
              <div className="absolute top-[130px] left-[45%] -translate-x-1/2 w-56 h-56 z-30 flex justify-center pointer-events-none">
                <img 
                  src="https://pngimg.com/uploads/spider_man/spider_man_PNG10.png" 
                  alt="Spiderman Hanging"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
                  style={{ transform: 'rotate(180deg)' }}
                  onError={(e) => {
                    e.currentTarget.src = "https://pngimg.com/uploads/spider_man/spider_man_PNG12.png";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>
        
      </div>
    </div>
  );
};

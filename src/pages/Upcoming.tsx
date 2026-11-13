import React from 'react';
import { Share2, FileCode2, GitFork, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpcomingFeature {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    number: '1',
    title: 'LinkedIn Post-Mortem & Mistake Analysis',
    subtitle: 'Turn project failures into career-defining technical post-mortems',
    description: 'Automated retrospective generator that parses your cause-of-death, tech stack, and lessons learned into polished, thoughtful engineering post-mortems ready for LinkedIn and developer networks.',
    icon: Share2
  },
  {
    number: '2',
    title: 'AI Codebase Autopsy & Utility Salvager',
    subtitle: 'Excavate reusable code snippets, helper functions, and configs',
    description: 'Intelligent code archeology that scans dead repositories to identify, extract, and clean standalone utility functions, Docker configs, and architecture patterns so valuable work is never truly lost.',
    icon: FileCode2
  },
  {
    number: '3',
    title: 'Ghost Bounty & Adoption Exchange',
    subtitle: 'Transfer ownership of abandoned repositories to eager new maintainers',
    description: 'A collaborative adoption platform allowing creators to pass project custody to developers wanting to revive, maintain, or sponsor stalled open-source ideas.',
    icon: GitFork
  },
  {
    number: '4',
    title: 'Project Survival Guide & Anti-Pattern Prevention',
    subtitle: 'Battle-tested architectural heuristics to prevent future project deaths',
    description: 'Interactive failure post-mortem guide breaking down top causes of death (scope creep, infrastructure burnout, premature monetization) with preventative checklists.',
    icon: ShieldAlert
  }
];

export const Upcoming: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full px-4 py-8 sm:p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-radial from-[#c53030]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-14 relative z-10">
        
        {/* Left Column: Grim Reaper Silhouette & Quote */}
        <div className="w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] flex flex-col items-center text-center shrink-0 lg:sticky lg:top-24">
          <div className="w-full aspect-[4/5] relative drop-shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-pulse">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3CradialGradient id=\'glow\' cx=\'50%25\' cy=\'30%25\' r=\'50%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23c53030\' stop-opacity=\'0.2\'/%3E%3Cstop offset=\'100%25\' stop-color=\'black\' stop-opacity=\'0\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'200\' height=\'300\' fill=\'url(%23glow)\'/%3E%3Cpath d=\'M60 50 C80 10, 120 10, 140 50 C160 100, 150 250, 150 250 L50 250 C50 250, 40 100, 60 50 Z\' fill=\'%23050505\'/%3E%3Cpath d=\'M90 70 C100 65, 110 70, 110 70 C105 80, 95 80, 90 70 Z\' fill=\'%23c53030\' opacity=\'0.8\'/%3E%3Cpath d=\'M150 80 Q190 60, 180 20 Q190 40, 170 70 L150 250 Z\' fill=\'%231a1a1a\'/%3E%3Cpath d=\'M165 45 C150 20, 110 15, 90 30 C120 30, 140 40, 165 45 Z\' fill=\'%23888\'/%3E%3C/svg%3E")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))'
              }}
            />
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center w-full">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
              Ritual In Progress
            </span>
            <p className="text-xs text-zinc-300 font-serif italic">
              "Death is merely a transition into open-source enlightenment."
            </p>
          </div>

          {/* Shipped features summary */}
          <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-left w-full">
            <div className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] uppercase tracking-wider font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c53030]" /> Live in Cemetery
            </div>
            <ul className="text-[11px] font-mono text-zinc-400 space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c53030]" />
                <span>Avalanche C-Chain Smart Contracts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c53030]" />
                <span>Multi-Factor GraveScore Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c53030]" />
                <span>One-Click Memorial Share Cards</span>
              </li>
            </ul>
            <Link 
              to="/cemetery" 
              className="inline-block mt-2 text-[10px] font-mono text-red-400/90 hover:text-red-300 underline decoration-red-500/40"
            >
              Explore live graves →
            </Link>
          </div>
        </div>

        {/* Right Column: Roadmap Items */}
        <div className="flex-1 w-full space-y-6">
          <div className="space-y-2 border-b border-zinc-800/80 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c53030]">
              The Necrological Roadmap
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono text-white tracking-tight">
              Upcoming Sanctuary Rites
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans">
              Features being forged in the subterranean chambers of the cemetery.
            </p>
          </div>

          <div className="space-y-4">
            {UPCOMING_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.number}
                  className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-[#c53030]/60 transition-all flex items-start gap-4 shadow-xl group"
                >
                  <div className="p-3 rounded-xl bg-[#c53030]/10 border border-[#c53030]/30 text-[#c53030] shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#c53030] bg-[#c53030]/15 px-2 py-0.5 rounded">
                        PHASE 0{feature.number}
                      </span>
                      <h3 className="font-mono text-base sm:text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-300 font-serif italic">
                      "{feature.subtitle}"
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

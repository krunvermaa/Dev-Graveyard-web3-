import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  Ghost, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown,
  Sparkles,
  Share2
} from 'lucide-react';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { useAuth } from '../contexts/AuthContext';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What kind of projects belong in the Dev Graveyard?",
    answer: "Any project you worked on and eventually put aside, shelved, or rewrote. Whether it was a 48 hour hackathon build, a weekend experiment with a new framework, a side project that ran out of steam, or an open source library you no longer maintain. If you wrote code and stopped, you can lay it to rest here on Avalanche."
  },
  {
    question: "Do I have to make my code public or connect GitHub?",
    answer: "No. GitHub repository linking is completely optional. It is there so you can pull repo statistics with one click and earn the Open Source Sanctity bonus. You can also enter your project details manually, or leave the repo link empty."
  },
  {
    question: "Can I bury a project anonymously?",
    answer: "Yes. During the burial ritual, toggle Unmarked Grave. Your post-mortem, cause of death, and lessons learned will remain visible for other developers, while your wallet address and username stay hidden."
  },
  {
    question: "How does the GraveScore Engine calculate tombstone tiers?",
    answer: "GraveScore evaluates the depth of your written lessons, community respects and eulogies, project lifespan, open source status, and tech stack complexity. Scores determine your tombstone tier: Humble Headstone, Venerable Crypt, Monument of the Slain, or Mythic Mausoleum."
  },
  {
    question: "What does 'Press F to Pay Respects' actually do?",
    answer: "Pressing F increments the memorial respect counter on-chain, triggers rising soul embers, and acknowledges the hours invested into the build. Long pressing reveals the list of peers who visited the grave."
  },
  {
    question: "Can I delete or manage my grave if I decide to revive the project?",
    answer: "Yes. Through your undertaker profile My Yard, you can view your buried projects and manage or remove memorials whenever you choose."
  }
];

export const Home: React.FC = () => {
  const { account, userProfile } = useAuth();
  const [graves, setGraves] = useState<Grave[]>([]);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getGraves().then(data => {
      if (data && data.length > 0) {
        setGraves(data.slice(0, 3));
      }
    }).catch(err => console.error(err));
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-16 md:space-y-24 max-w-6xl mx-auto mb-20 px-4 sm:px-6 lg:px-8"
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-10 md:py-16 space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Crimson Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-36 bg-[#c53030]/15 blur-[80px] pointer-events-none rounded-full" />

        <div className="space-y-4 w-full max-w-3xl relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c53030]/40 bg-[#c53030]/10 text-xs font-mono text-[#f87171] uppercase tracking-widest shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse" />
            <span>Undertaker Sanctuary • @{userProfile?.username || (account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Dev')}</span>
          </div>

          <h1 className="font-bold tracking-tighter font-mono drop-shadow-[0_0_20px_rgba(205,32,32,0.6)] leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl w-full text-center text-[#dc2626]">
            Dev Graveyard
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed font-serif font-light max-w-xl mx-auto italic">
            "A resting place for abandoned developer projects and the lessons they left behind."
          </p>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Every developer has repositories that never made it to production. Late-night prototypes, side projects that lost steam, or architectures crushed by scope creep. Instead of letting that code rot forgotten on your disk, lay it to rest with dignity on Avalanche and pass down your lessons.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link to="/submit">
            <Button className="h-11 px-7 text-xs sm:text-sm font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030] text-white hover:bg-[#b02727] hover:border-[#b02727] shadow-[0_0_20px_rgba(197,48,48,0.4)] transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Bury a Project</span>
            </Button>
          </Link>

          <Link to="/cemetery">
            <Button variant="secondary" className="h-11 px-6 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-700 bg-surface text-zinc-100 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/60 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Search className="w-4 h-4 text-[#c53030]" />
              <span>Explore Cemetery</span>
            </Button>
          </Link>

          <Link to="/confessions">
            <Button variant="secondary" className="h-11 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Ghost className="w-4 h-4 text-[#c53030]" />
              <span>Confessions</span>
            </Button>
          </Link>

          <Link to="/leaderboard">
            <Button variant="secondary" className="h-11 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#c53030]" />
              <span>The Pantheon</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Recent Autopsies Preview */}
      {graves.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Recent Burials</span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">Latest Departed Projects</h2>
            </div>
            <Link to="/cemetery" className="text-xs font-mono text-[#c53030] hover:text-[#ef4444] flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-28 md:gap-y-36 pt-4 pb-8">
            {graves.map(grave => (
              <GraveCard 
                key={grave.id} 
                grave={grave} 
                onClick={() => setSelectedGrave(grave)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Core Philosophy Section */}
      <section className="border-t border-b border-zinc-900/80 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Our Purpose</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Why We Memorialize Dead Code
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Software development is an iterative craft of experiments. Here is what we believe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              🥀
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Normalize Failure</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Every experienced engineer has scrapped dozens of repositories. Stepping away from an unfeasible architecture or wrong idea is a normal part of building.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              📜
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Preserve The Epitaph</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              The project may be retired, but the technical autopsy remains valuable. Writing down what went wrong turns a discarded project into shared insight.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              🪦
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Honor The Effort</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Even if a project never launched to millions, your late nights and weekend sprints still taught you something real. Give your code an honorable resting place.
            </p>
          </div>
        </div>
      </section>

      {/* Complete Platform Features Tour */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Platform Guide</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Everything in Dev Graveyard
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            A walkthrough of the tools and features available to every developer in the sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Search className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Sanctuary</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Cemetery Feed</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Browse projects laid to rest by the community. Filter by programming language, framework, or cause of death such as Scope Creep, Technical Roadblocks, or Market Fit Missing.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/cemetery" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Browse Cemetery Graves</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">The Ritual</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Burial Ritual</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                A simple 3-step ceremony. Connect GitHub to auto-fill repo details, choose what brought the build down, and write your key lesson with AI Post-Mortem assistance.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/submit" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Bury a Fallen Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Flame className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Tributes</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Pay Respects &amp; Eulogies</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Press F to salute hours put into terminal windows. Leave technical thoughts on the Eulogy Wall, or dispatch a memorial directly to a peer developer.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/chats" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>View Crypt Dispatches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Inquiries</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-800/80 rounded-2xl bg-zinc-950/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-mono text-xs sm:text-sm text-zinc-200 hover:text-white cursor-pointer"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#c53030]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed border-t border-zinc-900 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

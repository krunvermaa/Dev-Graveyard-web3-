import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CauseOfDeath, GraveFormData, Grave } from '../types';
import { submitGrave } from '../services/graveService';
import { generateAiPostMortem } from '../services/aiPostMortemService';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { GraveCard } from '../components/GraveCard';
import { useAuth } from '../contexts/AuthContext';
import { GithubRepoPicker } from '../components/GithubRepoPicker';
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Shield, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubmissionState = 'idle' | 'burying' | 'soul-rising' | 'complete';
type StepNumber = 1 | 2 | 3;

const QUICK_CAUSE_CHIPS = [
  'Scope Creep',
  'Framework Fatigue',
  'Burnout',
  'Abandoned Prototypes',
  'Solitary Maintenance',
  'Lack of Time',
  'Market Fit Missing',
  'Technical Roadblocks'
];

export const SubmitGrave: React.FC = () => {
  const navigate = useNavigate();
  const { account, userProfile } = useAuth();
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [formData, setFormData] = useState<GraveFormData>({
    project_name: '',
    cause_of_death: 'Scope Creep',
    lived_for: '',
    lesson_learned: '',
    tech_stack: '',
    github_link: '',
    is_anonymous: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GraveFormData, string>>>({});

  // Sound effect synthesizer: Gothic Funeral Bell Toll
  const playFuneralBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Base fundamental bell tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now); // A2 deep resonant frequency
      osc1.frequency.exponentialRampToValueAtTime(108, now + 3);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      // Minor third harmonic for eerie church bell quality
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(216, now + 2.5);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 4);
      osc2.stop(now + 3);
    } catch (e) {
      // Audio playback fails gracefully if autoplay restricted
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required for the tombstone inscription.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.cause_of_death.trim()) {
      newErrors.cause_of_death = "Please specify a cause of death for the autopsy.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.project_name.trim()) newErrors.project_name = "Required for inscription.";
    if (!formData.lesson_learned.trim()) newErrors.lesson_learned = "Please share your hard-won wisdom.";
    if (formData.lesson_learned.trim().length < 10) newErrors.lesson_learned = "Elaborate slightly more (at least 10 characters).";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAiPostMortemAssist = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await generateAiPostMortem({
        projectName: formData.project_name || 'My Abandoned Project',
        causeOfDeath: formData.cause_of_death,
        livedFor: formData.lived_for,
        techStack: formData.tech_stack,
        githubLink: formData.github_link,
      });

      if (generated) {
        setFormData(prev => ({ ...prev, lesson_learned: generated }));
        if (errors.lesson_learned) {
          setErrors(prev => ({ ...prev, lesson_learned: undefined }));
        }
      }
    } catch (err) {
      console.error('AI post-mortem generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      if (!formData.project_name.trim()) setCurrentStep(1);
      else if (!formData.lesson_learned.trim() || formData.lesson_learned.trim().length < 10) setCurrentStep(3);
      return;
    }

    // Play funeral bell toll sound
    playFuneralBellSound();

    // Start Burial Animation Sequence
    setSubmissionState('burying');
    
    try {
      await submitGrave(
        formData, 
        account || undefined, 
        userProfile?.username || undefined,
        userProfile?.photoURL || undefined
      );

      // Phase 2: Transition to soul rising after grave descends (2.5s)
      setTimeout(() => {
        setSubmissionState('soul-rising');
        
        // Phase 3: Transition to completion after soul rises (3.5s)
        setTimeout(() => {
          setSubmissionState('complete');
          
          // Phase 4: Navigate to cemetery after reading completion message (2.5s)
          setTimeout(() => {
            navigate('/cemetery');
          }, 2500);
        }, 3500);
      }, 2500);

    } catch (error: any) {
      console.error('Failed to bury project:', error);
      setErrors(prev => ({ ...prev, project_name: error?.message || "Failed to commit burial transaction." }));
      setSubmissionState('idle');
    }
  };

  const causeOptions = [
    ...QUICK_CAUSE_CHIPS.map(c => ({ value: c, label: c })),
    ...Object.values(CauseOfDeath)
      .filter(c => !QUICK_CAUSE_CHIPS.includes(c))
      .map(c => ({ value: c, label: c }))
  ];

  // Preview Grave for calculation and dramatic descent animation
  const previewGrave: Grave = {
    ...formData,
    id: 'preview',
    created_at: new Date().toISOString(),
    user_name: userProfile?.username || (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You'),
    user_avatar: userProfile?.photoURL || undefined,
    respects: 0
  };

  // Burial Sequence View
  if (submissionState !== 'idle') {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center relative px-4">
        {/* Burying State: Card Descends */}
        {submissionState === 'burying' && (
          <div className="relative animate-grave-descend z-10 w-full max-w-md">
            <GraveCard grave={previewGrave} className="shadow-2xl opacity-90 scale-95" />
          </div>
        )}

        {/* Soul Rising State: Glowing Crimson Orb */}
        {submissionState === 'soul-rising' && (
          <div className="absolute z-20 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-[#c53030] shadow-[0_0_50px_18px_rgba(223,54,54,0.75)] animate-soul-rise" />
            <span className="mt-6 font-mono text-xs uppercase tracking-widest text-[#f87171] animate-pulse">
              Transcending the physical server into Avalanche...
            </span>
          </div>
        )}

        {/* Complete State: Text Fade In */}
        {submissionState === 'complete' && (
          <div className="text-center space-y-4 animate-fade-in max-w-md">
            <div className="text-5xl select-none" role="img" aria-label="resting headstone">🪦</div>
            <h2 className="text-2xl sm:text-3xl font-serif text-zinc-100 tracking-wide">
              {formData.project_name || 'Project'} laid to rest.
            </h2>
            <p className="text-[#c53030] font-mono text-xs sm:text-sm uppercase tracking-widest">
              May its code find peace in the eternal void.
            </p>
            <p className="text-zinc-500 font-mono text-xs">
              Redirecting to the sacred cemetery grounds...
            </p>
          </div>
        )}

        {/* Ground Line Visualization */}
        {submissionState === 'burying' && (
          <div className="absolute bottom-10 w-full h-px bg-zinc-800/80 shadow-[0_0_20px_rgba(0,0,0,1)] z-30" />
        )}
        
        <div className="absolute bottom-2 text-center w-full">
           {submissionState === 'burying' && (
             <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
               Commencing final burial rites on-chain...
             </p>
           )}
        </div>
      </div>
    );
  }

  // Interactive Guided Burial Ceremony Form
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 opacity-0 animate-fade-in-up px-3 sm:px-6">
      {/* Ceremony Header */}
      <div className="mb-6 sm:mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <span className="text-red-500">†</span> Final Burial Rites <span className="text-red-500">†</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 font-serif tracking-tight">
          Bury a Departed Project
        </h1>
        <p className="text-zinc-400 font-serif italic text-sm sm:text-base max-w-lg mx-auto">
          "Every abandoned repository was once a dream. Commemorate the build, archive the wisdom, and free your mind."
        </p>
      </div>

      {/* Step Flow Navigation Tracker */}
      <div className="mb-6 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : currentStep > 1
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className="truncate">Identity</span>
          </button>

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : currentStep > 2
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className="truncate">Demise</span>
          </button>

          {/* Step 3 Tab */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <span className="truncate">Epitaph</span>
          </button>
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-surface/50 p-6 sm:p-8 rounded-3xl border border-zinc-800 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c53030]/60 to-transparent" />

        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <Input 
                id="project_name"
                label="NAME OF THE DEPARTED *"
                placeholder="e.g. MyNextGenApp, VoxelForge, NeuralScribe"
                value={formData.project_name}
                onChange={(e) => {
                  setFormData({ ...formData, project_name: e.target.value });
                  if (errors.project_name) setErrors({ ...errors, project_name: undefined });
                }}
                error={errors.project_name}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                id="lived_for"
                label="LIVED FOR"
                placeholder="e.g. 6 months, 2 weekends, 3 years"
                value={formData.lived_for || ''}
                onChange={(e) => setFormData({ ...formData, lived_for: e.target.value })}
              />

              <Input 
                id="tech_stack"
                label="TECH STACK / ARTIFACTS"
                placeholder="e.g. Next.js, Rust, Avalanche, Python"
                value={formData.tech_stack || ''}
                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400">
                GITHUB REPOSITORY LINK (OPTIONAL)
              </label>
              <GithubRepoPicker
                value={formData.github_link || ''}
                onChange={(url, repo) => {
                  setFormData(prev => ({
                    ...prev,
                    github_link: url,
                    ...(repo?.language && !prev.tech_stack ? { tech_stack: repo.language } : {}),
                    ...(repo?.name && !prev.project_name ? { project_name: repo.name } : {})
                  }));
                }}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Demise</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DEMISE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400">
                CAUSE OF DEATH *
              </label>
              
              <Select
                id="cause_of_death"
                label=""
                value={formData.cause_of_death}
                onChange={(e) => {
                  setFormData({ ...formData, cause_of_death: e.target.value });
                  if (errors.cause_of_death) setErrors({ ...errors, cause_of_death: undefined });
                }}
                options={causeOptions}
              />

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Quick preset chips:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CAUSE_CHIPS.map((chip) => {
                    const isSelected = formData.cause_of_death === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFormData({ ...formData, cause_of_death: chip })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#c53030] text-white border border-[#c53030]'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                className="border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Write Epitaph</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: EPITAPH */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400">
                  LESSONS LEARNED / POST-MORTEM *
                </label>
                
                {/* AI Post-Mortem Button */}
                <button
                  type="button"
                  onClick={handleAiPostMortemAssist}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg transition-all cursor-pointer hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating AI Autopsy...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Post-Mortem Assist</span>
                    </>
                  )}
                </button>
              </div>

              <Textarea
                id="lesson_learned"
                placeholder="What was the critical flaw, architecture mistake, or painful revelation? Turn your wasted hours into a cautionary tale for peers."
                value={formData.lesson_learned}
                onChange={(e) => {
                  setFormData({ ...formData, lesson_learned: e.target.value });
                  if (errors.lesson_learned) setErrors({ ...errors, lesson_learned: undefined });
                }}
                rows={6}
                error={errors.lesson_learned}
              />
            </div>

            {/* Unmarked Grave (Anonymous Burial) Toggle */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Unmarked Grave (Anonymous Burial)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                  Hides your wallet address and username from the public tombstone card.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 text-[#c53030] focus:ring-[#c53030] cursor-pointer"
              />
            </div>

            <div className="pt-6 flex justify-between items-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                className="border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                type="submit"
                className="bg-[#c53030] hover:bg-[#b02727] text-white font-mono text-xs uppercase tracking-widest px-8 py-3 rounded-xl shadow-[0_0_25px_rgba(197,48,48,0.5)] flex items-center gap-2 cursor-pointer font-bold"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Conduct Burial Ceremony</span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

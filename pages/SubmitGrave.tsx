import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CauseOfDeath, GraveFormData, Grave } from '../types';
import { submitGrave } from '../services/graveService';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { GraveCard } from '../components/GraveCard';
import { useAuth } from '../contexts/AuthContext';
import { Search } from "lucide-react";

type SubmissionState = 'idle' | 'burying' | 'soul-rising' | 'complete';

export const SubmitGrave: React.FC = () => {
  const navigate = useNavigate();
  const { account, userProfile } = useAuth();
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  
  const [formData, setFormData] = useState<GraveFormData>({
    project_name: '',
    cause_of_death: CauseOfDeath.LACK_OF_TIME,
    lived_for: '',
    lesson_learned: '',
    tech_stack: '',
    github_link: '',
    is_anonymous: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GraveFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.project_name.trim()) newErrors.project_name = "Required for inscription.";
    if (!formData.lesson_learned.trim()) newErrors.lesson_learned = "Please share your wisdom.";
    if (formData.lesson_learned.length < 10) newErrors.lesson_learned = "Elaborate slightly more.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Start Animation Sequence
    setSubmissionState('burying');
    
    try {
      await submitGrave(
        formData, 
        account || undefined, 
        userProfile?.username || undefined,
        userProfile?.photoURL || undefined
      );
      
      // Step 2: Transition to soul rising after grave descends (2.5s)
      setTimeout(() => {
        setSubmissionState('soul-rising');
        
        // Step 3: Transition to completion after soul rises (3.5s)
        setTimeout(() => {
          setSubmissionState('complete');
          
          // Step 4: Navigate away after reading completion message (2s)
          setTimeout(() => {
            navigate('/home');
          }, 2500);
        }, 3500);
      }, 2500);

    } catch (error: any) {
      console.error('Failed to bury project', error);
      setErrors({ ...errors, project_name: "Failed to bury project. Please try again." });
      setSubmissionState('idle');
    }
  };

  const causeOptions = Object.values(CauseOfDeath).map(c => ({ value: c, label: c }));

  // Preview Grave for Animation
  const previewGrave: Grave = {
    ...formData,
    id: 'preview',
    created_at: new Date().toISOString()
  };

  if (submissionState !== 'idle') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center relative">
        
        {/* Burying State: Card Descends */}
        {submissionState === 'burying' && (
          <div className="relative animate-grave-descend z-10 w-full max-w-md">
            <GraveCard grave={previewGrave} className="shadow-2xl opacity-90 scale-95" />
          </div>
        )}

        {/* Soul Rising State: Glowing Orb */}
        {submissionState === 'soul-rising' && (
          <div className="absolute z-20 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-[#c53030] shadow-[0_0_40px_10px_rgba(223,54,54,0.6)] animate-soul-rise"></div>
          </div>
        )}

        {/* Complete State: Text Fade In */}
        {submissionState === 'complete' && (
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-2xl font-sans font-light text-zinc-300 tracking-wide">
              Project laid to rest.
            </h2>
            <p className="text-[#c53030] font-mono text-sm uppercase tracking-widest">
              Lesson Archived
            </p>
          </div>
        )}

        {/* Ground Line Visualization */}
        {submissionState === 'burying' && (
          <div className="absolute bottom-10 w-full h-px bg-zinc-800/50 shadow-[0_0_20px_rgba(0,0,0,1)] z-30" />
        )}
        
        <div className="absolute bottom-0 text-center w-full">
           {submissionState === 'burying' && (
             <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">Burying the project...</p>
           )}
        </div>
      </div>
    );
  }

  // Standard Form View
  return (
    <div className="max-w-xl mx-auto py-12 opacity-0 animate-fade-in-up">
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-3xl font-bold text-zinc-200 font-sans tracking-tight">Final Rites</h1>
        <p className="text-zinc-300 font-serif italic">
          "What is dead may never die, but rises again harder and stronger."
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-8 bg-surface/40 p-6 sm:p-8 md:p-10 rounded-2xl border border-zinc-800/50 backdrop-blur-sm shadow-2xl transition-all duration-700 hover:border-zinc-700/50 group"
      >
        <Input 
          id="project_name"
          label="NAME OF THE DEPARTED"
          placeholder="e.g. Project X"
          value={formData.project_name}
          onChange={e => setFormData({...formData, project_name: e.target.value})}
          error={errors.project_name}
          autoFocus
        />

        <div className="grid grid-cols-1 gap-8">
          <Select 
            id="cause_of_death"
            label="CAUSE OF DEATH"
            options={causeOptions}
            value={formData.cause_of_death}
            onChange={e => setFormData({...formData, cause_of_death: e.target.value as string})}
          />
        </div>

        <Textarea 
          id="lesson_learned"
          label="THE POST-MORTEM (LESSON)"
          placeholder="What wisdom did you gain from this failure?"
          value={formData.lesson_learned}
          onChange={e => setFormData({...formData, lesson_learned: e.target.value})}
          error={errors.lesson_learned}
          rows={5}
        />

        <div className="space-y-2">
          <Input 
            id="github_link"
            label="GITHUB REPOSITORY (OPTIONAL)"
            placeholder="https://github.com/username/repo"
            value={formData.github_link}
            onChange={e => setFormData({...formData, github_link: e.target.value})}
            type="url"
          />
        </div>

        <div className="flex items-center gap-3 pt-2 group/check">
          <input 
            type="checkbox" 
            id="is_anonymous"
            checked={formData.is_anonymous}
            onChange={e => setFormData({...formData, is_anonymous: e.target.checked})}
            className="appearance-none h-4 w-4 border border-zinc-700 bg-zinc-900 checked:bg-[#c53030]/20 checked:border-[#c53030] focus:ring-0 focus:outline-none transition-all duration-300 cursor-pointer"
          />
          <label htmlFor="is_anonymous" className="text-xs font-mono text-zinc-300 uppercase tracking-wide cursor-pointer hover:text-[#c53030] transition-colors">
            Bury in an unmarked grave (Anonymous)
          </label>
        </div>

        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 text-sm uppercase tracking-widest font-mono border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-code-red/40 transition-all duration-500"
            isLoading={false} // We handle custom loading state
          >
            Lay It to Rest
          </Button>
        </div>
      </form>
      
      <div className="text-center mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          className="text-xs font-mono text-zinc-300 hover:text-zinc-200 transition-colors uppercase tracking-widest border-b border-transparent hover:border-zinc-500 pb-0.5"
        >
          [ Cancel and Return ]
        </button>
      </div>
    </div>
  );
};
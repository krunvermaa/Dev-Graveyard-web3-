import React, { useState } from 'react';
import { GitBranch, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface GithubRepoPickerProps {
  onSelectRepo: (repoUrl: string, repoName: string, language: string | null) => void;
}

export const GithubRepoPicker: React.FC<GithubRepoPickerProps> = ({ onSelectRepo }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    // Very basic validation
    if (!repoUrl.includes('github.com')) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Parse github.com/owner/repo
      const parts = repoUrl.split('github.com/')[1]?.split('/');
      let repoName = 'unknown-repo';
      if (parts && parts.length >= 2) {
        repoName = parts[1];
      }
      
      onSelectRepo(repoUrl, repoName, null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to process GitHub link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 space-y-4">
      <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
        <form onSubmit={handleConnect} className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Link GitHub Repository
          </label>
          <div className="flex gap-2">
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="flex-1 bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-sm font-mono text-white"
            />
            <Button 
              type="submit"
              disabled={loading || !repoUrl}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
          </div>
          {error && <p className="text-[#c53030] text-[10px] font-mono uppercase text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

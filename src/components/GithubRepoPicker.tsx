import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitBranch, 
  Search, 
  Loader2, 
  Check, 
  Star, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { isValidGithubRepoUrl } from '../services/graveScoreService';

export const STORAGE_KEY_GH_USERNAME = 'devgraveyard_gh_username';
export const STORAGE_KEY_GH_REPOS = 'devgraveyard_gh_repos_cache';

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

interface GithubRepoPickerProps {
  onSelectRepo: (repoUrl: string, repoName: string, language: string | null) => void;
  selectedUrl?: string;
}

export const GithubRepoPicker: React.FC<GithubRepoPickerProps> = ({ onSelectRepo, selectedUrl }) => {
  const [username, setUsername] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GH_USERNAME) || '';
    } catch {
      return '';
    }
  });

  const [directUrl, setDirectUrl] = useState<string>(selectedUrl || '');
  const [repos, setRepos] = useState<Repo[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_GH_REPOS);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'manual'>('browse');

  const fetchUserRepos = useCallback(async (userToFetch: string) => {
    if (!userToFetch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cleanUser = userToFetch.trim().replace(/^@/, '');
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=updated`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`GitHub user "${cleanUser}" not found.`);
        } else if (res.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please enter repo URL manually below.');
        } else {
          throw new Error('Failed to fetch repositories from GitHub.');
        }
      }

      const data: Repo[] = await res.json();
      setRepos(data);
      try {
        localStorage.setItem(STORAGE_KEY_GH_USERNAME, cleanUser);
        localStorage.setItem(STORAGE_KEY_GH_REPOS, JSON.stringify(data));
      } catch {}
    } catch (err: any) {
      setError(err?.message || 'Error loading repositories.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchClick = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUserRepos(username);
  };

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    if (!isValidGithubRepoUrl(directUrl)) {
      setError('Please provide a valid GitHub repository link (e.g., https://github.com/owner/repo)');
      return;
    }

    setError(null);
    // Extract repository name
    const parts = directUrl.trim().replace(/\/$/, '').split('/');
    const repoName = parts[parts.length - 1] || 'shelved-project';
    onSelectRepo(directUrl.trim(), repoName, null);
  };

  const handleSelect = (repo: Repo) => {
    onSelectRepo(repo.html_url, repo.name, repo.language);
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
      {/* Title & Sanctity Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-[#c53030]" />
          <span className="font-bold uppercase tracking-wider text-zinc-200">
            Open Source Sanctity (+75 pts)
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold">
          Verified Repo
        </span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Summon by GitHub Handle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Paste Repository Link
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-3">
          {/* Username Fetch Form */}
          <form onSubmit={handleFetchClick} className="flex gap-2">
            <input
              type="text"
              placeholder="GitHub username (e.g. torvalds)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Fetch</span>
            </button>
          </form>

          {/* Search repos filter */}
          {repos.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filter repositories..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
            </div>
          )}

          {/* Repo List */}
          {repos.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredRepos.slice(0, 30).map((r) => {
                const isSelected = selectedUrl === r.html_url;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#c53030]/20 border-[#c53030] text-white font-bold'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{r.name}</span>
                        {r.fork && (
                          <span className="text-[9px] text-zinc-500 border border-zinc-800 px-1 rounded">
                            fork
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-sans">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {r.language && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {r.language}
                        </span>
                      )}
                      {r.stargazers_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{r.stargazers_count}</span>
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleDirectUrlSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#c53030] hover:bg-[#b02727] text-white font-semibold rounded-lg text-xs cursor-pointer"
            >
              Link Repo
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-2.5 bg-red-950/40 border border-red-800 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedUrl && (
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-emerald-400">
          <span className="truncate">Linked: {selectedUrl}</span>
          <a
            href={selectedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-0.5 text-zinc-400 shrink-0 ml-2"
          >
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

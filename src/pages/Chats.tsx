import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SharedGravesViewer } from '../components/SharedGravesViewer';
import { GraveModal } from '../components/GraveModal';
import { Grave, SharedGrave } from '../types';
import { getGrave } from '../services/graveService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Loader2, MessageSquare, Send, Inbox, Trash2, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const Chats: React.FC = () => {
  const { account, userProfile } = useAuth();
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [loadingGraveId, setLoadingGraveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [sharedGraves, setSharedGraves] = useState<SharedGrave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;
    try {
      const storageKey = `devgraveyard_shared_graves_${account.toLowerCase()}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSharedGraves(JSON.parse(saved));
      } else {
        // Sample memorial dispatch for demo if storage is empty
        const sampleDispatches: SharedGrave[] = [
          {
            id: 'sample-dispatch-1',
            graveId: 'sample-neural-scribe',
            graveName: 'NeuralScribe AI',
            fromUserId: '0x1111111111111111111111111111111111111111',
            fromUsername: 'vector_ghost',
            direction: 'received',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ];
        setSharedGraves(sampleDispatches);
        localStorage.setItem(storageKey, JSON.stringify(sampleDispatches));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [account]);

  const handleSelectGrave = async (graveId: string) => {
    setLoadingGraveId(graveId);
    try {
      const grave = await getGrave(graveId);
      if (grave) {
        setSelectedGrave(grave);
      } else {
        alert("This grave could not be summoned from the catacombs.");
      }
    } catch (err) {
      console.error("Error opening shared grave:", err);
    } finally {
      setLoadingGraveId(null);
    }
  };

  const handleDeleteDispatch = (id: string) => {
    if (!account) return;
    const updated = sharedGraves.filter(item => item.id !== id);
    setSharedGraves(updated);
    localStorage.setItem(`devgraveyard_shared_graves_${account.toLowerCase()}`, JSON.stringify(updated));
  };

  const displayedDispatches = sharedGraves.filter(item => 
    activeTab === 'received' ? item.direction !== 'sent' : item.direction === 'sent'
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-fade-in pb-24">
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
          Crypt Dispatches
        </h1>
        <p className="text-zinc-400 font-mono text-xs sm:text-sm uppercase tracking-widest max-w-md mx-auto">
          Memorials dispatched directly between developers in the sanctuary.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-[#c53030] text-white shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Received Memorials</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-[#c53030] text-white shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatched by Me</span>
          </button>
        </div>
      </div>

      {/* Dispatches List / Empty State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#c53030] animate-spin" />
        </div>
      ) : displayedDispatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 border border-zinc-800/80 bg-zinc-950/60 rounded-3xl text-center space-y-4 shadow-xl">
          <span className="text-4xl select-none" role="img" aria-label="mailbox">🪦</span>
          <div className="space-y-1">
            <h3 className="font-mono text-base font-bold text-zinc-200">
              {activeTab === 'received' ? 'Your Crypt Inbox is Silent' : 'No Dispatched Memorials Yet'}
            </h3>
            <p className="text-zinc-500 font-mono text-xs max-w-md mx-auto leading-relaxed">
              {activeTab === 'received'
                ? 'When peers or friends dispatch a tombstone inscription to you, it will appear here.'
                : 'You can dispatch any tombstone to fellow undertakers directly from its memorial page.'}
            </p>
          </div>
          <Link to="/cemetery">
            <Button variant="secondary" className="mt-2 text-xs font-mono uppercase border-zinc-700 hover:border-[#c53030]">
              Explore Cemetery
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedDispatches.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-[#c53030]/60 transition-all flex items-center justify-between gap-4 shadow-xl group"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                onClick={() => handleSelectGrave(item.graveId)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030] shrink-0">
                  <span className="text-lg">🪦</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-mono font-bold text-base text-zinc-100 group-hover:text-red-400 transition-colors truncate">
                    {item.graveName}
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 truncate">
                    {activeTab === 'received' 
                      ? `Dispatched by @${item.fromUsername}` 
                      : `Sent to @${item.toUsername || 'friend'}`} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleSelectGrave(item.graveId)}
                  disabled={loadingGraveId === item.graveId}
                  className="bg-zinc-900 hover:bg-[#c53030] text-zinc-200 hover:text-white border border-zinc-800 text-xs font-mono uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  {loadingGraveId === item.graveId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => handleDeleteDispatch(item.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Dismiss from inbox"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

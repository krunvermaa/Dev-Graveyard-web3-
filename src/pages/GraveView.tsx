import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Grave } from '../types';
import { getGrave } from '../services/graveService';
import { GraveModal } from '../components/GraveModal';
import { Loader2, ArrowLeft, Ghost } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const GraveView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grave, setGrave] = useState<Grave | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrave = async () => {
      if (!id) return;
      try {
        const fetchedGrave = await getGrave(id);
        if (fetchedGrave) {
          setGrave(fetchedGrave);
        }
      } catch (err) {
        console.error("Error fetching grave memorial:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrave();
  }, [id]);

  // Dynamically update document title & meta tags for social shareability
  useEffect(() => {
    if (!grave) return;

    const previousTitle = document.title;
    const newTitle = `${grave.project_name} | Dev Graveyard Memorial`;
    document.title = newTitle;

    const descContent = `Memorial for "${grave.project_name}". Cause of Death: ${grave.cause_of_death}. "${grave.lesson_learned || 'May its code rest in peace.'}" — Laid to rest in the Dev Graveyard on Avalanche C-Chain.`;

    const setOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
      return meta;
    };

    setOrCreateMeta('name', 'description', descContent);
    setOrCreateMeta('property', 'og:title', newTitle);
    setOrCreateMeta('property', 'og:description', descContent);
    setOrCreateMeta('name', 'twitter:title', newTitle);
    setOrCreateMeta('name', 'twitter:description', descContent);

    return () => {
      document.title = previousTitle;
    };
  }, [grave]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 text-[#c53030] animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Summoning tombstone from the catacombs...
        </p>
      </div>
    );
  }

  if (!grave) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <Ghost className="w-16 h-16 text-zinc-700 animate-pulse" />
        <h2 className="text-2xl font-mono font-bold text-white">Grave Not Found</h2>
        <p className="text-zinc-500 font-mono text-xs max-w-sm">
          This memorial may have dissolved into the void or never existed.
        </p>
        <Link to="/cemetery">
          <Button variant="secondary" className="border-zinc-800 text-[#c53030] hover:border-[#c53030]/50 font-mono text-xs uppercase">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Return to Cemetery
          </Button>
        </Link>
      </div>
    );
  }

  // Host modal with permalink route behavior: closing navigates back to /cemetery
  return (
    <div className="fixed inset-0 z-50">
      <GraveModal grave={grave} onClose={() => navigate('/cemetery')} />
    </div>
  );
};

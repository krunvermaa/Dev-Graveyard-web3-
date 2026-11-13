import React, { useRef, useState, useEffect } from 'react';
import { Grave } from '../types';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';
import { calculateGraveScore } from '../services/graveScoreService';
import { trackCardShared } from '../services/analyticsService';
import { Copy, Check, Download, X, Loader2, Sparkles, Image as ImageIcon, Link2, Share2 } from 'lucide-react';

interface ShareCardModalProps {
  grave: Grave;
  respects: number;
  eulogiesCount: number;
  graveOwnerUsername: string | null;
  onClose: () => void;
}

type ThemeKey = 'minimal-noir' | 'moonlit' | 'cyberpunk';
type FormatKey = 'square' | 'landscape';

interface ThemeConfig {
  name: string;
  bgHex: string;
  cardBgHex: string;
  borderHex: string;
  accentHex: string;
  textMainHex: string;
  textSubHex: string;
  badgeBgHex: string;
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
  'minimal-noir': {
    name: 'Minimal Noir',
    bgHex: '#050505',
    cardBgHex: '#0c0c0e',
    borderHex: '#27272a',
    accentHex: '#ef4444',
    textMainHex: '#ffffff',
    textSubHex: '#a1a1aa',
    badgeBgHex: 'rgba(239, 68, 68, 0.12)',
  },
  'moonlit': {
    name: 'Moonlit',
    bgHex: '#060a14',
    cardBgHex: '#0b1325',
    borderHex: '#1e3a8a',
    accentHex: '#60a5fa',
    textMainHex: '#f8fafc',
    textSubHex: '#94a3b8',
    badgeBgHex: 'rgba(96, 165, 250, 0.14)',
  },
  'cyberpunk': {
    name: 'Cyberpunk',
    bgHex: '#05080f',
    cardBgHex: '#081220',
    borderHex: '#00ffcc',
    accentHex: '#00ffcc',
    textMainHex: '#ffffff',
    textSubHex: '#67e8f9',
    badgeBgHex: 'rgba(0, 255, 204, 0.15)',
  },
};

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  grave,
  respects,
  eulogiesCount,
  graveOwnerUsername,
  onClose,
}) => {
  const [theme, setTheme] = useState<ThemeKey>('minimal-noir');
  const [format, setFormat] = useState<FormatKey>('square');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const exportCardRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES[theme];
  const score = calculateGraveScore(grave);

  const qrUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#/grave/${grave.id}`
    : `https://originaldevgraveyard-avalanche.vercel.app/#/grave/${grave.id}`;

  const ownerName = graveOwnerUsername || grave.user_name || 'Unknown Developer';
  const techStackList = grave.tech_stack 
    ? grave.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const titleLength = grave.project_name.length;
  const getSquareTitleFontSize = () => {
    if (titleLength <= 14) return '52px';
    if (titleLength <= 24) return '42px';
    if (titleLength <= 36) return '34px';
    return '28px';
  };

  const getLandscapeTitleFontSize = () => {
    if (titleLength <= 16) return '46px';
    if (titleLength <= 28) return '36px';
    return '28px';
  };

  const generateBlob = async (): Promise<Blob | null> => {
    if (!exportCardRef.current) return null;
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      const canvas = await html2canvas(exportCardRef.current, {
        scale: 2,
        backgroundColor: currentTheme.bgHex,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    } catch (err) {
      console.error('Failed to render memorial card', err);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('Could not generate image');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeProjectName = grave.project_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${safeProjectName}-memorial.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      trackCardShared('download_png', { grave_id: grave.id, format, theme });
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download image. You can copy the memorial text snippet below.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(qrUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = qrUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      trackCardShared('copy_link', { grave_id: grave.id, format, theme });
    } catch (err) {
      console.error('Copy link error:', err);
    }
  };

  const handleShareTwitter = () => {
    const text = `I laid my project "${grave.project_name}" to rest in the @DevGraveyard Avalanche Web3 🪦 Cause of death: ${grave.cause_of_death}. May its code rest in peace.`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(qrUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    trackCardShared('x', { grave_id: grave.id, format, theme });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${grave.project_name} | Dev Graveyard Memorial`,
          text: `I laid my project "${grave.project_name}" to rest in the @DevGraveyard Avalanche Web3 🪦 Cause of death: ${grave.cause_of_death}. May its code rest in peace.`,
          url: qrUrl,
        });
        trackCardShared('native', { grave_id: grave.id, format, theme });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Native share failed, falling back to copy link', err);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyImage = async () => {
    setIsExporting(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('Could not generate image');

      if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        trackCardShared('copy_image', { grave_id: grave.id, format, theme });
      } else {
        handleCopySnippet();
      }
    } catch (err) {
      console.warn('Clipboard write image failed, falling back to snippet', err);
      handleCopySnippet();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySnippet = async () => {
    const snippet = `🪦 Rest In Peace: ${grave.project_name}\n` +
      `💀 Cause of Death: ${grave.cause_of_death}\n` +
      `⏳ Lived For: ${grave.lived_for || 'Unknown'}\n` +
      `🛠️ Tech Stack: ${grave.tech_stack || 'Code'}\n\n` +
      `"${grave.lesson_learned}"\n\n` +
      `Laid to rest on Avalanche C-Chain by @${ownerName}\n` +
      `Pay your respects: ${qrUrl}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = snippet;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
      trackCardShared('copy_snippet', { grave_id: grave.id, format, theme });
    } catch (err) {
      console.error('Copy text error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 z-10 max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="Tombstone">🪦</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wider uppercase">
                Memorial Share Card
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Avalanche C-Chain immutable memorial &amp; viral dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Format & Theme */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Format selector */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setFormat('square')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                format === 'square' ? 'bg-[#c53030] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Square (1:1)
            </button>
            <button
              onClick={() => setFormat('landscape')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                format === 'landscape' ? 'bg-[#c53030] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Banner (16:9)
            </button>
          </div>

          {/* Theme selector */}
          <div className="flex items-center gap-1.5">
            {(Object.keys(THEMES) as ThemeKey[]).map((tKey) => {
              const th = THEMES[tKey];
              const isSelected = theme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => setTheme(tKey)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white text-white font-bold shadow-md bg-zinc-800'
                      : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 bg-zinc-900/60'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: th.accentHex }} />
                  {th.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Responsive Card Preview */}
        <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-black/60 rounded-xl border border-zinc-900 overflow-hidden">
          <div
            className={`w-full transition-all duration-300 rounded-2xl border p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative ${
              format === 'square' ? 'max-w-md aspect-square' : 'max-w-xl aspect-[1200/650]'
            }`}
            style={{
              backgroundColor: currentTheme.cardBgHex,
              borderColor: currentTheme.borderHex,
              color: currentTheme.textMainHex,
            }}
          >
            {/* Ambient subtle glow */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl"
              style={{ backgroundColor: currentTheme.accentHex }}
            />

            {/* Top Bar: Cause of Death & Brand */}
            <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: currentTheme.borderHex }}>
              <span
                className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-semibold border"
                style={{
                  backgroundColor: currentTheme.badgeBgHex,
                  color: currentTheme.accentHex,
                  borderColor: currentTheme.accentHex,
                }}
              >
                {grave.cause_of_death}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-70" style={{ color: currentTheme.textSubHex }}>
                Dev Graveyard Avalanche
              </span>
            </div>

            {/* Main Center Content */}
            <div className="my-auto py-2 space-y-2">
              <h3
                className="font-bold font-sans tracking-tight leading-tight break-words"
                style={{
                  fontSize: format === 'square' ? 'clamp(1.4rem, 4.5vw, 2.2rem)' : 'clamp(1.2rem, 3.8vw, 1.8rem)',
                  color: currentTheme.textMainHex,
                }}
              >
                {grave.project_name}
              </h3>

              <p className="font-mono text-xs opacity-75" style={{ color: currentTheme.textSubHex }}>
                Laid to rest by <span style={{ color: currentTheme.accentHex }}>@{ownerName}</span>
                {grave.lived_for && ` • Lived: ${grave.lived_for}`}
              </p>

              {/* Lesson Learned Block */}
              <div
                className="p-3 rounded-xl border-l-4 mt-2"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderColor: currentTheme.accentHex,
                }}
              >
                <p className="font-serif italic text-xs sm:text-sm leading-relaxed" style={{ color: currentTheme.textMainHex }}>
                  "{grave.lesson_learned}"
                </p>
              </div>

              {/* Tech Stack Pills */}
              {techStackList.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {techStackList.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono border"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: currentTheme.borderHex,
                        color: currentTheme.textSubHex,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {techStackList.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono opacity-60" style={{ color: currentTheme.textSubHex }}>
                      +{techStackList.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar: Stats & QR */}
            <div className="flex items-center justify-between pt-2.5 border-t gap-2" style={{ borderColor: currentTheme.borderHex }}>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-1">
                  <span>🌹</span>
                  <span className="font-bold">{respects}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📜</span>
                  <span className="font-bold">{eulogiesCount}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: currentTheme.accentHex }}>
                  <Sparkles className="w-3 h-3" />
                  <span className="font-bold">{score}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1 bg-white rounded shadow">
                  <QRCodeCanvas value={qrUrl} size={36} bgColor="#ffffff" fgColor="#000000" level="M" />
                </div>
                <span className="text-[9px] font-mono hidden sm:inline opacity-70" style={{ color: currentTheme.textSubHex }}>
                  Scan to mourn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share & Direct Dispatch Bar */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <span>📢</span> Broadcast Funeral
            </span>
            {copiedLink && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md animate-fade-in flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied to Clipboard!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Share to X (Twitter) */}
            <button
              onClick={handleShareTwitter}
              className="min-h-[44px] px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-black hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Share to X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share to X</span>
            </button>

            {/* Native Share */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="min-h-[44px] px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Open native mobile/system share sheet"
              >
                <Share2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Share...</span>
              </button>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                !canNativeShare ? 'col-span-2 sm:col-span-1' : ''
              } ${
                copiedLink 
                  ? 'border-emerald-600 bg-emerald-950/70 text-emerald-300 font-bold' 
                  : 'border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white'
              }`}
              title="Copy direct link to this memorial"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Link2 className="w-3.5 h-3.5 shrink-0" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Media Generation & Download Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySnippet}
              className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSnippet ? 'Snippet Copied!' : 'Copy Snippet'}</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <ImageIcon className="w-4 h-4" />}
              <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="min-h-[44px] px-5 py-2.5 bg-[#c53030] hover:bg-[#b91c1c] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Generating (2x)...' : 'Download Card'}</span>
          </button>
        </div>
      </motion.div>

      {/* Offscreen Pure Pixel Export Target (Always fully rendered with fixed pixel dimensions so html2canvas never cuts off or offsets) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {format === 'square' ? (
          // Square Export Node: 1080 x 1080 px
          <div
            ref={exportCardRef}
            style={{
              width: '1080px',
              height: '1080px',
              backgroundColor: currentTheme.bgHex,
              padding: '64px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Card Shell */}
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: currentTheme.cardBgHex,
                border: `3px solid ${currentTheme.borderHex}`,
                borderRadius: '32px',
                padding: '56px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `2px solid ${currentTheme.borderHex}`,
                  paddingBottom: '28px',
                }}
              >
                <div
                  style={{
                    backgroundColor: currentTheme.badgeBgHex,
                    color: currentTheme.accentHex,
                    border: `2px solid ${currentTheme.accentHex}`,
                    borderRadius: '9999px',
                    padding: '8px 24px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  {grave.cause_of_death}
                </div>

                <div
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '16px',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: currentTheme.textSubHex,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>🪦</span>
                  <span>DEV GRAVEYARD AVALANCHE</span>
                </div>
              </div>

              {/* Center Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: 'auto 0' }}>
                <h1
                  style={{
                    fontSize: getSquareTitleFontSize(),
                    fontWeight: 800,
                    color: currentTheme.textMainHex,
                    lineHeight: 1.15,
                    margin: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {grave.project_name}
                </h1>

                <div
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '20px',
                    color: currentTheme.textSubHex,
                  }}
                >
                  Laid to rest on Avalanche by <span style={{ color: currentTheme.accentHex, fontWeight: 'bold' }}>@{ownerName}</span>
                  {grave.lived_for && ` • Lived for: ${grave.lived_for}`}
                </div>

                {/* Lesson learned block */}
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderLeft: `6px solid ${currentTheme.accentHex}`,
                    borderRadius: '16px',
                    padding: '28px 32px',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: currentTheme.textSubHex,
                      marginBottom: '10px',
                    }}
                  >
                    Epitaph &amp; Lesson Learned
                  </div>
                  <p
                    style={{
                      fontFamily: 'Crimson Pro, Times New Roman, serif',
                      fontStyle: 'italic',
                      fontSize: '28px',
                      lineHeight: 1.45,
                      color: currentTheme.textMainHex,
                      margin: 0,
                    }}
                  >
                    "{grave.lesson_learned}"
                  </p>
                </div>

                {/* Tech Stack */}
                {techStackList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
                    {techStackList.slice(0, 6).map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: `1.5px solid ${currentTheme.borderHex}`,
                          borderRadius: '8px',
                          padding: '6px 16px',
                          fontFamily: 'Space Mono, monospace',
                          fontSize: '16px',
                          color: currentTheme.textSubHex,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `2px solid ${currentTheme.borderHex}`,
                  paddingTop: '28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🌹</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '22px', fontWeight: 'bold', color: currentTheme.textMainHex }}>
                      {respects} RIPs
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📜</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '22px', fontWeight: 'bold', color: currentTheme.textMainHex }}>
                      {eulogiesCount} Eulogies
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: currentTheme.accentHex }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '22px', fontWeight: 'bold' }}>
                      {score} GraveScore
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: currentTheme.textSubHex, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Scan to Pay Respects
                    </div>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: currentTheme.accentHex }}>
                      Avalanche C-Chain
                    </div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                    <QRCodeCanvas value={qrUrl} size={90} bgColor="#ffffff" fgColor="#000000" level="H" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Landscape Export Node: 1200 x 630 px (Standard OG/Social Banner)
          <div
            ref={exportCardRef}
            style={{
              width: '1200px',
              height: '630px',
              backgroundColor: currentTheme.bgHex,
              padding: '40px 50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: currentTheme.cardBgHex,
                border: `2px solid ${currentTheme.borderHex}`,
                borderRadius: '24px',
                padding: '36px 44px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1.5px solid ${currentTheme.borderHex}`,
                  paddingBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: currentTheme.badgeBgHex,
                    color: currentTheme.accentHex,
                    border: `1.5px solid ${currentTheme.accentHex}`,
                    borderRadius: '9999px',
                    padding: '6px 18px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  {grave.cause_of_death}
                </div>

                <div
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '14px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: currentTheme.textSubHex,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🪦</span>
                  <span>DEV GRAVEYARD AVALANCHE</span>
                </div>
              </div>

              {/* Center Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: 'auto 0' }}>
                <h1
                  style={{
                    fontSize: getLandscapeTitleFontSize(),
                    fontWeight: 800,
                    color: currentTheme.textMainHex,
                    lineHeight: 1.15,
                    margin: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {grave.project_name}
                </h1>

                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '16px', color: currentTheme.textSubHex }}>
                  Laid to rest on Avalanche by <span style={{ color: currentTheme.accentHex, fontWeight: 'bold' }}>@{ownerName}</span>
                  {grave.lived_for && ` • Lived: ${grave.lived_for}`}
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderLeft: `4px solid ${currentTheme.accentHex}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Crimson Pro, Times New Roman, serif',
                      fontStyle: 'italic',
                      fontSize: '20px',
                      lineHeight: 1.4,
                      color: currentTheme.textMainHex,
                      margin: 0,
                    }}
                  >
                    "{grave.lesson_learned}"
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `1.5px solid ${currentTheme.borderHex}`,
                  paddingTop: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🌹</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '16px', fontWeight: 'bold', color: currentTheme.textMainHex }}>
                      {respects} RIPs
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>📜</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '16px', fontWeight: 'bold', color: currentTheme.textMainHex }}>
                      {eulogiesCount} Eulogies
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentTheme.accentHex }}>
                    <span style={{ fontSize: '16px' }}>⚡</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '16px', fontWeight: 'bold' }}>
                      {score} GraveScore
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: currentTheme.textSubHex, textTransform: 'uppercase' }}>
                      Scan to Mourn
                    </div>
                  </div>
                  <div style={{ padding: '4px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
                    <QRCodeCanvas value={qrUrl} size={50} bgColor="#ffffff" fgColor="#000000" level="M" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

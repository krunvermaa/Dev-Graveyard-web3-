import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vy: number;
  vx: number;
  sinOffset: number;
  sinSpeed: number;
}

// -------------------------------------------------------------
// Gothic Web Audio API Synthesizer (Zero External Assets)
// -------------------------------------------------------------
class GothicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscDrone1: OscillatorNode | null = null;
  private oscDrone2: OscillatorNode | null = null;
  private oscEthereal: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  public startAmbient() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Master Gain for subtle atmospheric sound
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.045, now + 3); // Slow 3s haunting fade-in

      // Biquad filter (simulates resonant stone chamber / wind howl)
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(260, now);
      this.filter.Q.setValueAtTime(3.5, now);

      // LFO for drifting wind pressure
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.08, now); // Very slow 12s cycle

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(110, now); // Modulate filter cutoff +/- 110Hz

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);

      // Low Drone 1 (Sub A0 / 55Hz fundamental)
      this.oscDrone1 = this.ctx.createOscillator();
      this.oscDrone1.type = 'sine';
      this.oscDrone1.frequency.setValueAtTime(55, now);

      // Low Drone 2 (Detuned 54.3Hz for binaural beating)
      this.oscDrone2 = this.ctx.createOscillator();
      this.oscDrone2.type = 'triangle';
      this.oscDrone2.frequency.setValueAtTime(54.4, now);

      // Ethereal overtone (E2 / 82.4Hz)
      this.oscEthereal = this.ctx.createOscillator();
      this.oscEthereal.type = 'sine';
      this.oscEthereal.frequency.setValueAtTime(82.4, now);

      // Connect nodes
      this.oscDrone1.connect(this.filter);
      this.oscDrone2.connect(this.filter);
      this.oscEthereal.connect(this.filter);
      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Start oscillators
      this.oscDrone1.start(now);
      this.oscDrone2.start(now);
      this.oscEthereal.start(now);
      this.lfo.start(now);

      this.isPlaying = true;
      this.notifyState();
    } catch (err) {
      console.warn("Gothic Audio Ambient could not start:", err);
    }
  }

  public stopAmbient() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }
      setTimeout(() => {
        try {
          this.oscDrone1?.stop();
          this.oscDrone2?.stop();
          this.oscEthereal?.stop();
          this.lfo?.stop();
          this.oscDrone1?.disconnect();
          this.oscDrone2?.disconnect();
          this.oscEthereal?.disconnect();
          this.filter?.disconnect();
          this.masterGain?.disconnect();
        } catch {}
        this.isPlaying = false;
        this.notifyState();
      }, 1300);
    } catch {
      this.isPlaying = false;
      this.notifyState();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stopAmbient();
      try { localStorage.setItem('devgraveyard_ambient_audio', 'false'); } catch {}
      return false;
    } else {
      this.startAmbient();
      try { localStorage.setItem('devgraveyard_ambient_audio', 'true'); } catch {}
      return true;
    }
  }

  /**
   * Sound effect: Heavy stone resonance tap / click on grave cards
   */
  public playGraveInteraction() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  /**
   * Sound effect: Ethereal soul rise / respect paid
   */
  public playRespectChime() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Dual harmonic chimes (F4 -> C5 / 349Hz + 523Hz)
      const freqs = [349.23, 523.25, 698.46];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.04 + 0.6);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.85);
      });
    } catch {}
  }

  private notifyState() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('devgraveyard-audio-change', {
          detail: { isPlaying: this.isPlaying }
        })
      );
    }
  }
}

// Global engine singleton
export const gothicAudio = new GothicAudioEngine();

// Convenience global triggers
export const toggleGothicAudio = () => gothicAudio.toggle();
export const playGraveSound = () => gothicAudio.playGraveInteraction();
export const playRespectSound = () => gothicAudio.playRespectChime();

// -------------------------------------------------------------
// Visual Atmosphere Component (Canvas Mist & Soul Orbs)
// -------------------------------------------------------------
export const Atmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Restore saved audio preference if user previously opted in and clicked anywhere
    const autoResume = () => {
      try {
        const pref = localStorage.getItem('devgraveyard_ambient_audio');
        if (pref === 'true' && !gothicAudio.isActive()) {
          gothicAudio.startAmbient();
        }
      } catch {}
      window.removeEventListener('click', autoResume);
      window.removeEventListener('keydown', autoResume);
    };

    window.addEventListener('click', autoResume, { once: true });
    window.addEventListener('keydown', autoResume, { once: true });

    return () => {
      window.removeEventListener('click', autoResume);
      window.removeEventListener('keydown', autoResume);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0));
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile: 14 particles; Desktop: 32 particles
    const particleCount = prefersReducedMotion ? 0 : isMobile ? 14 : 32;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

    const initParticles = () => {
      particles = [];
      const colors = [
        'rgba(197, 48, 48, ',  // Crimson blood ember
        'rgba(248, 113, 113, ', // Bright flame red
        'rgba(161, 161, 170, ', // Crypt grey soul
        'rgba(20, 184, 166, ',  // Ethereal teal mist
        'rgba(245, 158, 11, ',  // Amber relic glow
      ];

      for (let i = 0; i < particleCount; i++) {
        const baseAlpha = 0.12 + Math.random() * 0.28;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 1.6 + 0.7) * (isMobile ? 0.9 : 1.2),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: baseAlpha,
          baseAlpha,
          vy: -(Math.random() * 0.35 + 0.15),
          vx: (Math.random() - 0.5) * 0.18,
          sinOffset: Math.random() * Math.PI * 2,
          sinSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0 && !prefersReducedMotion) {
        initParticles();
      }
    };

    handleResize();
    initParticles();

    let lastTime = performance.now();
    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible || prefersReducedMotion) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.sinOffset += p.sinSpeed;
        p.x += p.vx + Math.sin(p.sinOffset) * 0.3;
        p.y += p.vy * (delta * 60);

        p.alpha = p.baseAlpha + Math.sin(p.sinOffset) * 0.08;

        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        } else if (p.y > height + 15) {
          p.y = -15;
        }
        if (p.x < -15) p.x = width + 15;
        else if (p.x > width + 15) p.x = -15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.04, Math.min(1, p.alpha))})`;
        ctx.shadowColor = p.color + '0.6)';
        ctx.shadowBlur = isMobile ? 3 : 6;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };

    let resizeTimeout: any = null;
    const onResizeThrottled = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleResize();
      }, 150);
    };

    window.addEventListener('resize', onResizeThrottled, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResizeThrottled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Deep static gradient background base */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#050505] to-black opacity-60 pointer-events-none" 
      />

      {/* 2 Feathered mist layers with strict containment */}
      {[...Array(2)].map((_, i) => (
        <div
          key={`mist-${i}`}
          className="absolute bottom-[-20%] w-[50vw] h-[35vh] bg-zinc-800/10 rounded-[100%] blur-[25px] animate-mist-rise pointer-events-none"
          style={{
            left: i === 0 ? '8%' : '52%',
            animationDelay: `${i * 10}s`,
            animationDuration: `${32 + i * 14}s`,
            contain: 'strict',
            willChange: 'transform, opacity'
          }}
        />
      ))}
      
      {/* Subtle life/death accents with gentle blur */}
      <div 
        className="absolute top-1/4 left-1/4 w-[240px] md:w-[380px] h-[240px] md:h-[380px] bg-[#c53030]/5 rounded-full blur-[30px] pointer-events-none" 
        style={{ contain: 'strict' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-[260px] md:w-[400px] h-[260px] md:h-[400px] bg-teal-900/5 rounded-full blur-[30px] pointer-events-none" 
        style={{ contain: 'strict' }}
      />

      {/* Hardware-accelerated High Performance Embers/Souls Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{ contain: 'strict' }}
      />
    </div>
  );
};

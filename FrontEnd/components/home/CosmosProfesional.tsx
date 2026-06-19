'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export default function CosmosProfesional() {
  const t = useTranslations('cosmos_profesional');
  const [starStyle, setStarStyle] = useState('punta4');
  const [showLines, setShowLines] = useState(false);
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [cardState, setCardState] = useState<{ x: number; y: number; below: boolean; caretLeft: number } | null>(null);
  const [formed, setFormed] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(SVGGElement | null)[]>([]);

  // Constellation Data
  const stars = [
    { id: 0, x: 12, y: 32, color: 'var(--accent)', mag: 'norm', point: { title: t('stars.0.title'), desc: t('stars.0.desc') } },
    { id: 1, x: 32, y: 19, color: 'var(--primary)', mag: 'norm', point: { title: t('stars.1.title'), desc: t('stars.1.desc') } },
    { id: 2, x: 50, y: 43, color: 'var(--highlight)', mag: 'bright', point: { title: t('stars.2.title'), desc: t('stars.2.desc') } },
    { id: 3, x: 68, y: 19, color: 'var(--magenta)', mag: 'norm', point: { title: t('stars.3.title'), desc: t('stars.3.desc') } },
    { id: 4, x: 88, y: 32, color: 'var(--warning)', mag: 'bright', point: { title: t('stars.4.title'), desc: t('stars.4.desc') } },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
  ];

  useEffect(() => {
    const timer = setTimeout(() => setFormed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const positionCard = useCallback((starIndex: number) => {
    const starEl = starsRef.current[starIndex];
    const cardEl = cardRef.current;
    if (!starEl || !cardEl) return;

    const hitArea = starEl.querySelector('.hit');
    if (!hitArea) return;

    const r = hitArea.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cw = cardEl.offsetWidth;
    const ch = cardEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 16;
    
    const below = (cy - ch - gap) < 12 && (cy + ch + gap) < vh;
    
    let x = cx - cw / 2;
    x = Math.max(12, Math.min(x, vw - cw - 12));
    
    let y = below ? (cy + gap) : (cy - ch - gap);
    y = Math.max(12, Math.min(y, vh - ch - 12));

    const caretLeft = Math.max(13, Math.min(cx - x, cw - 13));

    setCardState({ x, y, below, caretLeft });
  }, []);

  const handleStarEnter = (index: number) => {
    setActiveStar(index);
    positionCard(index);
  };

  const handleStarLeave = () => {
    setActiveStar(null);
  };

  useEffect(() => {
    if (activeStar !== null) {
      positionCard(activeStar);
    }
    const handleResize = () => {
      if (activeStar !== null) {
        positionCard(activeStar);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStar, positionCard]);

  // Generators for Core styles
  const sparkPoints = (r: number, ratio = 0.14) => {
    const inner = r * ratio;
    const p = [];
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 - Math.PI / 2;
      const rad = (i % 2) ? inner : r;
      p.push(`${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`);
    }
    return p.join(' ');
  };

  const diamond = (r: number) => `0,${-r} ${r},0 0,${r} ${-r},0`;

  const star6 = (r: number) => {
    const inner = r * 0.5, p = [];
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 - Math.PI / 2;
      const rad = (i % 2) ? inner : r;
      p.push(`${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`);
    }
    return p.join(' ');
  };

  const renderCore = (style: string, r: number, col: string) => {
    if (style === 'circulo') return <circle className="core" r={r} fill="#fff" />;
    if (style === 'anillo') return <circle className="core" r={r * 1.05} fill="none" stroke="#fff" strokeWidth={0.34} />;
    if (style === 'punta4') return <polygon className="core" points={sparkPoints(r * 1.7, 0.34)} fill="#fff" />;
    if (style === 'punta6') return <polygon className="core" points={star6(r * 1.6)} fill="#fff" />;
    if (style === 'destello') {
      return (
        <g className="core">
          <polygon points={sparkPoints(r * 2.1, 0.07)} fill={col} opacity={0.9} />
          <polygon points={diamond(r)} fill="#fff" />
        </g>
      );
    }
    return <polygon className="core" points={diamond(r)} fill="#fff" />;
  };

  return (
    <section ref={sectionRef} className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-secondary py-[5vh] px-[4vw] text-white ${formed ? 'formed' : ''}`} aria-label={t('screen_label')}>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(130%_100%_at_50%_16%,_#7a3aa8_0%,_#662d91_46%,_#57267f_100%)]" />
      <SpaceStars />
      <Meteors />

      {/* Controls */}
      <div className="fixed top-[18px] right-[18px] z-40 flex items-center gap-2">
        <select
          className="appearance-none rounded-full border border-white/20 bg-[#28123e]/50 py-2 pl-[14px] pr-[30px] text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:border-white/40 cursor-pointer"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 11px center' }}
          value={starStyle}
          onChange={(e) => setStarStyle(e.target.value)}
          aria-label={t('controls.style_aria')}
        >
          <option className="bg-[#3a1a5e]" value="diamante">{t('controls.style_diamante')}</option>
          <option className="bg-[#3a1a5e]" value="circulo">{t('controls.style_circulo')}</option>
          <option className="bg-[#3a1a5e]" value="punta4">{t('controls.style_punta4')}</option>
          <option className="bg-[#3a1a5e]" value="punta6">{t('controls.style_punta6')}</option>
          <option className="bg-[#3a1a5e]" value="destello">{t('controls.style_destello')}</option>
          <option className="bg-[#3a1a5e]" value="anillo">{t('controls.style_anillo')}</option>
        </select>

        <button
          className={`inline-flex cursor-pointer items-center gap-[10px] rounded-full border border-white/20 bg-[#28123e]/50 py-2 pl-[10px] pr-[14px] text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:border-white/40`}
          aria-pressed={showLines}
          onClick={() => setShowLines(!showLines)}
          aria-label={t('controls.toggle_aria')}
        >
          <span className={`relative h-5 w-[34px] flex-none rounded-full transition-colors duration-200 ease-out ${showLines ? 'bg-highlight' : 'bg-white/20'}`}>
            <span className={`absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out ${showLines ? 'translate-x-[14px]' : ''}`} />
          </span>
          {t('controls.trazos')}
        </button>
      </div>

      <div className={`relative z-10 w-[min(1360px,94vw)] max-h-[90vh] aspect-[100/58] max-md:aspect-[88/116] max-md:max-h-none transition-opacity duration-500 ${!showLines ? 'hide-lines' : ''}`}>
        <svg className="absolute inset-0 block h-full w-full overflow-visible" viewBox="0 0 100 62" role="group" aria-label={t('screen_label')}>
          <defs>
            <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.35" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="starGlow" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          {/* Edges */}
          <g className="edges opacity-100 transition-opacity duration-500 [.hide-lines_&]:opacity-0 [.hide-lines_&]:pointer-events-none">
            {edges.map((pair, ei) => {
              const a = stars[pair[0]]!;
              const b = stars[pair[1]]!;
              return (
                <path
                  key={ei}
                  className="edge fill-none stroke-white stroke-[0.15] opacity-40 transition-all duration-[800ms] [stroke-linecap:round] [stroke-dasharray:1] [stroke-dashoffset:1] [.formed_&]:[stroke-dashoffset:0]"
                  style={{ filter: 'url(#edgeGlow)', transitionDelay: `${ei * 150}ms` }}
                  d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                  pathLength="1"
                />
              );
            })}
          </g>

          {/* Stars */}
          <g className="stars">
            {stars.map((st, si) => {
              const bright = st.mag === 'bright';
              const col = st.color;
              const coreR = bright ? 0.78 : 0.52;
              const glowR = bright ? 2.0 : 1.4;
              const ringR = bright ? 2.3 : 1.7;
              const isActive = activeStar === si;

              return (
                <g key={si} transform={`translate(${st.x} ${st.y})`}>
                  <g
                    className={`star cursor-pointer opacity-0 outline-none [.formed_&]:opacity-100 ${bright ? 'bright' : ''} ${isActive ? 'active' : ''}`}
                    style={{ transition: 'opacity 0.5s ease-out', transitionDelay: `${si * 150}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-label={st.point.title}
                    onMouseEnter={() => handleStarEnter(si)}
                    onMouseLeave={handleStarLeave}
                    onFocus={() => handleStarEnter(si)}
                    onBlur={handleStarLeave}
                    ref={(el) => { starsRef.current[si] = el; }}
                  >
                    <circle className="glow opacity-55 transition-opacity duration-200 hover:opacity-95 [.active_&]:opacity-95 focus-visible:opacity-95" r={glowR} fill={col} filter="url(#starGlow)" />
                    <circle className="ring fill-none opacity-0 [.formed_&]:animate-[ringPulse_2.6s_ease-out_infinite] hover:[.formed_&]:animate-[ringPulse_1.7s_ease-out_infinite] [.active_&]:animate-[ringPulse_1.7s_ease-out_infinite]" style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${si * 0.08 + 0.4}s` }} r={ringR} stroke={col} strokeWidth={0.24} />
                    <circle className="ring r2 fill-none opacity-0 [.formed_&]:animate-[ringPulse_2.6s_ease-out_infinite] hover:[.formed_&]:animate-[ringPulse_1.7s_ease-out_infinite] [.active_&]:animate-[ringPulse_1.7s_ease-out_infinite]" style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${si * 0.08 + 1.7}s` }} r={ringR} stroke={col} strokeWidth={0.2} />
                    
                    {renderCore(starStyle, coreR, col)}
                    
                    <text className={`star-label fill-white/85 font-body text-[1.45px] font-semibold tracking-wide [paint-order:stroke] stroke-[#2d0f46]/55 stroke-[0.14px] [stroke-linejoin:round] pointer-events-none ${bright ? 'text-[1.6px] fill-white' : ''}`} x={0} y={ringR + 2.6} textAnchor="middle">{st.point.title}</text>
                    <circle className="hit fill-transparent" r={4.6} />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Info Card */}
      <div
        id="oppCard"
        ref={cardRef}
        role="dialog"
        aria-label="Punto importante"
        className={`fixed z-50 w-[248px] max-w-[calc(100vw-28px)] rounded-2xl bg-surface p-4 text-ink shadow-[0_8px_22px_rgba(30,8,60,0.35),0_26px_60px_rgba(30,8,60,0.45)] border-t-[3px] transition-all duration-200 ease-out ${activeStar !== null && cardState ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0 translate-y-[6px]'}`}
        style={cardState ? {
          left: `${cardState.x}px`,
          top: `${cardState.y}px`,
          borderColor: activeStar !== null ? stars[activeStar]!.color : 'var(--highlight)',
          pointerEvents: 'none'
        } : {}}
      >
        <span
          className={`absolute left-1/2 -ml-[6px] h-[13px] w-[13px] rotate-45 bg-surface ${cardState?.below ? '-top-[6px] border-l-[3px] border-t-[3px]' : '-bottom-[6px]'}`}
          style={{
            left: cardState ? `${cardState.caretLeft}px` : '50%',
            borderColor: activeStar !== null ? stars[activeStar]!.color : 'var(--highlight)'
          }}
        />
        <div className="relative">
          {activeStar !== null && (
            <>
              <h3 className="mb-1.5 flex items-center gap-2 font-heading text-[18px] font-extrabold tracking-tight text-ink-strong">
                <span className="h-[9px] w-[9px] flex-none rounded-full shadow-[0_0_0_3px_color-mix(in_oklch,var(--c,var(--highlight))_22%,white)]" style={{ backgroundColor: stars[activeStar]!.color, '--c': stars[activeStar]!.color } as React.CSSProperties} />
                {stars[activeStar]!.point.title}
              </h3>
              <p className="m-0 text-[13.5px] leading-relaxed text-ink-muted">
                {stars[activeStar]!.point.desc}
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bgtwinkle { 0%, 100% { opacity: var(--o, 0.8); } 50% { opacity: 0.05; } }
        @keyframes ringPulse { 0% { transform: scale(0.45); opacity: 0.65; } 70% { opacity: 0.12; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes meteorFall { 0% { transform: translate(0, 0); opacity: 0; } 8% { opacity: 1; } 100% { transform: translate(-1500px, 700px); opacity: 0; } }
      `}</style>
    </section>
  );
}

function SpaceStars() {
  const [stars, setStars] = useState<{ id: number, left: string, top: string, size: string, o: string, delay: string, dur: string }[]>([]);

  useEffect(() => {
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const arr = [];
    for (let i = 0; i < 800; i++) {
      const sz = 0.8 + rnd() * 2.5;
      const o = (0.5 + rnd() * 0.5).toFixed(2);
      const dur = (1.5 + rnd() * 3.5).toFixed(2) + 's';
      arr.push({
        id: i,
        left: `${rnd() * 100}%`,
        top: `${rnd() * 100}%`,
        size: `${sz}px`,
        o,
        delay: `${rnd() * 5000}ms`,
        dur
      });
    }
    setStars(arr);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1]" aria-hidden="true">
      {stars.map((s) => (
        <i
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            '--o': s.o,
            '--dur': s.dur,
            opacity: s.o,
            animation: 'bgtwinkle var(--dur) ease-in-out infinite',
            animationDelay: s.delay
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function Meteors() {
  const [meteors, setMeteors] = useState<{ id: number, top: string, left: string, dur: string, len: string }[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const spawn = () => {
      const id = idCounter.current++;
      const top = `${Math.random() * 60 - 12}%`;
      const left = `${Math.random() * 75 + 35}%`;
      const durNum = 0.7 + Math.random() * 0.8;
      const dur = `${durNum.toFixed(2)}s`;
      const len = `${(90 + Math.random() * 130).toFixed(0)}px`;

      setMeteors(prev => [...prev, { id, top, left, dur, len }]);

      setTimeout(() => {
        setMeteors(prev => prev.filter(m => m.id !== id));
      }, durNum * 1000 + 120);
    };

    const loop = () => {
      spawn();
      if (Math.random() < 0.6) {
        timeout1 = setTimeout(spawn, 100 + Math.random() * 100);
      }
      timeout2 = setTimeout(loop, 400 + Math.random() * 800);
    };

    const initTimeout = setTimeout(loop, 600);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {meteors.map((m) => (
        <div
          key={m.id}
          className="absolute"
          style={{
            top: m.top,
            left: m.left,
            animation: `meteorFall ${m.dur} linear forwards`,
            willChange: 'transform, opacity'
          }}
        >
          <span
            className="block origin-left rounded-sm bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95))]"
            style={{ width: m.len, height: '2px', transform: 'rotate(155deg)' }}
          >
            <span className="absolute right-[-1px] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.85),0_0_16px_4px_rgba(255,255,255,0.4)]" />
          </span>
        </div>
      ))}
    </div>
  );
}

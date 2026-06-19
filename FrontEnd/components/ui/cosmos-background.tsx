'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CosmosBackground({ showMoon = false }: { showMoon?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(130%_100%_at_50%_16%,_#7a3aa8_0%,_#662d91_46%,_#57267f_100%)]" />
      {showMoon && <Constellations />}
      <SpaceStars />
      <Meteors />

      <style>{`
        @keyframes bgtwinkle { 0%, 100% { opacity: var(--o, 0.8); } 50% { opacity: 0.05; } }
        @keyframes meteorFall { 0% { transform: translate(0, 0); opacity: 0; } 8% { opacity: 1; } 100% { transform: translate(-1500px, 700px); opacity: 0; } }
        @keyframes floatAstronaut { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-40px) rotate(5deg); } }
        @keyframes floatAstronaut2 { 0%, 100% { transform: translateY(0) rotate(0deg) scaleX(-1); } 50% { transform: translateY(60px) rotate(-8deg) scaleX(-1); } }
        @keyframes floatAstronaut3 { 0%, 100% { transform: translate(0, 0) rotate(15deg); } 50% { transform: translate(-20px, 30px) rotate(-5deg); } }
      `}</style>
    </div>
  );
}

function Constellations() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Constellation 1 - Top Right */}
      <div 
        className="absolute top-[10%] right-[-5%] sm:top-[15%] sm:right-[2%] lg:right-[5%] w-48 h-48 sm:w-64 sm:h-64 opacity-80"
        style={{ animation: 'floatAstronaut 15s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
          {/* Lines */}
          <polyline points="40,160 80,100 160,80 180,40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 4" />
          <polyline points="80,100 120,130 160,80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 4" />
          {/* Glowing Stars */}
          <circle cx="40" cy="160" r="3" fill="#fff" />
          <circle cx="80" cy="100" r="4.5" fill="#fff" />
          <circle cx="120" cy="130" r="2.5" fill="#fff" />
          <circle cx="160" cy="80" r="5" fill="#fff" />
          <circle cx="180" cy="40" r="3.5" fill="#fff" />
        </svg>
      </div>
      
      {/* Constellation 2 - Bottom Left */}
      <div 
        className="absolute top-[65%] left-[-5%] sm:top-[70%] sm:left-[2%] lg:left-[6%] w-40 h-40 sm:w-56 sm:h-56 opacity-60"
        style={{ animation: 'floatAstronaut2 20s ease-in-out infinite', animationDelay: '-7s' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
          {/* Lines */}
          <polyline points="20,80 80,40 140,70 180,140" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="80" y1="40" x2="100" y2="120" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 4" />
          {/* Glowing Stars */}
          <circle cx="20" cy="80" r="3.5" fill="#fff" />
          <circle cx="80" cy="40" r="4" fill="#fff" />
          <circle cx="140" cy="70" r="2.5" fill="#fff" />
          <circle cx="180" cy="140" r="4.5" fill="#fff" />
          <circle cx="100" cy="120" r="3" fill="#fff" />
        </svg>
      </div>
    </div>
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
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
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
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
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

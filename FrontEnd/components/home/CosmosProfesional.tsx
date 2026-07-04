'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ConstellationBackdrop } from '@/components/home/ConstellationBackdrop';

const CARD_VIEWPORT_GAP_PX = 16;
const CARD_EDGE_MARGIN_PX = 12;
const CARD_CARET_INSET_PX = 13;
const SPARKLE_POINT_COUNT = 8;
const SPARKLE_INNER_RATIO = 0.34;
const SPARKLE_CORE_SCALE = 1.7;
const EDGE_DRAW_MS = 520; // duración del trazo de cada arista

// ── Secuencia de animación ─────────────────────────────────────────────────
// "star" → enciende la estrella idx
// "edge" → traza la arista idx (ver array edges más abajo)
// at  → ms desde que la sección entra en el viewport
type AnimStep =
  | { at: number; action: 'star'; idx: number }
  | { at: number; action: 'edge'; idx: number };

const SEQUENCE: AnimStep[] = [
  { at: 0,    action: 'star', idx: 0 }, // Egresado  "Crea tu cuenta"
  { at: 250,  action: 'star', idx: 1 }, // Empresa   "Crea tu cuenta"
  { at: 650,  action: 'edge', idx: 1 }, // arista [1→2] Empresa crea → publica
  { at: 1200, action: 'star', idx: 2 }, // Empresa   "Publica el proyecto"
  { at: 1450, action: 'edge', idx: 0 }, // arista [0→3] Egresado crea → envía
  { at: 2000, action: 'star', idx: 3 }, // Egresado  "Envía tu propuesta"
  { at: 2300, action: 'edge', idx: 3 }, // arista [3→4] Egresado envía → Empresa recibe
  { at: 2850, action: 'star', idx: 4 }, // Empresa   "Recibe propuestas"
  { at: 3150, action: 'edge', idx: 5 }, // arista [4→5] Empresa recibe → Egresado mejora
  { at: 3700, action: 'star', idx: 5 }, // Egresado  "Mejora tu propuesta"
  { at: 4000, action: 'edge', idx: 7 }, // arista [4→6] Empresa recibe → Adjudicado
  { at: 4000, action: 'edge', idx: 6 }, // arista [5→6] Egresado mejora → Adjudicado
  { at: 4550, action: 'star', idx: 6 }, // "Proyecto adjudicado"
  { at: 4850, action: 'edge', idx: 2 }, // arista [3→2] conexión secundaria
  { at: 4850, action: 'edge', idx: 4 }, // arista [2→4] conexión secundaria
];

type LabelSide = 'left' | 'right' | 'center';

interface ConstellationStar {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly isBright: boolean;
  readonly title: string;
  readonly description: string;
  readonly labelSide: LabelSide;
}

interface CardPlacement {
  readonly x: number;
  readonly y: number;
  readonly isBelow: boolean;
  readonly caretLeft: number;
}

function buildSparklePoints(radius: number): string {
  const innerRadius = radius * SPARKLE_INNER_RATIO;
  const points: string[] = [];
  for (let index = 0; index < SPARKLE_POINT_COUNT; index++) {
    const angle = (index * Math.PI) / 4 - Math.PI / 2;
    const distance = index % 2 ? innerRadius : radius;
    points.push(`${(Math.cos(angle) * distance).toFixed(2)},${(Math.sin(angle) * distance).toFixed(2)}`);
  }
  return points.join(' ');
}

export default function CosmosProfesional() {
  const t = useTranslations('cosmos_profesional');
  const locale = useLocale();

  const [activeStarIndex, setActiveStarIndex] = useState<number | null>(null);
  const [cardPlacement, setCardPlacement] = useState<CardPlacement | null>(null);

  // ── Estado de animación por elemento ──────────────────────────────────────
  // litStars[i]       → opacidad de la estrella i (false=0, true=1)
  // edgeVisible[i]    → si la arista i está en el DOM con opacidad 1
  // edgeDashoffset[i] → 1 = sin trazar, 0 = trazada (CSS transition la anima)
  const [litStars,      setLitStars]      = useState<boolean[]>(() => Array(7).fill(false));
  const [edgeVisible,   setEdgeVisible]   = useState<boolean[]>(() => Array(8).fill(false));
  const [edgeDashoffset,setEdgeDashoffset]= useState<number[]>( () => Array(8).fill(1));

  const sectionRef     = useRef<HTMLElement>(null);
  const animStartedRef = useRef(false);
  const timersRef      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cardRef        = useRef<HTMLDivElement>(null);
  const starsRef       = useRef<(SVGGElement | null)[]>([]);

  // ── Estrellas y aristas ───────────────────────────────────────────────────
  const stars: ConstellationStar[] = [
    { id: 0, x: 22, y: 16, color: 'var(--accent)',    isBright: false, labelSide: 'left',   title: t('stars.0.title'), description: t('stars.0.desc') },
    { id: 1, x: 72, y: 16, color: 'var(--primary)',   isBright: false, labelSide: 'right',  title: t('stars.1.title'), description: t('stars.1.desc') },
    { id: 2, x: 62, y: 36, color: 'var(--highlight)', isBright: true,  labelSide: 'right',  title: t('stars.2.title'), description: t('stars.2.desc') },
    { id: 3, x: 22, y: 49, color: 'var(--warning)',   isBright: false, labelSide: 'left',   title: t('stars.3.title'), description: t('stars.3.desc') },
    { id: 4, x: 68, y: 61, color: 'var(--magenta)',   isBright: true,  labelSide: 'right',  title: t('stars.4.title'), description: t('stars.4.desc') },
    { id: 5, x: 20, y: 75, color: 'var(--accent)',    isBright: false, labelSide: 'left',   title: t('stars.5.title'), description: t('stars.5.desc') },
    { id: 6, x: 52, y: 87, color: 'var(--highlight)', isBright: true,  labelSide: 'center', title: t('stars.6.title'), description: t('stars.6.desc') },
  ];

  // índices en SEQUENCE → edge[idx] de este array
  const edges: ReadonlyArray<readonly [number, number]> = [
    [0, 3], // 0 Egresado cuenta → Envía propuesta
    [1, 2], // 1 Empresa cuenta  → Publica proyecto
    [3, 2], // 2 Egresado envía  → Empresa publica (secundaria)
    [3, 4], // 3 Egresado envía  → Empresa recibe
    [2, 4], // 4 Empresa publica → Empresa recibe (secundaria)
    [4, 5], // 5 Empresa recibe  → Egresado mejora
    [5, 6], // 6 Egresado mejora → Adjudicado
    [4, 6], // 7 Empresa recibe  → Adjudicado
  ];

  // ── Arrancar animación ────────────────────────────────────────────────────
  const startAnimation = useCallback(() => {
    if (animStartedRef.current) return;
    animStartedRef.current = true;

    SEQUENCE.forEach((step) => {
      if (step.action === 'star') {
        const starIdx = step.idx;
        timersRef.current.push(
          setTimeout(() => {
            setLitStars((prev) => {
              const next = [...prev];
              next[starIdx] = true;
              return next;
            });
          }, step.at),
        );
      } else {
        // 'edge': primero hacerla visible con dashoffset=1 (presente pero vacía),
        // luego—un frame después—mover dashoffset a 0 para que CSS anime el trazo.
        const edgeIdx = step.idx;
        timersRef.current.push(
          setTimeout(() => {
            setEdgeVisible((prev) => {
              const next = [...prev];
              next[edgeIdx] = true;
              return next;
            });
            // Un frame de pausa garantiza que el browser pinte el estado
            // inicial (dashoffset=1) antes de iniciar la transición a 0.
            setTimeout(() => {
              setEdgeDashoffset((prev) => {
                const next = [...prev];
                next[edgeIdx] = 0;
                return next;
              });
            }, 20);
          }, step.at),
        );
      }
    });
  }, []);

  // ── IntersectionObserver ──────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startAnimation();
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, [startAnimation]);

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const positionCard = useCallback((starIndex: number) => {
    const starElement = starsRef.current[starIndex];
    const cardElement = cardRef.current;
    if (!starElement || !cardElement) return;

    const hitArea = starElement.querySelector('.cosmos-hit');
    if (!hitArea) return;

    const hitRect = hitArea.getBoundingClientRect();
    const centerX = hitRect.left + hitRect.width / 2;
    const centerY = hitRect.top + hitRect.height / 2;
    const cardWidth = cardElement.offsetWidth;
    const cardHeight = cardElement.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const isBelow =
      centerY - cardHeight - CARD_VIEWPORT_GAP_PX < CARD_EDGE_MARGIN_PX &&
      centerY + cardHeight + CARD_VIEWPORT_GAP_PX < viewportHeight;

    const clampedX = Math.max(
      CARD_EDGE_MARGIN_PX,
      Math.min(centerX - cardWidth / 2, viewportWidth - cardWidth - CARD_EDGE_MARGIN_PX),
    );
    const rawY = isBelow
      ? centerY + CARD_VIEWPORT_GAP_PX
      : centerY - cardHeight - CARD_VIEWPORT_GAP_PX;
    const clampedY = Math.max(CARD_EDGE_MARGIN_PX, Math.min(rawY, viewportHeight - cardHeight - CARD_EDGE_MARGIN_PX));
    const caretLeft = Math.max(CARD_CARET_INSET_PX, Math.min(centerX - clampedX, cardWidth - CARD_CARET_INSET_PX));

    setCardPlacement({ x: clampedX, y: clampedY, isBelow, caretLeft });
  }, []);

  const handleStarEnter = useCallback((starIndex: number) => {
    setActiveStarIndex(starIndex);
    positionCard(starIndex);
  }, [positionCard]);

  const handleStarLeave = useCallback(() => setActiveStarIndex(null), []);

  useEffect(() => {
    if (activeStarIndex !== null) positionCard(activeStarIndex);
    const onResize = () => { if (activeStarIndex !== null) positionCard(activeStarIndex); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeStarIndex, positionCard]);

  const activeStar = activeStarIndex !== null ? stars[activeStarIndex] : null;
  const cardAccentColor = activeStar ? activeStar.color : 'var(--highlight)';
  const headersVisible = litStars[0] === true || litStars[1] === true;

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-secondary px-[4vw] py-[7vh] text-secondary-foreground"
      aria-label={t('screen_label')}
    >
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-20 bg-gradient-to-b from-secondary to-transparent" aria-hidden="true" />
      <ConstellationBackdrop />
      <Meteors />

      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-highlight">{t('eyebrow')}</p>
        <h2 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
          {t('title')}
          <span className="text-highlight">.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-secondary-foreground/80 md:text-lg">{t('description')}</p>
      </header>

      {/* ── Diagrama SVG ───────────────────────────────────────────────── */}
      <div className="relative z-10 mt-10 aspect-[100/92] max-h-[82vh] w-[min(1360px,94vw)] max-md:aspect-auto max-md:max-h-none max-md:w-full max-md:px-2">
        <svg
          className="absolute inset-0 block h-full w-full overflow-visible max-md:relative max-md:inset-auto max-md:aspect-[100/92] max-md:h-auto"
          viewBox="0 0 100 94"
          role="group"
          aria-label={t('screen_label')}
        >
          <defs>
            {/* filterUnits="userSpaceOnUse": evita el caso donde una línea
                perfectamente vertical tiene bounding-box width=0 y el filtro
                basado en porcentajes recorta la salida a nada. */}
            <filter id="cosmosEdgeGlow" filterUnits="userSpaceOnUse" x="-3" y="-3" width="106" height="100">
              <feGaussianBlur stdDeviation="0.4" result="blurred" />
              <feMerge>
                <feMergeNode in="blurred" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cosmosStarGlow" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          {/* Cabeceras de columna */}
          <g
            style={{
              opacity: headersVisible ? 1 : 0,
              transition: 'opacity 600ms ease-out',
            }}
            aria-hidden="true"
          >
            <text
              className="fill-[var(--starlight)] font-heading font-bold text-[1.55px] uppercase tracking-[0.25em]"
              x={22} y={9}
              textAnchor="middle"
              fillOpacity={0.45}
            >
              {t('col_egresado')}
            </text>
            <text
              className="fill-[var(--starlight)] font-heading font-bold text-[1.55px] uppercase tracking-[0.25em]"
              x={72} y={9}
              textAnchor="middle"
              fillOpacity={0.45}
            >
              {t('col_empresa')}
            </text>
          </g>

          {/* Aristas — <path> con pathLength="1" para animación de trazo */}
          <g className="edges">
            {edges.map((pair, edgeIndex) => {
              const fromStar = stars[pair[0]];
              const toStar   = stars[pair[1]];
              if (!fromStar || !toStar) return null;
              return (
                <path
                  key={edgeIndex}
                  fill="none"
                  stroke="var(--starlight)"
                  strokeWidth={0.18}
                  strokeLinecap="round"
                  d={`M${fromStar.x} ${fromStar.y} L${toStar.x} ${toStar.y}`}
                  pathLength="1"
                  style={{
                    filter: 'url(#cosmosEdgeGlow)',
                    opacity: edgeVisible[edgeIndex] ? 0.5 : 0,
                    strokeDasharray: 1,
                    strokeDashoffset: edgeDashoffset[edgeIndex],
                    // opacity sin transición (aparece al instante);
                    // stroke-dashoffset anima el trazo
                    transition: `stroke-dashoffset ${EDGE_DRAW_MS}ms ease-in-out`,
                  }}
                />
              );
            })}
          </g>

          {/* Estrellas */}
          <g className="stars">
            {stars.map((star, starIndex) => {
              const isLit    = litStars[starIndex] === true;
              const coreRadius = star.isBright ? 1.2  : 0.82;
              const glowRadius = star.isBright ? 3.2  : 2.2;
              const ringRadius = star.isBright ? 3.8  : 2.8;
              const isActive   = activeStarIndex === starIndex;

              const textX = star.labelSide === 'left'   ? -3.2
                          : star.labelSide === 'right'  ? 3.2
                          : 0;
              const textY = star.labelSide === 'center' ? ringRadius + 2.8 : 0;
              const textAnchor = star.labelSide === 'left'   ? 'end'
                               : star.labelSide === 'right'  ? 'start'
                               : 'middle';
              const dominantBaseline = star.labelSide === 'center' ? 'auto' : 'middle';

              return (
                <g key={star.id} transform={`translate(${star.x} ${star.y})`}>
                  <g
                    className={`cursor-pointer outline-none ${isActive ? 'active' : ''}`}
                    style={{
                      opacity: isLit ? 1 : 0,
                      transition: 'opacity 450ms ease-out',
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={star.title}
                    onMouseEnter={() => handleStarEnter(starIndex)}
                    onMouseLeave={handleStarLeave}
                    onFocus={() => handleStarEnter(starIndex)}
                    onBlur={handleStarLeave}
                    ref={(element) => { starsRef.current[starIndex] = element; }}
                  >
                    <circle
                      style={{ opacity: 0.55 }}
                      className="transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)] [.active_&]:opacity-95 hover:opacity-95"
                      r={glowRadius}
                      fill={star.color}
                      filter="url(#cosmosStarGlow)"
                    />
                    <circle
                      className={`cosmos-star-ring fill-none opacity-0 [.active_&]:animate-[cosmos-ring-pulse_1.7s_ease-out_infinite] ${isLit ? 'animate-[cosmos-ring-pulse_2.6s_ease-out_infinite]' : ''}`}
                      style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${starIndex * 0.08 + 0.4}s` }}
                      r={ringRadius}
                      stroke={star.color}
                      strokeWidth={0.24}
                    />
                    <circle
                      className={`cosmos-star-ring fill-none opacity-0 [.active_&]:animate-[cosmos-ring-pulse_1.7s_ease-out_infinite] ${isLit ? 'animate-[cosmos-ring-pulse_2.6s_ease-out_infinite]' : ''}`}
                      style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${starIndex * 0.08 + 1.7}s` }}
                      r={ringRadius}
                      stroke={star.color}
                      strokeWidth={0.2}
                    />
                    <polygon points={buildSparklePoints(coreRadius * SPARKLE_CORE_SCALE)} fill="var(--starlight)" />
                    <text
                      className={`pointer-events-none fill-[var(--starlight)] font-body font-semibold tracking-wide [fill-opacity:0.85] [paint-order:stroke] [stroke-linejoin:round] [stroke:color-mix(in_oklab,var(--secondary)_55%,var(--ink-strong))] stroke-[0.14px] ${star.isBright ? 'text-[1.6px]' : 'text-[1.45px]'}`}
                      x={textX}
                      y={textY}
                      textAnchor={textAnchor}
                      dominantBaseline={dominantBaseline}
                    >
                      {star.title}
                    </text>
                    <circle className="cosmos-hit fill-transparent" r={6} />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mt-14 flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <div className="h-px w-32 bg-white/20" aria-hidden="true" />
        <p className="font-body text-base text-secondary-foreground/75 md:text-lg">
          {t('cta_question')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/${locale}/register`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-8 font-semibold text-[#1a1000] transition-opacity hover:opacity-90"
          >
            {t('cta_junior')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/register`}
            className="inline-flex h-12 items-center rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t('cta_empresa')}
          </Link>
        </div>
      </div>

      {/* Tooltip flotante */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label={activeStar ? activeStar.title : t('screen_label')}
        className={`fixed z-50 w-[248px] max-w-[calc(100vw-28px)] rounded-2xl border-t-[3px] bg-surface p-4 text-ink shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${
          activeStar && cardPlacement ? 'visible scale-100 opacity-100' : 'invisible translate-y-[6px] scale-95 opacity-0'
        }`}
        style={
          cardPlacement
            ? { left: `${cardPlacement.x}px`, top: `${cardPlacement.y}px`, borderColor: cardAccentColor, pointerEvents: 'none' }
            : { borderColor: cardAccentColor }
        }
      >
        <span
          className={`absolute h-[13px] w-[13px] rotate-45 bg-surface ${
            cardPlacement?.isBelow ? '-top-[6px] border-l-[3px] border-t-[3px]' : '-bottom-[6px]'
          }`}
          style={{ left: cardPlacement ? `${cardPlacement.caretLeft}px` : '50%', marginLeft: '-6px', borderColor: cardAccentColor }}
        />
        {activeStar && (
          <div className="relative">
            <h3 className="mb-1.5 flex items-center gap-2 font-heading text-[18px] font-extrabold tracking-tight text-ink-strong">
              <span
                className="h-[9px] w-[9px] flex-none rounded-full"
                style={{ backgroundColor: activeStar.color, boxShadow: `0 0 0 3px color-mix(in oklch, ${activeStar.color} 22%, var(--surface))` }}
              />
              {activeStar.title}
            </h3>
            <p className="m-0 text-[13.5px] leading-relaxed text-ink-muted">{activeStar.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Meteoros decorativos ───────────────────────────────────────────────────

const METEOR_INITIAL_DELAY_MS = 600;
const METEOR_BURST_CHANCE = 0.6;
const METEOR_MIN_DURATION_S = 0.7;
const METEOR_DURATION_RANGE_S = 0.8;
const METEOR_MIN_LENGTH_PX = 90;
const METEOR_LENGTH_RANGE_PX = 130;
const METEOR_CLEANUP_BUFFER_MS = 120;

interface FallingMeteor {
  readonly id: number;
  readonly top: string;
  readonly left: string;
  readonly duration: string;
  readonly length: string;
}

function Meteors() {
  const [meteors, setMeteors] = useState<FallingMeteor[]>([]);
  const idCounterRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let burstTimer: ReturnType<typeof setTimeout>;
    let loopTimer: ReturnType<typeof setTimeout>;

    const spawnMeteor = () => {
      const id = idCounterRef.current++;
      const top = `${Math.random() * 60 - 12}%`;
      const left = `${Math.random() * 75 + 35}%`;
      const durationSeconds = METEOR_MIN_DURATION_S + Math.random() * METEOR_DURATION_RANGE_S;
      const duration = `${durationSeconds.toFixed(2)}s`;
      const length = `${(METEOR_MIN_LENGTH_PX + Math.random() * METEOR_LENGTH_RANGE_PX).toFixed(0)}px`;

      setMeteors((current) => [...current, { id, top, left, duration, length }]);
      setTimeout(() => {
        setMeteors((current) => current.filter((meteor) => meteor.id !== id));
      }, durationSeconds * 1000 + METEOR_CLEANUP_BUFFER_MS);
    };

    const loop = () => {
      spawnMeteor();
      if (Math.random() < METEOR_BURST_CHANCE) {
        burstTimer = setTimeout(spawnMeteor, 100 + Math.random() * 100);
      }
      loopTimer = setTimeout(loop, 400 + Math.random() * 800);
    };

    const initialTimer = setTimeout(loop, METEOR_INITIAL_DELAY_MS);
    return () => { clearTimeout(initialTimer); clearTimeout(burstTimer); clearTimeout(loopTimer); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute"
          style={{ top: meteor.top, left: meteor.left, animation: `cosmos-meteor-fall ${meteor.duration} linear forwards`, willChange: 'transform, opacity' }}
        >
          <span
            className="block origin-left rounded-sm"
            style={{ width: meteor.length, height: '2px', transform: 'rotate(155deg)', backgroundImage: 'linear-gradient(90deg, transparent, var(--starlight))' }}
          >
            <span
              className="absolute right-[-1px] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: 'var(--starlight)', boxShadow: '0 0 8px 2px color-mix(in oklab, var(--starlight) 85%, transparent), 0 0 16px 4px color-mix(in oklab, var(--starlight) 40%, transparent)' }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

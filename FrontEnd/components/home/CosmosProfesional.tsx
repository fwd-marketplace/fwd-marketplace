'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ConstellationBackdrop } from '@/components/home/ConstellationBackdrop';

const STAR_FORM_DELAY_MS = 100;
const CARD_VIEWPORT_GAP_PX = 16;
const CARD_EDGE_MARGIN_PX = 12;
const CARD_CARET_INSET_PX = 13;
const SPARKLE_POINT_COUNT = 8;
const SPARKLE_INNER_RATIO = 0.34;
const SPARKLE_CORE_SCALE = 1.7;
const STAR_REVEAL_STEP_MS = 150;

interface ConstellationStar {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly isBright: boolean;
  readonly title: string;
  readonly description: string;
}

interface CardPlacement {
  readonly x: number;
  readonly y: number;
  readonly isBelow: boolean;
  readonly caretLeft: number;
}

/**
 * Construye los puntos de un destello de 4 brazos (estrella ✦) centrado en el
 * origen, listo para usar como `points` de un `<polygon>`.
 */
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

/**
 * Constelacion interactiva del Home: las estrellas representan a los estudiantes
 * y cada una revela un punto clave de la plataforma al pasar el cursor o el foco.
 */
export default function CosmosProfesional() {
  const t = useTranslations('cosmos_profesional');
  const [activeStarIndex, setActiveStarIndex] = useState<number | null>(null);
  const [cardPlacement, setCardPlacement] = useState<CardPlacement | null>(null);
  const [hasFormed, setHasFormed] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(SVGGElement | null)[]>([]);

  const stars: ConstellationStar[] = [
    { id: 0, x: 12, y: 32, color: 'var(--accent)', isBright: false, title: t('stars.0.title'), description: t('stars.0.desc') },
    { id: 1, x: 32, y: 19, color: 'var(--primary)', isBright: false, title: t('stars.1.title'), description: t('stars.1.desc') },
    { id: 2, x: 50, y: 43, color: 'var(--highlight)', isBright: true, title: t('stars.2.title'), description: t('stars.2.desc') },
    { id: 3, x: 68, y: 19, color: 'var(--magenta)', isBright: false, title: t('stars.3.title'), description: t('stars.3.desc') },
    { id: 4, x: 88, y: 32, color: 'var(--warning)', isBright: true, title: t('stars.4.title'), description: t('stars.4.desc') },
  ];

  const edges: ReadonlyArray<readonly [number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 4],
  ];

  useEffect(() => {
    const timer = setTimeout(() => setHasFormed(true), STAR_FORM_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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

    const rawY = isBelow ? centerY + CARD_VIEWPORT_GAP_PX : centerY - cardHeight - CARD_VIEWPORT_GAP_PX;
    const clampedY = Math.max(CARD_EDGE_MARGIN_PX, Math.min(rawY, viewportHeight - cardHeight - CARD_EDGE_MARGIN_PX));

    const caretLeft = Math.max(CARD_CARET_INSET_PX, Math.min(centerX - clampedX, cardWidth - CARD_CARET_INSET_PX));

    setCardPlacement({ x: clampedX, y: clampedY, isBelow, caretLeft });
  }, []);

  const handleStarEnter = useCallback(
    (starIndex: number) => {
      setActiveStarIndex(starIndex);
      positionCard(starIndex);
    },
    [positionCard],
  );

  const handleStarLeave = useCallback(() => {
    setActiveStarIndex(null);
  }, []);

  useEffect(() => {
    if (activeStarIndex !== null) {
      positionCard(activeStarIndex);
    }
    const handleResize = () => {
      if (activeStarIndex !== null) {
        positionCard(activeStarIndex);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStarIndex, positionCard]);

  const activeStar = activeStarIndex !== null ? stars[activeStarIndex] : null;
  const cardAccentColor = activeStar ? activeStar.color : 'var(--highlight)';

  return (
    <section
      className={`relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-secondary px-[4vw] py-[7vh] text-secondary-foreground ${hasFormed ? 'formed' : ''}`}
      aria-label={t('screen_label')}
    >
      <ConstellationBackdrop />
      <Meteors />

      <header className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-highlight">{t('eyebrow')}</p>
        <h2 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
          {t('title')}
          <span className="text-highlight">.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-secondary-foreground/80 md:text-lg">{t('description')}</p>
      </header>

      <div className="relative z-10 mt-10 aspect-[100/58] max-h-[58vh] w-[min(1360px,94vw)] max-md:aspect-[88/116] max-md:max-h-none">
        <svg
          className="absolute inset-0 block h-full w-full overflow-visible"
          viewBox="0 0 100 62"
          role="group"
          aria-label={t('screen_label')}
        >
          <defs>
            <filter id="cosmosEdgeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.35" result="blurred" />
              <feMerge>
                <feMergeNode in="blurred" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cosmosStarGlow" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          <g className="edges">
            {edges.map((pair, edgeIndex) => {
              const fromStar = stars[pair[0]];
              const toStar = stars[pair[1]];
              if (!fromStar || !toStar) return null;
              return (
                <path
                  key={edgeIndex}
                  className="fill-none stroke-[var(--starlight)] stroke-[0.15] opacity-40 transition-all duration-[800ms] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] [.formed_&]:[stroke-dashoffset:0]"
                  style={{ filter: 'url(#cosmosEdgeGlow)', transitionDelay: `${edgeIndex * STAR_REVEAL_STEP_MS}ms` }}
                  d={`M${fromStar.x} ${fromStar.y} L${toStar.x} ${toStar.y}`}
                  pathLength="1"
                />
              );
            })}
          </g>

          <g className="stars">
            {stars.map((star, starIndex) => {
              const coreRadius = star.isBright ? 0.78 : 0.52;
              const glowRadius = star.isBright ? 2.0 : 1.4;
              const ringRadius = star.isBright ? 2.3 : 1.7;
              const isActive = activeStarIndex === starIndex;

              return (
                <g key={star.id} transform={`translate(${star.x} ${star.y})`}>
                  <g
                    className={`cursor-pointer opacity-0 outline-none [.formed_&]:opacity-100 ${isActive ? 'active' : ''}`}
                    style={{ transition: 'opacity 0.5s var(--ease-out)', transitionDelay: `${starIndex * STAR_REVEAL_STEP_MS}ms` }}
                    tabIndex={0}
                    role="button"
                    aria-label={star.title}
                    onMouseEnter={() => handleStarEnter(starIndex)}
                    onMouseLeave={handleStarLeave}
                    onFocus={() => handleStarEnter(starIndex)}
                    onBlur={handleStarLeave}
                    ref={(element) => {
                      starsRef.current[starIndex] = element;
                    }}
                  >
                    <circle
                      className="opacity-55 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)] hover:opacity-95 [.active_&]:opacity-95"
                      r={glowRadius}
                      fill={star.color}
                      filter="url(#cosmosStarGlow)"
                    />
                    <circle
                      className="cosmos-star-ring fill-none opacity-0 [.active_&]:animate-[cosmos-ring-pulse_1.7s_ease-out_infinite] [.formed_&]:animate-[cosmos-ring-pulse_2.6s_ease-out_infinite]"
                      style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${starIndex * 0.08 + 0.4}s` }}
                      r={ringRadius}
                      stroke={star.color}
                      strokeWidth={0.24}
                    />
                    <circle
                      className="cosmos-star-ring fill-none opacity-0 [.active_&]:animate-[cosmos-ring-pulse_1.7s_ease-out_infinite] [.formed_&]:animate-[cosmos-ring-pulse_2.6s_ease-out_infinite]"
                      style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${starIndex * 0.08 + 1.7}s` }}
                      r={ringRadius}
                      stroke={star.color}
                      strokeWidth={0.2}
                    />

                    <polygon points={buildSparklePoints(coreRadius * SPARKLE_CORE_SCALE)} fill="var(--starlight)" />

                    <text
                      className={`pointer-events-none fill-[var(--starlight)] font-body font-semibold tracking-wide [fill-opacity:0.85] [paint-order:stroke] [stroke-linejoin:round] [stroke:color-mix(in_oklab,var(--secondary)_55%,var(--ink-strong))] stroke-[0.14px] ${star.isBright ? 'text-[1.6px]' : 'text-[1.45px]'}`}
                      x={0}
                      y={ringRadius + 2.6}
                      textAnchor="middle"
                    >
                      {star.title}
                    </text>
                    <circle className="cosmos-hit fill-transparent" r={4.6} />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

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
          style={{
            left: cardPlacement ? `${cardPlacement.caretLeft}px` : '50%',
            marginLeft: '-6px',
            borderColor: cardAccentColor,
          }}
        />
        {activeStar && (
          <div className="relative">
            <h3 className="mb-1.5 flex items-center gap-2 font-heading text-[18px] font-extrabold tracking-tight text-ink-strong">
              <span
                className="h-[9px] w-[9px] flex-none rounded-full"
                style={{
                  backgroundColor: activeStar.color,
                  boxShadow: `0 0 0 3px color-mix(in oklch, ${activeStar.color} 22%, var(--surface))`,
                }}
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

/**
 * Meteoros decorativos que cruzan la seccion de forma esporadica. Se desactivan
 * por completo si la persona prefiere menos movimiento.
 */
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

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(burstTimer);
      clearTimeout(loopTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute"
          style={{
            top: meteor.top,
            left: meteor.left,
            animation: `cosmos-meteor-fall ${meteor.duration} linear forwards`,
            willChange: 'transform, opacity',
          }}
        >
          <span
            className="block origin-left rounded-sm"
            style={{
              width: meteor.length,
              height: '2px',
              transform: 'rotate(155deg)',
              backgroundImage: 'linear-gradient(90deg, transparent, var(--starlight))',
            }}
          >
            <span
              className="absolute right-[-1px] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: 'var(--starlight)',
                boxShadow:
                  '0 0 8px 2px color-mix(in oklab, var(--starlight) 85%, transparent), 0 0 16px 4px color-mix(in oklab, var(--starlight) 40%, transparent)',
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

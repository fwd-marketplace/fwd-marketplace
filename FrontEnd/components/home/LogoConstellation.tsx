"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import logoFwd from "@/Img/logo-fwd-constelacion.png";
import {
  LOGO_CONSTELLATION,
  CONSTELLATION_STAR_STYLE,
  CONSTELLATION_DRAW_DURATION_MS,
  type ConstellationNodeKind,
} from "@/lib/constants/logo-constellation";
import {
  buildConstellationPathData,
  computeNodeFractions,
  buildSparklePoints,
  createSeededRandom,
} from "@/lib/logo-constellation";

type StyleWithCustomProps = CSSProperties & Record<`--${string}`, string | number>;

const SVG_VIEW_BOX = "-12 -12 124 124";

// Tiempos de la secuencia (ms).
const STAR_LIGHT_LEAD_MS = 60;
const SCENE_SETTLE_MS = 220;
const LOGO_BLOOM_DELAY_MS = 420;
const SPARKLES_DELAY_MS = 1350;

// Anillo de destellos alrededor del logo.
const SPARKLE_RING_COUNT = 24;
const SPARKLE_RING_SEED = 29;
const SPARKLE_BASE_DISTANCE = 33;
const SPARKLE_DISTANCE_SPREAD = 26;
const SPARKLE_CENTER_X = 50.3;
const SPARKLE_CENTER_Y = 48.7;
const SPARKLE_Y_SQUASH = 0.97;
const SPARKLE_MIN_SIZE_PX = 7;
const SPARKLE_SIZE_SPREAD_PX = 12;
const SPARKLE_MAX_DELAY_MS = 900;
const SPARKLE_ANGLE_JITTER = 0.5;
const SPARKLE_MIN_TWINKLE_S = 2.2;
const SPARKLE_TWINKLE_SPREAD_S = 2.8;
const SPARKLE_GOLD_THRESHOLD = 0.82;
const SPARKLE_CYAN_THRESHOLD = 0.66;
const SPARKLE_OUTER_RADIUS = 48;
const SPARKLE_INNER_RADIUS = 16;
const SPARKLE_VIEW_BOX_SIZE = 100;
const FULL_TURN = Math.PI * 2;

interface RenderedStar {
  readonly key: string;
  readonly kind: ConstellationNodeKind;
  readonly x: number;
  readonly y: number;
  readonly fraction: number;
}

interface RingSparkle {
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly sizePx: number;
  readonly tintClass: string;
  readonly twinkleSeconds: number;
  readonly delayMs: number;
}

function starGroupClass(kind: ConstellationNodeKind): string {
  if (kind === "center") return "constellation-star-center";
  if (kind === "tip") return "constellation-star-tip";
  return "constellation-star-pt";
}

function haloFillClass(kind: ConstellationNodeKind): string {
  return kind === "pt" ? "fill-starlight" : "fill-highlight";
}

function sparkFillClass(kind: ConstellationNodeKind): string {
  return kind === "center" ? "fill-highlight" : "fill-starlight";
}

/**
 * Logo FWD que primero se dibuja como constelacion (las lineas trazan el
 * contorno y las estrellas se encienden) y luego florece la marca real.
 * Sustituye al logo estatico del heroe en la pantalla de inicio.
 */
export function LogoConstellation({ logoAlt }: { logoAlt: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(SVGGElement | null)[]>([]);
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // La geometria de la constelacion se calcula con trigonometria (Math.sin/cos),
  // cuyo ultimo bit puede diferir entre el motor JS del servidor y el del
  // navegador. Por eso solo dibujamos las lineas, estrellas y destellos tras
  // montar en el cliente: el render del servidor y el primer render del cliente
  // coinciden y no hay desajuste de hidratacion.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pathData = useMemo(
    () => buildConstellationPathData(LOGO_CONSTELLATION.nodes),
    [],
  );

  const sparklePoints = useMemo(
    () =>
      buildSparklePoints(
        SPARKLE_VIEW_BOX_SIZE / 2,
        SPARKLE_VIEW_BOX_SIZE / 2,
        SPARKLE_OUTER_RADIUS,
        SPARKLE_INNER_RADIUS / SPARKLE_OUTER_RADIUS,
      ),
    [],
  );

  const renderedStars = useMemo<RenderedStar[]>(() => {
    const fractions = computeNodeFractions(LOGO_CONSTELLATION.nodes);
    const stars: RenderedStar[] = [];
    let centerStarIndex = -1;
    LOGO_CONSTELLATION.nodes.forEach((node, index) => {
      const fraction = fractions[index] ?? 0;
      if (node.k === "center") {
        if (centerStarIndex === -1) {
          centerStarIndex = stars.length;
          stars.push({ key: "center", kind: "center", x: node.x, y: node.y, fraction });
          return;
        }
        const existing = stars[centerStarIndex];
        if (existing) {
          stars[centerStarIndex] = {
            ...existing,
            fraction: Math.min(existing.fraction, fraction),
          };
        }
        return;
      }
      stars.push({
        key: `${node.k}-${index}`,
        kind: node.k,
        x: node.x,
        y: node.y,
        fraction,
      });
    });
    return stars;
  }, []);

  const ringSparkles = useMemo<RingSparkle[]>(() => {
    const next = createSeededRandom(SPARKLE_RING_SEED);
    const sparkles: RingSparkle[] = [];
    for (let index = 0; index < SPARKLE_RING_COUNT; index++) {
      const angle =
        (index / SPARKLE_RING_COUNT) * FULL_TURN +
        (next() - 0.5) * SPARKLE_ANGLE_JITTER;
      const distance = SPARKLE_BASE_DISTANCE + next() * SPARKLE_DISTANCE_SPREAD;
      const leftPercent = SPARKLE_CENTER_X + Math.cos(angle) * distance;
      const topPercent =
        SPARKLE_CENTER_Y + Math.sin(angle) * distance * SPARKLE_Y_SQUASH;
      const sizePx = SPARKLE_MIN_SIZE_PX + next() * SPARKLE_SIZE_SPREAD_PX;
      const tint = next();
      const tintClass =
        tint > SPARKLE_GOLD_THRESHOLD
          ? "is-gold"
          : tint > SPARKLE_CYAN_THRESHOLD
            ? "is-cyan"
            : "";
      const twinkleSeconds =
        SPARKLE_MIN_TWINKLE_S + next() * SPARKLE_TWINKLE_SPREAD_S;
      const delayMs = next() * SPARKLE_MAX_DELAY_MS;
      sparkles.push({
        leftPercent,
        topPercent,
        sizePx,
        tintClass,
        twinkleSeconds,
        delayMs,
      });
    }
    return sparkles;
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const scene = sceneRef.current;
    const path = pathRef.current;
    const logo = logoRef.current;
    if (!scene || !path || !logo) return;

    const totalLength = path.getTotalLength();
    path.style.setProperty("--edge-length", `${totalLength}`);
    path.style.setProperty(
      "--draw-duration",
      `${CONSTELLATION_DRAW_DURATION_MS}ms`,
    );

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      scene.classList.add("is-logo-shown");
      logo.classList.add("is-shown");
      sparkleRefs.current.forEach((element) => element?.classList.add("is-in"));
      return;
    }

    const timers: number[] = [];
    const drawFrame = requestAnimationFrame(() =>
      path.classList.add("is-drawing"),
    );

    renderedStars.forEach((star, index) => {
      const lightDelay = Math.max(
        0,
        star.fraction * CONSTELLATION_DRAW_DURATION_MS - STAR_LIGHT_LEAD_MS,
      );
      timers.push(
        window.setTimeout(
          () => starRefs.current[index]?.classList.add("is-lit"),
          lightDelay,
        ),
      );
    });

    const drawEnd = CONSTELLATION_DRAW_DURATION_MS + SCENE_SETTLE_MS;
    timers.push(
      window.setTimeout(() => scene.classList.add("is-twinkling"), drawEnd),
    );
    timers.push(
      window.setTimeout(() => {
        scene.classList.add("is-logo-shown");
        logo.classList.add("is-shown");
      }, drawEnd + LOGO_BLOOM_DELAY_MS),
    );
    timers.push(
      window.setTimeout(
        () => {
          ringSparkles.forEach((sparkle, index) => {
            timers.push(
              window.setTimeout(
                () => sparkleRefs.current[index]?.classList.add("is-in"),
                sparkle.delayMs,
              ),
            );
          });
        },
        drawEnd + LOGO_BLOOM_DELAY_MS + SPARKLES_DELAY_MS,
      ),
    );

    return () => {
      cancelAnimationFrame(drawFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isMounted, renderedStars, ringSparkles]);

  return (
    <div ref={sceneRef} className="constellation-scene constellation-stage">
      {isMounted && (
        <svg viewBox={SVG_VIEW_BOX} aria-hidden="true">
        <defs>
          <filter
            id="constellationLineGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="0.7" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="constellationStarGlow"
            x="-300%"
            y="-300%"
            width="700%"
            height="700%"
          >
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter
            id="constellationHubGlow"
            x="-400%"
            y="-400%"
            width="900%"
            height="900%"
          >
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        <g>
          <path ref={pathRef} className="constellation-edge" d={pathData} />
        </g>

        <g>
          {renderedStars.map((star, index) => {
            const style = CONSTELLATION_STAR_STYLE[star.kind];
            const glowFilter =
              star.kind === "center"
                ? "url(#constellationHubGlow)"
                : "url(#constellationStarGlow)";
            const sparkOpacity = star.kind === "center" ? 0.55 : 0.4;
            return (
              <g
                key={star.key}
                ref={(element) => {
                  starRefs.current[index] = element;
                }}
                className={`constellation-star ${starGroupClass(star.kind)}`}
              >
                <circle
                  className={`constellation-halo ${haloFillClass(star.kind)}`}
                  cx={star.x}
                  cy={star.y}
                  r={style.haloRadius}
                  opacity={style.haloOpacity}
                  filter={glowFilter}
                />
                {style.sparkRadius > 0 && (
                  <polygon
                    className={sparkFillClass(star.kind)}
                    points={buildSparklePoints(star.x, star.y, style.sparkRadius)}
                    opacity={sparkOpacity}
                  />
                )}
                <circle
                  className="constellation-core fill-starlight"
                  cx={star.x}
                  cy={star.y}
                  r={style.coreRadius}
                />
              </g>
            );
          })}
        </g>
        </svg>
      )}

      <div ref={logoRef} className="constellation-logo">
        <Image
          src={logoFwd}
          alt={logoAlt}
          fill
          sizes="(max-width: 768px) 90vw, 500px"
          className="object-contain"
          priority
        />
      </div>

      {isMounted && (
        <div className="constellation-sparkles" aria-hidden="true">
        {ringSparkles.map((sparkle, index) => {
          const sparkleStyle: StyleWithCustomProps = {
            left: `${sparkle.leftPercent}%`,
            top: `${sparkle.topPercent}%`,
            "--spark-twinkle": `${sparkle.twinkleSeconds.toFixed(2)}s`,
          };
          return (
          <div
            key={index}
            ref={(element) => {
              sparkleRefs.current[index] = element;
            }}
            className={`constellation-spark ${sparkle.tintClass}`}
            style={sparkleStyle}
          >
            <svg
              width={sparkle.sizePx.toFixed(1)}
              height={sparkle.sizePx.toFixed(1)}
              viewBox={`0 0 ${SPARKLE_VIEW_BOX_SIZE} ${SPARKLE_VIEW_BOX_SIZE}`}
            >
              <polygon points={sparklePoints} fill="currentColor" />
            </svg>
          </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

"use client";

import type { Star, Constellation, Tweaks } from "../data/types";
import { starPolygon, STAR_SHAPES } from "../utils";

interface StarNodeProps {
  star: Star;
  area: Constellation;
  tweaks: Tweaks;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isNewlyUnlocked: boolean;
}

const PIP_POINTS = starPolygon(5, 48, 20);

// SVG filter ids defined once in Sky defs
const GLOW_AVAILABLE = "glow-available";
const GLOW_DONE      = "glow-done";

export function StarNode({ star, area, tweaks, isSelected, onSelect, isNewlyUnlocked }: StarNodeProps) {
  const isDone      = star.state === "done";
  const isAvailable = star.state === "available";
  const isLocked    = star.state === "locked";
  const isMono      = tweaks.stateStyle === "mono";
  const isRich      = tweaks.density === "rich";

  let coreColor: string;
  let strokeColor: string;
  let glowId: string | null = null;

  if (isAvailable) {
    coreColor   = "#FFCB05";
    strokeColor = "#FFCB05";
    glowId      = GLOW_AVAILABLE;
  } else if (isDone) {
    coreColor   = "#FFFFFF";
    strokeColor = isMono ? "rgba(255,255,255,0.9)" : area.color;
    glowId      = GLOW_DONE;
  } else {
    coreColor   = "transparent";
    strokeColor = "rgba(255,255,255,0.30)";
  }

  const size = isAvailable ? 52 : isDone ? 44 : 32;
  const half = size / 2;

  const shapePoints =
    tweaks.starShape === "dot" ? null : STAR_SHAPES[tweaks.starShape] ?? STAR_SHAPES.sixpoint;

  const showPips  = (isRich && (isDone || isAvailable)) || isSelected;
  const pipColor  = isMono ? "#FFFFFF" : isAvailable ? "#FFCB05" : area.color;
  const showLabel = isRich || isAvailable || isSelected;

  // CSS animation classes via className on SVG elements
  let glyphAnim = "";
  if (isDone)          glyphAnim = "star-done-glyph";
  if (isAvailable && !isNewlyUnlocked) glyphAnim = "star-available-glyph";
  if (isNewlyUnlocked) glyphAnim = "star-unlock-burst";

  return (
    <g
      transform={`translate(${star.x},${star.y})`}
      onClick={(e) => { e.stopPropagation(); onSelect(star.id); }}
      onPointerDown={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      aria-label={star.label}
      style={{ cursor: "pointer" }}
      data-star="true"
    >
      {/* anillo de selección */}
      {isSelected && (
        <circle
          r={half + 13}
          fill="none"
          stroke={isAvailable ? "#FFCB05" : isDone ? (isMono ? "#fff" : area.color) : "rgba(255,255,255,0.5)"}
          strokeWidth={2}
        />
      )}

      {/* anillo pulsante (solo available) */}
      {isAvailable && (
        <circle
          className="star-available-ring-svg"
          r={half + 10}
          fill="none"
          stroke="#FFCB05"
          strokeWidth={2}
        />
      )}

      {/* glifo principal */}
      <g className={glyphAnim} filter={glowId ? `url(#${glowId})` : undefined}>
        {shapePoints ? (
          <polygon
            points={shapePoints}
            fill={coreColor}
            stroke={strokeColor}
            strokeWidth={isLocked ? 4 : coreColor === "transparent" ? 4 : 3}
            strokeLinejoin="round"
            transform={`translate(${-size / 2},${-size / 2}) scale(${size / 100})`}
          />
        ) : (
          <circle
            r={isLocked ? size * 0.22 : size * 0.30}
            fill={coreColor}
            stroke={strokeColor}
            strokeWidth={isLocked ? 4 : coreColor === "transparent" ? 4 : 0}
          />
        )}
      </g>

      {/* candado */}
      {isLocked && (
        <g transform="translate(-8,-8)">
          <svg width={16} height={16} viewBox="0 0 24 24" overflow="visible">
            <rect x="5" y="11" width="14" height="9" rx="2"
              fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3"
              fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </g>
      )}

      {/* pips de maestría */}
      {showPips && [-1, 0, 1].map((offset, i) => (
        <g key={i} transform={`translate(${offset * 12},${-half - 16})`}>
          <polygon
            points={PIP_POINTS}
            fill={i < star.mastery ? pipColor : "transparent"}
            stroke={i < star.mastery ? pipColor : "rgba(255,255,255,0.35)"}
            strokeWidth="6"
            strokeLinejoin="round"
            transform="translate(-4.5,-4.5) scale(0.09)"
          />
        </g>
      ))}

      {/* etiqueta */}
      {showLabel && (
        <text
          y={half + 18}
          textAnchor="middle"
          fill={isLocked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)"}
          fontSize={14}
          fontFamily="var(--font-figtree, ui-sans-serif)"
          fontWeight={500}
          style={{ pointerEvents: "none", paintOrder: "stroke fill" }}
          stroke="rgba(20,8,40,0.7)"
          strokeWidth={3}
        >
          {star.label}
        </text>
      )}
    </g>
  );
}

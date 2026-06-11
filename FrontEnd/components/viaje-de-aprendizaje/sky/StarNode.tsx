"use client";

import type { Star, Constellation, Tweaks } from "../data/types";
import { starPolygon, STAR_SHAPES } from "../utils";

interface StarNodeProps {
  star: Star;
  area: Constellation;
  tweaks: Tweaks;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PIP_POINTS = starPolygon(5, 48, 20);

export function StarNode({ star, area, tweaks, isSelected, onSelect }: StarNodeProps) {
  const isDone = star.state === "done";
  const isAvailable = star.state === "available";
  const isLocked = star.state === "locked";
  const isMono = tweaks.stateStyle === "mono";
  const isRich = tweaks.density === "rich";

  let coreColor: string;
  let glowColor: string;
  let strokeColor: string;

  if (isAvailable) {
    coreColor = "#FFCB05";
    glowColor = "#FFCB05";
    strokeColor = "#FFCB05";
  } else if (isDone) {
    coreColor = "#FFFFFF";
    glowColor = isMono ? "rgba(255,255,255,0.9)" : area.color;
    strokeColor = isMono ? "rgba(255,255,255,0.9)" : area.color;
  } else {
    coreColor = "transparent";
    glowColor = "transparent";
    strokeColor = "rgba(255,255,255,0.30)";
  }

  const size = isAvailable ? 40 : isDone ? 34 : 24;

  let filter = "none";
  if (isAvailable) {
    filter = `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 18px ${glowColor}) drop-shadow(0 0 34px ${glowColor})`;
  } else if (isDone) {
    filter = `drop-shadow(0 0 5px ${glowColor}) drop-shadow(0 0 14px ${glowColor})`;
  }

  const shapePoints =
    tweaks.starShape === "dot" ? null : STAR_SHAPES[tweaks.starShape] ?? STAR_SHAPES.sixpoint;

  const twinkleDelay = (star.x * 13 + star.y * 7) % 4000;

  const showPips = (isRich && (isDone || isAvailable)) || isSelected;
  const pipColor = isMono ? "#FFFFFF" : isAvailable ? "#FFCB05" : area.color;
  const showLabel = isRich || isAvailable || isSelected;

  let glyphClass = "inline-flex items-center justify-center transition-transform duration-[220ms]";
  if (isDone) glyphClass += " star-done-glyph";
  if (isAvailable) glyphClass += " star-available-glyph";

  return (
    <button
      type="button"
      data-star
      onClick={(e) => { e.stopPropagation(); onSelect(star.id); }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={star.label}
      className={[
        "absolute inline-flex items-center justify-center -translate-x-1/2 -translate-y-1/2 bg-transparent border-0 p-0 z-[3]",
        isAvailable ? "star-available-ring" : "",
      ].join(" ")}
      style={{
        left: star.x,
        top: star.y,
        "--twinkle-delay": `${twinkleDelay}ms`,
      } as React.CSSProperties}
    >
      {/* anillo de selección */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none"
          style={{
            width: size + 26,
            height: size + 26,
            borderColor: isAvailable ? "#FFCB05" : isDone ? (isMono ? "#fff" : area.color) : "rgba(255,255,255,0.5)",
          }}
        />
      )}

      {/* pips de maestría */}
      {showPips && (
        <span className="absolute left-1/2 -translate-x-1/2 flex gap-[3px] z-[4]" style={{ top: -16 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} width="9" height="9" viewBox="0 0 100 100" aria-hidden="true">
              <polygon
                points={PIP_POINTS}
                fill={i < star.mastery ? pipColor : "transparent"}
                stroke={i < star.mastery ? pipColor : "rgba(255,255,255,0.35)"}
                strokeWidth="6"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </span>
      )}

      {/* glifo principal */}
      <span className={glyphClass} style={{ width: size, height: size, filter }}>
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
          {shapePoints ? (
            <polygon
              points={shapePoints}
              fill={coreColor}
              stroke={strokeColor}
              strokeWidth={isLocked ? 4 : coreColor === "transparent" ? 4 : 3}
              strokeLinejoin="round"
            />
          ) : (
            <circle
              cx="50" cy="50"
              r={isLocked ? 22 : 30}
              fill={coreColor}
              stroke={strokeColor}
              strokeWidth={isLocked ? 4 : coreColor === "transparent" ? 4 : 0}
            />
          )}
        </svg>
      </span>

      {/* candado */}
      {isLocked && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
      )}

      {/* etiqueta */}
      {showLabel && (
        <span
          className={[
            "absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-body font-medium text-[12.5px] pointer-events-none",
            isLocked ? "text-white/45" : "text-white/90",
          ].join(" ")}
          style={{
            top: size + 6,
            textShadow: "0 1px 6px rgba(20,8,40,0.7)",
          }}
        >
          {star.label}
        </span>
      )}
    </button>
  );
}

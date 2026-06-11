"use client";

import { useMemo } from "react";
import type { Star, Tweaks } from "../data/types";
import { CONSTELLATIONS } from "../data/constellations";
import { EDGES, BOARD } from "../data/edges";
import { StarNode } from "./StarNode";

interface SkyProps {
  stars: Star[];
  tweaks: Tweaks;
  selectedId: string | null;
  onSelectStar: (id: string | null) => void;
}

function dashFor(pathStyle: Tweaks["pathStyle"], kind: "traced" | "active" | "locked"): string {
  if (pathStyle === "dashed") return "10 9";
  if (pathStyle === "dotted") return "2 8";
  if (pathStyle === "solid") return "none";
  return kind === "locked" ? "2 9" : kind === "active" ? "9 8" : "none";
}

export function Sky({ stars, tweaks, selectedId, onSelectStar }: SkyProps) {
  const starById = useMemo(() => {
    const m: Record<string, Star> = {};
    stars.forEach((s) => { m[s.id] = s; });
    return m;
  }, [stars]);

  const showLines = tweaks.pathStyle !== "none";
  const isMono = tweaks.stateStyle === "mono";

  return (
    <div
      className="relative"
      style={{ width: BOARD.w, height: BOARD.h }}
      onClick={() => onSelectStar(null)}
    >
      {/* aristas */}
      {showLines && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
          aria-hidden="true"
        >
          {EDGES.map(([a, b], i) => {
            const sa = starById[a];
            const sb = starById[b];
            if (!sa || !sb) return null;

            const aDone = sa.state === "done";
            const bDone = sb.state === "done";
            const aAvail = sa.state === "available";
            const bAvail = sb.state === "available";

            let kind: "traced" | "active" | "locked" = "locked";
            if (aDone && bDone) kind = "traced";
            else if ((aDone && bAvail) || (bDone && aAvail)) kind = "active";

            const areaColor = isMono ? "rgba(255,255,255,0.8)" : (CONSTELLATIONS[sa.area]?.color ?? "#fff");
            let stroke: string;
            let width: number;
            let opacity: number;
            let glow: string;

            if (kind === "traced") {
              stroke = areaColor; width = 2.5; opacity = 0.55; glow = isMono ? "rgba(255,255,255,0.5)" : areaColor;
            } else if (kind === "active") {
              stroke = "#FFCB05"; width = 2.5; opacity = 0.95; glow = "#FFCB05";
            } else {
              stroke = "rgba(255,255,255,0.9)"; width = 1.5; opacity = 0.16; glow = "transparent";
            }

            return (
              <line
                key={i}
                className={kind === "active" ? "edge-active" : undefined}
                x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                stroke={stroke}
                strokeWidth={width}
                strokeOpacity={opacity}
                strokeDasharray={dashFor(tweaks.pathStyle, kind)}
                strokeLinecap="round"
                style={glow !== "transparent" ? { filter: `drop-shadow(0 0 4px ${glow})` } : undefined}
              />
            );
          })}
        </svg>
      )}

      {/* etiquetas de constelación */}
      {Object.values(CONSTELLATIONS).map((c) => (
        <div
          key={c.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[3px] items-center text-center pointer-events-none z-[2]"
          style={{ left: c.label.x, top: c.label.y }}
        >
          <span
            className="font-heading font-bold text-[13px] tracking-[0.22em] uppercase opacity-90"
            style={{ color: isMono ? "rgba(255,255,255,0.92)" : c.color }}
          >
            {c.name}
          </span>
          {tweaks.density === "rich" && (
            <span className="font-body font-normal text-[11.5px] text-white/50 tracking-[0.01em]">
              {c.tagline}
            </span>
          )}
        </div>
      ))}

      {/* estrellas */}
      {stars.map((s) => (
        <StarNode
          key={s.id}
          star={s}
          area={CONSTELLATIONS[s.area]!}
          tweaks={tweaks}
          isSelected={selectedId === s.id}
          onSelect={onSelectStar}
        />
      ))}
    </div>
  );
}

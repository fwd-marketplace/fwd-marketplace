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
  newlyAvailableIds: Set<string>;
}

function dashFor(pathStyle: Tweaks["pathStyle"], kind: "traced" | "active" | "locked"): string {
  if (pathStyle === "dashed") return "10 9";
  if (pathStyle === "dotted") return "1 13";
  if (pathStyle === "solid") return "none";
  return kind === "locked" ? "2 9" : kind === "active" ? "9 8" : "none";
}

export function Sky({ stars, tweaks, selectedId, onSelectStar, newlyAvailableIds }: SkyProps) {
  const starById = useMemo(() => {
    const m: Record<string, Star> = {};
    stars.forEach((s) => { m[s.id] = s; });
    return m;
  }, [stars]);

  const isMono = tweaks.stateStyle === "mono";

  return (
    <div
      className="relative"
      style={{ width: BOARD.w, height: BOARD.h }}
      onClick={() => onSelectStar(null)}
    >
      {/* todo en un único SVG — sin rasterización por CSS transform */}
      <svg
        width={BOARD.w}
        height={BOARD.h}
        viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
        className="absolute inset-0 overflow-visible"
        style={{ display: "block" }}
        aria-label="Mapa de aprendizaje"
      >
        <defs>
          {/* nebulosas */}
          <filter id="nebula-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="55" />
          </filter>
          {/* glow estrella disponible (amarillo) */}
          <filter id="glow-available" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* glow estrella completada (color de área) */}
          <filter id="glow-done" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* halos de constelación */}
        {[
          { id: "fundamentos", cx: 300,  cy: 280, rx: 240, ry: 180 },
          { id: "frontend",    cx: 340,  cy: 790, rx: 250, ry: 185 },
          { id: "backend",     cx: 1060, cy: 870, rx: 250, ry: 200 },
          { id: "datos",       cx: 1200, cy: 280, rx: 255, ry: 170 },
        ].map(({ id, cx, cy, rx, ry }) => {
          const c = CONSTELLATIONS[id];
          if (!c) return null;
          return (
            <ellipse
              key={id}
              cx={cx} cy={cy} rx={rx} ry={ry}
              fill={c.color}
              fillOpacity={isMono ? 0.07 : 0.11}
              filter="url(#nebula-blur)"
            />
          );
        })}

        {/* etiquetas de constelación */}
        {Object.values(CONSTELLATIONS).map((c) => (
          <g key={c.id} transform={`translate(${c.label.x},${c.label.y})`} style={{ pointerEvents: "none" }}>
            <text
              textAnchor="middle"
              fill={isMono ? "rgba(255,255,255,0.92)" : c.color}
              fontSize={16}
              fontFamily="var(--font-archivo-narrow, ui-sans-serif)"
              fontWeight={700}
              letterSpacing="0.22em"
              style={{ textTransform: "uppercase", opacity: 0.9 }}
            >
              {c.name}
            </text>
            {tweaks.density === "rich" && (
              <text
                y={18}
                textAnchor="middle"
                fill="rgba(255,255,255,0.50)"
                fontSize={11.5}
                fontFamily="var(--font-figtree, ui-sans-serif)"
                fontWeight={400}
                letterSpacing="0.01em"
              >
                {c.tagline}
              </text>
            )}
          </g>
        ))}

        {/* aristas */}
        {tweaks.pathStyle !== "none" && EDGES.map(([a, b], i) => {
          const sa = starById[a];
          const sb = starById[b];
          if (!sa || !sb) return null;

          const aDone  = sa.state === "done";
          const bDone  = sb.state === "done";
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
              key={`${i}-${kind}`}
              className={[
                kind === "active" ? "edge-active" : "",
                kind !== "locked" ? "edge-lit" : "",
              ].join(" ").trim() || undefined}
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

        {/* estrellas — dentro del mismo SVG, siempre nítidas */}
        {stars.map((s) => (
          <StarNode
            key={s.id}
            star={s}
            area={CONSTELLATIONS[s.area]!}
            tweaks={tweaks}
            isSelected={selectedId === s.id}
            onSelect={onSelectStar}
            isNewlyUnlocked={newlyAvailableIds.has(s.id)}
          />
        ))}
      </svg>
    </div>
  );
}

"use client";

import { memo } from "react";
import { buildSparklePoints } from "@/lib/logo-constellation";

const SPARKLE_POINTS = buildSparklePoints(12, 12, 12);

type StarColor = "white" | "gold";
type StarKind  = "sparkle" | "dot";

interface SkyStar {
  top:     string;
  left:    string;
  size:    number;
  color:   StarColor;
  kind:    StarKind;
  opacity: number;
}

const SKY_STARS: readonly SkyStar[] = [
  // Top-left corner
  { top: "5%",  left: "7%",  size: 16, color: "gold",  kind: "sparkle", opacity: 0.85 },
  { top: "10%", left: "18%", size: 3,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "3%",  left: "32%", size: 2,  color: "white", kind: "dot",     opacity: 0.4  },

  // Top-right corner
  { top: "4%",  left: "82%", size: 14, color: "gold",  kind: "sparkle", opacity: 0.75 },
  { top: "9%",  left: "92%", size: 3,  color: "white", kind: "dot",     opacity: 0.5  },
  { top: "2%",  left: "60%", size: 2,  color: "white", kind: "dot",     opacity: 0.4  },

  // Left edge mid
  { top: "38%", left: "2%",  size: 12, color: "white", kind: "sparkle", opacity: 0.65 },
  { top: "55%", left: "1%",  size: 3,  color: "white", kind: "dot",     opacity: 0.45 },

  // Right edge mid
  { top: "42%", left: "97%", size: 12, color: "gold",  kind: "sparkle", opacity: 0.7  },
  { top: "62%", left: "96%", size: 2,  color: "white", kind: "dot",     opacity: 0.45 },

  // Bottom-left corner
  { top: "88%", left: "8%",  size: 14, color: "gold",  kind: "sparkle", opacity: 0.8  },
  { top: "92%", left: "22%", size: 3,  color: "white", kind: "dot",     opacity: 0.5  },

  // Bottom-right corner
  { top: "85%", left: "88%", size: 14, color: "gold",  kind: "sparkle", opacity: 0.75 },
  { top: "93%", left: "72%", size: 2,  color: "white", kind: "dot",     opacity: 0.4  },
  { top: "91%", left: "95%", size: 3,  color: "white", kind: "dot",     opacity: 0.45 },
];

function resolveStarFill(color: StarColor): string {
  return color === "gold" ? "var(--highlight)" : "var(--surface)";
}

function CosmicBackdropBase() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SKY_STARS.map((star, idx) => {
        const fill     = resolveStarFill(star.color);
        const duration = `${2.5 + (idx % 4) * 0.7}s`;
        const delay    = `${(idx % 7) * 0.4}s`;

        if (star.kind === "dot") {
          return (
            <span
              key={idx}
              className="absolute rounded-full"
              style={{
                top:    star.top,
                left:   star.left,
                width:  star.size,
                height: star.size,
                background: fill,
                ["--star-opacity" as string]: star.opacity,
                animation: `constellation-twinkle ${duration} ease-in-out ${delay} infinite`,
              }}
            />
          );
        }

        return (
          <span
            key={idx}
            className="absolute"
            style={{ top: star.top, left: star.left, opacity: star.opacity }}
          >
            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                display: "block",
                filter: `drop-shadow(0 0 3px ${fill})`,
                animation: `constellation-spark-twinkle ${duration} ease-in-out ${delay} infinite`,
              }}
            >
              <polygon points={SPARKLE_POINTS} fill={fill} />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

export const CosmicBackdrop = memo(CosmicBackdropBase);

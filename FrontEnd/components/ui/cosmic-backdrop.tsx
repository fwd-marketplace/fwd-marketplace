"use client";

import { memo } from "react";
import { buildSparklePoints } from "@/lib/logo-constellation";

const SPARKLE_POINTS = buildSparklePoints(12, 12, 12);

type StarColor = "white" | "gold";
type StarKind = "sparkle" | "dot";

interface SkyStar {
  top: string;
  left: string;
  size: number;
  color: StarColor;
  kind: StarKind;
  opacity: number;
}

interface Comet {
  top: string;
  left: string;
  height: number;
  duration: string;
  delay: string;
}

const SKY_STARS: readonly SkyStar[] = [
  // top-left zone
  { top: "5%",  left: "8%",  size: 16, color: "gold",  kind: "sparkle", opacity: 1.0 },
  { top: "11%", left: "22%", size: 5,  color: "white", kind: "dot",     opacity: 0.85 },
  { top: "18%", left: "5%",  size: 3,  color: "white", kind: "dot",     opacity: 0.6  },
  { top: "15%", left: "33%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "3%",  left: "42%", size: 5,  color: "white", kind: "dot",     opacity: 0.75 },
  // top-right zone
  { top: "6%",  left: "78%", size: 14, color: "gold",  kind: "sparkle", opacity: 1.0 },
  { top: "12%", left: "91%", size: 4,  color: "white", kind: "dot",     opacity: 0.8  },
  { top: "8%",  left: "55%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "16%", left: "65%", size: 4,  color: "white", kind: "dot",     opacity: 0.7  },
  { top: "4%",  left: "95%", size: 3,  color: "white", kind: "dot",     opacity: 0.6  },
  // mid-left
  { top: "35%", left: "3%",  size: 14, color: "white", kind: "sparkle", opacity: 0.95 },
  { top: "28%", left: "18%", size: 5,  color: "gold",  kind: "dot",     opacity: 0.85 },
  { top: "44%", left: "12%", size: 5,  color: "white", kind: "dot",     opacity: 0.8  },
  { top: "24%", left: "8%",  size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "38%", left: "25%", size: 3,  color: "white", kind: "dot",     opacity: 0.65 },
  // mid-right
  { top: "32%", left: "88%", size: 12, color: "gold",  kind: "sparkle", opacity: 1.0 },
  { top: "48%", left: "95%", size: 3,  color: "white", kind: "dot",     opacity: 0.6  },
  { top: "40%", left: "68%", size: 4,  color: "white", kind: "dot",     opacity: 0.75 },
  { top: "26%", left: "80%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "42%", left: "58%", size: 5,  color: "white", kind: "dot",     opacity: 0.7  },
  // center scatter
  { top: "52%", left: "48%", size: 12, color: "gold",  kind: "sparkle", opacity: 0.9 },
  { top: "58%", left: "30%", size: 5,  color: "white", kind: "dot",     opacity: 0.8  },
  { top: "62%", left: "65%", size: 5,  color: "gold",  kind: "dot",     opacity: 0.85 },
  { top: "55%", left: "15%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "50%", left: "75%", size: 4,  color: "white", kind: "dot",     opacity: 0.7  },
  { top: "65%", left: "42%", size: 3,  color: "white", kind: "dot",     opacity: 0.6  },
  // bottom-left
  { top: "72%", left: "7%",  size: 14, color: "white", kind: "sparkle", opacity: 0.95 },
  { top: "80%", left: "20%", size: 4,  color: "white", kind: "dot",     opacity: 0.8  },
  { top: "88%", left: "10%", size: 5,  color: "gold",  kind: "dot",     opacity: 0.85 },
  { top: "76%", left: "32%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "92%", left: "25%", size: 4,  color: "white", kind: "dot",     opacity: 0.65 },
  // bottom-right
  { top: "70%", left: "85%", size: 16, color: "gold",  kind: "sparkle", opacity: 1.0 },
  { top: "82%", left: "75%", size: 5,  color: "white", kind: "dot",     opacity: 0.85 },
  { top: "93%", left: "88%", size: 3,  color: "white", kind: "dot",     opacity: 0.6  },
  { top: "68%", left: "60%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "78%", left: "92%", size: 5,  color: "white", kind: "dot",     opacity: 0.75 },
  // bottom-center
  { top: "85%", left: "50%", size: 12, color: "gold",  kind: "sparkle", opacity: 0.95 },
  { top: "95%", left: "38%", size: 4,  color: "white", kind: "dot",     opacity: 0.75 },
  { top: "90%", left: "60%", size: 2,  color: "white", kind: "dot",     opacity: 0.55 },
  { top: "97%", left: "70%", size: 4,  color: "white", kind: "dot",     opacity: 0.65 },
];

const COMETS: readonly Comet[] = [
  { top: "6%",  left: "72%", height: 70, duration: "8s",  delay: "3s"  },
  { top: "18%", left: "85%", height: 55, duration: "10s", delay: "11s" },
  { top: "4%",  left: "50%", height: 60, duration: "9s",  delay: "19s" },
];

function resolveStarFill(color: StarColor): string {
  return color === "gold" ? "var(--highlight)" : "var(--surface)";
}

function CosmicBackdropBase() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes cosmic-comet {
          0%   { opacity: 0;   transform: translate(0, 0); }
          6%   { opacity: 0.6; }
          88%  { opacity: 0.3; }
          100% { opacity: 0;   transform: translate(-1600px, 1100px); }
        }
      `}</style>

      {/* Constelaciones tenues */}
      <svg className="absolute opacity-[0.35]" style={{ top: "12%", left: "12%", width: "160px", height: "160px" }} viewBox="0 0 100 100">
        <polyline points="10,20 30,30 50,20 70,50 90,60 80,80 60,70 70,50" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="10" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="30" cy="30" r="1.2" fill="white" opacity="0.6" />
        <circle cx="50" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="70" cy="50" r="1.2" fill="white" opacity="0.6" />
        <circle cx="90" cy="60" r="1.2" fill="white" opacity="0.6" />
        <circle cx="80" cy="80" r="1.2" fill="white" opacity="0.6" />
        <circle cx="60" cy="70" r="1.2" fill="white" opacity="0.6" />
      </svg>

      <svg className="absolute opacity-[0.35]" style={{ top: "62%", left: "72%", width: "130px", height: "130px" }} viewBox="0 0 100 100">
        <polyline points="10,50 30,20 50,40 70,15 90,60" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="10" cy="50" r="1.2" fill="white" opacity="0.6" />
        <circle cx="30" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="50" cy="40" r="1.2" fill="white" opacity="0.6" />
        <circle cx="70" cy="15" r="1.2" fill="white" opacity="0.6" />
        <circle cx="90" cy="60" r="1.2" fill="white" opacity="0.6" />
      </svg>

      <svg className="absolute opacity-[0.30]" style={{ top: "42%", left: "4%", width: "190px", height: "190px" }} viewBox="0 0 100 100">
        <polyline points="20,10 35,45 65,50 80,15" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        <polyline points="35,45 25,90 75,85 65,50" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="20" cy="10" r="1.2" fill="white" opacity="0.6" />
        <circle cx="80" cy="15" r="1.2" fill="white" opacity="0.6" />
        <circle cx="35" cy="45" r="1.2" fill="white" opacity="0.6" />
        <circle cx="65" cy="50" r="1.2" fill="white" opacity="0.6" />
        <circle cx="25" cy="90" r="1.2" fill="white" opacity="0.6" />
        <circle cx="75" cy="85" r="1.2" fill="white" opacity="0.6" />
      </svg>

      <svg className="absolute opacity-[0.35]" style={{ top: "22%", left: "72%", width: "110px", height: "110px" }} viewBox="0 0 100 100">
        <polyline points="10,80 30,50 60,60 80,20 90,40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        <circle cx="10" cy="80" r="1.2" fill="white" opacity="0.6" />
        <circle cx="30" cy="50" r="1.2" fill="white" opacity="0.6" />
        <circle cx="60" cy="60" r="1.2" fill="white" opacity="0.6" />
        <circle cx="80" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="90" cy="40" r="1.2" fill="white" opacity="0.6" />
      </svg>

      {/* Estrellas — mismo estilo que MarketplaceHeroBackdrop */}
      {SKY_STARS.map((star, idx) => {
        const fill = resolveStarFill(star.color);
        const duration = `${2.5 + (idx % 4) * 0.7}s`;
        const delay = `${(idx % 7) * 0.4}s`;

        if (star.kind === "dot") {
          return (
            <span
              key={idx}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
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

      {/* Cometas */}
      {COMETS.map((comet, idx) => (
        <div
          key={`comet-${idx}`}
          style={{
            position: "absolute",
            top: comet.top,
            left: comet.left,
            opacity: 0,
            animation: `cosmic-comet ${comet.duration} ease-in ${comet.delay} infinite`,
          }}
        >
          <div
            style={{
              width: "1.5px",
              height: `${comet.height}px`,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)",
              transform: "rotate(45deg)",
              transformOrigin: "top center",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export const CosmicBackdrop = memo(CosmicBackdropBase);

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Star, Constellation } from "../data/types";
import { starPolygon } from "../utils";

const SIX_POINT = starPolygon(6, 48, 20);
const DIAMOND = starPolygon(4, 49, 18);

interface CelebrationProps {
  star: Star;
  area: Constellation;
  xpGain: number;
  onDone: () => void;
}

export function Celebration({ star, area, xpGain, onDone }: CelebrationProps) {
  const t = useTranslations("viaje");

  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const ang = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
      const dist = 90 + (i % 4) * 26;
      return {
        x: Math.cos(ang) * dist,
        y: Math.sin(ang) * dist,
        delay: 120 + (i % 5) * 40,
        size: 7 + (i % 3) * 4,
        color: i % 3 === 0 ? "#FFCB05" : i % 3 === 1 ? area.color : "#FFFFFF",
      };
    });
  }, [star.id, area.color]);

  const rays = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => i * 30),
    [star.id],
  );

  return (
    <div
      className="sheet-scrim-enter fixed inset-0 z-[60] grid place-items-center bg-[rgba(26,11,46,0.92)] p-6"
      onClick={onDone}
      role="dialog"
      aria-label={`${t("celeb_eyebrow")}: ${star.label}`}
    >
      <div className="flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
        {/* burst */}
        <div className="relative w-[320px] h-[240px] grid place-items-center">
          {/* rayos */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width="320" height="320" viewBox="-160 -160 320 320"
            aria-hidden="true"
          >
            {rays.map((deg, i) => (
              <line
                key={i}
                x1="0" y1="0" x2="0" y2="-150"
                stroke={i % 2 === 0 ? "#FFCB05" : area.color}
                strokeWidth={i % 2 === 0 ? 3 : 2}
                strokeLinecap="round"
                transform={`rotate(${deg})`}
                className="celeb-ray"
                style={{ animationDelay: `${100 + i * 18}ms` }}
              />
            ))}
          </svg>

          {/* halo */}
          <span
            className="celeb-halo absolute w-[120px] h-[120px] rounded-full bg-white/[0.06]"
            style={{ filter: `drop-shadow(0 0 24px ${area.color}) drop-shadow(0 0 60px ${area.color})` }}
          />

          {/* estrella */}
          <span
            className="celeb-star relative"
            style={{
              filter: `drop-shadow(0 0 10px #fff) drop-shadow(0 0 28px ${area.color}) drop-shadow(0 0 56px ${area.color})`,
            }}
          >
            <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
              <polygon points={SIX_POINT} fill="#FFFFFF" stroke={area.color} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </span>

          {/* partículas */}
          {particles.map((p, i) => (
            <span
              key={i}
              className="celeb-particle"
              style={{
                "--px": `${p.x}px`,
                "--py": `${p.y}px`,
                animationDelay: `${p.delay}ms`,
              } as React.CSSProperties}
            >
              <svg width={p.size} height={p.size} viewBox="0 0 100 100" aria-hidden="true">
                <polygon points={DIAMOND} fill={p.color} />
              </svg>
            </span>
          ))}
        </div>

        {/* copy */}
        <div className="celeb-copy-enter mt-[6px] flex flex-col items-center gap-[3px]">
          <p className="font-heading font-bold text-[11px] tracking-[0.24em] uppercase text-highlight m-0">
            {t("celeb_eyebrow")}
          </p>
          <h2 className="font-heading font-extrabold text-[38px] tracking-[-0.02em] text-white m-0 mt-[2px]">
            {star.label}
            <span className="text-highlight" aria-hidden="true">.</span>
          </h2>
          <p className="font-body text-[15px] text-white/78 m-0 mt-1">
            {t("celeb_sub_prefix")} <strong className="font-semibold" style={{ color: area.color }}>{area.name}</strong>.
          </p>
          <div className="mt-4">
            <span className="inline-block font-heading font-extrabold text-[16px] tracking-[0.02em] text-highlight px-[18px] py-[7px] rounded-full bg-[rgba(255,203,5,0.16)] border border-[rgba(255,203,5,0.4)]">
              +{xpGain} {t("xp_label")}
            </span>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="mt-[18px] inline-flex items-center justify-center gap-[7px] rounded-full bg-highlight text-ink-strong font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms] hover:bg-[#e9bb04]"
          >
            {t("celeb_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { Star, Constellation, Progress } from "../data/types";

interface GoalBarProps {
  nextStar: Star | null;
  area: Constellation | null;
  onOpen: (id: string) => void;
  progress: Progress;
  level: string;
}

export function GoalBar({ nextStar, area, onOpen, progress, level }: GoalBarProps) {
  const t = useTranslations("viaje");
  const pct = Math.round((progress.lit / progress.total) * 100);

  const sharedStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(38,16,60,0.92) 0%, rgba(20,28,70,0.90) 100%)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow:
      "0 4px 12px oklch(0.20 0.14 300 / 0.40), 0 20px 48px oklch(0.15 0.12 280 / 0.50), inset 0 1px 0 rgba(255,255,255,0.08)",
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[22px] z-25 max-w-[640px] w-[calc(100%-36px)] flex items-center gap-3 px-4 py-[11px] rounded-[18px] backdrop-blur-[16px]"
      style={sharedStyle}
    >
      {/* ── Próxima estrella (clickable) ────────────────────────────── */}
      {nextStar && area ? (
        <button
          type="button"
          onClick={() => onOpen(nextStar.id)}
          className="flex items-center gap-[12px] min-w-0 flex-1 text-left group"
        >
          <span
            className="shrink-0 w-3 h-3 rounded-full bg-highlight"
            aria-hidden="true"
            style={{ boxShadow: "0 0 10px #FFCB05, 0 0 20px #FFCB05" }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-highlight m-0">
              {t("goal_next_eyebrow")}
            </p>
            <p className="font-heading font-extrabold text-[17px] tracking-[-0.01em] text-white mt-[2px] m-0 truncate">
              {nextStar.label}
              <span style={{ color: area.color }} aria-hidden="true">.</span>
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-[5px] font-body font-semibold text-[13px] text-highlight">
            {t("goal_see_how")}
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        </button>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-accent m-0">
            {t("goal_complete_eyebrow")}
          </p>
          <p className="font-heading font-extrabold text-[17px] tracking-[-0.01em] text-white mt-[2px] m-0">
            {t("goal_complete_title")}
          </p>
        </div>
      )}

      {/* ── Divisor ─────────────────────────────────────────────────── */}
      <div className="shrink-0 w-px h-8 bg-white/[0.18] hidden sm:block" aria-hidden="true" />

      {/* ── Barra de progreso ───────────────────────────────────────── */}
      <div className="shrink-0 flex-col gap-[5px] min-w-[140px] hidden sm:flex">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-heading font-bold text-[9.5px] tracking-[0.18em] uppercase text-highlight">
            {level}
          </span>
          <span className="font-body font-medium text-[11px] text-white/60">
            {t("sky_lit", { pct })}
          </span>
        </div>
        <div className="h-[4px] rounded-full bg-white/[0.14] overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-[320ms] ease-out"
            style={{ width: `${pct}%`, boxShadow: "0 0 8px #20BEC6, 0 0 16px #20BEC680" }}
          />
        </div>
      </div>
    </div>
  );
}

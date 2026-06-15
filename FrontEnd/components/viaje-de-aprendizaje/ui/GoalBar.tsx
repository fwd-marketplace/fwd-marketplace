"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { Star, Constellation } from "../data/types";

interface GoalBarProps {
  nextStar: Star | null;
  area: Constellation | null;
  onOpen: (id: string) => void;
}

export function GoalBar({ nextStar, area, onOpen }: GoalBarProps) {
  const t = useTranslations("viaje");

  if (!nextStar || !area) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 bottom-[22px] z-25 max-w-[460px] w-[calc(100%-36px)] flex items-center gap-[13px] px-4 py-[13px] rounded-[18px] bg-[rgba(38,16,60,0.9)] backdrop-blur-[14px] border border-white/[0.16] text-white text-left"
        style={{ boxShadow: "0 4px 10px oklch(0.25 0.12 300 / 0.35), 0 18px 40px oklch(0.18 0.10 300 / 0.45)" }}
      >
        <div>
          <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-accent">
            {t("goal_complete_eyebrow")}
          </p>
          <p className="font-heading font-extrabold text-[17px] tracking-[-0.01em] text-white mt-[2px]">
            {t("goal_complete_title")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(nextStar.id)}
      className="fixed left-1/2 -translate-x-1/2 bottom-[22px] z-25 max-w-[460px] w-[calc(100%-36px)] flex items-center gap-[13px] px-4 py-[13px] rounded-[18px] bg-[rgba(38,16,60,0.9)] backdrop-blur-[14px] border border-white/[0.16] text-white text-left transition-[transform,border-color] duration-[160ms] hover:-translate-x-1/2 hover:translate-y-[-2px] hover:border-[rgba(255,203,5,0.5)]"
      style={{ boxShadow: "0 4px 10px oklch(0.25 0.12 300 / 0.35), 0 18px 40px oklch(0.18 0.10 300 / 0.45)" }}
    >
      <span
        className="shrink-0 w-3 h-3 rounded-full bg-highlight"
        aria-hidden="true"
        style={{ boxShadow: "0 0 10px #FFCB05, 0 0 20px #FFCB05" }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-highlight">
          {t("goal_next_eyebrow")}
        </p>
        <p className="font-heading font-extrabold text-[17px] tracking-[-0.01em] text-white mt-[2px]">
          {nextStar.label}
          <span style={{ color: area.color }} aria-hidden="true">.</span>
        </p>
      </div>

      <span className="shrink-0 inline-flex items-center gap-[5px] font-body font-semibold text-[13px] text-highlight">
        {t("goal_see_how")}
        <ArrowRight size={15} aria-hidden="true" />
      </span>
    </button>
  );
}

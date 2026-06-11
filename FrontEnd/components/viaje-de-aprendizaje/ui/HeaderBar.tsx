"use client";

import { useTranslations } from "next-intl";
import { Star, Sparkles, Flame, ChevronLeft } from "lucide-react";
import type { Progress } from "../data/types";

interface HeaderBarProps {
  progress: Progress;
  xp: number;
  streak: number;
  level: string;
  onBack: () => void;
}

export function HeaderBar({ progress, xp, streak, level, onBack }: HeaderBarProps) {
  const t = useTranslations("viaje");
  const pct = Math.round((progress.lit / progress.total) * 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-[18px] pt-[14px] pb-[12px] bg-[rgba(38,16,60,0.82)] backdrop-blur-[14px] border-b border-white/[0.08]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("back_label")}
          className="shrink-0 w-[38px] h-[38px] rounded-full bg-white/10 border border-white/[0.18] text-white grid place-items-center transition-all duration-[160ms] hover:bg-white/[0.18]"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-white/55 m-0 mb-[1px]">
            {t("eyebrow")}
          </p>
          <h1 className="font-heading font-extrabold text-[22px] tracking-[-0.02em] text-white leading-none m-0">
            {t("title")}
            <span className="text-highlight" aria-hidden="true">.</span>
          </h1>
        </div>

        <div className="flex gap-2 shrink-0">
          <StatChip
            icon={<Star size={14} aria-hidden="true" />}
            value={`${progress.lit}/${progress.total}`}
            color="#20BEC6"
          />
          <StatChip
            icon={<Sparkles size={14} aria-hidden="true" />}
            value={xp.toLocaleString("de-DE")}
            unit={t("xp_label")}
            color="#FFCB05"
          />
          <StatChip
            icon={<Flame size={14} aria-hidden="true" />}
            value={String(streak)}
            unit={t("streak_label")}
            color="#F7901E"
          />
        </div>
      </div>

      <div className="mt-[11px] flex flex-col gap-[5px]">
        <div className="flex items-baseline justify-between">
          <span className="font-heading font-bold text-[10px] tracking-[0.18em] uppercase text-highlight">
            {level}
          </span>
          <span className="font-body font-medium text-[11.5px] text-white/62">
            {t("sky_lit", { pct })}
          </span>
        </div>
        <div className="h-[5px] rounded-full bg-white/[0.14] overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-[320ms] ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}

interface StatChipProps {
  icon: React.ReactNode;
  value: string;
  color: string;
  unit?: string;
}

function StatChip({ icon, value, color, unit }: StatChipProps) {
  return (
    <div className="inline-flex items-center gap-[7px] px-3 py-[6px] rounded-full bg-white/10 border border-white/[0.16]">
      <span style={{ color }}>{icon}</span>
      <span className="font-heading font-extrabold text-[14px] text-white whitespace-nowrap">
        {value}
        {unit && <span className="font-body font-medium text-[11px] text-white/60 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

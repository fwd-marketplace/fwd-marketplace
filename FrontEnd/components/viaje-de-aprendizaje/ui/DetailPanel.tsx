"use client";

import { useTranslations } from "next-intl";
import { X, Lock } from "lucide-react";
import type { Star, Constellation } from "../data/types";
import { starPolygon } from "../utils";

const PIP_POINTS = starPolygon(5, 48, 20);

interface DetailPanelProps {
  star: Star;
  area: Constellation;
  onClose: () => void;
  onLight: (id: string) => void;
}

export function DetailPanel({ star, area, onClose, onLight }: DetailPanelProps) {
  const t = useTranslations("viaje");
  const isDone = star.state === "done";
  const isAvailable = star.state === "available";
  const isLocked = star.state === "locked";

  const statePill = isDone
    ? { label: t("panel_state_done"),      bg: "#E8F9FA", fg: "#0e8a90" }
    : isAvailable
    ? { label: t("panel_state_available"), bg: "#FFFBE6", fg: "#8a6e00" }
    : { label: t("panel_state_locked"),    bg: "#F0F1F6", fg: "#6B6F85" };

  return (
    <>
      <div className="sheet-scrim-enter fixed inset-0 z-40 bg-[rgba(22,10,38,0.55)]" onClick={onClose} />

      <aside
        role="dialog"
        aria-label={star.label}
        className={[
          "sheet-enter fixed z-[41] bg-surface text-ink overflow-y-auto",
          "md:top-[92px] md:right-4 md:bottom-4 md:w-[380px] md:rounded-[20px] md:p-[26px]",
          "max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:max-h-[82dvh] max-md:rounded-t-[22px] max-md:p-5 max-md:pb-[30px]",
        ].join(" ")}
        style={{ boxShadow: "0 4px 8px oklch(0.55 0.16 245 / 0.06), 0 16px 32px oklch(0.55 0.16 245 / 0.1)" }}
      >
        {/* grip móvil */}
        <div className="md:hidden w-[42px] h-1 rounded-full bg-border-strong mx-auto mb-[14px]" />

        {/* cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("panel_close")}
          className="absolute top-4 right-4 md:top-[22px] md:right-[22px] w-[34px] h-[34px] rounded-full bg-surface-sunken border-0 text-ink-muted grid place-items-center transition-all duration-[160ms] hover:bg-border hover:text-ink"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* encabezado */}
        <div className="flex items-center gap-[9px] pr-10 mb-[14px]">
          <span
            className="inline-flex items-center gap-[6px] font-body font-medium text-[11.5px] px-[11px] py-1 rounded-full border-[1.5px]"
            style={{ color: area.color, borderColor: area.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: area.color }} />
            {area.name}
          </span>
          <span
            className="inline-flex items-center gap-[5px] font-body font-semibold text-[11px] px-[10px] py-1 rounded-full"
            style={{ background: statePill.bg, color: statePill.fg }}
          >
            {isLocked && <Lock size={11} stroke={statePill.fg} aria-hidden="true" />}
            {statePill.label}
          </span>
        </div>

        <h2 className="font-heading font-extrabold text-[28px] tracking-[-0.02em] text-ink-strong leading-[1.05] mb-3">
          {star.label}
          <span style={{ color: area.color }} aria-hidden="true">.</span>
        </h2>

        <p className="font-body text-[15px] leading-[1.5] text-ink-muted mb-5">
          {star.whatItIs}
        </p>

        {/* maestría */}
        <div className="px-4 py-[14px] rounded-[14px] bg-surface-sunken border border-border mb-4">
          <div className="flex items-baseline justify-between mb-[9px]">
            <span className="font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-ink-subtle">
              {t("panel_mastery")}
            </span>
            <span
              className="font-heading font-extrabold text-[15px]"
              style={{ color: isDone ? area.color : "var(--ink-subtle)" }}
            >
              {star.mastery} / 3
            </span>
          </div>
          <div className="flex gap-[7px]">
            {[0, 1, 2].map((i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 100 100" aria-hidden="true">
                <polygon
                  points={PIP_POINTS}
                  fill={i < star.mastery ? (isDone ? area.color : "var(--border-strong)") : "transparent"}
                  stroke={i < star.mastery ? (isDone ? area.color : "var(--border-strong)") : "var(--border-strong)"}
                  strokeWidth="7"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
        </div>

        {/* notas de estado */}
        {isDone && (
          <div className="px-4 py-[14px] rounded-[14px] bg-[#E8F9FA] mb-4">
            <span className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-[#0e8a90] mb-[5px]">
              {t("panel_unlocked_eyebrow")}
            </span>
            <p className="font-body text-[13.5px] leading-[1.5] text-ink m-0">
              {t("panel_unlocked_prefix")} <strong className="font-semibold text-ink-strong">{star.unlockedDate}</strong>{" "}
              {t("panel_unlocked_joining")} <strong className="font-semibold text-ink-strong">{star.via}</strong>.
            </p>
          </div>
        )}

        {isAvailable && (
          <>
            <div className="px-4 py-[14px] rounded-[14px] bg-[#FFFBE6] border border-[#FFE57A] mb-4">
              <span className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-[#8a6e00] mb-[5px]">
                {t("panel_available_eyebrow")}
              </span>
              <p className="font-body text-[13.5px] leading-[1.5] text-ink m-0">{star.howToUnlock}</p>
            </div>
            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={() => onLight(star.id)}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-white font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms] hover:bg-[#085fa8]"
              >
                {t("panel_btn_light")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full bg-transparent text-ink-muted font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms] hover:bg-surface-sunken"
              >
                {t("panel_btn_later")}
              </button>
            </div>
          </>
        )}

        {isLocked && (
          <div className="px-4 py-[14px] rounded-[14px] bg-surface-sunken border border-border mb-4">
            <span className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-[#6B6F85] mb-[5px]">
              {t("panel_locked_eyebrow")}
            </span>
            <p className="font-body text-[13.5px] leading-[1.5] text-ink m-0">{star.howToUnlock}</p>
            <p className="font-body text-[12.5px] text-ink-muted mt-2 m-0">
              {t("panel_locked_via_prefix")} <strong className="font-semibold text-ink-strong">{star.via}</strong>.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

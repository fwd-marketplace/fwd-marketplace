"use client";

import { useTranslations } from "next-intl";

interface ZoomControlsProps {
  onIn: () => void;
  onOut: () => void;
  onFit: () => void;
  canZoomOut: boolean;
}

export function ZoomControls({ onIn, onOut, onFit, canZoomOut }: ZoomControlsProps) {
  const t = useTranslations("viaje");

  return (
    <div className="fixed right-[18px] bottom-[92px] z-20 flex flex-col gap-px rounded-[13px] overflow-hidden bg-[rgba(38,16,60,0.72)] backdrop-blur-[10px] border border-white/[0.12]">
      <ZoomBtn onClick={onIn} label={t("zoom_in")}>+</ZoomBtn>
      <ZoomBtn onClick={onFit} label={t("zoom_fit")}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
        </svg>
      </ZoomBtn>
      <ZoomBtn onClick={onOut} label={t("zoom_out")} disabled={!canZoomOut}>−</ZoomBtn>
    </div>
  );
}

interface ZoomBtnProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ZoomBtn({ onClick, label, children, disabled = false }: ZoomBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="w-10 h-10 border-0 bg-transparent text-[19px] grid place-items-center transition-[background,color] duration-[160ms] [&+button]:border-t [&+button]:border-white/10 disabled:text-white/25 disabled:cursor-not-allowed text-white hover:enabled:bg-white/[0.12]"
    >
      {children}
    </button>
  );
}

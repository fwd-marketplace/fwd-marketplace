"use client";

import { useTranslations } from "next-intl";

const LEGEND_ITEMS = [
  { color: "#20BEC6",              outline: false, key: "legend_done"      },
  { color: "#FFCB05",              outline: false, key: "legend_available" },
  { color: "rgba(255,255,255,0.30)", outline: true, key: "legend_locked"   },
] as const;

export function Legend() {
  const t = useTranslations("viaje");

  return (
    <div className="fixed left-[18px] bottom-[22px] z-20 flex flex-col gap-[7px] px-[13px] py-[11px] rounded-[14px] bg-[rgba(38,16,60,0.72)] backdrop-blur-[10px] border border-white/10 max-sm:hidden">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-2 font-body font-medium text-[11.5px] text-white/78">
          <span
            className="w-[11px] h-[11px] rounded-full shrink-0"
            style={{
              background: item.outline ? "transparent" : item.color,
              border: item.outline ? `2px solid ${item.color}` : "none",
            }}
          />
          {t(item.key)}
        </span>
      ))}
    </div>
  );
}

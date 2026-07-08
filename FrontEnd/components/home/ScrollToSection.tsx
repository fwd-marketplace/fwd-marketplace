"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  targetId: string;
  label: string;
  className?: string;
  iconRight?: ReactNode;
}

export function ScrollToSection({ targetId, label, className, iconRight }: Props) {
  function handleClick() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10"
      }
    >
      {label}
      {iconRight ?? <ChevronDown className="size-4" aria-hidden="true" />}
    </button>
  );
}

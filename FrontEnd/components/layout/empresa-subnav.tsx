"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const NAV_HREFS = [
  { key: "mi_empresa", href: "/perfil-empresa" },
  { key: "mis_proyectos", href: "/dashboard" },
  { key: "matches", href: "/matches" },
] as const;

export function EmpresaSubnav({ actionSlot }: { actionSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("empresa_subnav");

  return (
    <nav
      role="tablist"
      className="sticky top-16 z-40 border-b border-border bg-surface/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl items-end gap-6 overflow-x-auto px-4 pb-px md:gap-8 md:px-6">
        {NAV_HREFS.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              role="tab"
              aria-selected={isActive}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                isActive
                  ? "border-primary font-semibold text-ink-strong"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
        {actionSlot && <div className="ml-auto shrink-0 self-center pl-2">{actionSlot}</div>}
      </div>
    </nav>
  );
}

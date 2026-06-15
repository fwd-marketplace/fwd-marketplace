"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_HREFS = [
  { key: "mis_proyectos", href: "/dashboard" },
  { key: "matches", href: "/matches", badge: { count: 18, variant: "warning" } },
  { key: "postulaciones", href: "/postulaciones", badge: { count: 48, variant: "primary" } },
  { key: "mi_empresa", href: "/perfil-empresa" },
] as const;

export function EmpresaSubnav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("empresa_subnav");

  return (
    <nav className="sticky top-14 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-4 md:px-6">
        {!pathname.endsWith("/perfil-empresa") && (
          <Link
            href={`/${locale}/perfil-empresa`}
            className="group flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-surface-sunken px-2.5 py-1 font-body text-xs font-bold text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/20 hover:bg-primary/5 hover:text-primary mr-2"
          >
            <ChevronLeft className="size-3.5 text-primary transition-transform duration-[var(--duration-fast)] group-hover:-translate-x-0.5" />
            <span>{t("back")}</span>
          </Link>
        )}
        {NAV_HREFS.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <span>{t(item.key)}</span>
              {"badge" in item && item.badge && (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
                    item.badge.variant === "warning" ? "bg-warning" : "bg-primary"
                  )}
                >
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

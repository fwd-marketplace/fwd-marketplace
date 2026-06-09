"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Mis proyectos", href: "/empresa/dashboard" },
  { label: "Matches", href: "/empresa/matches" },
  { label: "Postulaciones", href: "/empresa/postulaciones" },
  { label: "Mi empresa", href: "/empresa/perfil" },
] as const;

export function EmpresaSubnav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-14 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-4 md:px-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

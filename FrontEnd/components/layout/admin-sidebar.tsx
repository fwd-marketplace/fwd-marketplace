"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  ClipboardList,
  FolderKanban,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { logoutUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Talento", href: "/admin/talento", icon: Users },
  { label: "Usuarios", href: "/admin/usuarios", icon: UserCog },
  { label: "Empresas", href: "/admin/empresas", icon: Building2 },
  { label: "Solicitudes", href: "/admin/solicitudes", icon: ClipboardList },
  { label: "Proyectos", href: "/admin/proyectos", icon: FolderKanban },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart2 },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      // Borra las cookies de sesión (access + refresh); no toca la BD.
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  return (
    <aside
      className="flex w-56 shrink-0 flex-col"
      style={{ backgroundColor: "oklch(0.18 0.020 270)" }}
    >
      <div className="px-4 py-5">
        <p className="font-heading text-base font-bold tracking-tight text-white/90">
          FWD <span className="text-primary">Admin.</span>
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.includes(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 px-3 py-1">
          <p className="font-body text-xs font-semibold text-white/90">
            Admin FWD
          </p>
          <p className="font-body text-[11px] text-white/50">
            admin@fwd.cr
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-body text-sm font-medium text-white/60 transition-colors duration-[var(--duration-fast)] hover:bg-white/5 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

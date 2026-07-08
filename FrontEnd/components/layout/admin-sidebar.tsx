"use client";

import { useEffect, useState, useTransition } from "react";
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
  ShieldAlert,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

// Fondo oscuro canónico del panel admin (registro ADMIN, §5.7 del brief).
const SIDEBAR_BG = "oklch(0.18 0.020 270)";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Talento", href: "/admin/talento", icon: Users },
  { label: "Usuarios", href: "/admin/usuarios", icon: UserCog },
  { label: "Empresas", href: "/admin/empresas", icon: Building2 },
  { label: "Solicitudes", href: "/admin/solicitudes", icon: ClipboardList },
  { label: "Proyectos", href: "/admin/proyectos", icon: FolderKanban },
  { label: "Moderación", href: "/admin/moderacion", icon: ShieldAlert },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart2 },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
] as const;

export function AdminSidebar({ userName, email }: { userName: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleLogout() {
    startTransition(async () => {
      // Borra las cookies de sesión (access + refresh); no toca la BD.
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  // Cierra el drawer al navegar a otra ruta.
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Con el drawer abierto: cerrar con Escape y bloquear el scroll del fondo.
  useEffect(() => {
    if (!isDrawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDrawerOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Contenido compartido por el sidebar de escritorio y el drawer móvil.
  const navContent = (
    <>
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
              onClick={() => setIsDrawerOpen(false)}
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
        <Link
          href={`/${locale}/bienvenida`}
          onClick={() => setIsDrawerOpen(false)}
          className="mb-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-body text-sm font-medium text-white/60 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/5 hover:text-white/90"
        >
          <Home className="size-4 shrink-0" aria-hidden="true" />
          Página principal
        </Link>
        <div className="mb-2 px-3 py-1">
          <p className="truncate font-body text-xs font-semibold text-white/90">
            {userName || "Administrador"}
          </p>
          <p className="truncate font-body text-[11px] text-white/50">
            {email}
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
    </>
  );

  return (
    <>
      {/* Sidebar de escritorio (md+): ancho fijo, sin cambios respecto al diseño original. */}
      <aside
        className="hidden w-56 shrink-0 flex-col md:flex"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {navContent}
      </aside>

      {/* Barra superior móvil (< md): logo + botón hamburguesa. */}
      <div
        className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <p className="font-heading text-base font-bold tracking-tight text-white/90">
          FWD <span className="text-primary">Admin.</span>
        </p>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={isDrawerOpen}
          className="inline-flex size-10 items-center justify-center rounded-lg text-white/80 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Drawer móvil (< md): overlay + panel deslizante con la misma navegación. */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-ink-strong/50 backdrop-blur-sm"
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col shadow-elevated"
            style={{ backgroundColor: SIDEBAR_BG }}
          >
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Cerrar menú de navegación"
              className="absolute right-3 top-4 inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

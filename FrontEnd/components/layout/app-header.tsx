import Link from "next/link";
import { Bell } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/marketplace"
          className="font-heading text-lg font-bold tracking-tight text-ink-strong"
        >
          FWD <span className="text-primary">Talent.</span>
        </Link>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}

function NotificationBell() {
  return (
    <button
      type="button"
      aria-label="Notificaciones"
      className="relative inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken"
    >
      <Bell className="size-5" aria-hidden="true" />
      {/* badge placeholder — se conecta a datos reales en Fase 7 */}
      <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
    </button>
  );
}

function UserAvatar() {
  return (
    <button
      type="button"
      aria-label="Menú de usuario"
      className="flex size-8 items-center justify-center rounded-full bg-secondary font-body text-xs font-bold text-secondary-foreground transition-opacity duration-[var(--duration-fast)] hover:opacity-85"
    >
      FW
    </button>
  );
}

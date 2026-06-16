"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, LogOut } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { logoutUser } from "@/lib/actions/auth";
import { getInitials } from "@/lib/api/safe-json";

export function AppHeader({ userName = "" }: { userName?: string }) {
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href={`/${locale}/marketplace`}
          className="font-heading text-lg font-bold tracking-tight text-ink-strong"
        >
          FWD <span className="text-primary">Talent.</span>
        </Link>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserMenu userName={userName} />
        </div>
      </div>
    </header>
  );
}

function NotificationBell() {
  const t = useTranslations("app_header");
  return (
    <button
      type="button"
      aria-label={t("notifications")}
      className="relative inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken"
    >
      <Bell className="size-5" aria-hidden="true" />
      {/* badge placeholder — se conecta a datos reales en Fase 7 */}
      <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
    </button>
  );
}

function UserMenu({ userName = "" }: { userName?: string }) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = userName ? getInitials(userName) : "FW";

  function handleLogout() {
    startTransition(async () => {
      // Borra las cookies de sesión (access + refresh); no toca la BD.
      await logoutUser();
      router.replace(`/${locale}/login`);
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("user_menu")}
          className="flex size-8 items-center justify-center rounded-full bg-secondary font-body text-xs font-bold text-secondary-foreground transition-opacity duration-[var(--duration-fast)] hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-elevated)]"
        >
          <DropdownMenu.Item
            disabled={isPending}
            onSelect={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-magenta/10 data-highlighted:text-magenta"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {t("logout")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

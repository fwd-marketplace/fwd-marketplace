"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, User, X } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { logoutUser } from "@/lib/actions/auth";
import { getInitials } from "@/lib/api/safe-json";
import { cn } from "@/lib/utils";
import type { ApiRoleName } from "@/lib/api/types";
import { NotificationPanel } from "@/components/layout/notification-panel";

const NAV_JUNIOR = [
  { key: "nav_marketplace", href: "/marketplace" },
  { key: "nav_my_applications", href: "/mis-postulaciones" },
  { key: "nav_mensajes", href: "/mensajes" },
  { key: "nav_my_profile", href: "/perfil-estudiante" },
] as const;

const NAV_EMPRESA = [
  { key: "nav_my_projects", href: "/dashboard" },
  { key: "nav_postulaciones", href: "/postulaciones" },
  { key: "nav_my_company", href: "/perfil-empresa" },
] as const;

const PROFILE_HREF: Record<string, string> = {
  student: "/perfil-estudiante",
  company: "/perfil-empresa",
  admin: "/admin/dashboard",
};

export function AppHeader({
  userName = "",
  avatarUrl = "",
  role,
}: {
  userName?: string;
  avatarUrl?: string;
  role?: ApiRoleName;
}) {
  const locale = useLocale();
  const navLinks = role === "company" ? NAV_EMPRESA : role === "student" ? NAV_JUNIOR : [];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/marketplace`}
            className="font-heading text-lg font-bold tracking-tight text-ink-strong"
          >
            FWD <span className="text-primary">Talent.</span>
          </Link>

          {/* Desktop nav links */}
          {navLinks.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {navLinks.map((item) => (
                <NavLink key={item.href} href={item.href} labelKey={item.key} />
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1">
          <NotificationPanel role={role} />
          <UserMenu
            userName={userName}
            avatarUrl={avatarUrl}
            role={role}
            navLinks={navLinks}
          />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, labelKey }: { href: string; labelKey: string }) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const pathname = usePathname();
  const fullHref = `/${locale}${href}`;
  const isActive = pathname.includes(href);

  return (
    <Link
      href={fullHref}
      className={cn(
        "rounded-full px-3 py-1.5 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
      )}
    >
      {t(labelKey)}
    </Link>
  );
}


function UserMenu({
  userName = "",
  avatarUrl = "",
  role,
  navLinks,
}: {
  userName?: string;
  avatarUrl?: string;
  role?: ApiRoleName | undefined;
  navLinks: readonly { key: string; href: string }[];
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName ? getInitials(userName) : "FW";
  const profileHref = role ? PROFILE_HREF[role] : undefined;

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  const avatar = (
    <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-secondary font-body text-xs font-bold text-secondary-foreground">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={userName} className="size-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: dropdown */}
      <div className="hidden md:block">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("user_menu")}
              className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-secondary font-body text-xs font-bold text-secondary-foreground transition-opacity duration-[var(--duration-fast)] hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-elevated)]"
            >
              {userName && (
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-body text-xs font-bold text-ink-strong truncate">{userName}</p>
                </div>
              )}
              {profileHref && (
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/${locale}${profileHref}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken data-highlighted:bg-surface-sunken"
                  >
                    <User className="size-4" aria-hidden="true" />
                    {t("profile_link")}
                  </Link>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
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
      </div>

      {/* Mobile: slide-down panel */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label={t("open_menu")}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {mobileOpen ? <X className="size-5 text-ink-strong" /> : avatar}
        </button>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-14 z-40 border-b border-border bg-surface shadow-[var(--shadow-elevated)]">
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {userName && (
                <p className="px-3 pb-2 font-body text-xs font-bold text-ink-muted border-b border-border mb-2">
                  {userName}
                </p>
              )}
              {navLinks.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  labelKey={item.key}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              {profileHref && (
                <MobileNavLink
                  href={profileHref}
                  labelKey="profile_link"
                  onNavigate={() => setMobileOpen(false)}
                />
              )}
              <div className="pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-magenta transition-colors hover:bg-magenta/10 disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MobileNavLink({
  href,
  labelKey,
  onNavigate,
}: {
  href: string;
  labelKey: string;
  onNavigate: () => void;
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      href={`/${locale}${href}`}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)]",
        isActive ? "bg-primary/10 text-primary" : "text-ink hover:bg-surface-sunken",
      )}
    >
      {t(labelKey)}
    </Link>
  );
}

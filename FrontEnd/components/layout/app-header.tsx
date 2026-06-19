"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, ChevronDown, GraduationCap, LogOut, Menu, Settings, X } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { logoutUser } from "@/lib/actions/auth";
import { getInitials } from "@/lib/api/safe-json";
import { cn } from "@/lib/utils";
import type { ApiRoleName } from "@/lib/api/types";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { NavbarLogoConstellation } from "@/components/layout/NavbarLogoConstellation";

const HOME_HREF: Record<string, string> = {
  student: "/bienvenida",
  company: "/dashboard",
  admin: "/admin/dashboard",
};

const PROFILE_HREF: Record<string, string> = {
  student: "/perfil-estudiante",
  company: "/perfil-empresa",
  admin: "/admin/dashboard",
};

const PROFILE_LABEL: Record<string, string> = {
  student: "nav_my_profile",
  company: "nav_my_company",
  admin: "nav_my_profile",
};

type NavItem = { key: string; href: string };

function buildNavLinks(role?: ApiRoleName): NavItem[] {
  const links: NavItem[] = [
    { key: "nav_home", href: role ? (HOME_HREF[role] ?? "/bienvenida") : "/home" },
    { key: "nav_marketplace", href: "/marketplace" },
  ];
  // El perfil solo aplica con sesión iniciada.
  if (role) {
    links.push({
      key: PROFILE_LABEL[role] ?? "nav_my_profile",
      href: PROFILE_HREF[role] ?? "/perfil-estudiante",
    });
  }
  links.push(
    { key: "nav_terms", href: "/terminos-y-condiciones" },
    { key: "nav_privacy", href: "/politicas-de-privacidad" },
  );
  return links;
}

type MenuLink = { key: string; href: string; Icon: typeof Settings };

function buildMenuLinks(role?: ApiRoleName): MenuLink[] {
  const links: MenuLink[] = [];
  if (role === "student") {
    links.push({ key: "learning_map", href: "/viaje-de-aprendizaje", Icon: GraduationCap });
  }
  links.push({ key: "settings", href: "/preferencias-notificaciones", Icon: Settings });
  return links;
}

export function AppHeader({
  userName = "",
  avatarUrl = "",
  role,
}: {
  userName?: string;
  avatarUrl?: string;
  role?: ApiRoleName;
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const isAuthenticated = Boolean(role);
  const navLinks = buildNavLinks(role);
  const menuLinks = buildMenuLinks(role);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/marketplace`}
            aria-label={t("logo_alt")}
            className="flex size-9 shrink-0 items-center justify-center"
          >
            <NavbarLogoConstellation logoAlt={t("logo_alt")} />
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
          {/* Campana de notificaciones siempre visible a la par del perfil (solo con sesión) */}
          {isAuthenticated && (
            <NotificationPanel
              role={role}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              showTrigger
            />
          )}
          <UserMenu
            isAuthenticated={isAuthenticated}
            userName={userName}
            avatarUrl={avatarUrl}
            navLinks={navLinks}
            menuLinks={menuLinks}
            onOpenNotifications={() => setNotifOpen(true)}
          />
          {/* Botón de salida (puerta) siempre visible a la par del perfil */}
          {isAuthenticated && <LogoutButton className="hidden md:inline-flex" />}
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
  isAuthenticated,
  userName = "",
  avatarUrl = "",
  navLinks,
  menuLinks,
  onOpenNotifications,
}: {
  isAuthenticated: boolean;
  userName?: string;
  avatarUrl?: string;
  navLinks: readonly NavItem[];
  menuLinks: readonly MenuLink[];
  onOpenNotifications: () => void;
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName ? getInitials(userName) : "FW";

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
      {/* Desktop: dropdown (solo con sesión iniciada) */}
      {isAuthenticated && (
      <div className="hidden md:block">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("user_menu")}
              className="group flex items-center gap-1 rounded-full p-0.5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-secondary font-body text-xs font-bold text-secondary-foreground">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={userName} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <ChevronDown
                className="size-4 text-ink-muted transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-52 rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-elevated)]"
            >
              {userName && (
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-body text-xs font-bold text-ink-strong truncate">{userName}</p>
                </div>
              )}
              {menuLinks.map(({ key, href, Icon }) => (
                <DropdownMenu.Item key={href} asChild>
                  <Link
                    href={`/${locale}${href}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken data-highlighted:bg-surface-sunken"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {t(key)}
                  </Link>
                </DropdownMenu.Item>
              ))}
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
      )}

      {/* Mobile: slide-down panel */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label={t("open_menu")}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {mobileOpen ? (
            <X className="size-5 text-ink-strong" />
          ) : isAuthenticated ? (
            avatar
          ) : (
            <Menu className="size-5 text-ink-strong" aria-hidden="true" />
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-14 z-40 border-b border-border bg-surface shadow-[var(--shadow-elevated)]">
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {isAuthenticated && userName && (
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
              {isAuthenticated && (
                <>
                  <div className="pt-2 border-t border-border mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenNotifications();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
                    >
                      <Bell className="size-4" aria-hidden="true" />
                      {t("notifications")}
                    </button>
                    {menuLinks.map(({ key, href, Icon }) => (
                      <Link
                        key={href}
                        href={`/${locale}${href}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {t(key)}
                      </Link>
                    ))}
                  </div>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function LogoutButton({ className }: { className?: string }) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      aria-label={t("logout")}
      title={t("logout")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-magenta/10 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="size-5" aria-hidden="true" />
    </button>
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

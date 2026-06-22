"use client";

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, ChevronDown, GraduationCap, Languages, LogOut, Menu, Moon, Settings, X } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { logoutUser } from "@/lib/actions/auth";
import { getInitials } from "@/lib/api/safe-json";
import { cn } from "@/lib/utils";
import { createSeededRandom } from "@/lib/logo-constellation";
import { useTheme } from "@/lib/theme/theme-provider";
import type { ApiRoleName } from "@/lib/api/types";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { NavbarLogoConstellation } from "@/components/layout/NavbarLogoConstellation";
import { Switch } from "@/components/ui/switch";

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

/**
 * Tono del navbar según la sesión donde está el usuario. `light` es el navbar
 * claro por defecto (empresa); `student` y `public` usan un fondo morado oscuro
 * (con un tono distinto cada uno) y estrellitas, con texto claro para que se lea.
 */
export type HeaderTone = "light" | "student" | "public";

const HEADER_TONES: Record<HeaderTone, { container: string; dark: boolean }> = {
  light: {
    container: "border-border bg-surface/80 backdrop-blur-sm",
    dark: false,
  },
  // Sesión del estudiante: morado oscuro sólido.
  student: {
    container: "border-white/10 bg-secondary",
    dark: true,
  },
  // Páginas públicas: degradado morado -> azul FWD, distinto al del estudiante.
  public: {
    container: "border-white/10 bg-gradient-to-r from-secondary to-primary",
    dark: true,
  },
};

type StarStyle = CSSProperties & Record<`--${string}`, string | number>;

const NAV_STAR_COUNT = 28;
const NAV_STAR_SEED = 17;

interface NavStar {
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly sizePx: number;
  readonly opacity: number;
  readonly delayMs: number;
}

/**
 * Estrellas-punto deterministas (mismo resultado en servidor y cliente para no
 * romper la hidratación) repartidas por el navbar. Titilan con la animación
 * `constellation-twinkle` de globals.css.
 */
function buildNavStars(): NavStar[] {
  const next = createSeededRandom(NAV_STAR_SEED);
  const stars: NavStar[] = [];
  for (let index = 0; index < NAV_STAR_COUNT; index++) {
    stars.push({
      leftPercent: next() * 100,
      topPercent: next() * 100,
      sizePx: 1 + next() * 2,
      opacity: Number((0.25 + next() * 0.5).toFixed(2)),
      delayMs: next() * 4000,
    });
  }
  return stars;
}

const NAV_STARS = buildNavStars();

/** Campo de estrellas-punto semitransparentes y titilantes para navbars oscuros. */
function NavStars() {
  return (
    <div className="constellation-starfield" aria-hidden="true">
      {NAV_STARS.map((star, index) => {
        const style: StarStyle = {
          left: `${star.leftPercent}%`,
          top: `${star.topPercent}%`,
          width: `${star.sizePx}px`,
          height: `${star.sizePx}px`,
          opacity: star.opacity,
          animationDelay: `${star.delayMs}ms`,
          "--star-opacity": star.opacity,
        };
        return <span key={index} style={style} />;
      })}
    </div>
  );
}

type NavItem = { key: string; href: string };

function buildNavLinks(role?: ApiRoleName): NavItem[] {
  const links: NavItem[] = [
    { key: "nav_home", href: role ? (HOME_HREF[role] ?? "/bienvenida") : "/home" },
    { key: "nav_marketplace", href: "/marketplace" },
  ];
  // La gestión (info, chat y proceso) aplica a junior y empresa con sesión.
  if (role === "student" || role === "company") {
    links.push({ key: "nav_gestion", href: "/gestion" });
  }
  // El perfil se mueve junto al avatar — no va en la barra de nav.
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
  tone = "light",
}: {
  userName?: string;
  avatarUrl?: string;
  role?: ApiRoleName;
  tone?: HeaderTone;
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const isAuthenticated = Boolean(role);
  const navLinks = buildNavLinks(role);
  const menuLinks = buildMenuLinks(role);
  const [notifOpen, setNotifOpen] = useState(false);

  const { container, dark } = HEADER_TONES[tone];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b",
        container,
        dark && "relative",
      )}
    >
      {dark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <NavStars />
        </div>
      )}
      <div className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/marketplace`}
            aria-label={t("logo_alt")}
            className="flex size-10 shrink-0 items-center justify-center"
          >
            <NavbarLogoConstellation logoAlt={t("logo_alt")} />
          </Link>

          {/* Desktop nav links */}
          {navLinks.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {navLinks.map((item) => (
                <NavLink key={item.href} href={item.href} labelKey={item.key} dark={dark} />
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
              dark={dark}
            />
          )}
          <UserMenu
            isAuthenticated={isAuthenticated}
            {...(role !== undefined ? { role } : {})}
            userName={userName}
            avatarUrl={avatarUrl}
            navLinks={navLinks}
            menuLinks={menuLinks}
            onOpenNotifications={() => setNotifOpen(true)}
            dark={dark}
          />
          {/* Botón de salida (puerta) siempre visible a la par del perfil */}
          {isAuthenticated && <LogoutButton className="hidden md:inline-flex" dark={dark} />}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, labelKey, dark = false }: { href: string; labelKey: string; dark?: boolean }) {
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
        dark
          ? isActive
            ? "bg-white/20 text-white"
            : "text-white/75 hover:bg-white/10 hover:text-white"
          : isActive
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
  role,
  userName = "",
  avatarUrl = "",
  navLinks,
  menuLinks,
  onOpenNotifications,
  dark = false,
}: {
  isAuthenticated: boolean;
  role?: ApiRoleName;
  userName?: string;
  avatarUrl?: string;
  navLinks: readonly NavItem[];
  menuLinks: readonly MenuLink[];
  onOpenNotifications: () => void;
  dark?: boolean;
}) {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  // El switch de modo oscuro alterna el tema global (clase .dark en <html>).
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const initials = userName ? getInitials(userName) : "FW";

  // El switch de idioma está "activo" en inglés; al alternarlo cambia el locale de la ruta.
  const isEnglish = locale === "en";

  function handleSwitchLanguage() {
    const nextLocale = isEnglish ? "es" : "en";
    const nextPath = pathname.replace(/^\/[^/]+/, `/${nextLocale}`);
    router.replace(nextPath);
    router.refresh();
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  // En navbar oscuro el avatar morado se confunde con el fondo: usamos un círculo
  // claro semitransparente con borde para que destaque.
  const avatarClass = dark
    ? "bg-white/15 text-white ring-1 ring-white/30"
    : "bg-secondary text-secondary-foreground";

  const avatar = (
    <div
      className={cn(
        "flex size-8 items-center justify-center overflow-hidden rounded-full font-body text-xs font-bold",
        avatarClass,
      )}
    >
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
      <div className="hidden md:flex md:items-center md:gap-1">
        {role && (
          <Link
            href={`/${locale}${PROFILE_HREF[role] ?? "/perfil-estudiante"}`}
            className={cn(
              "rounded-full px-3 py-1.5 font-body text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
              dark
                ? pathname.includes(PROFILE_HREF[role] ?? "")
                  ? "bg-white/20 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
                : pathname.includes(PROFILE_HREF[role] ?? "")
                  ? "bg-primary/10 text-primary"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
            )}
          >
            {t(PROFILE_LABEL[role] ?? "nav_my_profile")}
          </Link>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("user_menu")}
              className={cn(
                "group flex items-center gap-1 rounded-full p-0.5 transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                dark ? "hover:bg-white/10" : "hover:bg-surface-sunken",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center overflow-hidden rounded-full font-body text-xs font-bold",
                  avatarClass,
                )}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={userName} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] group-data-[state=open]:rotate-180",
                  dark ? "text-white/70" : "text-ink-muted",
                )}
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
                onSelect={handleSwitchLanguage}
                aria-label={t("language")}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken data-highlighted:bg-surface-sunken"
              >
                <Languages className="size-4 text-ink-muted" aria-hidden="true" />
                <span className={cn("text-xs font-semibold", !isEnglish ? "text-primary" : "text-ink-subtle")}>
                  {t("lang_es")}
                </span>
                <Switch checked={isEnglish} tabIndex={-1} aria-hidden="true" className="pointer-events-none" />
                <span className={cn("text-xs font-semibold", isEnglish ? "text-primary" : "text-ink-subtle")}>
                  {t("lang_en")}
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault();
                  toggleTheme();
                }}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken data-highlighted:bg-surface-sunken"
              >
                <span className="flex items-center gap-2">
                  <Moon className="size-4" aria-hidden="true" />
                  {t("dark_mode")}
                </span>
                <Switch checked={isDarkMode} tabIndex={-1} aria-hidden="true" className="pointer-events-none" />
              </DropdownMenu.Item>
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
            <X className={cn("size-5", dark ? "text-white" : "text-ink-strong")} />
          ) : isAuthenticated ? (
            avatar
          ) : (
            <Menu className={cn("size-5", dark ? "text-white" : "text-ink-strong")} aria-hidden="true" />
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-16 z-40 border-b border-border bg-surface shadow-[var(--shadow-elevated)]">
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
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSwitchLanguage();
                      }}
                      aria-label={t("language")}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
                    >
                      <span className="flex items-center gap-2">
                        <Languages className="size-4" aria-hidden="true" />
                        {t("language")}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={cn("text-xs font-semibold", !isEnglish ? "text-primary" : "text-ink-subtle")}>
                          {t("lang_es")}
                        </span>
                        <Switch checked={isEnglish} tabIndex={-1} aria-hidden="true" className="pointer-events-none" />
                        <span className={cn("text-xs font-semibold", isEnglish ? "text-primary" : "text-ink-subtle")}>
                          {t("lang_en")}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
                    >
                      <span className="flex items-center gap-2">
                        <Moon className="size-4" aria-hidden="true" />
                        {t("dark_mode")}
                      </span>
                      <Switch checked={isDarkMode} tabIndex={-1} aria-hidden="true" className="pointer-events-none" />
                    </button>
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

function LogoutButton({ className, dark = false }: { className?: string; dark?: boolean }) {
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
        "inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        dark
          ? "text-white/80 hover:bg-white/15 hover:text-white"
          : "text-ink-muted hover:bg-magenta/10 hover:text-magenta",
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

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Languages, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/theme-provider";

/**
 * Controles de idioma y tema para el nav público (landing y pantallas sin sesión).
 * El header autenticado tiene los suyos dentro del menú de usuario; acá se exponen
 * para visitantes anónimos, que antes no tenían forma de cambiarlos por UI.
 */
export function PublicNavControls() {
  const t = useTranslations("app_header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const isEnglish = locale === "en";

  function switchLanguage() {
    const nextLocale = isEnglish ? "es" : "en";
    const nextPath = pathname.replace(/^\/[^/]+/, `/${nextLocale}`);
    // Preserva query params y hash de la vista actual (pathname no los incluye).
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${nextPath}${search}${hash}`);
    router.refresh();
  }

  const iconButton =
    "inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-[--duration-fast] hover:bg-surface-sunken hover:text-ink-strong";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={switchLanguage}
        aria-label={t("language")}
        title={t("language")}
        className={cn(iconButton, "w-auto gap-1.5 px-2.5 font-body text-xs font-semibold")}
      >
        <Languages className="size-4" aria-hidden="true" />
        {isEnglish ? "ES" : "EN"}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t("dark_mode")}
        title={t("dark_mode")}
        className={iconButton}
      >
        {isDarkMode ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

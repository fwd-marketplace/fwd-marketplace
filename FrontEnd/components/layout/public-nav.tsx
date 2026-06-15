import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";

export async function PublicNav() {
  const [t, locale] = await Promise.all([
    getTranslations("nav"),
    getLocale(),
  ]);

  const NAV_LINKS = [
    { label: t("marketplace"), href: `/${locale}/marketplace` },
    { label: t("metodologia"), href: "#" },
    { label: t("empresas"), href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href={`/${locale}/home`}
          className="font-heading text-lg font-extrabold tracking-tight text-ink-strong"
        >
          FWD Talent<span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-body text-sm font-medium text-ink-muted transition-colors duration-[--duration-fast] hover:text-ink-strong"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/login`}
            className="rounded-full px-4 py-2 font-body text-sm font-medium text-ink-strong transition-colors duration-[--duration-fast] hover:bg-surface-sunken"
          >
            {t("ingresar")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="rounded-full bg-primary px-4 py-2 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            {t("registrarse")}
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { SVGProps } from "react";
import { getTranslations, getLocale } from "next-intl/server";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export async function SiteFooter() {
  const [t, locale] = await Promise.all([
    getTranslations("site_footer"),
    getLocale(),
  ]);

  const LEGAL_LINKS = [
    { label: t("terms"), href: `/${locale}/terminos-y-condiciones` },
    { label: t("privacy"), href: `/${locale}/politicas-de-privacidad` },
  ];

  const SOCIAL_LINKS = [
    {
      label: t("facebook"),
      href: "https://www.facebook.com/fwdcostarica/mentions/",
      Icon: FacebookIcon,
    },
    {
      label: t("linkedin"),
      href: "https://cr.linkedin.com/company/fwd-costa-rica",
      Icon: LinkedinIcon,
    },
  ];

  return (
    <footer className="border-t border-border bg-surface text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 md:px-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <a
            href="https://www.fwdcostarica.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3"
            aria-label={t("brand_name")}
          >
            <Image
              src="/fwd-logo.png"
              alt={t("logo_alt")}
              width={128}
              height={67}
              className="h-7 w-auto"
            />
          </a>

          <div className="flex flex-col items-center gap-3 text-center">
            <nav
              className="flex items-center gap-2 text-xs font-medium"
              aria-label={t("links_title")}
            >
              {LEGAL_LINKS.map(({ label, href }, index) => (
                <span key={href} className="flex items-center gap-2">
                  {index > 0 && <span className="text-ink-muted">-</span>}
                  <Link
                    href={href}
                    className="text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-primary"
                  >
                    {label}
                  </Link>
                </span>
              ))}
            </nav>
            <p className="text-xs text-ink-muted">
              {t("copyright")} · {t("rights")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 md:justify-end">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-primary"
              >
                <Icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function AuthFooterLinks() {
  const t = useTranslations("auth_footer");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="mt-6 text-center">
      <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        <Link
          href={`/${locale}/politicas-de-privacidad`}
          className="font-body text-xs text-white/50 transition-colors duration-[var(--duration-fast)] hover:text-white/80"
        >
          {t("privacy")}
        </Link>
        <span className="text-white/20" aria-hidden="true">·</span>
        <Link
          href={`/${locale}/terminos-y-condiciones`}
          className="font-body text-xs text-white/50 transition-colors duration-[var(--duration-fast)] hover:text-white/80"
        >
          {t("terms")}
        </Link>
      </nav>
      <p className="font-body text-xs text-white/30">{t("copyright")}</p>
    </div>
  );
}

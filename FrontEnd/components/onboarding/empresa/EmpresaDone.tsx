import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

interface EmpresaDoneProps {
  locale: string;
}

export async function EmpresaDone({ locale }: EmpresaDoneProps) {
  const t = await getTranslations("register");

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />

      <header className="relative flex items-center px-4 py-5 sm:px-8 sm:py-6">
        <span className="font-heading text-base font-extrabold text-secondary-foreground">
          {t("brand")}
          <span className="text-highlight">{t("brand_suffix")}</span>
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-6 py-8 text-center shadow-elevated sm:px-10 sm:py-12">
          <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t("empresa.done.eyebrow")}
          </p>

          <h1 className="mb-3 font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t("empresa.done.title")}
          </h1>

          <p className="mb-10 font-body text-sm text-ink-muted">
            {t("empresa.done.description")}
          </p>

          <Link
            href={`/${locale}/empresa/dashboard`}
            className="inline-flex items-center justify-center rounded-full bg-highlight px-8 py-3 font-body text-sm font-semibold text-highlight-foreground transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            {t("empresa.done.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

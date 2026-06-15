import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

interface JuniorDoneProps {
  locale: string;
}

export async function JuniorDone({ locale }: JuniorDoneProps) {
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
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
            <Clock className="h-6 w-6 text-ink-muted" aria-hidden="true" />
          </div>

          <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t("junior.done.eyebrow")}
          </p>

          <h1 className="mb-3 font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t("junior.done.title")}
          </h1>

          <p className="mb-10 font-body text-sm text-ink-muted">
            {t("junior.done.description")}
          </p>

          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-8 py-3 font-body text-sm font-semibold text-ink transition-colors duration-[--duration-fast] hover:bg-surface-sunken"
          >
            {t("junior.done.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

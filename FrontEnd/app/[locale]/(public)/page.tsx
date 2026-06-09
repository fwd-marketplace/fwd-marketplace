import { useTranslations } from "next-intl";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main className="min-h-[100dvh] bg-canvas px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="max-w-prose font-body text-lg text-ink-muted">
          {t("description")}
        </p>
      </div>
    </main>
  );
}

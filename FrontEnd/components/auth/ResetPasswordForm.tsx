"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock, RotateCcwKey } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetPasswordForm() {
  const t = useTranslations("reset_password");
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validate(): string | null {
    if (!EMAIL_PATTERN.test(email.trim())) return t("error_email");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resetPassword({ email: email.trim() });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmittedEmail(email.trim());
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href={`/${locale}/login`}
          className="font-heading text-xl font-bold tracking-tight text-primary"
        >
          {t("brand")}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="font-body text-sm text-ink-muted transition-colors duration-[--duration-fast] hover:text-ink-strong"
        >
          {t("back_to_login")}
        </Link>
      </header>

      {/* Main card */}
      <main className="flex flex-grow items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg rounded-3xl bg-surface px-6 py-10 shadow-soft sm:px-12">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <RotateCcwKey className="size-7 text-primary" aria-hidden="true" />
          </div>

          <h1 className="mb-2 text-center font-heading text-3xl font-extrabold tracking-tight text-ink-strong md:text-4xl">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-sm text-center font-body text-sm text-ink-muted">
            {t("description")}
          </p>

          {submittedEmail ? (
            <div
              role="status"
              className="rounded-2xl border border-accent/30 bg-accent/10 px-6 py-8 text-center"
            >
              <h2 className="mb-2 font-heading text-lg font-bold text-ink-strong">
                {t("success_title")}
              </h2>
              <p className="font-body text-sm text-ink-muted">
                {t("success_message", { email: submittedEmail })}
              </p>
              <Link
                href={`/${locale}/login`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
              >
                {t("back_to_login")}
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-email"
                  className="font-body text-sm font-semibold text-ink-strong"
                >
                  {t("email_label")}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_placeholder")}
                  className="w-full rounded-xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <hr className="border-border" />

              {error ? (
                <p role="alert" className="font-body text-sm text-magenta">
                  {error}
                </p>
              ) : (
                <p className="font-body text-sm text-ink-muted">{t("request_hint")}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? t("submitting") : t("submit")}
              </button>

              <p className="flex items-center justify-center gap-1.5 font-body text-sm text-ink-muted">
                <Lock size={14} strokeWidth={2} aria-hidden="true" />
                {t("secure_connection")}
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 text-center md:px-10">
        <p className="mb-3 font-heading text-sm font-bold text-ink-strong">{t("brand")}</p>
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-sm text-ink-muted">
          <Link
            href={`/${locale}/politicas-de-privacidad`}
            className="transition-colors duration-[--duration-fast] hover:text-ink-strong"
          >
            {t("footer_privacy")}
          </Link>
          <Link
            href={`/${locale}/terminos-y-condiciones`}
            className="transition-colors duration-[--duration-fast] hover:text-ink-strong"
          >
            {t("footer_terms")}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="transition-colors duration-[--duration-fast] hover:text-ink-strong"
          >
            {t("footer_security")}
          </Link>
        </nav>
        <p className="font-body text-xs text-ink-subtle">{t("footer_copyright")}</p>
      </footer>
    </div>
  );
}

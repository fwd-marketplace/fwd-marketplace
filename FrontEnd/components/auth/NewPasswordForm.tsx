"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, RotateCcwKey } from "lucide-react";
import { confirmResetPassword } from "@/lib/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/validations/auth";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";

type RecoveryTokens = {
  accessToken?: string;
  refreshToken?: string;
  tokenHash?: string;
};

export function NewPasswordForm() {
  const t = useTranslations("reset_password");
  const params = useParams();
  const locale = params.locale as string;

  const [tokens, setTokens] = useState<RecoveryTokens | null>(null);
  const [linkChecked, setLinkChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  // El token de recuperación viaja en el fragment (#access_token=...) o, si se
  // personaliza la plantilla, en la query (?token_hash=...). El fragment solo se
  // puede leer en el cliente, por eso este efecto.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);

    const accessToken = hash.get("access_token") ?? undefined;
    const refreshToken = hash.get("refresh_token") ?? undefined;
    const tokenHash = query.get("token_hash") ?? hash.get("token_hash") ?? undefined;

    const recovery: RecoveryTokens = {};
    if (accessToken) recovery.accessToken = accessToken;
    if (refreshToken) recovery.refreshToken = refreshToken;
    if (tokenHash) recovery.tokenHash = tokenHash;

    if (recovery.tokenHash || (recovery.accessToken && recovery.refreshToken)) {
      setTokens(recovery);
    }
    setLinkChecked(true);
  }, []);

  function validate(): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) return t("error_password_length");
    if (password !== confirmPassword) return t("error_mismatch");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokens) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await confirmResetPassword({ ...tokens, password, confirmPassword });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-secondary">
      <FwdGeoBackdrop />
      <CosmicBackdrop />
      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href={`/${locale}/login`}
          className="font-heading text-xl font-bold tracking-tight text-secondary-foreground"
        >
          {t("brand")}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="font-body text-sm text-white/60 transition-colors duration-[--duration-fast] hover:text-white"
        >
          {t("back_to_login")}
        </Link>
      </header>

      {/* Main card */}
      <main className="relative flex flex-grow items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg rounded-3xl bg-surface px-6 py-10 shadow-soft sm:px-12">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <RotateCcwKey className="size-7 text-primary" aria-hidden="true" />
          </div>

          <h1 className="mb-2 text-center font-heading text-3xl font-extrabold tracking-tight text-ink-strong md:text-4xl">
            {t("new_title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-sm text-center font-body text-sm text-ink-muted">
            {t("new_description")}
          </p>

          {linkChecked && !tokens ? (
            <div
              role="alert"
              className="rounded-2xl border border-magenta/30 bg-magenta/10 px-6 py-8 text-center"
            >
              <h2 className="mb-2 font-heading text-lg font-bold text-ink-strong">
                {t("invalid_link_title")}
              </h2>
              <p className="font-body text-sm text-ink-muted">{t("invalid_link_message")}</p>
              <Link
                href={`/${locale}/recuperar-contrasena`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
              >
                {t("request_again")}
              </Link>
            </div>
          ) : done ? (
            <div
              role="status"
              className="rounded-2xl border border-accent/30 bg-accent/10 px-6 py-8 text-center"
            >
              <h2 className="mb-2 font-heading text-lg font-bold text-ink-strong">
                {t("new_success_title")}
              </h2>
              <p className="font-body text-sm text-ink-muted">{t("new_success_message")}</p>
              <Link
                href={`/${locale}/login`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
              >
                {t("go_to_login")}
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="new-password"
                  className="font-body text-sm font-semibold text-ink-strong"
                >
                  {t("password_label")}
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("password_placeholder")}
                    className="w-full rounded-xl bg-surface-sunken px-4 py-3 pr-12 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    aria-label={isPasswordVisible ? t("hide_password") : t("show_password")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors duration-[--duration-fast] hover:text-ink-muted"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Eye size={18} strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="new-confirm"
                  className="font-body text-sm font-semibold text-ink-strong"
                >
                  {t("confirm_label")}
                </label>
                <div className="relative">
                  <input
                    id="new-confirm"
                    type={isConfirmVisible ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("confirm_placeholder")}
                    className="w-full rounded-xl bg-surface-sunken px-4 py-3 pr-12 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmVisible((prev) => !prev)}
                    aria-label={isConfirmVisible ? t("hide_password") : t("show_password")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors duration-[--duration-fast] hover:text-ink-muted"
                  >
                    {isConfirmVisible ? (
                      <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Eye size={18} strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <hr className="border-border" />

              {error ? (
                <p role="alert" className="font-body text-sm text-magenta">
                  {error}
                </p>
              ) : (
                <p className="font-body text-sm text-ink-muted">{t("hint")}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? t("submitting") : t("new_submit")}
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

"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorText } from "@/lib/i18n/api-error";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";
import { AuthFooterLinks } from "@/components/auth/AuthFooterLinks";
import { registerUser, startOAuth } from "@/lib/actions/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}

interface RegisterFormProps {
  badge?: React.ReactNode;
}

export function RegisterForm({ badge }: RegisterFormProps) {
  const t = useTranslations("register.auth");
  const errorText = useApiErrorText();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function togglePasswordVisibility() { setIsPasswordVisible((p) => !p); }
  function toggleConfirmPasswordVisibility() { setIsConfirmPasswordVisible((p) => !p); }

  function handleOAuth(provider: "google" | "github") {
    setError(null);
    startTransition(async () => {
      const result = await startOAuth(provider, locale);
      if (!result.ok) {
        setError(errorText(result.error));
        return;
      }
      window.location.href = result.data.url;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("passwords_mismatch"));
      return;
    }
    startTransition(async () => {
      const result = await registerUser({ email, password });
      if (result.ok) {
        router.push(`/${locale}/register/role`);
      } else {
        setError(errorText(result.error));
      }
    });
  }

  return (
    <div className="bg-secondary relative overflow-hidden min-h-screen w-full">
      <FwdGeoBackdrop />
      <CosmicBackdrop />

      <div className="absolute left-6 top-6 z-10">
        <Link
          href={`/${locale}/home`}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-body text-sm font-medium text-white/75 backdrop-blur-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t("back_home")}
        </Link>
      </div>

      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
        {badge && <div className="absolute top-6 right-6">{badge}</div>}
        <div className="w-full max-w-xl rounded-[2rem] bg-surface px-8 py-10 shadow-elevated sm:px-14 sm:py-12">
          <p className="mb-3 text-center font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t("eyebrow")}
          </p>

          <h1 className="mb-2 text-center font-heading text-5xl font-extrabold tracking-tight text-ink-strong">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>

          <p className="mb-8 text-center font-body text-sm text-ink-muted">
            {t("description")}
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border-strong bg-surface px-6 py-3 font-body text-sm font-medium text-ink-strong transition-colors duration-[--duration-fast] hover:bg-surface-sunken disabled:opacity-60"
            >
              <GoogleIcon />
              {t("continue_google")}
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-ink-strong px-6 py-3 font-body text-sm font-medium text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:opacity-60"
            >
              <GitHubIcon />
              {t("continue_github")}
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-body text-xs text-ink-subtle">{t("or_divider")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="font-body text-xs font-semibold text-ink-muted">
                {t("email_label")}
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_placeholder")}
                className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="font-body text-xs font-semibold text-ink-muted">
                {t("password_label")}
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password_placeholder")}
                  className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 pr-12 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button type="button" onClick={togglePasswordVisibility} aria-label={isPasswordVisible ? t("hide_password") : t("show_password")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-ink-muted">
                  {isPasswordVisible ? <EyeOff size={16} strokeWidth={2} aria-hidden="true" /> : <Eye size={16} strokeWidth={2} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-confirm-password" className="font-body text-xs font-semibold text-ink-muted">
                {t("confirm_password_label")}
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirm_password_placeholder")}
                  className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 pr-12 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button type="button" onClick={toggleConfirmPasswordVisibility} aria-label={isConfirmPasswordVisible ? t("hide_password") : t("show_password")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-ink-muted">
                  {isConfirmPasswordVisible ? <EyeOff size={16} strokeWidth={2} aria-hidden="true" /> : <Eye size={16} strokeWidth={2} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="font-body text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? t("submitting") : t("submit")}
            </button>

          </form>

          <p className="mt-6 text-center font-body text-xs text-ink-subtle">
            {t("terms_prefix")}{" "}
            <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
              {t("terms_link")}
            </a>{" "}
            {t("terms_connector")}{" "}
            <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
              {t("privacy_link")}
            </a>
            .
          </p>
        </div>

        <p className="mt-5 text-center font-body text-sm text-white/60">
          {t("already_account")}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-white/90 underline underline-offset-2 hover:text-white"
          >
            {t("login_link")}
          </Link>
        </p>
        <AuthFooterLinks />
      </div>
    </div>
  );
}

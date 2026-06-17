"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { completeOAuth } from "@/lib/actions/auth";

/**
 * Aterrizaje del login social. El provider -> Supabase redirige acá con la
 * sesión en el fragment (#access_token=...&refresh_token=...). Este componente
 * lee esos tokens (solo accesibles en el cliente), los valida vía un server
 * action que setea las cookies httpOnly, y enruta según rol/estado.
 */
export function OAuthCallback() {
  const t = useTranslations("oauth_callback");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const providerError = hash.get("error_description") ?? hash.get("error");

    if (providerError) {
      setError(providerError);
      return;
    }
    if (!accessToken || !refreshToken) {
      setError(t("error_no_session"));
      return;
    }

    // Quita los tokens de la URL para que no queden en el historial del navegador.
    window.history.replaceState(null, "", window.location.pathname);

    let cancelled = false;
    completeOAuth({ accessToken, refreshToken }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const { role, estado_cuenta } = result.data;
      if (estado_cuenta === "no_profile") {
        router.replace(`/${locale}/register/role`);
      } else if (estado_cuenta === "pendiente") {
        router.replace(`/${locale}/done`);
      } else if (estado_cuenta === "activa") {
        if (role === "admin") {
          router.replace(`/${locale}/admin`);
        } else if (role === "company" || role === "empresa" || role === "emprendedor") {
          router.replace(`/${locale}/empresa/dashboard`);
        } else if (role === "student" || role === "junior") {
          router.replace(`/${locale}/bienvenida`);
        } else {
          router.replace(`/${locale}/marketplace`);
        }
      } else {
        setError(t("error_suspended"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locale, router, t]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      {error ? (
        <div className="w-full max-w-md rounded-3xl bg-surface px-6 py-10 shadow-soft">
          <h1 className="mb-2 font-heading text-2xl font-bold text-ink-strong">
            {t("error_title")}
          </h1>
          <p className="mb-6 font-body text-sm text-ink-muted">{error}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            {t("back_to_login")}
          </Link>
        </div>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p className="font-body text-sm text-ink-muted">{t("loading")}</p>
        </>
      )}
    </div>
  );
}

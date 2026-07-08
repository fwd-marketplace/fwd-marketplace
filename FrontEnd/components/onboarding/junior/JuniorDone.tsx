import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clock, CheckCircle2 } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";

interface JuniorDoneProps {
  locale: string;
  /** true cuando la cédula es de egresado FWD y la cuenta quedó aprobada (activa). */
  approved: boolean;
}

export async function JuniorDone({ locale, approved }: JuniorDoneProps) {
  const t = await getTranslations("register");

  // Egresado aprobado: mensaje de aprobación e ícono de check, y la CTA lleva a iniciar
  // sesión (para pasar por el 2FA). No egresado: pantalla de revisión (admin) hacia el home.
  const prefix = approved ? "junior.done.approved" : "junior.done";
  const Icon = approved ? CheckCircle2 : Clock;
  const ctaHref = approved ? `/${locale}/login` : `/${locale}/home`;
  const iconColor = approved ? "text-accent" : "text-ink-muted";

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />
      <CosmicBackdrop />

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-6 py-8 text-center shadow-elevated sm:px-10 sm:py-12">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
            <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          </div>

          <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t(`${prefix}.eyebrow`)}
          </p>

          <h1 className="mb-3 font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t(`${prefix}.title`)}
          </h1>

          <p className="mb-10 font-body text-sm text-ink-muted">
            {t(`${prefix}.description`)}
          </p>

          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-8 py-3 font-body text-sm font-semibold text-ink transition-colors duration-[--duration-fast] hover:bg-surface-sunken"
          >
            {t(`${prefix}.cta`)}
          </Link>
        </div>
      </div>
    </div>
  );
}

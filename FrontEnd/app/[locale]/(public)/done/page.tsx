import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";
import { HeroJourneyBadge } from "@/components/ui/HeroJourneyBadge";
import { apiAuth } from "@/lib/api-client";

type Props = {
  params: Promise<{ locale: string }>;
};

interface ProfileData {
  role: { nombre: string };
  estado_cuenta: string;
}

export default async function DonePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("done_page");
  const tJourney = await getTranslations("hero_journey");

  // Si la cuenta YA fue aprobada por el admin, se entra al área según el rol.
  // El estado se calcula dentro del try; el redirect va FUERA (no debe ser atrapado).
  let approvedRole: string | null = null;
  try {
    const meData = await apiAuth<{ user: unknown; profile: ProfileData | null }>("/users/me");
    if (meData?.profile?.estado_cuenta === "activa") {
      approvedRole = meData.profile.role.nombre;
    }
  } catch {
    // Sin sesión o error: se muestra la pantalla de revisión.
  }

  if (approvedRole === "admin") redirect(`/${locale}/admin/dashboard`);
  if (approvedRole === "company") redirect(`/${locale}/perfil-empresa`);
  if (approvedRole === "student") redirect(`/${locale}/bienvenida`);
  if (approvedRole) redirect(`/${locale}/marketplace`);

  // Cuenta no aprobada todavía: pantalla de revisión, "volver" al inicio (home, público).
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-secondary">
      <FwdGeoBackdrop />
      <CosmicBackdrop />
      <div className="absolute right-4 top-4">
        <HeroJourneyBadge stage="preparacion" label={tJourney("preparacion_label")} cta={tJourney("preparacion_cta")} />
      </div>

      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-[2rem] bg-surface px-6 py-12 shadow-elevated sm:px-12 text-center">
          <p className="mb-4 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t("eyebrow")}
          </p>

          <h1 className="mb-4 font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>

          <p className="mb-10 mx-auto max-w-sm font-body text-base text-ink-muted leading-relaxed">
            {t("description")}
          </p>

          <Link
            href={`/${locale}/home`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            {t("cta")}
          </Link>
        </div>
      </main>
    </div>
  );
}

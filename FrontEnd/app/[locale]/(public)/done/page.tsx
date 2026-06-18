import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
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

  let destination = `/${locale}`;
  try {
    const meData = await apiAuth<{ user: unknown; profile: ProfileData | null }>("/users/me");
    if (meData?.profile) {
      const roleName = meData.profile.role.nombre;
      if (roleName === "admin") {
        destination = `/${locale}/admin`;
      } else if (roleName === "company") {
        destination = `/${locale}/dashboard`;
      } else if (roleName === "student") {
        destination = `/${locale}/bienvenida`;
      }
    }
  } catch {
    // fallback a /${locale}
  }

  return (
    <div className="bg-secondary relative min-h-[100dvh] overflow-hidden">
      <FwdGeoBackdrop />

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
            href={destination}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            {t("cta")}
          </Link>
        </div>
      </main>
    </div>
  );
}

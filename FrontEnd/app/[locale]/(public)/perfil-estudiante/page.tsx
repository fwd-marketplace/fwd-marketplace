import { setRequestLocale } from "next-intl/server";
import PerfilUsuario from "@/components/comp-perfil-estudiante/PerfilUsuario";
import { AppHeader } from "@/components/layout/app-header";
import { JuniorSubnav } from "@/components/layout/junior-subnav";
import type {
  Activity,
  Application,
  ApplicationStats,
  StudentProfile,
} from "@/app/[locale]/(public)/perfil-estudiante/types";
import { getMyOffers } from "@/lib/api/marketplace";
import { getMe } from "@/lib/api/profile";
import { parseJsonStringArray } from "@/lib/api/safe-json";
import type { ApiMeProfile, MyOffer, OfferState } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
}

const EMPTY_PROFILE: StudentProfile = {
  name: "",
  specialty: "",
  program: "",
  availability: "",
  email: "",
  bio: "",
  badges: [],
  skills: [],
  links: {},
};

function mapOfferStatus(status: OfferState): Application["status"] {
  switch (status) {
    case "adjudicada":
      return "aceptada";
    case "no_seleccionada":
      return "rechazada";
    case "en_revision":
      return "en_proceso";
    case "enviada":
      return "enviada";
  }
}

function mapProfile(profile: ApiMeProfile | null): StudentProfile {
  if (!profile) {
    return EMPTY_PROFILE;
  }

  const estudiante = profile.estudiante ?? null;
  const modalidades = parseJsonStringArray(estudiante?.modalidad_preferida);

  const links: StudentProfile["links"] = {};
  if (estudiante?.url_github) links.github = estudiante.url_github;
  if (estudiante?.url_linkedin) links.linkedin = estudiante.url_linkedin;
  if (estudiante?.url_portfolio) links.portfolio = estudiante.url_portfolio;

  return {
    name: [profile.nombre, profile.apellido1, profile.apellido2].filter(Boolean).join(" "),
    specialty: estudiante?.especialidad ?? profile.role.nombre,
    program: estudiante?.titulo_fwd ?? profile.estado_cuenta,
    availability: estudiante?.disponibilidad ?? "",
    email: profile.correo,
    bio: estudiante?.descripcion ?? "",
    badges: modalidades,
    skills: estudiante?.skills ?? [],
    links,
  };
}

function mapOffer(offer: MyOffer): Application {
  return {
    id: offer.id,
    projectName: offer.proyecto?.titulo ?? "",
    companyName: "",
    status: mapOfferStatus(offer.estado.nombre),
    relativeTime: offer.fecha_envio,
    category: "dev",
  };
}

function buildStats(applications: Application[]): ApplicationStats {
  return {
    activeCount: applications.filter((application) => application.status !== "rechazada").length,
    scheduledInterviews: 0,
    compatibilityIndex: 0,
  };
}

export default async function EstudianteProfile({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meResult, offersResult] = await Promise.all([getMe(), getMyOffers()]);
  const profile = mapProfile(meResult.ok ? meResult.data.profile : null);
  const applications = offersResult.ok ? offersResult.data.ofertas.map(mapOffer) : [];
  const activities: Activity[] = [];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={profile.name} />
      <JuniorSubnav />
      <PerfilUsuario
        initialProfile={profile}
        initialActivities={activities}
        initialApplications={applications}
        stats={buildStats(applications)}
      />
    </div>
  );
}

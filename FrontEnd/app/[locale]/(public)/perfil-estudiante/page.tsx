import { setRequestLocale } from "next-intl/server";
import PerfilUsuario from "@/components/comp-perfil-estudiante/PerfilUsuario";
import { AppHeader } from "@/components/layout/app-header";
import {
  fullName,
  type Activity,
  type Application,
  type ApplicationStats,
  type MockCalificacion,
  type StudentProfile,
} from "@/app/[locale]/(public)/perfil-estudiante/types";
import { getCatalogs, getMyCalificaciones, getMyOffers } from "@/lib/api/marketplace";
import { getMe } from "@/lib/api/profile";
import { parseJsonStringArray } from "@/lib/api/safe-json";
import type { ApiCalificacion, ApiMeProfile, MyOffer, OfferState } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
}

const EMPTY_PROFILE: StudentProfile = {
  firstName: "",
  lastName1: "",
  lastName2: "",
  specialty: "",
  program: "",
  availability: "",
  email: "",
  bio: "",
  badges: [],
  skills: [],
  conocimientos: [],
  avatarUrl: "",
  links: {},
  reputacion: null,
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
    firstName: profile.nombre,
    lastName1: profile.apellido1 ?? "",
    lastName2: profile.apellido2 ?? "",
    specialty: estudiante?.especialidad ?? "",
    program: estudiante?.titulo_fwd ?? "",
    availability: estudiante?.disponibilidad ?? "",
    email: profile.correo,
    bio: estudiante?.descripcion ?? "",
    badges: modalidades,
    skills: estudiante?.skills ?? [],
    conocimientos: estudiante?.conocimientos ?? [],
    avatarUrl: estudiante?.url_avatar ?? "",
    links,
    reputacion: estudiante?.reputacion ?? null,
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

function mapCalificacion(cal: ApiCalificacion): MockCalificacion {
  return {
    id: cal.id,
    ofertaId: cal.id,
    companyName: cal.proyecto?.empresa?.nombre_comercial ?? "",
    projectName: cal.proyecto?.titulo ?? "",
    score: cal.calificacion,
    comment: cal.comentario_calificacion ?? "",
    date: cal.updated_at,
    reply: cal.replica_calificacion,
  };
}

export default async function EstudianteProfile({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meResult, offersResult, calResult, catalogsResult] = await Promise.all([
    getMe(),
    getMyOffers(),
    getMyCalificaciones(),
    getCatalogs(),
  ]);
  const profile = mapProfile(meResult.ok ? meResult.data.profile : null);
  const applications = offersResult.ok ? offersResult.data.ofertas.map(mapOffer) : [];
  const calificaciones = calResult.ok ? calResult.data.map(mapCalificacion) : [];
  const activities: Activity[] = [];
  const knowledgeSuggestions = catalogsResult.ok
    ? catalogsResult.data.conocimientos.map((conocimiento) => conocimiento.nombre)
    : [];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={fullName(profile)} avatarUrl={profile.avatarUrl} role="student" tone="public" />
      <PerfilUsuario
        initialProfile={profile}
        initialActivities={activities}
        initialApplications={applications}
        initialCalificaciones={calificaciones}
        stats={buildStats(applications)}
        knowledgeSuggestions={knowledgeSuggestions}
      />
    </div>
  );
}

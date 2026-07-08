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
import { getCatalogs, getMyCalificaciones, getMyOffers, getSavedProjects } from "@/lib/api/marketplace";
import { getMyPortafolio } from "@/lib/api/profile";
import { requireActiveAccount } from "@/lib/auth/require-access";
import { SiteFooter } from "@/components/layout/site-footer";
import { getNotificaciones } from "@/lib/api/notificaciones";
import { parseJsonStringArray } from "@/lib/api/safe-json";
import type { ApiCalificacion, ApiMeProfile, ApiNotificacion, MyOffer, OfferState, PortafolioItem } from "@/lib/api/types";
import type { ActivityTipo } from "@/app/[locale]/(public)/perfil-estudiante/types";

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
    case "solicitar_cambios":
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
    projectId: offer.proyecto?.id ?? "",
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

function formatActivityDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return locale === "es" ? "Hoy" : "Today";
  if (diffDays === 1) return locale === "es" ? "Ayer" : "Yesterday";
  if (diffDays < 7) return locale === "es" ? `Hace ${diffDays} días` : `${diffDays} days ago`;
  return date.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

function notifTipo(tipo: string): ActivityTipo {
  if (tipo === "adjudicacion") return "adjudicacion";
  if (tipo === "nuevo_mensaje") return "nuevo_mensaje";
  if (tipo === "entregable_subido") return "entregable_subido";
  return "cambio_estado";
}

function buildActivities(
  notifs: ApiNotificacion[],
  offers: MyOffer[],
  locale: string,
): Activity[] {
  // Events from notifications (adjudicaciones, cambios, mensajes, entregables…)
  const fromNotifs: Activity[] = notifs.map((n) => ({
    id: n.id,
    description: n.mensaje,
    timestamp: formatActivityDate(n.fecha, locale),
    tipo: notifTipo(n.tipo),
  }));

  // Events from junior's own submissions (no notification is sent to themselves)
  const submittedOfferIds = new Set(notifs.map((n) => n.id));
  const fromOffers: Activity[] = offers.map((o) => ({
    id: `offer-${o.id}`,
    description:
      locale === "es"
        ? `Enviaste una propuesta al proyecto "${o.proyecto?.titulo ?? ""}".`
        : `You submitted a proposal to "${o.proyecto?.titulo ?? ""}".`,
    timestamp: formatActivityDate(o.fecha_envio, locale),
    tipo: "propia" as ActivityTipo,
  }));
  void submittedOfferIds;

  // Merge, sort most recent first, take top 15
  return [...fromNotifs, ...fromOffers]
    .sort((a, b) => {
      const dateA = notifs.find((n) => n.id === a.id)?.fecha ?? offers.find((o) => `offer-${o.id}` === a.id)?.fecha_envio ?? "";
      const dateB = notifs.find((n) => n.id === b.id)?.fecha ?? offers.find((o) => `offer-${o.id}` === b.id)?.fecha_envio ?? "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 15);
}

function mapPortafolioItem(item: PortafolioItem) {
  return {
    id: item.id,
    title: item.titulo,
    description: item.descripcion ?? "",
    netlifyUrl: item.url_demo ?? "",
    ...(item.url_repositorio ? { repoUrl: item.url_repositorio } : {}),
    tags: (() => { try { return JSON.parse(item.tecnologias ?? "[]") as string[]; } catch { return []; } })(),
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
  // Ruta privada: solo el estudiante con cuenta activa ve su propio perfil. Sin sesion,
  // rol distinto o cuenta no aprobada, la guarda redirige (login / home / revision).
  const account = await requireActiveAccount(locale, ["student"]);
  const [offersResult, calResult, catalogsResult, notifsResult, portafolioResult, savedResult] = await Promise.all([
    getMyOffers(),
    getMyCalificaciones(),
    getCatalogs(),
    getNotificaciones(),
    getMyPortafolio(),
    getSavedProjects(),
  ]);
  const profile = mapProfile(account);
  const offers = offersResult.ok ? offersResult.data.ofertas : [];
  const applications = offers.map(mapOffer);
  const calificaciones = calResult.ok ? calResult.data.map(mapCalificacion) : [];
  const initialPortafolio = portafolioResult.ok ? portafolioResult.data.map(mapPortafolioItem) : [];
  const notifs = notifsResult.ok ? notifsResult.data : [];
  const activities: Activity[] = buildActivities(notifs, offers, locale);
  const knowledgeSuggestions = catalogsResult.ok
    ? catalogsResult.data.conocimientos.map((conocimiento) => conocimiento.nombre)
    : [];
  const catalogSkills = catalogsResult.ok
    ? catalogsResult.data.skills.map((s) => s.nombre)
    : [];
  const initialSavedProjects = savedResult.ok ? savedResult.data.proyectos : [];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={fullName(profile)} avatarUrl={profile.avatarUrl} role="student" tone="public" />
      <PerfilUsuario
        initialProfile={profile}
        initialActivities={activities}
        initialApplications={applications}
        initialCalificaciones={calificaciones}
        initialNotificaciones={notifs}
        initialPortafolio={initialPortafolio}
        initialSavedProjects={initialSavedProjects}
        stats={buildStats(applications)}
        knowledgeSuggestions={knowledgeSuggestions}
        catalogSkills={catalogSkills}
      />
      <SiteFooter />
    </div>
  );
}

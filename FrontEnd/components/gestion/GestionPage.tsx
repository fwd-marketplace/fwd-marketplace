"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  GitBranch,
  Lock,
  MessageSquare,
  Send,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_OFFERS, MOCK_PROJECTS, MOCK_MARKETPLACE_PROJECTS } from "@/lib/mock-data";
import { MOCK_PROJECT_OFFERS } from "@/lib/mock-proceso";
import {
  getProjectByIdAction,
  getProjectOffersAction,
  submitOfferAction,
  decideOfferAction,
  getMyProjectsAction,
  getProjectsAction,
  getMyOffersAction,
} from "@/lib/actions/marketplace";
import { getProjectMensajesAction, sendMensajeAction } from "@/lib/actions/mensajes";
import type {
  ApiMensaje,
  ApiProject,
  ApiRoleName,
  MyOffer,
  OfferState,
  ProjectOffer,
} from "@/lib/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = "info" | "chat" | "proceso";

type ProposalStatus =
  | "nuevo" | "editando" | "enviada" | "revision"
  | "cambios" | "aceptada" | "noseleccionada";

type EmpresaStatus =
  | "enviada" | "revision" | "cambios" | "adjudicada" | "noseleccionada";

interface ChatMessage {
  id: string;
  from: "empresa" | "junior";
  text: string;
  time: string;
}

interface JuniorProposal {
  v: number;
  status: ProposalStatus;
  expanded: boolean;
  desc: string;
  link: string;
  fileName: string;
  previewName: string;
  previewProject: string;
  repo: string;
  observaciones: string;
}

interface EmpresaProposal {
  v: number;
  status: EmpresaStatus;
  date: string;
  expanded: boolean;
  desc: string;
  link: string;
  previewName: string;
  previewProject: string;
  comment: string;
}

interface EmpresaStudent {
  id: number;
  offerId: string;
  name: string;
  initials: string;
  date: string;
  expanded: boolean;
  proposals: EmpresaProposal[];
}

// ── Config ────────────────────────────────────────────────────────────────────

const OFFER_STATE_CONFIG: Record<
  OfferState,
  { label: string; dot: string; badge: string; step: number }
> = {
  enviada:         { label: "Enviada",         dot: "bg-primary",  badge: "bg-primary/10 text-primary border-primary/20",   step: 0 },
  en_revision:     { label: "En revisión",     dot: "bg-warning",  badge: "bg-warning/10 text-warning border-warning/20",   step: 1 },
  adjudicada:      { label: "Adjudicada",      dot: "bg-accent",   badge: "bg-accent/10 text-accent border-accent/20",      step: 2 },
  no_seleccionada: { label: "No seleccionada", dot: "bg-magenta",  badge: "bg-magenta/10 text-magenta border-magenta/20",   step: 2 },
};

function juniorCircle(status: ProposalStatus): { bg: string; icon: ReactNode } {
  switch (status) {
    case "nuevo":
      return { bg: "border-2 border-border bg-transparent", icon: null };
    case "editando":
      return { bg: "border-2 border-secondary bg-transparent", icon: null };
    case "enviada":
    case "revision":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "cambios":
      return { bg: "bg-warning", icon: <span className="font-heading text-sm font-bold leading-none text-white">!</span> };
    case "aceptada":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "noseleccionada":
      return { bg: "bg-ink-muted/50", icon: <X className="size-3.5 text-white" aria-hidden="true" /> };
  }
}

function empresaCircle(status: EmpresaStatus): { bg: string; icon: ReactNode } {
  switch (status) {
    case "enviada":
    case "revision":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "cambios":
      return { bg: "bg-warning", icon: <span className="font-heading text-sm font-bold leading-none text-white">!</span> };
    case "adjudicada":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "noseleccionada":
      return { bg: "bg-border", icon: <X className="size-3.5 text-ink-muted" aria-hidden="true" /> };
  }
}

const EMPRESA_BADGE: Record<EmpresaStatus, string> = {
  enviada:        "bg-primary/10 text-primary border-primary/20",
  revision:       "bg-warning/10 text-warning border-warning/20",
  cambios:        "bg-magenta/10 text-magenta border-magenta/20",
  adjudicada:     "bg-accent/10 text-accent border-accent/20",
  noseleccionada: "bg-ink-muted/10 text-ink-muted border-border",
};

// ── Mock data helpers ─────────────────────────────────────────────────────────

const MOCK_OBS: Record<string, string> = {
  "proj-1": "La propuesta es muy sólida. Sin embargo, necesitamos más detalle en el cronograma de entregas y confirmar la compatibilidad con la API de pagos actual. Ajustá el alcance de la primera fase y reenvía una nueva versión.",
};

const MOCK_CHAT: Record<string, ChatMessage[]> = {
  "mock-1": [
    { id: "m1", from: "empresa", text: "Hola, revisamos tu propuesta y nos gustó mucho tu experiencia con React y dashboards. ¿Podés contarnos un poco más sobre los proyectos de BI que mencionás?", time: "10:14" },
    { id: "m2", from: "junior", text: "¡Claro! He trabajado en dos proyectos de Business Intelligence integrando APIs REST con autenticación JWT y visualizaciones en Recharts y D3.js. El más reciente actualizaba métricas cada 30 segundos en tiempo real.", time: "10:21" },
    { id: "m3", from: "empresa", text: "Muy bien. ¿Tenés experiencia con Power BI o alguna herramienta de reporting similar?", time: "10:35" },
    { id: "m4", from: "junior", text: "Sí, usé Power BI para reportes ejecutivos en un proyecto anterior. También conozco Looker Studio. Para este proyecto preferiría ir con una solución custom en React para tener más control del diseño.", time: "10:42" },
    { id: "m5", from: "empresa", text: "Nos parece perfecto. ¿Tenés disponibilidad para iniciar la semana que viene?", time: "11:03" },
    { id: "m6", from: "junior", text: "Sí, tengo disponibilidad inmediata. ¿Cuál sería el próximo paso del proceso?", time: "11:08" },
  ],
  "mock-2": [
    { id: "m1", from: "empresa", text: "Hola, vimos tu propuesta para la plataforma de telemedicina. El prototipo de Figma que adjuntaste se ve muy completo.", time: "09:30" },
    { id: "m2", from: "junior", text: "Gracias. Me enfoqué en los flujos de agendamiento y la ficha del paciente. ¿Hay algún aspecto que quieran priorizar?", time: "09:45" },
    { id: "m3", from: "empresa", text: "Lo más urgente es el módulo de videollamada. ¿Cómo pensás abordarlo técnicamente?", time: "10:02" },
    { id: "m4", from: "junior", text: "Usaría WebRTC con una capa de señalización simple. Para el MVP podría integrar Daily.co que ya tiene SDK para React y maneja bien la infraestructura de video.", time: "10:15" },
  ],
};

function blankProposal(v: number): JuniorProposal {
  return { v, status: "nuevo", expanded: false, desc: "", link: "", fileName: "", previewName: "", previewProject: "", repo: "", observaciones: "" };
}

function initJuniorProposals(offer: MyOffer | null, project: ApiProject | null): JuniorProposal[] {
  if (!offer) return [blankProposal(1)];
  const statusMap: Record<OfferState, ProposalStatus> = {
    enviada: "enviada", en_revision: "revision",
    adjudicada: "aceptada", no_seleccionada: "noseleccionada",
  };
  return [{
    v: 1,
    status: statusMap[offer.estado.nombre],
    expanded: false,
    desc: offer.propuesta,
    link: offer.prototipo_url ?? "",
    fileName: "",
    previewName: project?.titulo ?? "",
    previewProject: project?.area?.nombre ?? "",
    repo: offer.prototipo_url ?? "",
    observaciones: project?.id ? (MOCK_OBS[project.id] ?? "") : "",
  }];
}

function buildEmpresaStudents(
  offers: ProjectOffer[],
  project: ApiProject | null,
  locale: string,
): EmpresaStudent[] {
  const statusMap: Record<OfferState, EmpresaStatus> = {
    enviada: "enviada", en_revision: "revision",
    adjudicada: "adjudicada", no_seleccionada: "noseleccionada",
  };
  const ORDER: Record<OfferState, number> = {
    adjudicada: 0, en_revision: 1, enviada: 2, no_seleccionada: 3,
  };
  const sorted = [...offers].sort((a, b) => ORDER[a.estado.nombre] - ORDER[b.estado.nombre]);
  const title = project?.titulo ?? "Propuesta";
  const area  = project?.area?.nombre ?? "Proyecto";

  return sorted.map((offer, idx) => {
    const estado    = offer.estado.nombre;
    const empStatus = statusMap[estado];
    const dateStr   = new Date(offer.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" });
    const initials  = ((offer.junior.nombre[0] ?? "") + (offer.junior.apellido1?.[0] ?? "")).toUpperCase();

    const base: EmpresaProposal = {
      v: 1, status: empStatus, date: dateStr, expanded: false,
      desc: offer.propuesta, link: offer.prototipo_url ?? "",
      previewName: title, previewProject: area, comment: "",
    };

    const proposals: EmpresaProposal[] = estado === "adjudicada"
      ? [
          { v: 1, status: "cambios", date: dateStr, expanded: false,
            desc: "Primera versión de la propuesta. Se solicitaron ajustes antes de la adjudicación.",
            link: offer.prototipo_url ?? "", previewName: title + " (v1)", previewProject: area,
            comment: "Buen perfil, pero necesitamos más detalle en el cronograma de entregas. Ajustá el alcance de la primera fase y reenvía." },
          { ...base, v: 2, expanded: true },
        ]
      : [base];

    return {
      id: idx + 1,
      offerId: offer.id,
      name: `${offer.junior.nombre} ${offer.junior.apellido1 ?? ""}`.trim(),
      initials, date: dateStr,
      expanded: estado === "adjudicada",
      proposals,
    };
  });
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { role: ApiRoleName | null; userId: string | null; disponible?: boolean }

export function GestionPage({ role, userId, disponible = true }: Props) {
  const t      = useTranslations("gestion_page");
  const locale = useLocale();
  const isEmpresa = role === "company";

  // Sidebar data — starts with mock, replaced by real data from API
  const [sidebarProjects, setSidebarProjects] = useState<ApiProject[]>(
    () => isEmpresa ? MOCK_PROJECTS : MOCK_MARKETPLACE_PROJECTS,
  );
  const [myOffers, setMyOffers] = useState<MyOffer[]>(MOCK_OFFERS);

  // Selection state
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);
  const [selectedOffer, setSelectedOffer]     = useState<MyOffer | null>(null);
  const [projectOffers, setProjectOffers]     = useState<ProjectOffer[]>([]);
  const [section, setSection]               = useState<Section>("info");

  // ── Load sidebar on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      if (isEmpresa) {
        const r = await getMyProjectsAction();
        if (active && r.ok) setSidebarProjects(r.data.projects);
      } else {
        const [pr, or] = await Promise.all([getProjectsAction(), getMyOffersAction()]);
        if (active) {
          if (pr.ok) setSidebarProjects(pr.data.projects);
          if (or.ok) setMyOffers(or.data.ofertas);
        }
      }
    })();
    return () => { active = false; };
  }, [isEmpresa]);

  // ── Load project detail when selectedId changes ─────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    (async () => {
      const r = await getProjectByIdAction(selectedId);
      if (active && r.ok) setSelectedProject(r.data);
    })();
    return () => { active = false; };
  }, [selectedId]);

  // ── Load section-specific data when selectedId or myOffers change ───────────
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    (async () => {
      if (isEmpresa) {
        const r = await getProjectOffersAction(selectedId);
        if (active && r.ok) setProjectOffers(r.data.ofertas);
      } else {
        const offer = myOffers.find((o) => o.proyecto?.id === selectedId) ?? null;
        if (active) setSelectedOffer(offer);
      }
    })();
    return () => { active = false; };
  }, [selectedId, isEmpresa, myOffers]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSection("info");
    // Set immediate data from sidebar (may be mock or real)
    const proj = sidebarProjects.find((p) => p.id === id) ?? null;
    setSelectedProject(proj);
    if (isEmpresa) {
      setProjectOffers(id === "proj-1" ? MOCK_PROJECT_OFFERS : []);
    } else {
      setSelectedOffer(myOffers.find((o) => o.proyecto?.id === id) ?? null);
    }
  };

  const handleBack = () => setSelectedId(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        aria-label="Proyectos"
        className={cn(
          "flex shrink-0 flex-col overflow-hidden bg-secondary transition-[width] duration-[var(--duration-base)] ease-[var(--ease-out)]",
          "md:w-72 md:border-r md:border-white/10",
          selectedId ? "w-0 md:w-72" : "w-full md:w-72",
        )}
      >
        {!selectedId ? (
          <>
            <div className="shrink-0 border-b border-white/10 px-5 py-5">
              <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-white/50">
                {isEmpresa ? t("section_empresa") : t("section_junior")}
              </p>
              <h1 className="font-heading text-xl font-extrabold tracking-tight text-white">
                {t("title")}<span className="text-highlight" aria-hidden="true">.</span>
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {isEmpresa ? (
                sidebarProjects.length === 0 ? <SidebarEmpty text={t("empty_empresa")} /> : (
                  <ul className="flex flex-col gap-0.5">
                    {sidebarProjects.map((proyecto) => {
                      const count  = proyecto.id === "proj-1" ? MOCK_PROJECT_OFFERS.length : 0;
                      const hasAdj = proyecto.id === "proj-1" && MOCK_PROJECT_OFFERS.some((o) => o.estado.nombre === "adjudicada");
                      return (
                        <li key={proyecto.id}>
                          <button
                            onClick={() => handleSelect(proyecto.id)}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-heading text-sm font-bold text-white">{proyecto.titulo}</p>
                              <p className="mt-0.5 font-body text-xs text-white/50">{t("proposals_count", { count })}</p>
                            </div>
                            {hasAdj && <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />}
                            <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : (
                sidebarProjects.length === 0 ? <SidebarEmpty text={t("empty_junior")} /> : (
                  <ul className="flex flex-col gap-0.5">
                    {sidebarProjects.map((proyecto) => {
                      const oferta = myOffers.find((o) => o.proyecto?.id === proyecto.id);
                      const cfg    = oferta ? OFFER_STATE_CONFIG[oferta.estado.nombre] : null;
                      return (
                        <li key={proyecto.id}>
                          <button
                            onClick={() => handleSelect(proyecto.id)}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-heading text-sm font-bold text-white">
                                {proyecto.titulo}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5 font-body text-xs text-white/60">
                                {cfg ? (
                                  <>
                                    <span className={cn("size-2 shrink-0 rounded-full", cfg.dot)} aria-hidden="true" />
                                    {cfg.label}
                                  </>
                                ) : (
                                  <>
                                    <span className="size-2 shrink-0 rounded-full border border-white/40" aria-hidden="true" />
                                    {t("junior_nueva_postulacion")}
                                  </>
                                )}
                              </p>
                            </div>
                            {oferta?.estado.nombre === "adjudicada" && (
                              <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                            )}
                            <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 border-b border-white/10 px-5 py-5">
              <button
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-white"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                {t("all_projects")}
              </button>
              <h2 className="font-heading text-sm font-extrabold leading-snug tracking-tight text-white">
                {selectedProject?.titulo ?? ""}<span className="text-highlight" aria-hidden="true">.</span>
              </h2>
              {selectedProject?.area && (
                <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-white/50">
                  {selectedProject.area.nombre}
                </p>
              )}
            </div>
            <nav className="flex flex-col gap-0.5 p-3" aria-label="Secciones del proyecto">
              {(["info", "chat", "proceso"] as const).map((key) => {
                const Icon  = key === "info" ? FileText : key === "chat" ? MessageSquare : GitBranch;
                const label = key === "info" ? t("section_info") : key === "chat" ? t("section_chat") : t("section_proceso");
                return (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      section === key ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </aside>

      {/* ── Content ── */}
      <main
        className={cn(
          "flex-1 overflow-y-auto bg-canvas",
          !selectedId ? "hidden md:flex md:items-center md:justify-center" : "block",
        )}
      >
        {!selectedId ? (
          <ContentEmpty text={t("select_project_prompt")} />
        ) : (
          <>
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-canvas/95 px-4 py-3 backdrop-blur-sm md:hidden">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-ink-muted hover:text-ink"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t("all_projects")}
              </button>
              <span className="flex-1 truncate font-heading text-sm font-bold text-ink-strong">
                {selectedProject?.titulo}
              </span>
            </div>
            {section === "info" && (
              <InfoPanel project={selectedProject} locale={locale} t={t} />
            )}
            {section === "chat" && (
              <ChatPanel
                isEmpresa={isEmpresa}
                project={selectedProject}
                t={t}
                userId={userId}
              />
            )}
            {section === "proceso" && (
              <ProcesoPanel
                key={`proceso-${selectedId}-${selectedOffer?.id ?? "none"}-${projectOffers.length}`}
                isEmpresa={isEmpresa}
                offer={selectedOffer}
                projectOffers={projectOffers}
                project={selectedProject}
                locale={locale}
                t={t}
                userId={userId}
                disponible={disponible}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<"gestion_page">>;

function SidebarEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <FolderOpen className="size-10 text-white/20" aria-hidden="true" />
      <p className="font-body text-sm text-white/40">{text}</p>
    </div>
  );
}

function ContentEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <FolderOpen className="size-12 text-ink-muted/30" aria-hidden="true" />
      <p className="font-body text-base text-ink-muted">{text}</p>
    </div>
  );
}

// ── Info panel ────────────────────────────────────────────────────────────────

function InfoPanel({ project, locale, t }: { project: ApiProject | null; locale: string; t: T }) {
  if (!project) return null;
  const skills = project.skills.filter((s) => s.skill != null);
  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-6">
        {project.area && (
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
            {project.area.nombre}
          </p>
        )}
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
          {project.titulo}<span className="text-highlight" aria-hidden="true">.</span>
        </h2>
        {project.empresa && (
          <p className="mt-1 font-body text-sm text-ink-muted">{project.empresa.nombre_comercial}</p>
        )}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-sm text-ink-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {project.plazo_dias} {t("days")}
        </span>
        {project.fecha_publicacion && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-sm text-ink-muted">
            <Calendar className="size-3.5" aria-hidden="true" />
            {new Date(project.fecha_publicacion).toLocaleDateString(locale, { day: "numeric", month: "long" })}
          </span>
        )}
        {project.usa_ia && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-body text-sm font-semibold text-accent">
            <Zap className="size-3.5" aria-hidden="true" />
            IA
          </span>
        )}
      </div>
      <div className="mb-4 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">{t("description_label")}</p>
        <p className="font-body text-base leading-relaxed text-ink">{project.descripcion}</p>
      </div>
      {skills.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">{t("skills_label")}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(({ skill }) => (
              <span key={skill!.id} className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                {skill!.nombre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────

function ChatPanel({
  isEmpresa, project, t, userId,
}: {
  isEmpresa: boolean;
  project: ApiProject | null;
  t: T;
  userId: string | null;
}) {
  const me = isEmpresa ? "empresa" : "junior";

  const [msgs, setMsgs]     = useState<ChatMessage[]>(() => project?.id ? (MOCK_CHAT[project.id] ?? []) : []);
  const [draft, setDraft]   = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages from backend and poll every 4 s (only when authenticated)
  useEffect(() => {
    if (!project?.id || !userId) return;

    let active = true;

    const mapMsg = (m: ApiMensaje): ChatMessage => ({
      id: m.id,
      from: m.remitente?.id === userId
        ? (isEmpresa ? "empresa" : "junior")
        : (isEmpresa ? "junior"  : "empresa"),
      text: m.contenido,
      time: new Date(m.fecha_envio).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }),
    });

    // Reset to mock seed, then load real messages
    setMsgs(MOCK_CHAT[project.id] ?? []);

    const load = async () => {
      const r = await getProjectMensajesAction(project.id);
      if (!active) return;
      if (r.ok) setMsgs(r.data.map(mapMsg));
    };

    void load();
    const timer = setInterval(() => { void load(); }, 4000);

    return () => { active = false; clearInterval(timer); };
  }, [project?.id, userId, isEmpresa]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const otherName    = isEmpresa
    ? t("chat_label_junior")
    : (project?.empresa?.nombre_comercial ?? t("chat_label_empresa"));
  const otherInitial = isEmpresa
    ? "J"
    : (project?.empresa?.nombre_comercial?.[0]?.toUpperCase() ?? "E");

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setDraft("");

    if (!project?.id || !userId) {
      // Demo mode: local only
      const time = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
      setMsgs((prev) => [...prev, { id: `demo-${Date.now()}`, from: me, text, time }]);
      return;
    }

    setSending(true);

    // Optimistic update
    const time   = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
    const tempId = `temp-${Date.now()}`;
    setMsgs((prev) => [...prev, { id: tempId, from: me, text, time }]);

    await sendMensajeAction(project.id, text);

    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-sm font-bold text-secondary">
          {otherInitial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-bold text-ink-strong">{otherName}</p>
          <p className="font-body text-xs text-ink-muted">
            {project?.titulo ?? ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {msgs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <MessageSquare className="size-7 text-primary" aria-hidden="true" />
            </div>
            <p className="font-body text-sm text-ink-muted">{t("chat_empty")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {msgs.map((msg) => {
              const isMine = msg.from === me;
              return (
                <div key={msg.id} className={cn("flex items-end gap-2.5", isMine ? "flex-row-reverse" : "flex-row")}>
                  {!isMine && (
                    <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-xs font-bold text-secondary">
                      {otherInitial}
                    </div>
                  )}
                  <div className={cn("flex max-w-[72%] flex-col gap-1", isMine ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 font-body text-sm leading-relaxed",
                        isMine
                          ? "rounded-br-sm bg-secondary text-white"
                          : "rounded-bl-sm border border-border bg-surface text-ink",
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="px-1 font-body text-[11px] text-ink-muted">{msg.time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t("chat_placeholder")}
            rows={1}
            className="min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-canvas px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            style={{ maxHeight: 120, overflowY: "auto" }}
          />
          <button
            onClick={() => { void send(); }}
            disabled={!draft.trim() || sending}
            aria-label={t("chat_send")}
            className={cn(
              "flex size-[42px] shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--duration-fast)]",
              draft.trim() && !sending
                ? "bg-secondary text-white hover:bg-secondary/80"
                : "bg-border text-ink-muted cursor-not-allowed",
            )}
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 px-1 font-body text-[11px] text-ink-muted">{t("chat_hint")}</p>
      </div>
    </div>
  );
}

// ── Proceso panel router ──────────────────────────────────────────────────────

function ProcesoPanel({
  isEmpresa, offer, projectOffers, project, locale, t, userId, disponible,
}: {
  isEmpresa: boolean;
  offer: MyOffer | null;
  projectOffers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
}) {
  if (isEmpresa) {
    return <EmpresaProcesoView offers={projectOffers} project={project} locale={locale} t={t} userId={userId} />;
  }
  return <JuniorProcesoView offer={offer} project={project} locale={locale} t={t} userId={userId} disponible={disponible} />;
}

// ── Browser mockup ────────────────────────────────────────────────────────────

function LinkPreview({
  href, title, area, excerpt,
}: {
  href: string;
  title: string;
  area?: string | undefined;
  excerpt?: string | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-[#F2655A]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#F5BE4F]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#62C554]" aria-hidden="true" />
        <div className="ml-2 flex-1 truncate rounded-md border border-border bg-canvas px-3 py-1 font-body text-xs text-ink-muted">
          {href}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 font-body text-xs font-bold text-primary hover:underline"
        >
          <ExternalLink className="size-3" aria-hidden="true" />
          Abrir
        </a>
      </div>
      <div className="flex min-h-36 flex-col gap-2.5 bg-gradient-to-b from-canvas to-surface px-7 py-6">
        <p className="font-heading text-xl font-extrabold tracking-tight text-ink-strong line-clamp-1">
          {title || t_noop("proceso_preview_sin_nombre")}
        </p>
        {area && (
          <span className="self-start rounded-full bg-secondary/10 px-3 py-1 font-body text-xs font-semibold text-secondary">
            {area}
          </span>
        )}
        {excerpt && (
          <p className="font-body text-sm leading-relaxed text-ink-muted line-clamp-3">{excerpt}</p>
        )}
      </div>
    </div>
  );
}

function t_noop(k: string) { return k; }

// ── Junior proceso view ───────────────────────────────────────────────────────

function JuniorProcesoView({
  offer, project, t, userId, disponible,
}: {
  offer: MyOffer | null;
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
}) {
  const [proposals, setProposals] = useState<JuniorProposal[]>(
    () => initJuniorProposals(offer, project),
  );
  const [submitError, setSubmitError] = useState("");
  const closed = false;

  // Reset proposals when the offer changes (real data loaded from API)
  useEffect(() => {
    setProposals(initJuniorProposals(offer, project));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer?.id]);

  // ── State helpers ────────────────────────────────────────────────────────
  const patch = (i: number, p: Partial<JuniorProposal>) =>
    setProposals((prev) => prev.map((x, idx) => idx === i ? { ...x, ...p } : x));

  const startCreate = (i: number) => patch(i, { status: "editando", expanded: true });
  const toggle      = (i: number) => { const c = proposals[i]; if (c) patch(i, { expanded: !c.expanded }); };
  const setField    = (i: number, k: keyof JuniorProposal, v: string) => patch(i, { [k]: v } as Partial<JuniorProposal>);

  const submit = async (i: number) => {
    const p = proposals[i];
    if (!p?.desc.trim()) return;
    if (!project || !userId) return;

    setSubmitError("");
    const result = await submitOfferAction(project.id, {
      propuesta: p.desc,
      ...(p.link ? { prototipo_url: p.link } : {}),
    });
    // Antes marcaba "enviada" sin mirar el resultado: si el BackEnd rechazaba (p. ej.
    // estudiante ocupado, o ya postulado) la UI mentía. Ahora solo avanza si fue OK.
    if (result.ok) {
      patch(i, { status: "enviada", expanded: false });
    } else {
      setSubmitError(result.error);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const latest  = proposals[proposals.length - 1];
  const hasSent = proposals.some((p) => !["nuevo", "editando"].includes(p.status));
  const isNew   = !latest || latest.status === "nuevo" || latest.status === "editando";

  const propMeta = (status: ProposalStatus): { label: string; cls: string } | null => {
    switch (status) {
      case "enviada":        return { label: t("proceso_badge_enviada"),  cls: "bg-primary/10 text-primary border-primary/20" };
      case "revision":       return { label: t("proceso_badge_revision"), cls: "bg-warning/10 text-warning border-warning/20" };
      case "cambios":        return { label: t("proceso_badge_cambios"),  cls: "bg-magenta/10 text-magenta border-magenta/20" };
      case "aceptada":       return { label: t("proceso_badge_aceptada"), cls: "bg-accent/10 text-accent border-accent/20" };
      case "noseleccionada": return { label: t("proceso_badge_nosel"),    cls: "bg-ink-muted/10 text-ink-muted border-border" };
      default: return null;
    }
  };

  let bannerLabel: string;
  let bannerCls: string;
  if (!isNew && latest) {
    const m = propMeta(latest.status);
    bannerLabel = m?.label ?? t("proceso_badge_pendiente");
    bannerCls   = m?.cls  ?? "bg-ink/5 text-ink-muted border-border";
  } else if (hasSent) {
    bannerLabel = t("proceso_badge_esperando");
    bannerCls   = "bg-ink/5 text-ink-muted border-border";
  } else {
    bannerLabel = t("proceso_badge_pendiente");
    bannerCls   = "bg-ink/5 text-ink-muted border-border";
  }

  const lastReal = proposals[proposals.length - 1];
  let lockCaption = t("proceso_placeholder_nuevo");
  if (lastReal?.status === "enviada" || lastReal?.status === "revision") lockCaption = t("proceso_placeholder_revision");
  else if (lastReal?.status === "cambios") lockCaption = t("proceso_placeholder_cambios");

  return (
    <div className="px-6 py-10 md:px-10">

      {/* Card 1 — Estado actual */}
      <div className="mb-5 rounded-2xl border border-border bg-surface px-7 py-[22px] shadow-sm">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("proceso_state_label")}
        </p>
        <div className="mt-3.5">
          <span className={cn("inline-flex items-center rounded-full border px-4 py-[7px] font-body text-[13px] font-bold", bannerCls)}>
            {bannerLabel}
          </span>
        </div>
      </div>

      {/* Card 2 — Propuestas stepper */}
      <div className="rounded-2xl border border-border bg-surface px-[30px] py-7 shadow-sm">
        <p className="mb-6 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("proceso_propuestas_label")}
        </p>

        {!disponible && isNew && (
          <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 font-body text-[13px] text-ink">
            {t("proceso_busy_message")}
          </div>
        )}

        {proposals.map((p, i) => {
          const c        = juniorCircle(p.status);
          const isSent   = ["enviada","revision","cambios","aceptada","noseleccionada"].includes(p.status);
          const isEditing = p.status === "editando";
          const pm        = propMeta(p.status);
          const submitOk  = p.desc.trim().length > 0;
          const showLine  = i < proposals.length - 1 || !closed;

          return (
            <div key={p.v} className="flex gap-[18px] items-stretch">
              {/* Circle + vertical line */}
              <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0, paddingTop: 1 }}>
                <div
                  className={cn("flex size-[30px] shrink-0 items-center justify-center rounded-full", c.bg)}
                  aria-hidden="true"
                >
                  {c.icon}
                </div>
                {showLine && (
                  <div className="mt-2 w-0.5 flex-1 rounded-sm bg-border" style={{ minHeight: 20 }} aria-hidden="true" />
                )}
              </div>

              {/* Row content */}
              <div className="min-w-0 flex-1 pb-[30px]">
                {/* Header */}
                <div className="flex min-h-[32px] items-center justify-between gap-3">
                  <div
                    onClick={() => { if (isSent) toggle(i); }}
                    className={cn("flex items-center gap-[9px]", isSent ? "cursor-pointer" : "cursor-default")}
                  >
                    <span className="font-body text-base font-bold text-ink-strong">
                      {t("proceso_propuesta_n", { n: p.v })}
                    </span>
                    {isSent && (
                      <span className="text-[11px] text-ink-muted" aria-hidden="true">
                        {p.expanded ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-[10px]">
                    {p.status === "nuevo" && (
                      <button
                        onClick={() => startCreate(i)}
                        disabled={!disponible}
                        className={cn(
                          "rounded-[10px] border border-border bg-surface px-[18px] py-[9px] font-body text-[14px] font-semibold text-ink transition-colors duration-[var(--duration-fast)]",
                          disponible ? "hover:border-secondary hover:text-secondary" : "opacity-50 cursor-not-allowed",
                        )}
                      >
                        {t("proceso_crear_propuesta")}
                      </button>
                    )}
                    {pm && (
                      <span className={cn("inline-flex items-center rounded-full border px-[15px] py-[7px] font-body text-[13px] font-bold whitespace-nowrap", pm.cls)}>
                        {pm.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="mt-[18px]">
                    <label className="mb-2 block font-body text-[13px] font-bold text-ink">
                      {t("description_label")}
                    </label>
                    <textarea
                      placeholder={t("proceso_desc_placeholder")}
                      value={p.desc}
                      onChange={(e) => setField(i, "desc", e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-xl border border-border bg-surface p-[13px] font-body text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />

                    <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                      {t("proceso_doc_label")}
                    </label>
                    <div className="flex gap-3">
                      <input
                        placeholder={t("proceso_link_placeholder")}
                        value={p.link}
                        onChange={(e) => setField(i, "link", e.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-[15px] py-3 font-body text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface px-[18px] py-3 font-body text-[14px] font-semibold text-ink transition-colors hover:border-secondary hover:text-secondary">
                        <Upload className="size-[15px]" aria-hidden="true" />
                        {p.fileName || t("proceso_subir_archivo")}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setField(i, "fileName", f.name);
                          }}
                        />
                      </label>
                    </div>

                    <div className="my-[22px] h-px bg-border" />

                    <p className="font-body text-[13px] font-bold text-ink">{t("proceso_recursos_titulo")}</p>
                    <p className="mb-4 mt-[3px] font-body text-[13px] text-secondary">{t("proceso_recursos_subtitulo")}</p>

                    <div className="grid gap-[14px]" style={{ gridTemplateColumns: "130px 1fr", alignItems: "center", columnGap: 16 }}>
                      <label className="font-body text-[13px] font-semibold text-ink">{t("proceso_recursos_nombre")}</label>
                      <input value={p.previewName} onChange={(e) => setField(i, "previewName", e.target.value)}
                        className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                      <label className="font-body text-[13px] font-semibold text-ink">{t("proceso_recursos_proyecto")}</label>
                      <input value={p.previewProject} onChange={(e) => setField(i, "previewProject", e.target.value)}
                        className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                      <label className="font-body text-[13px] font-semibold leading-snug text-ink">{t("proceso_recursos_repo")}</label>
                      <input value={p.repo} onChange={(e) => setField(i, "repo", e.target.value)}
                        className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                    </div>

                    {submitError && (
                      <p className="mt-4 font-body text-[13px] text-magenta">{submitError}</p>
                    )}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => { void submit(i); }}
                        disabled={!submitOk}
                        className={cn(
                          "rounded-xl bg-secondary px-6 py-3 font-body text-[14px] font-bold text-white transition-colors duration-[var(--duration-fast)]",
                          submitOk ? "hover:bg-secondary/80" : "opacity-50 cursor-not-allowed",
                        )}
                      >
                        {t("proceso_subir_propuesta")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Read-only body when sent */}
                {isSent && p.expanded && (
                  <div className="mt-[18px]">
                    <label className="mb-2 block font-body text-[13px] font-bold text-ink">
                      {t("description_label")}
                    </label>
                    <div className="rounded-xl border border-border bg-canvas p-[14px] font-body text-[14px] leading-relaxed text-ink" style={{ background: "#FBFAFD" }}>
                      {p.desc}
                    </div>

                    <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                      {t("proceso_doc_label")}
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[200px] flex-1 truncate rounded-xl border border-border px-[15px] py-3 font-body text-[14px] text-primary" style={{ background: "#FBFAFD" }}>
                        {p.link || t("proceso_sin_enlace")}
                      </div>
                      {p.fileName && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-[14px] py-[11px] font-body text-[13px] font-semibold text-ink">
                          <FileText className="size-[14px] text-magenta" aria-hidden="true" />
                          {p.fileName}
                        </div>
                      )}
                    </div>

                    <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                      {t("proceso_previsualizacion_label")}
                    </label>
                    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
                      <div className="flex items-center gap-[7px] border-b border-border px-[14px] py-[11px]" style={{ background: "#F4F3F7" }}>
                        <span className="size-[11px] rounded-full" style={{ background: "#F2655A" }} aria-hidden="true" />
                        <span className="size-[11px] rounded-full" style={{ background: "#F5BE4F" }} aria-hidden="true" />
                        <span className="size-[11px] rounded-full" style={{ background: "#62C554" }} aria-hidden="true" />
                        <div className="ml-[10px] flex-1 truncate rounded-[7px] border border-border bg-surface px-3 py-[6px] font-body text-[12px] text-ink-muted">
                          {p.repo || p.link || "preview.proyecto.app"}
                        </div>
                        {(p.repo || p.link) && (
                          <a href={p.repo || p.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 font-body text-xs font-bold text-primary hover:underline">
                            <ExternalLink className="size-3" aria-hidden="true" />
                            Abrir
                          </a>
                        )}
                      </div>
                      <div className="flex min-h-[150px] flex-col gap-[10px] px-7 py-[30px]" style={{ background: "linear-gradient(180deg,#FCFBFE,#F7F6FB)" }}>
                        <p className="font-heading text-xl font-extrabold tracking-tight text-ink-strong">
                          {p.previewName || t("proceso_preview_sin_nombre")}
                        </p>
                        <span className="self-start rounded-full bg-secondary/10 px-3 py-[5px] font-body text-[12px] font-semibold text-secondary">
                          {p.previewProject || t("proceso_preview_sin_categoria")}
                        </span>
                        <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-muted line-clamp-3">{p.desc}</p>
                      </div>
                    </div>

                    <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                      {t("proceso_observaciones_label")}
                    </label>
                    <div
                      className="min-h-[84px] rounded-xl border p-[14px] font-body text-[14px] leading-relaxed"
                      style={p.observaciones
                        ? { borderColor: "#F0CDBF", background: "#FFF6F2", color: "#9A3B23" }
                        : { borderColor: "#E8E5EF", background: "#FBFAFD", color: "#B3AEC0" }}
                    >
                      {p.observaciones || t("proceso_observaciones_empty")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Ghost — next locked version */}
        {!closed && (
          <div className="flex gap-[18px]">
            <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0, paddingTop: 1 }}>
              <div
                className="size-[30px] shrink-0 rounded-full bg-surface"
                style={{ border: "2px dashed #D7D2E0" }}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1 py-[2px]">
              <p className="font-body text-base font-bold" style={{ color: "#B3AEC0" }}>
                {t("proceso_propuesta_n", { n: proposals.length + 1 })}
              </p>
              <div className="mt-[5px] flex items-center gap-[7px] font-body text-[13px]" style={{ color: "#B3AEC0" }}>
                <Lock className="size-[13px] shrink-0" aria-hidden="true" />
                {lockCaption}
              </div>
            </div>
          </div>
        )}

        {/* Closed banner */}
        {closed && (
          <div className="mt-[6px] flex items-center gap-[10px] rounded-xl border p-[14px] font-body text-[14px] font-semibold"
            style={{ background: "#E0F3E9", borderColor: "#BFE6CF", color: "#1E7A4F" }}>
            <Check className="size-[18px] shrink-0" aria-hidden="true" />
            {t("proceso_cerrado")}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Empresa proceso view ──────────────────────────────────────────────────────

function EmpresaProcesoView({
  offers, project, locale, t, userId,
}: {
  offers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
}) {
  const [students, setStudents] = useState<EmpresaStudent[]>(
    () => buildEmpresaStudents(offers, project, locale),
  );
  const [saved, setSaved] = useState<string | null>(null);

  // Reset students when offers prop changes (real data loaded from API)
  useEffect(() => {
    setStudents(buildEmpresaStudents(offers, project, locale));
    setSaved(null);
  }, [offers, project, locale]);

  const toggleStudent = (id: number) =>
    setStudents((prev) =>
      prev.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s),
    );

  const toggleProposal = (sid: number, v: number) =>
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, expanded: !p.expanded } : p),
        },
      ),
    );

  const setStatus = (sid: number, v: number, status: EmpresaStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, status } : p),
        },
      ),
    );
    setSaved(`${sid}-${v}`);
  };

  const setComment = (sid: number, v: number, comment: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, comment } : p),
        },
      ),
    );
    setSaved(`${sid}-${v}`);
  };

  // Call backend for adjudicar / rechazar; other status changes remain local
  const handleDecide = async (sid: number, v: number, accion: "aceptar" | "rechazar") => {
    const student = students.find((s) => s.id === sid);
    if (!student) return;
    const nextStatus: EmpresaStatus = accion === "aceptar" ? "adjudicada" : "noseleccionada";
    setStatus(sid, v, nextStatus);
    if (student.offerId && userId) {
      await decideOfferAction(student.offerId, accion);
    }
  };

  const overall = (props: EmpresaProposal[]): EmpresaStatus => {
    if (props.some((p) => p.status === "adjudicada")) return "adjudicada";
    return props[props.length - 1]?.status ?? "enviada";
  };

  const selBtn = (active: boolean, badge: string) =>
    active
      ? cn("font-bold", badge.replace("border-", "border-2 border-"))
      : "border border-border bg-surface text-ink-muted hover:border-ink-muted";

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border px-6 py-5 md:px-8">
        <p className="mb-0.5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("empresa_proposals_label")}
        </p>
        <p className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
          {offers.length} {offers.length === 1 ? t("proceso_version_singular") : t("proceso_version_plural")} {offers.length === 1 ? "recibida" : "recibidas"}
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <FolderOpen className="size-12 text-ink-muted/30" aria-hidden="true" />
          <p className="font-body text-base text-ink-muted">{t("empresa_proposals_empty")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {students.map((s) => {
            const ov    = overall(s.proposals);
            const m     = EMPRESA_BADGE[ov];
            const isAdj = ov === "adjudicada";
            const isRej = ov === "noseleccionada";
            const nVer  = s.proposals.length;

            return (
              <div
                key={s.id}
                className={cn("transition-opacity duration-[var(--duration-fast)]", isRej && !s.expanded && "opacity-50")}
                style={{ background: s.expanded ? "#FAFAFC" : "#fff" }}
              >
                {/* Student row */}
                <div
                  onClick={() => toggleStudent(s.id)}
                  className="flex cursor-pointer items-center gap-4 px-6 py-5 md:px-8"
                >
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-[15px] font-bold",
                      isAdj ? "bg-accent/20 text-accent" : isRej ? "bg-border text-ink-muted" : "bg-accent/15 text-accent",
                    )}
                    aria-hidden="true"
                  >
                    {s.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={cn("font-heading text-base font-bold", isRej ? "text-ink-muted" : "text-ink-strong")}>
                        {s.name}
                      </span>
                      <span className="rounded-full bg-surface px-2.5 py-0.5 font-body text-xs font-semibold text-ink-muted" style={{ border: "1px solid #E7E3EF" }}>
                        {nVer} {nVer === 1 ? t("proceso_version_singular") : t("proceso_version_plural")}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-sm text-ink-muted">{s.date}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full border px-[18px] py-2 font-body text-sm font-bold whitespace-nowrap", m)}>
                    {ov === "enviada"        ? t("proceso_badge_enviada")
                      : ov === "revision"   ? t("proceso_badge_revision")
                      : ov === "cambios"    ? t("proceso_badge_cambios")
                      : ov === "adjudicada" ? t("proceso_badge_adjudicada")
                      : t("proceso_badge_nosel")}
                  </span>
                  {isAdj && (
                    <CheckCircle2 className="size-[22px] shrink-0 text-accent" aria-hidden="true" />
                  )}
                  <span className="w-[18px] shrink-0 text-center font-body text-sm text-ink-muted">
                    {s.expanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded: proposal sub-stepper */}
                {s.expanded && (
                  <div className="px-6 pb-8 pt-1 md:pl-20 md:pr-8">
                    <p className="mb-5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t("proceso_propuestas_estudiante")}
                    </p>

                    {s.proposals.map((p, pi) => {
                      const c    = empresaCircle(p.status);
                      const pm   = EMPRESA_BADGE[p.status];
                      const skey = `${s.id}-${p.v}`;
                      const isSavedHere = saved === skey;

                      const btnCls = (status: EmpresaStatus) =>
                        cn(
                          "rounded-[10px] px-4 py-2.5 font-body text-sm font-bold transition-colors duration-[var(--duration-fast)]",
                          selBtn(p.status === status, EMPRESA_BADGE[status]),
                        );

                      return (
                        <div key={p.v} className="flex gap-[18px]">
                          {/* Circle + line */}
                          <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0, paddingTop: 1 }}>
                            <div className={cn("flex size-[30px] shrink-0 items-center justify-center rounded-full", c.bg)}>
                              {c.icon}
                            </div>
                            {pi < s.proposals.length - 1 && (
                              <div className="mt-2 w-0.5 flex-1 rounded-sm bg-border" style={{ minHeight: 20 }} />
                            )}
                          </div>

                          {/* Version content */}
                          <div className="min-w-0 flex-1 pb-7">
                            {/* Version header */}
                            <div
                              onClick={() => toggleProposal(s.id, p.v)}
                              className="flex cursor-pointer items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-heading text-base font-bold text-ink-strong">
                                  {t("proceso_propuesta_n", { n: p.v })}
                                </span>
                                <span className="font-body text-sm text-ink-muted">· {p.date}</span>
                                <span className="font-body text-xs text-ink-muted">{p.expanded ? "▲" : "▼"}</span>
                              </div>
                              <span className={cn("inline-flex items-center rounded-full border px-[15px] py-1.5 font-body text-sm font-bold whitespace-nowrap", pm)}>
                                {p.status === "enviada"        ? t("proceso_badge_enviada")
                                  : p.status === "revision"   ? t("proceso_badge_revision")
                                  : p.status === "cambios"    ? t("proceso_badge_cambios")
                                  : p.status === "adjudicada" ? t("proceso_badge_adjudicada")
                                  : t("proceso_badge_nosel")}
                              </span>
                            </div>

                            {/* Version detail */}
                            {p.expanded && (
                              <div className="mt-4 max-w-[840px]">
                                <label className="mb-2 block font-body text-sm font-bold text-ink">
                                  {t("description_label")}
                                </label>
                                <div className="rounded-xl border border-border bg-canvas p-4 font-body text-sm leading-relaxed text-ink">
                                  {p.desc}
                                </div>

                                {p.link && (
                                  <>
                                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                      {t("proceso_ver_prototipo")}
                                    </label>
                                    <LinkPreview
                                      href={p.link}
                                      title={p.previewName}
                                      area={p.previewProject || undefined}
                                      excerpt={p.desc}
                                    />
                                  </>
                                )}

                                <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                  {t("proceso_comentarios_revision_label")}
                                </label>
                                <textarea
                                  placeholder={t("proceso_comentarios_empresa_placeholder")}
                                  value={p.comment}
                                  onChange={(e) => setComment(s.id, p.v, e.target.value)}
                                  rows={4}
                                  className="block w-full resize-y rounded-xl border border-border bg-surface p-3.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                                />

                                <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                  {t("proceso_estado_version")}
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                  <button onClick={() => setStatus(s.id, p.v, "enviada")}   className={btnCls("enviada")}>  {t("proceso_badge_enviada")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "revision")}  className={btnCls("revision")}> {t("proceso_badge_revision")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "cambios")}   className={btnCls("cambios")}>  {t("proceso_accion_cambios")}</button>
                                  <button onClick={() => { void handleDecide(s.id, p.v, "aceptar"); }}     className={btnCls("adjudicada")}>    {t("proceso_accion_adjudicar")}</button>
                                  <button onClick={() => { void handleDecide(s.id, p.v, "rechazar"); }}    className={btnCls("noseleccionada")}>{t("proceso_accion_rechazar")}</button>
                                </div>

                                {isSavedHere && (
                                  <div className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-accent">
                                    <Check className="size-4" aria-hidden="true" />
                                    {t("proceso_cambios_guardados")}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

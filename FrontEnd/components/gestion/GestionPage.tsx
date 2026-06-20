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
  Eye,
  GitBranch,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getCatalogsAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  getProjectByIdAction,
  getProjectOffersAction,
  submitOfferAction,
  reviewOfferAction,
  calificarOfertaAction,
  withdrawOfferAction,
  editOfferAction,
  getMyProjectsAction,
  getMyOffersAction,
  uploadDocumentoAction,
} from "@/lib/actions/marketplace";
import { generateProposalAction, suggestStackAction } from "@/lib/actions/ai";
import { streamAssistant } from "@/lib/api/ai-client";
import { getProjectMensajesAction, sendMensajeAction } from "@/lib/actions/mensajes";
import type {
  AiChatMessage,
  ApiMensaje,
  ApiProject,
  ApiRoleName,
  CatalogArea,
  CatalogSkill,
  CreateProjectInput,
  MyOffer,
  OfferState,
  ProjectOffer,
  ProjectProposal,
  SuggestStackInput,
  UpdateProjectInput,
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
  offerId: string | null;
  status: ProposalStatus;
  expanded: boolean;
  desc: string;
  link: string;
  fileName: string;
  docUrl: string;
  previewName: string;
  previewProject: string;
  repo: string;
  observaciones: string;
  calificacion: number | null;
  comentario_calificacion: string | null;
}

interface EmpresaProposal {
  v: number;
  offerId: string;
  status: EmpresaStatus;
  dbStatus: EmpresaStatus;  // persisted status from DB — controls editable vs read-only view
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
  calificacion: number | null;
  comentario_calificacion: string | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

const OFFER_STATE_CONFIG: Record<
  OfferState,
  { label: string; dot: string; badge: string; step: number }
> = {
  enviada:           { label: "Enviada",            dot: "bg-primary",  badge: "bg-primary/10 text-primary border-primary/20",   step: 0 },
  en_revision:       { label: "En revisión",        dot: "bg-warning",  badge: "bg-warning/10 text-warning border-warning/20",   step: 1 },
  solicitar_cambios: { label: "Cambios solicitados",dot: "bg-magenta",  badge: "bg-magenta/10 text-magenta border-magenta/20",   step: 1 },
  adjudicada:        { label: "Adjudicada",         dot: "bg-accent",   badge: "bg-accent/10 text-accent border-accent/20",      step: 2 },
  no_seleccionada:   { label: "No seleccionada",    dot: "bg-magenta",  badge: "bg-magenta/10 text-magenta border-magenta/20",   step: 2 },
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


function blankProposal(v: number): JuniorProposal {
  return { v, offerId: null, status: "nuevo", expanded: false, desc: "", link: "", fileName: "", docUrl: "", previewName: "", previewProject: "", repo: "", observaciones: "", calificacion: null, comentario_calificacion: null };
}

function initJuniorProposals(offers: MyOffer[], project: ApiProject | null): JuniorProposal[] {
  if (offers.length === 0) return [blankProposal(1)];
  const statusMap: Record<OfferState, ProposalStatus> = {
    enviada: "enviada", en_revision: "revision",
    solicitar_cambios: "cambios",
    adjudicada: "aceptada", no_seleccionada: "noseleccionada",
  };
  const result: JuniorProposal[] = offers.map((offer, idx) => ({
    v: idx + 1,
    offerId: offer.id,
    status: statusMap[offer.estado.nombre],
    expanded: false,
    desc: offer.propuesta,
    link: offer.prototipo_url ?? "",
    fileName: "",
    docUrl: "",
    previewName: project?.titulo ?? "",
    previewProject: project?.area?.nombre ?? "",
    repo: offer.url_repositorio ?? "",
    observaciones: offer.comentario_revision ?? "",
    calificacion: offer.calificacion ?? null,
    comentario_calificacion: offer.comentario_calificacion ?? null,
  }));
  const latest = offers[offers.length - 1];
  if (latest?.estado.nombre === "solicitar_cambios") {
    result.push(blankProposal(result.length + 1));
  }
  return result;
}

function buildEmpresaStudents(
  offers: ProjectOffer[],
  project: ApiProject | null,
  locale: string,
): EmpresaStudent[] {
  const statusMap: Record<OfferState, EmpresaStatus> = {
    enviada: "enviada", en_revision: "revision",
    solicitar_cambios: "cambios",
    adjudicada: "adjudicada", no_seleccionada: "noseleccionada",
  };
  const STATUS_ORDER: Record<EmpresaStatus, number> = {
    adjudicada: 0, revision: 1, cambios: 1, enviada: 2, noseleccionada: 3,
  };

  const title = project?.titulo ?? "Propuesta";
  const area  = project?.area?.nombre ?? "Proyecto";

  // Group all offers by junior.id — one student row per junior
  const byJunior = new Map<string, ProjectOffer[]>();
  for (const offer of offers) {
    const group = byJunior.get(offer.junior.id) ?? [];
    group.push(offer);
    byJunior.set(offer.junior.id, group);
  }

  const students: EmpresaStudent[] = [];
  let idx = 0;

  for (const [, juniorOffers] of byJunior) {
    // Sort versions oldest-first for v1, v2, v3 numbering
    const versions = [...juniorOffers].sort(
      (a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime(),
    );
    const latest = versions[versions.length - 1]!;
    const initials = ((latest.junior.nombre[0] ?? "") + (latest.junior.apellido1?.[0] ?? "")).toUpperCase();

    const proposals: EmpresaProposal[] = versions.map((offer, vi) => {
      const mappedStatus = statusMap[offer.estado.nombre];
      return {
        v: vi + 1,
        offerId: offer.id,
        status: mappedStatus,
        dbStatus: mappedStatus,
        date: new Date(offer.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" }),
        expanded: false,
        desc: offer.propuesta,
        link: offer.prototipo_url ?? "",
        previewName: title,
        previewProject: area,
        comment: offer.comentario_revision ?? "",
      };
    });

    students.push({
      id: ++idx,
      offerId: latest.id,
      name: `${latest.junior.nombre} ${latest.junior.apellido1 ?? ""}`.trim(),
      initials,
      date: new Date(latest.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" }),
      expanded: false,
      proposals,
      calificacion: latest.calificacion ?? null,
      comentario_calificacion: latest.comentario_calificacion ?? null,
    });
  }

  // Sort students: adjudicada first, no_seleccionada last
  return students.sort((a, b) => {
    const aStatus = a.proposals[a.proposals.length - 1]?.status ?? "enviada";
    const bStatus = b.proposals[b.proposals.length - 1]?.status ?? "enviada";
    return STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus];
  });
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { role: ApiRoleName | null; userId: string | null; initialProjectId?: string | null; disponible?: boolean }

export function GestionPage({ role, userId, initialProjectId, disponible = true }: Props) {
  const t      = useTranslations("gestion_page");
  const locale = useLocale();
  const isEmpresa = role === "company";

  // Sidebar data — starts empty, replaced by real API data on mount
  const [sidebarProjects, setSidebarProjects] = useState<ApiProject[]>([]);
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);

  // Catalogs for create/edit form (empresa only)
  const [catalogs, setCatalogs] = useState<{ areas: CatalogArea[]; skills: CatalogSkill[] }>({ areas: [], skills: [] });

  // Create / edit sheet
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Pending navigation when form has unsaved changes
  type PendingNav = { type: "select"; id: string } | { type: "back" } | { type: "create" };
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);

  // Selection state
  const [selectedId, setSelectedId]         = useState<string | null>(initialProjectId ?? null);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);
  const [selectedOffers, setSelectedOffers]   = useState<MyOffer[]>([]);
  const [projectOffers, setProjectOffers]     = useState<ProjectOffer[]>([]);
  const [section, setSection]               = useState<Section>("info");

  // Clean ?proyecto= from URL once used to pre-select
  useEffect(() => {
    if (initialProjectId) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load sidebar on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      if (isEmpresa) {
        const [pr, cr] = await Promise.all([getMyProjectsAction(), getCatalogsAction()]);
        if (active) {
          if (pr.ok) setSidebarProjects(pr.data.projects);
          if (cr.ok) setCatalogs({ areas: cr.data.areas, skills: cr.data.skills });
        }
      } else {
        const or = await getMyOffersAction();
        if (active && or.ok) setMyOffers(or.data.ofertas);
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
        const offers = myOffers
          .filter((o) => o.proyecto?.id === selectedId)
          .sort((a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime());
        if (active) setSelectedOffers(offers);
      }
    })();
    return () => { active = false; };
  }, [selectedId, isEmpresa, myOffers]);

  const handleSaveProject = async (data: CreateProjectInput | UpdateProjectInput) => {
    setFormSaving(true);
    if (formMode === "create") {
      const r = await createProjectAction(data as CreateProjectInput);
      if (r.ok) {
        const pr = await getMyProjectsAction();
        if (pr.ok) setSidebarProjects(pr.data.projects);
        setSelectedId(r.data.id);
        setSelectedProject(null);
        setSection("info");
        setFormMode(null);
      }
    } else if (formMode === "edit" && selectedId) {
      const r = await updateProjectAction(selectedId, data as UpdateProjectInput);
      if (r.ok) {
        setSelectedProject(r.data);
        const pr = await getMyProjectsAction();
        if (pr.ok) setSidebarProjects(pr.data.projects);
        setFormMode(null);
      }
    }
    setFormSaving(false);
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const r = await deleteProjectAction(deleteTarget);
    if (r.ok) {
      setSidebarProjects((prev) => prev.filter((p) => p.id !== deleteTarget));
      if (selectedId === deleteTarget) {
        setSelectedId(null);
        setSelectedProject(null);
      }
      setDeleteTarget(null);
    } else {
      setDeleteError(r.error);
    }
    setDeleting(false);
  };

  const doSelect = (id: string) => {
    setSelectedId(id);
    setSection("info");
    setFormMode(null);
    const proj = sidebarProjects.find((p) => p.id === id) ?? null;
    setSelectedProject(proj);
    if (isEmpresa) setProjectOffers([]);
    else setSelectedOffers(
      myOffers
        .filter((o) => o.proyecto?.id === id)
        .sort((a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime()),
    );
  };

  const handleSelect = (id: string) => {
    if (formMode !== null) { setPendingNav({ type: "select", id }); return; }
    doSelect(id);
  };

  const handleBack = () => {
    if (formMode !== null) { setPendingNav({ type: "back" }); return; }
    setSelectedId(null);
  };

  const handleConfirmNav = () => {
    if (!pendingNav) return;
    setFormMode(null);
    if (pendingNav.type === "select") doSelect(pendingNav.id);
    else if (pendingNav.type === "back") setSelectedId(null);
    else if (pendingNav.type === "create") setTimeout(() => setFormMode("create"), 0);
    setPendingNav(null);
  };

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
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-heading text-xl font-extrabold tracking-tight text-white">
                  {t("title")}<span className="text-highlight" aria-hidden="true">.</span>
                </h1>
                {isEmpresa && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formMode === "edit") { setPendingNav({ type: "create" }); return; }
                      setFormMode("create");
                    }}
                    aria-label="Nuevo proyecto"
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-highlight hover:text-secondary"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {isEmpresa ? (
                sidebarProjects.length === 0 ? <SidebarEmpty text={t("empty_empresa")} /> : (
                  <ul className="flex flex-col gap-0.5">
                    {sidebarProjects.map((proyecto) => {
                      const isSelected = proyecto.id === selectedId;
                      const count  = isSelected ? projectOffers.length : (proyecto.n_ofertas ?? 0);
                      const hasAdj = isSelected && projectOffers.some((o) => o.estado.nombre === "adjudicada");
                      return (
                        <li key={proyecto.id}>
                          <div className="group flex items-center gap-1 rounded-xl hover:bg-white/10 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]">
                            <button
                              onClick={() => handleSelect(proyecto.id)}
                              className="flex flex-1 items-center gap-3 px-3 py-3 text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-heading text-sm font-bold text-white">{proyecto.titulo}</p>
                                <p className="mt-0.5 font-body text-xs text-white/50">{t("proposals_count", { count })}</p>
                              </div>
                              {hasAdj && <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />}
                              <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                            </button>
                            {proyecto.estado.nombre === "borrador" && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(proyecto.id); }}
                                aria-label="Eliminar proyecto"
                                className="mr-2 hidden size-7 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-magenta/20 hover:text-magenta group-hover:flex"
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : (
                myOffers.length === 0 ? <SidebarEmpty text={t("empty_junior")} /> : (() => {
                  // Unique projects from offers (keep latest state per project — myOffers is DESC)
                  const seen = new Set<string>();
                  const juniorProjects = myOffers
                    .filter((o) => o.proyecto && !seen.has(o.proyecto.id) && !!seen.add(o.proyecto.id))
                    .map((o) => o.proyecto!);
                  return (
                    <ul className="flex flex-col gap-0.5">
                      {juniorProjects.map((proyecto) => {
                        const latestOferta = myOffers.find((o) => o.proyecto?.id === proyecto.id);
                        const cfg = latestOferta ? OFFER_STATE_CONFIG[latestOferta.estado.nombre] : null;
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
                              {latestOferta?.estado.nombre === "adjudicada" && (
                                <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                              )}
                              <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()
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
          !selectedId && formMode === null ? "hidden md:flex md:flex-col" : "block",
        )}
      >
        {isEmpresa && formMode !== null ? (
          <ProjectFormContent
            mode={formMode}
            project={formMode === "edit" ? selectedProject : null}
            catalogs={catalogs}
            saving={formSaving}
            onSave={handleSaveProject}
            onClose={() => setFormMode(null)}
          />
        ) : !selectedId ? (
          <WelcomePanel
            isEmpresa={isEmpresa}
            hasProjects={sidebarProjects.length > 0}
            t={t}
            locale={locale}
            onCreateProject={() => setFormMode("create")}
          />
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
              <InfoPanel
                project={selectedProject}
                locale={locale}
                t={t}
                isEmpresa={isEmpresa}
                onEdit={() => setFormMode("edit")}
                onDelete={() => setDeleteTarget(selectedId)}
              />
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
                key={`proceso-${selectedId}-${selectedOffers.length}-${projectOffers.length}`}
                isEmpresa={isEmpresa}
                offers={selectedOffers}
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

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <ConfirmDeleteDialog
          projectTitle={sidebarProjects.find((p) => p.id === deleteTarget)?.titulo ?? ""}
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDeleteProject}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        />
      )}

      {/* ── Unsaved changes warning ── */}
      {pendingNav !== null && (
        <UnsavedChangesDialog
          onConfirm={handleConfirmNav}
          onCancel={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<"gestion_page">>;

// ── Welcome panel (main area, no project selected) ────────────────────────────

function WelcomePanel({
  isEmpresa,
  hasProjects,
  t,
  locale,
  onCreateProject,
}: {
  isEmpresa: boolean;
  hasProjects: boolean;
  t: T;
  locale: string;
  onCreateProject: () => void;
}) {
  const desc = isEmpresa
    ? hasProjects ? t("welcome_desc_empresa") : t("welcome_desc_empresa_empty")
    : hasProjects ? t("welcome_desc_junior") : t("welcome_desc_junior_empty");

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
        {isEmpresa ? t("section_empresa") : t("section_junior")}
      </p>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
        {t("title")}<span className="text-primary" aria-hidden="true">.</span>
      </h1>
      <p className="mt-3 max-w-sm font-body text-base leading-relaxed text-ink-muted">
        {desc}
      </p>
      {!hasProjects && (
        <div className="mt-6">
          {isEmpresa ? (
            <button
              type="button"
              onClick={onCreateProject}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("welcome_cta_empresa")}
            </button>
          ) : (
            <a
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {t("welcome_cta_junior")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <FolderOpen className="size-10 text-white/20" aria-hidden="true" />
      <p className="font-body text-sm text-white/40">{text}</p>
    </div>
  );
}

// ── Info panel ────────────────────────────────────────────────────────────────

function InfoPanel({
  project, locale, t, isEmpresa, onEdit, onDelete,
}: {
  project: ApiProject | null;
  locale: string;
  t: T;
  isEmpresa: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!project) return null;
  const skills = project.skills.filter((s) => s.skill != null);
  const canEdit = isEmpresa && (project.estado.nombre === "borrador" || project.estado.nombre === "en_recepcion");
  const canDelete = isEmpresa;
  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-6">
        {project.area && (
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
            {project.area.nombre}
          </p>
        )}
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
            {project.titulo}<span className="text-highlight" aria-hidden="true">.</span>
          </h2>
          {isEmpresa && (
            <div className="flex shrink-0 items-center gap-1.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Editar proyecto"
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/30 hover:text-primary"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                disabled={!canDelete}
                aria-label={canDelete ? "Eliminar proyecto" : "Solo se pueden eliminar proyectos en borrador"}
                title={canDelete ? undefined : "Solo se pueden eliminar proyectos en borrador"}
                className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-magenta/30 hover:text-magenta disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
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

  const [msgs, setMsgs]     = useState<ChatMessage[]>([]);
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

    setMsgs([]);

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
  isEmpresa, offers, projectOffers, project, locale, t, userId, disponible,
}: {
  isEmpresa: boolean;
  offers: MyOffer[];
  projectOffers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
}) {
  if (isEmpresa) {
    return <EmpresaProcesoView offers={projectOffers} project={project} locale={locale} t={t} />;
  }
  return <JuniorProcesoView offers={offers} project={project} locale={locale} t={t} userId={userId} disponible={disponible} />;
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
  offers, project, t, userId, disponible,
}: {
  offers: MyOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
}) {
  const [proposals, setProposals] = useState<JuniorProposal[]>(
    () => initJuniorProposals(offers, project),
  );
  const [submitError, setSubmitError] = useState("");
  const closed = proposals.some((p) => p.status === "aceptada" && p.calificacion != null);

  // Reset proposals when offers change (real data loaded from API)
  const latestOfferId = offers[offers.length - 1]?.id;
  useEffect(() => {
    setProposals(initJuniorProposals(offers, project));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length, latestOfferId]);

  // ── State helpers ────────────────────────────────────────────────────────
  const patch = (i: number, p: Partial<JuniorProposal>) =>
    setProposals((prev) => prev.map((x, idx) => idx === i ? { ...x, ...p } : x));

  const startCreate = (i: number) => patch(i, { status: "editando", expanded: true });
  const toggle      = (i: number) => { const c = proposals[i]; if (c) patch(i, { expanded: !c.expanded }); };
  const setField    = (i: number, k: keyof JuniorProposal, v: string) => patch(i, { [k]: v } as Partial<JuniorProposal>);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    patch(i, { fileName: file.name, docUrl: "" });
    setIsUploading(true);
    setSubmitError("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadDocumentoAction(fd);
    setIsUploading(false);
    if (r.ok) {
      patch(i, { docUrl: r.data });
    } else {
      patch(i, { fileName: "", docUrl: "" });
      setSubmitError(r.error);
    }
    e.target.value = "";
  };

  const [withdrawingIdx, setWithdrawingIdx] = useState<number | null>(null);

  const handleWithdraw = async (i: number) => {
    const p = proposals[i];
    if (!p?.offerId || !project) return;
    setWithdrawingIdx(i);
    const result = await withdrawOfferAction(p.offerId);
    setWithdrawingIdx(null);
    if (result.ok) {
      const fresh = await getMyOffersAction();
      if (fresh.ok) {
        const projectOffers = fresh.data.ofertas.filter((o) => o.proyecto?.id === project.id);
        setProposals(initJuniorProposals(projectOffers, project));
      } else {
        setProposals([blankProposal(1)]);
      }
    } else {
      setSubmitError(result.error);
    }
  };

  const startEdit = (i: number) => {
    patch(i, { status: "editando", expanded: true });
  };

  const submit = async (i: number) => {
    const p = proposals[i];
    if (!p?.desc.trim()) return;
    if (!project || !userId) return;

    if (p.link) {
      try { new URL(p.link); } catch {
        setSubmitError("El enlace debe comenzar con https:// (ej: https://mi-demo.vercel.app)");
        return;
      }
    }

    if (!p.link && !p.docUrl) {
      setSubmitError("Tenés que adjuntar un enlace de documentación o subir un archivo PDF antes de enviar.");
      return;
    }

    setSubmitError("");

    // Editar propuesta existente (status era "enviada", pasó a "editando")
    if (p.offerId) {
      const result = await editOfferAction(p.offerId, {
        propuesta: p.desc,
        prototipo_url: p.link || null,
        documentacion_url: p.docUrl || null,
        url_repositorio: p.repo || null,
      });
      if (result.ok) {
        patch(i, { status: "enviada", expanded: false });
      } else {
        setSubmitError(result.error);
      }
      return;
    }

    // Nueva propuesta
    const result = await submitOfferAction(project.id, {
      propuesta: p.desc,
      ...(p.link ? { prototipo_url: p.link } : {}),
      ...(p.docUrl ? { documentacion_url: p.docUrl } : {}),
      ...(p.repo ? { url_repositorio: p.repo } : {}),
    });
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
                    {/* Editar y Retirar — solo cuando la empresa aún no revisó */}
                    {p.status === "enviada" && p.offerId && (
                      <>
                        <button
                          onClick={() => startEdit(i)}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-surface px-[14px] py-[7px] font-body text-[13px] font-semibold text-ink transition-colors duration-[var(--duration-fast)] hover:border-secondary hover:text-secondary"
                        >
                          <Pencil className="size-[13px]" aria-hidden="true" />
                          {t("proceso_editar")}
                        </button>
                        <button
                          onClick={() => { void handleWithdraw(i); }}
                          disabled={withdrawingIdx === i}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-magenta/30 bg-surface px-[14px] py-[7px] font-body text-[13px] font-semibold text-magenta transition-colors duration-[var(--duration-fast)] hover:bg-magenta/5 disabled:opacity-50"
                        >
                          <Trash2 className="size-[13px]" aria-hidden="true" />
                          {withdrawingIdx === i ? t("proceso_retirando") : t("proceso_retirar")}
                        </button>
                      </>
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
                      <span className="ml-1 font-normal text-magenta">*</span>
                    </label>
                    <p className="mb-2 font-body text-[12px] text-ink-muted">Adjuntá un enlace <strong>o</strong> subí un PDF — al menos uno es obligatorio.</p>
                    <div className="flex gap-3">
                      <input
                        placeholder={t("proceso_link_placeholder")}
                        value={p.link}
                        onChange={(e) => { setField(i, "link", e.target.value); if (p.docUrl) patch(i, { docUrl: "", fileName: "" }); }}
                        disabled={!!p.docUrl}
                        className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-[15px] py-3 font-body text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:opacity-50"
                      />
                      <label className={cn(
                        "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-[18px] py-3 font-body text-[14px] font-semibold transition-colors",
                        p.docUrl ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-ink hover:border-secondary hover:text-secondary",
                        p.link && "opacity-50 pointer-events-none",
                        isUploading && "opacity-50 pointer-events-none",
                      )}>
                        {isUploading
                          ? <><Loader2 className="size-[15px] animate-spin" aria-hidden="true" />Subiendo...</>
                          : p.docUrl
                            ? <><CheckCircle2 className="size-[15px]" aria-hidden="true" />{p.fileName}</>
                            : <><Upload className="size-[15px]" aria-hidden="true" />{t("proceso_subir_archivo")}</>
                        }
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          disabled={!!p.link || isUploading}
                          onChange={(e) => { void handleFileChange(e, i); }}
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
                        disabled={!submitOk || isUploading}
                        className={cn(
                          "rounded-xl bg-secondary px-6 py-3 font-body text-[14px] font-bold text-white transition-colors duration-[var(--duration-fast)]",
                          submitOk && !isUploading ? "hover:bg-secondary/80" : "opacity-50 cursor-not-allowed",
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
                    {p.status === "aceptada" ? (
                      <div className="rounded-xl border border-accent/30 bg-accent/5 p-[14px] font-body text-[14px] leading-relaxed text-ink">
                        {p.observaciones || t("proceso_revision_empty")}
                      </div>
                    ) : (
                      <div
                        className="min-h-[84px] rounded-xl border p-[14px] font-body text-[14px] leading-relaxed"
                        style={p.observaciones
                          ? { borderColor: "#F0CDBF", background: "#FFF6F2", color: "#9A3B23" }
                          : { borderColor: "#E8E5EF", background: "#FBFAFD", color: "#B3AEC0" }}
                      >
                        {p.observaciones || t("proceso_observaciones_empty")}
                      </div>
                    )}

                    {p.status === "aceptada" && p.calificacion != null && (
                      <div className="mt-4 rounded-xl border border-highlight/30 bg-highlight/5 p-[14px]">
                        <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          {t("proceso_calificacion_empresa")}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("size-5", i < p.calificacion! ? "fill-highlight text-highlight" : "text-border")}
                              aria-hidden="true"
                            />
                          ))}
                          <span className="ml-2 font-heading text-base font-bold text-ink-strong">
                            {p.calificacion}/5
                          </span>
                        </div>
                        {p.comentario_calificacion && (
                          <p className="mt-2 font-body text-sm leading-relaxed text-ink">
                            {p.comentario_calificacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Ghost — next locked version (hidden when final state reached) */}
        {!closed && latest?.status !== "aceptada" && latest?.status !== "noseleccionada" && (
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
  offers, project, locale, t,
}: {
  offers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
  const [students, setStudents] = useState<EmpresaStudent[]>(
    () => buildEmpresaStudents(offers, project, locale),
  );
  const [saved, setSaved] = useState<string | null>(null);
  const [ratingForms, setRatingForms] = useState<Record<string, { stars: number; comment: string; submitting: boolean }>>({});

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
  };

  // Toggle "en revisión" — se guarda inmediatamente al activar
  const handleMarkRevision = async (sid: number, v: number, offerId: string) => {
    const result = await reviewOfferAction(offerId, { accion: "en_revision" });
    if (result.ok) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id !== sid ? s : {
            ...s,
            proposals: s.proposals.map((p) =>
              p.v === v ? { ...p, dbStatus: "revision" as EmpresaStatus, status: "revision" as EmpresaStatus } : p,
            ),
          },
        ),
      );
    }
  };

  // "Enviar" — confirma la accion terminal (cambios / adjudicar / rechazar)
  const handleEnviar = async (sid: number, v: number) => {
    const student = students.find((s) => s.id === sid);
    if (!student) return;
    const proposal = student.proposals.find((p) => p.v === v);
    if (!proposal) return;

    const accionMap: Partial<Record<EmpresaStatus, "solicitar_cambios" | "aceptar" | "rechazar">> = {
      cambios:        "solicitar_cambios",
      adjudicada:     "aceptar",
      noseleccionada: "rechazar",
    };
    const accion = accionMap[proposal.status];
    if (!accion) return;

    const result = await reviewOfferAction(proposal.offerId, {
      accion,
      ...(proposal.comment.trim() ? { comentario: proposal.comment.trim() } : {}),
    });

    if (result.ok) {
      setSaved(`${sid}-${v}`);
      const adjudicando = accion === "aceptar";
      const targetOfferId = proposal.offerId;

      // Re-fetch from DB so dbStatus and comment reflect what was actually persisted
      if (project?.id) {
        const fresh = await getProjectOffersAction(project.id);
        if (fresh.ok) {
          const rebuilt = buildEmpresaStudents(fresh.data.ofertas, project, locale);
          if (adjudicando) {
            // Mantener expandido el student y la propuesta adjudicada
            // para que el formulario de calificacion aparezca de inmediato.
            setStudents(rebuilt.map((st) => {
              const adjProp = st.proposals.find((p) => p.offerId === targetOfferId);
              if (!adjProp) return st;
              return {
                ...st,
                expanded: true,
                proposals: st.proposals.map((p) =>
                  p.offerId === targetOfferId ? { ...p, expanded: true } : p,
                ),
              };
            }));
          } else {
            setStudents(rebuilt);
          }
        } else {
          // Fallback: update dbStatus locally if re-fetch fails
          const savedStatus = proposal.status;
          setStudents((prev) =>
            prev.map((s) =>
              s.id !== sid ? s : {
                ...s,
                proposals: s.proposals.map((p) =>
                  p.v !== v ? p : { ...p, dbStatus: savedStatus },
                ),
              },
            ),
          );
        }
      }
    }
  };

  const handleCalificar = async (offerId: string) => {
    const form = ratingForms[offerId];
    if (!form || form.stars === 0) return;
    setRatingForms((prev) => ({ ...prev, [offerId]: { ...prev[offerId]!, submitting: true } }));
    const result = await calificarOfertaAction(offerId, {
      calificacion: form.stars,
      ...(form.comment.trim() ? { comentario: form.comment.trim() } : {}),
    });
    if (result.ok) {
      // Re-fetch from DB so calificacion state reflects what was actually persisted
      if (project?.id) {
        const fresh = await getProjectOffersAction(project.id);
        if (fresh.ok) {
          setStudents(buildEmpresaStudents(fresh.data.ofertas, project, locale));
        } else {
          // Fallback: update calificacion locally if re-fetch fails
          setStudents((prev) =>
            prev.map((s) =>
              s.offerId !== offerId ? s : {
                ...s,
                calificacion: form.stars,
                comentario_calificacion: form.comment.trim() || null,
              },
            ),
          );
        }
      } else {
        setStudents((prev) =>
          prev.map((s) =>
            s.offerId !== offerId ? s : {
              ...s,
              calificacion: form.stars,
              comentario_calificacion: form.comment.trim() || null,
            },
          ),
        );
      }
    } else {
      setRatingForms((prev) => ({ ...prev, [offerId]: { ...prev[offerId]!, submitting: false } }));
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
                                {/* Toggle "En revisión" — solo visible mientras la empresa puede actuar */}
                                {(p.dbStatus === "enviada" || p.dbStatus === "revision") && (
                                  <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Eye className="size-4 shrink-0 text-warning" aria-hidden="true" />
                                      <span className="font-body text-sm font-semibold text-ink">
                                        {t("proceso_switch_revision_label")}
                                      </span>
                                    </div>
                                    {p.dbStatus === "enviada" ? (
                                      <button
                                        type="button"
                                        onClick={() => { void handleMarkRevision(s.id, p.v, p.offerId); }}
                                        className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 font-body text-xs font-bold text-warning transition-colors duration-[var(--duration-fast)] hover:bg-warning hover:text-white"
                                      >
                                        {t("proceso_switch_revision_activar")}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 font-body text-xs font-bold text-white">
                                        <Check className="size-3" aria-hidden="true" />
                                        {t("proceso_switch_revision_activo")}
                                      </span>
                                    )}
                                  </div>
                                )}

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

                                {(p.dbStatus === "enviada" || p.dbStatus === "revision") ? (
                                  <>
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
                                      <button onClick={() => setStatus(s.id, p.v, "cambios")}        className={btnCls("cambios")}>        {t("proceso_accion_cambios")}</button>
                                      <button onClick={() => setStatus(s.id, p.v, "adjudicada")}     className={btnCls("adjudicada")}>     {t("proceso_accion_adjudicar")}</button>
                                      <button onClick={() => setStatus(s.id, p.v, "noseleccionada")} className={btnCls("noseleccionada")}> {t("proceso_accion_rechazar")}</button>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={() => { void handleEnviar(s.id, p.v); }}
                                        disabled={p.status === "enviada" || p.status === "revision"}
                                        className="rounded-xl bg-secondary px-6 py-2.5 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        {t("proceso_btn_enviar")}
                                      </button>
                                      {isSavedHere && (
                                        <div className="inline-flex items-center gap-2 font-body text-sm font-semibold text-accent">
                                          <Check className="size-4" aria-hidden="true" />
                                          {t("proceso_cambios_guardados")}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Read-only card: saved status + comment */}
                                    <div className="mt-5 rounded-xl border border-border bg-surface p-4">
                                      <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                                        {t("proceso_observacion_enviada")}
                                      </p>
                                      <span className={cn("inline-flex items-center rounded-full border px-4 py-1.5 font-body text-sm font-bold", pm)}>
                                        {p.status === "revision"      ? t("proceso_badge_revision")
                                          : p.status === "cambios"    ? t("proceso_badge_cambios")
                                          : p.status === "adjudicada" ? t("proceso_badge_adjudicada")
                                          : t("proceso_badge_nosel")}
                                      </span>
                                      {p.comment && (
                                        <p className="mt-3 font-body text-sm leading-relaxed text-ink">{p.comment}</p>
                                      )}
                                    </div>

                                    {p.dbStatus === "adjudicada" && (
                                      s.calificacion != null ? (
                                        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
                                          <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-accent">
                                            {t("proceso_calificacion_enviada")}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <Star
                                                key={i}
                                                className={cn("size-5", i < s.calificacion! ? "fill-highlight text-highlight" : "text-border")}
                                                aria-hidden="true"
                                              />
                                            ))}
                                          </div>
                                          {s.comentario_calificacion && (
                                            <p className="mt-2 font-body text-sm leading-relaxed text-ink">{s.comentario_calificacion}</p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                                          <p className="mb-3 font-body text-sm font-bold text-ink">
                                            {t("proceso_calificar_titulo")}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => {
                                              const rf = ratingForms[s.offerId] ?? { stars: 0, comment: "", submitting: false };
                                              return (
                                                <button
                                                  key={i}
                                                  type="button"
                                                  onClick={() => setRatingForms((prev) => ({
                                                    ...prev,
                                                    [s.offerId]: { ...(prev[s.offerId] ?? { stars: 0, comment: "", submitting: false }), stars: i + 1 },
                                                  }))}
                                                  aria-label={`${i + 1} ${i === 0 ? "estrella" : "estrellas"}`}
                                                >
                                                  <Star
                                                    className={cn("size-7 transition-colors duration-[var(--duration-fast)]", i < rf.stars ? "fill-highlight text-highlight" : "text-border hover:text-highlight/60")}
                                                    aria-hidden="true"
                                                  />
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <textarea
                                            placeholder={t("proceso_calificar_placeholder")}
                                            value={ratingForms[s.offerId]?.comment ?? ""}
                                            onChange={(e) => setRatingForms((prev) => ({
                                              ...prev,
                                              [s.offerId]: { ...(prev[s.offerId] ?? { stars: 0, comment: "", submitting: false }), comment: e.target.value },
                                            }))}
                                            rows={3}
                                            className="mt-3 block w-full resize-y rounded-xl border border-border bg-canvas p-3.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                                          />
                                          <button
                                            type="button"
                                            disabled={(ratingForms[s.offerId]?.stars ?? 0) === 0 || (ratingForms[s.offerId]?.submitting ?? false)}
                                            onClick={() => { void handleCalificar(s.offerId); }}
                                            className="mt-3 rounded-xl bg-secondary px-5 py-2.5 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary/80 disabled:opacity-50"
                                          >
                                            {(ratingForms[s.offerId]?.submitting ?? false) ? t("proceso_calificar_enviando") : t("proceso_calificar_btn")}
                                          </button>
                                        </div>
                                      )
                                    )}
                                  </>
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

// ── AI assistant helpers ──────────────────────────────────────────────────────

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 font-body text-sm",
          isUser ? "bg-primary text-white" : "bg-surface-sunken text-ink-strong",
        )}
      >
        {content}
      </div>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted" />
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:300ms]" />
      </span>
      <span className="font-body text-xs">{label}</span>
    </div>
  );
}

function AiAssistant({ onApply }: { onApply: (proposal: ProjectProposal) => void }) {
  const [idea, setIdea] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<string[]>([]);
  const [disenos, setDisenos] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streamingText, isStreaming]);

  const hasConversation = messages.length > 0;
  const canGenerate = messages.some((m) => m.role === "assistant") && !isStreaming && !isGenerating;

  async function runTurn(history: AiChatMessage[]) {
    setError(null);
    setIsStreaming(true);
    setStreamingText("");
    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";
    let failed = false;
    await streamAssistant(
      history,
      (event) => {
        if (event.type === "delta") {
          accumulated += event.text;
          setStreamingText(accumulated);
        } else if (event.type === "error") {
          failed = true;
          setError(event.error);
        }
      },
      controller.signal,
    );
    setIsStreaming(false);
    setStreamingText("");
    if (accumulated.trim()) {
      setMessages((prev) => [...prev, { role: "assistant", content: accumulated.trim() }]);
    } else if (!failed) {
      setError("Ocurrió un error. Intentá de nuevo.");
    }
  }

  async function startConversation() {
    const text = idea.trim();
    if (!text || isStreaming) return;
    const history: AiChatMessage[] = [{ role: "user", content: text }];
    setMessages(history);
    setIdea("");
    setApplied(false);
    setPendingQuestions([]);
    await runTurn(history);
  }

  async function sendReply() {
    const text = reply.trim();
    if (!text || isStreaming) return;
    const history: AiChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setReply("");
    await runTurn(history);
  }

  async function generate() {
    setIsGenerating(true);
    setError(null);
    const result = await generateProposalAction(messages);
    setIsGenerating(false);
    if (result.ok) {
      onApply(result.data);
      setPendingQuestions(result.data.preguntas_pendientes);
      setDisenos(result.data.estilos_diseno);
      setApplied(true);
    } else {
      setError(result.error);
    }
  }

  function restart() {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setIsStreaming(false);
    setReply("");
    setError(null);
    setIsGenerating(false);
    setPendingQuestions([]);
    setDisenos([]);
    setApplied(false);
    setIdea("");
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <span className="font-body text-sm font-bold text-primary">Asistente de IA</span>
        <span className="rounded-full bg-highlight px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-secondary">
          Beta
        </span>
      </div>

      {!hasConversation ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="ai-idea" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              Contanos la idea de tu proyecto
            </label>
            <textarea
              id="ai-idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej: Necesito una app web para gestionar turnos de una clínica pequeña..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={() => void startConversation()}
            disabled={!idea.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Completar formulario con IA
          </button>
          <p className="font-body text-xs text-ink-muted">
            La IA hará algunas preguntas para entender mejor tu proyecto antes de completar el formulario.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div ref={scrollRef} className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface p-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {isStreaming && (
              streamingText
                ? <ChatBubble role="assistant" content={streamingText} />
                : <TypingIndicator label="Escribiendo..." />
            )}
          </div>

          {applied && (
            <div className="space-y-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <p className="font-body text-xs font-semibold text-ink-strong">Formulario completado. Revisá y ajustá lo que necesites.</p>
              </div>
              {disenos.length > 0 && (
                <div className="space-y-1 pl-6">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">Referencias de diseño sugeridas</p>
                  <ul className="list-disc space-y-0.5 pl-4 font-body text-xs text-ink-muted">
                    {disenos.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              {pendingQuestions.length > 0 && (
                <div className="space-y-1 pl-6">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">Preguntas que podés definir después</p>
                  <ul className="list-disc space-y-0.5 pl-4 font-body text-xs text-ink-muted">
                    {pendingQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 font-body text-xs font-semibold text-magenta">
              {error}
            </p>
          )}

          {!applied && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void sendReply(); } }}
                disabled={isStreaming}
                placeholder="Respondé al asistente..."
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
              <Button type="button" size="icon" onClick={() => void sendReply()} disabled={!reply.trim() || isStreaming} aria-label="Enviar">
                <Send className="size-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!applied && (
              <Button type="button" variant="accent" onClick={() => void generate()} disabled={!canGenerate} className="gap-2">
                {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {isGenerating ? "Generando..." : "Generar propuesta"}
              </Button>
            )}
            <button type="button" onClick={restart} className="font-body text-xs font-semibold text-ink-muted underline-offset-2 hover:text-primary hover:underline">
              {applied ? "Reiniciar asistente" : "Continuar manualmente"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project form (create / edit) — renders inline in the main content area ────

interface FormData {
  titulo: string;
  descripcion: string;
  id_area_negocio: string;
  plazo_dias: string;
  usa_ia: boolean;
  skills: string[];
  tecnologias_extra: string[];
  publicar: boolean;
}

function ProjectFormContent({
  mode,
  project,
  catalogs,
  saving,
  onSave,
  onClose,
}: {
  mode: "create" | "edit";
  project: ApiProject | null;
  catalogs: { areas: CatalogArea[]; skills: CatalogSkill[] };
  saving: boolean;
  onSave: (data: CreateProjectInput | UpdateProjectInput) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>(() => ({
    titulo: project?.titulo ?? "",
    descripcion: project?.descripcion ?? "",
    id_area_negocio: project?.area?.id ?? "",
    plazo_dias: project ? String(project.plazo_dias) : "10",
    usa_ia: project?.usa_ia ?? false,
    skills: project?.skills.flatMap((s) => s.skill ? [s.skill.id] : []) ?? [],
    tecnologias_extra: project?.tecnologias_extra ?? [],
    publicar: true,
  }));
  const [otrosInput, setOtrosInput] = useState("");
  const [isSuggestingStack, setIsSuggestingStack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const techSkills = catalogs.skills.filter((s) => s.tipo === "tecnologia");

  function applyProposal(proposal: ProjectProposal) {
    setForm((prev) => ({
      ...prev,
      titulo: proposal.nombre || prev.titulo,
      descripcion: proposal.descripcion || proposal.objetivo || prev.descripcion,
      id_area_negocio:
        proposal.id_area_negocio && catalogs.areas.some((a) => a.id === proposal.id_area_negocio)
          ? proposal.id_area_negocio
          : prev.id_area_negocio,
      plazo_dias: proposal.plazo_dias ? String(proposal.plazo_dias) : prev.plazo_dias,
      usa_ia: proposal.usa_ia,
      skills: proposal.habilidades
        .map((h) => h.id)
        .filter((id) => techSkills.some((s) => s.id === id)),
    }));
  }

  async function handleSuggestStack() {
    if (isSuggestingStack) return;
    const descripcion = form.descripcion.trim();
    if (descripcion.length < 10) return;
    setIsSuggestingStack(true);
    const input: SuggestStackInput = { descripcion };
    if (form.titulo.trim()) input.titulo = form.titulo.trim();
    if (form.id_area_negocio) input.id_area_negocio = form.id_area_negocio;
    const result = await suggestStackAction(input);
    setIsSuggestingStack(false);
    if (result.ok) {
      const suggested = result.data.habilidades
        .map((h) => h.id)
        .filter((id) => techSkills.some((s) => s.id === id));
      setForm((prev) => ({ ...prev, skills: suggested }));
    }
  }

  function addOtraTecnologia() {
    const val = otrosInput.trim();
    if (!val || form.tecnologias_extra.includes(val)) return;
    setForm((prev) => ({ ...prev, tecnologias_extra: [...prev.tecnologias_extra, val] }));
    setOtrosInput("");
  }

  function removeOtraTecnologia(tech: string) {
    setForm((prev) => ({ ...prev, tecnologias_extra: prev.tecnologias_extra.filter((t) => t !== tech) }));
  }

  function toggleSkill(id: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }));
  }

  function handleSubmit() {
    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }
    if (!form.descripcion.trim()) { setError("La descripción es obligatoria"); return; }
    if (!form.id_area_negocio) { setError("Seleccioná un área de negocio"); return; }
    const plazo = parseInt(form.plazo_dias, 10);
    if (!plazo || plazo < 5 || plazo > 15) { setError("El plazo debe ser entre 5 y 15 días"); return; }
    setError(null);
    if (mode === "create") {
      onSave({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        id_area_negocio: form.id_area_negocio,
        plazo_dias: plazo,
        usa_ia: form.usa_ia,
        skills: form.skills,
        ...(form.tecnologias_extra.length > 0 ? { tecnologias_extra: form.tecnologias_extra } : {}),
        publicar: form.publicar,
      } satisfies CreateProjectInput);
    } else {
      onSave({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        id_area_negocio: form.id_area_negocio,
        plazo_dias: plazo,
        usa_ia: form.usa_ia,
        skills: form.skills,
        ...(form.tecnologias_extra.length > 0 ? { tecnologias_extra: form.tecnologias_extra } : {}),
      } satisfies UpdateProjectInput);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-canvas/95 px-6 py-4 backdrop-blur-sm">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          {mode === "create" ? "Nuevo proyecto" : "Editar proyecto"}
          <span className="text-primary" aria-hidden="true">.</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancelar"
          className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink-strong"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 px-6 py-6">

          {/* AI assistant — only on create */}
          {mode === "create" && <AiAssistant onApply={applyProposal} />}

          {mode === "create" && (
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                o completá manualmente
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-magenta/10 px-4 py-3 font-body text-sm font-semibold text-magenta">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="pf-titulo" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              Título
            </label>
            <input
              id="pf-titulo"
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              placeholder="Nombre del proyecto"
              className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="pf-desc" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              Descripción
            </label>
            <textarea
              id="pf-desc"
              rows={5}
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Describí el proyecto, objetivos y entregables esperados"
              className="min-h-28 w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="pf-area" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                Área de negocio
              </label>
              <select
                id="pf-area"
                value={form.id_area_negocio}
                onChange={(e) => setForm((p) => ({ ...p, id_area_negocio: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccioná un área</option>
                {catalogs.areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="pf-plazo" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                Plazo (5–15 días)
              </label>
              <input
                id="pf-plazo"
                type="number"
                min={5}
                max={15}
                value={form.plazo_dias}
                onChange={(e) => setForm((p) => ({ ...p, plazo_dias: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Skills */}
          {techSkills.length > 0 && (
            <fieldset className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Tecnologías requeridas
                </legend>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => void handleSuggestStack()}
                  disabled={isSuggestingStack || form.descripcion.trim().length < 10}
                  className="gap-1.5"
                >
                  {isSuggestingStack ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                  {isSuggestingStack ? "Sugiriendo..." : "Sugerir stack"}
                </Button>
              </div>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-surface-sunken p-3">
                {techSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-body text-xs font-semibold text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={form.skills.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="accent-primary"
                    />
                    {skill.nombre}
                  </label>
                ))}
              </div>

              {/* Tecnologías extra */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otrosInput}
                    onChange={(e) => setOtrosInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOtraTecnologia(); } }}
                    placeholder="Otra tecnología no listada..."
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addOtraTecnologia} disabled={!otrosInput.trim()}>
                    Agregar
                  </Button>
                </div>
                {form.tecnologias_extra.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tecnologias_extra.map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                        {tech}
                        <button type="button" onClick={() => removeOtraTecnologia(tech)} aria-label={`Quitar ${tech}`} className="rounded-full p-0.5 hover:bg-primary/20">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>
          )}

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.usa_ia}
                onChange={(e) => setForm((c) => ({ ...c, usa_ia: e.target.checked }))}
                className="accent-primary"
              />
              Usa inteligencia artificial
            </label>
            {mode === "create" && (
              <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.publicar}
                  onChange={(e) => setForm((c) => ({ ...c, publicar: e.target.checked }))}
                  className="accent-primary"
                />
                Publicar inmediatamente
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-canvas px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-full bg-primary px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {saving ? "Guardando..." : mode === "create" ? "Crear proyecto" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ── Unsaved changes dialog ────────────────────────────────────────────────────

function UnsavedChangesDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-strong/50 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cambios sin guardar"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-canvas p-6 shadow-[var(--shadow-elevated)]"
      >
        <h3 className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          Cambios sin guardar<span className="text-warning" aria-hidden="true">.</span>
        </h3>
        <p className="mt-1 font-body text-sm text-ink-muted">
          Si salís ahora, los cambios del formulario se van a perder. ¿Seguro que querés continuar?
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-warning px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/80"
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  projectTitle,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  projectTitle: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink-strong/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar eliminación"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-canvas p-6 shadow-[var(--shadow-elevated)]"
      >
        <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-magenta/10">
          <Trash2 className="size-5 text-magenta" aria-hidden="true" />
        </div>
        <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          Eliminar proyecto<span className="text-magenta" aria-hidden="true">.</span>
        </h3>
        <p className="mt-1 font-body text-sm text-ink-muted">
          ¿Seguro que querés eliminar <span className="font-semibold text-ink">{projectTitle}</span>? Esta acción no se puede deshacer.
        </p>
        {error && (
          <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-full bg-magenta px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/80 disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </>
  );
}

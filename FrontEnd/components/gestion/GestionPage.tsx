"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  GitBranch,
  Lock,
  MessageSquare,
  RotateCcw,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_OFFERS, MOCK_PROJECTS, MOCK_MARKETPLACE_PROJECTS } from "@/lib/mock-data";
import { MOCK_PROJECT_OFFERS, MOCK_PROCESO_ENTREGABLES } from "@/lib/mock-proceso";
import type {
  ApiRoleName,
  ApiProject,
  MyOffer,
  ProjectOffer,
  Entregable,
  OfferState,
  EntregableState,
} from "@/lib/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = "info" | "chat" | "proceso";

type ProposalStatus =
  | "nuevo" | "editando" | "enviada" | "revision"
  | "cambios" | "aceptada" | "noseleccionada";

type EmpresaStatus =
  | "enviada" | "revision" | "cambios" | "adjudicada" | "noseleccionada";

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

const ENTREGABLE_STATE: Record<EntregableState, { label: string; cls: string }> = {
  pendiente:   { label: "Pendiente",   cls: "bg-ink/5 text-ink-muted border-border" },
  enviado:     { label: "Enviado",     cls: "bg-primary/10 text-primary border-primary/20" },
  en_revision: { label: "En revisión", cls: "bg-warning/10 text-warning border-warning/20" },
  aprobado:    { label: "Aprobado",    cls: "bg-accent/10 text-accent border-accent/20" },
};

// Junior circle style per status
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

// Empresa circle style per status
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

// Junior proposal version badge per status
const JUNIOR_BADGE: Partial<Record<ProposalStatus, string>> = {
  enviada:        "bg-primary/10 text-primary border-primary/20",
  revision:       "bg-warning/10 text-warning border-warning/20",
  cambios:        "bg-magenta/10 text-magenta border-magenta/20",
  aceptada:       "bg-accent/10 text-accent border-accent/20",
  noseleccionada: "bg-ink-muted/10 text-ink-muted border-border",
};

// Empresa student/proposal badge per status
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
      name: `${offer.junior.nombre} ${offer.junior.apellido1 ?? ""}`.trim(),
      initials, date: dateStr,
      expanded: estado === "adjudicada",
      proposals,
    };
  });
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { role: ApiRoleName | null }

export function GestionPage({ role }: Props) {
  const t      = useTranslations("gestion_page");
  const locale = useLocale();
  const isEmpresa = role === "company";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection]       = useState<Section>("info");

  const selectedProject: ApiProject | null = isEmpresa
    ? (MOCK_PROJECTS.find((p) => p.id === selectedId) ?? null)
    : (MOCK_MARKETPLACE_PROJECTS.find((p) => p.id === selectedId) ?? null);

  const selectedOffer: MyOffer | null = isEmpresa
    ? null
    : (MOCK_OFFERS.find((o) => o.proyecto?.id === selectedId) ?? null);

  const projectOffers: ProjectOffer[] =
    isEmpresa && selectedId === "proj-1" ? MOCK_PROJECT_OFFERS : [];

  const selectedEntregables: Entregable[] = selectedId
    ? MOCK_PROCESO_ENTREGABLES.filter((e) => e.id_proyecto === selectedId)
    : [];

  const handleSelect = (id: string) => { setSelectedId(id); setSection("info"); };
  const handleBack   = () => setSelectedId(null);

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
                MOCK_PROJECTS.length === 0 ? <SidebarEmpty text={t("empty_empresa")} /> : (
                  <ul className="flex flex-col gap-0.5">
                    {MOCK_PROJECTS.map((proyecto) => {
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
                MOCK_OFFERS.length === 0 ? <SidebarEmpty text={t("empty_junior")} /> : (
                  <ul className="flex flex-col gap-0.5">
                    {MOCK_OFFERS.map((oferta) => {
                      const cfg = OFFER_STATE_CONFIG[oferta.estado.nombre];
                      return (
                        <li key={oferta.id}>
                          <button
                            onClick={() => oferta.proyecto?.id && handleSelect(oferta.proyecto.id)}
                            disabled={!oferta.proyecto?.id}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10 disabled:opacity-50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-heading text-sm font-bold text-white">
                                {oferta.proyecto?.titulo ?? "Proyecto eliminado"}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5 font-body text-xs text-white/60">
                                <span className={cn("size-2 shrink-0 rounded-full", cfg.dot)} aria-hidden="true" />
                                {cfg.label}
                              </p>
                            </div>
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
            {section === "info"    && <InfoPanel project={selectedProject} locale={locale} t={t} />}
            {section === "chat"    && <ChatPanel isEmpresa={isEmpresa} t={t} />}
            {section === "proceso" && (
              <ProcesoPanel
                isEmpresa={isEmpresa}
                offer={selectedOffer}
                entregables={selectedEntregables}
                projectOffers={projectOffers}
                project={selectedProject}
                locale={locale}
                t={t}
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
    <div className="mx-auto max-w-2xl px-6 py-8 md:px-8">
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

function ChatPanel({ isEmpresa, t }: { isEmpresa: boolean; t: T }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <MessageSquare className="size-8 text-primary" aria-hidden="true" />
      </div>
      <h3 className="mb-2 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
        {t("chat_coming_soon_title")}
      </h3>
      <p className="max-w-xs font-body text-sm leading-relaxed text-ink-muted">
        {isEmpresa ? t("chat_coming_soon_desc_empresa") : t("chat_coming_soon_desc_junior")}
      </p>
    </div>
  );
}

// ── Proceso panel router ──────────────────────────────────────────────────────

function ProcesoPanel({
  isEmpresa, offer, entregables, projectOffers, project, locale, t,
}: {
  isEmpresa: boolean;
  offer: MyOffer | null;
  entregables: Entregable[];
  projectOffers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
  if (isEmpresa) return <EmpresaProcesoView offers={projectOffers} project={project} locale={locale} t={t} />;
  return <JuniorProcesoView offer={offer} project={project} entregables={entregables} locale={locale} t={t} />;
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
  offer, project, entregables, locale, t,
}: {
  offer: MyOffer | null;
  project: ApiProject | null;
  entregables: Entregable[];
  locale: string;
  t: T;
}) {
  const [proposals, setProposals] = useState<JuniorProposal[]>(
    () => initJuniorProposals(offer, project),
  );
  const [closed, setClosed] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const patch = (i: number, p: Partial<JuniorProposal>) =>
    setProposals((prev) => prev.map((x, idx) => idx === i ? { ...x, ...p } : x));

  const startCreate = (i: number) => patch(i, { status: "editando", expanded: true });
  const toggle      = (i: number) => { const c = proposals[i]; if (c) patch(i, { expanded: !c.expanded }); };
  const setField    = (i: number, k: keyof JuniorProposal, v: string) => patch(i, { [k]: v } as Partial<JuniorProposal>);

  const submit = (i: number) => {
    const p = proposals[i];
    if (!p?.desc.trim()) return;
    patch(i, { status: "enviada", expanded: false });
  };

  const lastReviewIdx = () => {
    for (let i = proposals.length - 1; i >= 0; i--) {
      const p = proposals[i];
      if (p && (p.status === "enviada" || p.status === "revision")) return i;
    }
    return -1;
  };

  const simRevision = () => {
    const i = lastReviewIdx();
    const p = i >= 0 ? proposals[i] : undefined;
    if (!p || p.status !== "enviada") return;
    patch(i, { status: "revision" });
  };

  const simCambios = () => {
    const i = lastReviewIdx();
    const p = i >= 0 ? proposals[i] : undefined;
    if (!p) return;
    const obs = project?.id ? (MOCK_OBS[project.id] ?? "") : "";
    const next = blankProposal(p.v + 1);
    setProposals((prev) => {
      const arr = prev.map((x, idx) =>
        idx === i ? { ...x, status: "cambios" as ProposalStatus, expanded: true, observaciones: obs } : x,
      );
      if (i === arr.length - 1) arr.push(next);
      return arr;
    });
  };

  const simAceptar = () => {
    const i = lastReviewIdx();
    if (i < 0) return;
    setProposals((prev) =>
      prev
        .map((x, idx) => idx === i ? { ...x, status: "aceptada" as ProposalStatus } : x)
        .filter((x, idx) => idx <= i || x.status !== "nuevo"),
    );
    setClosed(true);
  };

  const resetDemo = () => {
    setProposals(initJuniorProposals(offer, project));
    setClosed(false);
  };

  // ── Current status badge ─────────────────────────────────────────────────
  const latest  = proposals[proposals.length - 1];
  const hasSent = proposals.some((p) =>
    !["nuevo", "editando"].includes(p.status),
  );
  const isNew = !latest || latest.status === "nuevo" || latest.status === "editando";

  let bannerLabel = t("proceso_badge_pendiente");
  let bannerBadge = "bg-ink/5 text-ink-muted border-border";
  if (!isNew) {
    const badgeCfg: Record<string, { label: string; badge: string }> = {
      enviada:        { label: t("proceso_badge_enviada"),   badge: "bg-primary/10 text-primary border-primary/20" },
      revision:       { label: t("proceso_badge_revision"),  badge: "bg-warning/10 text-warning border-warning/20" },
      cambios:        { label: t("proceso_badge_cambios"),   badge: "bg-magenta/10 text-magenta border-magenta/20" },
      aceptada:       { label: t("proceso_badge_aceptada"),  badge: "bg-accent/10 text-accent border-accent/20" },
      noseleccionada: { label: t("proceso_badge_nosel"),     badge: "bg-ink-muted/10 text-ink-muted border-border" },
    };
    const bc = latest ? badgeCfg[latest.status] : undefined;
    if (bc) { bannerLabel = bc.label; bannerBadge = bc.badge; }
  } else if (hasSent) {
    bannerLabel = t("proceso_badge_esperando");
  }

  const ri        = lastReviewIdx();
  const reviewing = ri >= 0;
  const rp        = ri >= 0 ? proposals[ri] : undefined;
  const canReview = reviewing && rp?.status === "enviada";

  // ── Placeholder caption for next version ────────────────────────────────
  const lastReal = proposals[proposals.length - 1];
  let lockCaption = t("proceso_placeholder_nuevo");
  if (lastReal?.status === "enviada" || lastReal?.status === "revision") {
    lockCaption = t("proceso_placeholder_revision");
  } else if (lastReal?.status === "cambios") {
    lockCaption = t("proceso_placeholder_cambios");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:px-8">

      {/* Estado actual */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("proceso_state_label")}
        </p>
        <div className="mt-3.5">
          <span className={cn("inline-flex items-center rounded-full border px-4 py-1.5 font-body text-sm font-bold", bannerBadge)}>
            {bannerLabel}
          </span>
        </div>
      </div>

      {/* Propuestas */}
      <div className="rounded-2xl border border-border bg-surface p-7">
        <p className="mb-6 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("proceso_propuestas_label")}
        </p>

        {proposals.map((p, i) => {
          const c    = juniorCircle(p.status);
          const isSent = ["enviada","revision","cambios","aceptada","noseleccionada"].includes(p.status);
          const isEditing = p.status === "editando";
          const showBadge = !!JUNIOR_BADGE[p.status];
          const submitOk  = p.desc.trim().length > 0;

          return (
            <div key={p.v} className="flex gap-[18px]">
              {/* Circle + line */}
              <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
                <div
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-full",
                    c.bg,
                  )}
                  aria-hidden="true"
                >
                  {c.icon}
                </div>
                {(i < proposals.length - 1 || !closed) && (
                  <div
                    className="mt-2 w-0.5 flex-1 rounded-sm bg-border"
                    style={{ minHeight: 20 }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-7">
                {/* Header row */}
                <div className="flex min-h-[32px] items-center justify-between gap-3">
                  <div
                    onClick={() => { if (isSent) toggle(i); }}
                    className={cn("flex items-center gap-2", isSent ? "cursor-pointer" : "cursor-default")}
                  >
                    <span className="font-heading text-base font-bold text-ink-strong">
                      {t("proceso_propuesta_n", { n: p.v })}
                    </span>
                    {isSent && (
                      <ChevronDown
                        className={cn("size-3.5 text-ink-muted transition-transform duration-[var(--duration-fast)]", p.expanded && "rotate-180")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {p.status === "nuevo" && (
                      <button
                        onClick={() => startCreate(i)}
                        className="rounded-[10px] border border-border bg-surface px-[18px] py-2.5 font-body text-sm font-semibold text-ink transition-colors duration-[var(--duration-fast)] hover:border-secondary hover:text-secondary"
                      >
                        {t("proceso_crear_propuesta")}
                      </button>
                    )}
                    {showBadge && (
                      <span className={cn("inline-flex items-center rounded-full border px-[15px] py-1.5 font-body text-sm font-bold whitespace-nowrap", JUNIOR_BADGE[p.status])}>
                        {bannerLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="mt-[18px]">
                    <label className="mb-2 block font-body text-sm font-bold text-ink">
                      {t("description_label")}
                    </label>
                    <textarea
                      placeholder={t("proceso_desc_placeholder")}
                      value={p.desc}
                      onChange={(e) => setField(i, "desc", e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-xl border border-border bg-surface p-3.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />

                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                      {t("proceso_doc_label")}
                    </label>
                    <div className="flex gap-3">
                      <input
                        placeholder={t("proceso_link_placeholder")}
                        value={p.link}
                        onChange={(e) => setField(i, "link", e.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3.5 py-3 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface px-[18px] py-3 font-body text-sm font-semibold text-ink transition-colors hover:border-secondary hover:text-secondary">
                        <Upload className="size-4" aria-hidden="true" />
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

                    <div className="my-6 h-px bg-border" />

                    <p className="font-body text-sm font-bold text-ink">{t("proceso_recursos_titulo")}</p>
                    <p className="mb-4 mt-1 font-body text-sm text-ink-muted">{t("proceso_recursos_subtitulo")}</p>

                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "130px 1fr" }}>
                      <label className="self-center font-body text-sm font-semibold text-ink">{t("proceso_recursos_nombre")}</label>
                      <input value={p.previewName} onChange={(e) => setField(i, "previewName", e.target.value)}
                        className="rounded-[10px] border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                      <label className="self-center font-body text-sm font-semibold text-ink">{t("proceso_recursos_proyecto")}</label>
                      <input value={p.previewProject} onChange={(e) => setField(i, "previewProject", e.target.value)}
                        className="rounded-[10px] border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                      <label className="self-center font-body text-sm font-semibold text-ink leading-snug">{t("proceso_recursos_repo")}</label>
                      <input value={p.repo} onChange={(e) => setField(i, "repo", e.target.value)}
                        className="rounded-[10px] border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => submit(i)}
                        disabled={!submitOk}
                        className={cn(
                          "rounded-xl bg-secondary px-6 py-3 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)]",
                          submitOk ? "hover:bg-secondary/80" : "opacity-50 cursor-not-allowed",
                        )}
                      >
                        {t("proceso_subir_propuesta")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sent / read-only body */}
                {isSent && p.expanded && (
                  <div className="mt-[18px]">
                    <label className="mb-2 block font-body text-sm font-bold text-ink">
                      {t("description_label")}
                    </label>
                    <div className="rounded-xl border border-border bg-canvas p-4 font-body text-sm leading-relaxed text-ink">
                      {p.desc}
                    </div>

                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                      {t("proceso_doc_label")}
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[200px] flex-1 truncate rounded-xl border border-border bg-canvas px-4 py-3 font-body text-sm text-primary">
                        {p.link || t("proceso_sin_enlace")}
                      </div>
                      {p.fileName && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-sm font-semibold text-ink">
                          <FileText className="size-4 text-magenta" aria-hidden="true" />
                          {p.fileName}
                        </div>
                      )}
                    </div>

                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                      {t("proceso_previsualizacion_label")}
                    </label>
                    {(p.link || p.repo) && (
                      <LinkPreview
                        href={p.repo || p.link}
                        title={p.previewName}
                        area={p.previewProject || undefined}
                        excerpt={p.desc}
                      />
                    )}

                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                      {t("proceso_observaciones_label")}
                    </label>
                    <div
                      className={cn(
                        "rounded-xl border p-4 font-body text-sm leading-relaxed",
                        p.observaciones
                          ? "border-warning/30 bg-warning/5 text-ink"
                          : "border-border bg-canvas text-ink-muted",
                      )}
                    >
                      {p.observaciones || t("proceso_observaciones_empty")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Placeholder next version */}
        {!closed && (
          <div className="flex gap-[18px] opacity-50">
            <div style={{ width: 32, flexShrink: 0, paddingTop: 2 }}>
              <div className="flex size-[30px] items-center justify-center rounded-full border-2 border-dashed border-border bg-transparent">
                <Lock className="size-3.5 text-ink-muted" aria-hidden="true" />
              </div>
            </div>
            <div className="min-w-0 flex-1 py-1">
              <p className="font-heading text-base font-bold text-ink-muted">
                {t("proceso_propuesta_n", { n: proposals.length + 1 })}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 font-body text-sm text-ink-muted">
                <Lock className="size-3 shrink-0" aria-hidden="true" />
                {lockCaption}
              </div>
            </div>
          </div>
        )}

        {/* Closed banner */}
        {closed && (
          <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/10 p-4 font-body text-sm font-semibold text-accent">
            <CheckCircle2 className="size-[18px] shrink-0" aria-hidden="true" />
            {t("proceso_cerrado")}
          </div>
        )}
      </div>

      {/* Entregables when aceptada */}
      {closed && entregables.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t("proceso_entregables_label")}
          </p>
          <ul className="flex flex-col gap-3">
            {entregables.map((ent) => {
              const si = ENTREGABLE_STATE[ent.estado.nombre];
              return (
                <li key={ent.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className={cn("rounded-full border px-2.5 py-0.5 font-body text-xs font-bold", si.cls)}>{si.label}</span>
                  <span className="flex-1 font-body text-sm font-semibold text-ink">
                    {ent.tipo === "parcial" ? "Entrega parcial" : "Entrega final"} v{ent.version}
                  </span>
                  {ent.url && (
                    <a href={ent.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline">
                      <ExternalLink className="size-3" aria-hidden="true" />
                      Ver
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Demo bar */}
      {!closed && (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-[18px]">
          <p className="font-body text-xs font-extrabold uppercase tracking-widest text-secondary/70">
            {t("proceso_demo_titulo")}
          </p>
          <p className="mt-1.5 font-body text-sm text-ink-muted">{t("proceso_demo_desc")}</p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <button
              onClick={simRevision}
              disabled={!canReview}
              className={cn(
                "rounded-[10px] border border-border bg-surface px-4 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary",
                !canReview && "opacity-45 cursor-not-allowed",
              )}
            >
              {t("proceso_accion_revision")}
            </button>
            <button
              onClick={simCambios}
              disabled={!reviewing}
              className={cn(
                "rounded-[10px] border border-warning/40 bg-surface px-4 py-2.5 font-body text-sm font-semibold text-warning transition-colors hover:bg-warning/5",
                !reviewing && "opacity-45 cursor-not-allowed",
              )}
            >
              {t("proceso_accion_cambios")}
            </button>
            <button
              onClick={simAceptar}
              disabled={!reviewing}
              className={cn(
                "rounded-[10px] border border-accent/40 bg-surface px-4 py-2.5 font-body text-sm font-semibold text-accent transition-colors hover:bg-accent/5",
                !reviewing && "opacity-45 cursor-not-allowed",
              )}
            >
              {t("proceso_demo_aceptar")}
            </button>
            <button
              onClick={resetDemo}
              className="ml-auto rounded-[10px] border-none bg-transparent px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              <RotateCcw className="mr-1.5 inline size-3.5" aria-hidden="true" />
              {t("proceso_demo_reiniciar")}
            </button>
          </div>
        </div>
      )}
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

  // Overall status per student (adjudicada > rest)
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
                                {/* Description */}
                                <label className="mb-2 block font-body text-sm font-bold text-ink">
                                  {t("description_label")}
                                </label>
                                <div className="rounded-xl border border-border bg-canvas p-4 font-body text-sm leading-relaxed text-ink">
                                  {p.desc}
                                </div>

                                {/* Link preview */}
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

                                {/* Review comments */}
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

                                {/* Status buttons */}
                                <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                  {t("proceso_estado_version")}
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                  <button onClick={() => setStatus(s.id, p.v, "enviada")}        className={btnCls("enviada")}>        {t("proceso_badge_enviada")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "revision")}       className={btnCls("revision")}>       {t("proceso_badge_revision")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "cambios")}        className={btnCls("cambios")}>        {t("proceso_accion_cambios")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "adjudicada")}     className={btnCls("adjudicada")}>     {t("proceso_accion_adjudicar")}</button>
                                  <button onClick={() => setStatus(s.id, p.v, "noseleccionada")} className={btnCls("noseleccionada")}> {t("proceso_accion_rechazar")}</button>
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

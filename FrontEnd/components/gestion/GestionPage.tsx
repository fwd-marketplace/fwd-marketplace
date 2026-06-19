"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
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

// Simulated empresa observations per project (mock only)
const MOCK_OBSERVACIONES: Record<string, string> = {
  "proj-1": "La propuesta es muy sólida. Sin embargo, necesitamos más detalle en el cronograma de entregas y confirmar la compatibilidad con la API de pagos actual. Ajustá el alcance de la primera fase y reenvía una nueva versión.",
};

// ── Circle helpers ─────────────────────────────────────────────────────────────

function getCircleClasses(estado: OfferState): { bg: string; icon: ReactNode } {
  switch (estado) {
    case "enviada":
      return {
        bg: "border-2 border-primary/40 bg-transparent",
        icon: <span className="font-heading text-xs font-bold text-primary">1</span>,
      };
    case "en_revision":
      return {
        bg: "bg-warning",
        icon: <Clock className="size-4 text-white" aria-hidden="true" />,
      };
    case "adjudicada":
      return {
        bg: "bg-accent",
        icon: <CheckCircle2 className="size-4 text-white" aria-hidden="true" />,
      };
    case "no_seleccionada":
      return {
        bg: "bg-ink-muted/50",
        icon: <X className="size-4 text-white" aria-hidden="true" />,
      };
  }
}

function getCircleClassesSmall(estado: OfferState): { bg: string; icon: ReactNode } {
  switch (estado) {
    case "enviada":
      return {
        bg: "border-2 border-primary/40 bg-transparent",
        icon: null,
      };
    case "en_revision":
      return {
        bg: "bg-warning",
        icon: <Clock className="size-3.5 text-white" aria-hidden="true" />,
      };
    case "adjudicada":
      return {
        bg: "bg-accent",
        icon: <CheckCircle2 className="size-3.5 text-white" aria-hidden="true" />,
      };
    case "no_seleccionada":
      return {
        bg: "bg-border",
        icon: <X className="size-3.5 text-ink-muted" aria-hidden="true" />,
      };
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  role: ApiRoleName | null;
}

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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSection("info");
  };

  const handleBack = () => setSelectedId(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
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
                MOCK_PROJECTS.length === 0 ? (
                  <SidebarEmpty text={t("empty_empresa")} />
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {MOCK_PROJECTS.map((proyecto) => {
                      const count  = proyecto.id === "proj-1" ? MOCK_PROJECT_OFFERS.length : 0;
                      const hasAdj = proyecto.id === "proj-1"
                        && MOCK_PROJECT_OFFERS.some((o) => o.estado.nombre === "adjudicada");
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
                              <p className="mt-0.5 font-body text-xs text-white/50">
                                {t("proposals_count", { count })}
                              </p>
                            </div>
                            {hasAdj && (
                              <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                            )}
                            <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : (
                MOCK_OFFERS.length === 0 ? (
                  <SidebarEmpty text={t("empty_junior")} />
                ) : (
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
                {selectedProject?.titulo ?? ""}
                <span className="text-highlight" aria-hidden="true">.</span>
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
                const label = key === "info"
                  ? t("section_info")
                  : key === "chat"
                    ? t("section_chat")
                    : t("section_proceso");
                return (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      section === key
                        ? "bg-white/15 text-white"
                        : "text-white/55 hover:bg-white/10 hover:text-white",
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

      {/* ── Content area ────────────────────────────────────────────────── */}
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
            {/* Mobile back bar */}
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

// ── Shared helpers ─────────────────────────────────────────────────────────────

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

// ── Info panel ─────────────────────────────────────────────────────────────────

function InfoPanel({
  project,
  locale,
  t,
}: {
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
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
          <p className="mt-1 font-body text-sm text-ink-muted">
            {project.empresa.nombre_comercial}
          </p>
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
            {new Date(project.fecha_publicacion).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
            })}
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
        <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("description_label")}
        </p>
        <p className="font-body text-base leading-relaxed text-ink">{project.descripcion}</p>
      </div>

      {skills.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t("skills_label")}
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map(({ skill }) => (
              <span
                key={skill!.id}
                className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary"
              >
                {skill!.nombre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat panel ─────────────────────────────────────────────────────────────────

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

// ── Proceso panel (router) ─────────────────────────────────────────────────────

function ProcesoPanel({
  isEmpresa,
  offer,
  entregables,
  projectOffers,
  project,
  locale,
  t,
}: {
  isEmpresa: boolean;
  offer: MyOffer | null;
  entregables: Entregable[];
  projectOffers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
  if (isEmpresa) {
    return <EmpresaProcesoView offers={projectOffers} project={project} locale={locale} t={t} />;
  }
  return <JuniorProcesoView offer={offer} project={project} entregables={entregables} locale={locale} t={t} />;
}

// ── Link preview — browser mockup ──────────────────────────────────────────────

function LinkPreview({
  href,
  title,
  area,
  excerpt,
}: {
  href: string;
  title: string;
  area?: string | undefined;
  excerpt?: string | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-magenta" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-warning" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-accent"  aria-hidden="true" />
        <div className="ml-1 flex-1 truncate rounded-md border border-border bg-canvas px-3 py-1 font-body text-xs text-ink-muted">
          {href}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-3" aria-hidden="true" />
          Abrir
        </a>
      </div>
      {/* Preview content */}
      <div className="min-h-36 bg-gradient-to-b from-canvas to-surface px-7 py-6">
        <p className="font-heading text-xl font-extrabold tracking-tight text-ink-strong line-clamp-1">
          {title}
        </p>
        {area && (
          <span className="mt-2 inline-block rounded-full bg-secondary/10 px-3 py-1 font-body text-xs font-semibold text-secondary">
            {area}
          </span>
        )}
        {excerpt && (
          <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted line-clamp-3">
            {excerpt}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Junior proceso view ────────────────────────────────────────────────────────

function JuniorProcesoView({
  offer,
  project,
  entregables,
  locale,
  t,
}: {
  offer: MyOffer | null;
  project: ApiProject | null;
  entregables: Entregable[];
  locale: string;
  t: T;
}) {
  const [expandedV, setExpandedV] = useState<number>(1);

  if (!offer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <FolderOpen className="mb-3 size-12 text-ink-muted/30" aria-hidden="true" />
        <p className="font-body text-base text-ink-muted">{t("proceso_no_offer")}</p>
      </div>
    );
  }

  const estado        = offer.estado.nombre;
  const cfg           = OFFER_STATE_CONFIG[estado];
  const isAdj         = estado === "adjudicada";
  const isRejected    = estado === "no_seleccionada";
  const isFinal       = isAdj || isRejected;
  const observaciones = project?.id ? (MOCK_OBSERVACIONES[project.id] ?? "") : "";
  const circle        = getCircleClasses(estado);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:px-8">

      {/* Estado actual banner */}
      <div
        className={cn(
          "mb-6 flex items-center gap-4 rounded-2xl border p-5",
          isAdj      && "border-accent/30 bg-accent/5",
          isRejected && "border-magenta/20 bg-magenta/5",
          !isAdj && !isRejected && "border-border bg-surface",
        )}
      >
        {isAdj && <CheckCircle2 className="size-6 shrink-0 text-accent" aria-hidden="true" />}
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t("proceso_state_label")}
          </p>
          <span className={cn(
            "mt-1.5 inline-block rounded-full border px-3 py-1 font-body text-sm font-bold",
            cfg.badge,
          )}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Propuestas stepper */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("proceso_propuestas_label")}
        </p>

        <ol className="flex flex-col" role="list">

          {/* Version 1 — actual submitted offer */}
          <li className="flex gap-4">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setExpandedV(expandedV === 1 ? 0 : 1)}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--duration-fast)]",
                  circle.bg,
                )}
                aria-label={t("proceso_propuesta_n", { n: 1 })}
              >
                {circle.icon}
              </button>
              {!isFinal && (
                <div
                  className="my-1 w-0.5 flex-1 bg-border"
                  style={{ minHeight: "3rem" }}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className={cn("min-w-0 flex-1", !isFinal && "pb-3")}>
              {/* Version header row */}
              <button
                onClick={() => setExpandedV(expandedV === 1 ? 0 : 1)}
                className="flex w-full items-center gap-2 text-left"
              >
                <span className="font-heading text-base font-bold text-ink-strong">
                  {t("proceso_propuesta_n", { n: 1 })}
                </span>
                <span className="font-body text-xs text-ink-muted">
                  · {new Date(offer.fecha_envio).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <ChevronDown
                  className={cn(
                    "ml-auto size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)]",
                    expandedV === 1 && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              <span className={cn(
                "mt-1.5 inline-block rounded-full border px-2.5 py-0.5 font-body text-xs font-bold",
                cfg.badge,
              )}>
                {cfg.label}
              </span>

              {/* Version detail */}
              {expandedV === 1 && (
                <div className="mt-4 flex flex-col gap-4">

                  {/* Description */}
                  <div className="rounded-xl border border-border bg-canvas p-4">
                    <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t("description_label")}
                    </p>
                    <p className="font-body text-sm leading-relaxed text-ink">
                      {offer.propuesta}
                    </p>
                  </div>

                  {/* Link preview */}
                  {offer.prototipo_url && (
                    <div>
                      <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                        {t("proceso_documentacion_label")}
                      </p>
                      <LinkPreview
                        href={offer.prototipo_url}
                        title={project?.titulo ?? t("proceso_propuesta_n", { n: 1 })}
                        area={project?.area?.nombre}
                        excerpt={offer.propuesta}
                      />
                    </div>
                  )}

                  {/* Observaciones */}
                  <div
                    className={cn(
                      "rounded-xl border p-4",
                      observaciones
                        ? "border-warning/30 bg-warning/5"
                        : "border-border bg-canvas",
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {observaciones && (
                        <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden="true" />
                      )}
                      <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                        {t("proceso_observaciones_label")}
                      </p>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-ink">
                      {observaciones || t("proceso_observaciones_empty")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </li>

          {/* Placeholder version 2 — shown when not in final state */}
          {!isFinal && (
            <li className="flex gap-4 opacity-50">
              <div className="flex flex-col items-center pt-0.5">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-transparent"
                  aria-hidden="true"
                >
                  <Lock className="size-3.5 text-ink-muted" />
                </div>
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="font-heading text-base font-bold text-ink-muted">
                  {t("proceso_propuesta_n", { n: 2 })}
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-ink-muted">
                  {t("proceso_propuesta_placeholder")}
                </p>
              </div>
            </li>
          )}
        </ol>
      </div>

      {/* Entregables — only when adjudicada */}
      {isAdj && entregables.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t("proceso_entregables_label")}
          </p>
          <ul className="flex flex-col gap-3">
            {entregables.map((ent) => {
              const stateInfo = ENTREGABLE_STATE[ent.estado.nombre];
              return (
                <li
                  key={ent.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span className={cn("rounded-full border px-2.5 py-0.5 font-body text-xs font-bold", stateInfo.cls)}>
                    {stateInfo.label}
                  </span>
                  <span className="flex-1 font-body text-sm font-semibold text-ink">
                    {ent.tipo === "parcial" ? "Entrega parcial" : "Entrega final"} v{ent.version}
                  </span>
                  {ent.url && (
                    <a
                      href={ent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
                    >
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
    </div>
  );
}

// ── Empresa proceso view ───────────────────────────────────────────────────────

function EmpresaProcesoView({
  offers,
  project,
  locale,
  t,
}: {
  offers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [localStates, setLocalStates]             = useState<Record<string, OfferState>>({});
  const [comments, setComments]                   = useState<Record<string, string>>({});

  const sorted = [...offers].sort((a, b) => {
    const ORDER: Record<OfferState, number> = {
      adjudicada: 0, en_revision: 1, enviada: 2, no_seleccionada: 3,
    };
    return ORDER[a.estado.nombre] - ORDER[b.estado.nombre];
  });

  const toggleStudent = (id: string) => {
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
      setExpandedVersionId(null);
    } else {
      setExpandedStudentId(id);
      setExpandedVersionId(null);
    }
  };

  const toggleVersion = (key: string) => {
    setExpandedVersionId(expandedVersionId === key ? null : key);
  };

  const changeState = (offerId: string, newState: OfferState) => {
    setLocalStates((prev) => ({ ...prev, [offerId]: newState }));
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border px-6 py-5 md:px-8">
        <p className="mb-0.5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("empresa_proposals_label")}
        </p>
        <p className="font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
          {offers.length} {offers.length === 1 ? "propuesta" : "propuestas"}
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <FolderOpen className="size-12 text-ink-muted/30" aria-hidden="true" />
          <p className="font-body text-base text-ink-muted">{t("empresa_proposals_empty")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((oferta) => {
            const effectiveState = localStates[oferta.id] ?? oferta.estado.nombre;
            const cfg            = OFFER_STATE_CONFIG[effectiveState];
            const isAdj          = effectiveState === "adjudicada";
            const isRejected     = effectiveState === "no_seleccionada";
            const isExpanded     = expandedStudentId === oferta.id;
            const versionKey     = `${oferta.id}-0`;
            const isVExpanded    = expandedVersionId === versionKey;
            const initials       = (
              (oferta.junior.nombre[0] ?? "") + (oferta.junior.apellido1?.[0] ?? "")
            ).toUpperCase();
            const circle         = getCircleClassesSmall(effectiveState);

            return (
              <li
                key={oferta.id}
                className={cn(
                  "transition-opacity duration-[var(--duration-fast)]",
                  isRejected && !isExpanded && "opacity-50",
                )}
              >
                {/* Student row */}
                <button
                  onClick={() => toggleStudent(oferta.id)}
                  className={cn(
                    "flex w-full items-center gap-4 px-6 py-4 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] md:px-8",
                    isAdj ? "bg-accent/5 hover:bg-accent/8" : "hover:bg-surface",
                  )}
                >
                  {/* Avatar initials */}
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-extrabold",
                      isAdj ? "bg-accent text-white" : "bg-primary/15 text-primary",
                    )}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-base font-bold text-ink-strong">
                        {oferta.junior.nombre} {oferta.junior.apellido1}
                      </p>
                      <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-body text-xs text-ink-muted">
                        1 {t("proceso_version_singular")}
                      </span>
                    </div>
                    <p className="mt-0.5 font-body text-xs text-ink-muted">
                      {new Date(oferta.fecha_envio).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>

                  <span className={cn(
                    "hidden rounded-full border px-3 py-1 font-body text-xs font-bold sm:inline-block",
                    cfg.badge,
                  )}>
                    {cfg.label}
                  </span>

                  {isAdj && (
                    <CheckCircle2 className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  )}

                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)]",
                      isExpanded && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* Expanded — version sub-stepper */}
                {isExpanded && (
                  <div className="border-t border-border bg-canvas px-6 pb-8 pt-5 md:px-10">
                    <p className="mb-5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t("proceso_propuestas_label")}
                    </p>

                    <ol className="flex flex-col" role="list">
                      <li className="flex gap-4">
                        {/* Circle */}
                        <div className="flex flex-col items-center pt-0.5">
                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-full",
                              circle.bg,
                            )}
                            aria-hidden="true"
                          >
                            {circle.icon}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Version header */}
                          <button
                            onClick={() => toggleVersion(versionKey)}
                            className="flex w-full items-center gap-2 text-left"
                          >
                            <span className="font-heading text-sm font-bold text-ink-strong">
                              {t("proceso_propuesta_n", { n: 1 })}
                            </span>
                            <span className="font-body text-xs text-ink-muted">
                              · {new Date(oferta.fecha_envio).toLocaleDateString(locale, {
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                            <ChevronDown
                              className={cn(
                                "ml-auto size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)]",
                                isVExpanded && "rotate-180",
                              )}
                              aria-hidden="true"
                            />
                          </button>

                          {/* Mobile badge */}
                          <span className={cn(
                            "mt-1.5 inline-block rounded-full border px-2.5 py-0.5 font-body text-xs font-bold sm:hidden",
                            cfg.badge,
                          )}>
                            {cfg.label}
                          </span>

                          {/* Version detail */}
                          {isVExpanded && (
                            <div className="mt-4 flex flex-col gap-4">

                              {/* Description */}
                              <div className="rounded-xl border border-border bg-surface p-4">
                                <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                                  {t("description_label")}
                                </p>
                                <p className="font-body text-sm leading-relaxed text-ink">
                                  {oferta.propuesta}
                                </p>
                              </div>

                              {/* Link preview */}
                              {oferta.prototipo_url && (
                                <LinkPreview
                                  href={oferta.prototipo_url}
                                  title={project?.titulo ?? t("proceso_propuesta_n", { n: 1 })}
                                  area={project?.area?.nombre}
                                  excerpt={oferta.propuesta}
                                />
                              )}

                              {/* Review comments */}
                              <div>
                                <label
                                  htmlFor={`comentario-${oferta.id}`}
                                  className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                                >
                                  {t("proceso_comentario_label")}
                                </label>
                                <textarea
                                  id={`comentario-${oferta.id}`}
                                  rows={3}
                                  value={comments[oferta.id] ?? ""}
                                  onChange={(e) =>
                                    setComments((prev) => ({ ...prev, [oferta.id]: e.target.value }))
                                  }
                                  placeholder={t("proceso_comentario_placeholder")}
                                  className="w-full resize-none rounded-xl border border-border bg-surface p-3 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex flex-wrap gap-2">
                                {effectiveState === "enviada" && (
                                  <button
                                    onClick={() => changeState(oferta.id, "en_revision")}
                                    className="rounded-full bg-primary px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-primary/80"
                                  >
                                    {t("proceso_accion_revision")}
                                  </button>
                                )}
                                {effectiveState === "en_revision" && (
                                  <>
                                    <button
                                      onClick={() => changeState(oferta.id, "adjudicada")}
                                      className="rounded-full bg-accent px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-accent/80"
                                    >
                                      {t("proceso_accion_adjudicar")}
                                    </button>
                                    <button
                                      onClick={() => changeState(oferta.id, "enviada")}
                                      className="rounded-full bg-warning px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-warning/80"
                                    >
                                      {t("proceso_accion_cambios")}
                                    </button>
                                    <button
                                      onClick={() => changeState(oferta.id, "no_seleccionada")}
                                      className="rounded-full border border-magenta/30 bg-transparent px-4 py-2 font-body text-sm font-bold text-magenta transition-colors duration-[var(--duration-fast)] hover:bg-magenta/5"
                                    >
                                      {t("proceso_accion_rechazar")}
                                    </button>
                                  </>
                                )}
                                {(effectiveState === "adjudicada" || effectiveState === "no_seleccionada") && (
                                  <span className={cn(
                                    "rounded-full border px-4 py-2 font-body text-sm font-bold",
                                    cfg.badge,
                                  )}>
                                    {cfg.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

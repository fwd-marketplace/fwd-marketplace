"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Filter, FolderOpen, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightSection } from "@/components/ui/insight-section";
import { StatusPill } from "@/components/ui/status-pill";
import {
  changeProjectStateAction,
  decideOfferAction,
  getProjectOffersAction,
} from "@/lib/actions/marketplace";
import { formatDateLabel } from "@/lib/api/safe-json";
import type { ApiProject, CompanyProjectState, ProjectOffer, ProjectState } from "@/lib/api/types";

type TabType = "project" | "applications" | "mockups";

const COMPANY_STATES: CompanyProjectState[] = [
  "en_recepcion",
  "en_evaluacion",
  "adjudicado",
  "en_desarrollo",
  "cerrado",
];

function statusVariant(state: ProjectState) {
  if (state === "en_recepcion" || state === "en_desarrollo") return "new-talent";
  if (state === "cerrado" || state === "cancelado") return "magenta";
  if (state === "borrador") return "secondary";
  return "warning";
}

function offerVariant(state: ProjectOffer["estado"]["nombre"]) {
  if (state === "adjudicada") return "success";
  if (state === "no_seleccionada") return "magenta";
  if (state === "en_revision") return "warning";
  return "secondary";
}

export function MisProyectos({ initialProjects }: { initialProjects: ApiProject[] }) {
  const t = useTranslations("mis_proyectos");
  const locale = useLocale();
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjects[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<TabType>("project");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectState | "all">("all");
  const [offersByProject, setOffersByProject] = useState<Record<string, ProjectOffer[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedOffers = selectedProjectId ? offersByProject[selectedProjectId] ?? [] : [];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.titulo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.estado.nombre === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  function triggerToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  }

  function loadOffers(projectId: string) {
    startTransition(async () => {
      const result = await getProjectOffersAction(projectId);
      if (result.ok) {
        setOffersByProject((current) => ({ ...current, [projectId]: result.data.ofertas }));
      } else {
        triggerToast(result.error);
      }
    });
  }

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab("project");
    if (!offersByProject[projectId]) {
      loadOffers(projectId);
    }
  }

  function updateProjectState(projectId: string, estado: CompanyProjectState) {
    startTransition(async () => {
      const result = await changeProjectStateAction(projectId, estado);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId ? { ...project, estado: { ...project.estado, nombre: estado } } : project,
        ),
      );
      triggerToast(t("notifications.state_updated"));
    });
  }

  function decideOffer(offerId: string, accion: "aceptar" | "rechazar") {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, accion);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) {
        loadOffers(selectedProjectId);
      }
      triggerToast(accion === "aceptar" ? t("notifications.accepted") : t("notifications.rejected"));
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-8 pb-16">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]">
          <CheckCircle2 className="size-5 text-accent" />
          <p className="font-body text-sm font-semibold text-ink-strong">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-full p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink-strong"
            aria-label={t("toast_close")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Filter className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-ink-strong">
              {t("filters.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <label htmlFor="project-search" className="sr-only">
                {t("filters.search_label")}
              </label>
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="project-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("filters.search_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken py-2 pl-10 pr-4 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="project-status-filter" className="sr-only">
                {t("filters.status_label")}
              </label>
              <select
                id="project-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ProjectState | "all")}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.status_all")}</option>
                {(["borrador", ...COMPANY_STATES, "cancelado"] as ProjectState[]).map((state) => (
                  <option key={state} value={state}>
                    {t(`states.${state}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={clearFilters} className="h-8 text-xs">
                {t("filters.clear")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => openProject(project.id)}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 text-left shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <StatusPill
                    label={t(`states.${project.estado.nombre}`)}
                    variant={statusVariant(project.estado.nombre)}
                  />
                  <span className="font-body text-xs font-medium text-ink-muted">
                    {formatDateLabel(project.fecha_publicacion, locale)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-ink-strong transition-colors duration-[var(--duration-fast)] group-hover:text-primary">
                    {project.titulo}
                    <span className="text-primary" aria-hidden="true">.</span>
                  </h3>
                  <p className="line-clamp-3 font-body text-sm leading-relaxed text-ink-muted">
                    {project.descripcion}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.skills.slice(0, 4).map(({ skill }) =>
                    skill ? (
                      <span
                        key={skill.id}
                        className="rounded-lg bg-primary/10 px-2 py-0.5 font-body text-[10px] font-semibold text-primary"
                      >
                        {skill.nombre}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                  <Users className="size-4 text-secondary" />
                  <span>{offersByProject[project.id]?.length ?? 0} {t("tabs.applications")}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-primary transition-transform duration-[var(--duration-fast)] group-hover:translate-x-1">
                  {t("filters.view_details")}
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <FolderOpen className="mb-4 size-12 text-ink-muted" />
          <h3 className="mb-1 font-heading text-lg font-bold text-ink-strong">
            {t("filters.empty_title")}
          </h3>
          <p className="max-w-md font-body text-sm text-ink-muted">
            {t("filters.empty_desc")}
          </p>
        </div>
      )}

      {selectedProject && (
        <InsightSection title={selectedProject.titulo}>
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-2">
                <StatusPill
                  label={t(`states.${selectedProject.estado.nombre}`)}
                  variant={statusVariant(selectedProject.estado.nombre)}
                />
                <p className="font-body text-sm leading-relaxed text-ink-muted">
                  {selectedProject.descripcion}
                </p>
              </div>

              <div className="w-full md:w-64">
                <label htmlFor="project-state" className="mb-1 block font-body text-xs font-bold uppercase text-ink-muted">
                  {t("state_label")}
                </label>
                <select
                  id="project-state"
                  value={
                    COMPANY_STATES.includes(selectedProject.estado.nombre as CompanyProjectState)
                      ? selectedProject.estado.nombre
                      : "en_recepcion"
                  }
                  disabled={isPending || selectedProject.estado.nombre === "borrador" || selectedProject.estado.nombre === "cancelado"}
                  onChange={(event) =>
                    updateProjectState(selectedProject.id, event.target.value as CompanyProjectState)
                  }
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                >
                  {COMPANY_STATES.map((state) => (
                    <option key={state} value={state}>
                      {t(`states.${state}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="flex gap-6">
                {(["project", "applications", "mockups"] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "applications") loadOffers(selectedProject.id);
                    }}
                    className={`relative pb-3 font-body text-sm font-bold transition-colors ${
                      activeTab === tab ? "text-primary" : "text-ink-muted hover:text-ink-strong"
                    }`}
                  >
                    {t(`tabs.${tab}`)}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "project" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface-sunken p-4">
                  <p className="font-body text-xs font-bold uppercase text-ink-muted">{t("area_label")}</p>
                  <p className="mt-1 font-body text-sm font-semibold text-ink-strong">
                    {selectedProject.area?.nombre ?? t("two_point_zero")}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-sunken p-4">
                  <p className="font-body text-xs font-bold uppercase text-ink-muted">{t("deadline_label")}</p>
                  <p className="mt-1 font-body text-sm font-semibold text-ink-strong">
                    {selectedProject.plazo_dias} {t("days")}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-sunken p-4">
                  <p className="font-body text-xs font-bold uppercase text-ink-muted">{t("ai_label")}</p>
                  <p className="mt-1 font-body text-sm font-semibold text-ink-strong">
                    {selectedProject.usa_ia ? t("yes") : t("no")}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-3">
                {selectedOffers.length > 0 ? (
                  selectedOffers.map((offer) => {
                    const juniorName = [offer.junior.nombre, offer.junior.apellido1].filter(Boolean).join(" ");
                    return (
                      <div key={offer.id} className="rounded-xl border border-border bg-surface-sunken p-4">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-heading text-base font-bold text-ink-strong">{juniorName}</p>
                              <StatusPill
                                label={t(`offer_states.${offer.estado.nombre}`)}
                                variant={offerVariant(offer.estado.nombre)}
                              />
                            </div>
                            <p className="font-body text-sm leading-relaxed text-ink-muted">{offer.propuesta}</p>
                            {offer.prototipo_url && (
                              <a
                                href={offer.prototipo_url}
                                className="font-body text-xs font-bold text-primary hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {t("prototype_link")}
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="accent"
                              disabled={isPending || offer.estado.nombre === "adjudicada"}
                              onClick={() => decideOffer(offer.id, "aceptar")}
                            >
                              {t("applications.accept")}
                            </Button>
                            <Button
                              size="sm"
                              variant="magenta"
                              disabled={isPending || offer.estado.nombre === "no_seleccionada"}
                              onClick={() => decideOffer(offer.id, "rechazar")}
                            >
                              {t("applications.reject")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-8 text-center font-body text-sm text-ink-muted">
                    {isPending ? t("loading") : t("applications_empty")}
                  </p>
                )}
              </div>
            )}

            {activeTab === "mockups" && (
              <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-8 text-center font-body text-sm text-ink-muted">
                {t("two_point_zero_placeholder")}
              </p>
            )}
          </div>
        </InsightSection>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Building2, CheckCircle2, FolderKanban, Plus, Send, Sparkles, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { StatusPill } from "@/components/ui/status-pill";
import {
  createProjectAction,
  decideOfferAction,
  getProjectOffersAction,
  changeProjectStateAction,
} from "@/lib/actions/marketplace";
import type { ApiMeProfile, ApiProject, CatalogArea, CatalogSkill, ProjectOffer, CompanyProjectState } from "@/lib/api/types";

type NewProjectForm = {
  titulo: string;
  descripcion: string;
  id_area_negocio: string;
  plazo_dias: number;
  usa_ia: boolean;
  skills: string[];
  publicar: boolean;
};

const DEFAULT_DEADLINE_DAYS = 10;

function offerVariant(state: ProjectOffer["estado"]["nombre"]) {
  if (state === "adjudicada") return "success";
  if (state === "no_seleccionada") return "magenta";
  if (state === "en_revision") return "warning";
  return "secondary";
}

function buildEmptyForm(areas: CatalogArea[]): NewProjectForm {
  return {
    titulo: "",
    descripcion: "",
    id_area_negocio: areas[0]?.id ?? "",
    plazo_dias: DEFAULT_DEADLINE_DAYS,
    usa_ia: false,
    skills: [],
    publicar: true,
  };
}

export function PerfilEmpresa({
  initialProfile,
  initialProjects,
  areas,
  skills,
}: {
  initialProfile: ApiMeProfile | null;
  initialProjects: ApiProject[];
  areas: CatalogArea[];
  skills: CatalogSkill[];
}) {
  const t = useTranslations("empresa_dashboard");
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id ?? "");
  const [offersByProject, setOffersByProject] = useState<Record<string, ProjectOffer[]>>({});
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [form, setForm] = useState<NewProjectForm>(() => buildEmptyForm(areas));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedOffers = selectedProjectId ? offersByProject[selectedProjectId] ?? [] : [];

  const stats = useMemo(() => {
    const activeCount = projects.filter((project) => project.estado.nombre !== "cerrado").length;
    const receivedCount = Object.values(offersByProject).reduce((total, offers) => total + offers.length, 0);
    const decidedCount = Object.values(offersByProject).reduce(
      (total, offers) =>
        total + offers.filter((offer) => offer.estado.nombre === "adjudicada" || offer.estado.nombre === "no_seleccionada").length,
      0,
    );

    return { activeCount, receivedCount, decidedCount };
  }, [projects, offersByProject]);

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

  function selectProject(projectId: string) {
    setSelectedProjectId(projectId);
    if (!offersByProject[projectId]) {
      loadOffers(projectId);
    }
  }

  function closeModal() {
    setIsNewProjectModalOpen(false);
    setForm(buildEmptyForm(areas));
  }

  function toggleSkill(skillId: string) {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skillId)
        ? current.skills.filter((id) => id !== skillId)
        : [...current.skills, skillId],
    }));
  }

  function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createProjectAction(form);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }

      const createdProject = result.data;
      setProjects((current) => [createdProject, ...current]);
      setSelectedProjectId(createdProject.id);
      triggerToast(t("new_project_modal.success_message"));
      closeModal();
    });
  }

  function decideOffer(offerId: string, accion: "aceptar" | "rechazar") {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, accion);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) loadOffers(selectedProjectId);
      triggerToast(accion === "aceptar" ? t("notifications.accepted_short") : t("notifications.rejected_short"));
    });
  }

  function changeState(projectId: string, estado: CompanyProjectState) {
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
      // Actualizar el selectedProject si es necesario
      triggerToast(t("notifications.state_changed") || "Estado actualizado");
    });
  }

  return (
    <div className="space-y-8 pb-16">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)]">
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

      <section className="relative overflow-hidden rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-[var(--shadow-soft)] md:p-10">
        <FwdGeoBackdrop />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-secondary-foreground/20 bg-secondary-foreground/10">
                <Building2 className="size-8 text-highlight" />
              </div>
              <div className="space-y-2">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/70">
                  {t("label_empresa")}
                </span>
                <h1 className="font-heading text-2xl font-bold uppercase leading-none tracking-tight md:text-4xl">
                  {initialProfile?.nombre ?? t("title")}
                  <span className="text-primary" aria-hidden="true">.</span>
                </h1>
                <p className="max-w-2xl font-body text-sm leading-relaxed text-secondary-foreground/80">
                  {initialProfile?.correo ?? t("company_desc")}
                </p>
              </div>
            </div>
            <Button variant="highlight" onClick={() => setIsNewProjectModalOpen(true)}>
              <Plus className="size-4" />
              {t("projects.new_btn")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/70">
                {t("stats.active_projects")}
              </span>
              <p className="mt-3 font-heading text-3xl font-extrabold">{stats.activeCount}</p>
            </div>
            <div className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/70">
                {t("stats.applications")}
              </span>
              <p className="mt-3 font-heading text-3xl font-extrabold">{stats.receivedCount}</p>
            </div>
            <div className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/70">
                {t("stats.reviewed")}
              </span>
              <p className="mt-3 font-heading text-3xl font-extrabold">{stats.decidedCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
              {t("projects.title")}
              <span className="text-primary">.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map((project) => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectProject(project.id)}
                    className={`w-full rounded-2xl border bg-surface p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="font-heading text-base font-bold leading-snug text-ink-strong">
                          {project.titulo}
                        </h3>
                        <StatusPill label={t(`states.${project.estado.nombre}`)} />
                      </div>
                      <span className="font-heading text-lg font-bold text-ink-strong">
                        {offersByProject[project.id]?.length ?? 0}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <FolderKanban className="mx-auto mb-3 size-8 text-ink-subtle" />
                <p className="font-body text-sm font-semibold text-ink-muted">{t("projects.empty")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
              {t("applications.title")}
              <span className="text-primary">.</span>
            </h2>
            <p className="font-body text-xs text-ink-muted">{t("compatibility.placeholder_2_0")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between border-b border-border p-5 gap-4">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <h3 className="font-heading text-lg font-bold text-ink-strong">
                  {selectedProject?.titulo ?? t("applications.no_project")}
                </h3>
              </div>
              {selectedProject && (
                <div className="flex items-center gap-2">
                  <label htmlFor="project-state-select" className="sr-only">Estado del proyecto</label>
                  <select
                    id="project-state-select"
                    value={selectedProject.estado.nombre}
                    onChange={(e) => changeState(selectedProject.id, e.target.value as CompanyProjectState)}
                    disabled={isPending || selectedProject.estado.nombre === "cancelado"}
                    className="rounded-lg border border-border bg-surface-sunken px-3 py-1.5 font-body text-xs font-medium text-ink-strong focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="borrador" disabled>Borrador</option>
                    <option value="en_recepcion">{t("states.en_recepcion")}</option>
                    <option value="en_evaluacion">{t("states.en_evaluacion")}</option>
                    <option value="adjudicado">{t("states.adjudicado")}</option>
                    <option value="en_desarrollo">{t("states.en_desarrollo")}</option>
                    <option value="cerrado">{t("states.cerrado")}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3 p-5">
              {selectedProject && !offersByProject[selectedProject.id] && (
                <Button variant="outline" onClick={() => loadOffers(selectedProject.id)} disabled={isPending}>
                  <Send className="size-4" />
                  {t("applications.load")}
                </Button>
              )}

              {selectedOffers.length > 0 ? (
                selectedOffers.map((offer) => {
                  const juniorName = [offer.junior.nombre, offer.junior.apellido1].filter(Boolean).join(" ");
                  return (
                    <div key={offer.id} className="rounded-xl border border-border bg-surface-sunken p-4">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-base font-bold text-ink-strong">{juniorName}</p>
                            <StatusPill label={t(`offer_states.${offer.estado.nombre}`)} variant={offerVariant(offer.estado.nombre)} />
                          </div>
                          <p className="font-body text-sm leading-relaxed text-ink-muted">{offer.propuesta}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="accent"
                            disabled={isPending || offer.estado.nombre === "adjudicada"}
                            onClick={() => decideOffer(offer.id, "aceptar")}
                          >
                            {t("applications.actions.accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="magenta"
                            disabled={isPending || offer.estado.nombre === "no_seleccionada"}
                            onClick={() => decideOffer(offer.id, "rechazar")}
                          >
                            {t("applications.actions.reject")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-8 text-center font-body text-sm text-ink-muted">
                  {selectedProject ? t("applications.empty_state") : t("applications.no_project")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              <p className="font-body text-sm font-semibold text-ink-muted">{t("compatibility.placeholder_2_0")}</p>
            </div>
          </div>
        </section>
      </div>

      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold text-ink-strong">
                {t("new_project_modal.title")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
                aria-label={t("new_project_modal.cancel")}
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={submitProject} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label htmlFor="project-title" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("new_project_modal.name_label")}
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="project-description" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("new_project_modal.description_label")}
                </label>
                <textarea
                  id="project-description"
                  required
                  value={form.descripcion}
                  onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="project-area" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t("new_project_modal.area_label")}
                  </label>
                  <select
                    id="project-area"
                    required
                    value={form.id_area_negocio}
                    onChange={(event) => setForm((current) => ({ ...current, id_area_negocio: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="project-deadline" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t("new_project_modal.deadline_label")}
                  </label>
                  <input
                    id="project-deadline"
                    type="number"
                    min={5}
                    max={15}
                    required
                    value={form.plazo_dias}
                    onChange={(event) => setForm((current) => ({ ...current, plazo_dias: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("new_project_modal.skills_label")}
                </legend>
                <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-surface-sunken p-3">
                  {skills.map((skill) => (
                    <label key={skill.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-body text-xs font-semibold text-ink">
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
              </fieldset>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 font-body text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={form.usa_ia}
                    onChange={(event) => setForm((current) => ({ ...current, usa_ia: event.target.checked }))}
                    className="accent-primary"
                  />
                  {t("new_project_modal.ai_label")}
                </label>
                <label className="inline-flex items-center gap-2 font-body text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={form.publicar}
                    onChange={(event) => setForm((current) => ({ ...current, publicar: event.target.checked }))}
                    className="accent-primary"
                  />
                  {t("new_project_modal.publish_label")}
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  {t("new_project_modal.cancel")}
                </Button>
                <Button type="submit" disabled={isPending || areas.length === 0}>
                  {t("new_project_modal.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

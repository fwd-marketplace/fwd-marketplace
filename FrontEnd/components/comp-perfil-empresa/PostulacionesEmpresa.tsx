"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, FolderKanban, Send, UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { decideOfferAction, getProjectOffersAction } from "@/lib/actions/marketplace";
import type { ApiProject, ProjectOffer } from "@/lib/api/types";

function offerVariant(state: ProjectOffer["estado"]["nombre"]) {
  if (state === "adjudicada") return "success";
  if (state === "no_seleccionada") return "magenta";
  if (state === "en_revision") return "warning";
  return "secondary";
}

export function PostulacionesEmpresa({ initialProjects }: { initialProjects: ApiProject[] }) {
  const t = useTranslations("postulaciones_empresa");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id ?? "");
  const [offersByProject, setOffersByProject] = useState<Record<string, ProjectOffer[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProject = initialProjects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedOffers = selectedProjectId ? offersByProject[selectedProjectId] ?? [] : [];

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

  function decideOffer(offerId: string, accion: "aceptar" | "rechazar") {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, accion);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) loadOffers(selectedProjectId);
      triggerToast(accion === "aceptar" ? t("toast_accepted_short") : t("toast_rejected_short"));
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

      <div className="space-y-0.5">
        <p className="font-body text-[11px] font-bold uppercase tracking-wider text-primary">
          {t("title")}
        </p>
        <h1 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
          {t("subtitle")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-4">
          {initialProjects.length > 0 ? (
            initialProjects.map((project) => {
              const isActive = project.id === selectedProjectId;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project.id)}
                  className={`w-full rounded-2xl border bg-surface p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-border-strong"
                  }`}
                >
                  <h2 className="font-heading text-base font-bold text-ink-strong">{project.titulo}</h2>
                  <p className="mt-1 line-clamp-2 font-body text-xs text-ink-muted">{project.descripcion}</p>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <FolderKanban className="mx-auto mb-3 size-8 text-ink-subtle" />
              <p className="font-body text-sm font-semibold text-ink-muted">{t("empty_projects")}</p>
            </div>
          )}
        </aside>

        <section className="space-y-4 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("actions_header")}
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold text-ink-strong">
                  {selectedProject?.titulo ?? t("no_project")}
                </h2>
              </div>
              {selectedProject && !offersByProject[selectedProject.id] && (
                <Button variant="outline" onClick={() => loadOffers(selectedProject.id)} disabled={isPending}>
                  <Send className="size-4" />
                  {t("load_applications")}
                </Button>
              )}
            </div>

            <div className="space-y-3 pt-4">
              {selectedOffers.length > 0 ? (
                selectedOffers.map((offer) => {
                  const juniorName = [offer.junior.nombre, offer.junior.apellido1].filter(Boolean).join(" ");
                  return (
                    <article key={offer.id} className="rounded-xl border border-border bg-surface-sunken p-4">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-heading text-base font-bold text-ink-strong">{juniorName}</h3>
                            <StatusPill label={t(`offer_states.${offer.estado.nombre}`)} variant={offerVariant(offer.estado.nombre)} />
                          </div>
                          <p className="font-body text-sm leading-relaxed text-ink-muted">{offer.propuesta}</p>
                          {offer.prototipo_url && (
                            <a
                              href={offer.prototipo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-body text-xs font-bold text-primary hover:underline"
                            >
                              {t("prototype_link")}
                            </a>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => decideOffer(offer.id, "aceptar")}
                            disabled={isPending || offer.estado.nombre === "adjudicada"}
                          >
                            <UserCheck className="size-4" />
                            {t("accept_btn")}
                          </Button>
                          <Button
                            size="sm"
                            variant="magenta"
                            onClick={() => decideOffer(offer.id, "rechazar")}
                            disabled={isPending || offer.estado.nombre === "no_seleccionada"}
                          >
                            <UserX className="size-4" />
                            {t("reject_btn")}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-8 text-center font-body text-sm text-ink-muted">
                  {selectedProject ? t("empty_applications") : t("no_project")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

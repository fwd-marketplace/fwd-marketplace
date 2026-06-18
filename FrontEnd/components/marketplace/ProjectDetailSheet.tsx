"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitOfferAction } from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";
import type { ApiProject, ApiRoleName } from "@/lib/api/types";

const offerSchema = z.object({
  propuesta: z.string().min(50).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal(""), z.undefined()]),
  documentacion_tecnica: z.string().max(3000).optional(),
  documentacion_url: z.union([z.string().url(), z.literal(""), z.undefined()]),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface Props {
  project: ApiProject | null;
  isOpen: boolean;
  onClose: () => void;
  role: ApiRoleName | null;
  showApplyForm: boolean;
  isLoading?: boolean;
  alreadyApplied?: boolean;
  isProjectExpired?: boolean;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-sunken",
        className,
      )}
    />
  );
}

export function ProjectDetailSheet({
  project,
  isOpen,
  onClose,
  role,
  showApplyForm,
  isLoading = false,
  alreadyApplied = false,
  isProjectExpired = false,
}: Props) {
  const t = useTranslations("project_detail");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setSubmitError("");
        reset();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const skills = project?.skills.flatMap((s) => (s.skill ? [s.skill] : [])) ?? [];

  async function onSubmit(data: OfferFormValues) {
    if (!project) return;
    setSubmitError("");
    const input: Parameters<typeof submitOfferAction>[1] = {
      propuesta: data.propuesta,
      ...(data.prototipo_url ? { prototipo_url: data.prototipo_url } : {}),
      ...(data.documentacion_tecnica ? { documentacion_tecnica: data.documentacion_tecnica } : {}),
      ...(data.documentacion_url ? { documentacion_url: data.documentacion_url } : {}),
    };
    const result = await submitOfferAction(project.id, input);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink-strong/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel — desliza desde la derecha */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={project?.titulo ?? "Detalle del proyecto"}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col overflow-y-auto bg-canvas shadow-[var(--shadow-elevated)]"
      >
        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-canvas/95 px-6 py-4 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            {project?.area && (
              <p className="mb-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-primary">
                {project.area.nombre}
              </p>
            )}
            <h2 className="truncate font-heading text-xl font-extrabold tracking-tight text-ink-strong">
              {isLoading ? (
                <SkeletonBlock className="h-6 w-48" />
              ) : (
                <>
                  {project?.titulo ?? "Cargando..."}
                  {project && <span className="text-primary" aria-hidden="true">.</span>}
                </>
              )}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {project && (
              <Link
                href={`/${locale}/marketplace/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-body text-xs font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/30 hover:text-primary"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Ver página
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel"
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken hover:text-ink-strong"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 space-y-5 px-6 py-6 pb-10">
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-32 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
          ) : project ? (
            <>
              {/* ── Meta chips ── */}
              <div className="flex flex-wrap gap-2">
                {project.empresa && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink-muted">
                    <Building2 className="size-3.5" aria-hidden="true" />
                    {project.empresa.nombre_comercial}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {project.plazo_dias} días
                </span>
                {project.fecha_publicacion && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink-muted">
                    <Calendar className="size-3.5" aria-hidden="true" />
                    {new Date(project.fecha_publicacion).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {project.usa_ia && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 font-body text-xs font-semibold text-accent">
                    <Zap className="size-3.5" aria-hidden="true" />
                    Usa IA
                  </span>
                )}
                {isProjectExpired && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta/10 px-3 py-1.5 font-body text-xs font-semibold text-magenta">
                    <Lock className="size-3.5" aria-hidden="true" />
                    {t("offer_expired_chip")}
                  </span>
                )}
              </div>

              {/* ── Descripción ── */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Descripción
                </h3>
                <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink">
                  {project.descripcion}
                </p>
              </div>

              {/* ── Skills ── */}
              {skills.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t("skills_required")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary"
                      >
                        {skill.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Plazo vencido ── */}
              {role === "student" && showApplyForm && isProjectExpired && (
                <div className="rounded-2xl border border-magenta/30 bg-magenta/5 p-5">
                  <p className="flex items-center gap-2 font-body font-semibold text-magenta">
                    <Clock className="size-5 shrink-0" aria-hidden="true" />
                    {t("offer_expired")}
                  </p>
                </div>
              )}

              {/* ── Ya postulaste ── */}
              {role === "student" && showApplyForm && !isProjectExpired && alreadyApplied && !submitted && (
                <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
                  <p className="flex items-center gap-2 font-body font-semibold text-accent">
                    <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                    {t("offer_already_sent")}
                  </p>
                </div>
              )}

              {/* ── Formulario de postulación (solo estudiantes) ── */}
              {role === "student" && showApplyForm && !submitted && !alreadyApplied && !isProjectExpired && (
                <div className="rounded-2xl border border-primary/20 bg-surface p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="mb-1 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
                    {t("offer_title")}
                    <span className="text-primary" aria-hidden="true">.</span>
                  </h3>
                  <p className="mb-5 font-body text-sm text-ink-muted">
                    {t("offer_subtitle")}
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="sheet-propuesta"
                        className="font-body text-xs font-semibold text-ink-muted"
                      >
                        {t("offer_propuesta_label")}
                      </label>
                      <textarea
                        id="sheet-propuesta"
                        rows={5}
                        placeholder={t("offer_propuesta_placeholder")}
                        {...register("propuesta")}
                        aria-invalid={!!errors.propuesta}
                        className="w-full resize-none rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.propuesta && (
                        <p className="font-body text-xs text-magenta">
                          {t("offer_propuesta_min")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="sheet-prototipo"
                        className="font-body text-xs font-semibold text-ink-muted"
                      >
                        {t("offer_prototipo_label")}
                      </label>
                      <input
                        id="sheet-prototipo"
                        type="url"
                        placeholder={t("offer_prototipo_placeholder")}
                        {...register("prototipo_url")}
                        aria-invalid={!!errors.prototipo_url}
                        className="w-full rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.prototipo_url && (
                        <p className="font-body text-xs text-magenta">
                          {t("offer_prototipo_invalid")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="sheet-doc-tecnica"
                        className="font-body text-xs font-semibold text-ink-muted"
                      >
                        {t("offer_documentacion_tecnica_label")}
                      </label>
                      <textarea
                        id="sheet-doc-tecnica"
                        rows={3}
                        placeholder={t("offer_documentacion_tecnica_placeholder")}
                        {...register("documentacion_tecnica")}
                        className="w-full resize-none rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="sheet-doc-url"
                        className="font-body text-xs font-semibold text-ink-muted"
                      >
                        {t("offer_documentacion_url_label")}
                      </label>
                      <input
                        id="sheet-doc-url"
                        type="url"
                        placeholder={t("offer_documentacion_url_placeholder")}
                        {...register("documentacion_url")}
                        aria-invalid={!!errors.documentacion_url}
                        className="w-full rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.documentacion_url && (
                        <p className="font-body text-xs text-magenta">
                          {t("offer_documentacion_url_invalid")}
                        </p>
                      )}
                    </div>

                    {submitError && (
                      <p className="font-body text-sm text-magenta">
                        {t("offer_error_generic")}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="self-start rounded-full bg-primary px-6 font-semibold text-white hover:bg-secondary"
                    >
                      {isSubmitting ? t("offer_submitting") : t("offer_submit")}
                    </Button>
                  </form>
                </div>
              )}

              {/* ── Postulación enviada ── */}
              {role === "student" && showApplyForm && submitted && (
                <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
                  <p className="flex items-center gap-2 font-body font-semibold text-accent">
                    <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                    {t("offer_success")}
                  </p>
                </div>
              )}

              {/* ── Banner empresa (si entra una empresa) ── */}
              {role === "company" && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="font-heading text-lg font-bold text-ink-strong">
                    {t("owner_banner_title")}
                  </p>
                  <p className="mt-1 font-body text-sm text-ink-muted">
                    {t("owner_banner_desc")}
                  </p>
                  <Link
                    href={`/${locale}/postulaciones`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary"
                  >
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                    {t("owner_banner_cta")}
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}

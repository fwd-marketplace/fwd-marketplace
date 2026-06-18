"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitOfferAction } from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";
import type { ApiProject, ApiRoleName, ProjectState } from "@/lib/api/types";

const offerSchema = z.object({
  propuesta: z.string().min(50).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal(""), z.undefined()]),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface Props {
  project: ApiProject;
  role: ApiRoleName | null;
}

const STATE_LABELS: Record<ProjectState, string> = {
  borrador:       "Borrador",
  en_recepcion:   "Recibiendo propuestas",
  en_evaluacion:  "En evaluación",
  adjudicado:     "Adjudicado",
  en_desarrollo:  "En desarrollo",
  cerrado:        "Cerrado",
  cancelado:      "Cancelado",
};

const STATE_CLASS: Partial<Record<ProjectState, string>> = {
  en_recepcion:  "bg-accent/10 text-accent border-accent/20",
  en_evaluacion: "bg-warning/10 text-warning border-warning/20",
  adjudicado:    "bg-primary/10 text-primary border-primary/20",
  cerrado:       "bg-ink-muted/10 text-ink-muted border-border",
  cancelado:     "bg-magenta/10 text-magenta border-magenta/20",
};

function ApplyForm({ project }: { project: ApiProject }) {
  const t = useTranslations("project_detail");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });

  const onSubmit = async (data: OfferFormValues) => {
    setSubmitError("");
    const input = { propuesta: data.propuesta };
    const result = await submitOfferAction(
      project.id,
      data.prototipo_url ? { ...input, prototipo_url: data.prototipo_url } : input,
    );
    if (result.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle2 className="size-5 text-accent" aria-hidden="true" />
          </div>
          <h3 className="font-heading text-lg font-bold text-accent">
            {t("offer_success")}
          </h3>
        </div>
        <p className="font-body text-sm text-ink-muted">
          La empresa revisará tu propuesta y te contactará si avanzas en el proceso.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-surface p-6 shadow-[var(--shadow-soft)]">
      <h3 className="mb-1 font-heading text-xl font-extrabold tracking-tight text-ink-strong">
        {t("offer_title")}
        <span className="text-primary" aria-hidden="true">.</span>
      </h3>
      <p className="mb-5 font-body text-sm text-ink-muted">{t("offer_subtitle")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="propuesta"
            className="font-body text-xs font-semibold text-ink-muted"
          >
            {t("offer_propuesta_label")}
          </label>
          <textarea
            id="propuesta"
            rows={7}
            placeholder={t("offer_propuesta_placeholder")}
            {...register("propuesta")}
            aria-invalid={!!errors.propuesta}
            className="w-full resize-none rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
          {errors.propuesta && (
            <p className="font-body text-xs text-magenta">
              {errors.propuesta.type === "too_small"
                ? t("offer_propuesta_min")
                : t("offer_propuesta_required")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="prototipo_url"
            className="font-body text-xs font-semibold text-ink-muted"
          >
            {t("offer_prototipo_label")}
          </label>
          <input
            id="prototipo_url"
            type="url"
            placeholder={t("offer_prototipo_placeholder")}
            {...register("prototipo_url")}
            aria-invalid={!!errors.prototipo_url}
            className="w-full rounded-2xl bg-surface-sunken px-4 py-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
          {errors.prototipo_url && (
            <p className="font-body text-xs text-magenta">{t("offer_prototipo_invalid")}</p>
          )}
        </div>

        {submitError && (
          <p className="font-body text-sm text-magenta">{t("offer_error_generic")}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-6 font-semibold text-white hover:bg-secondary"
        >
          {isSubmitting ? t("offer_submitting") : t("offer_submit")}
        </Button>
      </form>
    </div>
  );
}

export function ProjectDetail({ project, role }: Props) {
  const t = useTranslations("project_detail");
  const locale = useLocale();

  const skills = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));
  const stateLabel = STATE_LABELS[project.estado.nombre] ?? project.estado.nombre.replace(/_/g, " ");
  const stateClass = STATE_CLASS[project.estado.nombre] ?? "bg-ink-muted/10 text-ink-muted border-border";

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Back ── */}
        <Link
          href={`/${locale}/marketplace`}
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm font-semibold text-ink-muted shadow-[var(--shadow-soft)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("back")}
        </Link>

        {/* ── Hero card ── */}
        <div className="mb-8 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
          {/* Chips de estado */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 font-body text-xs font-bold",
                stateClass,
              )}
            >
              {stateLabel}
            </span>
            {project.area && (
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 font-body text-xs font-bold text-secondary">
                {project.area.nombre}
              </span>
            )}
            {project.usa_ia && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 font-body text-xs font-bold text-accent">
                <Zap className="size-3.5" aria-hidden="true" />
                {t("uses_ia")}
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong sm:text-4xl lg:text-5xl">
            {project.titulo}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>

          {/* Empresa */}
          {project.empresa && (
            <p className="mt-3 flex items-center gap-1.5 font-body text-sm font-medium text-ink-muted">
              <Building2 className="size-4 shrink-0" aria-hidden="true" />
              {project.empresa.nombre_comercial}
              {project.empresa.tipo === "emprendedor" && (
                <span className="ml-1 rounded-full bg-highlight/20 px-2 py-0.5 font-body text-[10px] font-bold text-highlight-foreground">
                  Emprendedor
                </span>
              )}
            </p>
          )}

          {/* Meta chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3 py-1.5 font-body text-xs font-semibold text-ink-muted">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("duration", { days: project.plazo_dias })}
            </span>
            {project.fecha_publicacion && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3 py-1.5 font-body text-xs font-semibold text-ink-muted">
                <Calendar className="size-3.5" aria-hidden="true" />
                {t("posted_on")}{" "}
                {new Date(project.fecha_publicacion).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {project.fecha_cierre && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/5 px-3 py-1.5 font-body text-xs font-semibold text-warning">
                Cierra el{" "}
                {new Date(project.fecha_cierre).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>
        </div>

        {/* ── Contenido + sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Columna principal ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Descripción */}
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
              <h2 className="mb-4 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                Descripción del proyecto
              </h2>
              <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink">
                {project.descripcion}
              </p>
            </section>

            {/* Skills */}
            {skills.length > 0 && (
              <section className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                <h2 className="mb-4 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("skills_required")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full bg-primary/10 px-3 py-1.5 font-body text-xs font-semibold text-primary"
                    >
                      {skill.nombre}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Qué busca la empresa (guía para la propuesta) */}
            <section className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6">
              <h2 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-secondary">
                Antes de postular
              </h2>
              <ul className="space-y-2 font-body text-sm text-ink-muted">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 size-4 shrink-0 rounded-full bg-secondary/20 text-center text-[10px] font-bold leading-4 text-secondary">1</span>
                  Leé la descripción completa del proyecto y asegurate de tener las habilidades requeridas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 size-4 shrink-0 rounded-full bg-secondary/20 text-center text-[10px] font-bold leading-4 text-secondary">2</span>
                  Escribí una propuesta clara: explicá tu enfoque, herramientas que usarías y por qué sos la persona ideal.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 size-4 shrink-0 rounded-full bg-secondary/20 text-center text-[10px] font-bold leading-4 text-secondary">3</span>
                  Si ya tenés un prototipo o referencia, incluí el enlace — marca la diferencia.
                </li>
              </ul>
            </section>
          </div>

          {/* ── Sidebar de acción ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Formulario (estudiante) */}
              {role === "student" && <ApplyForm project={project} />}

              {/* Banner empresa */}
              {role === "company" && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <p className="mb-1 font-heading text-lg font-bold text-ink-strong">
                    {t("owner_banner_title")}
                  </p>
                  <p className="mb-4 font-body text-sm text-ink-muted">
                    {t("owner_banner_desc")}
                  </p>
                  <Link
                    href={`/${locale}/postulaciones`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {t("owner_banner_cta")}
                  </Link>
                </div>
              )}

              {/* Sin rol — invitación a registrarse */}
              {!role && (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                  <p className="mb-1 font-heading text-lg font-bold text-ink-strong">
                    ¿Te interesa este proyecto?
                  </p>
                  <p className="mb-4 font-body text-sm text-ink-muted">
                    Registrate como junior para poder postular.
                  </p>
                  <Link
                    href={`/${locale}/register`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}

              {/* Info del proyecto (resumen rápido) */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
                <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Resumen
                </h3>
                <dl className="space-y-2.5 font-body text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Duración</dt>
                    <dd className="font-semibold text-ink-strong text-right">
                      {project.plazo_dias} días
                    </dd>
                  </div>
                  {project.area && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-muted">Área</dt>
                      <dd className="font-semibold text-ink-strong text-right">{project.area.nombre}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Usa IA</dt>
                    <dd className="font-semibold text-ink-strong">{project.usa_ia ? "Sí" : "No"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Estado</dt>
                    <dd>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold", stateClass)}>
                        {stateLabel}
                      </span>
                    </dd>
                  </div>
                  {project.empresa && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-muted">Empresa</dt>
                      <dd className="font-semibold text-ink-strong text-right">
                        {project.empresa.nombre_comercial}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

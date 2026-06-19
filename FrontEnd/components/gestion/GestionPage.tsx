"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FolderOpen,
  GitBranch,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_OFFERS, MOCK_PROJECTS } from "@/lib/mock-data";
import { MOCK_PROJECT_OFFERS } from "@/lib/mock-proceso";
import type { ApiRoleName, OfferState } from "@/lib/api/types";

// ── State display config ─────────────────────────────────────────────────────

const OFFER_STATE_CONFIG: Record<OfferState, { label: string; className: string }> = {
  enviada:         { label: "Enviada",          className: "bg-primary/10 text-primary border-primary/20" },
  en_revision:     { label: "En revisión",      className: "bg-warning/10 text-warning border-warning/20" },
  adjudicada:      { label: "Adjudicada",       className: "bg-accent/10 text-accent border-accent/20" },
  no_seleccionada: { label: "No seleccionada",  className: "bg-magenta/10 text-magenta border-magenta/20" },
};

interface Props {
  role: ApiRoleName | null;
}

export function GestionPage({ role }: Props) {
  const t      = useTranslations("gestion_page");
  const locale = useLocale();

  const isEmpresa = role === "company";

  return (
    <div className="bg-marketplace-sky min-h-screen pb-20">

      {/* ── Hero header ────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-10 md:pt-14">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-white/50">
            {isEmpresa ? t("section_empresa") : t("section_junior")}
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t("title")}<span className="text-highlight" aria-hidden="true">.</span>
          </h1>
          <p className="mt-3 font-body text-base leading-relaxed text-white/70">
            {isEmpresa ? t("subtitle_empresa") : t("subtitle_junior")}
          </p>
        </div>
      </section>

      {/* ── Cards grid ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 -mt-6">

        {/* Junior view */}
        {!isEmpresa && (
          MOCK_OFFERS.length === 0 ? (
            <EmptyState text={t("empty_junior")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_OFFERS.map((oferta) => {
                const stateCfg = OFFER_STATE_CONFIG[oferta.estado.nombre];
                const isAdj    = oferta.estado.nombre === "adjudicada";
                const href     = oferta.proyecto?.id
                  ? `/${locale}/marketplace/${oferta.proyecto.id}/proceso`
                  : undefined;

                return (
                  <article
                    key={oferta.id}
                    className={cn(
                      "group flex flex-col rounded-2xl border bg-surface p-5 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
                      isAdj ? "border-accent/30 ring-1 ring-accent/10" : "border-border hover:border-primary/20"
                    )}
                  >
                    {/* State badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className={cn("rounded-full border px-3 py-1 font-body text-xs font-bold", stateCfg.className)}>
                        {stateCfg.label}
                      </span>
                      {isAdj && <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />}
                    </div>

                    {/* Project title */}
                    <h3 className="mb-1 font-heading text-base font-extrabold leading-snug tracking-tight text-ink-strong">
                      {oferta.proyecto?.titulo ?? "Proyecto eliminado"}
                    </h3>

                    {/* Date */}
                    <p className="mb-4 flex items-center gap-1.5 font-body text-sm text-ink-muted">
                      <Calendar className="size-3.5" aria-hidden="true" />
                      {t("applied_on")} {new Date(oferta.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" })}
                    </p>

                    {/* Proposal preview */}
                    <p className="mb-5 flex-1 font-body text-sm leading-relaxed text-ink line-clamp-2">
                      {oferta.propuesta}
                    </p>

                    {href && (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-2 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
                      >
                        <GitBranch className="size-4" aria-hidden="true" />
                        {t("ver_proceso")}
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          )
        )}

        {/* Empresa view */}
        {isEmpresa && (
          MOCK_PROJECTS.length === 0 ? (
            <EmptyState text={t("empty_empresa")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_PROJECTS.map((proyecto) => {
                const href       = `/${locale}/marketplace/${proyecto.id}/proceso`;
                const offerCount = proyecto.id === "proj-1" ? MOCK_PROJECT_OFFERS.length : Math.floor(Math.random() * 4);
                const adjudicada = proyecto.id === "proj-1" && MOCK_PROJECT_OFFERS.some((o) => o.estado.nombre === "adjudicada");

                return (
                  <article
                    key={proyecto.id}
                    className={cn(
                      "group flex flex-col rounded-2xl border bg-surface p-5 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
                      adjudicada ? "border-accent/30 ring-1 ring-accent/10" : "border-border hover:border-primary/20"
                    )}
                  >
                    {/* Area + IA */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {proyecto.area && (
                        <span className="font-body text-xs font-bold uppercase tracking-wider text-primary">{proyecto.area.nombre}</span>
                      )}
                      {proyecto.usa_ia && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 font-body text-xs font-semibold text-accent">
                          <Zap className="size-3" aria-hidden="true" />IA
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mb-1 font-heading text-base font-extrabold leading-snug tracking-tight text-ink-strong">
                      {proyecto.titulo}
                    </h3>

                    {/* Meta */}
                    <div className="mb-4 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 font-body text-sm text-ink-muted">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {proyecto.plazo_dias} días
                      </span>
                      {proyecto.fecha_publicacion && (
                        <span className="flex items-center gap-1.5 font-body text-sm text-ink-muted">
                          <Calendar className="size-3.5" aria-hidden="true" />
                          {new Date(proyecto.fecha_publicacion).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>

                    {/* Proposals count */}
                    <p className="mb-5 flex flex-1 items-center gap-1.5 font-body text-sm font-semibold text-ink-muted">
                      <Building2 className="size-4" aria-hidden="true" />
                      {t("proposals_count", { count: proyecto.id === "proj-1" ? MOCK_PROJECT_OFFERS.length : offerCount })}
                      {adjudicada && (
                        <span className="ml-1 inline-flex items-center gap-1 font-body text-xs font-bold text-accent">
                          <CheckCircle2 className="size-3.5" />adjudicada
                        </span>
                      )}
                    </p>

                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-2 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
                    >
                      <GitBranch className="size-4" aria-hidden="true" />
                      {t("ver_proceso")}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-16 text-center">
      <FolderOpen className="mb-4 size-12 text-white/30" aria-hidden="true" />
      <p className="font-body text-base text-white/60">{text}</p>
    </div>
  );
}

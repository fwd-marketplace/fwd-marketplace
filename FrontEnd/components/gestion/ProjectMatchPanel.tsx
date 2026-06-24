"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, RotateCcw, BadgeCheck, Loader2, ArrowUpRight, Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjectMatchesAction, inviteToProjectAction } from "@/lib/actions/marketplace";
import type { ApiProject, MatchCandidate } from "@/lib/api/types";

interface Props {
  project: ApiProject | null;
  className?: string;
}

function iniciales(nombre: string, apellido: string | null): string {
  return `${nombre.charAt(0)}${apellido?.charAt(0) ?? ""}`.toUpperCase();
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-accent";
  if (score >= 50) return "text-warning";
  return "text-magenta";
}

/**
 * Candidatos por afinidad (match) para un proyecto de la empresa. Trae estudiantes
 * verificados rankeados por el score real (GET /projects/:id/matches) y permite
 * filtrar por nivel de match y disponibilidad. Si el admin desactivó el matching
 * (enable_matching), el endpoint responde enabled=false y se muestra ese estado.
 */
export function ProjectMatchPanel({ project, className }: Props) {
  const t = useTranslations("matches_panel");
  const locale = useLocale();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [minMatch, setMinMatch] = useState(0);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startInvite] = useTransition();

  const projectId = project?.id ?? null;

  function handleInvite(userId: string) {
    if (!projectId) return;
    setInvitingId(userId);
    setErrorMsg(null);
    startInvite(async () => {
      const r = await inviteToProjectAction(projectId, userId);
      if (r.ok) {
        setInvitedIds((prev) => new Set(prev).add(userId));
      } else {
        setErrorMsg(r.error);
      }
      setInvitingId(null);
    });
  }

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    void getProjectMatchesAction(projectId).then((r) => {
      if (!active) return;
      if (r.ok) {
        setEnabled(r.data.enabled);
        setCandidates(r.data.candidates);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const visibles = useMemo(
    () => candidates.filter((c) => c.score >= minMatch && (!soloDisponibles || c.disponible)),
    [candidates, minMatch, soloDisponibles],
  );

  if (!project) return null;

  return (
    <div className={cn("relative py-8", className ?? "px-6 md:px-10")}>
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-secondary" aria-hidden="true" />
        <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">{t("title")}</p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-2.5 font-body text-sm text-magenta">
          {errorMsg}
        </div>
      )}

      {!enabled ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <Sparkles className="size-8 text-ink-subtle" aria-hidden="true" />
          <p className="font-body text-sm text-ink-muted">{t("disabled")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Filtros */}
          <aside className="lg:col-span-3">
            <div className="space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-heading text-base font-bold text-ink-strong">{t("filters_title")}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setMinMatch(0);
                    setSoloDisponibles(false);
                  }}
                  className="flex items-center gap-1 font-body text-xs font-bold text-primary transition-opacity hover:opacity-80"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  {t("clear")}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {t("min_match")}
                  </span>
                  <span className="font-heading text-sm font-extrabold text-accent">{minMatch}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  aria-label={t("min_match")}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-sunken accent-primary"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-ink">
                <input
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                  className="size-4 accent-primary"
                />
                {t("only_available")}
              </label>
            </div>
          </aside>

          {/* Resultados */}
          <section className="space-y-5 lg:col-span-9">
            <div className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {loading && <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />}
              <span>{t("results_count", { count: visibles.length })}</span>
            </div>

            {visibles.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <Sparkles className="size-8 text-ink-subtle" aria-hidden="true" />
                <p className="font-body text-sm text-ink-muted">{t("empty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {visibles.map((c) => {
                  const nombre = c.usuario?.nombre ?? "";
                  const apellido = c.usuario?.apellido1 ?? "";
                  const nombreCompleto = `${nombre} ${apellido}`.trim();
                  return (
                    <article
                      key={c.id}
                      className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-elevated)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {c.url_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.url_avatar} alt={nombreCompleto} className="size-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-heading text-sm font-bold text-secondary">
                              {iniciales(nombre, apellido)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-heading text-sm font-bold text-ink-strong">{nombreCompleto}</p>
                              {c.estado_verificacion === "verificado" && (
                                <BadgeCheck className="size-4 shrink-0 text-accent" aria-label={t("verified")} />
                              )}
                            </div>
                            {c.especialidad && <p className="font-body text-xs text-ink-muted">{c.especialidad}</p>}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={cn("block font-heading text-lg font-extrabold leading-none", scoreColor(c.score))}>
                            {c.score}%
                          </span>
                          <span className="font-body text-[8px] font-bold uppercase tracking-wider text-ink-muted">
                            {t("score_label")}
                          </span>
                        </div>
                      </div>

                      {(c.matchedSkills.length > 0 || c.missingSkills.length > 0) && (
                        <div className="flex flex-wrap gap-1.5">
                          {c.matchedSkills.map((s) => (
                            <span
                              key={`m-${s}`}
                              className="rounded-full bg-accent/10 px-2.5 py-0.5 font-body text-[10px] font-semibold text-accent"
                            >
                              {s}
                            </span>
                          ))}
                          {c.missingSkills.map((s) => (
                            <span
                              key={`x-${s}`}
                              className="rounded-full bg-surface-sunken px-2.5 py-0.5 font-body text-[10px] font-medium text-ink-subtle line-through"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold",
                            c.disponible ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning",
                          )}
                        >
                          {c.disponible ? t("available") : t("busy")}
                        </span>
                        {c.usuario && (
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/${locale}/junior/${c.usuario.id}`}
                              className="inline-flex items-center gap-1 font-body text-xs font-bold text-primary hover:underline"
                            >
                              {t("view_profile")}
                              <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            </Link>
                            {invitedIds.has(c.usuario.id) ? (
                              <span className="inline-flex items-center gap-1 font-body text-xs font-bold text-accent">
                                <Check className="size-3.5" aria-hidden="true" />
                                {t("invited")}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleInvite(c.usuario!.id)}
                                disabled={invitingId === c.usuario.id}
                                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-body text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                              >
                                {invitingId === c.usuario.id ? (
                                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                                ) : (
                                  <UserPlus className="size-3.5" aria-hidden="true" />
                                )}
                                {t("invite")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankingAction } from "@/lib/actions/ranking";
import type { ApiRankedJunior } from "@/lib/api/types";

const STAR_CHAR = "★";

const POSITION_STYLE: Record<number, string> = {
  0: "bg-highlight text-highlight-foreground ring-2 ring-highlight/30",
  1: "bg-ink-muted/20 text-ink-strong",
  2: "bg-warning/20 text-warning",
};

function getSpecialtyColor(especialidad: string | null): string {
  const map: Record<string, string> = {
    frontend: "bg-primary/10 text-primary",
    backend: "bg-secondary/10 text-secondary",
    fullstack: "bg-accent/10 text-accent",
    ia: "bg-warning/10 text-warning",
  };
  return map[especialidad ?? ""] ?? "bg-ink-muted/10 text-ink-muted";
}

function StarRow({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${score} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(score) ? "text-highlight" : "text-border"} aria-hidden="true">
          {STAR_CHAR}
        </span>
      ))}
    </span>
  );
}

function getInitials(junior: ApiRankedJunior): string {
  const nombre = junior.usuario?.nombre ?? "";
  const apellido = junior.usuario?.apellido1 ?? "";
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

type SpecialtyFilter = "all" | string;

export function Ranking() {
  const t = useTranslations("ranking");
  const [filter, setFilter] = useState<SpecialtyFilter>("all");
  const [juniors, setJuniors] = useState<ApiRankedJunior[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    void getRankingAction().then((result) => {
      if (result.ok) setJuniors(result.data);
      setIsLoading(false);
    });
  }, []);

  const filtered =
    filter === "all" ? juniors : juniors.filter((j) => j.especialidad === filter);

  const FILTERS: { key: SpecialtyFilter; label: string }[] = [
    { key: "all",       label: t("filter_all") },
    { key: "frontend",  label: t("filter_frontend") },
    { key: "backend",   label: t("filter_backend") },
    { key: "fullstack", label: t("filter_fullstack") },
    { key: "ia",        label: t("filter_ia") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-highlight/10">
          <Trophy className="size-6 text-highlight" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong mb-1">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="font-body text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div role="group" aria-label={t("filter_label")} className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] border",
              filter === key
                ? "bg-primary text-white border-primary"
                : "bg-surface text-ink-muted border-border hover:bg-surface-sunken hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-ink-muted" aria-label={t("loading")} />
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {filtered.map((junior, i) => {
            const posStyle = POSITION_STYLE[i] ?? "bg-surface-sunken text-ink-muted";
            const nombre = junior.usuario?.nombre ?? "";
            const apellido = junior.usuario?.apellido1 ?? "";
            return (
              <li
                key={junior.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/20 hover:shadow-[var(--shadow-elevated)]"
              >
                {/* Position badge */}
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-extrabold",
                    posStyle,
                  )}
                  aria-label={`Posición ${i + 1}`}
                >
                  {i < 3 ? <Trophy className="size-4" aria-hidden="true" /> : i + 1}
                </div>

                {/* Avatar */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-bold text-white">
                  {getInitials(junior)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-heading text-base font-bold text-ink-strong">
                      {nombre} {apellido}
                    </p>
                    {junior.especialidad && (
                      <span className={cn("rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold", getSpecialtyColor(junior.especialidad))}>
                        {t(`specialty_${junior.especialidad}` as Parameters<typeof t>[0])}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <StarRow score={junior.reputacion} />
                      <span className="font-body text-sm font-bold text-ink-strong">
                        {junior.reputacion.toFixed(1)}
                      </span>
                    </div>
                    {junior.disponibilidad && (
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold",
                        junior.disponibilidad === "immediate" ? "bg-accent/10 text-accent" : "bg-ink-muted/10 text-ink-muted",
                      )}>
                        {t(`availability_${junior.disponibilidad}` as Parameters<typeof t>[0])}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {junior.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

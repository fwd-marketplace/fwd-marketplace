"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data ─────────────────────────────────────────────────────────────────

type RankedJunior = {
  id: string;
  nombre: string;
  apellido: string;
  specialty: "frontend" | "backend" | "fullstack" | "ia";
  reputation: number;
  totalProjects: number;
  skills: string[];
  availability: "immediate" | "two_weeks" | "one_month";
};

const MOCK_RANKING: RankedJunior[] = [
  {
    id: "r-1",
    nombre: "Valentina",
    apellido: "Morales",
    specialty: "fullstack",
    reputation: 4.9,
    totalProjects: 8,
    skills: ["React", "Node.js", "TypeScript"],
    availability: "immediate",
  },
  {
    id: "r-2",
    nombre: "Diego",
    apellido: "Solís",
    specialty: "frontend",
    reputation: 4.8,
    totalProjects: 6,
    skills: ["React", "Tailwind CSS", "Figma"],
    availability: "two_weeks",
  },
  {
    id: "r-3",
    nombre: "Camila",
    apellido: "Vega",
    specialty: "ia",
    reputation: 4.7,
    totalProjects: 5,
    skills: ["Python", "TensorFlow", "REST APIs"],
    availability: "immediate",
  },
  {
    id: "r-4",
    nombre: "Andrés",
    apellido: "Quesada",
    specialty: "backend",
    reputation: 4.6,
    totalProjects: 7,
    skills: ["Node.js", "PostgreSQL", "Docker"],
    availability: "one_month",
  },
  {
    id: "r-5",
    nombre: "Lucía",
    apellido: "Herrera",
    specialty: "frontend",
    reputation: 4.5,
    totalProjects: 4,
    skills: ["Vue.js", "TypeScript", "Figma"],
    availability: "immediate",
  },
  {
    id: "r-6",
    nombre: "Sebastián",
    apellido: "Araya",
    specialty: "fullstack",
    reputation: 4.4,
    totalProjects: 5,
    skills: ["Next.js", "Python", "AWS"],
    availability: "two_weeks",
  },
  {
    id: "r-7",
    nombre: "Gabriela",
    apellido: "Rojas",
    specialty: "ia",
    reputation: 4.2,
    totalProjects: 3,
    skills: ["Python", "Power BI", "PostgreSQL"],
    availability: "immediate",
  },
  {
    id: "r-8",
    nombre: "Mateo",
    apellido: "Jiménez",
    specialty: "backend",
    reputation: 4.0,
    totalProjects: 4,
    skills: ["Node.js", "Docker", "REST APIs"],
    availability: "one_month",
  },
];

const SPECIALTY_COLORS: Record<RankedJunior["specialty"], string> = {
  frontend:  "bg-primary/10 text-primary",
  backend:   "bg-secondary/10 text-secondary",
  fullstack: "bg-accent/10 text-accent",
  ia:        "bg-warning/10 text-warning",
};

const STAR_CHAR = "★";

const POSITION_STYLE: Record<number, string> = {
  0: "bg-highlight text-highlight-foreground ring-2 ring-highlight/30",
  1: "bg-ink-muted/20 text-ink-strong",
  2: "bg-warning/20 text-warning",
};

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

function getInitials(nombre: string, apellido: string): string {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

// ── Main Component ────────────────────────────────────────────────────────────

type SpecialtyFilter = "all" | RankedJunior["specialty"];

export function Ranking() {
  const t = useTranslations("ranking");
  const [filter, setFilter] = useState<SpecialtyFilter>("all");

  const filtered =
    filter === "all"
      ? MOCK_RANKING
      : MOCK_RANKING.filter((j) => j.specialty === filter);

  const FILTERS: { key: SpecialtyFilter; label: string }[] = [
    { key: "all",      label: t("filter_all") },
    { key: "frontend", label: t("filter_frontend") },
    { key: "backend",  label: t("filter_backend") },
    { key: "fullstack",label: t("filter_fullstack") },
    { key: "ia",       label: t("filter_ia") },
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
      <ol className="flex flex-col gap-3">
        {filtered.map((junior, i) => {
          const posStyle = POSITION_STYLE[i] ?? "bg-surface-sunken text-ink-muted";
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
                {getInitials(junior.nombre, junior.apellido)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-heading text-base font-bold text-ink-strong">
                    {junior.nombre} {junior.apellido}
                  </p>
                  <span className={cn("rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold", SPECIALTY_COLORS[junior.specialty])}>
                    {t(`specialty_${junior.specialty}`)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <StarRow score={junior.reputation} />
                    <span className="font-body text-sm font-bold text-ink-strong">
                      {junior.reputation.toFixed(1)}
                    </span>
                  </div>
                  <span className="font-body text-xs text-ink-muted">
                    {t("projects_count", { count: junior.totalProjects })}
                  </span>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold",
                    junior.availability === "immediate" ? "bg-accent/10 text-accent" : "bg-ink-muted/10 text-ink-muted",
                  )}>
                    {t(`availability_${junior.availability}`)}
                  </span>
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

      <p className="mt-6 text-center font-body text-[11px] text-ink-subtle">
        {t("mock_disclaimer")}
      </p>
    </div>
  );
}

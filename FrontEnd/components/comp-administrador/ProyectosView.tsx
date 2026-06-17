"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Columns3,
  Table,
  AlertCircle,
  Clock,
  UserSearch,
  FileText,
  Search,
  SlidersHorizontal,
  Calendar,
  TrendingUp,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";

type Status = "Activo" | "Selección" | "Finalizado";
type RiskLevel = "Bajo" | "Medio" | "Alto";
type Trend = "up" | "flat" | "done";
type ViewMode = "cards" | "kanban" | "tabla";

interface Project {
  uid: number;
  initials: string;
  logoBg: string;
  name: string;
  id: string;
  company: string;
  industry: string;
  tags: string[];
  status: Status;
  statusTone: string;
  capacity: string;
  capacityPct: string;
  capacityBar: string;
  teamExtra: string;
  vacancies: string;
  vacancyLabel: string;
  vacancyTone: string;
  finish: string;
  milestone: string;
  progress: string;
  trend: Trend;
  match: string;
  matchValue: number;
  riskLevel: RiskLevel;
}

const PAGE_SIZE = 4;

const STATUS_TONE: Record<Status, string> = {
  Activo: "bg-primary/10 text-primary",
  Selección: "bg-secondary/10 text-secondary",
  Finalizado: "bg-accent/10 text-accent",
};

const RISK_TONE: Record<RiskLevel, string> = {
  Bajo: "bg-accent/10 text-accent",
  Medio: "bg-warning/10 text-warning",
  Alto: "bg-magenta/10 text-magenta",
};

const ATTENTION = [
  { icon: Clock, border: "border-magenta", iconBg: "bg-magenta/10", iconTone: "text-magenta", title: "Retraso en Milestone 2", detail: "Proyecto: FinTech Global Core", badge: "Riesgo Alto", badgeTone: "bg-magenta/10 text-magenta" },
  { icon: UserSearch, border: "border-warning", iconBg: "bg-warning/10", iconTone: "text-warning", title: "3 Vacantes Críticas", detail: "E-commerce Migración AWS", badge: "Sin Talentos", badgeTone: "bg-warning/10 text-warning" },
  { icon: FileText, border: "border-primary", iconBg: "bg-primary/10", iconTone: "text-primary", title: "Contrato Pendiente", detail: "AI Implementation Pilot", badge: "Revisión", badgeTone: "bg-primary/10 text-primary" },
];

const PROJECTS: Project[] = [
  { uid: 1, initials: "NG", logoBg: "bg-ink-strong text-white", name: "Core Banking Platform", id: "#PRJ-882", company: "NextGen Systems", industry: "Fintech", tags: ["AWS", "PostgreSQL", "Kafka"], status: "Activo", statusTone: STATUS_TONE.Activo, capacity: "8/10", capacityPct: "80%", capacityBar: "bg-primary", teamExtra: "+5", vacancies: "2", vacancyLabel: "Abiertas", vacancyTone: "text-warning", finish: "12 Sep 2024 (14 sem)", milestone: "UAT Phase 1 (En 6 días)", progress: "65%", trend: "up", match: "94%", matchValue: 94, riskLevel: "Bajo" },
  { uid: 2, initials: "ML", logoBg: "bg-surface-sunken text-ink-strong", name: "AI Supply Chain", id: "#PRJ-904", company: "MindLogic AI", industry: "Retail", tags: ["Python", "PyTorch", "React"], status: "Selección", statusTone: STATUS_TONE.Selección, capacity: "2/6", capacityPct: "33%", capacityBar: "bg-secondary", teamExtra: "", vacancies: "4", vacancyLabel: "Críticas", vacancyTone: "text-magenta", finish: "05 Ene 2025 (30 sem)", milestone: "Cierre de Selección (Hoy)", progress: "12%", trend: "flat", match: "88%", matchValue: 88, riskLevel: "Medio" },
  { uid: 3, initials: "GL", logoBg: "bg-ink-strong text-white", name: "Last Mile Routing", id: "#PRJ-752", company: "Global Logistics", industry: "Supply", tags: ["Node.js", "Go", "Redis"], status: "Activo", statusTone: STATUS_TONE.Activo, capacity: "12/12", capacityPct: "100%", capacityBar: "bg-accent", teamExtra: "+10", vacancies: "", vacancyLabel: "Completado", vacancyTone: "text-accent", finish: "20 Jul 2024 (2 sem)", milestone: "Project Handover", progress: "92%", trend: "done", match: "98%", matchValue: 98, riskLevel: "Bajo" },
  { uid: 4, initials: "TN", logoBg: "bg-primary/15 text-primary", name: "Customer Portal 2.0", id: "#PRJ-868", company: "TechNova CR", industry: "Tecnología", tags: ["React", "Node.js", "AWS"], status: "Activo", statusTone: STATUS_TONE.Activo, capacity: "6/8", capacityPct: "75%", capacityBar: "bg-primary", teamExtra: "+2", vacancies: "2", vacancyLabel: "Abiertas", vacancyTone: "text-warning", finish: "30 Nov 2024 (9 sem)", milestone: "Beta Release", progress: "48%", trend: "up", match: "82%", matchValue: 82, riskLevel: "Medio" },
  { uid: 5, initials: "ST", logoBg: "bg-ink-strong text-white", name: "Smart Factory IoT", id: "#PRJ-815", company: "Stark Industries", industry: "Manufactura", tags: ["Python", "Kafka", "Go"], status: "Selección", statusTone: STATUS_TONE.Selección, capacity: "1/5", capacityPct: "20%", capacityBar: "bg-secondary", teamExtra: "", vacancies: "5", vacancyLabel: "Críticas", vacancyTone: "text-magenta", finish: "18 Feb 2025 (32 sem)", milestone: "Kickoff", progress: "5%", trend: "flat", match: "76%", matchValue: 76, riskLevel: "Alto" },
  { uid: 6, initials: "CY", logoBg: "bg-secondary/15 text-secondary", name: "Infraestructura IA", id: "#PRJ-740", company: "Cyberdyne", industry: "AI", tags: ["Python", "PyTorch", "Redis"], status: "Finalizado", statusTone: STATUS_TONE.Finalizado, capacity: "9/9", capacityPct: "100%", capacityBar: "bg-accent", teamExtra: "+4", vacancies: "", vacancyLabel: "Completado", vacancyTone: "text-accent", finish: "10 Jun 2024 (Cerrado)", milestone: "Entregado", progress: "100%", trend: "done", match: "96%", matchValue: 96, riskLevel: "Bajo" },
  { uid: 7, initials: "GR", logoBg: "bg-warning/15 text-warning", name: "Retail Analytics", id: "#PRJ-721", company: "Global Retail", industry: "Retail", tags: ["React", "PostgreSQL", "AWS"], status: "Activo", statusTone: STATUS_TONE.Activo, capacity: "4/7", capacityPct: "57%", capacityBar: "bg-primary", teamExtra: "+1", vacancies: "3", vacancyLabel: "Abiertas", vacancyTone: "text-warning", finish: "08 Dic 2024 (11 sem)", milestone: "Data Pipeline", progress: "38%", trend: "up", match: "84%", matchValue: 84, riskLevel: "Medio" },
  { uid: 8, initials: "AM", logoBg: "bg-ink-strong text-white", name: "Fleet Management", id: "#PRJ-699", company: "Auto Motors", industry: "Manufactura", tags: ["Go", "Redis", "Kafka"], status: "Finalizado", statusTone: STATUS_TONE.Finalizado, capacity: "6/6", capacityPct: "100%", capacityBar: "bg-accent", teamExtra: "", vacancies: "", vacancyLabel: "Completado", vacancyTone: "text-accent", finish: "02 May 2024 (Cerrado)", milestone: "Entregado", progress: "100%", trend: "done", match: "91%", matchValue: 91, riskLevel: "Bajo" },
  { uid: 9, initials: "MS", logoBg: "bg-primary/15 text-primary", name: "Logistics Hub", id: "#PRJ-688", company: "Modern Solutions", industry: "Supply", tags: ["Node.js", "AWS", "PostgreSQL"], status: "Selección", statusTone: STATUS_TONE.Selección, capacity: "3/6", capacityPct: "50%", capacityBar: "bg-secondary", teamExtra: "+1", vacancies: "3", vacancyLabel: "Abiertas", vacancyTone: "text-warning", finish: "25 Ene 2025 (28 sem)", milestone: "Entrevistas", progress: "18%", trend: "up", match: "79%", matchValue: 79, riskLevel: "Medio" },
];

const ALL_TECHS = Array.from(new Set(PROJECTS.flatMap((project) => project.tags))).sort();

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="size-4 text-accent" aria-hidden="true" />;
  if (trend === "done") return <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />;
  return <Minus className="size-4 text-ink-subtle" aria-hidden="true" />;
}

const VIEWS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "kanban", label: "Kanban", icon: Columns3 },
  { value: "tabla", label: "Tabla", icon: Table },
];

export function ProyectosView() {
  const [view, setView] = useState<ViewMode>("cards");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [riesgo, setRiesgo] = useState("Todas");
  const [tech, setTech] = useState("Cualquiera");
  const [minMatch, setMinMatch] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((project) => {
      if (estado !== "Todos" && project.status !== estado) return false;
      if (riesgo !== "Todas" && project.riskLevel !== riesgo) return false;
      if (tech !== "Cualquiera" && !project.tags.includes(tech)) return false;
      if (project.matchValue < Number(minMatch)) return false;
      if (q && !`${project.name} ${project.id} ${project.company}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, estado, riesgo, tech, minMatch]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = view === "kanban" ? filtered : filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-6 py-8 md:px-10">
      <PageTitle
        eyebrow="Sistema de gestión"
        title="ADMINISTRACIÓN / Proyectos"
        action={
          <div className="flex items-center gap-1 rounded-full bg-surface-sunken p-1">
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors ${
                  view === value ? "bg-primary text-white" : "text-ink-muted hover:text-ink-strong"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Proyectos Totales</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-3xl font-bold text-ink-strong">142</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-body text-xs font-semibold text-primary">+12%</span>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Activos</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-heading text-3xl font-bold text-ink-strong">86</span>
            <span className="font-body text-xs text-ink-muted">Capacidad: 92%</span>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">En Selección</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-3xl font-bold text-ink-strong">24</span>
            <div className="flex items-center -space-x-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary font-body text-[10px] font-bold text-white ring-2 ring-surface">12</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-warning font-body text-[10px] font-bold text-white ring-2 ring-surface">8</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Finalizados</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-3xl font-bold text-ink-strong">32</span>
            <CheckCircle2 className="size-6 text-ink-subtle" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Requiere atención */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink-strong">
          <AlertCircle className="size-5 text-magenta" aria-hidden="true" /> Requiere Atención
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {ATTENTION.map(({ icon: Icon, border, iconBg, iconTone, title, detail, badge, badgeTone }) => (
            <div key={title} className={`rounded-2xl border-l-4 bg-surface p-5 shadow-soft ring-1 ring-border ${border}`}>
              <div className="flex items-start gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`size-5 ${iconTone}`} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-body text-sm font-bold text-ink-strong">{title}</h3>
                  <p className="font-body text-xs text-ink-muted">{detail}</p>
                  <span className={`mt-2 inline-block rounded-md px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}>
                    {badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[14rem] flex-1">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Búsqueda</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(event) => resetPage(setQuery)(event.target.value)}
                placeholder="Filtrar por nombre, ID o empresa"
                className="w-full rounded-lg bg-surface-sunken py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="min-w-[10rem] flex-1">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Estado</label>
            <FilterSelect rounded="lg" ariaLabel="Estado" value={estado} onChange={resetPage(setEstado)} options={["Todos", "Activo", "Selección", "Finalizado"].map((value) => ({ value, label: value }))} />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Prioridad</label>
            <FilterSelect rounded="lg" ariaLabel="Prioridad" value={riesgo} onChange={resetPage(setRiesgo)} options={[{ value: "Todas", label: "Todas" }, { value: "Bajo", label: "Riesgo Bajo" }, { value: "Medio", label: "Riesgo Medio" }, { value: "Alto", label: "Riesgo Alto" }]} />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Tecnología</label>
            <FilterSelect rounded="lg" ariaLabel="Tecnología" value={tech} onChange={resetPage(setTech)} options={["Cualquiera", ...ALL_TECHS].map((value) => ({ value, label: value }))} />
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="inline-flex items-center gap-1.5 py-2.5 font-body text-sm font-semibold text-primary hover:underline"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Filtros Avanzados
          </button>
        </div>
        {showAdvanced && (
          <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-border pt-4">
            <div className="min-w-[12rem]">
              <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Match mínimo</label>
              <FilterSelect rounded="lg" ariaLabel="Match mínimo" value={minMatch} onChange={resetPage(setMinMatch)} options={[{ value: "0", label: "Cualquiera" }, { value: "80", label: "80% o más" }, { value: "90", label: "90% o más" }]} />
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyRow message="No hay proyectos que coincidan con los filtros." />
      ) : view === "cards" ? (
        <div className="space-y-4">
          {pageItems.map((project) => (
            <article key={project.uid} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1.1fr_1.1fr_1.4fr] lg:items-center">
                <div className="flex gap-3">
                  <span className={`flex size-14 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold ${project.logoBg}`}>{project.initials}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-heading text-base font-bold text-ink-strong">{project.name}</h3>
                      <span className="shrink-0 rounded-md bg-surface-sunken px-1.5 py-0.5 font-body text-[10px] font-semibold text-ink-muted">{project.id}</span>
                    </div>
                    <p className="font-body text-xs text-ink-muted">{project.company} <span className="text-ink-subtle">•</span> {project.industry}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-medium text-ink-muted">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${project.statusTone}`}>{project.status}</span>
                    <span className="font-body text-xs text-ink-muted">Capacidad: {project.capacity}</span>
                  </div>
                  <div className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface-sunken">
                    <div className={`h-full rounded-full ${project.capacityBar}`} style={{ width: project.capacityPct }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <span className="size-7 rounded-full bg-primary/20 ring-2 ring-surface" aria-hidden="true" />
                      <span className="size-7 rounded-full bg-secondary/20 ring-2 ring-surface" aria-hidden="true" />
                      <span className="size-7 rounded-full bg-warning/20 ring-2 ring-surface" aria-hidden="true" />
                      {project.teamExtra && (
                        <span className="flex size-7 items-center justify-center rounded-full bg-ink-strong font-body text-[9px] font-bold text-white ring-2 ring-surface">{project.teamExtra}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Vacantes</p>
                      <p className={`font-body text-sm font-bold ${project.vacancyTone}`}>{project.vacancies} {project.vacancyLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Finalización</p>
                      <p className="font-body text-sm text-ink-strong">{project.finish}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Siguiente Hito</p>
                      <p className="font-body text-sm text-ink-strong">{project.milestone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-8">
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Progreso</p>
                      <p className="flex items-center gap-1 font-heading text-lg font-bold text-ink-strong">{project.progress} <TrendIcon trend={project.trend} /></p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Match</p>
                      <p className="font-heading text-lg font-bold text-ink-strong">{project.match}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${RISK_TONE[project.riskLevel]}`}>Riesgo {project.riskLevel}</span>
                    <Button className="ml-auto" onClick={() => setExpanded((id) => (id === project.uid ? null : project.uid))}>
                      {expanded === project.uid ? "Ocultar" : "Ver Proyecto"}
                    </Button>
                  </div>
                </div>
              </div>

              {expanded === project.uid && (
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 font-body text-xs text-ink-muted sm:grid-cols-4">
                  <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Empresa</span>{project.company}</div>
                  <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Estado</span>{project.status}</div>
                  <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Riesgo</span>Riesgo {project.riskLevel}</div>
                  <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Stack</span>{project.tags.join(", ")}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : view === "tabla" ? (
        <section className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">Proyecto</th>
                  <th className="px-4 py-4">Empresa</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4">Progreso</th>
                  <th className="px-4 py-4">Match</th>
                  <th className="px-4 py-4">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((project) => (
                  <tr key={project.uid} className="font-body text-sm">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink-strong">{project.name}</p>
                      <p className="text-xs text-ink-muted">{project.id}</p>
                    </td>
                    <td className="px-4 py-4 text-ink">{project.company}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${project.statusTone}`}>{project.status}</span></td>
                    <td className="px-4 py-4 text-ink-strong">{project.progress}</td>
                    <td className="px-4 py-4 text-ink-strong">{project.match}</td>
                    <td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${RISK_TONE[project.riskLevel]}`}>{project.riskLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["Activo", "Selección", "Finalizado"] as Status[]).map((column) => {
            const cards = filtered.filter((project) => project.status === column);
            return (
              <div key={column} className="rounded-2xl bg-surface-sunken p-4 ring-1 ring-border">
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[column]}`}>{column}</span>
                  <span className="font-body text-xs font-semibold text-ink-muted">{cards.length}</span>
                </div>
                <div className="space-y-3">
                  {cards.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-surface px-3 py-6 text-center font-body text-xs text-ink-subtle">Sin proyectos</p>
                  ) : (
                    cards.map((project) => (
                      <div key={project.uid} className="rounded-xl bg-surface p-3 shadow-soft ring-1 ring-border">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate font-body text-sm font-bold text-ink-strong">{project.name}</h4>
                          <span className="shrink-0 font-body text-[10px] font-semibold text-ink-muted">{project.id}</span>
                        </div>
                        <p className="font-body text-xs text-ink-muted">{project.company}</p>
                        <div className="mt-2 flex items-center justify-between font-body text-xs">
                          <span className="text-ink-muted">Progreso {project.progress}</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${RISK_TONE[project.riskLevel]}`}>{project.riskLevel}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination (cards & tabla) */}
      {view !== "kanban" && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="font-body text-sm text-ink-muted">
            Mostrando <span className="font-semibold text-ink-strong">{pageItems.length}</span> de{" "}
            <span className="font-semibold text-ink-strong">{filtered.length}</span> proyectos
          </p>
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="square" />
        </div>
      )}
    </div>
  );
}

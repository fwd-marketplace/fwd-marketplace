"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Zap,
  X,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  History,
  Building2,
  Rocket,
  UserPlus,
  BadgeCheck,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/comp-administrador/admin-controls";

type Kpi = { label: string; value: string; delta: string; kind: "up" | "down" | "ok" | "flat" };

const RANGES: Record<string, Kpi[]> = {
  "7d": [
    { label: "Empresas", value: "1,180", delta: "+1.2%", kind: "up" },
    { label: "Talento", value: "23.9k", delta: "+3%", kind: "up" },
    { label: "Contratados", value: "7,640", delta: "+5%", kind: "up" },
    { label: "Proyectos", value: "441", delta: "+1%", kind: "up" },
    { label: "Match Prom.", value: "86%", delta: "Saludable", kind: "ok" },
    { label: "Empleabilidad", value: "71%", delta: "+1%", kind: "up" },
    { label: "Time-to-Hire", value: "4.4m", delta: "Estable", kind: "flat" },
  ],
  "30d": [
    { label: "Empresas", value: "1,240", delta: "+5.2%", kind: "up" },
    { label: "Talento", value: "24.5k", delta: "+12%", kind: "up" },
    { label: "Contratados", value: "8,102", delta: "+18%", kind: "up" },
    { label: "Proyectos", value: "432", delta: "-2%", kind: "down" },
    { label: "Match Prom.", value: "87%", delta: "Saludable", kind: "ok" },
    { label: "Empleabilidad", value: "72%", delta: "+3%", kind: "up" },
    { label: "Time-to-Hire", value: "4.2m", delta: "Estable", kind: "flat" },
  ],
  "90d": [
    { label: "Empresas", value: "1,240", delta: "+9.8%", kind: "up" },
    { label: "Talento", value: "24.5k", delta: "+21%", kind: "up" },
    { label: "Contratados", value: "8,102", delta: "+27%", kind: "up" },
    { label: "Proyectos", value: "432", delta: "-6%", kind: "down" },
    { label: "Match Prom.", value: "88%", delta: "Saludable", kind: "ok" },
    { label: "Empleabilidad", value: "73%", delta: "+6%", kind: "up" },
    { label: "Time-to-Hire", value: "4.0m", delta: "Estable", kind: "flat" },
  ],
  year: [
    { label: "Empresas", value: "1,240", delta: "+42%", kind: "up" },
    { label: "Talento", value: "24.5k", delta: "+63%", kind: "up" },
    { label: "Contratados", value: "8,102", delta: "+88%", kind: "up" },
    { label: "Proyectos", value: "432", delta: "+12%", kind: "up" },
    { label: "Match Prom.", value: "87%", delta: "Saludable", kind: "ok" },
    { label: "Empleabilidad", value: "72%", delta: "+9%", kind: "up" },
    { label: "Time-to-Hire", value: "4.2m", delta: "Estable", kind: "flat" },
  ],
};

const RANGE_OPTIONS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
];

interface Empresa {
  initials: string;
  bg: string;
  name: string;
  projects: number;
  match: number;
  tech: string[];
}

const COMPANIES: Empresa[] = [
  { initials: "TS", bg: "bg-primary/10 text-primary", name: "TechNova Solutions", projects: 12, match: 98, tech: ["React", "Node", "AWS"] },
  { initials: "GT", bg: "bg-secondary/10 text-secondary", name: "Global Tech", projects: 8, match: 94, tech: ["React", "Python"] },
  { initials: "ML", bg: "bg-warning/10 text-warning", name: "MindLogic AI", projects: 5, match: 92, tech: ["Python", "PyTorch"] },
  { initials: "SF", bg: "bg-primary/10 text-primary", name: "Stellar Fintech", projects: 7, match: 90, tech: ["Node", "Go"] },
  { initials: "QD", bg: "bg-secondary/10 text-secondary", name: "Quantum Dynamics", projects: 4, match: 88, tech: ["React", "TypeScript"] },
];

interface Student {
  initials: string;
  bg: string;
  name: string;
  role: string;
  especialidad: string;
  projects: number;
  delta: string;
}

const STUDENTS: Student[] = [
  { initials: "LM", bg: "bg-primary/10 text-primary", name: "Lucía Mendoza", role: "Fullstack Dev", especialidad: "Fullstack Dev", projects: 12, delta: "+15%" },
  { initials: "JS", bg: "bg-secondary/10 text-secondary", name: "Javier Solís", role: "UX/UI Designer", especialidad: "UX/UI Designer", projects: 10, delta: "+8%" },
  { initials: "AR", bg: "bg-warning/10 text-warning", name: "Ana Ramírez", role: "Backend Dev", especialidad: "Backend Dev", projects: 8, delta: "+12%" },
  { initials: "CP", bg: "bg-secondary/10 text-secondary", name: "Carlos Peña", role: "Data Analyst", especialidad: "Data Analyst", projects: 7, delta: "+5%" },
  { initials: "MV", bg: "bg-primary/10 text-primary", name: "Marta Vega", role: "Mobile Dev", especialidad: "Mobile Dev", projects: 6, delta: "+10%" },
];

const ACTIVITY = [
  { icon: Building2, tone: "text-primary", bg: "bg-primary/10", title: "Nueva Empresa:", detail: '"Quantum Dynamics" ha completado su registro.', time: "Hace 12 minutos" },
  { icon: Rocket, tone: "text-secondary", bg: "bg-secondary/10", title: "Nuevo Proyecto:", detail: 'TechNova publicó "Plataforma de IA Generativa".', time: "Hace 45 minutos" },
  { icon: UserPlus, tone: "text-accent", bg: "bg-accent/10", title: "Talento Contratado:", detail: "Sofia R. ha sido contratada por GlobalSync.", time: "Hace 2 horas" },
  { icon: BadgeCheck, tone: "text-primary", bg: "bg-primary/10", title: "Verificación:", detail: '"Stellar Fintech" ha sido verificada con éxito.', time: "Hace 4 horas" },
  { icon: UserPlus, tone: "text-accent", bg: "bg-accent/10", title: "Talento Contratado:", detail: "Diego P. ha sido contratado por MindLogic AI.", time: "Hace 6 horas" },
  { icon: Rocket, tone: "text-secondary", bg: "bg-secondary/10", title: "Nuevo Proyecto:", detail: 'Global Tech publicó "Migración Cloud".', time: "Hace 8 horas" },
];

const MODALIDADES = [
  { label: "Remoto", value: 68 },
  { label: "Híbrido", value: 24 },
  { label: "Presencial", value: 8 },
];

const TALENT_BARS = [40, 60, 90, 70, 45];
const DEMAND_BARS = [50, 75, 100, 65, 55];

function KpiDelta({ kpi }: { kpi: Kpi }) {
  if (kpi.kind === "up")
    return <span className="flex items-center gap-1 font-body text-xs font-semibold text-primary"><TrendingUp className="size-3.5" aria-hidden="true" /> {kpi.delta}</span>;
  if (kpi.kind === "down")
    return <span className="flex items-center gap-1 font-body text-xs font-semibold text-magenta"><TrendingDown className="size-3.5" aria-hidden="true" /> {kpi.delta}</span>;
  if (kpi.kind === "ok")
    return <span className="flex items-center gap-1 font-body text-xs font-semibold text-accent"><CheckCircle2 className="size-3.5" aria-hidden="true" /> {kpi.delta}</span>;
  return <span className="font-body text-xs font-semibold text-ink-muted">{kpi.delta}</span>;
}

export function ReportesView() {
  const [range, setRange] = useState("30d");
  const [empresa, setEmpresa] = useState("Todas");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [tecnologia, setTecnologia] = useState("React");
  const [showMoreActivity, setShowMoreActivity] = useState(false);

  const kpis = RANGES[range] ?? RANGES["30d"]!;

  const companyOptions = ["Todas", ...COMPANIES.map((company) => company.name)];
  const especialidadOptions = ["Todas", ...Array.from(new Set(STUDENTS.map((student) => student.especialidad)))];
  const techOptions = ["Todas", ...Array.from(new Set(COMPANIES.flatMap((company) => company.tech)))];

  const filteredCompanies = useMemo(
    () =>
      COMPANIES.filter((company) => {
        if (empresa !== "Todas" && company.name !== empresa) return false;
        if (tecnologia !== "Todas" && !company.tech.includes(tecnologia)) return false;
        return true;
      }),
    [empresa, tecnologia],
  );

  const filteredStudents = useMemo(
    () => STUDENTS.filter((student) => especialidad === "Todas" || student.especialidad === especialidad),
    [especialidad],
  );

  const visibleActivity = showMoreActivity ? ACTIVITY : ACTIVITY.slice(0, 4);

  function resetFilters() {
    setRange("30d");
    setEmpresa("Todas");
    setEspecialidad("Todas");
    setTecnologia("Todas");
  }

  function exportCsv() {
    const rows: string[][] = [
      ["Reporte FWD Talent", RANGE_OPTIONS.find((option) => option.value === range)?.label ?? ""],
      [],
      ["Métrica", "Valor", "Variación"],
      ...kpis.map((kpi) => [kpi.label, kpi.value, kpi.delta]),
      [],
      ["Empresa Destacada", "Proyectos activos", "Match"],
      ...filteredCompanies.map((company) => [company.name, String(company.projects), `${company.match}%`]),
      [],
      ["Estudiante", "Rol", "Proyectos", "Variación"],
      ...filteredStudents.map((student) => [student.name, student.role, String(student.projects), student.delta]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-fwd.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">Analítica</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
            Reportes<span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="max-w-xl font-body text-sm text-ink-muted">
            Visualiza el rendimiento general de empresas, proyectos, talentos y contrataciones dentro del ecosistema FWD.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportCsv}><Download className="size-4" aria-hidden="true" /> Exportar CSV</Button>
          <Button onClick={() => window.print()}><FileText className="size-4" aria-hidden="true" /> Exportar PDF</Button>
          <Button onClick={() => window.print()}><Zap className="size-4" aria-hidden="true" /> Generar Reporte Ejecutivo</Button>
        </div>
      </header>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft ring-1 ring-border">
        <FilterSelect ariaLabel="Rango de fechas" value={range} onChange={setRange} options={RANGE_OPTIONS} />
        <FilterSelect ariaLabel="Empresa" value={empresa} onChange={setEmpresa} options={companyOptions.map((value) => ({ value, label: value === "Todas" ? "Empresa: Todas" : value }))} />
        <FilterSelect ariaLabel="Especialidad" value={especialidad} onChange={setEspecialidad} options={especialidadOptions.map((value) => ({ value, label: value === "Todas" ? "Especialidad: Todas" : value }))} />
        {tecnologia === "Todas" ? (
          <FilterSelect ariaLabel="Tecnología" value={tecnologia} onChange={setTecnologia} options={techOptions.map((value) => ({ value, label: value === "Todas" ? "Tecnología: Todas" : value }))} />
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 py-2.5 pl-4 pr-3 font-body text-sm font-medium text-primary">
            Tecnología: {tecnologia}
            <button type="button" aria-label="Quitar filtro de tecnología" onClick={() => setTecnologia("Todas")} className="rounded-full p-0.5 hover:bg-primary/20">
              <X className="size-4" aria-hidden="true" />
            </button>
          </span>
        )}
        <button
          type="button"
          aria-label="Reiniciar filtros"
          onClick={resetFilters}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted transition-colors hover:bg-border/40 hover:text-ink-strong"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </button>
      </section>

      {/* KPI row */}
      <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
          {kpis.map((kpi) => (
            <div key={kpi.label}>
              <p className="font-body text-xs text-ink-muted">{kpi.label}</p>
              <p className="mt-1 font-heading text-xl font-bold text-ink-strong">{kpi.value}</p>
              <div className="mt-1"><KpiDelta kpi={kpi} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Empresas destacadas */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">Empresas Destacadas</h2>
            <div className="space-y-3">
              {filteredCompanies.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center font-body text-sm text-ink-muted">Sin empresas para este filtro.</p>
              ) : (
                filteredCompanies.map((company) => (
                  <div key={company.name} className="flex items-center gap-4 rounded-xl bg-surface-sunken p-3.5">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg font-body text-xs font-bold ${company.bg}`}>{company.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-ink-strong">{company.name}</p>
                      <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{company.projects} proyectos activos</p>
                    </div>
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 font-body text-xs font-bold text-primary">{company.match}% Match</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Estudiantes con más proyectos */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink-strong">Estudiantes con Más Proyectos</h2>
              <span className="font-body text-[11px] font-bold uppercase tracking-wider text-primary">Top Performance</span>
            </div>
            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center font-body text-sm text-ink-muted">Sin estudiantes para esta especialidad.</p>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.name} className="flex items-center gap-4 rounded-xl bg-surface-sunken p-3.5">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full font-body text-xs font-bold ${student.bg}`}>{student.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-ink-strong">{student.name}</p>
                      <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{student.role}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-lg font-bold text-primary">{student.projects}</p>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Proyectos</p>
                    </div>
                    <span className="rounded-md bg-accent/10 px-2 py-1 font-body text-xs font-bold text-accent">{student.delta}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right column: actividad */}
        <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-ink-strong">Actividad del Sistema</h2>
            <History className="size-5 text-ink-subtle" aria-hidden="true" />
          </div>
          <ul className="space-y-5">
            {visibleActivity.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                  <item.icon className={`size-4 ${item.tone}`} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-body text-sm text-ink-strong"><span className="font-bold">{item.title}</span> {item.detail}</p>
                  <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">{item.time}</p>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken">
                <MoreHorizontal className="size-4 text-ink-subtle" aria-hidden="true" />
              </span>
              <button type="button" onClick={() => setShowMoreActivity((value) => !value)} className="font-body text-sm text-ink-muted hover:text-primary">
                {showMoreActivity ? "Ver menos actividad" : "Ver más registros de actividad..."}
              </button>
            </li>
          </ul>
        </section>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
          <h2 className="mb-5 font-heading text-base font-bold text-ink-strong">Modalidades Laborales</h2>
          <div className="space-y-4">
            {MODALIDADES.map((modality) => (
              <div key={modality.label}>
                <div className="mb-1.5 flex items-center justify-between font-body text-sm">
                  <span className="font-bold text-ink-strong">{modality.label}</span>
                  <span className="font-bold text-ink-strong">{modality.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${modality.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-ink-strong">Cobertura de Especialidad vs Demanda</h2>
            <span className="font-body text-xs font-bold text-secondary">Matching Index: High</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex h-32 items-end justify-between gap-2">
                {TALENT_BARS.map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-md bg-primary/40" style={{ height: `${height}%` }} aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-center font-body text-xs text-ink-muted">Disponibilidad de Talento</p>
            </div>
            <div>
              <div className="flex h-32 items-end justify-between gap-2">
                {DEMAND_BARS.map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-md bg-secondary/40" style={{ height: `${height}%` }} aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-center font-body text-xs text-ink-muted">Demanda Proyectada</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

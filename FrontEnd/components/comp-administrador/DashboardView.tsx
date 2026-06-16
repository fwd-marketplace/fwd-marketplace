"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Plus,
  CalendarDays,
  RefreshCw,
  Search,
  ChevronRight,
  Users,
  Building2,
  Briefcase,
  FileText,
  BarChart2,
  Settings,
  UserPlus,
  Banknote,
  AlertCircle,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS: {
  label: string;
  value: string;
  delta: string;
  deltaTone: string;
  caption: string;
  highlight?: boolean;
}[] = [
  { label: "Empresas", value: "1,284", delta: "+12%", deltaTone: "text-accent", caption: "Nuevas esta semana" },
  { label: "Talento", value: "15.4k", delta: "+8%", deltaTone: "text-accent", caption: "Perfiles activos" },
  { label: "Proyectos", value: "342", delta: "+4%", deltaTone: "text-secondary", caption: "En ejecución" },
  { label: "Postulaciones", value: "8,432", delta: "+15%", deltaTone: "text-magenta", caption: "Total procesado" },
  { label: "Solicitudes", value: "47", delta: "Urgente", deltaTone: "text-warning", caption: "Pendientes de revisión", highlight: true },
  { label: "Incidentes", value: "12", delta: "-2%", deltaTone: "text-ink-muted", caption: "Reportes abiertos" },
];

const ADMISSIONS = [
  { uid: 1, initials: "JD", name: "John Doe Consulting", email: "john@doe.com", industry: "Tecnología", time: "Hace 20 min" },
  { uid: 2, initials: "MS", name: "Modern Solutions", email: "m.sol@corp.de", industry: "Logística", time: "Hace 1h" },
  { uid: 3, initials: "WC", name: "Wayne Corp", email: "b.wayne@corp.com", industry: "Industria", time: "Hace 3h" },
];

const MODERATION = [
  { uid: 1, project: "Migración Cloud 2.0", company: "Stark Ind.", risk: "Alto", riskTone: "text-magenta" },
  { uid: 2, project: "Desarrollo AI-Core", company: "Cyberdyne", risk: "Medio", riskTone: "text-warning" },
];

const MODULES = [
  { icon: Users, title: "Talento", tag: "82 nuevos", description: "Gestión de perfiles y habilidades", href: "/admin/talento" },
  { icon: Building2, title: "Empresas", tag: "12 registros", description: "Partners corporativos y contratos", href: "/admin/empresas" },
  { icon: Briefcase, title: "Proyectos", tag: "5 activos", description: "Hitos, pagos y moderación", href: "/admin/proyectos" },
  { icon: FileText, title: "Solicitudes", tag: "47 pend.", description: "Tickets de soporte y ayuda", href: "/admin/solicitudes" },
  { icon: BarChart2, title: "Reportes", tag: "PDF Semanal", description: "Estadísticas avanzadas y KPIs", href: "/admin/reportes" },
  { icon: Settings, title: "Configuración", tag: "v2.4.0", description: "Parámetros globales del sistema", href: "/admin/configuracion" },
];

const ACTIVITY: {
  icon: typeof UserPlus;
  title: string;
  detail: string;
  time: string;
  tone: string;
  bg: string;
  timeTone?: string;
}[] = [
  { icon: UserPlus, title: "Nuevo talento verificado", detail: "Marcos Pérez • Perfil Senior UX", time: "14:20", tone: "text-primary", bg: "bg-primary/10" },
  { icon: Banknote, title: "Pago liberado", detail: 'Proyecto: "Rediseño App" • Stark Ind.', time: "13:45", tone: "text-secondary", bg: "bg-secondary/10" },
  { icon: AlertCircle, title: "Reporte de disputa", detail: "Ticket #2401 • Wayne Corp", time: "12:10", timeTone: "text-magenta", tone: "text-magenta", bg: "bg-magenta/10" },
  { icon: Pencil, title: "Configuración actualizada", detail: "Modificado por Admin (AD)", time: "11:30", tone: "text-ink", bg: "bg-surface-sunken" },
  { icon: CheckCircle2, title: "Proyecto finalizado", detail: '"Infraestructura IA" • Cyberdyne', time: "10:00", tone: "text-accent", bg: "bg-accent/10" },
];

export function DashboardView() {
  const locale = useLocale();
  const [admissionQuery, setAdmissionQuery] = useState("");
  const [admissions, setAdmissions] = useState(ADMISSIONS);
  const [moderation, setModeration] = useState(MODERATION);

  const filteredAdmissions = useMemo(() => {
    const q = admissionQuery.trim().toLowerCase();
    if (!q) return admissions;
    return admissions.filter((row) => `${row.name} ${row.email} ${row.industry}`.toLowerCase().includes(q));
  }, [admissions, admissionQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-strong md:text-5xl">
            Dashboard
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-body text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" /> 24 de Octubre, 2023
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="size-4" aria-hidden="true" /> Última sincronización: Hace 2 min
            </span>
          </div>
        </div>
        <Button>
          <Plus className="size-4" aria-hidden="true" /> Nuevo Proyecto
        </Button>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border ${
              stat.highlight ? "border-l-4 border-warning" : ""
            }`}
          >
            <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {stat.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-ink-strong">{stat.value}</span>
              <span className={`font-body text-xs font-semibold ${stat.deltaTone}`}>{stat.delta}</span>
            </div>
            <p className="mt-1 font-body text-xs text-ink-subtle">{stat.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Solicitudes de admisión */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">Solicitudes de Admisión</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                  <input
                    type="text"
                    value={admissionQuery}
                    onChange={(event) => setAdmissionQuery(event.target.value)}
                    placeholder="Buscar..."
                    className="w-44 rounded-lg bg-surface-sunken py-2 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <Link href={`/${locale}/admin/solicitudes`} className="font-body text-sm font-semibold text-primary hover:underline">Ver todas</Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    <th className="pb-3 font-semibold">Candidato / Empresa</th>
                    <th className="pb-3 font-semibold">Industria</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAdmissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center font-body text-sm text-ink-muted">
                        Sin solicitudes que coincidan.
                      </td>
                    </tr>
                  )}
                  {filteredAdmissions.map((row) => (
                    <tr key={row.uid} className="font-body text-sm">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-xs font-bold text-primary">
                            {row.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-strong">{row.name}</p>
                            <p className="text-xs text-ink-muted">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink">
                          {row.industry}
                        </span>
                      </td>
                      <td className="py-3.5 text-ink-muted">{row.time}</td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                          <span className="size-2 rounded-full bg-warning" aria-hidden="true" /> Pendiente
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          aria-label="Procesar solicitud"
                          onClick={() => setAdmissions((prev) => prev.filter((item) => item.uid !== row.uid))}
                          className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted transition-colors hover:bg-border/40 hover:text-ink-strong"
                        >
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Moderación de proyectos */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">Moderación de Proyectos</h2>
              <span className="rounded-full bg-magenta/10 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-magenta">
                {moderation.length} críticos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    <th className="pb-3">Proyecto</th>
                    <th className="pb-3">Empresa</th>
                    <th className="pb-3">Riesgo</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {moderation.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center font-body text-sm text-ink-muted">
                        No hay proyectos pendientes de moderación.
                      </td>
                    </tr>
                  )}
                  {moderation.map((row) => (
                    <tr key={row.uid} className="font-body text-sm">
                      <td className="py-4 font-semibold text-ink-strong">{row.project}</td>
                      <td className="py-4 text-ink">{row.company}</td>
                      <td className={`py-4 font-bold ${row.riskTone}`}>{row.risk}</td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="accent" size="sm" className="rounded-lg" onClick={() => setModeration((prev) => prev.filter((item) => item.uid !== row.uid))}>Aprobar</Button>
                          <Button size="sm" className="rounded-lg bg-ink-muted text-white hover:bg-ink-muted/85" onClick={() => setModeration((prev) => prev.filter((item) => item.uid !== row.uid))}>
                            Ocultar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Module cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, tag, description, href }) => (
              <div key={title} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
                <div className="flex items-start justify-between">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <span className="font-body text-xs font-semibold text-ink-muted">{tag}</span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-ink-strong">{title}</h3>
                <p className="mt-1 font-body text-sm text-ink-muted">{description}</p>
                <Link href={`/${locale}${href}`} className="mt-4 inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:gap-2">
                  Ver módulo <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Salud del marketplace */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-5 font-heading text-base font-bold text-ink-strong">Salud del Marketplace</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between font-body text-sm">
                  <span className="text-ink">Tasa de Emparejamiento</span>
                  <span className="font-bold text-ink-strong">94%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-accent" style={{ width: "94%" }} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between font-body text-sm">
                  <span className="text-ink">Proyectos Moderados / Día</span>
                  <span className="font-bold text-ink-strong">88%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-primary" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-sunken p-3 text-center">
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Latencia</p>
                <p className="mt-1 font-heading text-lg font-bold text-accent">24ms</p>
              </div>
              <div className="rounded-xl bg-surface-sunken p-3 text-center">
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Errores 4XX</p>
                <p className="mt-1 font-heading text-lg font-bold text-ink-strong">0.02%</p>
              </div>
            </div>
          </section>

          {/* Actividad reciente */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-5 font-heading text-base font-bold text-ink-strong">Actividad Reciente</h2>
            <ul className="space-y-4">
              {ACTIVITY.map(({ icon: Icon, title, detail, time, tone, bg, timeTone }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`size-4 ${tone}`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-body text-sm font-semibold text-ink-strong">{title}</p>
                      <span className={`shrink-0 font-body text-xs ${timeTone ?? "text-ink-subtle"}`}>{time}</span>
                    </div>
                    <p className="font-body text-xs text-ink-muted">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Reportes */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-5 font-heading text-base font-bold text-ink-strong">Reportes</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Abiertos</p>
                <p className="mt-1 font-heading text-2xl font-bold text-primary">12</p>
              </div>
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Críticos</p>
                <p className="mt-1 font-heading text-2xl font-bold text-magenta">3</p>
              </div>
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Resueltos</p>
                <p className="mt-1 font-heading text-2xl font-bold text-accent">85</p>
              </div>
            </div>
            <Link href={`/${locale}/admin/reportes`} className="mt-5 inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:gap-2">
              Ver módulo <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

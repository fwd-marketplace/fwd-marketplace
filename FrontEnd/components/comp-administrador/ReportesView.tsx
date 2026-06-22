"use client";

import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import type { AdminPendingUser, AdminProject, ProjectState } from "@/lib/api/types";

const ACTIVE_STATES: ProjectState[] = ["en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo"];

const STATE_LABEL: Record<ProjectState, string> = {
  borrador: "Borrador",
  en_recepcion: "En recepción",
  en_evaluacion: "En evaluación",
  adjudicado: "Adjudicado",
  en_desarrollo: "En desarrollo",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
  pausado: "Pausado",
};

const STATE_ORDER: ProjectState[] = ["borrador", "en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo", "cerrado", "cancelado", "pausado"];

function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "E";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`.toUpperCase();
}

export function ReportesView({
  pendingUsers,
  projects,
}: {
  pendingUsers: AdminPendingUser[];
  projects: AdminProject[];
}) {
  const companies = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      const name = project.empresa?.nombre_comercial;
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [projects]);

  const byState = useMemo(() => {
    const counts = new Map<ProjectState, number>();
    for (const project of projects) counts.set(project.estado.nombre, (counts.get(project.estado.nombre) ?? 0) + 1);
    return STATE_ORDER.map((state) => ({ state, count: counts.get(state) ?? 0 })).filter((entry) => entry.count > 0);
  }, [projects]);

  const kpis = useMemo(() => {
    const active = projects.filter((p) => ACTIVE_STATES.includes(p.estado.nombre)).length;
    const seleccion = projects.filter((p) => p.estado.nombre === "en_recepcion" || p.estado.nombre === "en_evaluacion").length;
    const finalizados = projects.filter((p) => p.estado.nombre === "cerrado").length;
    const cancelados = projects.filter((p) => p.estado.nombre === "cancelado").length;
    return [
      { label: "Empresas", value: companies.length },
      { label: "Proyectos", value: projects.length },
      { label: "Activos", value: active },
      { label: "En selección", value: seleccion },
      { label: "Finalizados", value: finalizados },
      { label: "Cancelados", value: cancelados },
      { label: "Solicitudes", value: pendingUsers.length },
    ];
  }, [projects, companies, pendingUsers]);

  const maxState = Math.max(1, ...byState.map((entry) => entry.count));

  function exportCsv() {
    const rows: string[][] = [
      ["Reporte FWD Talent"],
      [],
      ["Métrica", "Valor"],
      ...kpis.map((kpi) => [kpi.label, String(kpi.value)]),
      [],
      ["Empresa", "Proyectos"],
      ...companies.map((company) => [company.name, String(company.total)]),
      [],
      ["Estado", "Proyectos"],
      ...byState.map((entry) => [STATE_LABEL[entry.state] ?? entry.state, String(entry.count)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">Analítica</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
            Reportes<span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="max-w-xl font-body text-sm text-ink-muted">
            Rendimiento del ecosistema FWD Talent calculado en vivo a partir de los proyectos y solicitudes registrados.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportCsv}><Download className="size-4" aria-hidden="true" /> Exportar CSV</Button>
          <Button onClick={() => window.print()}><FileText className="size-4" aria-hidden="true" /> Exportar PDF</Button>
        </div>
      </header>

      {/* KPIs */}
      <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {kpis.map((kpi) => (
            <div key={kpi.label}>
              <p className="font-body text-xs text-ink-muted">{kpi.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-ink-strong">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Empresas destacadas */}
        <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">Empresas Destacadas</h2>
          <div className="space-y-3">
            {companies.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center font-body text-sm text-ink-muted">Sin empresas con proyectos.</p>
            ) : (
              companies.slice(0, 5).map((company) => (
                <div key={company.name} className="flex items-center gap-4 rounded-xl bg-surface-sunken p-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-body text-xs font-bold text-primary">{initials(company.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-bold text-ink-strong">{company.name}</p>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{company.total} proyectos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Distribución por estado */}
        <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">Proyectos por Estado</h2>
          <div className="space-y-4">
            {byState.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center font-body text-sm text-ink-muted">Sin proyectos registrados.</p>
            ) : (
              byState.map((entry) => (
                <div key={entry.state}>
                  <div className="mb-1.5 flex items-center justify-between font-body text-sm">
                    <span className="text-ink">{STATE_LABEL[entry.state] ?? entry.state}</span>
                    <span className="font-bold text-ink-strong">{entry.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(entry.count / maxState) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

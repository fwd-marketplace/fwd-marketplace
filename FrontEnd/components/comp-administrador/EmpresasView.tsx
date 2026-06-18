"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Clock, Check, X, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";
import { approveAdminUserAction, rejectAdminUserAction } from "@/lib/actions/admin";
import type { AdminPendingUser, AdminProject, ProjectState } from "@/lib/api/types";

const PAGE_SIZE = 6;

const ACTIVE_STATES: ProjectState[] = ["en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo"];

const STATE_LABEL: Record<ProjectState, string> = {
  borrador: "Borrador",
  en_recepcion: "En recepción",
  en_evaluacion: "En evaluación",
  adjudicado: "Adjudicado",
  en_desarrollo: "En desarrollo",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

interface Company {
  name: string;
  tipo: string;
  total: number;
  activos: number;
  completados: number;
  projects: AdminProject[];
}

function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "E";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`.toUpperCase();
}

const TIPO_STYLE: Record<string, string> = {
  empresa: "bg-secondary/10 text-secondary",
  emprendedor: "bg-warning/10 text-warning",
};

export function EmpresasView({
  projects,
  pendingCompanies = [],
}: {
  projects: AdminProject[];
  pendingCompanies?: AdminPendingUser[];
}) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todas");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<AdminPendingUser[]>(pendingCompanies);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3500);
  }

  function resolvePending(
    id: string,
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
    successText: string,
  ) {
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        flash(result.error ?? "No se pudo completar la acción");
        return;
      }
      setPending((prev) => prev.filter((company) => company.id !== id));
      flash(successText);
    });
  }

  const companies = useMemo(() => {
    const map = new Map<string, Company>();
    for (const project of projects) {
      const name = project.empresa?.nombre_comercial;
      if (!name) continue;
      const current = map.get(name) ?? { name, tipo: project.empresa?.tipo ?? "empresa", total: 0, activos: 0, completados: 0, projects: [] };
      current.total += 1;
      if (ACTIVE_STATES.includes(project.estado.nombre)) current.activos += 1;
      if (project.estado.nombre === "cerrado") current.completados += 1;
      current.projects.push(project);
      map.set(name, current);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (tipo !== "Todas" && company.tipo !== tipo) return false;
      if (q && !company.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [companies, query, tipo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-6 py-8 md:px-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-elevated">
          {message}
        </div>
      )}

      <PageTitle
        eyebrow="Administración"
        title="Empresas"
        description="Empresas con proyectos publicados en FWD Talent Marketplace, derivadas de la actividad real."
      />

      {/* Empresas pendientes de aprobación */}
      {pending.length > 0 && (
        <section className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-warning" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold text-ink-strong">Empresas pendientes de aprobación</h2>
            <span className="rounded-full bg-warning/15 px-2.5 py-0.5 font-body text-xs font-bold text-warning">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map((company) => (
              <div key={company.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-surface p-4 shadow-soft ring-1 ring-border">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-body text-sm font-bold text-secondary">{initials(company.nombre || company.correo)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-bold text-ink-strong">{company.nombre || company.correo}</h3>
                    <span className="rounded-full bg-warning/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-warning">Pendiente</span>
                  </div>
                  <p className="font-body text-sm text-ink-muted">{company.correo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="accent" disabled={isPending} onClick={() => resolvePending(company.id, approveAdminUserAction, "Empresa aprobada")}>
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" aria-hidden="true" />} Permitir acceso
                  </Button>
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => resolvePending(company.id, rejectAdminUserAction, "Empresa rechazada")} className="border-magenta/40 text-magenta hover:bg-magenta/10">
                    <X className="size-4" aria-hidden="true" /> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-surface-sunken p-6 ring-1 ring-border">
        <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">Filtros empresariales</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input type="text" value={query} onChange={(e) => resetPage(setQuery)(e.target.value)} placeholder="Buscar empresa..." className="w-full rounded-lg bg-surface py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle ring-1 ring-border outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <FilterSelect rounded="lg" ariaLabel="Tipo" value={tipo} onChange={resetPage(setTipo)} options={[{ value: "Todas", label: "Tipo: Todas" }, { value: "empresa", label: "Empresa" }, { value: "emprendedor", label: "Emprendedor" }]} />
        </div>
      </section>

      <div className="space-y-5">
        {pageItems.length === 0 ? (
          <EmptyRow message="No hay empresas con proyectos para los filtros aplicados." />
        ) : (
          pageItems.map((company) => {
            const isOpen = expanded === company.name;
            return (
              <article key={company.name} className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_auto] lg:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-sm font-bold text-primary">{initials(company.name)}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-lg font-bold text-ink-strong">{company.name}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${TIPO_STYLE[company.tipo] ?? "bg-surface-sunken text-ink-muted"}`}>{company.tipo}</span>
                        </div>
                        <p className="font-body text-sm text-ink-muted">{company.total} proyectos publicados</p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-4">
                      <div><p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Proyectos</p><p className="mt-0.5 font-body text-sm font-bold text-ink-strong">{company.total}</p></div>
                      <div><p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Activos</p><p className="mt-0.5 font-body text-sm font-bold text-ink-strong">{company.activos}</p></div>
                      <div><p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Completados</p><p className="mt-0.5 font-body text-sm font-bold text-ink-strong">{company.completados}</p></div>
                    </div>
                  </div>
                  <div className="lg:w-48">
                    <Button className="w-full" onClick={() => setExpanded((name) => (name === company.name ? null : company.name))}>
                      {isOpen ? "Ocultar proyectos" : "Ver empresa"}
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {company.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-2.5">
                        <span className="truncate font-body text-sm font-medium text-ink-strong">{project.titulo}</span>
                        <span className="shrink-0 font-body text-xs text-ink-muted">{STATE_LABEL[project.estado.nombre] ?? project.estado.nombre}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-ink-muted">Mostrando {rangeStart}-{rangeEnd} de {filtered.length} empresas con proyectos</p>
        <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="round" />
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 font-body text-sm text-ink-muted">
        <p>© 2024 FWD Talent Marketplace. Precision &amp; Momentum.</p>
        <nav className="flex items-center gap-6">
          <a href="#" className="hover:text-ink-strong">Soporte</a>
          <a href="#" className="hover:text-ink-strong">Privacidad</a>
          <a href="#" className="hover:text-ink-strong">Términos</a>
        </nav>
      </footer>
    </div>
  );
}

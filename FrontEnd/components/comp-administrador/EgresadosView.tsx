"use client";

import { useMemo, useState } from "react";
import { GraduationCap, UserSearch, X, AlertCircle, ServerCrash } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination } from "@/components/comp-administrador/admin-controls";
import type { AdminStudentUser, AdminStudentProfile } from "@/lib/api/types";

type Especialidad = "frontend" | "backend" | "fullstack" | "ia";
type Disponibilidad = "immediate" | "two_weeks" | "one_month" | "unavailable";

const DISPONIBILIDAD_LABEL: Record<Disponibilidad, string> = {
  immediate: "Disponible ya",
  two_weeks: "En 2 semanas",
  one_month: "En 1 mes",
  unavailable: "No disponible",
};

const ESPECIALIDAD_LABEL: Record<Especialidad, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  ia: "IA",
};

const ESTADO_STYLES: Record<string, string> = {
  activa: "border-accent/30 bg-accent/10 text-accent",
  pendiente: "border-warning/30 bg-warning/10 text-warning",
  suspendida: "border-magenta/30 bg-magenta/10 text-magenta",
  rechazada: "border-ink-muted/30 bg-ink-muted/10 text-ink-muted",
};

const DISPONIBILIDAD_STYLES: Record<Disponibilidad, string> = {
  immediate: "border-accent/30 bg-accent/10 text-accent",
  two_weeks: "border-primary/30 bg-primary/10 text-primary",
  one_month: "border-warning/30 bg-warning/10 text-warning",
  unavailable: "border-ink-muted/30 bg-ink-muted/10 text-ink-muted",
};

const PAGE_SIZE = 8;

interface Props {
  users?: AdminStudentUser[];
  error?: string;
}

function getInitials(nombre: string, apellido: string | null): string {
  const a = nombre.charAt(0).toUpperCase();
  const b = apellido ? apellido.charAt(0).toUpperCase() : "";
  return a + b;
}

/** Normaliza `estudiante` que puede venir como array, objeto o null desde Supabase. */
function getPerfil(est: AdminStudentUser["estudiante"]): AdminStudentProfile | undefined {
  if (!est) return undefined;
  if (Array.isArray(est)) return est[0] ?? undefined;
  return est;
}

export function EgresadosView({ users = [], error }: Props) {
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [espFilter, setEspFilter] = useState("Todas");
  const [dispFilter, setDispFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const especialidades = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      const esp = getPerfil(u.estudiante)?.especialidad;
      if (esp) set.add(esp);
    });
    return Array.from(set);
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const perfil = getPerfil(u.estudiante);
      if (estadoFilter !== "Todos" && u.estado_cuenta !== estadoFilter) return false;
      if (espFilter !== "Todas" && perfil?.especialidad !== espFilter) return false;
      if (dispFilter !== "Todas" && perfil?.disponibilidad !== dispFilter) return false;
      return true;
    });
  }, [users, estadoFilter, espFilter, dispFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  function clearFilters() {
    setEstadoFilter("Todos");
    setEspFilter("Todas");
    setDispFilter("Todas");
    setPage(1);
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pageIds = pageItems.map((u) => u.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const selectedList = users.filter((u) => selected.has(u.id));

  const totalEstudiantes = users.length;
  const disponiblesYa = users.filter((u) => getPerfil(u.estudiante)?.disponibilidad === "immediate").length;

  const ESTADOS = ["Todos", "activa", "pendiente", "suspendida", "rechazada"];
  const DISPONIBILIDADES = ["Todas", "immediate", "two_weeks", "one_month", "unavailable"];
  const ESPECIALIDADES_OPTS = ["Todas", ...especialidades];

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
        <PageTitle eyebrow="Administracion" title="Talento" description="Usuarios registrados con rol de estudiante." />
        <div className="flex items-center gap-3 rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-4 font-body text-sm text-magenta">
          <ServerCrash className="size-5 shrink-0" aria-hidden="true" />
          <p>No se pudo cargar la lista de estudiantes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 pb-28 md:px-10">
      <PageTitle eyebrow="Administracion" title="Talento" description="Usuarios registrados con rol de estudiante en la plataforma." />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <div className="flex items-start justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="size-5 text-primary" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-body text-xs font-semibold text-accent">Total</span>
          </div>
          <p className="mt-4 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Estudiantes registrados</p>
          <p className="mt-1 font-heading text-3xl font-bold text-ink-strong">{totalEstudiantes}</p>
        </div>

        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <div className="flex items-start justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10">
              <UserSearch className="size-5 text-accent" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-body text-xs font-semibold text-accent">Disponibles</span>
          </div>
          <p className="mt-4 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Disponibles inmediatamente</p>
          <p className="mt-1 font-heading text-3xl font-bold text-ink-strong">{disponiblesYa}</p>
        </div>

        <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
          <div className="flex items-start justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-warning/10">
              <AlertCircle className="size-5 text-warning" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-warning/10 px-2.5 py-1 font-body text-xs font-semibold text-warning">Pendientes</span>
          </div>
          <p className="mt-4 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Cuentas pendientes</p>
          <p className="mt-1 font-heading text-3xl font-bold text-ink-strong">
            {users.filter((u) => u.estado_cuenta === "pendiente").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl bg-surface-sunken p-4 ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            ariaLabel="Estado de cuenta"
            value={estadoFilter}
            onChange={resetPage(setEstadoFilter)}
            options={ESTADOS.map((v) => ({ value: v, label: v === "Todos" ? "Estado de cuenta" : v.charAt(0).toUpperCase() + v.slice(1) }))}
          />
          <FilterSelect
            ariaLabel="Especializacion"
            value={espFilter}
            onChange={resetPage(setEspFilter)}
            options={ESPECIALIDADES_OPTS.map((v) => ({
              value: v,
              label: v === "Todas" ? "Especializacion" : ESPECIALIDAD_LABEL[v as Especialidad] ?? v,
            }))}
          />
          <FilterSelect
            ariaLabel="Disponibilidad"
            value={dispFilter}
            onChange={resetPage(setDispFilter)}
            options={DISPONIBILIDADES.map((v) => ({
              value: v,
              label: v === "Todas" ? "Disponibilidad" : DISPONIBILIDAD_LABEL[v as Disponibilidad] ?? v,
            }))}
          />
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline"
          >
            <X className="size-4" aria-hidden="true" /> Limpiar
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAllPage}
                    aria-label="Seleccionar todos"
                    className="size-4 accent-primary"
                  />
                </th>
                <th className="px-2 py-4">Perfil</th>
                <th className="px-4 py-4">Especializacion</th>
                <th className="px-4 py-4">Disponibilidad</th>
                <th className="px-4 py-4">Estado cuenta</th>
                <th className="px-4 py-4">Titulo FWD</th>
                <th className="px-6 py-4">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center font-body text-sm text-ink-muted">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                pageItems.map((user) => {
                  const perfil = getPerfil(user.estudiante);
                  const initials = getInitials(user.nombre, user.apellido1);
                  const esp = perfil?.especialidad as Especialidad | null | undefined;
                  const disp = perfil?.disponibilidad as Disponibilidad | null | undefined;
                  const estadoStyle = ESTADO_STYLES[user.estado_cuenta] ?? "border-border bg-surface text-ink";
                  const dispStyle = disp ? (DISPONIBILIDAD_STYLES[disp] ?? "border-border bg-surface text-ink") : null;
                  const fechaRegistro = new Date(user.fecha_registro).toLocaleDateString("es-CR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={user.id}
                      className={`font-body text-sm transition-colors ${selected.has(user.id) ? "bg-primary/5" : "hover:bg-surface-sunken/50"}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(user.id)}
                          onChange={() => toggleOne(user.id)}
                          aria-label={`Seleccionar ${user.nombre}`}
                          className="size-4 accent-primary"
                        />
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-body text-xs font-bold text-secondary">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-strong">
                              {user.nombre} {user.apellido1 ?? ""}
                            </p>
                            <p className="text-xs text-ink-muted">{user.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {esp ? (
                          <span className="rounded-md bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                            {ESPECIALIDAD_LABEL[esp] ?? esp}
                          </span>
                        ) : (
                          <span className="text-ink-subtle italic">Sin especializacion</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {disp && dispStyle ? (
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${dispStyle}`}>
                            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                            {DISPONIBILIDAD_LABEL[disp]}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-subtle italic">Sin datos</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${estadoStyle}`}>
                          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                          {user.estado_cuenta}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {perfil?.titulo_fwd ?? <span className="italic text-ink-subtle">Sin titulo</span>}
                      </td>
                      <td className="px-6 py-4 text-ink-muted">{fechaRegistro}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
          <p className="font-body text-sm text-ink-muted">
            Mostrando <span className="font-semibold text-ink-strong">{pageItems.length}</span> de{" "}
            <span className="font-semibold text-ink-strong">{filtered.length}</span> estudiantes
          </p>
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="round" />
        </div>
      </section>

      {/* Selection bar */}
      {selectedList.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <div className="pointer-events-auto flex flex-wrap items-center gap-4 rounded-2xl bg-ink-strong px-5 py-3 shadow-elevated">
            <div className="flex items-center">
              {selectedList.slice(0, 2).map((u, index) => (
                <span
                  key={u.id}
                  className={`flex size-7 items-center justify-center rounded-full font-body text-[10px] font-bold text-white ring-2 ring-ink-strong ${index === 0 ? "bg-warning" : "-ml-3 bg-primary"}`}
                >
                  {getInitials(u.nombre, u.apellido1)}
                </span>
              ))}
              {selectedList.length > 2 && (
                <span className="-ml-3 flex size-7 items-center justify-center rounded-full bg-secondary font-body text-[10px] font-bold text-white ring-2 ring-ink-strong">
                  +{selectedList.length - 2}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-white">
              <span className="font-bold">{selectedList.length} estudiantes</span> seleccionados
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={() => setSelected(new Set())}>
                Contactar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => setSelected(new Set())}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

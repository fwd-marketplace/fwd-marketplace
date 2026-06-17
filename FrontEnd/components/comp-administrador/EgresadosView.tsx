"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Briefcase, UserSearch, Rocket, AlertCircle, X } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";

type Status = "Buscando oportunidades" | "Contratado" | "Disponible" | "En proyecto";

interface Egresado {
  uid: number;
  initials: string;
  name: string;
  email: string;
  year: string;
  specialty: string;
  strengths: string[];
  status: Status;
  company: string;
  companyMuted: boolean;
  last: string;
}

const PAGE_SIZE = 5;

const STATUS_STYLES: Record<Status, string> = {
  "Buscando oportunidades": "border-warning/30 bg-warning/10 text-warning",
  Contratado: "border-accent/30 bg-accent/10 text-accent",
  Disponible: "border-primary/30 bg-primary/10 text-primary",
  "En proyecto": "border-secondary/30 bg-secondary/10 text-secondary",
};

const STATS = [
  { icon: GraduationCap, iconBg: "bg-primary/10", iconTone: "text-primary", badge: "+8% mes", badgeTone: "bg-accent/10 text-accent", label: "Egresados Totales", value: "452" },
  { icon: Briefcase, iconBg: "bg-accent/10", iconTone: "text-accent", badge: "72% Empleabilidad", badgeTone: "bg-accent/10 text-accent", label: "Contratados", value: "325" },
  { icon: UserSearch, iconBg: "bg-warning/10", iconTone: "text-warning", badge: "Prioridad Alta", badgeTone: "bg-warning/10 text-warning", label: "Disponibles", value: "68" },
  { icon: Rocket, iconBg: "bg-secondary/10", iconTone: "text-secondary", badge: "12 Activos", badgeTone: "bg-secondary/10 text-secondary", label: "En Proyectos", value: "59" },
];

const TRACKING = [
  { label: "Disponibles", value: "15.0%", width: "15%", bar: "bg-primary" },
  { label: "Contratados", value: "72.0%", width: "72%", bar: "bg-accent" },
  { label: "En proyectos", value: "13.0%", width: "13%", bar: "bg-secondary" },
];

const EGRESADOS: Egresado[] = [
  { uid: 1, initials: "LM", name: "Lucía Mendoza", email: "lucia.m@alumni.fwd", year: "2025", specialty: "Fullstack Dev", strengths: ["React", "Next.js", "TypeScript", "Node"], status: "Buscando oportunidades", company: "No contratado", companyMuted: true, last: "Hoy, 09:12" },
  { uid: 2, initials: "JS", name: "Javier Solís", email: "j.solis@alumni.fwd", year: "2024", specialty: "UX/UI Designer", strengths: ["Figma", "Prototyping"], status: "Contratado", company: "Microsoft", companyMuted: false, last: "Hace días" },
  { uid: 3, initials: "SV", name: "Sara Valadez", email: "sara.v@alumni.fwd", year: "2025", specialty: "Backend Dev", strengths: ["Python", "Django", "Postgres"], status: "Disponible", company: "No contratado", companyMuted: true, last: "Hace horas" },
  { uid: 4, initials: "MO", name: "Mateo Ortega", email: "m.ortega@alumni.fwd", year: "2024", specialty: "Mobile Developer", strengths: ["Flutter", "Firebase"], status: "En proyecto", company: "IBM - Lab Project", companyMuted: false, last: "Ayer" },
  { uid: 5, initials: "CR", name: "Carla Ramírez", email: "c.ramirez@alumni.fwd", year: "2023", specialty: "Fullstack Dev", strengths: ["React", "Node", "AWS"], status: "Contratado", company: "Globant", companyMuted: false, last: "Hace 2 días" },
  { uid: 6, initials: "DP", name: "Diego Paredes", email: "d.paredes@alumni.fwd", year: "2025", specialty: "Backend Dev", strengths: ["Go", "Postgres", "Redis"], status: "Buscando oportunidades", company: "No contratado", companyMuted: true, last: "Hoy, 11:40" },
  { uid: 7, initials: "VN", name: "Valeria Núñez", email: "v.nunez@alumni.fwd", year: "2024", specialty: "UX/UI Designer", strengths: ["Figma", "Research"], status: "Disponible", company: "No contratado", companyMuted: true, last: "Hace horas" },
  { uid: 8, initials: "AF", name: "Andrés Fuentes", email: "a.fuentes@alumni.fwd", year: "2023", specialty: "Mobile Developer", strengths: ["Flutter", "Kotlin"], status: "En proyecto", company: "FWD Lab", companyMuted: false, last: "Ayer" },
  { uid: 9, initials: "PM", name: "Paula Marín", email: "p.marin@alumni.fwd", year: "2025", specialty: "Fullstack Dev", strengths: ["Next.js", "TypeScript"], status: "Buscando oportunidades", company: "No contratado", companyMuted: true, last: "Hoy, 08:05" },
  { uid: 10, initials: "RG", name: "Ricardo Gómez", email: "r.gomez@alumni.fwd", year: "2024", specialty: "Backend Dev", strengths: ["Python", "FastAPI"], status: "Contratado", company: "Amazon", companyMuted: false, last: "Hace 4 días" },
  { uid: 11, initials: "IT", name: "Inés Torres", email: "i.torres@alumni.fwd", year: "2023", specialty: "UX/UI Designer", strengths: ["Figma", "Design Systems"], status: "Disponible", company: "No contratado", companyMuted: true, last: "Hace horas" },
  { uid: 12, initials: "FM", name: "Felipe Mora", email: "f.mora@alumni.fwd", year: "2025", specialty: "Mobile Developer", strengths: ["React Native", "Firebase"], status: "En proyecto", company: "Rappi", companyMuted: false, last: "Ayer" },
];

const STATUSES = ["Todos", "Buscando oportunidades", "Contratado", "Disponible", "En proyecto"];
const YEARS = ["Todos", "2025", "2024", "2023"];
const SPECIALTIES = ["Todas", ...Array.from(new Set(EGRESADOS.map((e) => e.specialty)))];
const STRENGTHS = ["Todas", ...Array.from(new Set(EGRESADOS.flatMap((e) => e.strengths)))];

export function EgresadosView() {
  const [estado, setEstado] = useState("Todos");
  const [year, setYear] = useState("Todos");
  const [specialty, setSpecialty] = useState("Todas");
  const [strength, setStrength] = useState("Todas");
  const [needsOpportunity, setNeedsOpportunity] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    return EGRESADOS.filter((person) => {
      if (estado !== "Todos" && person.status !== estado) return false;
      if (year !== "Todos" && person.year !== year) return false;
      if (specialty !== "Todas" && person.specialty !== specialty) return false;
      if (strength !== "Todas" && !person.strengths.includes(strength)) return false;
      if (needsOpportunity && person.status !== "Buscando oportunidades" && person.status !== "Disponible") return false;
      return true;
    });
  }, [estado, year, specialty, strength, needsOpportunity]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setEstado("Todos");
    setYear("Todos");
    setSpecialty("Todas");
    setStrength("Todas");
    setNeedsOpportunity(false);
    setPage(1);
  }

  function toggleOne(uid: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  const pageIds = pageItems.map((person) => person.uid);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const selectedList = EGRESADOS.filter((person) => selected.has(person.uid));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 pb-28 md:px-10">
      <PageTitle eyebrow="Administración" title="Egresados" description="Gestión y seguimiento de ex-estudiantes graduados de FWD Academy." />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ icon: Icon, iconBg, iconTone, badge, badgeTone, label, value }) => (
          <div key={label} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
            <div className="flex items-start justify-between">
              <span className={`flex size-11 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`size-5 ${iconTone}`} aria-hidden="true" />
              </span>
              <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${badgeTone}`}>{badge}</span>
            </div>
            <p className="mt-4 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-ink-strong">{value}</p>
          </div>
        ))}
      </div>

      {/* Empleabilidad tracking */}
      <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <h2 className="mb-5 font-heading text-lg font-bold text-ink-strong">Seguimiento de empleabilidad</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKING.map(({ label, value, width, bar }) => (
            <div key={label}>
              <p className="font-body text-sm text-ink">{label}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div className={`h-full rounded-full ${bar}`} style={{ width }} />
              </div>
              <p className="mt-2 font-heading text-lg font-bold text-ink-strong">{value}</p>
            </div>
          ))}
          <div>
            <p className="font-body text-sm text-ink">Tiempo prom. empleo</p>
            <p className="mt-4 font-heading text-2xl font-bold text-ink-strong">4.2 <span className="font-body text-sm font-normal text-ink-muted">meses</span></p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl bg-surface-sunken p-4 ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect ariaLabel="Estado laboral" value={estado} onChange={resetPage(setEstado)} options={STATUSES.map((value) => ({ value, label: value === "Todos" ? "Estado Laboral" : value }))} />
          <FilterSelect ariaLabel="Año graduación" value={year} onChange={resetPage(setYear)} options={YEARS.map((value) => ({ value, label: value === "Todos" ? "Año Graduación" : value }))} />
          <FilterSelect ariaLabel="Especialización" value={specialty} onChange={resetPage(setSpecialty)} options={SPECIALTIES.map((value) => ({ value, label: value === "Todas" ? "Especialización" : value }))} />
          <FilterSelect ariaLabel="Fortaleza principal" value={strength} onChange={resetPage(setStrength)} options={STRENGTHS.map((value) => ({ value, label: value === "Todas" ? "Fortaleza Principal" : value }))} />
          <button
            type="button"
            aria-pressed={needsOpportunity}
            onClick={() => resetPage(setNeedsOpportunity)(!needsOpportunity)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-medium ring-1 transition-colors ${
              needsOpportunity ? "bg-warning/20 text-warning ring-warning/40" : "bg-warning/10 text-warning ring-warning/30"
            }`}
          >
            <AlertCircle className="size-4" aria-hidden="true" /> Talento que requiere oportunidades
          </button>
          <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
            <X className="size-4" aria-hidden="true" /> Limpiar
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                <th className="px-6 py-4">
                  <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Seleccionar todos" className="size-4 accent-primary" />
                </th>
                <th className="px-2 py-4">Perfil</th>
                <th className="px-4 py-4">Graduación</th>
                <th className="px-4 py-4">Especialización</th>
                <th className="px-4 py-4">Fortalezas</th>
                <th className="px-4 py-4">Estado Actual</th>
                <th className="px-4 py-4">Empresa Actual</th>
                <th className="px-6 py-4">Última Act.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center font-body text-sm text-ink-muted">
                    No se encontraron egresados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                pageItems.map((person) => (
                  <tr key={person.uid} className={`font-body text-sm ${selected.has(person.uid) ? "bg-primary/5" : ""}`}>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selected.has(person.uid)} onChange={() => toggleOne(person.uid)} aria-label={`Seleccionar ${person.name}`} className="size-4 accent-primary" />
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-body text-xs font-bold text-secondary">{person.initials}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-strong">{person.name}</p>
                          <p className="text-xs text-ink-muted">{person.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink">{person.year}</td>
                    <td className="px-4 py-4 text-ink">{person.specialty}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {person.strengths.map((tag) => (
                          <span key={tag} className="rounded-md bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[person.status]}`}>
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> {person.status}
                      </span>
                    </td>
                    <td className={`px-4 py-4 ${person.companyMuted ? "italic text-ink-subtle" : "text-ink"}`}>{person.company}</td>
                    <td className="px-6 py-4 text-ink-muted">{person.last}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
          <p className="font-body text-sm text-ink-muted">
            Mostrando <span className="font-semibold text-ink-strong">{pageItems.length}</span> de{" "}
            <span className="font-semibold text-ink-strong">{filtered.length}</span> egresados
          </p>
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="round" />
        </div>
      </section>

      {/* Selection bar */}
      {selectedList.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <div className="pointer-events-auto flex flex-wrap items-center gap-4 rounded-2xl bg-ink-strong px-5 py-3 shadow-elevated">
            <div className="flex items-center">
              {selectedList.slice(0, 2).map((person, index) => (
                <span key={person.uid} className={`flex size-7 items-center justify-center rounded-full font-body text-[10px] font-bold text-white ring-2 ring-ink-strong ${index === 0 ? "bg-warning" : "-ml-3 bg-primary"}`}>
                  {person.initials}
                </span>
              ))}
              {selectedList.length > 2 && (
                <span className="-ml-3 flex size-7 items-center justify-center rounded-full bg-secondary font-body text-[10px] font-bold text-white ring-2 ring-ink-strong">+{selectedList.length - 2}</span>
              )}
            </div>
            <p className="font-body text-sm text-white"><span className="font-bold">{selectedList.length} egresados</span> seleccionados</p>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={() => setSelected(new Set())}>Recomendar a vacante</Button>
              <Button size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => setSelected(new Set())}>Descargar CV</Button>
              <Button size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => setSelected(new Set())}>Contactar</Button>
              <button type="button" aria-label="Limpiar selección" onClick={() => setSelected(new Set())} className="inline-flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

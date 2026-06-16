"use client";

import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";

type Status = "Activa" | "Participando" | "Suspendida";

interface Company {
  uid: number;
  initials: string;
  avatarBg: string;
  name: string;
  status: Status;
  email: string;
  industry: string;
  stats: { pub: string; activos: number; completados: string; estudiantes: string; ultima: string; plataforma: string };
  match: string;
  matchValue: number;
  matchBar: string;
  matchTone: string;
  notes: string[];
  hiring: boolean;
}

const PAGE_SIZE = 4;

const STATUS_STYLE: Record<Status, string> = {
  Activa: "bg-secondary/10 text-secondary",
  Participando: "bg-warning/10 text-warning",
  Suspendida: "bg-magenta/10 text-magenta",
};

const INITIAL: Company[] = [
  { uid: 1, initials: "TN", avatarBg: "bg-primary/10 text-primary", name: "TechNova CR", status: "Activa", email: "contacto@technova.cr", industry: "Tecnología", stats: { pub: "24", activos: 8, completados: "16", estudiantes: "52", ultima: "Hoy, 10:45", plataforma: "1.2 años" }, match: "87%", matchValue: 87, matchBar: "bg-accent", matchTone: "text-accent", notes: ["Proyecto activo", "Recibiendo postulaciones"], hiring: true },
  { uid: 2, initials: "GR", avatarBg: "bg-secondary/10 text-secondary", name: "Global Retail", status: "Participando", email: "hr@globalretail.com", industry: "Retail", stats: { pub: "12", activos: 3, completados: "9", estudiantes: "18", ultima: "Hace 2 días", plataforma: "8 meses" }, match: "64%", matchValue: 64, matchBar: "bg-warning", matchTone: "text-warning", notes: ["Evaluando talento"], hiring: false },
  { uid: 3, initials: "AM", avatarBg: "bg-warning/10 text-warning", name: "Auto Motors Industrial", status: "Activa", email: "info@automotors.com", industry: "Manufactura", stats: { pub: "8", activos: 1, completados: "7", estudiantes: "41", ultima: "Ayer, 16:20", plataforma: "2 años" }, match: "92%", matchValue: 92, matchBar: "bg-primary", matchTone: "text-accent", notes: ["Buscando Especialistas"], hiring: true },
  { uid: 4, initials: "SI", avatarBg: "bg-primary/10 text-primary", name: "Stark Industries", status: "Activa", email: "talent@stark.com", industry: "Tecnología", stats: { pub: "31", activos: 11, completados: "19", estudiantes: "73", ultima: "Hoy, 09:02", plataforma: "3 años" }, match: "95%", matchValue: 95, matchBar: "bg-accent", matchTone: "text-accent", notes: ["Proyecto activo", "Contratación abierta"], hiring: true },
  { uid: 5, initials: "MS", avatarBg: "bg-secondary/10 text-secondary", name: "Modern Solutions", status: "Participando", email: "m.sol@corp.de", industry: "Logística", stats: { pub: "6", activos: 0, completados: "5", estudiantes: "12", ultima: "Hace 1 semana", plataforma: "5 meses" }, match: "58%", matchValue: 58, matchBar: "bg-warning", matchTone: "text-warning", notes: ["Evaluando talento"], hiring: false },
  { uid: 6, initials: "CY", avatarBg: "bg-warning/10 text-warning", name: "Cyberdyne", status: "Suspendida", email: "ops@cyberdyne.ai", industry: "AI", stats: { pub: "4", activos: 0, completados: "4", estudiantes: "9", ultima: "Hace 1 mes", plataforma: "1 año" }, match: "71%", matchValue: 71, matchBar: "bg-warning", matchTone: "text-warning", notes: ["Cuenta en revisión"], hiring: false },
  { uid: 7, initials: "WC", avatarBg: "bg-primary/10 text-primary", name: "Wayne Corp", status: "Activa", email: "b.wayne@corp.com", industry: "Industria", stats: { pub: "18", activos: 5, completados: "13", estudiantes: "34", ultima: "Hoy, 08:15", plataforma: "2.5 años" }, match: "83%", matchValue: 83, matchBar: "bg-warning", matchTone: "text-warning", notes: ["Proyecto activo"], hiring: true },
  { uid: 8, initials: "ML", avatarBg: "bg-secondary/10 text-secondary", name: "MindLogic AI", status: "Activa", email: "hello@mindlogic.ai", industry: "AI", stats: { pub: "9", activos: 2, completados: "6", estudiantes: "21", ultima: "Hace 3 días", plataforma: "10 meses" }, match: "89%", matchValue: 89, matchBar: "bg-accent", matchTone: "text-accent", notes: ["Buscando Especialistas"], hiring: true },
];

const INDUSTRIES = Array.from(new Set(INITIAL.map((company) => company.industry))).sort();

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</p>
      <p className="mt-0.5 font-body text-sm font-bold text-ink-strong">{value}</p>
    </div>
  );
}

const DEFAULT_FILTERS = { estado: "Todas", industria: "Todas", proyectos: "Todos", contratacion: "Todas" };

export function EmpresasView() {
  const [companies, setCompanies] = useState<Company[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [active, setActive] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (active.estado !== "Todas" && company.status !== active.estado) return false;
      if (active.industria !== "Todas" && company.industry !== active.industria) return false;
      if (active.proyectos === "Con proyectos" && company.stats.activos <= 0) return false;
      if (active.proyectos === "Sin proyectos" && company.stats.activos > 0) return false;
      if (active.contratacion === "Contratando" && !company.hiring) return false;
      if (active.contratacion === "No contratando" && company.hiring) return false;
      if (q && !`${company.name} ${company.industry} ${company.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [companies, query, active]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  function applyFilters() {
    setActive(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(DEFAULT_FILTERS);
    setActive(DEFAULT_FILTERS);
    setQuery("");
    setPage(1);
  }

  function toggleSuspend(uid: number) {
    setCompanies((prev) =>
      prev.map((company) =>
        company.uid === uid
          ? { ...company, status: company.status === "Suspendida" ? "Activa" : "Suspendida" }
          : company,
      ),
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-6 py-8 md:px-10">
      <PageTitle
        eyebrow="Administración"
        title="Empresas"
        description="Gestión y seguimiento de empresas registradas dentro de FWD Talent Marketplace."
      />

      {/* Filters */}
      <section className="rounded-2xl bg-surface-sunken p-6 ring-1 ring-border">
        <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">Filtros empresariales</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Buscar empresa, industria o contacto..."
              className="w-full rounded-lg bg-surface py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle ring-1 ring-border outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <FilterSelect rounded="lg" ariaLabel="Estado" value={draft.estado} onChange={(value) => setDraft((d) => ({ ...d, estado: value }))} options={["Todas", "Activa", "Participando", "Suspendida"].map((value) => ({ value, label: value === "Todas" ? "Estado: Todas" : value }))} />
          <FilterSelect rounded="lg" ariaLabel="Industria" value={draft.industria} onChange={(value) => setDraft((d) => ({ ...d, industria: value }))} options={["Todas", ...INDUSTRIES].map((value) => ({ value, label: value === "Todas" ? "Industria: Todas" : value }))} />
          <FilterSelect rounded="lg" ariaLabel="Estado proyectos" value={draft.proyectos} onChange={(value) => setDraft((d) => ({ ...d, proyectos: value }))} options={[{ value: "Todos", label: "Estado proyectos" }, { value: "Con proyectos", label: "Con proyectos" }, { value: "Sin proyectos", label: "Sin proyectos" }]} />
          <FilterSelect rounded="lg" ariaLabel="Contratación" value={draft.contratacion} onChange={(value) => setDraft((d) => ({ ...d, contratacion: value }))} options={[{ value: "Todas", label: "Contratación" }, { value: "Contratando", label: "Contratando" }, { value: "No contratando", label: "No contratando" }]} />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
          <Button onClick={applyFilters}>Aplicar filtros</Button>
        </div>
      </section>

      {/* Company cards */}
      <div className="space-y-5">
        {pageItems.length === 0 ? (
          <EmptyRow message="No se encontraron empresas con los filtros aplicados." />
        ) : (
          pageItems.map((company) => (
            <article key={company.uid} className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr_auto]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-full font-body text-sm font-bold ${company.avatarBg}`}>{company.initials}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-ink-strong">{company.name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[company.status]}`}>{company.status}</span>
                      </div>
                      <p className="font-body text-sm text-ink-muted">{company.email} • <span className="font-semibold text-ink">{company.industry}</span></p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
                    <StatCell label="Proyectos Pub." value={company.stats.pub} />
                    <StatCell label="Activos" value={String(company.stats.activos)} />
                    <StatCell label="Completados" value={company.stats.completados} />
                    <StatCell label="Estudiantes" value={company.stats.estudiantes} />
                    <StatCell label="Última Act." value={company.stats.ultima} />
                    <StatCell label="Plataforma" value={company.stats.plataforma} />
                  </div>
                </div>

                <div className="lg:border-l lg:border-border lg:pl-6">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-medium text-ink">Match General FWD</span>
                    <span className={`font-heading text-xl font-bold ${company.matchTone}`}>{company.match}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                    <div className={`h-full rounded-full ${company.matchBar}`} style={{ width: company.match }} />
                  </div>
                  <p className="mt-3 font-body text-xs text-ink-muted">Compatibilidad promedio entre los proyectos publicados y el talento disponible dentro de FWD.</p>
                </div>

                <div className="flex flex-col gap-3 lg:w-52">
                  <div className="flex flex-col gap-1.5">
                    {company.notes.map((note) => (
                      <span key={note} className="inline-flex items-center gap-1.5 self-start rounded-md bg-surface-sunken px-2 py-1 font-body text-xs font-medium text-ink-muted">
                        <Check className="size-3.5 text-accent" aria-hidden="true" /> {note}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full">Ver empresa</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Editar</Button>
                    {company.status === "Suspendida" ? (
                      <Button variant="outline" className="flex-1 border-accent/40 text-accent hover:bg-accent/10" onClick={() => toggleSuspend(company.uid)}>Reactivar</Button>
                    ) : (
                      <Button variant="outline" className="flex-1 border-magenta/40 text-magenta hover:bg-magenta/10" onClick={() => toggleSuspend(company.uid)}>Suspender</Button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-ink-muted">Mostrando {rangeStart}-{rangeEnd} de {filtered.length} empresas registradas</p>
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

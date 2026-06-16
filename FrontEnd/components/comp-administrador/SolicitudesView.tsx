"use client";

import { useMemo, useState } from "react";
import {
  List,
  Building2,
  Users,
  FolderOpen,
  Flag,
  User,
  ClipboardList,
  Search,
  Trash2,
  Eye,
  Check,
  X,
  Copy,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";

type RequestType = "Empresa" | "Talento" | "Proyecto" | "Reporte";
type RequestStatus = "Pendiente" | "En revisión" | "Aprobada" | "Rechazada";
type RequestPriority = "Alta" | "Media" | "Baja";
type DateBucket = "Hoy" | "Esta semana" | "Este mes";

interface Solicitud {
  uid: number;
  type: RequestType;
  title: string;
  subject: string;
  id: string;
  time: string;
  origin: string;
  status: RequestStatus;
  priority: RequestPriority;
  date: DateBucket;
}

const PAGE_SIZE = 5;

const TYPE_ICON: Record<RequestType, { icon: typeof Building2; bg: string; tone: string }> = {
  Empresa: { icon: Building2, bg: "bg-secondary/10", tone: "text-secondary" },
  Talento: { icon: User, bg: "bg-primary/10", tone: "text-primary" },
  Proyecto: { icon: ClipboardList, bg: "bg-warning/10", tone: "text-warning" },
  Reporte: { icon: Flag, bg: "bg-magenta/10", tone: "text-magenta" },
};

const STATUS_STYLE: Record<RequestStatus, { badge: string; dot: string }> = {
  Pendiente: { badge: "bg-warning/10 text-warning", dot: "bg-warning" },
  "En revisión": { badge: "bg-primary/10 text-primary", dot: "bg-primary" },
  Aprobada: { badge: "bg-accent/10 text-accent", dot: "bg-accent" },
  Rechazada: { badge: "bg-magenta/10 text-magenta", dot: "bg-magenta" },
};

const PRIORITY_STYLE: Record<RequestPriority, { badge: string; dot: string }> = {
  Alta: { badge: "bg-magenta/10 text-magenta", dot: "bg-magenta" },
  Media: { badge: "bg-highlight/20 text-ink-strong", dot: "bg-highlight" },
  Baja: { badge: "bg-accent/10 text-accent", dot: "bg-accent" },
};

const INITIAL: Solicitud[] = [
  { uid: 1, type: "Empresa", title: "Nueva empresa registrada", subject: "Global Tech Solutions", id: "EMP-2024-1287", time: "Hace 2 horas", origin: "Portal Empresas", status: "Pendiente", priority: "Alta", date: "Hoy" },
  { uid: 2, type: "Talento", title: "Solicitud de verificación", subject: "Andrea Rodríguez", id: "TAL-2024-1123", time: "Hace 5 horas", origin: "Registro Talento", status: "En revisión", priority: "Media", date: "Hoy" },
  { uid: 3, type: "Proyecto", title: "Publicación de proyecto", subject: "TechNova Solutions", id: "PRO-2024-0987", time: "Hace 1 día", origin: "Dashboard Empresa", status: "Pendiente", priority: "Media", date: "Esta semana" },
  { uid: 4, type: "Reporte", title: "Reporte de disputa", subject: "Wayne Corp", id: "REP-2024-0451", time: "Hace 1 día", origin: "Centro de Ayuda", status: "En revisión", priority: "Alta", date: "Esta semana" },
  { uid: 5, type: "Talento", title: "Actualización de portafolio", subject: "Marcos Pérez", id: "TAL-2024-1098", time: "Hace 2 días", origin: "Registro Talento", status: "Aprobada", priority: "Baja", date: "Esta semana" },
  { uid: 6, type: "Empresa", title: "Nueva empresa registrada", subject: "Stark Industries", id: "EMP-2024-1265", time: "Hace 3 días", origin: "Portal Empresas", status: "Pendiente", priority: "Media", date: "Esta semana" },
  { uid: 7, type: "Proyecto", title: "Solicitud de moderación", subject: "Cyberdyne", id: "PRO-2024-0942", time: "Hace 4 días", origin: "Dashboard Empresa", status: "Rechazada", priority: "Alta", date: "Este mes" },
  { uid: 8, type: "Talento", title: "Solicitud de verificación", subject: "Lucía Mendoza", id: "TAL-2024-1077", time: "Hace 5 días", origin: "Registro Talento", status: "Pendiente", priority: "Media", date: "Este mes" },
  { uid: 9, type: "Reporte", title: "Reporte de incidente", subject: "Modern Solutions", id: "REP-2024-0438", time: "Hace 6 días", origin: "Centro de Ayuda", status: "En revisión", priority: "Baja", date: "Este mes" },
  { uid: 10, type: "Empresa", title: "Revisión de contrato", subject: "Auto Motors Industrial", id: "EMP-2024-1241", time: "Hace 1 semana", origin: "Portal Empresas", status: "Aprobada", priority: "Media", date: "Este mes" },
  { uid: 11, type: "Proyecto", title: "Publicación de proyecto", subject: "MindLogic AI", id: "PRO-2024-0911", time: "Hace 1 semana", origin: "Dashboard Empresa", status: "Pendiente", priority: "Alta", date: "Este mes" },
  { uid: 12, type: "Talento", title: "Solicitud de verificación", subject: "Mateo Ortega", id: "TAL-2024-1054", time: "Hace 2 semanas", origin: "Registro Talento", status: "Aprobada", priority: "Baja", date: "Este mes" },
];

const STATUS_OPTIONS = ["Todos", "Pendiente", "En revisión", "Aprobada", "Rechazada"];
const TYPE_OPTIONS = ["Todos", "Empresa", "Talento", "Proyecto", "Reporte"];
const PRIORITY_OPTIONS = ["Todos", "Alta", "Media", "Baja"];
const DATE_OPTIONS = ["Todos", "Hoy", "Esta semana", "Este mes"];

function PillBadge({ label, badge, dot }: { label: string; badge: string; dot: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium ${badge}`}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" /> {label}
    </span>
  );
}

export function SolicitudesView() {
  const [items, setItems] = useState<Solicitud[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [prioridad, setPrioridad] = useState("Todos");
  const [fecha, setFecha] = useState("Todos");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const counts = useMemo(
    () => ({
      total: items.length,
      Empresa: items.filter((item) => item.type === "Empresa").length,
      Talento: items.filter((item) => item.type === "Talento").length,
      Proyecto: items.filter((item) => item.type === "Proyecto").length,
      Reporte: items.filter((item) => item.type === "Reporte").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (estado !== "Todos" && item.status !== estado) return false;
      if (tipo !== "Todos" && item.type !== tipo) return false;
      if (prioridad !== "Todos" && item.priority !== prioridad) return false;
      if (fecha !== "Todos" && item.date !== fecha) return false;
      if (q && !`${item.title} ${item.subject} ${item.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, estado, tipo, prioridad, fecha]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const STATS = [
    { icon: List, iconBg: "bg-primary/10", iconTone: "text-primary", badge: "Global", badgeTone: "bg-primary/10 text-primary", value: counts.total, label: "Todas" },
    { icon: Building2, iconBg: "bg-secondary/10", iconTone: "text-secondary", badge: "B2B", badgeTone: "bg-secondary/10 text-secondary", value: counts.Empresa, label: "Empresas" },
    { icon: Users, iconBg: "bg-primary/10", iconTone: "text-primary", badge: "B2C", badgeTone: "bg-primary/10 text-primary", value: counts.Talento, label: "Talentos" },
    { icon: FolderOpen, iconBg: "bg-warning/10", iconTone: "text-warning", badge: "Activos", badgeTone: "bg-warning/10 text-warning", value: counts.Proyecto, label: "Proyectos" },
    { icon: Flag, iconBg: "bg-magenta/10", iconTone: "text-magenta", badge: "Críticos", badgeTone: "bg-magenta/10 text-magenta", value: counts.Reporte, label: "Reportes" },
  ];

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setQuery("");
    setEstado("Todos");
    setTipo("Todos");
    setPrioridad("Todos");
    setFecha("Todos");
    setPage(1);
  }

  function setStatus(uid: number, status: RequestStatus) {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, status } : item)));
  }

  function duplicate(uid: number) {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.uid === uid);
      if (index < 0) return prev;
      const original = prev[index];
      if (!original) return prev;
      const nextUid = Math.max(...prev.map((item) => item.uid)) + 1;
      const copy: Solicitud = { ...original, uid: nextUid, time: "Hace un momento", status: "Pendiente" };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }

  const ACTIONS = (item: Solicitud) => [
    { icon: Eye, label: "Ver", ring: "ring-border", tone: "text-ink-muted", onClick: () => setExpanded((id) => (id === item.uid ? null : item.uid)) },
    { icon: Check, label: "Aprobar", ring: "ring-accent/40", tone: "text-accent", onClick: () => setStatus(item.uid, "Aprobada") },
    { icon: X, label: "Rechazar", ring: "ring-magenta/40", tone: "text-magenta", onClick: () => setStatus(item.uid, "Rechazada") },
    { icon: Copy, label: "Duplicar", ring: "ring-primary/40", tone: "text-primary", onClick: () => duplicate(item.uid) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
      <PageTitle
        eyebrow="Administración"
        title="Solicitudes"
        description="Revisá y gestioná todas las solicitudes del ecosistema FWD Talent."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STATS.map(({ icon: Icon, iconBg, iconTone, badge, badgeTone, value, label }) => (
          <div key={label} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
            <div className="flex items-start justify-between">
              <span className={`flex size-11 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`size-5 ${iconTone}`} aria-hidden="true" />
              </span>
              <span className={`rounded-md px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}>
                {badge}
              </span>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-ink-strong">{value}</p>
            <p className="mt-1 font-body text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(event) => resetPage(setQuery)(event.target.value)}
              placeholder="Buscar solicitud..."
              className="w-full rounded-full bg-surface-sunken py-2.5 pl-10 pr-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <FilterSelect ariaLabel="Estado" value={estado} onChange={resetPage(setEstado)} options={STATUS_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Estado: Todos" : value }))} />
          <FilterSelect ariaLabel="Tipo" value={tipo} onChange={resetPage(setTipo)} options={TYPE_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Tipo: Todos" : value }))} />
          <FilterSelect ariaLabel="Prioridad" value={prioridad} onChange={resetPage(setPrioridad)} options={PRIORITY_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Prioridad: Todos" : value }))} />
          <FilterSelect ariaLabel="Fecha" value={fecha} onChange={resetPage(setFecha)} options={DATE_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Fecha: Todos" : value }))} />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Limpiar filtros
          </button>
        </div>
      </section>

      {/* Request list */}
      <div className="space-y-4">
        {pageItems.length === 0 ? (
          <EmptyRow message="No se encontraron solicitudes con los filtros aplicados." />
        ) : (
          pageItems.map((item) => {
            const typeIcon = TYPE_ICON[item.type];
            const Icon = typeIcon.icon;
            const status = STATUS_STYLE[item.status];
            const priority = PRIORITY_STYLE[item.priority];
            const isOpen = expanded === item.uid;
            return (
              <article
                key={item.uid}
                className={`rounded-2xl bg-surface p-5 shadow-soft ring-1 transition-shadow ${isOpen ? "ring-primary/40" : "ring-border"}`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${typeIcon.bg}`}>
                    <Icon className={`size-5 ${typeIcon.tone}`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-bold text-ink-strong">{item.title}</h3>
                    <p className="font-body text-sm text-ink">{item.subject}</p>
                    <p className="mt-1 font-body text-xs text-ink-muted">
                      ID: {item.id} <span className="text-ink-subtle">•</span> {item.time}{" "}
                      <span className="text-ink-subtle">•</span> Origen: {item.origin}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <PillBadge label={item.status} badge={status.badge} dot={status.dot} />
                    <PillBadge label={item.priority} badge={priority.badge} dot={priority.dot} />
                  </div>
                  <div className="flex items-center gap-2">
                    {ACTIONS(item).map(({ icon: ActionIcon, label, ring, tone, onClick }) => (
                      <button
                        key={label}
                        type="button"
                        aria-label={label}
                        onClick={onClick}
                        className={`inline-flex size-9 items-center justify-center rounded-lg ring-1 transition-colors hover:bg-surface-sunken ${ring} ${tone}`}
                      >
                        <ActionIcon className="size-4" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 font-body text-xs text-ink-muted sm:grid-cols-4">
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Tipo</span>{item.type}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Estado</span>{item.status}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Prioridad</span>{item.priority}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Origen</span>{item.origin}</div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="font-body text-sm text-ink-muted">
          Mostrando <span className="font-semibold text-ink-strong">{rangeStart} a {rangeEnd}</span> de{" "}
          <span className="font-semibold text-ink-strong">{filtered.length}</span> solicitudes
        </p>
        <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="square" />
      </div>
    </div>
  );
}

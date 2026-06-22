"use client";

import { useMemo, useState, useTransition } from "react";
import {
  List,
  Building2,
  Users,
  FolderOpen,
  Flag,
  User,
  Search,
  Trash2,
  Eye,
  Check,
  X,
  UserMinus,
  Loader2,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";
import {
  approveAdminUserAction,
  rejectAdminUserAction,
  suspendAdminUserAction,
} from "@/lib/actions/admin";
import type { AdminPendingUser } from "@/lib/api/types";

const PAGE_SIZE = 5;

type SolicitudTipo = "Empresa" | "Emprendedor" | "Talento" | "Otro";

/** Distingue empresa de emprendedor (empresario.tipo) además de talento. */
function roleType(user: AdminPendingUser): SolicitudTipo {
  const role = user.role?.nombre;
  if (role === "company") return user.empresario?.tipo === "emprendedor" ? "Emprendedor" : "Empresa";
  if (role === "student") return "Talento";
  return "Otro";
}

const TYPE_META: Record<string, { icon: typeof Building2; bg: string; tone: string; title: string; origin: string }> = {
  Empresa: { icon: Building2, bg: "bg-secondary/10", tone: "text-secondary", title: "Nueva empresa registrada", origin: "Portal Empresas" },
  Emprendedor: { icon: User, bg: "bg-accent/10", tone: "text-accent", title: "Nuevo emprendedor registrado", origin: "Portal Emprendedores" },
  Talento: { icon: User, bg: "bg-primary/10", tone: "text-primary", title: "Solicitud de verificación", origin: "Registro Talento" },
  Otro: { icon: Flag, bg: "bg-warning/10", tone: "text-warning", title: "Solicitud de cuenta", origin: "Registro" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function dateBucket(iso: string | null): "Hoy" | "Esta semana" | "Este mes" | "Anterior" {
  if (!iso) return "Anterior";
  const date = new Date(iso).getTime();
  if (Number.isNaN(date)) return "Anterior";
  const days = (Date.now() - date) / 86_400_000;
  if (days < 1) return "Hoy";
  if (days < 7) return "Esta semana";
  if (days < 31) return "Este mes";
  return "Anterior";
}

const TYPE_OPTIONS = ["Todos", "Empresa", "Emprendedor", "Talento", "Otro"];
const DATE_OPTIONS = ["Todos", "Hoy", "Esta semana", "Este mes"];

export function SolicitudesView({ initialUsers }: { initialUsers: AdminPendingUser[] }) {
  const [users, setUsers] = useState<AdminPendingUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [fecha, setFecha] = useState("Todos");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      total: users.length,
      empresas: users.filter((u) => u.role?.nombre === "company").length,
      talentos: users.filter((u) => u.role?.nombre === "student").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const type = roleType(user);
      if (tipo !== "Todos" && type !== tipo) return false;
      if (fecha !== "Todos" && dateBucket(user.fecha_registro) !== fecha) return false;
      const haystack = `${user.nombre} ${user.apellido1 ?? ""} ${user.correo} ${user.id}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      return true;
    });
  }, [users, query, tipo, fecha]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const STATS = [
    { icon: List, iconBg: "bg-primary/10", iconTone: "text-primary", badge: "Global", badgeTone: "bg-primary/10 text-primary", value: counts.total, label: "Todas" },
    { icon: Building2, iconBg: "bg-secondary/10", iconTone: "text-secondary", badge: "B2B", badgeTone: "bg-secondary/10 text-secondary", value: counts.empresas, label: "Empresas" },
    { icon: Users, iconBg: "bg-primary/10", iconTone: "text-primary", badge: "B2C", badgeTone: "bg-primary/10 text-primary", value: counts.talentos, label: "Talentos" },
    { icon: FolderOpen, iconBg: "bg-warning/10", iconTone: "text-warning", badge: "Activos", badgeTone: "bg-warning/10 text-warning", value: 0, label: "Proyectos" },
    { icon: Flag, iconBg: "bg-magenta/10", iconTone: "text-magenta", badge: "Críticos", badgeTone: "bg-magenta/10 text-magenta", value: 0, label: "Reportes" },
  ];

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setQuery("");
    setTipo("Todos");
    setFecha("Todos");
    setPage(1);
  }

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3500);
  }

  function runAction(
    user: AdminPendingUser,
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
    successText: string,
  ) {
    startTransition(async () => {
      const result = await action(user.id);
      if (!result.ok) {
        flash(result.error ?? "No se pudo completar la acción");
        return;
      }
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      flash(successText);
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-elevated">
          {message}
        </div>
      )}

      <PageTitle
        eyebrow="Administración"
        title="Solicitudes"
        description="Revisá y gestioná las solicitudes de admisión pendientes del ecosistema FWD Talent."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STATS.map(({ icon: Icon, iconBg, iconTone, badge, badgeTone, value, label }) => (
          <div key={label} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
            <div className="flex items-start justify-between">
              <span className={`flex size-11 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`size-5 ${iconTone}`} aria-hidden="true" />
              </span>
              <span className={`rounded-md px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}>{badge}</span>
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
              placeholder="Buscar por nombre, correo o ID..."
              className="w-full rounded-full bg-surface-sunken py-2.5 pl-10 pr-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <FilterSelect ariaLabel="Tipo" value={tipo} onChange={resetPage(setTipo)} options={TYPE_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Tipo: Todos" : value }))} />
          <FilterSelect ariaLabel="Fecha" value={fecha} onChange={resetPage(setFecha)} options={DATE_OPTIONS.map((value) => ({ value, label: value === "Todos" ? "Fecha: Todos" : value }))} />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline">
            <Trash2 className="size-4" aria-hidden="true" /> Limpiar filtros
          </button>
        </div>
      </section>

      {/* List */}
      <div className="space-y-4">
        {pageItems.length === 0 ? (
          <EmptyRow message="No hay solicitudes pendientes con los filtros aplicados." />
        ) : (
          pageItems.map((user) => {
            const type = roleType(user);
            const meta = TYPE_META[type] ?? TYPE_META.Otro!;
            const Icon = meta.icon;
            const isOpen = expanded === user.id;
            const fullName = [user.nombre, user.apellido1].filter(Boolean).join(" ") || user.correo;
            return (
              <article key={user.id} className={`rounded-2xl bg-surface p-5 shadow-soft ring-1 transition-shadow ${isOpen ? "ring-primary/40" : "ring-border"}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                    <Icon className={`size-5 ${meta.tone}`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-bold text-ink-strong">{meta.title}</h3>
                    <p className="font-body text-sm text-ink">{fullName}</p>
                    <p className="mt-1 font-body text-xs text-ink-muted">
                      ID: {user.id.slice(0, 8)} <span className="text-ink-subtle">•</span> {formatDate(user.fecha_registro)}{" "}
                      <span className="text-ink-subtle">•</span> Origen: {meta.origin}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 font-body text-xs font-medium text-warning">
                    <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" /> Pendiente
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Ver detalle" onClick={() => setExpanded((id) => (id === user.id ? null : user.id))} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken">
                      <Eye className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Aprobar" disabled={isPending} onClick={() => runAction(user, approveAdminUserAction, "Solicitud aprobada")} className="inline-flex size-9 items-center justify-center rounded-lg text-accent ring-1 ring-accent/40 transition-colors hover:bg-accent/10 disabled:opacity-50">
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" aria-hidden="true" />}
                    </button>
                    <button type="button" aria-label="Rechazar" disabled={isPending} onClick={() => runAction(user, rejectAdminUserAction, "Solicitud rechazada")} className="inline-flex size-9 items-center justify-center rounded-lg text-magenta ring-1 ring-magenta/40 transition-colors hover:bg-magenta/10 disabled:opacity-50">
                      <X className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Suspender" disabled={isPending} onClick={() => runAction(user, suspendAdminUserAction, "Cuenta suspendida")} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken">
                      <UserMinus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 font-body text-xs text-ink-muted sm:grid-cols-4">
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Correo</span>{user.correo}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Tipo</span>{type}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Estado</span>{user.estado_cuenta}</div>
                    <div><span className="block font-semibold uppercase tracking-wider text-ink-subtle">Registro</span>{formatDate(user.fecha_registro)}</div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

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

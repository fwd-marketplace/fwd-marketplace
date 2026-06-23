"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  List,
  Building2,
  Users,
  FolderOpen,
  Flag,
  User,
  GraduationCap,
  Search,
  Trash2,
  Eye,
  Check,
  X,
  UserMinus,
  Loader2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { FilterSelect, Pagination, EmptyRow, ProfileAvatar } from "@/components/comp-administrador/admin-controls";
import {
  approveAdminUserAction,
  getAdminUserDetailAction,
  rejectAdminUserAction,
  suspendAdminUserAction,
} from "@/lib/actions/admin";
import type { AdminPendingUser, AdminUserDetail } from "@/lib/api/types";

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

// Etiquetas legibles para los valores enumerados que guarda la BD en inglés.
const ROLE_LABEL: Record<string, string> = { student: "Talento", company: "Empresa", admin: "Administrador" };
const ESPECIALIDAD_LABEL: Record<string, string> = { frontend: "Frontend", backend: "Backend", fullstack: "Fullstack", ia: "IA" };
const DISPONIBILIDAD_LABEL: Record<string, string> = { immediate: "Inmediata", two_weeks: "En dos semanas", one_month: "En un mes", unavailable: "No disponible" };
const VERIFICACION_LABEL: Record<string, string> = { pendiente: "Pendiente", verificado: "Verificado", rechazado: "Rechazado" };
const ETAPA_LABEL: Record<string, string> = { idea: "Idea", mvp: "MVP", validating: "Validando", scaling: "Escalando" };
const PRESUPUESTO_LABEL: Record<string, string> = { under_500: "Menos de $500", range_500_1000: "$500 a $1.000", range_1000_2500: "$1.000 a $2.500", flexible: "Flexible" };
const HORARIO_LABEL: Record<string, string> = { flexible: "Flexible", fixed: "Fijo" };

function translate(map: Record<string, string>, value: string | null | undefined): string | null {
  if (!value) return null;
  return map[value] ?? value;
}

/** Celda etiqueta + valor dentro de una sección; se oculta si el valor está vacío. */
function DetailField({ label, value, full }: { label: string; value: string | number | null | undefined; full?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 break-words font-body text-sm font-medium text-ink-strong">{value}</dd>
    </div>
  );
}

type DetailLinkItem = { label: string; href: string | null; icon: typeof Globe };

/** Fila de enlaces externos como pills; se omiten los que no tienen URL. */
function DetailLinks({ links }: { links: DetailLinkItem[] }) {
  const visible = links.filter((link) => link.href);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1 sm:col-span-2">
      {visible.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-body text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/20"
        >
          <Icon className="size-3.5" aria-hidden="true" /> {label}
        </a>
      ))}
    </div>
  );
}

/** Tarjeta de sección con encabezado (icono + título) y grilla de campos. */
function DetailSection({ icon: Icon, title, accent, children }: { icon: typeof User; title: string; accent: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-canvas/60 p-5 ring-1 ring-border">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`flex size-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-ink-strong">{title}</h4>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

/**
 * Modal con TODA la información disponible del solicitante. Carga el detalle al montar
 * (mismo patrón que el modal de gestión de usuarios) y se cierra con Escape, click fuera
 * o el botón cerrar.
 */
function SolicitanteDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const titleId = "solicitud-detail-title";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    getAdminUserDetailAction(userId).then((result) => {
      if (!active) return;
      if (result.ok) setDetail(result.data.user);
      else setError(result.error);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const fullName = detail
    ? [detail.nombre, detail.apellido1, detail.apellido2].filter(Boolean).join(" ") || detail.correo
    : "";
  const estudiante = detail?.estudiante;
  const empresario = detail?.empresario;
  const tipoLabel = empresario
    ? empresario.tipo === "emprendedor"
      ? "Emprendedor"
      : "Empresa"
    : estudiante
      ? "Talento"
      : translate(ROLE_LABEL, detail?.role?.nombre);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-strong/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface shadow-elevated ring-1 ring-border duration-[var(--duration-base)] ease-[var(--ease-out)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
          <div className="flex min-w-0 items-center gap-4">
            <ProfileAvatar
              photoUrl={detail?.url_foto ?? null}
              fallback={detail ? buildInitials(fullName) : "--"}
              name={fullName}
              size="lg"
            />
            <div className="min-w-0">
              <h2 id={titleId} className="truncate font-heading text-xl font-bold tracking-tight text-ink-strong">
                {detail ? fullName : "Detalle de la solicitud"}
              </h2>
              <p className="font-body text-sm text-ink-muted">Información completa del solicitante</p>
              {detail && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {tipoLabel && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-primary">
                      {tipoLabel}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-warning">
                    <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" /> {detail.estado_cuenta}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 font-body text-sm text-ink-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Cargando perfil del solicitante...
            </div>
          ) : error ? (
            <p className="py-12 text-center font-body text-sm font-medium text-magenta">{error}</p>
          ) : detail ? (
            <>
              <DetailSection icon={User} title="Cuenta" accent="bg-primary/10 text-primary">
                <DetailField label="Nombre completo" value={fullName} />
                <DetailField label="Correo" value={detail.correo} />
                <DetailField label="Cedula" value={detail.cedula} />
                <DetailField label="Rol" value={translate(ROLE_LABEL, detail.role?.nombre)} />
                <DetailField label="Estado de cuenta" value={detail.estado_cuenta} />
                <DetailField label="Fecha de registro" value={formatDate(detail.fecha_registro)} />
                <DetailField label="ID" value={detail.id} full />
              </DetailSection>

              {estudiante && (
                <DetailSection icon={GraduationCap} title="Perfil de talento" accent="bg-accent/10 text-accent">
                  <DetailField label="Especialidad" value={translate(ESPECIALIDAD_LABEL, estudiante.especialidad)} />
                  <DetailField label="Disponibilidad" value={translate(DISPONIBILIDAD_LABEL, estudiante.disponibilidad)} />
                  <DetailField label="Modalidad preferida" value={estudiante.modalidad_preferida} />
                  <DetailField label="Titulo FWD" value={estudiante.titulo_fwd} />
                  <DetailField label="Verificacion" value={translate(VERIFICACION_LABEL, estudiante.estado_verificacion)} />
                  <DetailField label="Reputacion" value={estudiante.reputacion} />
                  <DetailField label="Descripcion" value={estudiante.descripcion} full />
                  <DetailField label="Skills" value={estudiante.skills.length > 0 ? estudiante.skills.join(", ") : null} full />
                  <DetailLinks
                    links={[
                      { label: "GitHub", href: estudiante.url_github, icon: ExternalLink },
                      { label: "LinkedIn", href: estudiante.url_linkedin, icon: ExternalLink },
                      { label: "Portafolio", href: estudiante.url_portfolio, icon: Globe },
                    ]}
                  />
                </DetailSection>
              )}

              {empresario && (
                <DetailSection icon={Building2} title="Perfil de empresa" accent="bg-secondary/10 text-secondary">
                  <DetailField label="Nombre comercial" value={empresario.nombre_comercial} />
                  <DetailField label="Tipo" value={empresario.tipo === "emprendedor" ? "Emprendedor" : "Empresa"} />
                  <DetailField label="Cedula juridica" value={empresario.cedula_juridica} />
                  <DetailField label="Sector" value={empresario.sector} />
                  <DetailField label="Etapa" value={translate(ETAPA_LABEL, empresario.etapa)} />
                  <DetailField label="Cantidad de empleados" value={empresario.cantidad_empleados} />
                  <DetailField label="Modalidades" value={empresario.modalidades} />
                  <DetailField label="Horario" value={translate(HORARIO_LABEL, empresario.horario)} />
                  <DetailField label="Presupuesto" value={translate(PRESUPUESTO_LABEL, empresario.presupuesto)} />
                  <DetailField label="Direccion" value={empresario.direccion} full />
                  <DetailField label="Tipos de proyecto" value={empresario.tipos_proyecto} full />
                  <DetailField label="Descripcion" value={empresario.descripcion} full />
                  <DetailField label="Apoyo tecnico necesario" value={empresario.apoyo_tecnico_necesario} full />
                  <DetailField label="Mision" value={empresario.mision} full />
                  <DetailField label="Vision" value={empresario.vision} full />
                  <DetailField label="Cultura" value={empresario.cultura} full />
                  <DetailField label="Valores" value={empresario.valores} full />
                  <DetailField label="Contactos" value={empresario.contactos} full />
                  <DetailLinks links={[{ label: "Sitio web", href: empresario.url_sitio_web, icon: Globe }]} />
                </DetailSection>
              )}

              {!estudiante && !empresario && (
                <p className="py-4 text-center font-body text-sm text-ink-muted">
                  Este usuario no tiene un perfil adicional asociado.
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border bg-surface-sunken p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 font-body text-sm font-semibold text-ink-strong ring-1 ring-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Iniciales para el avatar cuando el solicitante no tiene foto. */
function buildInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`.toUpperCase();
}

export function SolicitudesView({ initialUsers }: { initialUsers: AdminPendingUser[] }) {
  const [users, setUsers] = useState<AdminPendingUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [fecha, setFecha] = useState("Todos");
  const [page, setPage] = useState(1);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
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
            const fullName = [user.nombre, user.apellido1].filter(Boolean).join(" ") || user.correo;
            return (
              <article key={user.id} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border transition-shadow">
                <div className="flex flex-wrap items-center gap-4">
                  {user.url_foto ? (
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.url_foto} alt={fullName} className="size-full object-cover" />
                    </span>
                  ) : (
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                      <Icon className={`size-5 ${meta.tone}`} aria-hidden="true" />
                    </span>
                  )}
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
                    <button type="button" aria-label="Ver detalle" onClick={() => setDetailUserId(user.id)} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken">
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

      {detailUserId && <SolicitanteDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}
    </div>
  );
}

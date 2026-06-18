"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Search,
  ChevronRight,
  Check,
  Users,
  Building2,
  Briefcase,
  FileText,
  BarChart2,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveAdminUserAction, cancelAdminProjectAction } from "@/lib/actions/admin";
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
};

const MODULES = [
  { icon: Users, title: "Talento", description: "Gestión de perfiles y habilidades", href: "/admin/talento" },
  { icon: Building2, title: "Empresas", description: "Partners corporativos y contratos", href: "/admin/empresas" },
  { icon: Briefcase, title: "Proyectos", description: "Hitos, pagos y moderación", href: "/admin/proyectos" },
  { icon: FileText, title: "Solicitudes", description: "Admisiones y verificaciones", href: "/admin/solicitudes" },
  { icon: BarChart2, title: "Reportes", description: "Estadísticas avanzadas y KPIs", href: "/admin/reportes" },
  { icon: Settings, title: "Configuración", description: "Parámetros globales del sistema", href: "/admin/configuracion" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(date);
}

function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "F";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "W";
  return `${first}${second}`.toUpperCase();
}

export function DashboardView({
  pendingUsers,
  projects,
}: {
  pendingUsers: AdminPendingUser[];
  projects: AdminProject[];
}) {
  const locale = useLocale();
  const [admissionQuery, setAdmissionQuery] = useState("");
  const [admissions, setAdmissions] = useState(pendingUsers);
  const [moderation, setModeration] = useState(projects.filter((p) => p.estado.nombre !== "cancelado"));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const companies = pendingUsers.filter((u) => u.role?.nombre === "company").length;
    const students = pendingUsers.filter((u) => u.role?.nombre === "student").length;
    const active = projects.filter((p) => ACTIVE_STATES.includes(p.estado.nombre)).length;
    const cancelled = projects.filter((p) => p.estado.nombre === "cancelado").length;
    return [
      { label: "Empresas", value: String(companies), caption: "Pendientes de aprobación" },
      { label: "Talento", value: String(students), caption: "Pendientes de verificación" },
      { label: "Proyectos", value: String(projects.length), caption: "Total en el sistema" },
      { label: "Activos", value: String(active), caption: "En ejecución" },
      { label: "Solicitudes", value: String(pendingUsers.length), caption: "Pendientes de revisión", highlight: true },
      { label: "Cancelados", value: String(cancelled), caption: "Proyectos cancelados" },
    ];
  }, [pendingUsers, projects]);

  const filteredAdmissions = useMemo(() => {
    const q = admissionQuery.trim().toLowerCase();
    if (!q) return admissions;
    return admissions.filter((u) => `${u.nombre} ${u.apellido1 ?? ""} ${u.correo}`.toLowerCase().includes(q));
  }, [admissions, admissionQuery]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3500);
  }

  function approveAdmission(id: string) {
    startTransition(async () => {
      const result = await approveAdminUserAction(id);
      if (!result.ok) {
        flash(result.error ?? "No se pudo aprobar");
        return;
      }
      setAdmissions((prev) => prev.filter((u) => u.id !== id));
      flash("Solicitud aprobada");
    });
  }

  function cancelModeration(id: string) {
    startTransition(async () => {
      const result = await cancelAdminProjectAction(id);
      if (!result.ok) {
        flash(result.error ?? "No se pudo cancelar");
        return;
      }
      setModeration((prev) => prev.filter((p) => p.id !== id));
      flash("Proyecto cancelado");
    });
  }

  function dismissModeration(id: string) {
    setModeration((prev) => prev.filter((p) => p.id !== id));
    flash("Proyecto aprobado");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-elevated">
          {message}
        </div>
      )}

      <header>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink-strong md:text-5xl">
          Dashboard<span className="text-primary" aria-hidden="true">.</span>
        </h1>
        <p className="mt-2 font-body text-sm text-ink-muted">Resumen operativo del ecosistema FWD Talent con datos en vivo.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border ${stat.highlight ? "border-l-4 border-warning" : ""}`}>
            <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{stat.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-ink-strong">{stat.value}</p>
            <p className="mt-1 font-body text-xs text-ink-subtle">{stat.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Solicitudes de admisión */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">Solicitudes de Admisión</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                  <input type="text" value={admissionQuery} onChange={(e) => setAdmissionQuery(e.target.value)} placeholder="Buscar..." className="w-44 rounded-lg bg-surface-sunken py-2 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <Link href={`/${locale}/admin/solicitudes`} className="font-body text-sm font-semibold text-primary hover:underline">Ver todas</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    <th className="pb-3">Candidato</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAdmissions.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center font-body text-sm text-ink-muted">No hay solicitudes pendientes.</td></tr>
                  )}
                  {filteredAdmissions.slice(0, 5).map((user) => (
                    <tr key={user.id} className="font-body text-sm">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-xs font-bold text-primary">{initials([user.nombre, user.apellido1].filter(Boolean).join(" ") || user.correo)}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-strong">{[user.nombre, user.apellido1].filter(Boolean).join(" ") || user.correo}</p>
                            <p className="text-xs text-ink-muted">{user.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink">{user.role?.nombre === "company" ? "Empresa" : user.role?.nombre === "student" ? "Talento" : "Cuenta"}</span>
                      </td>
                      <td className="py-3.5 text-ink-muted">{formatDate(user.fecha_registro)}</td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-ink"><span className="size-2 rounded-full bg-warning" aria-hidden="true" /> Pendiente</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button type="button" aria-label="Aprobar solicitud" disabled={isPending} onClick={() => approveAdmission(user.id)} className="inline-flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors hover:bg-accent/20 disabled:opacity-50">
                          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" aria-hidden="true" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Moderación */}
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">Moderación de Proyectos</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-primary">{moderation.length} activos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    <th className="pb-3">Proyecto</th>
                    <th className="pb-3">Empresa</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {moderation.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center font-body text-sm text-ink-muted">No hay proyectos por moderar.</td></tr>
                  )}
                  {moderation.slice(0, 6).map((project) => (
                    <tr key={project.id} className="font-body text-sm">
                      <td className="py-4 font-semibold text-ink-strong">{project.titulo}</td>
                      <td className="py-4 text-ink">{project.empresa?.nombre_comercial ?? "—"}</td>
                      <td className="py-4 text-ink-muted">{STATE_LABEL[project.estado.nombre] ?? project.estado.nombre}</td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="accent" size="sm" className="rounded-lg" disabled={isPending} onClick={() => dismissModeration(project.id)}>Aprobar</Button>
                          <Button size="sm" className="rounded-lg bg-ink-muted text-white hover:bg-ink-muted/85" disabled={isPending} onClick={() => cancelModeration(project.id)}>Ocultar</Button>
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
            {MODULES.map(({ icon: Icon, title, description, href }) => (
              <div key={title} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
                <Icon className="size-6 text-primary" aria-hidden="true" />
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
          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-5 font-heading text-base font-bold text-ink-strong">Resumen</h2>
            <ul className="space-y-4 font-body text-sm">
              <li className="flex items-center justify-between"><span className="text-ink-muted">Solicitudes pendientes</span><span className="font-bold text-ink-strong">{pendingUsers.length}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-muted">Proyectos totales</span><span className="font-bold text-ink-strong">{projects.length}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-muted">Por moderar</span><span className="font-bold text-ink-strong">{moderation.length}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-muted">Empresas pendientes</span><span className="font-bold text-ink-strong">{pendingUsers.filter((u) => u.role?.nombre === "company").length}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-muted">Talento pendiente</span><span className="font-bold text-ink-strong">{pendingUsers.filter((u) => u.role?.nombre === "student").length}</span></li>
            </ul>
          </section>

          <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
            <h2 className="mb-3 font-heading text-base font-bold text-ink-strong">Accesos rápidos</h2>
            <div className="space-y-2">
              <Link href={`/${locale}/admin/solicitudes`} className="flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3 font-body text-sm font-semibold text-ink-strong hover:bg-border/40">Revisar solicitudes <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" /></Link>
              <Link href={`/${locale}/admin/proyectos`} className="flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3 font-body text-sm font-semibold text-ink-strong hover:bg-border/40">Moderar proyectos <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" /></Link>
              <Link href={`/${locale}/admin/reportes`} className="flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3 font-body text-sm font-semibold text-ink-strong hover:bg-border/40">Ver reportes <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutGrid,
  Columns3,
  Table,
  Search,
  Calendar,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";
import { cancelAdminProjectAction, getAdminProjectDetailAction } from "@/lib/actions/admin";
import type { AdminProject, ApiProject, ProjectState } from "@/lib/api/types";

type ViewMode = "cards" | "kanban" | "tabla";

const PAGE_SIZE = 6;

const STATE_META: Record<ProjectState, { label: string; tone: string }> = {
  borrador: { label: "Borrador", tone: "bg-surface-sunken text-ink-muted" },
  en_recepcion: { label: "En recepción", tone: "bg-primary/10 text-primary" },
  en_evaluacion: { label: "En evaluación", tone: "bg-secondary/10 text-secondary" },
  adjudicado: { label: "Adjudicado", tone: "bg-accent/10 text-accent" },
  en_desarrollo: { label: "En desarrollo", tone: "bg-primary/10 text-primary" },
  cerrado: { label: "Cerrado", tone: "bg-accent/10 text-accent" },
  cancelado: { label: "Cancelado", tone: "bg-magenta/10 text-magenta" },
};

const ACTIVE_STATES: ProjectState[] = ["en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo"];

const VIEWS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "kanban", label: "Kanban", icon: Columns3 },
  { value: "tabla", label: "Tabla", icon: Table },
];

const KANBAN_COLUMNS: ProjectState[] = ["en_recepcion", "en_evaluacion", "en_desarrollo", "cerrado"];

function stateMeta(state: ProjectState) {
  return STATE_META[state] ?? { label: state, tone: "bg-surface-sunken text-ink-muted" };
}

function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "P";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "R";
  return `${first}${second}`.toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "Sin publicar";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin publicar";
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 font-body text-sm font-medium text-ink-strong">{value}</dd>
    </div>
  );
}

function ProjectDetailModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const t = useTranslations("admin_proyectos");
  const locale = useLocale();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const titleId = "proyecto-detail-title";

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getAdminProjectDetailAction(projectId).then((result) => {
      if (!active) return;
      if (result.ok) setProject(result.data);
      else setError(result.error);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function formatModalDate(iso: string | null): string {
    if (!iso) return t("detail.unpublished");
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return t("detail.unpublished");
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  const skills = project
    ? project.skills.map((entry) => entry.skill?.nombre).filter((value): value is string => Boolean(value)).join(", ")
    : "";
  const extraTech = project?.tecnologias_extra?.join(", ") ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-strong/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-elevated ring-1 ring-border duration-[var(--duration-base)] ease-[var(--ease-out)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-heading text-xl font-bold tracking-tight text-ink-strong">{project ? project.titulo : t("detail.title")}</h2>
            <p className="font-body text-sm text-ink-muted">{t("detail.subtitle")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail.close")}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 font-body text-sm text-ink-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("detail.loading")}
            </div>
          ) : error ? (
            <p className="py-8 text-center font-body text-sm text-magenta">{error}</p>
          ) : project ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${stateMeta(project.estado.nombre).tone}`}>
                  {stateMeta(project.estado.nombre).label}
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {project.empresa?.nombre_comercial && <DetailRow label={t("detail.company")} value={project.empresa.nombre_comercial} />}
                {project.empresa?.tipo && <DetailRow label={t("detail.type")} value={project.empresa.tipo} />}
                {project.area?.nombre && <DetailRow label={t("detail.area")} value={project.area.nombre} />}
                <DetailRow label={t("detail.deadline")} value={t("detail.deadline_days", { days: project.plazo_dias })} />
                <DetailRow label={t("detail.uses_ai")} value={project.usa_ia ? t("detail.yes") : t("detail.no")} />
                <DetailRow label={t("detail.published")} value={formatModalDate(project.fecha_publicacion)} />
                <DetailRow label={t("detail.closing")} value={formatModalDate(project.fecha_cierre)} />
                <DetailRow label={t("detail.id")} value={project.id} />
                {extraTech && <DetailRow label={t("detail.extra_tech")} value={extraTech} />}
                {skills && <DetailRow label={t("detail.skills")} value={skills} />}
              </dl>
              <div>
                <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{t("detail.description")}</p>
                <p className="mt-1 whitespace-pre-line font-body text-sm leading-relaxed text-ink">{project.descripcion || t("detail.no_description")}</p>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-border bg-surface-sunken p-4">
          <Button variant="outline" onClick={onClose}>{t("detail.close")}</Button>
        </div>
      </div>
    </div>
  );
}

export function ProyectosView({ initialProjects }: { initialProjects: AdminProject[] }) {
  const t = useTranslations("admin_proyectos");
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [view, setView] = useState<ViewMode>("cards");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [page, setPage] = useState(1);
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      total: projects.length,
      activos: projects.filter((p) => ACTIVE_STATES.includes(p.estado.nombre)).length,
      seleccion: projects.filter((p) => p.estado.nombre === "en_recepcion" || p.estado.nombre === "en_evaluacion").length,
      finalizados: projects.filter((p) => p.estado.nombre === "cerrado").length,
    }),
    [projects],
  );

  const estadoOptions = useMemo(() => {
    const present = Array.from(new Set(projects.map((p) => p.estado.nombre)));
    return ["Todos", ...present];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (estado !== "Todos" && project.estado.nombre !== estado) return false;
      const haystack = `${project.titulo} ${project.empresa?.nombre_comercial ?? ""}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      return true;
    });
  }, [projects, query, estado]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = view === "kanban" ? filtered : filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3500);
  }

  function cancelProject(id: string) {
    startTransition(async () => {
      const result = await cancelAdminProjectAction(id);
      if (!result.ok) {
        flash(result.error ?? "No se pudo cancelar el proyecto");
        return;
      }
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, estado: { nombre: "cancelado" } } : p)));
      flash("Proyecto cancelado");
    });
  }

  const STAT_CARDS = [
    { label: "Proyectos Totales", value: counts.total },
    { label: "Activos", value: counts.activos },
    { label: "En Selección", value: counts.seleccion },
    { label: "Finalizados", value: counts.finalizados },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-6 py-8 md:px-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-elevated">
          {message}
        </div>
      )}

      <PageTitle
        eyebrow="Sistema de gestión"
        title="ADMINISTRACIÓN / Proyectos"
        action={
          <div className="flex items-center gap-1 rounded-full bg-surface-sunken p-1">
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setView(value)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors ${view === value ? "bg-primary text-white" : "text-ink-muted hover:text-ink-strong"}`}>
                <Icon className="size-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{card.label}</p>
            <p className="mt-3 font-heading text-3xl font-bold text-ink-strong">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[16rem] flex-1">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Búsqueda</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
              <input type="text" value={query} onChange={(event) => resetPage(setQuery)(event.target.value)} placeholder="Filtrar por título o empresa" className="w-full rounded-lg bg-surface-sunken py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="min-w-[12rem]">
            <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Estado</label>
            <FilterSelect rounded="lg" ariaLabel="Estado" value={estado} onChange={resetPage(setEstado)} options={estadoOptions.map((value) => ({ value, label: value === "Todos" ? "Todos" : stateMeta(value as ProjectState).label }))} />
          </div>
        </div>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyRow message="No hay proyectos que coincidan con los filtros." />
      ) : view === "cards" ? (
        <div className="space-y-4">
          {pageItems.map((project) => {
            const meta = stateMeta(project.estado.nombre);
            const company = project.empresa?.nombre_comercial ?? "Sin empresa";
            return (
              <article key={project.id} className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ink-strong font-heading text-sm font-bold text-white">{initials(company)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-heading text-base font-bold text-ink-strong">{project.titulo}</h3>
                      <span className="shrink-0 rounded-md bg-surface-sunken px-1.5 py-0.5 font-body text-[10px] font-semibold text-ink-muted">#{project.id.slice(0, 6)}</span>
                    </div>
                    <p className="font-body text-xs text-ink-muted">{company} <span className="text-ink-subtle">•</span> {project.empresa?.tipo ?? "—"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>{meta.label}</span>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Calendar className="size-4" aria-hidden="true" />
                    <span className="font-body text-sm">{formatDate(project.fecha_publicacion)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailProjectId(project.id)}>
                      <Eye className="size-4" aria-hidden="true" /> {t("view")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending || project.estado.nombre === "cancelado"} onClick={() => cancelProject(project.id)} className="border-magenta/40 text-magenta hover:bg-magenta/10">
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : "Cancelar"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : view === "tabla" ? (
        <section className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">Proyecto</th>
                  <th className="px-4 py-4">Empresa</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4">Publicación</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((project) => {
                  const meta = stateMeta(project.estado.nombre);
                  return (
                    <tr key={project.id} className="font-body text-sm">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink-strong">{project.titulo}</p>
                        <p className="text-xs text-ink-muted">#{project.id.slice(0, 6)}</p>
                      </td>
                      <td className="px-4 py-4 text-ink">{project.empresa?.nombre_comercial ?? "—"}</td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>{meta.label}</span></td>
                      <td className="px-4 py-4 text-ink-muted">{formatDate(project.fecha_publicacion)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailProjectId(project.id)}>
                            <Eye className="size-3.5" aria-hidden="true" /> {t("view")}
                          </Button>
                          <Button size="sm" variant="outline" disabled={isPending || project.estado.nombre === "cancelado"} onClick={() => cancelProject(project.id)} className="border-magenta/40 text-magenta hover:bg-magenta/10">Cancelar</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const cards = filtered.filter((project) => project.estado.nombre === column);
            const meta = stateMeta(column);
            return (
              <div key={column} className="rounded-2xl bg-surface-sunken p-4 ring-1 ring-border">
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>{meta.label}</span>
                  <span className="font-body text-xs font-semibold text-ink-muted">{cards.length}</span>
                </div>
                <div className="space-y-3">
                  {cards.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-surface px-3 py-6 text-center font-body text-xs text-ink-subtle">Sin proyectos</p>
                  ) : (
                    cards.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setDetailProjectId(project.id)}
                        className="w-full rounded-xl bg-surface p-3 text-left shadow-soft ring-1 ring-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:ring-primary/40"
                      >
                        <h4 className="truncate font-body text-sm font-bold text-ink-strong">{project.titulo}</h4>
                        <p className="font-body text-xs text-ink-muted">{project.empresa?.nombre_comercial ?? "—"}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {view !== "kanban" && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="font-body text-sm text-ink-muted">
            Mostrando <span className="font-semibold text-ink-strong">{pageItems.length}</span> de{" "}
            <span className="font-semibold text-ink-strong">{filtered.length}</span> proyectos
          </p>
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="square" />
        </div>
      )}

      {detailProjectId && <ProjectDetailModal projectId={detailProjectId} onClose={() => setDetailProjectId(null)} />}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { AlertTriangle, Ban, CheckCircle2, FolderX, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  cancelAdminProjectAction,
  resolverReporteAction,
  suspendAdminUserAction,
} from "@/lib/actions/admin";
import type { AdminReporte, MotivoReporte, ReporteEstado } from "@/lib/api/types";

const MOTIVO_LABEL: Record<MotivoReporte, string> = {
  falta_respeto: "Falta de respeto",
  spam: "Spam",
  contenido_inapropiado: "Contenido inapropiado",
  fuera_de_lugar: "Fuera de lugar",
  otro: "Otro",
};

const ESTADO_LABEL: Record<ReporteEstado, string> = {
  pendiente: "Pendiente",
  revisado: "Revisado",
  desestimado: "Desestimado",
};

const ESTADO_STYLE: Record<ReporteEstado, string> = {
  pendiente: "border-warning/30 bg-warning/10 text-warning",
  revisado: "border-accent/30 bg-accent/10 text-accent",
  desestimado: "border-ink-muted/30 bg-ink-muted/10 text-ink-muted",
};

const FILTERS = ["Todos", "Pendiente", "Revisado", "Desestimado"] as const;

function fullName(user: AdminReporte["reportante"]): string {
  if (!user) return "—";
  return [user.nombre, user.apellido1].filter(Boolean).join(" ") || user.correo;
}

export function ModeracionView({ initialReportes }: { initialReportes: AdminReporte[] }) {
  const locale = useLocale();
  const [reportes, setReportes] = useState<AdminReporte[]>(initialReportes);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todos");

  const visible = useMemo(() => {
    if (filter === "Todos") return reportes;
    return reportes.filter((r) => ESTADO_LABEL[r.estado] === filter);
  }, [reportes, filter]);

  const pendientes = reportes.filter((r) => r.estado === "pendiente").length;

  function setEstadoLocal(id: string, estado: ReporteEstado) {
    setReportes((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)));
  }

  async function handleResolver(id: string, estado: "revisado" | "desestimado") {
    if (busyId) return;
    setBusyId(id);
    const result = await resolverReporteAction(id, estado);
    setBusyId(null);
    if (result.ok) {
      setEstadoLocal(id, estado);
    } else {
      setNotices((prev) => ({ ...prev, [id]: result.error }));
    }
  }

  async function handleSuspender(reporteId: string, userId: string) {
    if (busyId) return;
    setBusyId(reporteId);
    const result = await suspendAdminUserAction(userId);
    setBusyId(null);
    setNotices((prev) => ({
      ...prev,
      [reporteId]: result.ok ? "Cuenta del autor suspendida." : result.error,
    }));
  }

  async function handleCancelar(reporteId: string, projectId: string) {
    if (busyId) return;
    setBusyId(reporteId);
    const result = await cancelAdminProjectAction(projectId);
    setBusyId(null);
    setNotices((prev) => ({
      ...prev,
      [reporteId]: result.ok ? "Proyecto cancelado." : result.error,
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 pb-8 pt-20 md:px-10 md:py-8">
      <header className="space-y-2">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Gestión
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong">
          Moderación
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="font-body text-sm text-ink-muted">
          Mensajes del chat reportados por juniors o empresas.
          {pendientes > 0 && (
            <span className="ml-1 font-semibold text-warning">{pendientes} pendiente(s).</span>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-ink-muted hover:border-primary/30 hover:text-primary",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-12 text-center shadow-soft">
          <ShieldCheck className="size-10 text-accent" aria-hidden="true" />
          <p className="font-body text-sm text-ink-muted">No hay reportes para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r) => {
            const notice = notices[r.id];
            const isBusy = busyId === r.id;
            const reportadoId = r.reportado?.id;
            const proyectoId = r.proyecto?.id;
            return (
              <div
                key={r.id}
                className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-magenta/30 bg-magenta/10 px-2.5 py-1 font-body text-xs font-bold text-magenta">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      {MOTIVO_LABEL[r.motivo]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-body text-xs font-bold",
                        ESTADO_STYLE[r.estado],
                      )}
                    >
                      {ESTADO_LABEL[r.estado]}
                    </span>
                  </div>
                  <span className="font-body text-xs text-ink-muted">
                    {new Date(r.fecha).toLocaleString(locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="rounded-xl bg-surface-sunken p-3">
                  <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Mensaje reportado
                  </p>
                  <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink">
                    {r.contenido_snapshot}
                  </p>
                </div>

                {r.detalle && (
                  <p className="font-body text-sm text-ink-muted">
                    <span className="font-semibold text-ink">Detalle:</span> {r.detalle}
                  </p>
                )}

                <p className="font-body text-xs text-ink-muted">
                  Reportó <span className="font-semibold text-ink-strong">{fullName(r.reportante)}</span>
                  {" · "}
                  Autor <span className="font-semibold text-ink-strong">{fullName(r.reportado)}</span>
                  {r.proyecto && (
                    <>
                      {" · "}
                      Proyecto{" "}
                      <span className="font-semibold text-ink-strong">{r.proyecto.titulo}</span>
                    </>
                  )}
                </p>

                {notice && (
                  <p className="rounded-lg bg-accent/10 px-3 py-2 font-body text-xs font-medium text-accent">
                    {notice}
                  </p>
                )}

                {r.estado === "pendiente" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleResolver(r.id, "revisado")}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-body text-xs font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Marcar revisado
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResolver(r.id, "desestimado")}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs font-semibold text-ink-muted transition-colors hover:text-ink-strong disabled:opacity-50"
                    >
                      <XCircle className="size-3.5" aria-hidden="true" />
                      Desestimar
                    </button>
                    {reportadoId && (
                      <button
                        type="button"
                        onClick={() => void handleSuspender(r.id, reportadoId)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-full bg-magenta px-3 py-1.5 font-body text-xs font-semibold text-white transition-colors hover:bg-magenta/80 disabled:opacity-50"
                      >
                        <Ban className="size-3.5" aria-hidden="true" />
                        Suspender autor
                      </button>
                    )}
                    {proyectoId && (
                      <button
                        type="button"
                        onClick={() => void handleCancelar(r.id, proyectoId)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 px-3 py-1.5 font-body text-xs font-semibold text-warning transition-colors hover:bg-warning/10 disabled:opacity-50"
                      >
                        <FolderX className="size-3.5" aria-hidden="true" />
                        Cancelar proyecto
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

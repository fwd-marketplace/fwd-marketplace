"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Flag, X } from "lucide-react";
import { reportarMensajeAction } from "@/lib/actions/reporte";
import type { MotivoReporte } from "@/lib/api/types";

const MOTIVOS: MotivoReporte[] = [
  "falta_respeto",
  "spam",
  "contenido_inapropiado",
  "fuera_de_lugar",
  "otro",
];

interface Props {
  mensajeId: string;
}

/**
 * Botón discreto para reportar un mensaje ajeno del chat (moderación). Abre un modal simple (no hay
 * primitivo Dialog en el repo) con el motivo y un detalle opcional. El reporte llega al panel de
 * Moderación del admin; nunca se borra el mensaje desde acá.
 */
export function ReportarMensajeButton({ mensajeId }: Props) {
  const t = useTranslations("reportar_mensaje");
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<MotivoReporte>("falta_respeto");
  const [detalle, setDetalle] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setMotivo("falta_respeto");
    setDetalle("");
    setDone(false);
    setError("");
    setSending(false);
  }

  async function submit() {
    if (sending) {
      return;
    }
    setSending(true);
    setError("");
    const result = await reportarMensajeAction(mensajeId, motivo, detalle);
    setSending(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error || t("error"));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("button")}
        title={t("button")}
        className="text-ink-muted/50 transition-colors duration-[var(--duration-fast)] hover:text-magenta"
      >
        <Flag className="size-3" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-strong/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-heading text-lg font-bold text-ink-strong">{t("title")}</h3>
                <p className="mt-0.5 font-body text-sm text-ink-muted">{t("subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t("close")}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {done ? (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <p className="flex items-center gap-2 font-body text-sm font-semibold text-accent">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  {t("sent_title")}
                </p>
                <p className="mt-1 font-body text-xs text-ink-muted">{t("sent_desc")}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-3 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary/80"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reporte-motivo"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {t("motivo_label")}
                  </label>
                  <select
                    id="reporte-motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value as MotivoReporte)}
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                    {MOTIVOS.map((m) => (
                      <option key={m} value={m}>
                        {t(`motivo_${m}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="reporte-detalle"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {t("detalle_label")}
                  </label>
                  <textarea
                    id="reporte-detalle"
                    rows={3}
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    placeholder={t("detalle_placeholder")}
                    className="w-full resize-none rounded-xl border border-border bg-canvas px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted/60 outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                {error && <p className="font-body text-xs text-magenta">{error}</p>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-magenta px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Flag className="size-4" aria-hidden="true" />
                    {sending ? t("sending") : t("submit")}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full px-3 py-2 font-body text-sm font-medium text-ink-muted transition-colors hover:text-ink-strong"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

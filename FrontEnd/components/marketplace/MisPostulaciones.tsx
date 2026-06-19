"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  PackageCheck,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  submitEntregableAction,
  withdrawOfferAction,
} from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";
import type { Entregable, EntregableState, MyOffer, OfferState } from "@/lib/api/types";

interface Props {
  ofertas: MyOffer[];
  entregables: Entregable[];
}

const STATE_CONFIG: Record<OfferState, { label: string; className: string }> = {
  enviada:         { label: "Enviada",          className: "bg-primary/10 text-primary border-primary/20" },
  en_revision:     { label: "En revisión",      className: "bg-warning/10 text-warning border-warning/20" },
  adjudicada:      { label: "Adjudicada",       className: "bg-accent/10 text-accent border-accent/20" },
  no_seleccionada: { label: "No seleccionada",  className: "bg-ink-muted/10 text-ink-muted border-border" },
};

const ENTREGABLE_STATE_CONFIG: Record<EntregableState, { label: string; className: string }> = {
  pendiente:   { label: "Pendiente",   className: "bg-ink-muted/10 text-ink-muted" },
  enviado:     { label: "Enviado",     className: "bg-primary/10 text-primary" },
  en_revision: { label: "En revisión", className: "bg-warning/10 text-warning" },
  aprobado:    { label: "Aprobado",    className: "bg-accent/10 text-accent" },
};

function hoursUntil(fechaCierre: string | null | undefined): number | null {
  if (!fechaCierre) return null;
  const diff = new Date(fechaCierre).getTime() - Date.now();
  return diff > 0 ? diff / 3600000 : 0;
}

// ── Entregable section (RF-40 + RF-42) ────────────────────────────────────────

function EntregableSection({
  oferta,
  entregables: initialEntregables,
}: {
  oferta: MyOffer;
  entregables: Entregable[];
}) {
  const t = useTranslations("mis_postulaciones");
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<"parcial" | "final">("final");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localEntregables, setLocalEntregables] = useState<Entregable[]>(initialEntregables);
  const [error, setError] = useState<string | null>(null);

  const project = oferta.proyecto;
  if (!project) return null;
  const projectId: string = project.id;

  const sorted = [...localEntregables].sort((a, b) => b.version - a.version);
  const latest = sorted[0];
  // Allow new submission only if no entregable yet, or latest is approved
  const canSubmitNew = !latest || latest.estado.nombre === "aprobado";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await submitEntregableAction({
        id_proyecto: projectId,
        url: url.trim(),
        tipo,
      });
      if (result.ok) {
        setLocalEntregables((prev) => [...prev, result.data]);
        setUrl("");
        setTipo("final");
        setShowForm(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
      <p className="mb-3 flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-primary">
        <PackageCheck className="size-3.5" aria-hidden="true" />
        {t("entregable_label")}
      </p>

      {/* Historial de versiones (RF-42) */}
      {sorted.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {sorted.map((ent) => {
            const cfg = ENTREGABLE_STATE_CONFIG[ent.estado.nombre] ?? ENTREGABLE_STATE_CONFIG.enviado;
            return (
              <div
                key={ent.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    v{ent.version} &middot; {t(`entregable_tipo_${ent.tipo}`)}
                  </span>
                  <span className={cn("rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold", cfg.className)}>
                    {cfg.label}
                  </span>
                  <span className="font-body text-[11px] text-ink-subtle">
                    {new Date(ent.fecha).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {ent.url && (
                  <a
                    href={ent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
                  >
                    {t("entregable_view_link")}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Formulario nuevo entregable */}
      {canSubmitNew && (
        showForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Selector tipo (RF-40) */}
            <fieldset>
              <legend className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {t("entregable_tipo_label")}
              </legend>
              <div className="flex gap-4">
                {(["parcial", "final"] as const).map((opt) => (
                  <label key={opt} className="inline-flex cursor-pointer items-center gap-1.5 font-body text-xs font-semibold text-ink">
                    <input
                      type="radio"
                      name={`tipo-${oferta.id}`}
                      value={opt}
                      checked={tipo === opt}
                      onChange={() => setTipo(opt)}
                      className="accent-primary"
                    />
                    {t(`entregable_tipo_${opt}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor={`entregable-url-${oferta.id}`} className="sr-only">
                {t("entregable_url_label")}
              </label>
              <input
                id={`entregable-url-${oferta.id}`}
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("entregable_url_placeholder")}
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending || !url.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-3.5" aria-hidden="true" />
                  )}
                  {isPending ? t("entregable_sending") : t("entregable_send_btn")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-border px-3 py-2 font-body text-xs font-semibold text-ink-muted hover:bg-surface-sunken"
                >
                  {t("entregable_cancel")}
                </button>
              </div>
            </div>
            {error && <p className="font-body text-xs text-magenta">{error}</p>}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary"
          >
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {sorted.length > 0 ? t("entregable_new_version") : t("entregable_submit_cta")}
          </button>
        )
      )}
    </div>
  );
}

// ── Withdraw Modal (RF-31) ────────────────────────────────────────────────────

function WithdrawModal({
  ofertaId,
  titulo,
  onConfirm,
  onCancel,
  isPending,
}: {
  ofertaId: string;
  titulo: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("mis_postulaciones");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-magenta/10">
            <Trash2 className="size-5 text-magenta" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken"
            aria-label={t("withdraw_modal_cancel")}
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="font-heading text-lg font-bold text-ink-strong mb-1">
          {t("withdraw_modal_title")}
        </h3>
        <p className="font-body text-sm text-ink-muted mb-6">
          {t("withdraw_modal_desc", { titulo })}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 font-body text-sm font-semibold text-ink-muted hover:bg-surface-sunken"
          >
            {t("withdraw_modal_cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(ofertaId)}
            className="inline-flex items-center gap-2 rounded-full bg-magenta px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {isPending ? t("withdraw_modal_removing") : t("withdraw_modal_confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Oferta Card ───────────────────────────────────────────────────────────────

function OfertaCard({
  oferta,
  entregables,
  onWithdraw,
}: {
  oferta: MyOffer;
  entregables: Entregable[];
  onWithdraw: (oferta: MyOffer) => void;
}) {
  const t = useTranslations("mis_postulaciones");
  const locale = useLocale();
  const [expandedProposal, setExpandedProposal] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState(false);

  const stateCfg = STATE_CONFIG[oferta.estado.nombre];
  const isAdjudicada = oferta.estado.nombre === "adjudicada";
  const isRechazada = oferta.estado.nombre === "no_seleccionada";
  const canWithdraw =
    oferta.estado.nombre === "enviada" || oferta.estado.nombre === "en_revision";
  const proposalLong = oferta.propuesta.length > 180;

  const hoursLeft = hoursUntil(oferta.proyecto?.fecha_cierre);
  const isExpiringSoon = hoursLeft !== null && hoursLeft > 0 && hoursLeft <= 48;

  return (
    <li
      className={cn(
        "rounded-2xl border bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]",
        isAdjudicada && "border-accent/30 ring-1 ring-accent/10",
        isRechazada && "opacity-70 border-border",
        !isAdjudicada && !isRechazada && "border-border hover:border-primary/20 hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      {/* ── Alerta de vencimiento próximo (RF-33) ── */}
      {isExpiringSoon && !isAdjudicada && !isRechazada && (
        <div className="flex items-center gap-2 rounded-t-2xl bg-warning/10 px-5 py-2.5 border-b border-warning/20">
          <AlertTriangle className="size-4 text-warning shrink-0" aria-hidden="true" />
          <p className="font-body text-xs font-bold text-warning">
            {hoursLeft < 1
              ? t("expiring_soon_less_than_hour")
              : t("expiring_soon_hours", { hours: Math.ceil(hoursLeft) })}
          </p>
        </div>
      )}

      {/* ── Banda adjudicada ── */}
      {isAdjudicada && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl bg-accent/10 px-5 py-2.5 border-b border-accent/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-accent shrink-0" aria-hidden="true" />
            <p className="font-body text-xs font-bold text-accent">
              {t("awarded_banner")}
            </p>
          </div>
          {oferta.proyecto && (
            <Link
              href={`/${locale}/marketplace/${oferta.proyecto.id}/proceso`}
              className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 font-body text-[11px] font-bold text-accent transition-colors hover:bg-accent hover:text-white"
            >
              <ArrowUpRight className="size-3" aria-hidden="true" />
              {t("go_to_messages")}
            </Link>
          )}
        </div>
      )}

      <div className="p-5">
        {/* ── Encabezado ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={cn(
                  "inline-block rounded-full border px-2.5 py-0.5 font-body text-[11px] font-bold",
                  stateCfg.className,
                )}
              >
                {t(`state_${oferta.estado.nombre}`)}
              </span>
              <span className="font-body text-[11px] text-ink-subtle">
                {new Date(oferta.fecha_envio).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {oferta.proyecto ? (
              <h3 className="font-heading text-xl font-extrabold tracking-tight text-ink-strong leading-tight">
                {oferta.proyecto.titulo}
                <span className="text-primary" aria-hidden="true">.</span>
              </h3>
            ) : (
              <h3 className="font-heading text-xl font-extrabold tracking-tight text-ink-muted">
                {t("project_removed")}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {oferta.proyecto && (
              <Link
                href={`/${locale}/marketplace/${oferta.proyecto.id}/proceso`}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-2 font-body text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary hover:text-white"
              >
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                {t("view_project_btn")}
              </Link>
            )}

            {canWithdraw && (
              <button
                type="button"
                onClick={() => onWithdraw(oferta)}
                aria-label={t("withdraw_btn_aria")}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-magenta/30 hover:bg-magenta/5 hover:text-magenta"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ── Propuesta ── */}
        <div className="rounded-xl bg-surface-sunken px-4 py-3 mb-3">
          <p className="mb-1.5 flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
            <FileText className="size-3.5" aria-hidden="true" />
            {t("proposal_label")}
          </p>
          <p
            className={cn(
              "font-body text-sm leading-relaxed text-ink",
              !expandedProposal && proposalLong && "line-clamp-3",
            )}
          >
            {oferta.propuesta}
          </p>
          {proposalLong && (
            <button
              type="button"
              onClick={() => setExpandedProposal((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
            >
              {expandedProposal ? (
                <><ChevronUp className="size-3.5" aria-hidden="true" />{t("see_less")}</>
              ) : (
                <><ChevronDown className="size-3.5" aria-hidden="true" />{t("see_more")}</>
              )}
            </button>
          )}
        </div>

        {/* ── Documentación técnica (RF-30) ── */}
        {oferta.documentacion_tecnica && (
          <div className="rounded-xl bg-surface-sunken px-4 py-3 mb-3">
            <p className="mb-1.5 flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
              <FileText className="size-3.5" aria-hidden="true" />
              {t("docs_label")}
            </p>
            <p
              className={cn(
                "font-body text-sm leading-relaxed text-ink",
                !expandedDocs && oferta.documentacion_tecnica.length > 180 && "line-clamp-3",
              )}
            >
              {oferta.documentacion_tecnica}
            </p>
            {oferta.documentacion_tecnica.length > 180 && (
              <button
                type="button"
                onClick={() => setExpandedDocs((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
              >
                {expandedDocs ? (
                  <><ChevronUp className="size-3.5" />{t("see_less")}</>
                ) : (
                  <><ChevronDown className="size-3.5" />{t("see_more")}</>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Links ── */}
        <div className="flex flex-wrap gap-3 mb-1">
          {oferta.prototipo_url && (
            <a
              href={oferta.prototipo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
            >
              {t("prototype_link")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
          {oferta.documentacion_url && (
            <a
              href={oferta.documentacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-body text-xs font-semibold text-secondary hover:underline"
            >
              {t("docs_url_link")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* ── Entregable con historial (RF-40 + RF-42) ── */}
        {isAdjudicada && (
          <EntregableSection oferta={oferta} entregables={entregables} />
        )}
      </div>
    </li>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MisPostulaciones({ ofertas: initialOfertas, entregables }: Props) {
  const t = useTranslations("mis_postulaciones");
  const locale = useLocale();

  const [ofertas, setOfertas] = useState(initialOfertas);
  const [withdrawTarget, setWithdrawTarget] = useState<MyOffer | null>(null);
  const [isWithdrawPending, startWithdrawTransition] = useTransition();

  function handleWithdrawConfirm(offerId: string) {
    startWithdrawTransition(async () => {
      const result = await withdrawOfferAction(offerId);
      if (result.ok) {
        setOfertas((prev) => prev.filter((o) => o.id !== offerId));
      }
      setWithdrawTarget(null);
    });
  }

  return (
    <>
      {withdrawTarget && (
        <WithdrawModal
          ofertaId={withdrawTarget.id}
          titulo={withdrawTarget.proyecto?.titulo ?? "este proyecto"}
          onConfirm={handleWithdrawConfirm}
          onCancel={() => setWithdrawTarget(null)}
          isPending={isWithdrawPending}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong mb-1">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="font-body text-sm text-ink-muted">{t("subtitle")}</p>
        </div>

        {ofertas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="size-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ink-strong mb-2">
              {t("empty_title")}
            </h2>
            <p className="font-body text-sm text-ink-muted mb-6 max-w-sm mx-auto">
              {t("empty_body")}
            </p>
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
            >
              {t("empty_cta")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(["enviada", "en_revision", "adjudicada"] as OfferState[]).map((estado) => {
                const count = ofertas.filter((o) => o.estado.nombre === estado).length;
                const cfg = STATE_CONFIG[estado];
                return (
                  <div
                    key={estado}
                    className={cn("rounded-xl border p-3 text-center", cfg.className)}
                  >
                    <p className="font-heading text-2xl font-extrabold">{count}</p>
                    <p className="font-body text-[11px] font-semibold mt-0.5">
                      {t(`state_${estado}`)}
                    </p>
                  </div>
                );
              })}
            </div>

            <ul className="flex flex-col gap-4">
              {ofertas.map((oferta) => {
                const projectEntregables = entregables.filter(
                  (e) => e.id_proyecto === oferta.proyecto?.id,
                );
                return (
                  <OfertaCard
                    key={oferta.id}
                    oferta={oferta}
                    entregables={projectEntregables}
                    onWithdraw={setWithdrawTarget}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

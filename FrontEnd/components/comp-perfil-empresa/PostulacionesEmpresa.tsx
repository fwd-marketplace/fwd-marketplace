"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderKanban,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Star,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { decideOfferAction, getProjectOffersAction } from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";
import type { ApiProject, ProjectOffer } from "@/lib/api/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function offerVariant(state: ProjectOffer["estado"]["nombre"]) {
  if (state === "adjudicada") return "success" as const;
  if (state === "no_seleccionada") return "magenta" as const;
  if (state === "en_revision") return "warning" as const;
  return "secondary" as const;
}

function getInitials(nombre: string, apellido1: string | null): string {
  const parts = [nombre, apellido1].filter(Boolean) as string[];
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2);
}

/** Devuelve datos mock estables para un junior mientras no se conecta al backend */
function mockJuniorProfile(juniorId: string) {
  const seed = juniorId.charCodeAt(juniorId.length - 1) % 4;
  const specialties = ["Frontend Developer", "Backend Developer", "Fullstack Developer", "IA & Data"];
  const availabilities = ["Inmediata", "En 2 semanas", "En un mes", "En 2 semanas"];
  const reputations = [4.8, 4.2, 3.9, 4.5];
  const bios = [
    "Desarrolladora apasionada por crear interfaces accesibles y performantes. Egresada del programa FWD con enfoque en React y TypeScript.",
    "Especialista en APIs REST y arquitecturas escalables. Experiencia en Node.js, PostgreSQL y servicios en la nube.",
    "Desarrollador fullstack con ojo para el diseño. Me motiva construir productos digitales de principio a fin con calidad.",
    "Apasionada por la inteligencia artificial aplicada a problemas reales. Python, TensorFlow y análisis de datos.",
  ];
  return {
    especialidad: specialties[seed] ?? "Fullstack Developer",
    disponibilidad: availabilities[seed] ?? "Inmediata",
    reputacion: reputations[seed] ?? 4.0,
    bio: bios[seed] ?? "",
    url_github: null as string | null,
    url_linkedin: null as string | null,
    url_portfolio: null as string | null,
    email: null as string | null,
  };
}

// ── Star Rating (RF-36) ───────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          className="transition-transform duration-[var(--duration-fast)] hover:scale-110"
        >
          <Star
            className={cn(
              "size-6 transition-colors duration-[var(--duration-fast)]",
              (hover || value) >= star
                ? "fill-highlight text-highlight"
                : "fill-transparent text-ink-muted/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RatingPanel({ offerId }: { offerId: string }) {
  const t = useTranslations("postulaciones_empresa");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) return;
    startTransition(async () => {
      // RF-36: La acción real se conectará en Etapa 13.
      // Por ahora simulamos el guardado con un delay.
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-3">
        <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
        <p className="font-body text-sm font-semibold text-accent">{t("rating_saved")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-highlight/20 bg-highlight/5 px-4 py-4">
      <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
        {t("rating_section_title")}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <StarRating value={rating} onChange={setRating} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`rating-comment-${offerId}`} className="sr-only">
            {t("rating_comment_label")}
          </label>
          <textarea
            id={`rating-comment-${offerId}`}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("rating_comment_placeholder")}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 font-body text-sm text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isPending}
          className="self-start inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Star className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? t("rating_submitting") : t("rating_submit")}
        </button>
      </form>
    </div>
  );
}

// ── Reject Modal (RF-39) ──────────────────────────────────────────────────────

function RejectModal({
  offer,
  onConfirm,
  onCancel,
  isPending,
}: {
  offer: ProjectOffer;
  onConfirm: (offerId: string, motivo: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("postulaciones_empresa");
  const [motivo, setMotivo] = useState("");
  const juniorName = [offer.junior.nombre, offer.junior.apellido1].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-magenta/10">
            <UserX className="size-5 text-magenta" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken"
            aria-label={t("reject_modal_cancel")}
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="font-heading text-lg font-bold text-ink-strong mb-1">
          {t("reject_modal_title")}
        </h3>
        <p className="font-body text-sm text-ink-muted mb-4">
          {t("reject_modal_desc", { name: juniorName })}
        </p>

        <div className="mb-5 flex flex-col gap-1.5">
          <label htmlFor="reject-motivo" className="font-body text-xs font-semibold text-ink-muted">
            {t("reject_modal_reason_label")}
          </label>
          <textarea
            id="reject-motivo"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={t("reject_modal_reason_placeholder")}
            className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3 py-2 font-body text-sm text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 font-body text-sm font-semibold text-ink-muted hover:bg-surface-sunken"
          >
            {t("reject_modal_cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(offer.id, motivo)}
            className="inline-flex items-center gap-2 rounded-full bg-magenta px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserX className="size-4" />}
            {isPending ? t("reject_modal_rejecting") : t("reject_modal_confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Offer Card ────────────────────────────────────────────────────────────────

type OfferTab = "propuesta" | "perfil" | "contacto";

function OfferCard({
  offer,
  onAccept,
  onReject,
  isActionPending,
}: {
  offer: ProjectOffer;
  onAccept: (id: string) => void;
  onReject: (offer: ProjectOffer) => void;
  isActionPending: boolean;
}) {
  const t = useTranslations("postulaciones_empresa");
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<OfferTab>("propuesta");

  const juniorName = [offer.junior.nombre, offer.junior.apellido1].filter(Boolean).join(" ");
  const initials = getInitials(offer.junior.nombre, offer.junior.apellido1);
  const mockProfile = mockJuniorProfile(offer.junior.id);

  const isAdjudicada = offer.estado.nombre === "adjudicada";
  const isRechazada = offer.estado.nombre === "no_seleccionada";
  const canAccept = !isAdjudicada && !isRechazada;
  const canReject = !isRechazada && !isAdjudicada;

  const tabs: { id: OfferTab; label: string }[] = [
    { id: "propuesta", label: t("tab_proposal") },
    { id: "perfil",    label: t("tab_profile") },
    { id: "contacto",  label: t("tab_contact") },
  ];

  return (
    <article
      className={cn(
        "rounded-2xl border bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]",
        isAdjudicada && "border-accent/30 ring-1 ring-accent/10",
        isRechazada && "opacity-60 border-border",
        !isAdjudicada && !isRechazada && "border-border hover:border-primary/20 hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      {/* ── Encabezado ── */}
      <div className="flex items-center gap-4 p-4">
        {/* Avatar con iniciales */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-heading text-sm font-bold text-secondary">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="font-heading text-base font-bold text-ink-strong">{juniorName}</h3>
            <StatusPill
              label={t(`offer_states.${offer.estado.nombre}`)}
              variant={offerVariant(offer.estado.nombre)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-body text-xs text-ink-muted">{mockProfile.especialidad}</span>
            {mockProfile.reputacion !== null && (
              <span className="inline-flex items-center gap-0.5 font-body text-xs font-semibold text-highlight">
                <Star className="size-3 fill-highlight" aria-hidden="true" />
                {mockProfile.reputacion.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-2">
          {canAccept && (
            <Button
              size="sm"
              variant="accent"
              onClick={() => onAccept(offer.id)}
              disabled={isActionPending}
            >
              <UserCheck className="size-4" />
              {t("accept_btn")}
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant="magenta"
              onClick={() => onReject(offer)}
              disabled={isActionPending}
            >
              <UserX className="size-4" />
              {t("reject_btn")}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? t("collapse_offer") : t("expand_offer")}
            className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* ── Contenido expandido ── */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border pb-3" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)]",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:bg-surface-sunken hover:text-ink-strong",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Propuesta */}
          {activeTab === "propuesta" && (
            <div className="space-y-3">
              <p className="font-body text-sm leading-relaxed text-ink">{offer.propuesta}</p>
              {offer.prototipo_url && (
                <a
                  href={offer.prototipo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-body text-xs font-bold text-primary hover:underline"
                >
                  {t("prototype_link")}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              )}
              {/* Rating solo si adjudicada (RF-36) */}
              {isAdjudicada && (
                <div className="mt-4">
                  <RatingPanel offerId={offer.id} />
                </div>
              )}
            </div>
          )}

          {/* Tab: Perfil (RF-34) */}
          {activeTab === "perfil" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-0.5">
                    {t("profile_specialty")}
                  </p>
                  <p className="font-body text-sm font-semibold text-ink-strong">
                    {mockProfile.especialidad}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-0.5">
                    {t("profile_availability")}
                  </p>
                  <p className="font-body text-sm font-semibold text-ink-strong">
                    {mockProfile.disponibilidad}
                  </p>
                </div>
              </div>

              {mockProfile.reputacion !== null && (
                <div className="rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1.5">
                    {t("profile_reputation")}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "size-4",
                            s <= Math.round(mockProfile.reputacion!)
                              ? "fill-highlight text-highlight"
                              : "fill-transparent text-ink-muted/30",
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-body text-sm font-bold text-ink-strong">
                      {mockProfile.reputacion.toFixed(1)}
                    </span>
                    <span className="font-body text-xs text-ink-muted">/ 5</span>
                  </div>
                </div>
              )}

              {mockProfile.bio && (
                <div className="rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1">
                    {t("profile_bio")}
                  </p>
                  <p className="font-body text-sm leading-relaxed text-ink">{mockProfile.bio}</p>
                </div>
              )}

              <p className="font-body text-[11px] text-ink-muted italic">
                {t("profile_data_note")}
              </p>
            </div>
          )}

          {/* Tab: Contacto (RF-38) */}
          {activeTab === "contacto" && (
            <div className="space-y-3">
              {isAdjudicada ? (
                <>
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-accent">
                      {t("contact_section_title")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink-muted">
                        <Mail className="size-4 shrink-0" aria-hidden="true" />
                        <span className="font-body text-sm">{t("contact_email_placeholder")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink-muted">
                        <Phone className="size-4 shrink-0" aria-hidden="true" />
                        <span className="font-body text-sm">{t("contact_phone_placeholder")}</span>
                      </div>
                      {mockProfile.url_github && (
                        <a
                          href={mockProfile.url_github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 font-body text-sm text-primary hover:underline"
                        >
                          <Link2 className="size-4" aria-hidden="true" />
                          GitHub
                        </a>
                      )}
                      {mockProfile.url_linkedin && (
                        <a
                          href={mockProfile.url_linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 font-body text-sm text-primary hover:underline"
                        >
                          <Link2 className="size-4" aria-hidden="true" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-sunken px-4 py-3">
                    <p className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-bold text-ink-muted">
                      <MessageSquare className="size-3.5" aria-hidden="true" />
                      {t("contact_messaging_title")}
                    </p>
                    <p className="font-body text-sm text-ink-muted">
                      {t("contact_messaging_desc")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface-sunken p-6 text-center">
                  <UserCheck className="mx-auto mb-2 size-7 text-ink-subtle" aria-hidden="true" />
                  <p className="font-body text-sm text-ink-muted">
                    {t("contact_locked_desc")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {mockProfile.url_portfolio && (
                  <a
                    href={mockProfile.url_portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-body text-xs font-bold text-primary hover:underline"
                  >
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    {t("portfolio_link")}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PostulacionesEmpresa({ initialProjects }: { initialProjects: ApiProject[] }) {
  const t = useTranslations("postulaciones_empresa");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id ?? "");
  const [offersByProject, setOffersByProject] = useState<Record<string, ProjectOffer[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ProjectOffer | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProject = initialProjects.find((p) => p.id === selectedProjectId) ?? null;
  const selectedOffers = selectedProjectId ? (offersByProject[selectedProjectId] ?? []) : [];

  function triggerToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  }

  function loadOffers(projectId: string) {
    startTransition(async () => {
      const result = await getProjectOffersAction(projectId);
      if (result.ok) {
        setOffersByProject((prev) => ({ ...prev, [projectId]: result.data.ofertas }));
      } else {
        triggerToast(result.error);
      }
    });
  }

  function selectProject(projectId: string) {
    setSelectedProjectId(projectId);
    if (!offersByProject[projectId]) {
      loadOffers(projectId);
    }
  }

  function handleAccept(offerId: string) {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, "aceptar");
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) loadOffers(selectedProjectId);
      triggerToast(t("toast_accepted_short"));
    });
  }

  function handleRejectConfirm(offerId: string, _motivo: string) {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, "rechazar");
      if (!result.ok) {
        triggerToast(result.error);
      } else {
        if (selectedProjectId) loadOffers(selectedProjectId);
        triggerToast(t("toast_rejected_short"));
      }
      setRejectTarget(null);
    });
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)]">
          <CheckCircle2 className="size-5 text-accent" />
          <p className="font-body text-sm font-semibold text-ink-strong">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-full p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink-strong"
            aria-label={t("toast_close")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Reject modal (RF-39) */}
      {rejectTarget && (
        <RejectModal
          offer={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isPending={isPending}
        />
      )}

      <div className="space-y-0.5">
        <p className="font-body text-[11px] font-bold uppercase tracking-wider text-primary">
          {t("title")}
        </p>
        <h1 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
          {t("subtitle")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Panel izquierdo: lista de proyectos */}
        <aside className="space-y-3 lg:col-span-4">
          {initialProjects.length > 0 ? (
            initialProjects.map((project) => {
              const isActive = project.id === selectedProjectId;
              const offers = offersByProject[project.id] ?? [];
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project.id)}
                  className={cn(
                    "w-full rounded-2xl border bg-surface p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isActive
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-heading text-base font-bold text-ink-strong">{project.titulo}</h2>
                    {offers.length > 0 && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-body text-[11px] font-bold text-primary">
                        {offers.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 font-body text-xs text-ink-muted">
                    {project.descripcion}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <FolderKanban className="mx-auto mb-3 size-8 text-ink-subtle" />
              <p className="font-body text-sm font-semibold text-ink-muted">{t("empty_projects")}</p>
            </div>
          )}
        </aside>

        {/* Panel derecho: postulaciones */}
        <section className="space-y-4 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("actions_header")}
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold text-ink-strong">
                  {selectedProject?.titulo ?? t("no_project")}
                  {selectedProject && <span className="text-primary" aria-hidden="true">.</span>}
                </h2>
              </div>
              {selectedProject && !offersByProject[selectedProject.id] && (
                <Button
                  variant="outline"
                  onClick={() => loadOffers(selectedProject.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {t("load_applications")}
                </Button>
              )}
            </div>

            <div className="space-y-3 pt-4">
              {selectedOffers.length > 0 ? (
                selectedOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={handleAccept}
                    onReject={setRejectTarget}
                    isActionPending={isPending}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-8 text-center font-body text-sm text-ink-muted">
                  {selectedProject ? t("empty_applications") : t("no_project")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

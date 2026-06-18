"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Edit2,
  ExternalLink,
  Filter,
  FolderOpen,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  calificarOfertaAction,
  changeProjectStateAction,
  createProjectAction,
  decideOfferAction,
  getProjectEntregablesAction,
  getProjectOffersAction,
  reviewEntregableAction,
  updateProjectAction,
} from "@/lib/actions/marketplace";
import { generateProposalAction } from "@/lib/actions/ai";
import { streamAssistant } from "@/lib/api/ai-client";
import { formatDateLabel } from "@/lib/api/safe-json";
import type {
  AiChatMessage,
  ApiProject,
  CatalogArea,
  CatalogSkill,
  CompanyProjectState,
  Entregable,
  EntregableState,
  ProjectOffer,
  ProjectProposal,
  ProjectState,
  UpdateProjectInput,
} from "@/lib/api/types";

type TabType = "project" | "applications" | "entregables";
type ViewType = "list" | "detail";

const STAR_CHAR = "★";

const COMPANY_STATES: CompanyProjectState[] = [
  "en_recepcion",
  "en_evaluacion",
  "adjudicado",
  "en_desarrollo",
  "cerrado",
];

const DEFAULT_DEADLINE_DAYS = 10;

type NewProjectForm = {
  titulo: string;
  descripcion: string;
  id_area_negocio: string;
  plazo_dias: number;
  usa_ia: boolean;
  skills: string[];
  publicar: boolean;
};

function buildEmptyForm(areas: CatalogArea[]): NewProjectForm {
  return {
    titulo: "",
    descripcion: "",
    id_area_negocio: areas[0]?.id ?? "",
    plazo_dias: DEFAULT_DEADLINE_DAYS,
    usa_ia: false,
    skills: [],
    publicar: true,
  };
}

function statusVariant(state: ProjectState) {
  if (state === "en_recepcion" || state === "en_desarrollo") return "new-talent";
  if (state === "cerrado" || state === "cancelado") return "magenta";
  if (state === "borrador") return "secondary";
  return "warning";
}

function offerVariant(state: ProjectOffer["estado"]["nombre"]) {
  if (state === "adjudicada") return "success";
  if (state === "no_seleccionada") return "magenta";
  if (state === "en_revision") return "warning";
  return "secondary";
}

function Toast({
  message,
  onClose,
  closeLabel,
}: {
  message: string;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)]">
      <CheckCircle2 className="size-5 shrink-0 text-accent" />
      <p className="font-body text-sm font-semibold text-ink-strong">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="ml-2 rounded-full p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink-strong"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 font-body text-sm ${
          isUser ? "bg-primary text-white" : "bg-surface-sunken text-ink-strong"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted" />
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:300ms]" />
      </span>
      <span className="font-body text-xs">{label}</span>
    </div>
  );
}

/**
 * Asistente de IA del modal: chat conversacional con streaming que, al final,
 * genera una propuesta y prellena el formulario manual (vía `onApply`). Siempre
 * deja salida a "continuar manualmente".
 */
function AiAssistant({ onApply }: { onApply: (proposal: ProjectProposal) => void }) {
  const t = useTranslations("empresa_dashboard.new_project_modal.ai");
  const [idea, setIdea] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Aborta el stream en curso si el modal/componente se desmonta.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Auto-scroll al último mensaje.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streamingText, isStreaming]);

  const hasConversation = messages.length > 0;
  const canGenerate =
    messages.some((message) => message.role === "assistant") && !isStreaming && !isGenerating;

  async function runTurn(history: AiChatMessage[]) {
    setError(null);
    setIsStreaming(true);
    setStreamingText("");
    const controller = new AbortController();
    abortRef.current = controller;
    let accumulated = "";
    let failed = false;
    await streamAssistant(
      history,
      (event) => {
        if (event.type === "delta") {
          accumulated += event.text;
          setStreamingText(accumulated);
        } else if (event.type === "error") {
          failed = true;
          setError(event.error);
        }
      },
      controller.signal,
    );
    setIsStreaming(false);
    setStreamingText("");
    if (accumulated.trim()) {
      setMessages((prev) => [...prev, { role: "assistant", content: accumulated.trim() }]);
    } else if (!failed) {
      setError(t("error_generic"));
    }
  }

  async function startConversation() {
    const text = idea.trim();
    if (!text || isStreaming) return;
    const history: AiChatMessage[] = [{ role: "user", content: text }];
    setMessages(history);
    setIdea("");
    setApplied(false);
    setPendingQuestions([]);
    await runTurn(history);
  }

  async function sendReply() {
    const text = reply.trim();
    if (!text || isStreaming) return;
    const history: AiChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setReply("");
    await runTurn(history);
  }

  async function generate() {
    setIsGenerating(true);
    setError(null);
    const result = await generateProposalAction(messages);
    setIsGenerating(false);
    if (result.ok) {
      onApply(result.data);
      setPendingQuestions(result.data.preguntas_pendientes);
      setApplied(true);
    } else {
      setError(result.error);
    }
  }

  function restart() {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setIsStreaming(false);
    setReply("");
    setError(null);
    setIsGenerating(false);
    setPendingQuestions([]);
    setApplied(false);
    setIdea("");
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="font-body text-sm font-bold text-primary">{t("section_title")}</span>
        <span className="rounded-full bg-highlight px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-secondary">
          {t("badge")}
        </span>
      </div>

      {!hasConversation ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="ai-idea"
              className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
            >
              {t("idea_label")}
            </label>
            <textarea
              id="ai-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder={t("idea_placeholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={startConversation}
            disabled={!idea.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {t("fill_btn")}
          </button>
          <p className="font-body text-xs text-ink-muted">{t("conversation_empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            ref={scrollRef}
            className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface p-3"
          >
            {messages.map((message, index) => (
              <ChatBubble key={index} role={message.role} content={message.content} />
            ))}
            {isStreaming &&
              (streamingText ? (
                <ChatBubble role="assistant" content={streamingText} />
              ) : (
                <TypingIndicator label={t("typing")} />
              ))}
          </div>

          {applied && (
            <div className="space-y-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-accent" />
                <p className="font-body text-xs font-semibold text-ink-strong">{t("applied")}</p>
              </div>
              {pendingQuestions.length > 0 && (
                <div className="space-y-1 pl-6">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    {t("pending_title")}
                  </p>
                  <ul className="list-disc space-y-0.5 pl-4 font-body text-xs text-ink-muted">
                    {pendingQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 font-body text-xs font-semibold text-magenta">
              {error}
            </p>
          )}

          {!applied && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendReply();
                  }
                }}
                disabled={isStreaming}
                placeholder={t("reply_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void sendReply()}
                disabled={!reply.trim() || isStreaming}
                aria-label={t("send")}
              >
                <Send className="size-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!applied && (
              <Button
                type="button"
                variant="accent"
                onClick={() => void generate()}
                disabled={!canGenerate}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                {isGenerating ? t("generating") : t("generate_btn")}
              </Button>
            )}
            <button
              type="button"
              onClick={restart}
              className="font-body text-xs font-semibold text-ink-muted underline-offset-2 hover:text-primary hover:underline"
            >
              {applied ? t("restart") : t("continue_manually")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MisProyectos({
  initialProjects,
  areas,
  skills: catalogSkills,
}: {
  initialProjects: ApiProject[];
  areas: CatalogArea[];
  skills: CatalogSkill[];
}) {
  const t = useTranslations("mis_proyectos");
  const tModal = useTranslations("empresa_dashboard");
  const locale = useLocale();

  const [view, setView] = useState<ViewType>("list");
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("project");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectState | "all">("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [offersByProject, setOffersByProject] = useState<Record<string, ProjectOffer[]>>({});
  const [entregablesByProject, setEntregablesByProject] = useState<Record<string, Entregable[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewProjectForm>(() => buildEmptyForm(areas));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateProjectInput>({});
  const [requestChangesTarget, setRequestChangesTarget] = useState<Entregable | null>(null);
  const [requestChangesComment, setRequestChangesComment] = useState("");
  const [isRequestingChanges, startRequestChangesTransition] = useTransition();

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRatingPending, startRatingTransition] = useTransition();

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const selectedOffers = selectedProjectId ? (offersByProject[selectedProjectId] ?? []) : [];

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (searchQuery && !project.titulo.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
        if (statusFilter !== "all" && project.estado.nombre !== statusFilter)
          return false;
        if (areaFilter !== "all" && project.area?.id !== areaFilter)
          return false;
        if (
          skillFilter !== "all" &&
          !project.skills.some((s) => s.skill?.id === skillFilter)
        )
          return false;
        return true;
      }),
    [projects, searchQuery, statusFilter, areaFilter, skillFilter],
  );

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

  function loadEntregables(projectId: string) {
    startTransition(async () => {
      const result = await getProjectEntregablesAction(projectId);
      if (result.ok) {
        setEntregablesByProject((prev) => ({ ...prev, [projectId]: result.data.entregables }));
      } else {
        triggerToast(result.error);
      }
    });
  }

  function handleReviewEntregable(entregableId: string, accion: "revisar" | "aprobar") {
    startTransition(async () => {
      const result = await reviewEntregableAction(entregableId, accion);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) loadEntregables(selectedProjectId);
      triggerToast(accion === "aprobar" ? t("entregables.toast_approved") : t("entregables.toast_reviewed"));
    });
  }

  function handleRequestChangesConfirm() {
    if (!requestChangesTarget || !requestChangesComment.trim()) return;
    startRequestChangesTransition(async () => {
      const result = await reviewEntregableAction(
        requestChangesTarget.id,
        "solicitar_cambios",
        requestChangesComment.trim(),
      );
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      triggerToast(t("entregables.toast_changes_requested"));
      if (selectedProjectId) loadEntregables(selectedProjectId);
      setRequestChangesTarget(null);
      setRequestChangesComment("");
    });
  }

  function handleRatingConfirm() {
    if (ratingStars === 0 || !selectedProject) return;
    startRatingTransition(async () => {
      const adjudicada = (offersByProject[selectedProject.id] ?? []).find(
        (o) => o.estado.nombre === "adjudicada",
      );
      if (!adjudicada) {
        triggerToast(t("rating.error_no_offer"));
        return;
      }
      const result = await calificarOfertaAction(adjudicada.id, {
        calificacion: ratingStars,
        ...(ratingComment.trim() ? { comentario: ratingComment.trim() } : {}),
      });
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      triggerToast(t("rating.toast_saved"));
      setIsRatingOpen(false);
      setRatingStars(0);
      setRatingComment("");
    });
  }

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab("project");
    setView("detail");
    if (!offersByProject[projectId]) {
      loadOffers(projectId);
    }
  }

  function updateProjectState(projectId: string, estado: CompanyProjectState) {
    startTransition(async () => {
      const result = await changeProjectStateAction(projectId, estado);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, estado: { ...p.estado, nombre: estado } } : p,
        ),
      );
      triggerToast(t("notifications.state_updated"));
    });
  }

  function decideOffer(offerId: string, accion: "aceptar" | "rechazar") {
    startTransition(async () => {
      const result = await decideOfferAction(offerId, accion);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      if (selectedProjectId) loadOffers(selectedProjectId);
      triggerToast(
        accion === "aceptar" ? t("notifications.accepted") : t("notifications.rejected"),
      );
    });
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(buildEmptyForm(areas));
  }

  function toggleSkill(skillId: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  }

  // Prellena el formulario manual con la propuesta del asistente. El usuario
  // revisa y edita antes de crear. Solo se aplican ids que existan en el catálogo.
  function applyProposal(proposal: ProjectProposal) {
    setForm((prev) => ({
      ...prev,
      titulo: proposal.nombre || prev.titulo,
      descripcion: proposal.objetivo || prev.descripcion,
      id_area_negocio:
        proposal.id_area_negocio && areas.some((area) => area.id === proposal.id_area_negocio)
          ? proposal.id_area_negocio
          : prev.id_area_negocio,
      plazo_dias: proposal.plazo_dias,
      usa_ia: proposal.usa_ia,
      skills: proposal.habilidades
        .map((skill) => skill.id)
        .filter((id) => catalogSkills.some((skill) => skill.id === id)),
    }));
  }

  function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createProjectAction(form);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      const created = result.data;
      setProjects((prev) => [created, ...prev]);
      triggerToast(tModal("new_project_modal.success_message"));
      closeModal();
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setAreaFilter("all");
    setSkillFilter("all");
  }

  function openEditModal() {
    if (!selectedProject) return;
    setEditForm({
      titulo: selectedProject.titulo,
      descripcion: selectedProject.descripcion,
      id_area_negocio: selectedProject.area?.id ?? areas[0]?.id ?? "",
      plazo_dias: selectedProject.plazo_dias,
      usa_ia: selectedProject.usa_ia,
      skills: selectedProject.skills.flatMap((s) => (s.skill ? [s.skill.id] : [])),
    });
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditForm({});
  }

  function toggleEditSkill(skillId: string) {
    setEditForm((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).includes(skillId)
        ? (prev.skills ?? []).filter((id) => id !== skillId)
        : [...(prev.skills ?? []), skillId],
    }));
  }

  function submitEditProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject) return;
    startTransition(async () => {
      const result = await updateProjectAction(selectedProject.id, editForm);
      if (!result.ok) {
        triggerToast(result.error);
        return;
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? result.data : p)),
      );
      triggerToast(t("notifications.state_updated"));
      closeEditModal();
    });
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (view === "detail" && selectedProject) {
    return (
      <div className="space-y-8 pb-16">
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            closeLabel={t("toast_close")}
          />
        )}

        {/* Top bar: back + state selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setView("list")}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm font-semibold text-ink-strong shadow-[var(--shadow-soft)] transition-colors hover:bg-surface-sunken hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {t("back_btn")}
          </button>

          <div className="flex items-center gap-2">
            {/* RF-49/RF-50: Calificar junior — solo si el proyecto está cerrado */}
            {selectedProject.estado.nombre === "cerrado" && (
              <Button
                size="sm"
                variant="highlight"
                onClick={() => setIsRatingOpen(true)}
                className="gap-1.5 rounded-full"
              >
                <span aria-hidden="true">{STAR_CHAR}</span>
                {t("rating.open_btn")}
              </Button>
            )}

            {/* Editar — solo si no hay ofertas adjudicadas */}
            {(() => {
              const hasAdjudicada = (offersByProject[selectedProject.id] ?? []).some(
                (o) => o.estado.nombre === "adjudicada",
              );
              return (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending || hasAdjudicada}
                  onClick={openEditModal}
                  className="gap-1.5 rounded-full"
                  title={hasAdjudicada ? t("edit_blocked") : undefined}
                >
                  <Edit2 className="size-3.5" />
                  {t("edit_btn")}
                </Button>
              );
            })()}

            <label
              htmlFor="detail-state"
              className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
            >
              {t("state_label")}
            </label>
            <select
              id="detail-state"
              value={
                COMPANY_STATES.includes(
                  selectedProject.estado.nombre as CompanyProjectState,
                )
                  ? selectedProject.estado.nombre
                  : "en_recepcion"
              }
              disabled={
                isPending ||
                selectedProject.estado.nombre === "borrador" ||
                selectedProject.estado.nombre === "cancelado"
              }
              onChange={(e) =>
                updateProjectState(
                  selectedProject.id,
                  e.target.value as CompanyProjectState,
                )
              }
              className="rounded-xl border border-border bg-surface-sunken px-3 py-1.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              {COMPANY_STATES.map((state) => (
                <option key={state} value={state}>
                  {t(`states.${state}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project header card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill
              label={t(`states.${selectedProject.estado.nombre}`)}
              variant={statusVariant(selectedProject.estado.nombre)}
            />
            {selectedProject.fecha_publicacion && (
              <span className="font-body text-xs text-ink-muted">
                ·{" "}
                {t("published_on", {
                  date: formatDateLabel(selectedProject.fecha_publicacion, locale),
                })}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink-strong md:text-4xl">
            {selectedProject.titulo}
            <span className="text-primary" aria-hidden="true">
              .
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-body text-sm text-ink-muted">
            {selectedProject.area && (
              <span>
                <span className="font-semibold text-ink">{t("area_label")}:</span>{" "}
                {selectedProject.area.nombre}
              </span>
            )}
            <span>
              <span className="font-semibold text-ink">{t("deadline_label")}:</span>{" "}
              {selectedProject.plazo_dias} {t("days")}
            </span>
            <span>
              <span className="font-semibold text-ink">{t("ai_label")}:</span>{" "}
              {selectedProject.usa_ia ? t("yes") : t("no")}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {(["project", "entregables", "applications"] as TabType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "applications") loadOffers(selectedProject.id);
                  if (tab === "entregables") loadEntregables(selectedProject.id);
                }}
                className={`relative pb-3 font-body text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-ink-muted hover:text-ink-strong"
                }`}
              >
                {t(`tabs.${tab}`)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Proyecto */}
        {activeTab === "project" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h2 className="font-heading text-xl font-bold text-ink-strong">
                {t("objective_title")}
              </h2>
              <p className="font-body text-sm leading-relaxed text-ink">
                {selectedProject.descripcion}
              </p>
            </div>

            <aside className="space-y-5">
              {selectedProject.skills.length > 0 && (
                <div className="space-y-3 rounded-xl border border-border bg-surface-sunken p-5">
                  <h3 className="font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    {t("stack_title")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map(({ skill }) =>
                      skill ? (
                        <span
                          key={skill.id}
                          className="rounded-lg bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary"
                        >
                          {skill.nombre}
                        </span>
                      ) : null,
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-border bg-surface-sunken p-5">
                <h3 className="font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  {t("metrics_title")}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-ink-muted">
                    {t("metrics_active_applicants")}
                  </span>
                  <span className="font-heading text-2xl font-black text-primary">
                    {offersByProject[selectedProject.id]?.length ?? "—"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Tab: Entregables */}
        {activeTab === "entregables" && (
          <div className="space-y-3">
            {isPending ? (
              <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-10 text-center font-body text-sm text-ink-muted">
                {t("loading")}
              </p>
            ) : (entregablesByProject[selectedProject.id] ?? []).length > 0 ? (
              (entregablesByProject[selectedProject.id] ?? []).map((entregable) => {
                const juniorName = entregable.junior
                  ? [entregable.junior.nombre, entregable.junior.apellido1].filter(Boolean).join(" ")
                  : "—";
                const estadoStyles: Record<string, string> = {
                  pendiente:   "bg-ink-muted/10 text-ink-muted",
                  enviado:     "bg-primary/10 text-primary",
                  en_revision: "bg-warning/10 text-warning",
                  aprobado:    "bg-accent/10 text-accent",
                };
                const estadoNombre = entregable.estado.nombre as EntregableState;
                return (
                  <div
                    key={entregable.id}
                    className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-heading text-base font-bold text-ink-strong">{juniorName}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoStyles[estadoNombre] ?? estadoStyles.enviado}`}>
                            {t(`entregables.state_${estadoNombre}`)}
                          </span>
                          <span className="rounded-lg bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            {t(`entregables.tipo_${entregable.tipo}`)} v{entregable.version}
                          </span>
                        </div>
                        <p className="font-body text-xs text-ink-muted">
                          {new Date(entregable.fecha).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {/* RF-43: Botones de vista/descarga claros */}
                        {entregable.url && (
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <a
                              href={entregable.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-body text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                            >
                              <ExternalLink className="size-3.5" aria-hidden="true" />
                              {t("entregables.view_link")}
                            </a>
                            <a
                              href={entregable.url}
                              download
                              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs font-bold text-ink-muted transition-colors hover:border-primary/30 hover:text-primary"
                            >
                              <Download className="size-3.5" aria-hidden="true" />
                              {t("entregables.download_btn")}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || estadoNombre === "en_revision" || estadoNombre === "aprobado"}
                          onClick={() => handleReviewEntregable(entregable.id, "revisar")}
                        >
                          {t("entregables.review_btn")}
                        </Button>
                        {/* RF-44: Solicitar cambios */}
                        <Button
                          size="sm"
                          variant="warning"
                          disabled={isPending || estadoNombre === "aprobado"}
                          onClick={() => { setRequestChangesTarget(entregable); setRequestChangesComment(""); }}
                        >
                          <AlertCircle className="size-3.5" aria-hidden="true" />
                          {t("entregables.request_changes_btn")}
                        </Button>
                        <Button
                          size="sm"
                          variant="accent"
                          disabled={isPending || estadoNombre === "aprobado"}
                          onClick={() => handleReviewEntregable(entregable.id, "aprobar")}
                        >
                          {t("entregables.approve_btn")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-10 text-center font-body text-sm text-ink-muted">
                {t("entregables.empty")}
              </p>
            )}
          </div>
        )}

        {/* Tab: Postulaciones */}
        {activeTab === "applications" && (
          <div className="space-y-3">
            {selectedOffers.length > 0 ? (
              selectedOffers.map((offer) => {
                const juniorName = [offer.junior.nombre, offer.junior.apellido1]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={offer.id}
                    className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-heading text-base font-bold text-ink-strong">
                            {juniorName}
                          </p>
                          <StatusPill
                            label={t(`offer_states.${offer.estado.nombre}`)}
                            variant={offerVariant(offer.estado.nombre)}
                          />
                        </div>
                        <p className="font-body text-sm leading-relaxed text-ink-muted">
                          {offer.propuesta}
                        </p>
                        {offer.prototipo_url && (
                          <a
                            href={offer.prototipo_url}
                            className="font-body text-xs font-bold text-primary hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("prototype_link")}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="accent"
                          disabled={isPending || offer.estado.nombre === "adjudicada"}
                          onClick={() => decideOffer(offer.id, "aceptar")}
                        >
                          {t("applications.accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="magenta"
                          disabled={
                            isPending || offer.estado.nombre === "no_seleccionada"
                          }
                          onClick={() => decideOffer(offer.id, "rechazar")}
                        >
                          {t("applications.reject")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-surface-sunken p-10 text-center font-body text-sm text-ink-muted">
                {isPending ? t("loading") : t("applications_empty")}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          closeLabel={t("toast_close")}
        />
      )}

      {/* RF-44: Modal solicitar cambios */}
      {requestChangesTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
                <AlertCircle className="size-5 text-warning" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => { setRequestChangesTarget(null); setRequestChangesComment(""); }}
                className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken"
                aria-label={t("entregables.request_changes_cancel")}
              >
                <X className="size-4" />
              </button>
            </div>
            <h3 className="font-heading text-lg font-bold text-ink-strong mb-1">
              {t("entregables.request_changes_title")}
            </h3>
            <p className="font-body text-sm text-ink-muted mb-4">
              {t("entregables.request_changes_desc")}
            </p>
            <label htmlFor="request-changes-comment" className="mb-1.5 block font-body text-xs font-semibold text-ink-muted">
              {t("entregables.request_changes_comment_label")}
              <span className="text-magenta ml-0.5" aria-hidden="true">*</span>
            </label>
            <textarea
              id="request-changes-comment"
              rows={4}
              required
              value={requestChangesComment}
              onChange={(e) => setRequestChangesComment(e.target.value)}
              placeholder={t("entregables.request_changes_comment_placeholder")}
              className="mb-4 w-full resize-none rounded-xl border border-border bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setRequestChangesTarget(null); setRequestChangesComment(""); }}
                className="rounded-full border border-border px-4 py-2 font-body text-sm font-semibold text-ink-muted hover:bg-surface-sunken"
              >
                {t("entregables.request_changes_cancel")}
              </button>
              <button
                type="button"
                disabled={isRequestingChanges || !requestChangesComment.trim()}
                onClick={handleRequestChangesConfirm}
                className="inline-flex items-center gap-2 rounded-full bg-warning px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/90 disabled:opacity-50"
              >
                {isRequestingChanges
                  ? <Loader2 className="size-4 animate-spin" />
                  : <AlertCircle className="size-4" />
                }
                {isRequestingChanges
                  ? t("entregables.request_changes_sending")
                  : t("entregables.request_changes_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RF-49/RF-50: Modal de calificación del junior */}
      {isRatingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-highlight/10">
                <span className="text-xl text-highlight" aria-hidden="true">{STAR_CHAR}</span>
              </div>
              <button
                type="button"
                onClick={() => { setIsRatingOpen(false); setRatingStars(0); setRatingComment(""); }}
                className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken"
                aria-label={t("rating.cancel")}
              >
                <X className="size-4" />
              </button>
            </div>
            <h3 className="font-heading text-lg font-bold text-ink-strong mb-1">
              {t("rating.title")}
            </h3>
            <p className="font-body text-sm text-ink-muted mb-5">
              {t("rating.desc")}
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5" role="group" aria-label={t("rating.stars_label")}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} ${t("rating.stars_label")}`}
                  onClick={() => setRatingStars(star)}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  className={`text-4xl transition-transform duration-[var(--duration-fast)] hover:scale-110 ${
                    star <= (ratingHover || ratingStars) ? "text-highlight" : "text-border"
                  }`}
                >
                  {STAR_CHAR}
                </button>
              ))}
            </div>

            <label htmlFor="rating-comment" className="mb-1.5 block font-body text-xs font-semibold text-ink-muted">
              {t("rating.comment_label")}
            </label>
            <textarea
              id="rating-comment"
              rows={4}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t("rating.comment_placeholder")}
              className="mb-4 w-full resize-none rounded-xl border border-border bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsRatingOpen(false); setRatingStars(0); setRatingComment(""); }}
                className="rounded-full border border-border px-4 py-2 font-body text-sm font-semibold text-ink-muted hover:bg-surface-sunken"
              >
                {t("rating.cancel")}
              </button>
              <button
                type="button"
                disabled={isRatingPending || ratingStars === 0}
                onClick={handleRatingConfirm}
                className="inline-flex items-center gap-2 rounded-full bg-highlight px-4 py-2 font-body text-sm font-semibold text-highlight-foreground transition-colors hover:bg-highlight/90 disabled:opacity-50"
              >
                {isRatingPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isRatingPending ? t("rating.saving") : t("rating.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
          {t("page_title")}
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 rounded-full bg-primary font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("create_btn")}
        </Button>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Filter className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-ink-strong">
              {t("filters.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <label htmlFor="project-search" className="sr-only">
                {t("filters.search_label")}
              </label>
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="project-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("filters.search_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken py-2 pl-10 pr-4 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="project-status-filter" className="sr-only">
                {t("filters.status_label")}
              </label>
              <select
                id="project-status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectState | "all")
                }
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.status_all")}</option>
                {(["borrador", ...COMPANY_STATES, "cancelado"] as ProjectState[]).map(
                  (state) => (
                    <option key={state} value={state}>
                      {t(`states.${state}`)}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label htmlFor="project-area-filter" className="sr-only">
                {t("filters.area_label")}
              </label>
              <select
                id="project-area-filter"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.area_all")}</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project-skill-filter" className="sr-only">
                {t("filters.skill_label")}
              </label>
              <select
                id="project-skill-filter"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.skill_all")}</option>
                {catalogSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== "all" || areaFilter !== "all" || skillFilter !== "all") && (
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={clearFilters} className="h-8 text-xs">
                {t("filters.clear")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Cards grid / empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
          <FolderOpen className="mb-4 size-14 text-ink-muted" />
          <h3 className="mb-2 font-heading text-xl font-bold text-ink-strong">
            {t("no_projects_title")}
          </h3>
          <p className="mb-6 max-w-md font-body text-sm text-ink-muted">
            {t("no_projects_desc")}
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 rounded-full bg-primary font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="size-4" />
            {t("create_btn")}
          </Button>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => openProject(project.id)}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 text-left shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <StatusPill
                    label={t(`states.${project.estado.nombre}`)}
                    variant={statusVariant(project.estado.nombre)}
                  />
                  <span className="font-body text-xs font-medium text-ink-muted">
                    {formatDateLabel(project.fecha_publicacion, locale)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-ink-strong transition-colors duration-[var(--duration-fast)] group-hover:text-primary">
                    {project.titulo}
                    <span className="text-primary" aria-hidden="true">
                      .
                    </span>
                  </h3>
                  <p className="line-clamp-3 font-body text-sm leading-relaxed text-ink-muted">
                    {project.descripcion}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(project.skills ?? []).slice(0, 4).map(({ skill }) =>
                    skill ? (
                      <span
                        key={skill.id}
                        className="rounded-lg bg-primary/10 px-2 py-0.5 font-body text-[10px] font-semibold text-primary"
                      >
                        {skill.nombre}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                  <Users className="size-4 text-secondary" />
                  <span>
                    {offersByProject[project.id]?.length ?? 0}{" "}
                    {t("tabs.applications")}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-primary transition-transform duration-[var(--duration-fast)] group-hover:translate-x-1">
                  {t("filters.view_details")}
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <FolderOpen className="mb-4 size-12 text-ink-muted" />
          <h3 className="mb-1 font-heading text-lg font-bold text-ink-strong">
            {t("filters.empty_title")}
          </h3>
          <p className="max-w-md font-body text-sm text-ink-muted">
            {t("filters.empty_desc")}
          </p>
        </div>
      )}

      {/* Edit project modal */}
      {isEditModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold text-ink-strong">
                {t("edit_modal.title")}
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
                aria-label={t("edit_modal.cancel")}
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={submitEditProject} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="edit-project-title"
                  className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  {tModal("new_project_modal.name_label")}
                </label>
                <input
                  id="edit-project-title"
                  type="text"
                  required
                  value={editForm.titulo ?? ""}
                  onChange={(e) => setEditForm((c) => ({ ...c, titulo: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-project-description"
                  className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  {tModal("new_project_modal.description_label")}
                </label>
                <textarea
                  id="edit-project-description"
                  required
                  value={editForm.descripcion ?? ""}
                  onChange={(e) => setEditForm((c) => ({ ...c, descripcion: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="edit-project-area"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {tModal("new_project_modal.area_label")}
                  </label>
                  <select
                    id="edit-project-area"
                    value={editForm.id_area_negocio ?? ""}
                    onChange={(e) => setEditForm((c) => ({ ...c, id_area_negocio: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="edit-project-deadline"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {tModal("new_project_modal.deadline_label")}
                  </label>
                  <input
                    id="edit-project-deadline"
                    type="number"
                    min={5}
                    max={15}
                    required
                    value={editForm.plazo_dias ?? 10}
                    onChange={(e) => setEditForm((c) => ({ ...c, plazo_dias: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {tModal("new_project_modal.skills_label")}
                </legend>
                <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-surface-sunken p-3">
                  {catalogSkills.map((skill) => (
                    <label
                      key={skill.id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-body text-xs font-semibold text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={(editForm.skills ?? []).includes(skill.id)}
                        onChange={() => toggleEditSkill(skill.id)}
                        className="accent-primary"
                      />
                      {skill.nombre}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={editForm.usa_ia ?? false}
                  onChange={(e) => setEditForm((c) => ({ ...c, usa_ia: e.target.checked }))}
                  className="accent-primary"
                />
                {tModal("new_project_modal.ai_label")}
              </label>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  {t("edit_modal.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {t("edit_modal.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create project modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold text-ink-strong">
                {tModal("new_project_modal.title")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
                aria-label={tModal("new_project_modal.cancel")}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* AI assistant section */}
            <AiAssistant onApply={applyProposal} />

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {tModal("new_project_modal.ai.divider")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submitProject} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="new-project-title"
                  className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  {tModal("new_project_modal.name_label")}
                </label>
                <input
                  id="new-project-title"
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm((c) => ({ ...c, titulo: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="new-project-description"
                  className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  {tModal("new_project_modal.description_label")}
                </label>
                <textarea
                  id="new-project-description"
                  required
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, descripcion: e.target.value }))
                  }
                  className="min-h-28 w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="new-project-area"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {tModal("new_project_modal.area_label")}
                  </label>
                  <select
                    id="new-project-area"
                    required
                    value={form.id_area_negocio}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, id_area_negocio: e.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="new-project-deadline"
                    className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {tModal("new_project_modal.deadline_label")}
                  </label>
                  <input
                    id="new-project-deadline"
                    type="number"
                    min={5}
                    max={15}
                    required
                    value={form.plazo_dias}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, plazo_dias: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {tModal("new_project_modal.skills_label")}
                </legend>
                <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-surface-sunken p-3">
                  {catalogSkills.map((skill) => (
                    <label
                      key={skill.id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-body text-xs font-semibold text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={form.skills.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id)}
                        className="accent-primary"
                      />
                      {skill.nombre}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={form.usa_ia}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, usa_ia: e.target.checked }))
                    }
                    className="accent-primary"
                  />
                  {tModal("new_project_modal.ai_label")}
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={form.publicar}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, publicar: e.target.checked }))
                    }
                    className="accent-primary"
                  />
                  {tModal("new_project_modal.publish_label")}
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  {tModal("new_project_modal.cancel")}
                </Button>
                <Button type="submit" disabled={isPending || areas.length === 0}>
                  {tModal("new_project_modal.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

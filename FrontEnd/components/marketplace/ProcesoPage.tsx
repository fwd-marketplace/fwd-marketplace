"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileDown,
  FileText,
  GitBranch,
  ImageIcon,
  Info,
  Loader2,
  MessageCircle,
  PackageCheck,
  Paperclip,
  Send,
  Trash2,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitOfferAction,
  submitEntregableAction,
  withdrawOfferAction,
} from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";
import {
  MOCK_PROJECT_OFFERS,
  MOCK_PROCESO_ENTREGABLES,
  MOCK_REVISION_MESSAGES,
  type RevisionMessage,
} from "@/lib/mock-proceso";
import type {
  ApiProject,
  ApiRoleName,
  Entregable,
  EntregableState,
  MyOffer,
  OfferState,
  ProjectOffer,
} from "@/lib/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "info" | "chat" | "proceso";
type ChatMode = "directo" | "ia";

interface Attachment {
  name: string;
  url: string;
  isImage: boolean;
}

interface ChatMessage {
  id: string;
  from: "user" | "ia";
  text: string;
  attachment?: Attachment;
}

const offerSchema = z.object({
  propuesta: z.string().min(50).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal(""), z.undefined()]),
  documentacion_tecnica: z.string().max(3000).optional(),
  documentacion_url: z.union([z.string().url(), z.literal(""), z.undefined()]),
});
type OfferFormValues = z.infer<typeof offerSchema>;

interface Props {
  project: ApiProject;
  role: ApiRoleName | null;
  offer: MyOffer | null;
  entregables: Entregable[];
  projectOffers?: ProjectOffer[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OFFER_STATE_CONFIG: Record<OfferState, { label: string; className: string }> = {
  enviada:         { label: "Enviada",          className: "bg-primary/10 text-primary border-primary/20" },
  en_revision:     { label: "En revisión",      className: "bg-warning/10 text-warning border-warning/20" },
  adjudicada:      { label: "Adjudicada",       className: "bg-accent/10 text-accent border-accent/20" },
  no_seleccionada: { label: "No seleccionada",  className: "bg-magenta/10 text-magenta border-magenta/20" },
};

const ENTREGABLE_STATE_CONFIG: Record<EntregableState, { label: string; className: string }> = {
  pendiente:   { label: "Pendiente",    className: "bg-ink-muted/10 text-ink-muted" },
  enviado:     { label: "Enviado",      className: "bg-primary/10 text-primary" },
  en_revision: { label: "En revisión",  className: "bg-warning/10 text-warning" },
  aprobado:    { label: "Aprobado",     className: "bg-accent/10 text-accent" },
};

const IA_SUGGESTIONS = [
  "¿Cuánto tiempo tengo para completar el proyecto?",
  "¿Qué tecnologías se requieren?",
  "¿Cómo funciona el proceso de pago?",
  "¿Cómo hago una buena propuesta?",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAiResponse(question: string, project: ApiProject): string {
  const q = question.toLowerCase();
  if (q.includes("plazo") || q.includes("tiempo") || q.includes("día") || q.includes("semana")) {
    return `El plazo del proyecto es de ${project.plazo_dias} días. Planificá entregas parciales para mantener al empresario informado del avance.`;
  }
  if (q.includes("tecnolog") || q.includes("skill") || q.includes("herramienta")) {
    const skills = project.skills.flatMap((s) => (s.skill ? [s.skill.nombre] : []));
    return skills.length > 0
      ? `Este proyecto requiere: ${skills.join(", ")}. Mencioná tu experiencia con cada una en la propuesta.`
      : "El proyecto no especifica tecnologías obligatorias. Podés usar las que mejor dominés.";
  }
  if (q.includes("pago") || q.includes("dinero") || q.includes("presupuest")) {
    return "El pago se coordina entre el junior adjudicado y la empresa. Se libera contra entrega aprobada.";
  }
  if (q.includes("propuesta") || q.includes("postul") || q.includes("aplicar")) {
    return "Tu propuesta debe explicar cómo abordarás el proyecto, qué metodología usarás y por qué sos la persona indicada. Mínimo 50 caracteres.";
  }
  return "Para más detalles sobre el proyecto, revisá la pestaña Info. Estoy aquí si necesitás ayuda.";
}

function getTrackerSteps(state: OfferState | null) {
  const base = [
    { key: "enviada",  label: "Propuesta enviada" },
    { key: "revision", label: "En revisión" },
    { key: "decision", label: "Decisión final" },
  ];
  if (!state) return base.map((s) => ({ ...s, done: false, rejected: false }));
  const map: Record<OfferState, [boolean, boolean, boolean]> = {
    enviada:         [true,  false, false],
    en_revision:     [true,  true,  false],
    adjudicada:      [true,  true,  true],
    no_seleccionada: [true,  true,  false],
  };
  const [d0, d1, d2] = map[state];
  return [
    { ...base[0], done: d0, rejected: false },
    { ...base[1], done: d1, rejected: false },
    { ...base[2], done: d2, rejected: state === "no_seleccionada" },
  ];
}

function getInitials(nombre: string, apellido1: string | null): string {
  return `${nombre[0] ?? ""}${apellido1?.[0] ?? ""}`.toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProcesoPage({
  project,
  role,
  offer,
  entregables: initialEntregables,
  projectOffers,
}: Props) {
  const t  = useTranslations("project_detail");
  const tp = useTranslations("proceso_page");
  const tm = useTranslations("mis_postulaciones");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<Tab>("info");

  // ── Chat state ─────────────────────────────────────────────────────────────

  const [chatMode,      setChatMode]      = useState<ChatMode>("directo");
  const [chatInput,     setChatInput]     = useState("");
  const [directoInput,  setDirectoInput]  = useState("");
  const [iaMessages,    setIaMessages]    = useState<ChatMessage[]>([
    { id: "ia-welcome", from: "ia", text: tp("chat_welcome") },
  ]);
  const [directoMessages, setDirectoMessages] = useState<ChatMessage[]>([
    {
      id: "directo-welcome",
      from: "ia",
      text: role === "company"
        ? `Hola, acá podés chatear directamente con el junior adjudicado en tu proyecto.`
        : `Hola${project.empresa ? `, soy ${project.empresa.nombre_comercial}` : ""}. Escribime cualquier duda antes de enviar tu propuesta.`,
    },
  ]);
  const chatEndRef    = useRef<HTMLDivElement>(null);
  const directoEndRef = useRef<HTMLDivElement>(null);

  const directoFileRef = useRef<HTMLInputElement>(null);
  const iaFileRef      = useRef<HTMLInputElement>(null);

  useEffect(() => { iaMessages.length     > 0 && chatEndRef.current?.scrollIntoView({ behavior: "smooth" });    }, [iaMessages]);
  useEffect(() => { directoMessages.length > 0 && directoEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [directoMessages]);

  // ── Junior flow state ──────────────────────────────────────────────────────

  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPending,   startWithdraw] = useTransition();
  const [withdrawError,     setWithdrawError] = useState("");

  const [localEntregables, setLocalEntregables] = useState<Entregable[]>(initialEntregables);
  const [entregableUrl,    setEntregableUrl]    = useState("");
  const [entregableTipo,   setEntregableTipo]   = useState<"parcial" | "final">("final");
  const [showEntregableForm, setShowEntregableForm] = useState(false);
  const [entregablePending,  startEntregable] = useTransition();
  const [entregableError,    setEntregableError] = useState<string | null>(null);

  // ── Empresa flow state ─────────────────────────────────────────────────────

  const [localOffers,     setLocalOffers]     = useState<ProjectOffer[]>(projectOffers ?? MOCK_PROJECT_OFFERS);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>("po-adjudicada");
  const [offerFilter,     setOfferFilter]     = useState<"all" | OfferState>("all");
  const [localEntregablesE, setLocalEntregablesE] = useState<Entregable[]>(MOCK_PROCESO_ENTREGABLES);
  const [revisionMessages,  setRevisionMessages]  = useState<RevisionMessage[]>(MOCK_REVISION_MESSAGES);
  const [revisionInput,     setRevisionInput]     = useState("");

  // ── Derived values ─────────────────────────────────────────────────────────

  const skills       = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));
  const isExpired    = project.fecha_cierre ? new Date(project.fecha_cierre) < new Date() : false;
  const isApplied    = !!offer || submitted;
  const offerState   = offer?.estado.nombre ?? (submitted ? "enviada" as OfferState : null);
  const canWithdraw  = offerState === "enviada" || offerState === "en_revision";
  const isAdjudicada = offerState === "adjudicada";
  const isJunior     = role !== "company";

  const sortedEntregables   = [...localEntregables].sort((a, b) => b.version - a.version);
  const latestEntregable    = sortedEntregables[0];
  const canSubmitEntregable = isAdjudicada && (!latestEntregable || latestEntregable.estado.nombre === "aprobado");

  const adjudicadaOffer = localOffers.find((o) => o.estado.nombre === "adjudicada") ?? null;

  const filteredOffers = offerFilter === "all"
    ? localOffers
    : localOffers.filter((o) => o.estado.nombre === offerFilter);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "info",    label: tp("tab_info"),    icon: Info },
    { key: "chat",    label: tp("tab_chat"),    icon: MessageCircle },
    { key: "proceso", label: tp("tab_proceso"), icon: GitBranch },
  ];

  const trackerSteps = getTrackerSteps(offerState);

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function onSubmitOffer(data: OfferFormValues) {
    setSubmitError("");
    const input = {
      propuesta: data.propuesta,
      ...(data.prototipo_url         ? { prototipo_url: data.prototipo_url }                 : {}),
      ...(data.documentacion_tecnica ? { documentacion_tecnica: data.documentacion_tecnica } : {}),
      ...(data.documentacion_url     ? { documentacion_url: data.documentacion_url }         : {}),
    };
    const result = await submitOfferAction(project.id, input);
    if (result.ok) { setSubmitted(true); }
    else           { setSubmitError(result.error); }
  }

  function attachFile(file: File, mode: ChatMode) {
    const isImage = file.type.startsWith("image/");
    const attachment: Attachment = { name: file.name, url: URL.createObjectURL(file), isImage };
    const msg: ChatMessage = { id: `file-${Date.now()}`, from: "user", text: "", attachment };
    if (mode === "directo") setDirectoMessages((p) => [...p, msg]);
    else                    setIaMessages((p) => [...p, msg]);
  }

  function handleDirectoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { attachFile(file, "directo"); e.target.value = ""; }
  }

  function handleIaFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { attachFile(file, "ia"); e.target.value = ""; }
  }

  function sendDirecto() {
    const text = directoInput.trim();
    if (!text) return;
    setDirectoMessages((p) => [...p, { id: `d-${Date.now()}`, from: "user", text }]);
    setDirectoInput("");
  }

  function sendIa(text?: string) {
    const q = (text ?? chatInput).trim();
    if (!q) return;
    setIaMessages((p) => [
      ...p,
      { id: `u-${Date.now()}`,  from: "user", text: q },
      { id: `ia-${Date.now()}`, from: "ia",   text: getAiResponse(q, project) },
    ]);
    setChatInput("");
  }

  function handleWithdraw() {
    if (!offer) return;
    setWithdrawError("");
    startWithdraw(async () => {
      const result = await withdrawOfferAction(offer.id);
      if (result.ok) { setShowWithdrawModal(false); window.location.reload(); }
      else           { setWithdrawError(result.error); }
    });
  }

  function handleSubmitEntregable(e: React.FormEvent) {
    e.preventDefault();
    if (!entregableUrl.trim()) return;
    setEntregableError(null);
    startEntregable(async () => {
      const result = await submitEntregableAction({ id_proyecto: project.id, url: entregableUrl.trim(), tipo: entregableTipo });
      if (result.ok) {
        setLocalEntregables((p) => [...p, result.data]);
        setEntregableUrl(""); setEntregableTipo("final"); setShowEntregableForm(false);
      } else {
        setEntregableError(result.error);
      }
    });
  }

  // Empresa mock actions
  function decideOffer(offerId: string, accion: "revision" | "adjudicar" | "rechazar") {
    setLocalOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        const next: OfferState =
          accion === "revision"   ? "en_revision"
          : accion === "adjudicar" ? "adjudicada"
          : "no_seleccionada";
        // When adjudicating, reject the others
        return { ...o, estado: { nombre: next } };
      }).map((o) => {
        if (accion !== "adjudicar") return o;
        if (o.id === offerId) return o;
        if (o.estado.nombre === "adjudicada") return o;
        if (o.estado.nombre === "no_seleccionada") return o;
        return { ...o, estado: { nombre: "no_seleccionada" as OfferState } };
      })
    );
    if (accion === "adjudicar") setExpandedOfferId(offerId);
  }

  function decideEntregableEmpresa(entId: string, accion: "aprobar" | "cambios") {
    const next: EntregableState = accion === "aprobar" ? "aprobado" : "en_revision";
    setLocalEntregablesE((prev) => prev.map((e) => e.id === entId ? { ...e, estado: { nombre: next } } : e));
  }

  function sendRevision() {
    const text = revisionInput.trim();
    if (!text) return;
    setRevisionMessages((p) => [...p, { id: `rv-${Date.now()}`, from: "empresa", text, fecha: new Date().toISOString() }]);
    setRevisionInput("");
  }

  // ── Shared chat bubble render ─────────────────────────────────────────────

  function ChatBubble({ msg, mode }: { msg: ChatMessage; mode: ChatMode }) {
    const isUser = msg.from === "user";
    const accentColor = mode === "directo" ? "bg-secondary" : "bg-primary";
    return (
      <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
        {!isUser && (
          <div className={cn("flex size-9 flex-shrink-0 items-center justify-center rounded-full", mode === "directo" ? "bg-secondary/10" : "bg-primary/10")}>
            {mode === "directo"
              ? <Building2 className={cn("size-5", role === "company" ? "text-primary" : "text-secondary")} aria-hidden="true" />
              : <Bot className="size-5 text-primary" aria-hidden="true" />}
          </div>
        )}
        <div className="max-w-[70%] space-y-1">
          {msg.text && (
            <div className={cn("rounded-2xl px-4 py-3 font-body text-base leading-relaxed", isUser ? `${accentColor} text-white` : "border border-border bg-surface text-ink")}>
              {msg.text}
            </div>
          )}
          {msg.attachment && (
            <div className={cn("rounded-2xl overflow-hidden border", isUser ? "border-transparent" : "border-border")}>
              {msg.attachment.isImage
                ? <img src={msg.attachment.url} alt={msg.attachment.name} className="max-h-48 w-auto rounded-2xl object-cover" />
                : (
                  <div className={cn("flex items-center gap-3 rounded-2xl px-4 py-3", isUser ? `${accentColor}` : "bg-surface")}>
                    <FileDown className={cn("size-5 flex-shrink-0", isUser ? "text-white" : "text-primary")} aria-hidden="true" />
                    <span className={cn("font-body text-sm font-semibold truncate max-w-[200px]", isUser ? "text-white" : "text-ink")}>{msg.attachment.name}</span>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex bg-canvas" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-80 flex-shrink-0 flex-col border-r border-border bg-canvas">
        <div className="flex-shrink-0 border-b border-border px-5 py-5">
          <Link
            href={`/${locale}/gestion`}
            className="mb-4 inline-flex items-center gap-1.5 font-body text-sm text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {tp("back")}
          </Link>
          {project.area && (
            <p className="font-body text-xs font-bold uppercase tracking-wider text-primary">
              {project.area.nombre}
            </p>
          )}
          <h1 className="mt-1 font-heading text-base font-extrabold leading-snug tracking-tight text-ink-strong">
            {project.titulo}<span className="text-primary" aria-hidden="true">.</span>
          </h1>
          {project.empresa && (
            <p className="mt-1 font-body text-xs text-ink-muted">{project.empresa.nombre_comercial}</p>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Secciones del proceso">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 font-body text-base font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                activeTab === key ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <Icon className="size-5 flex-shrink-0" aria-hidden="true" />
              {label}
              {key === "proceso" && role === "company" && localOffers.length > 0 && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs font-bold text-primary">
                  {localOffers.length}
                </span>
              )}
              {key === "proceso" && isJunior && isApplied && (
                <span className="ml-auto flex size-2.5 rounded-full bg-accent" aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        {/* Stats for empresa */}
        {role === "company" && (
          <div className="mt-auto border-t border-border p-4">
            <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">Resumen</p>
            <div className="space-y-1">
              {(["enviada", "en_revision", "adjudicada", "no_seleccionada"] as OfferState[]).map((st) => {
                const count = localOffers.filter((o) => o.estado.nombre === st).length;
                if (!count) return null;
                return (
                  <div key={st} className="flex items-center justify-between">
                    <span className="font-body text-sm text-ink-muted">{OFFER_STATE_CONFIG[st].label}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 font-body text-xs font-bold", OFFER_STATE_CONFIG[st].className)}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto">

        {/* ════ INFO TAB ════════════════════════════════════════════════════ */}
        {activeTab === "info" && (
          <div className="space-y-6 px-8 py-8">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
              {project.titulo}<span className="text-primary" aria-hidden="true">.</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {project.empresa && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm font-semibold text-ink-muted">
                  <Building2 className="size-4" aria-hidden="true" />{project.empresa.nombre_comercial}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm font-semibold text-ink-muted">
                <Clock className="size-4" aria-hidden="true" />{project.plazo_dias} días
              </span>
              {project.fecha_publicacion && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm font-semibold text-ink-muted">
                  <Calendar className="size-4" aria-hidden="true" />
                  {new Date(project.fecha_publicacion).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {project.usa_ia && (
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 font-body text-sm font-semibold text-accent">
                  <Zap className="size-4" aria-hidden="true" />{t("uses_ia")}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
              <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-ink-muted">Descripción</h3>
              <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink">{project.descripcion}</p>
            </div>

            {skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-ink-muted">{t("skills_required")}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s.id} className="rounded-full bg-primary/10 px-4 py-1.5 font-body text-sm font-semibold text-primary">{s.nombre}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ CHAT TAB ════════════════════════════════════════════════════ */}
        {activeTab === "chat" && (
          <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
            {/* Mode toggle */}
            <div className="flex-shrink-0 border-b border-border px-6 py-4">
              <div className="flex w-fit rounded-full bg-surface-sunken p-1">
                {([
                  { key: "directo" as ChatMode, icon: Building2, label: tp("chat_directo_mode") },
                  { key: "ia"      as ChatMode, icon: Bot,       label: tp("chat_ia_mode") },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setChatMode(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      chatMode === key ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={directoFileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleDirectoFile}
              aria-hidden="true"
            />
            <input
              ref={iaFileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleIaFile}
              aria-hidden="true"
            />

            {/* Directo chat */}
            {chatMode === "directo" && (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {directoMessages.map((msg) => <ChatBubble key={msg.id} msg={msg} mode="directo" />)}
                  <div ref={directoEndRef} />
                </div>
                <div className="flex-shrink-0 border-t border-border px-6 py-4">
                  <form onSubmit={(e) => { e.preventDefault(); sendDirecto(); }} className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => directoFileRef.current?.click()}
                      aria-label="Adjuntar archivo"
                      className="flex size-12 flex-shrink-0 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:bg-surface-sunken hover:text-secondary"
                    >
                      <Paperclip className="size-5" aria-hidden="true" />
                    </button>
                    <input
                      value={directoInput}
                      onChange={(e) => setDirectoInput(e.target.value)}
                      placeholder="Escribí un mensaje..."
                      className="flex-1 rounded-full border border-border bg-surface-sunken px-5 py-3 font-body text-base text-ink placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                    <button type="submit" aria-label="Enviar"
                      className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-colors hover:bg-secondary/80">
                      <Send className="size-5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* IA chat */}
            {chatMode === "ia" && (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {iaMessages.map((msg) => <ChatBubble key={msg.id} msg={msg} mode="ia" />)}
                  <div ref={chatEndRef} />
                </div>
                {iaMessages.length <= 1 && (
                  <div className="flex-shrink-0 border-t border-border px-6 py-4">
                    <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">{tp("chat_suggested")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {IA_SUGGESTIONS.map((q) => (
                        <button key={q} type="button" onClick={() => sendIa(q)}
                          className="rounded-xl border border-border bg-surface px-4 py-3 text-left font-body text-sm text-ink-muted hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex-shrink-0 border-t border-border px-6 py-4">
                  <form onSubmit={(e) => { e.preventDefault(); sendIa(); }} className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => iaFileRef.current?.click()}
                      aria-label="Adjuntar archivo"
                      className="flex size-12 flex-shrink-0 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:bg-surface-sunken hover:text-primary"
                    >
                      <Paperclip className="size-5" aria-hidden="true" />
                    </button>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={tp("chat_placeholder")}
                      className="flex-1 rounded-full border border-border bg-surface-sunken px-5 py-3 font-body text-base text-ink placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button type="submit" aria-label="Enviar"
                      className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-secondary">
                      <Send className="size-5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ PROCESO TAB ═════════════════════════════════════════════════ */}
        {activeTab === "proceso" && (

          /* ── EMPRESA VIEW ─────────────────────────────────────────────── */
          role === "company" ? (
            <div className="px-8 py-8 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
                    {tp("empresa_proposals_title")}<span className="text-primary" aria-hidden="true">.</span>
                  </h2>
                  <p className="mt-1 font-body text-sm text-ink-muted">{localOffers.length} propuestas recibidas</p>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2">
                {(["all", "enviada", "en_revision", "adjudicada", "no_seleccionada"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setOfferFilter(f)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      offerFilter === f
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-ink-muted hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {f === "all" ? tp("empresa_filter_all") : OFFER_STATE_CONFIG[f].label}
                    {" "}
                    <span className="opacity-70">
                      ({f === "all" ? localOffers.length : localOffers.filter((o) => o.estado.nombre === f).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Offer cards */}
              <div className="space-y-4">
                {filteredOffers.length === 0 && (
                  <p className="font-body text-base text-ink-muted">{tp("empresa_proposals_empty")}</p>
                )}

                {filteredOffers.map((oferta) => {
                  const cfg        = OFFER_STATE_CONFIG[oferta.estado.nombre];
                  const isExpanded = expandedOfferId === oferta.id;
                  const isAdj      = oferta.estado.nombre === "adjudicada";
                  const isRejected = oferta.estado.nombre === "no_seleccionada";
                  const initials   = getInitials(oferta.junior.nombre, oferta.junior.apellido1);

                  return (
                    <div
                      key={oferta.id}
                      className={cn(
                        "rounded-2xl border bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]",
                        isAdj && "border-accent/30 ring-1 ring-accent/10",
                        isRejected && "border-border opacity-60",
                        !isAdj && !isRejected && "border-border hover:border-primary/20 hover:shadow-[var(--shadow-elevated)]"
                      )}
                    >
                      {/* Card header */}
                      <button
                        type="button"
                        onClick={() => setExpandedOfferId(isExpanded ? null : oferta.id)}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "flex size-11 flex-shrink-0 items-center justify-center rounded-full font-body text-sm font-bold",
                          isAdj ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"
                        )}>
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-heading text-base font-bold text-ink-strong">
                              {oferta.junior.nombre} {oferta.junior.apellido1}
                            </span>
                            <span className={cn("rounded-full border px-3 py-0.5 font-body text-xs font-bold", cfg.className)}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="font-body text-sm text-ink-muted line-clamp-1">
                            {oferta.propuesta.slice(0, 100)}…
                          </p>
                        </div>

                        {/* Date + expand */}
                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          <span className="font-body text-xs text-ink-subtle">
                            {new Date(oferta.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="size-4 text-ink-muted" aria-hidden="true" />
                            : <ChevronDown className="size-4 text-ink-muted" aria-hidden="true" />}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                          {/* Full proposal */}
                          <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink">
                            {oferta.propuesta}
                          </p>

                          {/* Prototype link */}
                          {oferta.prototipo_url && (
                            <a href={oferta.prototipo_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
                              Ver prototipo
                              <ExternalLink className="size-3.5" aria-hidden="true" />
                            </a>
                          )}

                          {/* Action buttons */}
                          {!isRejected && !isAdj && (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {oferta.estado.nombre === "enviada" && (
                                <>
                                  <button type="button"
                                    onClick={() => decideOffer(oferta.id, "revision")}
                                    className="rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-secondary transition-colors">
                                    {tp("empresa_move_to_review")}
                                  </button>
                                  <button type="button"
                                    onClick={() => decideOffer(oferta.id, "rechazar")}
                                    className="rounded-full border border-magenta/30 px-5 py-2.5 font-body text-sm font-semibold text-magenta hover:bg-magenta/5 transition-colors">
                                    {tp("empresa_reject")}
                                  </button>
                                </>
                              )}
                              {oferta.estado.nombre === "en_revision" && (
                                <>
                                  <button type="button"
                                    onClick={() => decideOffer(oferta.id, "adjudicar")}
                                    className="rounded-full bg-accent px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-accent/80 transition-colors">
                                    {tp("empresa_adjudicate")}
                                  </button>
                                  <button type="button"
                                    onClick={() => decideOffer(oferta.id, "rechazar")}
                                    className="rounded-full border border-magenta/30 px-5 py-2.5 font-body text-sm font-semibold text-magenta hover:bg-magenta/5 transition-colors">
                                    {tp("empresa_reject")}
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Entregables (solo adjudicada) */}
                          {isAdj && (
                            <div className="space-y-4 border-t border-border pt-4">
                              <h4 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-ink-muted">
                                <PackageCheck className="size-4" aria-hidden="true" />
                                {tm("entregable_label")}
                              </h4>

                              {localEntregablesE.length === 0 && (
                                <p className="font-body text-sm text-ink-subtle">El junior todavía no ha enviado entregables.</p>
                              )}

                              <div className="space-y-2">
                                {[...localEntregablesE].sort((a, b) => b.version - a.version).map((ent) => {
                                  const entCfg = ENTREGABLE_STATE_CONFIG[ent.estado.nombre];
                                  return (
                                    <div key={ent.id}
                                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken px-5 py-3">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-body text-sm font-bold text-ink-muted">v{ent.version} · {tm(`entregable_tipo_${ent.tipo}`)}</span>
                                        <span className={cn("rounded-full px-3 py-0.5 font-body text-sm font-semibold", entCfg.className)}>{entCfg.label}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {ent.url && (
                                          <a href={ent.url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:underline">
                                            Ver <ExternalLink className="size-3" aria-hidden="true" />
                                          </a>
                                        )}
                                        {(ent.estado.nombre === "enviado" || ent.estado.nombre === "en_revision") && (
                                          <>
                                            <button type="button"
                                              onClick={() => decideEntregableEmpresa(ent.id, "aprobar")}
                                              className="rounded-full bg-accent px-3 py-1 font-body text-xs font-semibold text-white hover:bg-accent/80">
                                              {tp("empresa_entregable_approve")}
                                            </button>
                                            <button type="button"
                                              onClick={() => decideEntregableEmpresa(ent.id, "cambios")}
                                              className="rounded-full border border-warning/30 px-3 py-1 font-body text-xs font-semibold text-warning hover:bg-warning/5">
                                              {tp("empresa_entregable_changes")}
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Revision chat */}
                              <div>
                                <h4 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-ink-muted">
                                  <MessageCircle className="size-4" aria-hidden="true" />
                                  {tp("empresa_revision_title")}
                                </h4>

                                <div className="mb-3 max-h-48 space-y-3 overflow-y-auto rounded-xl bg-surface-sunken p-4">
                                  {revisionMessages.map((m) => (
                                    <div key={m.id} className={cn("flex gap-2", m.from === "empresa" && "flex-row-reverse")}>
                                      <div className={cn(
                                        "flex size-7 flex-shrink-0 items-center justify-center rounded-full font-body text-xs font-bold",
                                        m.from === "empresa" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                                      )}>
                                        {m.from === "empresa" ? <Building2 className="size-4" /> : <User className="size-4" />}
                                      </div>
                                      <div className={cn(
                                        "max-w-[75%] rounded-xl px-3 py-2 font-body text-sm leading-relaxed",
                                        m.from === "empresa" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
                                      )}>
                                        {m.text}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    value={revisionInput}
                                    onChange={(e) => setRevisionInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendRevision(); } }}
                                    placeholder={tp("empresa_revision_input")}
                                    className="flex-1 rounded-full border border-border bg-surface-sunken px-4 py-2.5 font-body text-base text-ink outline-none focus:ring-2 focus:ring-primary/30"
                                  />
                                  <button type="button" onClick={sendRevision} aria-label="Enviar"
                                    className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-secondary transition-colors">
                                    <Send className="size-4" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          ) : (

          /* ── JUNIOR / GUEST VIEW ──────────────────────────────────────── */
          <div className="px-8 py-8">
            <div className="space-y-6">

              {/* Vencido */}
              {isExpired && !isApplied && (
                <div className="rounded-2xl border border-magenta/30 bg-magenta/5 p-6">
                  <p className="flex items-center gap-2 font-body text-base font-semibold text-magenta">
                    <Clock className="size-5 shrink-0" aria-hidden="true" />{t("offer_expired")}
                  </p>
                </div>
              )}

              {/* ── FORMULARIO ──────────────────────────────────────────── */}
              {!isApplied && !isExpired && (
                <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-soft)]">
                  <h2 className="mb-2 font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
                    {tp("form_title")}<span className="text-primary" aria-hidden="true">.</span>
                  </h2>
                  <p className="mb-6 font-body text-base text-ink-muted">{tp("form_subtitle")}</p>

                  <form onSubmit={handleSubmit(onSubmitOffer)} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="proc-propuesta" className="font-body text-sm font-semibold text-ink">
                        {t("offer_propuesta_label")}
                      </label>
                      <textarea id="proc-propuesta" rows={7}
                        placeholder={t("offer_propuesta_placeholder")}
                        {...register("propuesta")} aria-invalid={!!errors.propuesta}
                        className="w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-base text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
                      {errors.propuesta && <p className="font-body text-sm text-magenta">{t("offer_propuesta_min")}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="proc-prototipo" className="font-body text-sm font-semibold text-ink">
                        {t("offer_prototipo_label")}
                      </label>
                      <input id="proc-prototipo" type="url"
                        placeholder={t("offer_prototipo_placeholder")}
                        {...register("prototipo_url")} aria-invalid={!!errors.prototipo_url}
                        className="w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-base text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
                      {errors.prototipo_url && <p className="font-body text-sm text-magenta">{t("offer_prototipo_invalid")}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="proc-doc-tecnica" className="font-body text-sm font-semibold text-ink">
                        {t("offer_documentacion_tecnica_label")}
                      </label>
                      <textarea id="proc-doc-tecnica" rows={4}
                        placeholder={t("offer_documentacion_tecnica_placeholder")}
                        {...register("documentacion_tecnica")}
                        className="w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-base text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="proc-doc-url" className="font-body text-sm font-semibold text-ink">
                        {t("offer_documentacion_url_label")}
                      </label>
                      <input id="proc-doc-url" type="url"
                        placeholder={t("offer_documentacion_url_placeholder")}
                        {...register("documentacion_url")} aria-invalid={!!errors.documentacion_url}
                        className="w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-base text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40" />
                      {errors.documentacion_url && <p className="font-body text-sm text-magenta">{t("offer_documentacion_url_invalid")}</p>}
                    </div>

                    {submitError && <p className="font-body text-base text-magenta">{t("offer_error_generic")}</p>}

                    <div>
                      <Button type="submit" disabled={isSubmitting}
                        className="rounded-full bg-primary px-8 py-3 font-body text-base font-semibold text-white hover:bg-secondary">
                        {isSubmitting ? t("offer_submitting") : t("offer_submit")}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── VISTA DE POSTULACIÓN ENVIADA ─────────────────────────── */}
              {isApplied && (
                <>
                  {/* 1. ESTADO */}
                  <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-heading text-lg font-bold text-ink-strong">Estado de tu propuesta</h3>
                      {offerState && (
                        <span className={cn("rounded-full border px-4 py-1.5 font-body text-sm font-semibold", OFFER_STATE_CONFIG[offerState].className)}>
                          {OFFER_STATE_CONFIG[offerState].label}
                        </span>
                      )}
                    </div>
                    <div>
                      {trackerSteps.map((step, i) => (
                        <div key={step.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "flex size-8 items-center justify-center rounded-full border-2",
                              step.rejected ? "border-magenta bg-magenta/10 text-magenta"
                                : step.done  ? "border-accent bg-accent/10 text-accent"
                                : "border-border bg-surface text-ink-subtle"
                            )}>
                              {step.rejected ? <XCircle className="size-4" /> : step.done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                            </div>
                            {i < trackerSteps.length - 1 && (
                              <div className={cn("my-1 w-0.5", step.done ? "bg-accent/30" : "bg-border")} style={{ height: "28px" }} aria-hidden="true" />
                            )}
                          </div>
                          <div className="pb-4 pt-0.5">
                            <p className={cn("font-body text-base font-semibold",
                              step.rejected ? "text-magenta" : step.done ? "text-accent" : "text-ink-subtle")}>
                              {step.key === "decision" && offerState === "no_seleccionada" ? "No seleccionada" : step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {canWithdraw && (
                      <div className="mt-4 border-t border-border pt-4">
                        <button type="button" onClick={() => setShowWithdrawModal(true)}
                          className="inline-flex items-center gap-2 rounded-full border border-magenta/30 px-4 py-2 font-body text-sm font-semibold text-magenta hover:bg-magenta/5 transition-colors">
                          <Trash2 className="size-4" aria-hidden="true" />{tm("withdraw_btn")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. TU PROPUESTA */}
                  {offer && (
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                      <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-ink-strong">
                        <FileText className="size-5" />Tu propuesta
                      </h3>
                      <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink">{offer.propuesta}</p>
                      {(offer.prototipo_url || offer.documentacion_tecnica || offer.documentacion_url) && (
                        <div className="mt-5 space-y-4 border-t border-border pt-5">
                          {offer.prototipo_url && (
                            <div>
                              <p className="mb-1.5 font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("offer_prototipo_label")}</p>
                              <a href={offer.prototipo_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
                                {offer.prototipo_url}<ExternalLink className="size-3.5" />
                              </a>
                            </div>
                          )}
                          {offer.documentacion_tecnica && (
                            <div>
                              <p className="mb-1.5 font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("offer_documentacion_tecnica_label")}</p>
                              <p className="font-body text-base text-ink">{offer.documentacion_tecnica}</p>
                            </div>
                          )}
                          {offer.documentacion_url && (
                            <div>
                              <p className="mb-1.5 font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("offer_documentacion_url_label")}</p>
                              <a href={offer.documentacion_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
                                Ver documentación<ExternalLink className="size-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="font-body text-sm text-ink-subtle">
                          Enviada el {new Date(offer.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}

                  {submitted && !offer && (
                    <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6">
                      <p className="flex items-center gap-2 font-body text-base font-semibold text-accent">
                        <CheckCircle2 className="size-5 shrink-0" />{t("offer_success")}
                      </p>
                    </div>
                  )}

                  {/* 3. ENTREGABLES */}
                  {isAdjudicada && (
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                      <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-ink-strong">
                        <PackageCheck className="size-5" />{tm("entregable_label")}
                      </h3>
                      {sortedEntregables.length > 0 && (
                        <div className="mb-5 flex flex-col gap-2">
                          {sortedEntregables.map((ent) => {
                            const cfg = ENTREGABLE_STATE_CONFIG[ent.estado.nombre] ?? ENTREGABLE_STATE_CONFIG.enviado;
                            return (
                              <div key={ent.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken px-5 py-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="font-body text-sm font-bold text-ink-muted">v{ent.version} · {tm(`entregable_tipo_${ent.tipo}`)}</span>
                                  <span className={cn("rounded-full px-3 py-0.5 font-body text-sm font-semibold", cfg.className)}>{cfg.label}</span>
                                  <span className="font-body text-sm text-ink-subtle">
                                    {new Date(ent.fecha).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                                {ent.url && (
                                  <a href={ent.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
                                    {tm("entregable_view_link")}<ExternalLink className="size-3.5" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {canSubmitEntregable && (
                        showEntregableForm ? (
                          <form onSubmit={handleSubmitEntregable} className="flex flex-col gap-4">
                            <fieldset>
                              <legend className="mb-2 font-body text-sm font-semibold text-ink">{tm("entregable_tipo_label")}</legend>
                              <div className="flex gap-5">
                                {(["parcial", "final"] as const).map((opt) => (
                                  <label key={opt} className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                                    <input type="radio" name="entregable-tipo" value={opt}
                                      checked={entregableTipo === opt} onChange={() => setEntregableTipo(opt)} className="accent-primary" />
                                    {tm(`entregable_tipo_${opt}`)}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                            <div className="flex gap-3">
                              <input type="url" required value={entregableUrl}
                                onChange={(e) => setEntregableUrl(e.target.value)}
                                placeholder={tm("entregable_url_placeholder")}
                                className="flex-1 rounded-xl border border-border bg-surface-sunken px-4 py-3 font-body text-base text-ink outline-none focus:ring-2 focus:ring-primary/20" />
                              <button type="submit" disabled={entregablePending || !entregableUrl.trim()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50">
                                {entregablePending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                {entregablePending ? tm("entregable_sending") : tm("entregable_send_btn")}
                              </button>
                              <button type="button" onClick={() => setShowEntregableForm(false)}
                                className="rounded-full border border-border px-4 py-3 font-body text-sm font-semibold text-ink-muted hover:bg-surface-sunken">
                                {tm("entregable_cancel")}
                              </button>
                            </div>
                            {entregableError && <p className="font-body text-sm text-magenta">{entregableError}</p>}
                          </form>
                        ) : (
                          <button type="button" onClick={() => setShowEntregableForm(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-base font-semibold text-white hover:bg-secondary">
                            <PackageCheck className="size-5" />
                            {sortedEntregables.length > 0 ? tm("entregable_new_version") : tm("entregable_submit_cta")}
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* 4. CHAT DE REVISIONES */}
                  <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                    <h3 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-ink-strong">
                      <MessageCircle className="size-5" />{tp("proceso_revision_chat")}
                    </h3>
                    <p className="mb-5 font-body text-base text-ink-muted">
                      El empresario dejará comentarios aquí al revisar tu propuesta y entregables.
                    </p>
                    <div className="flex gap-3 opacity-50">
                      <input disabled placeholder={tp("proceso_revision_placeholder")}
                        className="flex-1 rounded-full border border-border bg-surface-sunken px-5 py-3 font-body text-base text-ink placeholder:text-ink-subtle outline-none" />
                      <button disabled aria-label="Enviar"
                        className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Send className="size-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          )
        )}
      </main>

      {/* ── Modal retirar postulación ─────────────────────────────────────── */}
      {showWithdrawModal && offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-elevated)]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-magenta/10">
                <Trash2 className="size-6 text-magenta" />
              </div>
              <button type="button" onClick={() => setShowWithdrawModal(false)} className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-ink-strong">{tm("withdraw_modal_title")}</h3>
            <p className="mb-7 font-body text-base text-ink-muted">{tm("withdraw_modal_desc", { titulo: project.titulo })}</p>
            {withdrawError && <p className="mb-4 font-body text-sm text-magenta">{withdrawError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowWithdrawModal(false)}
                className="rounded-full border border-border px-5 py-2.5 font-body text-base font-semibold text-ink-muted hover:bg-surface-sunken">
                {tm("withdraw_modal_cancel")}
              </button>
              <button type="button" disabled={withdrawPending} onClick={handleWithdraw}
                className="inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 font-body text-base font-semibold text-white hover:bg-magenta/90 disabled:opacity-50 transition-colors">
                {withdrawPending ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
                {withdrawPending ? tm("withdraw_modal_removing") : tm("withdraw_modal_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

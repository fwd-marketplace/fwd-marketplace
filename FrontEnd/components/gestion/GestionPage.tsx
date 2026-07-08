"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProjectMatchPanel } from "@/components/gestion/ProjectMatchPanel";
import { ChatPanel } from "@/components/features/proyecto/ChatPanel";
import { PrototipoPreview } from "@/components/shared/prototipo-preview";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Eye,
  GitBranch,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  PackageCheck,
  PauseCircle,
  RotateCcw,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wallet,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getCatalogsAction,
  cancelProjectAction,
  changeProjectStateAction,
  reabrirProyectoAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  getProjectByIdAction,
  getOfertaContactoAction,
  getProjectOffersAction,
  pauseProjectAction,
  resumeProjectAction,
  submitOfferAction,
  reviewOfferAction,
  calificarOfertaAction,
  withdrawOfferAction,
  editOfferAction,
  getMyProjectsAction,
  getMyOffersAction,
  uploadDocumentoAction,
  getProjectEntregablesAction,
  reviewEntregableAction,
} from "@/lib/actions/marketplace";
import { generateProposalAction, suggestStackAction, suggestCompensacionAction } from "@/lib/actions/ai";
import { formatCompensacion, compensacionUpdatedAfterPublish, COMPENSACION_MIN, COMPENSACION_MAX } from "@/lib/marketplace/compensation";
import { intlLocale } from "@/lib/i18n/date-locale";
import { streamAssistant, toAiLocale } from "@/lib/api/ai-client";
import { getProjectMensajesAction, sendMensajeAction, getMyConversacionesAction } from "@/lib/actions/mensajes";
import { MejorarMensajeButton } from "@/components/gestion/MejorarMensajeButton";
import { ReportarMensajeButton } from "@/components/gestion/ReportarMensajeButton";
import { ProjectChatbot } from "@/components/marketplace/ProjectChatbot";
import type {
  AiChatMessage,
  ApiMensaje,
  ApiProject,
  ApiRoleName,
  CatalogArea,
  CatalogSkill,
  ConversacionItem,
  CreateProjectInput,
  Entregable,
  EntregableState,
  MyOffer,
  OfferState,
  ProjectOffer,
  ProjectProposal,
  SuggestStackInput,
  SuggestCompensacionInput,
  UpdateProjectInput,
} from "@/lib/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = "info" | "chat" | "proceso" | "matches";

type ProposalStatus =
  | "nuevo" | "editando" | "enviada" | "revision"
  | "cambios" | "aceptada" | "noseleccionada";

type EmpresaStatus =
  | "enviada" | "revision" | "cambios" | "adjudicada" | "noseleccionada";


interface JuniorProposal {
  v: number;
  offerId: string | null;
  status: ProposalStatus;
  expanded: boolean;
  desc: string;
  link: string;
  fileName: string;
  docUrl: string;
  previewName: string;
  previewProject: string;
  repo: string;
  observaciones: string;
  calificacion: number | null;
  comentario_calificacion: string | null;
}

interface EmpresaProposal {
  v: number;
  offerId: string;
  status: EmpresaStatus;
  dbStatus: EmpresaStatus;  // persisted status from DB — controls editable vs read-only view
  date: string;
  expanded: boolean;
  desc: string;
  link: string;
  repo: string;
  previewName: string;
  previewProject: string;
  comment: string;
}

interface EmpresaStudent {
  id: number;
  offerId: string;
  name: string;
  initials: string;
  date: string;
  expanded: boolean;
  proposals: EmpresaProposal[];
  calificacion: number | null;
  comentario_calificacion: string | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

const OFFER_STATE_CONFIG: Record<
  OfferState,
  { label: string; dot: string; badge: string; step: number }
> = {
  enviada:           { label: "Enviada",            dot: "bg-primary",  badge: "bg-primary/10 text-primary border-primary/20",   step: 0 },
  en_revision:       { label: "En revisión",        dot: "bg-warning",  badge: "bg-warning/10 text-warning border-warning/20",   step: 1 },
  solicitar_cambios: { label: "Cambios solicitados",dot: "bg-magenta",  badge: "bg-magenta/10 text-magenta border-magenta/20",   step: 1 },
  adjudicada:        { label: "Adjudicada",         dot: "bg-accent",   badge: "bg-accent/10 text-accent border-accent/20",      step: 2 },
  no_seleccionada:   { label: "No seleccionada",    dot: "bg-magenta",  badge: "bg-magenta/10 text-magenta border-magenta/20",   step: 2 },
};

function juniorCircle(status: ProposalStatus): { bg: string; icon: ReactNode } {
  switch (status) {
    case "nuevo":
      return { bg: "border-2 border-border bg-transparent", icon: null };
    case "editando":
      return { bg: "border-2 border-secondary bg-transparent", icon: null };
    case "enviada":
    case "revision":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "cambios":
      return { bg: "bg-warning", icon: <span className="font-heading text-sm font-bold leading-none text-white">!</span> };
    case "aceptada":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "noseleccionada":
      return { bg: "bg-ink-muted/50", icon: <X className="size-3.5 text-white" aria-hidden="true" /> };
  }
}

function empresaCircle(status: EmpresaStatus): { bg: string; icon: ReactNode } {
  switch (status) {
    case "enviada":
    case "revision":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "cambios":
      return { bg: "bg-warning", icon: <span className="font-heading text-sm font-bold leading-none text-white">!</span> };
    case "adjudicada":
      return { bg: "bg-accent", icon: <Check className="size-3.5 text-white" aria-hidden="true" /> };
    case "noseleccionada":
      return { bg: "bg-border", icon: <X className="size-3.5 text-ink-muted" aria-hidden="true" /> };
  }
}

const EMPRESA_BADGE: Record<EmpresaStatus, string> = {
  enviada:        "bg-primary/10 text-primary border-primary/20",
  revision:       "bg-warning/10 text-warning border-warning/20",
  cambios:        "bg-magenta/10 text-magenta border-magenta/20",
  adjudicada:     "bg-accent/10 text-accent border-accent/20",
  noseleccionada: "bg-ink-muted/10 text-ink-muted border-border",
};


function blankProposal(v: number): JuniorProposal {
  return { v, offerId: null, status: "nuevo", expanded: false, desc: "", link: "", fileName: "", docUrl: "", previewName: "", previewProject: "", repo: "", observaciones: "", calificacion: null, comentario_calificacion: null };
}

function initJuniorProposals(offers: MyOffer[], project: ApiProject | null): JuniorProposal[] {
  if (offers.length === 0) return [blankProposal(1)];
  const statusMap: Record<OfferState, ProposalStatus> = {
    enviada: "enviada", en_revision: "revision",
    solicitar_cambios: "cambios",
    adjudicada: "aceptada", no_seleccionada: "noseleccionada",
  };
  const result: JuniorProposal[] = offers.map((offer, idx) => ({
    v: idx + 1,
    offerId: offer.id,
    status: statusMap[offer.estado.nombre],
    expanded: false,
    desc: offer.propuesta,
    link: offer.prototipo_url ?? "",
    docUrl: offer.documentacion_url ?? "",
    fileName: offer.documentacion_url
      ? decodeURIComponent(offer.documentacion_url.split("/").pop()?.split("?")[0] ?? "Documento")
      : "",
    previewName: project?.titulo ?? "",
    previewProject: project?.area?.nombre ?? "",
    repo: offer.url_repositorio ?? "",
    observaciones: offer.comentario_revision ?? "",
    calificacion: offer.calificacion ?? null,
    comentario_calificacion: offer.comentario_calificacion ?? null,
  }));
  const latest = offers[offers.length - 1];
  if (latest?.estado.nombre === "solicitar_cambios") {
    result.push(blankProposal(result.length + 1));
  }
  return result;
}

function buildEmpresaStudents(
  offers: ProjectOffer[],
  project: ApiProject | null,
  locale: string,
): EmpresaStudent[] {
  const statusMap: Record<OfferState, EmpresaStatus> = {
    enviada: "enviada", en_revision: "revision",
    solicitar_cambios: "cambios",
    adjudicada: "adjudicada", no_seleccionada: "noseleccionada",
  };
  const STATUS_ORDER: Record<EmpresaStatus, number> = {
    adjudicada: 0, revision: 1, cambios: 1, enviada: 2, noseleccionada: 3,
  };

  const title = project?.titulo ?? "Propuesta";
  const area  = project?.area?.nombre ?? "Proyecto";

  // Group all offers by junior.id — one student row per junior
  const byJunior = new Map<string, ProjectOffer[]>();
  for (const offer of offers) {
    const group = byJunior.get(offer.junior.id) ?? [];
    group.push(offer);
    byJunior.set(offer.junior.id, group);
  }

  const students: EmpresaStudent[] = [];
  let idx = 0;

  for (const [, juniorOffers] of byJunior) {
    // Sort versions oldest-first for v1, v2, v3 numbering
    const versions = [...juniorOffers].sort(
      (a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime(),
    );
    const latest = versions[versions.length - 1]!;
    const initials = ((latest.junior.nombre[0] ?? "") + (latest.junior.apellido1?.[0] ?? "")).toUpperCase();

    const proposals: EmpresaProposal[] = versions.map((offer, vi) => {
      const mappedStatus = statusMap[offer.estado.nombre];
      return {
        v: vi + 1,
        offerId: offer.id,
        status: mappedStatus,
        dbStatus: mappedStatus,
        date: new Date(offer.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" }),
        expanded: false,
        desc: offer.propuesta,
        link: offer.prototipo_url ?? "",
        repo: offer.url_repositorio ?? "",
        previewName: title,
        previewProject: area,
        comment: offer.comentario_revision ?? "",
      };
    });

    students.push({
      id: ++idx,
      offerId: latest.id,
      name: `${latest.junior.nombre} ${latest.junior.apellido1 ?? ""}`.trim(),
      initials,
      date: new Date(latest.fecha_envio).toLocaleDateString(locale, { day: "numeric", month: "long" }),
      expanded: false,
      proposals,
      calificacion: latest.calificacion ?? null,
      comentario_calificacion: latest.comentario_calificacion ?? null,
    });
  }

  // Sort students: adjudicada first, no_seleccionada last
  return students.sort((a, b) => {
    const aStatus = a.proposals[a.proposals.length - 1]?.status ?? "enviada";
    const bStatus = b.proposals[b.proposals.length - 1]?.status ?? "enviada";
    return STATUS_ORDER[aStatus] - STATUS_ORDER[bStatus];
  });
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { role: ApiRoleName | null; userId: string | null; initialProjectId?: string | null; initialSection?: Section | null; disponible?: boolean; initialOffers?: MyOffer[]; initialProject?: ApiProject | null }

export function GestionPage({ role, userId, initialProjectId, initialSection: initialSectionProp = null, disponible = true, initialOffers = [], initialProject = null }: Props) {
  const t      = useTranslations("gestion_page");
  const locale = useLocale();
  const isEmpresa = role === "company";

  // Sidebar data — starts empty, replaced by real API data on mount
  const [sidebarProjects, setSidebarProjects] = useState<ApiProject[]>([]);
  const [myOffers, setMyOffers] = useState<MyOffer[]>(initialOffers);
  const [myConversaciones, setMyConversaciones] = useState<ConversacionItem[]>([]);

  // Catalogs for create/edit form (empresa only)
  const [catalogs, setCatalogs] = useState<{ areas: CatalogArea[]; skills: CatalogSkill[] }>({ areas: [], skills: [] });

  // Create / edit sheet
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Pause / cancel project action
  type ProjectActionKind = "resume" | "pause" | "cancel-step1" | "cancel-step2" | "finalize" | "reopen";
  const [projectActionKind, setProjectActionKind] = useState<ProjectActionKind | null>(null);
  const [projectActionPending, setProjectActionPending] = useState(false);
  const [projectActionError, setProjectActionError] = useState<string | null>(null);

  // Pending navigation when form has unsaved changes
  type PendingNav = { type: "select"; id: string } | { type: "back" } | { type: "create" };
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);

  // Selection state
  const [selectedId, setSelectedId]         = useState<string | null>(initialProjectId ?? null);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(initialProject);
  const [selectedOffers, setSelectedOffers]   = useState<MyOffer[]>([]);
  const [projectLoading, setProjectLoading]   = useState<boolean>(false);
  const [projectError, setProjectError]       = useState<string | null>(null);
  const [projectOffers, setProjectOffers]     = useState<ProjectOffer[]>([]);
  // Si vienen con ?seccion=chat (deep-link desde la campanita), abrir el chat directo.
  // Si no, el junior con proyecto preseleccionado abre "proceso"; el resto, "info".
  const initialSection: Section =
    initialSectionProp ?? ((!isEmpresa && !!initialProjectId) ? "proceso" : "info");
  const [section, setSection]               = useState<Section>(initialSection);

  // Sidebar navigation — pure presentation state (which top-level view is active)
  const [sidebarView, setSidebarView] = useState<"dashboard" | "procesos" | "mensajes">("dashboard");

  // Clean ?proyecto= from URL once used to pre-select
  useEffect(() => {
    if (initialProjectId) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load sidebar on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      if (isEmpresa) {
        const [pr, cr, convR] = await Promise.all([getMyProjectsAction(), getCatalogsAction(), getMyConversacionesAction()]);
        if (active) {
          if (pr.ok) setSidebarProjects(pr.data.projects);
          if (cr.ok) setCatalogs({ areas: cr.data.areas, skills: cr.data.skills });
          if (convR.ok) setMyConversaciones(convR.data);
        }
      } else {
        const [or, convR] = await Promise.all([getMyOffersAction(), getMyConversacionesAction()]);
        if (active) {
          if (or.ok) setMyOffers(or.data.ofertas);
          if (convR.ok) setMyConversaciones(convR.data);
        }
      }
    })();
    return () => { active = false; };
  }, [isEmpresa]);

  // ── Load project detail when selectedId changes (empresa y junior) ──────────
  // El RLS (proyecto_ver_publicados) deja ver cualquier proyecto no-borrador, así que el junior
  // también trae el detalle completo (lo necesita el tab "Información"). Si fallara (caso borde),
  // se queda con lo previo/embed sin error duro. No limpiamos selectedProject antes para evitar parpadeos.
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setProjectError(null);
    setProjectLoading(true);
    (async () => {
      const r = await getProjectByIdAction(selectedId);
      if (active) {
        if (r.ok) setSelectedProject(r.data);
        else if (isEmpresa) setProjectError(r.error);
        setProjectLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedId, isEmpresa]);

  // ── Load section-specific data when selectedId or myOffers change ───────────
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    (async () => {
      if (isEmpresa) {
        const r = await getProjectOffersAction(selectedId);
        if (active && r.ok) setProjectOffers(r.data.ofertas);
      } else {
        const offers = myOffers
          .filter((o) => o.proyecto?.id === selectedId)
          .sort((a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime());
        if (active) setSelectedOffers(offers);
      }
    })();
    return () => { active = false; };
  }, [selectedId, isEmpresa, myOffers]);

  // Refresca la lista de conversaciones del sidebar (para que un chat nuevo aparezca sin recargar).
  const refreshConversaciones = useCallback(async () => {
    const r = await getMyConversacionesAction();
    if (r.ok) setMyConversaciones(r.data);
  }, []);

  // Refresca conversaciones cada 5 s para mantener vivos los indicadores "sin ver" y los chats
  // nuevos. Junior: solo mientras mira "Mensajes" (ahí vive su lista de Directos). Empresa:
  // siempre, porque el badge de pendientes vive en el ícono "Mensajes" del rail y en su bandeja,
  // visibles en toda la vista de gestión. Antes la empresa nunca refrescaba y el badge quedaba
  // congelado al montar.
  useEffect(() => {
    const debePollear = isEmpresa || sidebarView === "mensajes";
    if (!debePollear) return;
    void refreshConversaciones();
    let active = true;
    const timer = setInterval(() => { if (active) void refreshConversaciones(); }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [sidebarView, isEmpresa, refreshConversaciones]);

  // Al abrir el chat de un proyecto, el backend marca esos mensajes como leídos;
  // limpiamos el badge "pendiente" de ese proyecto de inmediato (optimista).
  useEffect(() => {
    if (section !== "chat" || !selectedId) return;
    setMyConversaciones((prev) =>
      prev.map((c) => (c.proyecto.id === selectedId ? { ...c, no_leidos: 0 } : c)),
    );
  }, [section, selectedId]);

  // Devuelve un mensaje de error si el guardado falla (para mostrarlo en el formulario), o null si
  // salió bien. El try/finally garantiza que `formSaving` siempre se libere (botón nunca queda trabado).
  const handleSaveProject = async (
    data: CreateProjectInput | UpdateProjectInput,
  ): Promise<string | null> => {
    setFormSaving(true);
    try {
      if (formMode === "create") {
        const r = await createProjectAction(data as CreateProjectInput);
        if (!r.ok) return r.error;
        const pr = await getMyProjectsAction();
        if (pr.ok) setSidebarProjects(pr.data.projects);
        setSelectedId(r.data.id);
        setSelectedProject(null);
        setSection("info");
        setFormMode(null);
        return null;
      }
      if (formMode === "edit" && selectedId) {
        const r = await updateProjectAction(selectedId, data as UpdateProjectInput);
        if (!r.ok) return r.error;
        setSelectedProject(r.data);
        const pr = await getMyProjectsAction();
        if (pr.ok) setSidebarProjects(pr.data.projects);
        setFormMode(null);
        // Republicar en un paso: si el proyecto estaba pausado y ahora tiene compensación,
        // ofrecer reactivarlo (el diálogo de reactivación confirma y lo vuelve a publicar).
        if (r.data.estado.nombre === "pausado" && r.data.compensacion != null) {
          setProjectActionKind("resume");
        }
        return null;
      }
      return null;
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const r = await deleteProjectAction(deleteTarget);
    if (r.ok) {
      setSidebarProjects((prev) => prev.filter((p) => p.id !== deleteTarget));
      if (selectedId === deleteTarget) {
        setSelectedId(null);
        setSelectedProject(null);
      }
      setDeleteTarget(null);
    } else {
      setDeleteError(r.error);
    }
    setDeleting(false);
  };

  const doSelect = (id: string, initialSection: Section = "info") => {
    setSelectedId(id);
    setSection(initialSection);
    setFormMode(null);
    const proj = sidebarProjects.find((p) => p.id === id) ?? null;
    setSelectedProject(proj);
    if (isEmpresa) setProjectOffers([]);
    else setSelectedOffers(
      myOffers
        .filter((o) => o.proyecto?.id === id)
        .sort((a, b) => new Date(a.fecha_envio).getTime() - new Date(b.fecha_envio).getTime()),
    );
  };

  const handleSelect = (id: string, initialSection: Section = "info") => {
    if (formMode !== null) { setPendingNav({ type: "select", id }); return; }
    doSelect(id, initialSection);
  };

  const handleBack = () => {
    if (formMode !== null) { setPendingNav({ type: "back" }); return; }
    setSelectedId(null);
  };

  const handleConfirmNav = () => {
    if (!pendingNav) return;
    setFormMode(null);
    if (pendingNav.type === "select") doSelect(pendingNav.id);
    else if (pendingNav.type === "back") setSelectedId(null);
    else if (pendingNav.type === "create") setTimeout(() => setFormMode("create"), 0);
    setPendingNav(null);
  };

  const handleResumeProject = async () => {
    if (!selectedId) return;
    setProjectActionPending(true);
    setProjectActionError(null);
    const r = await resumeProjectAction(selectedId);
    setProjectActionPending(false);
    if (r.ok) {
      setSidebarProjects((prev) =>
        prev.map((p) => p.id === selectedId ? { ...p, estado: { ...p.estado, nombre: "en_recepcion" as const } } : p),
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, estado: { ...prev.estado, nombre: "en_recepcion" as const } } : prev,
      );
      setProjectActionKind(null);
    } else {
      setProjectActionError(r.error);
    }
  };

  const handlePauseProject = async () => {
    if (!selectedId) return;
    setProjectActionPending(true);
    setProjectActionError(null);
    const r = await pauseProjectAction(selectedId);
    setProjectActionPending(false);
    if (r.ok) {
      setSidebarProjects((prev) =>
        prev.map((p) => p.id === selectedId ? { ...p, estado: { ...p.estado, nombre: "pausado" as const } } : p),
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, estado: { ...prev.estado, nombre: "pausado" as const } } : prev,
      );
      setProjectActionKind(null);
    } else {
      setProjectActionError(r.error);
    }
  };

  const handleCancelProject = async () => {
    if (!selectedId) return;
    setProjectActionPending(true);
    setProjectActionError(null);
    const r = await cancelProjectAction(selectedId);
    setProjectActionPending(false);
    if (r.ok) {
      setSidebarProjects((prev) => prev.filter((p) => p.id !== selectedId));
      setSelectedId(null);
      setSelectedProject(null);
      setProjectActionKind(null);
    } else {
      setProjectActionError(r.error);
    }
  };

  // Finaliza (cierra) el proyecto: fin de ciclo explícito. Libera al junior adjudicado.
  const handleFinalizeProject = async () => {
    if (!selectedId) return;
    setProjectActionPending(true);
    setProjectActionError(null);
    const r = await changeProjectStateAction(selectedId, "cerrado");
    setProjectActionPending(false);
    if (r.ok) {
      setSidebarProjects((prev) =>
        prev.map((p) => p.id === selectedId ? { ...p, estado: { ...p.estado, nombre: "cerrado" as const } } : p),
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, estado: { ...prev.estado, nombre: "cerrado" as const } } : prev,
      );
      setProjectActionKind(null);
    } else {
      setProjectActionError(r.error);
    }
  };

  // Reabre el proyecto: deshace la adjudicación, vuelve a recepción y las propuestas a "enviada".
  const handleReopenProject = async () => {
    if (!selectedId) return;
    setProjectActionPending(true);
    setProjectActionError(null);
    const r = await reabrirProyectoAction(selectedId);
    setProjectActionPending(false);
    if (r.ok) {
      setSidebarProjects((prev) =>
        prev.map((p) => p.id === selectedId ? { ...p, estado: { ...p.estado, nombre: "en_recepcion" as const } } : p),
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, estado: { ...prev.estado, nombre: "en_recepcion" as const } } : prev,
      );
      // Las propuestas volvieron a "enviada": recargar para reflejarlo en Proceso.
      const or = await getProjectOffersAction(selectedId);
      if (or.ok) setProjectOffers(or.data.ofertas);
      setProjectActionKind(null);
    } else {
      setProjectActionError(r.error);
    }
  };

  // Total de mensajes sin leer (todas las conversaciones): alimenta el badge del ícono "Mensajes"
  // del rail, para que junior y empresa vean de un vistazo si tienen chats pendientes.
  const totalNoLeidos = myConversaciones.reduce((sum, c) => sum + c.no_leidos, 0);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-4 bg-canvas px-4 pt-10 pb-6">

      {/* ── Navigation rail flotante ── */}
      <nav
        className="sticky top-10 self-start flex h-fit shrink-0 w-[72px] flex-col items-center gap-5 rounded-2xl border border-border bg-surface py-6 shadow-[var(--shadow-soft)]"
        aria-label={t("aria_nav_principal")}
      >

        {/* Dashboard */}
        <div className="group relative">
          <button
            type="button"
            onClick={() => { setSidebarView("dashboard"); handleBack(); }}
            aria-current={sidebarView === "dashboard" && !selectedId ? "page" : undefined}
            aria-label={t("aria_dashboard")}
            className={cn(
              "flex size-10 items-center justify-center rounded-[14px] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
              sidebarView === "dashboard" && !selectedId
                ? "bg-secondary text-white shadow-sm"
                : "text-ink-muted hover:bg-secondary/10 hover:text-secondary",
            )}
          >
            <LayoutDashboard className="size-[18px]" aria-hidden="true" />
          </button>
          <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink-strong px-3 py-1.5 font-body text-xs font-semibold text-surface opacity-0 shadow-lg transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100">
            {t("aria_dashboard")}
          </span>
        </div>

        {/* Procesos (solo junior): la empresa no tiene una vista de procesos separada del dashboard,
            así que mostrarle este botón duplicaba el dashboard. Su seguimiento es por proyecto. */}
        {!isEmpresa && (
          <div className="group relative">
            <button
              type="button"
              onClick={() => { setSidebarView("procesos"); handleBack(); }}
              aria-current={sidebarView === "procesos" && !selectedId ? "page" : undefined}
              aria-label={t("aria_procesos")}
              className={cn(
                "flex size-10 items-center justify-center rounded-[14px] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                sidebarView === "procesos" && !selectedId
                  ? "bg-secondary text-white shadow-sm"
                  : "text-ink-muted hover:bg-secondary/10 hover:text-secondary",
              )}
            >
              <GitBranch className="size-[18px]" aria-hidden="true" />
            </button>
            <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink-strong px-3 py-1.5 font-body text-xs font-semibold text-surface opacity-0 shadow-lg transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100">
              {t("aria_procesos")}
            </span>
          </div>
        )}

        {/* Mensajes (junior y empresa): bandeja de conversaciones con badge de sin-leer */}
        <div className="group relative">
          <button
            type="button"
            onClick={() => { setSidebarView("mensajes"); if (isEmpresa) handleBack(); }}
            aria-current={sidebarView === "mensajes" ? "page" : undefined}
            aria-label={t("aria_mensajes")}
            className={cn(
              "flex size-10 items-center justify-center rounded-[14px] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
              sidebarView === "mensajes"
                ? "bg-secondary text-white shadow-sm"
                : "text-ink-muted hover:bg-secondary/10 hover:text-secondary",
            )}
          >
            <Mail className="size-[18px]" aria-hidden="true" />
          </button>
          {totalNoLeidos > 0 && sidebarView !== "mensajes" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 py-px font-body text-[10px] font-bold leading-none text-white shadow-sm"
            >
              {totalNoLeidos > 9 ? "9+" : totalNoLeidos}
            </span>
          )}
          <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink-strong px-3 py-1.5 font-body text-xs font-semibold text-surface opacity-0 shadow-lg transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100">
            {t("aria_mensajes")}
          </span>
        </div>

      </nav>

      {/* ── Sidebar ── */}
      <aside
        aria-label={t("aria_proyectos")}
        className="hidden"
      >
        {!selectedId ? (
          <>
            <div className="shrink-0 border-b border-white/10 px-5 py-5">
              <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-white/50">
                {isEmpresa ? t("section_empresa") : t("section_junior")}
              </p>
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-heading text-xl font-extrabold tracking-tight text-white">
                  {t("title")}<span className="text-highlight" aria-hidden="true">.</span>
                </h1>
                {isEmpresa && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formMode === "edit") { setPendingNav({ type: "create" }); return; }
                      setFormMode("create");
                    }}
                    aria-label={t("aria_nuevo_proyecto")}
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-highlight hover:text-secondary"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {isEmpresa ? (
                (() => {
                  const convSet = new Map(myConversaciones.map((c) => [c.proyecto.id, c.n_participantes]));
                  const unreadByProject = new Map(myConversaciones.map((c) => [c.proyecto.id, c.no_leidos]));
                  if (sidebarProjects.length === 0) {
                    return <SidebarEmpty text={t("empty_empresa")} />;
                  }
                  return (
                    <ul className="flex flex-col gap-0.5">
                      {sidebarProjects.map((proyecto) => {
                        const isSelected = proyecto.id === selectedId;
                        const count  = isSelected ? projectOffers.length : (proyecto.n_ofertas ?? 0);
                        const hasAdj = isSelected && projectOffers.some((o) => o.estado.nombre === "adjudicada");
                        const nChats = convSet.get(proyecto.id) ?? 0;
                        const unread = unreadByProject.get(proyecto.id) ?? 0;
                        return (
                          <li key={proyecto.id}>
                            <div className="group flex items-center gap-1 rounded-xl hover:bg-white/10 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]">
                              <button
                                onClick={() => handleSelect(proyecto.id, "info")}
                                className="flex flex-1 items-center gap-3 px-3 py-3 text-left"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-heading text-sm font-bold text-white">{proyecto.titulo}</p>
                                  <p className="mt-0.5 font-body text-xs text-white/50">
                                    {count > 0 && t("proposals_count", { count })}
                                    {count > 0 && nChats > 0 && " · "}
                                    {nChats > 0 && (
                                      <span className="inline-flex items-center gap-0.5">
                                        <MessageSquare className="size-2.5 inline" aria-hidden="true" />
                                        {t("chat_n_chats", { count: nChats })}
                                      </span>
                                    )}
                                    {count === 0 && nChats === 0 && t("proposals_count", { count: 0 })}
                                  </p>
                                </div>
                                {unread > 0 && (
                                  <span
                                    className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-magenta px-1.5 py-0.5 font-body text-[10px] font-bold text-white"
                                    aria-label={t("chat_no_leidos", { count: unread })}
                                  >
                                    {unread > 9 ? "9+" : unread}
                                  </span>
                                )}
                                {hasAdj && <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />}
                                <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                              </button>
                              {proyecto.estado.nombre === "borrador" && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(proyecto.id); }}
                                  aria-label={t("aria_eliminar_proyecto")}
                                  className="mr-2 hidden size-7 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-magenta/20 hover:text-magenta group-hover:flex"
                                >
                                  <Trash2 className="size-3.5" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()
              ) : (
                (() => {
                  const seen = new Set<string>();
                  const unreadByProject = new Map(myConversaciones.map((c) => [c.proyecto.id, c.no_leidos]));
                  const fromOffers = myOffers
                    .filter((o) => o.proyecto && !seen.has(o.proyecto.id) && !!seen.add(o.proyecto.id))
                    .map((o) => ({ id: o.proyecto!.id, titulo: o.proyecto!.titulo }));
                  const fromConvos = myConversaciones
                    .filter((c) => c.proyecto && !seen.has(c.proyecto.id) && !!seen.add(c.proyecto.id))
                    .map((c) => ({ id: c.proyecto.id, titulo: c.proyecto.titulo }));

                  const renderJuniorItem = (proyecto: { id: string; titulo: string }, soloChat: boolean) => {
                    const latestOferta = myOffers.find((o) => o.proyecto?.id === proyecto.id);
                    const cfg = latestOferta ? OFFER_STATE_CONFIG[latestOferta.estado.nombre] : null;
                    const unread = unreadByProject.get(proyecto.id) ?? 0;
                    return (
                      <li key={proyecto.id}>
                        <button
                          onClick={() => handleSelect(proyecto.id, soloChat ? "chat" : "info")}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-white/10"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-heading text-sm font-bold text-white">{proyecto.titulo}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 font-body text-xs text-white/60">
                              {cfg ? (
                                <>
                                  <span className={cn("size-2 shrink-0 rounded-full", cfg.dot)} aria-hidden="true" />
                                  {cfg.label}
                                </>
                              ) : soloChat ? (
                                <>
                                  <MessageSquare className="size-3 shrink-0 text-white/40" aria-hidden="true" />
                                  {t("junior_solo_chat")}
                                </>
                              ) : (
                                <>
                                  <span className="size-2 shrink-0 rounded-full border border-white/40" aria-hidden="true" />
                                  {t("junior_nueva_postulacion")}
                                </>
                              )}
                            </p>
                          </div>
                          {unread > 0 && (
                            <span
                              className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-magenta px-1.5 py-0.5 font-body text-[10px] font-bold text-white"
                              aria-label={t("chat_no_leidos", { count: unread })}
                            >
                              {unread > 9 ? "9+" : unread}
                            </span>
                          )}
                          {latestOferta?.estado.nombre === "adjudicada" && (
                            <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                          )}
                          <ChevronRight className="size-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  };

                  if (fromOffers.length === 0 && fromConvos.length === 0) {
                    return <SidebarEmpty text={t("empty_junior")} />;
                  }
                  return (
                    <>
                      {fromOffers.length > 0 && (
                        <ul className="flex flex-col gap-0.5">
                          {fromOffers.map((p) => renderJuniorItem(p, false))}
                        </ul>
                      )}
                      {fromConvos.length > 0 && (
                        <>
                          <div className="my-3 flex items-center gap-2 px-3">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/30">
                              {t("sidebar_chats_label")}
                            </span>
                            <div className="h-px flex-1 bg-white/10" />
                          </div>
                          <ul className="flex flex-col gap-0.5">
                            {fromConvos.map((p) => renderJuniorItem(p, true))}
                          </ul>
                        </>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 border-b border-white/10 px-5 py-5">
              <button
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-white"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                {t("all_projects")}
              </button>
              <h2 className="font-heading text-sm font-extrabold leading-snug tracking-tight text-white">
                {selectedProject?.titulo ?? myOffers.find((o) => o.proyecto?.id === selectedId)?.proyecto?.titulo ?? ""}<span className="text-highlight" aria-hidden="true">.</span>
              </h2>
              {selectedProject?.area && (
                <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wider text-white/50">
                  {selectedProject.area.nombre}
                </p>
              )}
            </div>
            <nav className="flex flex-col gap-0.5 p-3" aria-label={t("aria_secciones_proyecto")}>
              {(["info", "chat", "proceso"] as const).map((key) => {
                const Icon  = key === "info" ? FileText : key === "chat" ? MessageSquare : GitBranch;
                const label = key === "info" ? t("section_info") : key === "chat" ? t("section_chat") : t("section_proceso");
                return (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      section === key ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
              {isEmpresa && (
                <button
                  onClick={() => setSection("matches")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                    section === "matches" ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                  {t("section_matches")}
                </button>
              )}
            </nav>
          </>
        )}
      </aside>

      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Project header + horizontal section tabs (desktop only — empresa only when junior) */}
        {selectedId && isEmpresa && (
          <div className="hidden shrink-0 items-center gap-3 border-b border-border bg-surface px-6 py-3 md:flex">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] hover:text-ink"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              {t("all_projects")}
            </button>
            <div className="h-4 w-px bg-border" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-ink-strong">
              {selectedProject?.titulo
                ?? myOffers.find((o) => o.proyecto?.id === selectedId)?.proyecto?.titulo
                ?? ""}
              {selectedProject?.area && (
                <span className="ml-2 font-body text-xs font-medium normal-case tracking-normal text-ink-muted">
                  {selectedProject.area.nombre}
                </span>
              )}
            </p>
            <nav className="flex shrink-0 items-center gap-1" aria-label={t("aria_secciones_proyecto")}>
              {(["info", "chat", "proceso"] as const).map((key) => {
                const Icon  = key === "info" ? FileText : key === "chat" ? MessageSquare : GitBranch;
                const label = key === "info" ? t("section_info") : key === "chat" ? t("section_chat") : t("section_proceso");
                return (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)]",
                      section === key ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-canvas hover:text-ink",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
              {isEmpresa && (
                <button
                  onClick={() => setSection("matches")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)]",
                    section === "matches" ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-canvas hover:text-ink",
                  )}
                >
                  <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
                  {t("section_matches")}
                </button>
              )}
            </nav>
          </div>
        )}

        {/* ── Content ── */}
        <main className="min-w-0 flex-1 bg-canvas">
        {isEmpresa && formMode !== null ? (
          <ProjectFormContent
            mode={formMode}
            project={formMode === "edit" ? selectedProject : null}
            catalogs={catalogs}
            saving={formSaving}
            onSave={handleSaveProject}
            onClose={() => setFormMode(null)}
          />
        ) : !isEmpresa && sidebarView === "mensajes" ? (
          <MensajesView
            myOffers={myOffers}
            myConversaciones={myConversaciones}
            projects={sidebarProjects}
            selectedProjectId={selectedId}
            selectedProject={selectedProject}
            projectLoading={projectLoading && !!selectedId && !selectedProject}
            t={t}
            userId={userId}
            onConversationActivity={refreshConversaciones}
            onSelectProject={(id) => handleSelect(id, "chat")}
          />
        ) : isEmpresa && sidebarView === "mensajes" ? (
          <EmpresaMensajesView
            myConversaciones={myConversaciones}
            selectedProjectId={selectedId}
            t={t}
            userId={userId}
            onSelectProject={(id) => handleSelect(id, "chat")}
          />
        ) : !selectedId ? (
          !isEmpresa && sidebarView === "procesos" ? (
            <ProcesosView
              myOffers={myOffers}
              projects={sidebarProjects}
              t={t}
              locale={locale}
              onSelectProject={(id) => handleSelect(id, "proceso")}
            />
          ) : (
            <WelcomePanel
              isEmpresa={isEmpresa}
              hasProjects={sidebarProjects.length > 0}
              projects={sidebarProjects}
              myOffers={myOffers}
              t={t}
              locale={locale}
              onCreateProject={() => setFormMode("create")}
              onSelectProject={(id, section) => handleSelect(id, section ?? (isEmpresa ? "info" : "proceso"))}
              onDeleteProject={isEmpresa ? setDeleteTarget : undefined}
            />
          )
        ) : projectLoading && !selectedProject ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="size-7 animate-spin text-primary" aria-label={t("aria_cargando_proyecto")} />
          </div>
        ) : (
          <>
            {isEmpresa && (
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-canvas/95 px-4 py-3 backdrop-blur-sm md:hidden">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-ink-muted hover:text-ink"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {t("all_projects")}
                </button>
                <span className="flex-1 truncate font-heading text-sm font-bold text-ink-strong">
                  {selectedProject?.titulo ?? myOffers.find((o) => o.proyecto?.id === selectedId)?.proyecto?.titulo}
                </span>
              </div>
            )}
            {!selectedProject && projectError && (
              <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
                <FolderOpen className="size-10 text-ink-muted/30" aria-hidden="true" />
                <p className="font-body text-sm text-ink-muted">{t("project_load_failed")}</p>
                <p className="font-body text-xs text-magenta">{projectError}</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="font-body text-sm font-semibold text-primary hover:underline"
                >
                  {t("back_to_projects")}
                </button>
              </div>
            )}
            {section === "info" && (
              <InfoPanel
                project={selectedProject}
                locale={locale}
                t={t}
                isEmpresa={isEmpresa}
                onEdit={() => setFormMode("edit")}
                onResume={() => setProjectActionKind("resume")}
                onPause={() => setProjectActionKind("pause")}
                onCancel={() => setProjectActionKind("cancel-step1")}
                onFinalize={() => setProjectActionKind("finalize")}
                onReopen={() => setProjectActionKind("reopen")}
              />
            )}
            {section === "chat" && (
              isEmpresa ? (
                <ChatPanel
                  key={selectedId}
                  isEmpresa={isEmpresa}
                  project={selectedProject}
                  userId={userId}
                />
              ) : (
                <>
                  {/* Back to proceso — only shown since junior tab bar is hidden */}
                  <div className="flex items-center gap-2 border-b border-border bg-surface px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setSection("proceso")}
                      className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] hover:text-ink"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      {t("section_proceso")}
                    </button>
                  </div>
                  <JuniorContactoPanel
                    projectId={selectedId}
                    projectTitulo={
                      selectedProject?.titulo
                      ?? myOffers.find((o) => o.proyecto?.id === selectedId)?.proyecto?.titulo
                      ?? myConversaciones.find((c) => c.proyecto.id === selectedId)?.proyecto.titulo
                      ?? ""
                    }
                    empresaNombre={selectedProject?.empresa?.nombre_comercial ?? null}
                    t={t}
                    userId={userId}
                    onConversationActivity={refreshConversaciones}
                  />
                </>
              )
            )}
            {section === "proceso" && (
              <ProcesoPanel
                key={`proceso-${selectedId}-${selectedOffers.length}-${projectOffers.length}`}
                isEmpresa={isEmpresa}
                offers={selectedOffers}
                projectOffers={projectOffers}
                project={selectedProject}
                locale={locale}
                t={t}
                userId={userId}
                disponible={disponible}
                onBack={() => { setSidebarView(isEmpresa ? "dashboard" : "procesos"); handleBack(); }}
                onOpenChat={() => { setSidebarView("mensajes"); setSection("chat"); }}
              />
            )}
            {section === "matches" && isEmpresa && (
              <ProjectMatchPanel project={selectedProject} />
            )}
          </>
        )}
      </main>
      </div>{/* end main column */}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <ConfirmDeleteDialog
          projectTitle={sidebarProjects.find((p) => p.id === deleteTarget)?.titulo ?? ""}
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDeleteProject}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        />
      )}

      {/* ── Unsaved changes warning ── */}
      {pendingNav !== null && (
        <UnsavedChangesDialog
          onConfirm={handleConfirmNav}
          onCancel={() => setPendingNav(null)}
        />
      )}

      {/* ── Resume / pause / cancel project dialog ── */}
      {projectActionKind !== null && (
        <ProjectActionDialog
          kind={projectActionKind}
          pending={projectActionPending}
          error={projectActionError}
          t={t}
          onResume={() => void handleResumeProject()}
          onPause={() => void handlePauseProject()}
          onCancel={() => void handleCancelProject()}
          onFinalize={() => void handleFinalizeProject()}
          onReopen={() => void handleReopenProject()}
          onAdvanceToFinal={() => { setProjectActionError(null); setProjectActionKind("cancel-step2"); }}
          onClose={() => { setProjectActionKind(null); setProjectActionError(null); }}
        />
      )}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTranslations<"gestion_page">>;

// ── Welcome panel (main area, no project selected) ────────────────────────────

function WelcomePanel({
  isEmpresa,
  hasProjects,
  projects = [],
  myOffers = [],
  t,
  locale,
  onCreateProject,
  onSelectProject,
  onDeleteProject,
}: {
  isEmpresa: boolean;
  hasProjects: boolean;
  projects?: ApiProject[];
  myOffers?: MyOffer[];
  t: T;
  locale: string;
  onCreateProject: () => void;
  onSelectProject: (id: string, section?: Section) => void;
  onDeleteProject?: ((id: string) => void) | undefined;
}) {
  const [offerPage, setOfferPage] = useState(0);
  const [calendarProjectId, setCalendarProjectId] = useState<string | null>(null);
  const [calendarOffset, setCalendarOffset] = useState(0); // meses desde el mes actual
  const [activityPage, setActivityPage] = useState(0);

  // ── Empresa dashboard ────────────────────────────────────────────────────────
  if (isEmpresa && hasProjects) {
    const totalPropuestas = projects.reduce((acc, p) => acc + (p.n_ofertas ?? 0), 0);
    const totalPorRevisar = projects.reduce((acc, p) => acc + (p.n_por_revisar ?? 0), 0);
    const activos = projects.filter(
      (p) => p.estado.nombre !== "cerrado" && p.estado.nombre !== "cancelado",
    ).length;
    const cerrados = projects.filter((p) => p.estado.nombre === "cerrado").length;

    const estadoColor: Record<string, string> = {
      borrador:      "bg-ink-muted/15 text-ink-muted",
      en_recepcion:  "bg-primary/10 text-primary",
      en_evaluacion: "bg-warning/10 text-warning",
      adjudicado:    "bg-accent/10 text-accent",
      en_desarrollo: "bg-accent/10 text-accent",
      cerrado:       "bg-border text-ink-muted",
      cancelado:     "bg-magenta/10 text-magenta",
      pausado:       "bg-warning/10 text-warning",
    };

    return (
      <div className="h-full overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
            {t("section_empresa")}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
            {t("title")}<span className="text-primary" aria-hidden="true">.</span>
          </h1>
        </div>

        {/* Analíticas */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-[var(--shadow-soft)]">
            <p className="font-heading text-4xl font-black text-secondary">{projects.length}</p>
            <p className="mt-1 font-body text-xs font-semibold text-ink-muted">{t("analytics_projects")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-[var(--shadow-soft)]">
            <p className="font-heading text-4xl font-black text-primary">{totalPropuestas}</p>
            <p className="mt-1 font-body text-xs font-semibold text-ink-muted">{t("analytics_proposals")}</p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-5 text-center shadow-[var(--shadow-soft)]",
              totalPorRevisar > 0 ? "border-warning/30 bg-warning/5" : "border-border bg-surface",
            )}
          >
            <p className={cn("font-heading text-4xl font-black", totalPorRevisar > 0 ? "text-warning" : "text-ink-muted")}>
              {totalPorRevisar}
            </p>
            <p className="mt-1 font-body text-xs font-semibold text-ink-muted">{t("analytics_por_revisar")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center shadow-[var(--shadow-soft)]">
            <p className="font-heading text-4xl font-black text-accent">{activos}</p>
            <p className="mt-1 font-body text-xs font-semibold text-ink-muted">{t("analytics_active")}</p>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-body text-xs font-bold uppercase tracking-widest text-ink-muted">
              {t("analytics_projects_list")}
            </h2>
            <button
              type="button"
              onClick={onCreateProject}
              className="flex items-center gap-1 rounded-full border border-primary/30 px-3 py-1 font-body text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <Plus className="size-3" aria-hidden="true" />
              {t("welcome_cta_empresa")}
            </button>
          </div>
          {projects.map((p) => {
            // La empresa entra directo a "Proceso" (propuestas) si el proyecto tiene propuestas;
            // si es final (cerrado/cancelado) o no tiene propuestas, a "Info" (donde están las
            // acciones de ciclo de vida como Reabrir/Finalizar). Toda la tarjeta es clickeable.
            const esFinal = p.estado.nombre === "cerrado" || p.estado.nombre === "cancelado";
            const tieneProps = (p.n_por_revisar ?? 0) > 0 || (p.n_ofertas ?? 0) > 0;
            const targetSection: Section = !esFinal && tieneProps ? "proceso" : "info";
            return (
              <div
                key={p.id}
                className="group flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
              >
                <button
                  type="button"
                  onClick={() => onSelectProject(p.id, targetSection)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-bold text-ink-strong group-hover:text-primary">
                      {p.titulo}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-ink-muted">
                      {p.area?.nombre ?? "—"} · {p.n_ofertas ?? 0} {t("proposals_count", { count: p.n_ofertas ?? 0 }).replace(/^\d+ /, "")}
                    </p>
                  </div>
                  {(p.n_por_revisar ?? 0) > 0 && (
                    <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 font-body text-[10px] font-bold text-warning">
                      {t("por_revisar_badge", { count: p.n_por_revisar ?? 0 })}
                    </span>
                  )}
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 font-body text-[10px] font-bold", estadoColor[p.estado.nombre] ?? estadoColor.en_recepcion)}>
                    {p.estado.nombre === "en_recepcion" ? t("welcome_state_published") : t(`state_${p.estado.nombre}`)}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-muted/40 transition-colors group-hover:text-primary" aria-hidden="true" />
                </button>
                {p.estado.nombre === "borrador" && onDeleteProject && (
                  <button
                    type="button"
                    onClick={() => onDeleteProject(p.id)}
                    aria-label={t("aria_eliminar_proyecto")}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-muted/50 opacity-0 transition-all hover:bg-magenta/10 hover:text-magenta focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
          {cerrados > 0 && (
            <p className="pt-1 text-center font-body text-xs text-ink-muted">
              {t("analytics_closed", { count: cerrados })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Junior dashboard (tiene postulaciones) ───────────────────────────────────
  if (!isEmpresa && myOffers.length > 0) {
    // Deduplica por proyecto (un junior puede tener un offer por proyecto)
    const uniqueOffers = myOffers.filter(
      (o, idx, arr) => o.proyecto && arr.findIndex((x) => x.proyecto?.id === o.proyecto?.id) === idx,
    );

    const PAGE_SIZE   = 5;
    const totalPages  = Math.max(1, Math.ceil(uniqueOffers.length / PAGE_SIZE));
    const safePage    = Math.min(offerPage, totalPages - 1);
    const pagedOffers = uniqueOffers.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

    // Paleta para bordes de cards: magenta → cyan → amarillo → naranja → azul → morado (últimos)
    const PALETTE_HEX = ["#EC008C", "#20BEC6", "#FFCB05", "#F7901E", "#0A6CB9", "#662D91"];

    // Mapa de etiqueta de evento por estado
    const activityLabel: Record<OfferState, string> = {
      enviada:           t("junior_activity_enviada"),
      en_revision:       t("junior_activity_en_revision"),
      solicitar_cambios: t("junior_activity_solicitar_cambios"),
      adjudicada:        t("junior_activity_adjudicada"),
      no_seleccionada:   t("junior_activity_no_seleccionada"),
    };

    // Genera eventos de actividad por oferta.
    // weight refleja el orden lógico en que ocurrieron los eventos dentro de la misma oferta:
    //   0 = propuesta enviada (lo primero), 1 = cambio de estado, 2 = calificación (lo último)
    // El sort usa fecha DESC primero y weight DESC como desempate, para que lo más reciente
    // quede siempre arriba sin importar que compartan la misma fecha_envio.
    type ActivityEvent = {
      key: string; projectId: string; title: string;
      label: string; dot: string; date: string; weight: number;
    };
    const activityEvents: ActivityEvent[] = [];
    for (const offer of uniqueOffers) {
      if (!offer.proyecto) continue;
      const cfg = OFFER_STATE_CONFIG[offer.estado.nombre];
      activityEvents.push({
        key: `${offer.id}-enviada`,
        projectId: offer.proyecto.id,
        title: offer.proyecto.titulo,
        label: t("junior_activity_enviada"),
        dot: "bg-primary",
        date: offer.fecha_envio,
        weight: 0,
      });
      if (offer.estado.nombre !== "enviada") {
        activityEvents.push({
          key: `${offer.id}-state`,
          projectId: offer.proyecto.id,
          title: offer.proyecto.titulo,
          label: activityLabel[offer.estado.nombre],
          dot: cfg.dot,
          date: offer.fecha_envio,
          weight: 1,
        });
      }
      if (offer.calificacion !== null) {
        activityEvents.push({
          key: `${offer.id}-rating`,
          projectId: offer.proyecto.id,
          title: offer.proyecto.titulo,
          label: t("junior_activity_calificado"),
          dot: "bg-highlight",
          date: offer.fecha_envio,
          weight: 2,
        });
      }
    }
    // Más reciente primero; desempate por weight DESC (calificación > estado > envío)
    activityEvents.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return diff !== 0 ? diff : b.weight - a.weight;
    });

    const today      = new Date();
    const calLocale  = locale === "es" ? "es-ES" : "en-US";

    // Mes visualizado — derivado del offset navegable
    const viewDate   = new Date(today.getFullYear(), today.getMonth() + calendarOffset, 1);
    const year       = viewDate.getFullYear();
    const month      = viewDate.getMonth();
    const daysInMonth    = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Lun=0
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const monthLabel = viewDate.toLocaleString(calLocale, { month: "long", year: "numeric" });

    const activityDays = new Set(
      myOffers
        .map((o) => {
          const d = new Date(o.fecha_envio);
          return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : -1;
        })
        .filter((d) => d > 0),
    );

    const dayHeaders = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, i + 1); // Jan 1 2024 = lunes
      return d.toLocaleString(calLocale, { weekday: "narrow" });
    });

    const recentActivity = [...myOffers]
      .sort((a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime())
      .slice(0, 5);

    const activeOffers = myOffers.filter((o) => o.estado.nombre !== "no_seleccionada");

    return (
      <div className="bg-canvas">
        <div className="px-4 pb-10 sm:px-6 lg:px-10">

          {/* ── Header row ─────────────────────────────────────────────────── */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
                {t("section_junior")}
              </p>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong sm:text-4xl">
                {t("title")}<span className="text-primary" aria-hidden="true">.</span>
              </h1>
            </div>
            <a
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {t("junior_dash_explore")}
            </a>
          </div>

          {/* ── Top widgets: Calendar (1/3) + Active projects (2/3) ───────── */}
          <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-3 [&>*]:min-w-0">

            {/* Widget 1 — Calendario interactivo */}
            {(() => {
              // Proyecto seleccionado en el calendario
              const selOffer = calendarProjectId
                ? uniqueOffers.find((o) => o.proyecto?.id === calendarProjectId) ?? null
                : null;
              const selIdx   = selOffer ? uniqueOffers.indexOf(selOffer) : -1;
              const selColor = selIdx >= 0 ? PALETTE_HEX[selIdx % PALETTE_HEX.length] : null;

              // Lógica de fechas:
              // - inicio  = fecha_envio (cuando el junior mandó su propuesta)
              // - cierre  = proyecto.fecha_cierre (fecha de publicación + plazo_dias del proyecto)
              // - si adjudicada → start = end = fecha_envio (punto único, proyecto cerrado)
              const getOfferDates = (offer: MyOffer) => {
                const start = new Date(offer.fecha_envio);
                start.setHours(0, 0, 0, 0);

                if (offer.estado.nombre === "adjudicada") {
                  return { start, end: start }; // punto único
                }

                if (offer.proyecto?.fecha_cierre) {
                  const end = new Date(offer.proyecto.fecha_cierre);
                  end.setHours(0, 0, 0, 0);
                  return { start, end };
                }

                return { start, end: null }; // sin fecha de cierre todavía
              };

              const selDates = selOffer ? getOfferDates(selOffer) : null;

              const getDayRole = (day: number): "start" | "end" | "range" | null => {
                if (!selDates) return null;
                const d = new Date(year, month, day); d.setHours(0, 0, 0, 0);
                const ts = d.getTime();
                if (ts === selDates.start.getTime()) return "start";
                if (!selDates.end || selDates.end.getTime() === selDates.start.getTime()) return null;
                if (ts === selDates.end.getTime()) return "end";
                if (d > selDates.start && d < selDates.end) return "range";
                return null;
              };

              return (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                  {/* Mes + navegación */}
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <h2 className="font-heading text-sm font-bold capitalize text-ink-strong">
                      {monthLabel}
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalendarOffset((n) => n - 1)}
                        className="flex size-7 items-center justify-center rounded-lg text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-canvas hover:text-ink-strong"
                        aria-label="Mes anterior"
                      >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarOffset((n) => n + 1)}
                        className="flex size-7 items-center justify-center rounded-lg text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-canvas hover:text-ink-strong"
                        aria-label="Mes siguiente"
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Cabeceras días */}
                  <div className="mb-1 grid grid-cols-7 text-center">
                    {dayHeaders.map((d, i) => (
                      <div key={i} className="py-1 font-body text-[10px] font-bold uppercase text-ink-muted/40">{d}</div>
                    ))}
                  </div>

                  {/* Días */}
                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day  = i + 1;
                      const isToday = isCurrentMonth && day === today.getDate();
                      const role = getDayRole(day);
                      const isEndpoint = role === "start" || role === "end";

                      return (
                        <div
                          key={day}
                          className={cn(
                            "relative mx-auto mb-0.5 flex size-7 items-center justify-center font-body text-xs transition-colors",
                            isEndpoint   && "rounded-full font-bold text-white",
                            role === "range" && "text-ink-strong font-medium",
                            !role && isToday && "rounded-full bg-ink-strong/10 font-semibold text-ink-strong",
                            !role && !isToday && "rounded-full text-ink hover:bg-canvas",
                          )}
                          style={
                            isEndpoint && selColor
                              ? { backgroundColor: selColor }
                              : role === "range" && selColor
                                ? { backgroundColor: `${selColor}22` }
                                : {}
                          }
                        >
                          {day}
                          {role === "range" && selColor && (
                            <span
                              className="absolute bottom-0.5 left-0 right-0 h-0.5"
                              style={{ backgroundColor: `${selColor}90` }}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tarjetas de proyectos */}
                  <div className="mt-5 border-t border-border pt-4">
                    {uniqueOffers.length === 0 ? (
                      <p className="text-center font-body text-xs text-ink-muted">{t("junior_cal_hint")}</p>
                    ) : (
                      <>
                        <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted/60">
                          {t("junior_cal_hint")}
                        </p>
                        <div className="max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
                          {uniqueOffers.map((offer, idx) => {
                            if (!offer.proyecto) return null;
                            const color      = PALETTE_HEX[idx % PALETTE_HEX.length];
                            const isSelected = calendarProjectId === offer.proyecto.id;
                            const startDate  = new Date(offer.fecha_envio);
                            const isAdjudicada = offer.estado.nombre === "adjudicada";
                            const realFechaCierre = offer.proyecto.fecha_cierre
                              ? new Date(offer.proyecto.fecha_cierre)
                              : null;

                            const endLabel = isAdjudicada
                              ? t("junior_cal_adjudicated")
                              : realFechaCierre
                                ? `${t("junior_cal_end")}: ${realFechaCierre.toLocaleDateString(locale)}`
                                : null;

                            return (
                              <button
                                key={offer.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setCalendarProjectId(null);
                                  } else {
                                    setCalendarProjectId(offer.proyecto?.id ?? null);
                                    // Navegar al mes de inicio del proyecto
                                    const start = new Date(offer.fecha_envio);
                                    const offset =
                                      (start.getFullYear() - today.getFullYear()) * 12 +
                                      (start.getMonth() - today.getMonth());
                                    setCalendarOffset(offset);
                                  }
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-[var(--duration-fast)]",
                                  isSelected ? "bg-canvas" : "hover:bg-canvas",
                                )}
                                style={isSelected ? { boxShadow: `0 0 0 1px ${color}` } : {}}
                              >
                                <div
                                  className="size-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-heading text-xs font-bold text-ink-strong">
                                    {offer.proyecto.titulo}
                                  </p>
                                  <p className="font-body text-[10px] text-ink-muted">
                                    {t("junior_cal_applied")}: {startDate.toLocaleDateString(locale)}
                                    {endLabel && ` · ${endLabel}`}
                                  </p>
                                </div>
                                {isSelected && (
                                  <span
                                    className="size-1.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: color }}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Widget 2 — Mis proyectos (paginado, sin duplicados) */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-base font-bold text-ink-strong">{t("junior_dash_list")}</h2>
                  <p className="mt-0.5 font-body text-xs text-ink-muted">
                    {uniqueOffers.length} {t("junior_dash_active_label")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {pagedOffers.map((offer) => {
                  if (!offer.proyecto) return null;
                  const cfg        = OFFER_STATE_CONFIG[offer.estado.nombre];
                  const globalIdx  = uniqueOffers.indexOf(offer);
                  const borderColor = PALETTE_HEX[globalIdx % PALETTE_HEX.length];
                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => onSelectProject(offer.proyecto!.id)}
                      className="group flex w-full items-center gap-4 rounded-xl border-l-[3px] bg-canvas px-4 py-3 text-left transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-soft)]"
                      style={{ borderLeftColor: borderColor }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-sm font-bold text-ink-strong group-hover:text-primary">
                          {offer.proyecto.titulo}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 font-body text-[10px] text-ink-muted">
                          <Clock className="size-3 shrink-0" aria-hidden="true" />
                          {t("applied_on")} {new Date(offer.fecha_envio).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <span className={cn("shrink-0 rounded-full border px-2.5 py-1 font-body text-[10px] font-bold", cfg.badge)}>
                        {cfg.label}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-ink-muted/30 transition-colors group-hover:text-primary" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setOfferPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    aria-label={t("junior_dash_prev_page")}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-body text-xs font-semibold text-ink-muted transition-colors disabled:opacity-30 hover:bg-canvas hover:text-ink"
                  >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="font-body text-xs text-ink-muted">
                    {t("junior_dash_page", { current: safePage + 1, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOfferPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage === totalPages - 1}
                    aria-label={t("junior_dash_next_page")}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-body text-xs font-semibold text-ink-muted transition-colors disabled:opacity-30 hover:bg-canvas hover:text-ink"
                  >
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Widget 3 — Actividad reciente ────────────────────────────── */}
          {(() => {
            const ACT_PAGE_SIZE  = 5;
            const actTotalPages  = Math.max(1, Math.ceil(activityEvents.length / ACT_PAGE_SIZE));
            const safeActPage    = Math.min(activityPage, actTotalPages - 1);
            const pagedActivity  = activityEvents.slice(
              safeActPage * ACT_PAGE_SIZE,
              (safeActPage + 1) * ACT_PAGE_SIZE,
            );
            const calLocaleAct   = locale === "es" ? "es-ES" : "en-US";

            return (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-heading text-base font-bold text-ink-strong">{t("junior_recent_activity")}</h2>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-canvas">
                    <Activity className="size-4 text-ink-muted/60" aria-hidden="true" />
                  </span>
                </div>

                {/* Lista */}
                <div className="divide-y divide-border">
                  {pagedActivity.map((event, idx) => {
                    const d = new Date(event.date);
                    const dateStr = d.toLocaleDateString(calLocaleAct, { day: "numeric", month: "short", year: "numeric" });
                    const timeStr = d.toLocaleTimeString(calLocaleAct, { hour: "2-digit", minute: "2-digit" });
                    return (
                      <button
                        key={event.key}
                        type="button"
                        onClick={() => onSelectProject(event.projectId)}
                        className={cn(
                          "group flex w-full items-center gap-3 text-left transition-colors duration-[var(--duration-fast)] hover:bg-canvas",
                          idx === 0 ? "pb-3" : "py-3",
                        )}
                      >
                        <div className={cn("size-2 shrink-0 rounded-full", event.dot)} />
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm font-semibold text-ink-strong group-hover:text-primary">
                            {event.label}
                          </p>
                          <p className="truncate font-body text-xs text-ink-muted">{event.title}</p>
                        </div>
                        <p className="shrink-0 text-right font-body text-[10px] text-ink-muted">
                          <span className="block">{dateStr}</span>
                          <span className="block text-ink-muted/60">{timeStr}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Paginación estilo marketplace */}
                {actTotalPages > 1 && (
                  <nav className="mt-5 flex items-center justify-center gap-1.5 border-t border-border pt-5" aria-label={t("junior_recent_activity")}>
                    <button
                      type="button"
                      aria-label={t("junior_dash_prev_page")}
                      disabled={safeActPage === 0}
                      onClick={() => setActivityPage((p) => Math.max(0, p - 1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-border bg-transparent text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-canvas disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                    </button>
                    {Array.from({ length: actTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        aria-current={page === safeActPage + 1 ? "page" : undefined}
                        onClick={() => setActivityPage(page - 1)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)]",
                          page === safeActPage + 1
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-transparent text-ink-muted hover:bg-canvas",
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label={t("junior_dash_next_page")}
                      disabled={safeActPage === actTotalPages - 1}
                      onClick={() => setActivityPage((p) => Math.min(actTotalPages - 1, p + 1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-border bg-transparent text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-canvas disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    );
  }

  // ── Estado vacío / junior ────────────────────────────────────────────────────
  const desc = isEmpresa
    ? t("welcome_desc_empresa_empty")
    : hasProjects ? t("welcome_desc_junior") : t("welcome_desc_junior_empty");

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
        {isEmpresa ? t("section_empresa") : t("section_junior")}
      </p>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
        {t("title")}<span className="text-primary" aria-hidden="true">.</span>
      </h1>
      <p className="mt-3 max-w-sm font-body text-base leading-relaxed text-ink-muted">
        {desc}
      </p>
      <div className="mt-6">
        {isEmpresa ? (
          <button
            type="button"
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("welcome_cta_empresa")}
          </button>
        ) : (
          <a
            href={`/${locale}/marketplace`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {t("welcome_cta_junior")}
          </a>
        )}
      </div>
    </div>
  );
}

function SidebarEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <FolderOpen className="size-10 text-white/20" aria-hidden="true" />
      <p className="font-body text-sm text-white/40">{text}</p>
    </div>
  );
}

// ── Procesos view (junior) ────────────────────────────────────────────────────

function ProcesosView({
  myOffers,
  projects,
  t,
  locale,
  onSelectProject,
}: {
  myOffers: MyOffer[];
  projects: ApiProject[];
  t: T;
  locale: string;
  onSelectProject: (id: string) => void;
}) {
  const calLocale = locale === "es" ? "es-ES" : "en-US";

  // For juniors, sidebarProjects is empty — fetch project details on demand
  const [fetchedProjects, setFetchedProjects] = useState<Record<string, ApiProject>>({});

  useEffect(() => {
    const idsToFetch = myOffers
      .filter((o) => o.proyecto && !projects.find((p) => p.id === o.proyecto?.id))
      .map((o) => o.proyecto!.id);
    if (idsToFetch.length === 0) return;
    let active = true;
    Promise.all(idsToFetch.map((id) => getProjectByIdAction(id))).then((results) => {
      if (!active) return;
      const loaded: Record<string, ApiProject> = {};
      for (const r of results) { if (r.ok) loaded[r.data.id] = r.data; }
      setFetchedProjects(loaded);
    });
    return () => { active = false; };
  }, [myOffers, projects]);

  // Deduplicate: one entry per project (latest offer per project)
  const uniqueOffers = myOffers.filter(
    (o, idx, arr) =>
      o.proyecto && arr.findIndex((x) => x.proyecto?.id === o.proyecto?.id) === idx,
  );

  // Timeline step definition for each offer state
  type StepStatus = "done" | "active" | "pending" | "error";
  type TimelineStep = { label: string; status: StepStatus; date?: string };

  function buildTimeline(offer: MyOffer): TimelineStep[] {
    const sent: TimelineStep = {
      label: t("junior_activity_enviada"),
      status: "done",
      date: offer.fecha_envio,
    };

    const estado = offer.estado.nombre;

    if (estado === "enviada") {
      return [sent, { label: t("junior_activity_en_revision"), status: "pending" }];
    }
    if (estado === "en_revision") {
      return [
        sent,
        { label: t("junior_activity_en_revision"), status: "active", date: offer.fecha_envio },
      ];
    }
    if (estado === "solicitar_cambios") {
      return [
        sent,
        { label: t("junior_activity_en_revision"), status: "done", date: offer.fecha_envio },
        { label: t("junior_activity_solicitar_cambios"), status: "active", date: offer.fecha_envio },
      ];
    }
    if (estado === "adjudicada") {
      return [
        sent,
        { label: t("junior_activity_en_revision"), status: "done", date: offer.fecha_envio },
        { label: t("junior_activity_adjudicada"), status: "done", date: offer.fecha_envio },
      ];
    }
    // no_seleccionada
    return [
      sent,
      { label: t("junior_activity_en_revision"), status: "done", date: offer.fecha_envio },
      { label: t("junior_activity_no_seleccionada"), status: "error", date: offer.fecha_envio },
    ];
  }

  // Paleta FWD para los círculos del timeline — morado y azul al final
  const STEP_PALETTE = ["#EC008C", "#20BEC6", "#FFCB05", "#F7901E", "#0A6CB9", "#662D91"];

  // Color del card según área (misma lógica que el marketplace)
  const AREA_HEX_OVERRIDE: Record<string, string> = {
    ventas: "#EC008C",
    operaciones: "#20BEC6",
  };
  const BRAND_HEX = ["#EC008C", "#20BEC6", "#FFCB05", "#F7901E", "#0A6CB9", "#662D91"];
  function getCardColor(areaName?: string | null): string {
    if (!areaName) return "#0A6CB9";
    const key = areaName.toLowerCase().trim();
    if (key in AREA_HEX_OVERRIDE) return AREA_HEX_OVERRIDE[key]!;
    const hash = [...areaName].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return BRAND_HEX[hash % BRAND_HEX.length] ?? "#0A6CB9";
  }

  const STEP_ICON: Record<StepStatus, React.ReactNode> = {
    done:    <Check className="size-3 text-white" />,
    active:  <Clock className="size-3 text-white" />,
    pending: null,
    error:   <X className="size-3 text-white" />,
  };

  if (uniqueOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <FolderOpen className="size-12 text-ink-muted/30" />
        <p className="font-heading text-xl font-bold text-ink-strong">{t("empty_junior")}</p>
        <a
          href={`/${locale}/marketplace`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-secondary"
        >
          <ExternalLink className="size-4" />
          {t("junior_dash_explore")}
        </a>
      </div>
    );
  }

  return (
    <div className="px-8 pb-12 pt-0">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
            {t("section_junior")}
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t("procesos_title")}<span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="mt-1 font-body text-sm text-ink-muted">
            {uniqueOffers.length} {t("procesos_count")}
          </p>
        </div>
        <a
          href={`/${locale}/marketplace`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {t("junior_dash_explore")}
        </a>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-5">
        {uniqueOffers.map((offer) => {
          if (!offer.proyecto) return null;
          const fullProject =
            projects.find((p) => p.id === offer.proyecto?.id) ??
            (offer.proyecto ? (fetchedProjects[offer.proyecto.id] ?? null) : null);
          const steps = buildTimeline(offer);
          const cfg = OFFER_STATE_CONFIG[offer.estado.nombre];
          const hasRating = (offer.calificacion ?? null) !== null;

          const skills = fullProject?.skills.flatMap((s) => s.skill ? [s.skill] : []) ?? [];
          const plazoLabel = fullProject
            ? fullProject.plazo_dias >= 7
              ? `${Math.round(fullProject.plazo_dias / 7)} sem`
              : `${fullProject.plazo_dias} días`
            : null;
          const cardColor = getCardColor(fullProject?.area?.nombre);

          return (
            <div
              key={offer.id}
              className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] lg:grid-cols-[1fr_300px]"
            >
              {/* ── Columna izquierda ── */}
              <div className="flex flex-col p-7" style={{ borderLeft: `4px solid ${cardColor}` }}>
                {/* Título + empresa + badge área (esquina superior derecha) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl font-bold leading-snug text-ink-strong">
                      {offer.proyecto.titulo}
                    </h2>
                    {fullProject?.empresa && (
                      <p className="mt-0.5 font-body text-sm text-ink-muted">
                        {fullProject.empresa.nombre_comercial}
                      </p>
                    )}
                  </div>
                  {fullProject?.area && (
                    <span
                      className="mt-0.5 shrink-0 rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: `${cardColor}18`, color: cardColor }}
                    >
                      {fullProject.area.nombre}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                {fullProject?.descripcion && (
                  <p className="mt-3 font-body text-sm leading-relaxed text-ink line-clamp-2">
                    {fullProject.descripcion}
                  </p>
                )}

                {/* Skills separadas por punto — color del área */}
                {skills.length > 0 && (
                  <p className="mt-3 font-body text-sm font-semibold" style={{ color: cardColor }}>
                    {skills.map((s) => s.nombre).join(" · ")}
                  </p>
                )}

                {/* Separador + meta info + botón */}
                <div className="mt-auto border-t border-border pt-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {plazoLabel && (
                      <span className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
                        <Clock className="size-3.5 shrink-0 text-ink-muted/50" aria-hidden="true" />
                        {plazoLabel}
                      </span>
                    )}
                    {fullProject?.compensacion != null && (
                      <span className="flex items-center gap-1.5 font-body text-xs font-semibold text-accent">
                        <Wallet className="size-3.5 shrink-0" aria-hidden="true" />
                        ${fullProject.compensacion} {fullProject.moneda}
                      </span>
                    )}
                    {fullProject?.usa_ia && (
                      <span className="flex items-center gap-1.5 font-body text-xs font-semibold text-accent">
                        <Zap className="size-3.5 shrink-0" aria-hidden="true" />
                        IA
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectProject(offer.proyecto!.id)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-body text-xs font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary"
                    >
                      {t("procesos_open")}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Columna derecha: timeline ── */}
              <div className="flex flex-col border-t border-border bg-canvas px-6 py-6 lg:border-l lg:border-t-0">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted/50">
                    {t("procesos_timeline")}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 font-body text-[10px] font-bold", cfg.badge)}>
                    {cfg.label}
                  </span>
                </div>

                {/* Steps */}
                <div className="flex flex-col">
                  {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;
                    const paletteColor = step.status === "pending"
                      ? null
                      : STEP_PALETTE[idx % STEP_PALETTE.length];

                    return (
                      <div key={idx} className="flex items-start gap-3">
                        {/* Círculo + línea conectora */}
                        <div className="flex flex-col items-center">
                          <div
                            className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
                            style={
                              paletteColor
                                ? { backgroundColor: paletteColor }
                                : { backgroundColor: "var(--border)" }
                            }
                          >
                            {STEP_ICON[step.status]}
                          </div>
                          {!isLast && (
                            <div
                              className="my-0.5 w-px"
                              style={{
                                minHeight: "24px",
                                backgroundColor: paletteColor ? `${paletteColor}40` : "var(--border)",
                              }}
                            />
                          )}
                        </div>

                        {/* Texto + fecha */}
                        <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
                          <p className={cn(
                            "font-body text-sm font-semibold",
                            step.status === "pending" ? "text-ink-muted/40" : "text-ink-strong",
                          )}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="font-body text-[11px] text-ink-muted">
                              {new Date(step.date).toLocaleDateString(calLocale, { day: "numeric", month: "short", year: "numeric" })}
                              {" · "}
                              {new Date(step.date).toLocaleTimeString(calLocale, { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ver calificación */}
                {hasRating && (
                  <button
                    type="button"
                    onClick={() => onSelectProject(offer.proyecto!.id)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-highlight/15 px-4 py-3 font-body text-sm font-semibold text-ink-strong transition-colors duration-[var(--duration-fast)] hover:bg-highlight/25"
                  >
                    <Star className="size-4 text-highlight" aria-hidden="true" />
                    {t("procesos_ver_calificacion")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Info panel ────────────────────────────────────────────────────────────────

function InfoPanel({
  project, locale, t, isEmpresa, onEdit, onResume, onPause, onCancel, onFinalize, onReopen,
}: {
  project: ApiProject | null;
  locale: string;
  t: T;
  isEmpresa: boolean;
  onEdit: () => void;
  onResume: () => void;
  onPause: () => void;
  onCancel: () => void;
  onFinalize: () => void;
  onReopen: () => void;
}) {
  if (!project) return null;
  const skills = project.skills.filter((s) => s.skill != null);
  const compUpdatedAt = compensacionUpdatedAfterPublish(
    project.compensacion_actualizada_en,
    project.fecha_publicacion,
  );
  const isFinal = project.estado.nombre === "cerrado" || project.estado.nombre === "cancelado";
  const isPaused = project.estado.nombre === "pausado";
  // Proyecto con junior adjudicado y trabajo en curso: se puede finalizar (cerrar) o reabrir.
  const isAdjudicado = project.estado.nombre === "adjudicado" || project.estado.nombre === "en_desarrollo";
  const missingCompensacion = project.compensacion == null;
  // Los pausados también se editan: es como la empresa agrega la compensación que falta para republicar.
  const canEdit = isEmpresa && (project.estado.nombre === "borrador" || project.estado.nombre === "en_recepcion" || isPaused);
  // Reactivar exige compensación (el backend la pide); sin precio se guía con el aviso a agregarla primero.
  const canResume = isEmpresa && isPaused && !missingCompensacion;
  const canPause = isEmpresa && !isFinal && !isPaused;
  const canCancel = isEmpresa && !isFinal;
  const canFinalize = isEmpresa && isAdjudicado;
  // Reabrir también sirve para recuperar un proyecto ya cerrado (deshace el cierre y la adjudicación).
  const canReopen = isEmpresa && (isAdjudicado || project.estado.nombre === "cerrado");
  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-6">
        {project.area && (
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
            {project.area.nombre}
          </p>
        )}
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink-strong">
            {project.titulo}<span className="text-highlight" aria-hidden="true">.</span>
          </h2>
          {isEmpresa && (
            <div className="flex shrink-0 items-center gap-1.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label={t("aria_editar_proyecto")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/30 hover:text-primary"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {canResume && (
                <button
                  type="button"
                  onClick={onResume}
                  aria-label={t("action_resume_btn")}
                  title={t("action_resume_btn")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-accent/40 hover:text-accent"
                >
                  <Zap className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {canPause && (
                <button
                  type="button"
                  onClick={onPause}
                  aria-label={t("action_pause_btn")}
                  title={t("action_pause_btn")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-warning/40 hover:text-warning"
                >
                  <PauseCircle className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {canReopen && (
                <button
                  type="button"
                  onClick={onReopen}
                  aria-label={t("action_reopen_btn")}
                  title={t("action_reopen_btn")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-warning/40 hover:text-warning"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {canFinalize && (
                <button
                  type="button"
                  onClick={onFinalize}
                  aria-label={t("action_finalize_btn")}
                  title={t("action_finalize_btn")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-accent/40 hover:text-accent"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label={t("action_cancel_btn")}
                  title={t("action_cancel_btn")}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-magenta/40 hover:text-magenta"
                >
                  <Ban className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
        {project.empresa && (
          <p className="mt-1 font-body text-sm text-ink-muted">{project.empresa.nombre_comercial}</p>
        )}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {project.compensacion != null && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-body text-sm font-semibold text-accent">
            <Wallet className="size-3.5" aria-hidden="true" />
            {formatCompensacion(project.compensacion, project.moneda)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-sm text-ink-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {project.plazo_dias} {t("days")}
        </span>
        {project.fecha_publicacion && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-body text-sm text-ink-muted">
            <Calendar className="size-3.5" aria-hidden="true" />
            {new Date(project.fecha_publicacion).toLocaleDateString(locale, { day: "numeric", month: "long" })}
          </span>
        )}
        {project.usa_ia && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-body text-sm font-semibold text-accent">
            <Zap className="size-3.5" aria-hidden="true" />
            IA
          </span>
        )}
      </div>
      {compUpdatedAt && (
        <p className="mb-6 -mt-3 font-body text-xs text-ink-muted">
          {t("compensation_updated", {
            date: new Date(compUpdatedAt).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
      )}
      {isEmpresa && isPaused && missingCompensacion && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <AlertCircle className="size-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="min-w-0 flex-1 font-body text-sm text-ink">{t("paused_no_price_notice")}</p>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full bg-warning px-4 py-2 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-warning/85"
          >
            {t("paused_no_price_cta")}
          </button>
        </div>
      )}
      <div className="mb-4 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">{t("description_label")}</p>
        <p className="font-body text-base leading-relaxed text-ink">{project.descripcion}</p>
      </div>
      {project.condiciones && project.condiciones.trim() && (
        <div className="mb-4 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t("conditions_faq_label")}
          </p>
          <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink">
            {project.condiciones}
          </p>
        </div>
      )}
      {skills.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">{t("skills_label")}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(({ skill }) => (
              <span key={skill!.id} className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                {skill!.nombre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────

function formatChatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit" });
}

// ── Junior: asistente del proyecto + chat humano gateado ────────────────────────
// El junior entra siempre por el asistente (Nivel 0). El chat directo con la empresa solo aparece
// una vez que existe conversación, que únicamente se abre cuando el bot escala (pregunta no técnica).

function JuniorContactoPanel({
  projectId, projectTitulo, empresaNombre, t, userId, onConversationActivity, hideBotFallback,
}: {
  projectId: string | null;
  projectTitulo: string;
  empresaNombre: string | null;
  t: T;
  userId: string | null;
  onConversationActivity?: () => void;
  hideBotFallback?: boolean;
}) {
  const locale = useLocale();
  const [rawMsgs, setRawMsgs] = useState<ApiMensaje[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Guard de desmontaje (seguro para React Strict Mode: se re-activa en cada montaje).
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!projectId || !userId) return;
    try {
      const r = await getProjectMensajesAction(projectId);
      if (mounted.current && r.ok) setRawMsgs(r.data);
    } catch {
      // Ignora fallos transitorios del transporte de Server Actions (p. ej. durante Fast Refresh
      // en dev, cuando un poll queda en vuelo mientras Next recompila). El siguiente poll reintenta;
      // los errores de datos reales ya llegan como Result.err.
    } finally {
      if (mounted.current) setLoaded(true);
    }
  }, [projectId, userId]);

  // Load + poll every 4 s (el hilo aparece solo cuando ya hay conversación)
  useEffect(() => {
    if (!projectId || !userId) return;
    let active = true;
    setRawMsgs([]);
    setLoaded(false);
    void load();
    const timer = setInterval(() => { if (active) void load(); }, 4000);
    return () => { active = false; clearInterval(timer); };
  }, [projectId, userId, load]);

  const hasConversacion = rawMsgs.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawMsgs.length]);

  const empresaName = empresaNombre ?? t("chat_label_empresa");
  const empresaInitial = empresaNombre?.[0]?.toUpperCase() ?? "E";

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !projectId || !userId) return;
    setSending(true);
    setSendError("");
    try {
      const r = await sendMensajeAction(projectId, text);
      if (r.ok) {
        setDraft("");
        await load();
        onConversationActivity?.();
      } else {
        setSendError(t("chat_send_error"));
      }
    } catch {
      setSendError(t("chat_send_error"));
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Vistas mutuamente excluyentes: mientras no haya conversación se muestra SOLO el asistente
          (Nivel 0, dudas técnicas). Cuando el bot escala y se crea el primer mensaje, se pasa a
          mostrar SOLO el chat con la empresa (el asistente ya no ocupa la pantalla). El spinner
          de la primera carga evita que el asistente parpadee antes de mostrar el hilo existente. */}
      {!loaded ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" aria-label={t("chat_loading")} />
        </div>
      ) : hasConversacion || hideBotFallback ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-sm font-bold text-secondary">
              {empresaInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-body text-sm font-bold text-ink-strong">{empresaName}</p>
              <p className="font-body text-xs text-ink-muted">{projectTitulo}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-5">
              {rawMsgs.map((msg) => {
                const isMine = msg.remitente?.id === userId;
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2.5", isMine ? "flex-row-reverse" : "flex-row")}>
                    {!isMine && (
                      <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-xs font-bold text-secondary">
                        {empresaInitial}
                      </div>
                    )}
                    <div className={cn("flex max-w-[72%] flex-col gap-1", isMine ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 font-body text-sm leading-relaxed",
                          isMine
                            ? "rounded-br-sm bg-secondary text-white"
                            : "rounded-bl-sm border border-border bg-surface text-ink",
                        )}
                      >
                        {msg.contenido}
                      </div>
                      <span className="flex items-center gap-1.5 px-1 font-body text-[11px] text-ink-muted">
                        {formatChatTime(msg.fecha_envio, locale)}
                        {!isMine && <ReportarMensajeButton mensajeId={msg.id} />}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                placeholder={t("chat_placeholder")}
                rows={2}
                className="min-h-[64px] flex-1 resize-none rounded-xl border border-border bg-canvas px-4 py-3 font-body text-sm leading-relaxed text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                style={{ maxHeight: 200, overflowY: "auto" }}
              />
              <button
                onClick={() => { void send(); }}
                disabled={!draft.trim() || sending}
                aria-label={t("chat_send")}
                className={cn(
                  "flex size-[42px] shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--duration-fast)]",
                  draft.trim() && !sending
                    ? "bg-secondary text-white hover:bg-secondary/80"
                    : "bg-border text-ink-muted cursor-not-allowed",
                )}
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
            {projectId && (
              <MejorarMensajeButton draft={draft} projectId={projectId} onReplace={setDraft} />
            )}
            {sendError && <p className="mt-1.5 px-1 font-body text-[11px] text-magenta">{sendError}</p>}
            <p className="mt-1.5 px-1 font-body text-[11px] text-ink-muted">{t("chat_hint")}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {projectId && (
            <div className="mx-auto w-full max-w-3xl">
              <ProjectChatbot
                key={projectId ?? ""}
                embedded
                projectId={projectId}
                projectTitulo={projectTitulo}
                onEscalated={() => { void load(); onConversationActivity?.(); }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Proceso panel router ──────────────────────────────────────────────────────

function ProcesoPanel({
  isEmpresa, offers, projectOffers, project, locale, t, userId, disponible, onBack, onOpenChat,
}: {
  isEmpresa: boolean;
  offers: MyOffer[];
  projectOffers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
  onBack?: () => void;
  onOpenChat?: () => void;
}) {
  if (isEmpresa) {
    return <EmpresaProcesoView offers={projectOffers} project={project} locale={locale} t={t} />;
  }
  return <JuniorProcesoView offers={offers} project={project} locale={locale} t={t} userId={userId} disponible={disponible} {...(onBack ? { onBack } : {})} {...(onOpenChat ? { onOpenChat } : {})} />;
}

// ── Junior proceso view ───────────────────────────────────────────────────────

function JuniorProcesoView({
  offers, project, locale, t, userId, disponible, onBack, onOpenChat,
}: {
  offers: MyOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
  userId: string | null;
  disponible: boolean;
  onBack?: () => void;
  onOpenChat?: () => void;
}) {
  const [proposals, setProposals] = useState<JuniorProposal[]>(
    () => initJuniorProposals(offers, project),
  );
  const [submitError, setSubmitError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const init = initJuniorProposals(offers, project);
    return Math.max(0, init.length - 1);
  });
  const [projectInfoOpen, setProjectInfoOpen] = useState(false);
  const closed = proposals.some((p) => p.status === "aceptada" && p.calificacion != null);

  // Reset proposals when offers change (real data loaded from API)
  const latestOfferId = offers[offers.length - 1]?.id;
  useEffect(() => {
    const fresh = initJuniorProposals(offers, project);
    setProposals(fresh);
    setSelectedIdx(Math.max(0, fresh.length - 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length, latestOfferId]);

  // ── State helpers ────────────────────────────────────────────────────────
  const patch = (i: number, p: Partial<JuniorProposal>) =>
    setProposals((prev) => prev.map((x, idx) => idx === i ? { ...x, ...p } : x));

  const startCreate = (i: number) => patch(i, { status: "editando", expanded: true });
  const setField    = (i: number, k: keyof JuniorProposal, v: string) => patch(i, { [k]: v } as Partial<JuniorProposal>);

  const [withdrawConfirmIdx, setWithdrawConfirmIdx] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    patch(i, { fileName: file.name, docUrl: "" });
    setIsUploading(true);
    setSubmitError("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadDocumentoAction(fd);
    setIsUploading(false);
    if (r.ok) {
      patch(i, { docUrl: r.data });
    } else {
      patch(i, { fileName: "", docUrl: "" });
      setSubmitError(r.error);
    }
    e.target.value = "";
  };

  const [withdrawingIdx, setWithdrawingIdx] = useState<number | null>(null);

  const handleWithdraw = async (i: number) => {
    const p = proposals[i];
    if (!p?.offerId || !project) return;
    setWithdrawingIdx(i);
    const result = await withdrawOfferAction(p.offerId);
    setWithdrawingIdx(null);
    if (result.ok) {
      const fresh = await getMyOffersAction();
      if (fresh.ok) {
        const projectOffers = fresh.data.ofertas.filter((o) => o.proyecto?.id === project.id);
        setProposals(initJuniorProposals(projectOffers, project));
      } else {
        setProposals([blankProposal(1)]);
      }
    } else {
      setSubmitError(result.error);
    }
  };

  const startEdit = (i: number) => {
    patch(i, { status: "editando", expanded: true });
  };

  const cancelEdit = (i: number) => {
    const p = proposals[i];
    if (!p) return;
    setSubmitError("");
    if (p.offerId) {
      // Edicion de propuesta existente: volver a enviada y colapsar
      patch(i, { status: "enviada", expanded: false });
    } else {
      // Creacion nueva: volver a estado vacio
      patch(i, { status: "nuevo", expanded: false });
    }
  };

  const submit = async (i: number) => {
    const p = proposals[i];
    if (!p?.desc.trim()) return;
    if (!project || !userId) return;

    if (p.link) {
      try { new URL(p.link); } catch {
        setSubmitError(t("proceso_error_enlace_https"));
        return;
      }
    }

    if (!p.link && !p.docUrl) {
      setSubmitError(t("proceso_error_adjunto_requerido"));
      return;
    }

    setSubmitError("");

    // Editar propuesta existente (status era "enviada", pasó a "editando")
    if (p.offerId) {
      const result = await editOfferAction(p.offerId, {
        propuesta: p.desc,
        prototipo_url: p.link || null,
        documentacion_url: p.docUrl || null,
        url_repositorio: p.repo || null,
      });
      if (result.ok) {
        patch(i, { status: "enviada", expanded: false });
      } else {
        setSubmitError(result.error);
      }
      return;
    }

    // Nueva propuesta
    const result = await submitOfferAction(project.id, {
      propuesta: p.desc,
      ...(p.link ? { prototipo_url: p.link } : {}),
      ...(p.docUrl ? { documentacion_url: p.docUrl } : {}),
      ...(p.repo ? { url_repositorio: p.repo } : {}),
    });
    if (result.ok) {
      patch(i, { status: "enviada", expanded: false, offerId: result.data.id });
    } else {
      setSubmitError(result.error);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const latest  = proposals[proposals.length - 1];
  const hasSent = proposals.some((p) => !["nuevo", "editando"].includes(p.status));
  const isNew   = !latest || latest.status === "nuevo" || latest.status === "editando";

  const propMeta = (status: ProposalStatus): { label: string; cls: string } | null => {
    switch (status) {
      case "enviada":        return { label: t("proceso_badge_enviada"),  cls: "bg-primary/10 text-primary border-primary/20" };
      case "revision":       return { label: t("proceso_badge_revision"), cls: "bg-warning/10 text-warning border-warning/20" };
      case "cambios":        return { label: t("proceso_badge_cambios"),  cls: "bg-magenta/10 text-magenta border-magenta/20" };
      case "aceptada":       return { label: t("proceso_badge_aceptada"), cls: "bg-accent/10 text-accent border-accent/20" };
      case "noseleccionada": return { label: t("proceso_badge_nosel"),    cls: "bg-ink-muted/10 text-ink-muted border-border" };
      default: return null;
    }
  };

  let bannerLabel: string;
  let bannerCls: string;
  if (!isNew && latest) {
    const m = propMeta(latest.status);
    bannerLabel = m?.label ?? t("proceso_badge_pendiente");
    bannerCls   = m?.cls  ?? "bg-ink/5 text-ink-muted border-border";
  } else if (hasSent) {
    bannerLabel = t("proceso_badge_esperando");
    bannerCls   = "bg-ink/5 text-ink-muted border-border";
  } else {
    bannerLabel = t("proceso_badge_pendiente");
    bannerCls   = "bg-ink/5 text-ink-muted border-border";
  }

  const lastReal = proposals[proposals.length - 1];
  let lockCaption = t("proceso_placeholder_nuevo");
  if (lastReal?.status === "enviada" || lastReal?.status === "revision") lockCaption = t("proceso_placeholder_revision");
  else if (lastReal?.status === "cambios") lockCaption = t("proceso_placeholder_cambios");

  const safeIdx = Math.min(selectedIdx, proposals.length - 1);
  const selectedP = proposals[safeIdx];

  // Colorful circles: semantic palette
  const STEP_COLOR: Record<ProposalStatus, string | null> = {
    nuevo:          null,
    editando:       "#662D91",
    enviada:        "#0A6CB9",
    revision:       "#F7901E",
    cambios:        "#EC008C",
    aceptada:       "#20BEC6",
    noseleccionada: "#B3AEC0",
  };

  const stepIcon = (p: JuniorProposal): ReactNode => {
    if (p.status === "nuevo") return null;
    if (p.status === "editando") return <Pencil className="size-3 text-white" aria-hidden="true" />;
    if (p.status === "aceptada") return <Check className="size-3.5 text-white" aria-hidden="true" />;
    if (p.status === "noseleccionada") return <X className="size-3.5 text-white" aria-hidden="true" />;
    if (p.status === "cambios") return <AlertCircle className="size-3.5 text-white" aria-hidden="true" />;
    return p.v === 1
      ? <Send className="size-3 text-white" aria-hidden="true" />
      : <Pencil className="size-3 text-white" aria-hidden="true" />;
  };

  const skills = project?.skills.flatMap((s) => s.skill ? [s.skill] : []) ?? [];

  return (
    <div className="flex min-h-[560px] flex-col lg:flex-row">

      {/* ── Left column ── */}
      <div className="shrink-0 border-b border-border lg:w-[320px] lg:border-b-0 lg:border-r">

        {/* Back + Chat header row */}
        {(onBack || onOpenChat) && (
          <div className="flex items-center justify-between px-5 pb-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-surface px-3 py-2 font-body text-xs font-semibold text-ink shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary hover:text-primary"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                {t("procesos_title")}
              </button>
            ) : <span />}
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-surface px-3 py-2 font-body text-xs font-semibold text-ink shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary hover:text-primary"
              >
                <MessageSquare className="size-3.5" aria-hidden="true" />
                {t("abrir_chat")}
              </button>
            )}
          </div>
        )}

        {/* Project name + company + collapsible toggle */}
        <div className="px-5 pt-4 pb-3">
          <button
            type="button"
            onClick={() => setProjectInfoOpen((v) => !v)}
            className="flex w-full items-start gap-2 text-left"
          >
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-[18px] font-extrabold tracking-tight text-ink-strong line-clamp-2">
                {project?.titulo ?? ""}
              </h2>
              {project?.empresa && (
                <p className="mt-0.5 font-body text-[13px] text-ink-muted line-clamp-1">
                  {project.empresa.nombre_comercial}
                </p>
              )}
            </div>
            <ChevronDown
              className={cn(
                "mt-1 size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)]",
                projectInfoOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {/* Collapsible project info */}
          {projectInfoOpen && (
            <div className="mt-3 flex flex-col gap-3 border-b border-border pb-4">
              {/* Meta pills */}
              {project && (project.compensacion != null || project.plazo_dias != null || project.fecha_cierre || project.usa_ia) && (
                <div className="flex flex-wrap gap-1.5">
                  {project.compensacion != null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-body text-[11px] font-semibold text-accent">
                      <Wallet className="size-3 shrink-0" aria-hidden="true" />
                      ${project.compensacion} {project.moneda}
                    </span>
                  )}
                  {project.plazo_dias != null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-canvas px-2.5 py-1 font-body text-[11px] font-semibold text-ink-muted">
                      <Clock className="size-3 shrink-0" aria-hidden="true" />
                      {t("proceso_duracion", { days: project.plazo_dias })}
                    </span>
                  )}
                  {project.fecha_cierre && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-canvas px-2.5 py-1 font-body text-[11px] font-semibold text-ink-muted">
                      <Calendar className="size-3 shrink-0" aria-hidden="true" />
                      {new Date(project.fecha_cierre).toLocaleDateString(
                        locale === "es" ? "es-CR" : "en-US",
                        { day: "numeric", month: "long" },
                      )}
                    </span>
                  )}
                  {project.usa_ia && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-highlight/30 bg-highlight/10 px-2.5 py-1 font-body text-[11px] font-semibold text-warning">
                      <Zap className="size-3 shrink-0" aria-hidden="true" />
                      IA
                    </span>
                  )}
                </div>
              )}
              {project?.descripcion && (
                <p className="font-body text-[13px] leading-relaxed text-ink">
                  {project.descripcion}
                </p>
              )}
              {skills.length > 0 && (
                <div>
                  <p className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {t("project_skills")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((sk) => (
                      <span key={sk.id} className="rounded-full border border-border bg-canvas px-2.5 py-0.5 font-body text-[11px] font-semibold text-ink">
                        {sk.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project?.condiciones && (
                <div>
                  <p className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {t("project_requirements")}
                  </p>
                  <p className="font-body text-[13px] leading-relaxed text-ink">
                    {project.condiciones}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="px-5 pb-6 pt-2">
          {proposals.map((p, i) => {
            const color = STEP_COLOR[p.status];
            const isSelected = i === safeIdx;
            const isLast = i === proposals.length - 1;
            const showConnector = !isLast || !closed;
            const nextP = proposals[i + 1];
            const connectorColor = nextP ? (STEP_COLOR[nextP.status] ?? "var(--border)") : "var(--border)";

            return (
              <div key={p.v} className="flex gap-3">
                {/* Circle + connector line */}
                <div className="flex shrink-0 flex-col items-center" style={{ width: 28 }}>
                  <div
                    className={cn(
                      "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-[var(--duration-fast)]",
                      p.status === "nuevo" ? "border-2 border-dashed border-border bg-transparent" : "",
                      isSelected && color ? "ring-2 ring-offset-2 ring-offset-canvas" : "",
                    )}
                    style={color ? {
                      backgroundColor: color,
                      ...(isSelected ? { ringColor: color } as React.CSSProperties : {}),
                    } : undefined}
                    onClick={() => { setSelectedIdx(i); if (p.status === "nuevo") startCreate(i); }}
                    role="button"
                    tabIndex={0}
                    aria-label={t("proceso_propuesta_n", { n: p.v })}
                  >
                    {stepIcon(p)}
                  </div>
                  {showConnector && (
                    <div
                      className="mt-1 w-0.5 flex-1 rounded-sm"
                      style={{ minHeight: 24, background: connectorColor }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Label */}
                <button
                  type="button"
                  onClick={() => { setSelectedIdx(i); if (p.status === "nuevo") startCreate(i); }}
                  className={cn(
                    "mb-1 flex min-w-0 flex-1 items-center gap-2 rounded-[10px] px-3 py-2.5 text-left transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                    isSelected ? "bg-secondary/8 ring-1 ring-secondary/20 shadow-sm" : "hover:bg-canvas",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[13px] font-semibold text-ink-strong">
                      {t("proceso_propuesta_n", { n: p.v })}
                    </p>
                    {propMeta(p.status) && (
                      <p className="mt-0.5 font-body text-[11px] text-ink-muted">
                        {propMeta(p.status)?.label}
                      </p>
                    )}
                  </div>
                  {isSelected && <ArrowRight className="size-3.5 shrink-0 text-ink-muted" aria-hidden="true" />}
                </button>
              </div>
            );
          })}

          {/* Ghost — locked next version */}
          {!closed && latest?.status !== "aceptada" && latest?.status !== "noseleccionada" && (
            <div className="flex gap-3">
              <div className="flex shrink-0 flex-col items-center" style={{ width: 28 }}>
                <div
                  className="size-7 shrink-0 rounded-full opacity-30"
                  style={{ border: "2px dashed var(--border)" }}
                  aria-hidden="true"
                />
              </div>
              <div className="mb-1 flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 opacity-40">
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[13px] font-semibold text-ink-muted">
                    {t("proceso_propuesta_n", { n: proposals.length + 1 })}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 font-body text-[11px] text-ink-muted">
                    <Lock className="size-3 shrink-0" aria-hidden="true" />
                    {lockCaption}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Closed */}
          {closed && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 font-body text-[12px] font-semibold"
              style={{ background: "#E0F3E9", color: "#1E7A4F" }}
            >
              <Check className="size-4 shrink-0" aria-hidden="true" />
              {t("proceso_cerrado")}
            </div>
          )}
        </div>
      </div>

      {/* ── Right column — proposal detail ── */}
      <div className="min-w-0 flex-1 bg-canvas">

        {selectedP && (() => {
          const p = selectedP;
          const i = safeIdx;
          const isSent = ["enviada", "revision", "cambios", "aceptada", "noseleccionada"].includes(p.status);
          const isEditing = p.status === "editando";
          const pm = propMeta(p.status);
          const submitOk = p.desc.trim().length > 0;

          /* ── Nuevo: call-to-action ── */
          if (p.status === "nuevo") {
            return (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-10 py-10 text-center">
                {!disponible && (
                  <div className="mb-6 w-full max-w-md rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 font-body text-[13px] text-ink">
                    {t("proceso_busy_message")}
                  </div>
                )}
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary/10">
                  <Send className="size-6 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-extrabold tracking-tight text-ink-strong">
                  {t("proceso_crear_propuesta")}
                </h3>
                <p className="mb-7 max-w-sm font-body text-sm leading-relaxed text-ink-muted">
                  {lockCaption}
                </p>
                <button
                  onClick={() => startCreate(i)}
                  disabled={!disponible}
                  className={cn(
                    "rounded-full bg-secondary px-7 py-3 font-body text-[14px] font-bold text-white transition-colors duration-[var(--duration-fast)]",
                    disponible ? "hover:bg-secondary/80" : "opacity-50 cursor-not-allowed",
                  )}
                >
                  {t("proceso_crear_propuesta")}
                </button>
              </div>
            );
          }

          /* ── Editing form ── */
          if (isEditing) {
            return (
              <div className="px-8 pb-7">
                {/* Status badge only — no proposal title */}
                {pm && (
                  <div className="mb-5 flex justify-end">
                    <span className={cn("inline-flex items-center rounded-full border px-4 py-1.5 font-body text-[13px] font-bold", pm.cls)}>
                      {pm.label}
                    </span>
                  </div>
                )}

                <label className="mb-2 block font-body text-[13px] font-bold text-ink">
                  {t("description_label")}
                </label>
                <textarea
                  placeholder={t("proceso_desc_placeholder")}
                  value={p.desc}
                  onChange={(e) => setField(i, "desc", e.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-border bg-surface p-[13px] font-body text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />

                <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                  {t("proceso_doc_label")}
                  <span className="ml-1 font-normal text-magenta">*</span>
                </label>
                <p className="mb-2 font-body text-[12px] text-ink-muted">{t("proceso_doc_hint")}</p>
                <div className="flex gap-3">
                  <input
                    placeholder={t("proceso_link_placeholder")}
                    value={p.link}
                    onChange={(e) => { setField(i, "link", e.target.value); if (p.docUrl) patch(i, { docUrl: "", fileName: "" }); }}
                    disabled={!!p.docUrl}
                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-[15px] py-3 font-body text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:opacity-50"
                  />
                  <label className={cn(
                    "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-[18px] py-3 font-body text-[14px] font-semibold transition-colors",
                    p.docUrl ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-ink hover:border-secondary hover:text-secondary",
                    p.link && "opacity-50 pointer-events-none",
                    isUploading && "opacity-50 pointer-events-none",
                  )}>
                    {isUploading
                      ? <><Loader2 className="size-[15px] animate-spin" aria-hidden="true" />Subiendo...</>
                      : p.docUrl
                        ? <><CheckCircle2 className="size-[15px]" aria-hidden="true" />{p.fileName}</>
                        : <><Upload className="size-[15px]" aria-hidden="true" />{t("proceso_subir_archivo")}</>
                    }
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      disabled={!!p.link || isUploading}
                      onChange={(e) => { void handleFileChange(e, i); }}
                    />
                  </label>
                </div>

                <div className="my-[22px] h-px bg-border" />

                <p className="font-body text-[13px] font-bold text-ink">{t("proceso_recursos_titulo")}</p>
                <p className="mb-4 mt-[3px] font-body text-[13px] text-secondary">{t("proceso_recursos_subtitulo")}</p>

                <div className="grid gap-[14px]" style={{ gridTemplateColumns: "130px 1fr", alignItems: "center", columnGap: 16 }}>
                  <label className="font-body text-[13px] font-semibold text-ink">{t("proceso_recursos_nombre")}</label>
                  <input value={p.previewName} onChange={(e) => setField(i, "previewName", e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                  <label className="font-body text-[13px] font-semibold text-ink">{t("proceso_recursos_proyecto")}</label>
                  <input value={p.previewProject} onChange={(e) => setField(i, "previewProject", e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                  <label className="font-body text-[13px] font-semibold leading-snug text-ink">{t("proceso_recursos_repo")}</label>
                  <input value={p.repo} onChange={(e) => setField(i, "repo", e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-surface px-[14px] py-[11px] font-body text-[14px] text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                </div>

                {submitError && (
                  <p className="mt-4 font-body text-[13px] text-magenta">{submitError}</p>
                )}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => cancelEdit(i)}
                    className="rounded-xl border border-border bg-surface px-6 py-3 font-body text-[14px] font-semibold text-ink transition-colors duration-[var(--duration-fast)] hover:border-ink-muted hover:text-ink-strong"
                  >
                    {t("proceso_cancelar")}
                  </button>
                  <button
                    onClick={() => { void submit(i); }}
                    disabled={!submitOk || isUploading}
                    className={cn(
                      "rounded-xl bg-secondary px-6 py-3 font-body text-[14px] font-bold text-white transition-colors duration-[var(--duration-fast)]",
                      submitOk && !isUploading ? "hover:bg-secondary/80" : "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {t("proceso_subir_propuesta")}
                  </button>
                </div>
              </div>
            );
          }

          /* ── Read-only sent view ── */
          if (isSent) {
            return (
              <div className="px-8 pb-7">
                {/* Actions + status badge (no title — shown in left column) */}
                <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
                    {p.status === "enviada" && p.offerId && (
                      <>
                        <button
                          onClick={() => startEdit(i)}
                          aria-label={t("proceso_editar")}
                          className="inline-flex items-center justify-center rounded-[10px] bg-highlight p-[9px] text-white transition-colors duration-[var(--duration-fast)] hover:bg-highlight/80"
                        >
                          <Pencil className="size-[15px]" aria-hidden="true" />
                        </button>
                        {withdrawConfirmIdx === i ? (
                          <div className="inline-flex items-center gap-2 rounded-[10px] border border-magenta/30 bg-magenta/5 px-[14px] py-[7px]">
                            <span className="font-body text-[13px] font-semibold text-magenta">
                              {t("proceso_retirar_confirmar")}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setWithdrawConfirmIdx(null); void handleWithdraw(i); }}
                              disabled={withdrawingIdx === i}
                              className="rounded-[8px] bg-magenta px-3 py-1 font-body text-[12px] font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-magenta/80 disabled:opacity-50"
                            >
                              {withdrawingIdx === i ? t("proceso_retirando") : t("proceso_retirar_si")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setWithdrawConfirmIdx(null)}
                              className="rounded-[8px] border border-border bg-surface px-3 py-1 font-body text-[12px] font-semibold text-ink transition-colors duration-[var(--duration-fast)] hover:border-ink-muted"
                            >
                              {t("proceso_cancelar")}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setWithdrawConfirmIdx(i)}
                            disabled={withdrawingIdx === i}
                            aria-label={t("proceso_retirar")}
                            className="inline-flex items-center justify-center rounded-[10px] bg-magenta p-[9px] text-white transition-colors duration-[var(--duration-fast)] hover:bg-magenta/80 disabled:opacity-50"
                          >
                            <Trash2 className="size-[15px]" aria-hidden="true" />
                          </button>
                        )}
                      </>
                    )}
                    {pm && (
                      <span className={cn("inline-flex items-center rounded-full border px-[15px] py-[7px] font-body text-[13px] font-bold whitespace-nowrap", pm.cls)}>
                        {pm.label}
                      </span>
                    )}
                </div>

                <label className="mb-2 block font-body text-[13px] font-bold text-ink">
                  {t("description_label")}
                </label>
                <div className="rounded-xl border border-border bg-canvas p-[14px] font-body text-[14px] leading-relaxed text-ink" style={{ background: "#FBFAFD" }}>
                  {p.desc}
                </div>

                <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                  {t("proceso_doc_label")}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[200px] flex-1 truncate rounded-xl border border-border px-[15px] py-3 font-body text-[14px] text-primary" style={{ background: "#FBFAFD" }}>
                    {p.link || t("proceso_sin_enlace")}
                  </div>
                  {p.fileName && (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-[14px] py-[11px] font-body text-[13px] font-semibold text-ink">
                      <FileText className="size-[14px] text-magenta" aria-hidden="true" />
                      {p.fileName}
                    </div>
                  )}
                </div>

                <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                  {t("proceso_previsualizacion_label")}
                </label>
                {p.link ? (
                  <PrototipoPreview url={p.link} title={p.previewName || undefined} />
                ) : (
                  <p className="font-body text-[13px] text-ink-muted">{t("proceso_sin_enlace")}</p>
                )}

                {p.repo && (
                  <>
                    <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                      {t("proceso_recursos_repo")}
                    </label>
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-[13px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <GitBranch className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{p.repo}</span>
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </>
                )}

                <label className="mb-2 mt-5 block font-body text-[13px] font-bold text-ink">
                  {t("proceso_observaciones_label")}
                </label>
                {p.status === "aceptada" ? (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-[14px] font-body text-[14px] leading-relaxed text-ink">
                    {p.observaciones || t("proceso_revision_empty")}
                  </div>
                ) : (
                  <div
                    className="min-h-[84px] rounded-xl border p-[14px] font-body text-[14px] leading-relaxed"
                    style={p.observaciones
                      ? { borderColor: "#F0CDBF", background: "#FFF6F2", color: "#9A3B23" }
                      : { borderColor: "#E8E5EF", background: "#FBFAFD", color: "#B3AEC0" }}
                  >
                    {p.observaciones || t("proceso_observaciones_empty")}
                  </div>
                )}

                {p.status === "aceptada" && p.calificacion != null && (
                  <div className="mt-4 rounded-xl border border-highlight/30 bg-highlight/5 p-[14px]">
                    <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      {t("proceso_calificacion_empresa")}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={cn("size-5", starIdx < p.calificacion! ? "fill-highlight text-highlight" : "text-border")}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="ml-2 font-heading text-base font-bold text-ink-strong">
                        {p.calificacion}/5
                      </span>
                    </div>
                    {p.comentario_calificacion && (
                      <p className="mt-2 font-body text-sm leading-relaxed text-ink">
                        {p.comentario_calificacion}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })()}
      </div>

    </div>
  );
}

// ── Revisión de entregables (empresa) ─────────────────────────────────────────

const ENTREGABLE_REVIEW_CLASS: Record<EntregableState, string> = {
  enviado:             "bg-primary/10 text-primary",
  aprobado:            "bg-accent/10 text-accent",
  cambios_solicitados: "bg-warning/10 text-warning",
};

/**
 * Lista los entregables del proyecto (más reciente primero) y permite a la empresa
 * aprobarlos o solicitar cambios (con comentario). Solo se muestra para el junior
 * adjudicado. Datos reales vía GET /projects/:id/entregables + PATCH /entregables/:id.
 */
function EntregablesReview({
  projectId, locale, t,
}: {
  projectId: string;
  locale: string;
  t: T;
}) {
  const [entregables, setEntregables] = useState<Entregable[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [cambiosFor, setCambiosFor] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getProjectEntregablesAction(projectId);
    if (result.ok) setEntregables(result.data.entregables);
    else setError(result.error);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const handleReview = async (id: string, accion: "aprobar" | "solicitar_cambios") => {
    if (accion === "solicitar_cambios" && !comentario.trim()) return;
    setPendingId(id);
    setError(null);
    const result = await reviewEntregableAction(
      id,
      accion,
      accion === "solicitar_cambios" ? comentario.trim() : undefined,
    );
    if (result.ok) {
      setCambiosFor(null);
      setComentario("");
      await load();
    } else {
      setError(result.error);
    }
    setPendingId(null);
  };

  const sorted = entregables ? [...entregables].sort((a, b) => b.version - a.version) : [];

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="mb-3 flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-primary">
        <PackageCheck className="size-3.5" aria-hidden="true" />
        {t("proceso_entregables_label")}
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-2 font-body text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("entregables_review_cargando")}
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-2 font-body text-sm text-ink-muted">{t("proceso_entregables_empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((ent) => {
            const stateClass = ENTREGABLE_REVIEW_CLASS[ent.estado.nombre] ?? ENTREGABLE_REVIEW_CLASS.enviado;
            const isPendiente = ent.estado.nombre === "enviado";
            const isBusy = pendingId === ent.id;
            return (
              <li key={ent.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      v{ent.version} &middot; {t(`entregable_tipo_${ent.tipo}`)}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold", stateClass)}>
                      {t(`entregable_state_${ent.estado.nombre}`)}
                    </span>
                    <span className="font-body text-[11px] text-ink-subtle">
                      {new Date(ent.fecha).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {ent.url && (
                      <a
                        href={ent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-body text-xs font-semibold text-primary hover:underline"
                      >
                        {t("entregables_review_ver")}
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    )}
                    {ent.url_github && (
                      <a
                        href={ent.url_github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-body text-xs font-semibold text-ink-muted hover:text-ink"
                      >
                        <GitBranch className="size-3" aria-hidden="true" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Comentario que la empresa dejó al pedir cambios */}
                {ent.estado.nombre === "cambios_solicitados" && ent.comentario_revision && (
                  <p className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 font-body text-xs leading-relaxed text-ink">
                    {ent.comentario_revision}
                  </p>
                )}

                {/* Acciones de revisión: solo sobre entregables recién enviados */}
                {isPendiente && (
                  cambiosFor === ent.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows={2}
                        placeholder={t("entregables_review_cambios_placeholder")}
                        className="block w-full resize-y rounded-xl border border-border bg-canvas p-3 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/20"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!comentario.trim() || isBusy}
                          onClick={() => { void handleReview(ent.id, "solicitar_cambios"); }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-warning px-4 py-2 font-body text-xs font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-warning/85 disabled:opacity-50"
                        >
                          {isBusy && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                          {t("entregables_review_enviar_cambios")}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => { setCambiosFor(null); setComentario(""); }}
                          className="rounded-full border border-border bg-surface px-4 py-2 font-body text-xs font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] hover:border-ink-muted disabled:opacity-50"
                        >
                          {t("entregables_review_cancelar")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => { void handleReview(ent.id, "aprobar"); }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-accent/85 disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
                        {t("entregables_review_aprobar")}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => { setCambiosFor(ent.id); setComentario(""); }}
                        className="rounded-full border border-warning/40 bg-surface px-4 py-2 font-body text-xs font-semibold text-warning transition-colors duration-[var(--duration-fast)] hover:bg-warning/10 disabled:opacity-50"
                      >
                        {t("entregables_review_solicitar_cambios")}
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 font-body text-xs text-magenta">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Empresa proceso view ──────────────────────────────────────────────────────

function EmpresaProcesoView({
  offers, project, locale, t,
}: {
  offers: ProjectOffer[];
  project: ApiProject | null;
  locale: string;
  t: T;
}) {
  const [students, setStudents] = useState<EmpresaStudent[]>(
    () => buildEmpresaStudents(offers, project, locale),
  );
  const [saved, setSaved] = useState<string | null>(null);
  const [ratingForms, setRatingForms] = useState<Record<string, { stars: number; comment: string; submitting: boolean }>>({});

  // Reset students when offers prop changes (real data loaded from API)
  useEffect(() => {
    setStudents(buildEmpresaStudents(offers, project, locale));
    setSaved(null);
  }, [offers, project, locale]);

  // Seguimiento: correo del junior adjudicado (on-demand, reusa GET /ofertas/:id). Best-effort:
  // si no hay adjudicado o falla, no se muestra el botón de "escribir por correo".
  const adjudicadaOfferId = offers.find((o) => o.estado?.nombre === "adjudicada")?.id;
  const [correoAdjudicado, setCorreoAdjudicado] = useState<string | null>(null);
  useEffect(() => {
    setCorreoAdjudicado(null);
    if (!adjudicadaOfferId) return;
    let active = true;
    void (async () => {
      const r = await getOfertaContactoAction(adjudicadaOfferId);
      if (active && r.ok && r.data.junior?.correo) setCorreoAdjudicado(r.data.junior.correo);
    })();
    return () => { active = false; };
  }, [adjudicadaOfferId]);

  const toggleStudent = (id: number) =>
    setStudents((prev) =>
      prev.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s),
    );

  const toggleProposal = (sid: number, v: number) =>
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, expanded: !p.expanded } : p),
        },
      ),
    );

  const setStatus = (sid: number, v: number, status: EmpresaStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, status } : p),
        },
      ),
    );
  };

  const setComment = (sid: number, v: number, comment: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== sid ? s : {
          ...s,
          proposals: s.proposals.map((p) => p.v === v ? { ...p, comment } : p),
        },
      ),
    );
  };

  // Toggle "en revisión" — se guarda inmediatamente al activar
  const handleMarkRevision = async (sid: number, v: number, offerId: string) => {
    const result = await reviewOfferAction(offerId, { accion: "en_revision" });
    if (result.ok) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id !== sid ? s : {
            ...s,
            proposals: s.proposals.map((p) =>
              p.v === v ? { ...p, dbStatus: "revision" as EmpresaStatus, status: "revision" as EmpresaStatus } : p,
            ),
          },
        ),
      );
    }
  };

  // "Enviar" — confirma la accion terminal (cambios / adjudicar / rechazar)
  const handleEnviar = async (sid: number, v: number) => {
    const student = students.find((s) => s.id === sid);
    if (!student) return;
    const proposal = student.proposals.find((p) => p.v === v);
    if (!proposal) return;

    const accionMap: Partial<Record<EmpresaStatus, "solicitar_cambios" | "aceptar" | "rechazar">> = {
      cambios:        "solicitar_cambios",
      adjudicada:     "aceptar",
      noseleccionada: "rechazar",
    };
    const accion = accionMap[proposal.status];
    if (!accion) return;

    const result = await reviewOfferAction(proposal.offerId, {
      accion,
      ...(proposal.comment.trim() ? { comentario: proposal.comment.trim() } : {}),
    });

    if (result.ok) {
      setSaved(`${sid}-${v}`);
      const adjudicando = accion === "aceptar";
      const targetOfferId = proposal.offerId;

      // Re-fetch from DB so dbStatus and comment reflect what was actually persisted
      if (project?.id) {
        const fresh = await getProjectOffersAction(project.id);
        if (fresh.ok) {
          const rebuilt = buildEmpresaStudents(fresh.data.ofertas, project, locale);
          if (adjudicando) {
            // Mantener expandido el student y la propuesta adjudicada
            // para que el formulario de calificacion aparezca de inmediato.
            setStudents(rebuilt.map((st) => {
              const adjProp = st.proposals.find((p) => p.offerId === targetOfferId);
              if (!adjProp) return st;
              return {
                ...st,
                expanded: true,
                proposals: st.proposals.map((p) =>
                  p.offerId === targetOfferId ? { ...p, expanded: true } : p,
                ),
              };
            }));
          } else {
            setStudents(rebuilt);
          }
        } else {
          // Fallback: update dbStatus locally if re-fetch fails
          const savedStatus = proposal.status;
          setStudents((prev) =>
            prev.map((s) =>
              s.id !== sid ? s : {
                ...s,
                proposals: s.proposals.map((p) =>
                  p.v !== v ? p : { ...p, dbStatus: savedStatus },
                ),
              },
            ),
          );
        }
      }
    }
  };

  const handleCalificar = async (offerId: string) => {
    const form = ratingForms[offerId];
    if (!form || form.stars === 0) return;
    setRatingForms((prev) => ({ ...prev, [offerId]: { ...prev[offerId]!, submitting: true } }));
    const result = await calificarOfertaAction(offerId, {
      calificacion: form.stars,
      ...(form.comment.trim() ? { comentario: form.comment.trim() } : {}),
    });
    if (result.ok) {
      // Re-fetch from DB so calificacion state reflects what was actually persisted
      if (project?.id) {
        const fresh = await getProjectOffersAction(project.id);
        if (fresh.ok) {
          setStudents(buildEmpresaStudents(fresh.data.ofertas, project, locale));
        } else {
          // Fallback: update calificacion locally if re-fetch fails
          setStudents((prev) =>
            prev.map((s) =>
              s.offerId !== offerId ? s : {
                ...s,
                calificacion: form.stars,
                comentario_calificacion: form.comment.trim() || null,
              },
            ),
          );
        }
      } else {
        setStudents((prev) =>
          prev.map((s) =>
            s.offerId !== offerId ? s : {
              ...s,
              calificacion: form.stars,
              comentario_calificacion: form.comment.trim() || null,
            },
          ),
        );
      }
    } else {
      setRatingForms((prev) => ({ ...prev, [offerId]: { ...prev[offerId]!, submitting: false } }));
    }
  };

  const overall = (props: EmpresaProposal[]): EmpresaStatus => {
    if (props.some((p) => p.status === "adjudicada")) return "adjudicada";
    return props[props.length - 1]?.status ?? "enviada";
  };

  const selBtn = (active: boolean, badge: string) =>
    active
      ? cn("font-bold", badge.replace("border-", "border-2 border-"))
      : "border border-border bg-surface text-ink-muted hover:border-ink-muted";

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border px-6 py-5 md:px-8">
        <p className="mb-0.5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          {t("empresa_proposals_label")}
        </p>
        <p className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
          {offers.length} {offers.length === 1 ? t("proceso_version_singular") : t("proceso_version_plural")} {offers.length === 1 ? "recibida" : "recibidas"}
        </p>
      </div>

      {/* Seguimiento del junior adjudicado: abre el cliente de correo de la empresa (mailto). */}
      {correoAdjudicado && (
        <div className="border-b border-border bg-accent/5 px-6 py-3 md:px-8">
          <a
            href={`mailto:${correoAdjudicado}?subject=${encodeURIComponent(t("seguimiento_correo_subject", { titulo: project?.titulo ?? "" }))}`}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary/80"
          >
            <Mail className="size-4" aria-hidden="true" />
            {t("seguimiento_correo_btn")}
          </a>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <FolderOpen className="size-12 text-ink-muted/30" aria-hidden="true" />
          <p className="font-body text-base text-ink-muted">{t("empresa_proposals_empty")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {students.map((s) => {
            const ov    = overall(s.proposals);
            const m     = EMPRESA_BADGE[ov];
            const isAdj = ov === "adjudicada";
            const isRej = ov === "noseleccionada";
            const nVer  = s.proposals.length;

            return (
              <div
                key={s.id}
                className={cn(
                  "transition-opacity duration-[var(--duration-fast)]",
                  s.expanded ? "bg-surface-sunken" : "bg-surface",
                  isRej && !s.expanded && "opacity-50",
                )}
              >
                {/* Student row */}
                <div
                  onClick={() => toggleStudent(s.id)}
                  className="flex cursor-pointer items-center gap-4 px-6 py-5 md:px-8"
                >
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-[15px] font-bold",
                      isAdj ? "bg-accent/20 text-accent" : isRej ? "bg-border text-ink-muted" : "bg-accent/15 text-accent",
                    )}
                    aria-hidden="true"
                  >
                    {s.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={cn("font-heading text-base font-bold", isRej ? "text-ink-muted" : "text-ink-strong")}>
                        {s.name}
                      </span>
                      <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-body text-xs font-semibold text-ink-muted">
                        {nVer} {nVer === 1 ? t("proceso_version_singular") : t("proceso_version_plural")}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-sm text-ink-muted">{s.date}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full border px-[18px] py-2 font-body text-sm font-bold whitespace-nowrap", m)}>
                    {ov === "enviada"        ? t("proceso_badge_enviada")
                      : ov === "revision"   ? t("proceso_badge_revision")
                      : ov === "cambios"    ? t("proceso_badge_cambios")
                      : ov === "adjudicada" ? t("proceso_badge_adjudicada")
                      : t("proceso_badge_nosel")}
                  </span>
                  {isAdj && (
                    <CheckCircle2 className="size-[22px] shrink-0 text-accent" aria-hidden="true" />
                  )}
                  <span className="w-[18px] shrink-0 text-center font-body text-sm text-ink-muted">
                    {s.expanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded: proposal sub-stepper */}
                {s.expanded && (
                  <div className="px-6 pb-8 pt-1 md:pl-20 md:pr-8">
                    <p className="mb-5 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t("proceso_propuestas_estudiante")}
                    </p>

                    {s.proposals.map((p, pi) => {
                      const c    = empresaCircle(p.status);
                      const pm   = EMPRESA_BADGE[p.status];
                      const skey = `${s.id}-${p.v}`;
                      const isSavedHere = saved === skey;

                      const btnCls = (status: EmpresaStatus) =>
                        cn(
                          "rounded-[10px] px-4 py-2.5 font-body text-sm font-bold transition-colors duration-[var(--duration-fast)]",
                          selBtn(p.status === status, EMPRESA_BADGE[status]),
                        );

                      return (
                        <div key={p.v} className="flex gap-[18px]">
                          {/* Circle + line */}
                          <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0, paddingTop: 1 }}>
                            <div className={cn("flex size-[30px] shrink-0 items-center justify-center rounded-full", c.bg)}>
                              {c.icon}
                            </div>
                            {pi < s.proposals.length - 1 && (
                              <div className="mt-2 w-0.5 flex-1 rounded-sm bg-border" style={{ minHeight: 20 }} />
                            )}
                          </div>

                          {/* Version content */}
                          <div className="min-w-0 flex-1 pb-7">
                            {/* Version header */}
                            <div
                              onClick={() => toggleProposal(s.id, p.v)}
                              className="flex cursor-pointer items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-heading text-base font-bold text-ink-strong">
                                  {t("proceso_propuesta_n", { n: p.v })}
                                </span>
                                <span className="font-body text-sm text-ink-muted">· {p.date}</span>
                                <span className="font-body text-xs text-ink-muted">{p.expanded ? "▲" : "▼"}</span>
                              </div>
                              <span className={cn("inline-flex items-center rounded-full border px-[15px] py-1.5 font-body text-sm font-bold whitespace-nowrap", pm)}>
                                {p.status === "enviada"        ? t("proceso_badge_enviada")
                                  : p.status === "revision"   ? t("proceso_badge_revision")
                                  : p.status === "cambios"    ? t("proceso_badge_cambios")
                                  : p.status === "adjudicada" ? t("proceso_badge_adjudicada")
                                  : t("proceso_badge_nosel")}
                              </span>
                            </div>

                            {/* Version detail */}
                            {p.expanded && (
                              <div className="mt-4 max-w-[840px]">
                                {/* Toggle "En revisión" — solo visible mientras la empresa puede actuar */}
                                {(p.dbStatus === "enviada" || p.dbStatus === "revision") && (
                                  <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Eye className="size-4 shrink-0 text-warning" aria-hidden="true" />
                                      <span className="font-body text-sm font-semibold text-ink">
                                        {t("proceso_switch_revision_label")}
                                      </span>
                                    </div>
                                    {p.dbStatus === "enviada" ? (
                                      <button
                                        type="button"
                                        onClick={() => { void handleMarkRevision(s.id, p.v, p.offerId); }}
                                        className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 font-body text-xs font-bold text-warning transition-colors duration-[var(--duration-fast)] hover:bg-warning hover:text-white"
                                      >
                                        {t("proceso_switch_revision_activar")}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 font-body text-xs font-bold text-white">
                                        <Check className="size-3" aria-hidden="true" />
                                        {t("proceso_switch_revision_activo")}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <label className="mb-2 block font-body text-sm font-bold text-ink">
                                  {t("description_label")}
                                </label>
                                <div className="rounded-xl border border-border bg-canvas p-4 font-body text-sm leading-relaxed text-ink">
                                  {p.desc}
                                </div>

                                {p.link && (
                                  <>
                                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                      {t("proceso_ver_prototipo")}
                                    </label>
                                    <PrototipoPreview url={p.link} title={p.previewName || undefined} />
                                  </>
                                )}

                                {p.repo && (
                                  <>
                                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                      {t("proceso_recursos_repo")}
                                    </label>
                                    <a
                                      href={p.repo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                                    >
                                      <GitBranch className="size-4 shrink-0" aria-hidden="true" />
                                      <span className="truncate">{p.repo}</span>
                                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                                    </a>
                                  </>
                                )}

                                {(p.dbStatus === "enviada" || p.dbStatus === "revision") ? (
                                  <>
                                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                      {t("proceso_comentarios_revision_label")}
                                    </label>
                                    <textarea
                                      placeholder={t("proceso_comentarios_empresa_placeholder")}
                                      value={p.comment}
                                      onChange={(e) => setComment(s.id, p.v, e.target.value)}
                                      rows={4}
                                      className="block w-full resize-y rounded-xl border border-border bg-surface p-3.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                                    />

                                    <label className="mb-2 mt-5 block font-body text-sm font-bold text-ink">
                                      {t("proceso_estado_version")}
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                      <button onClick={() => setStatus(s.id, p.v, "cambios")}        className={btnCls("cambios")}>        {t("proceso_accion_cambios")}</button>
                                      <button onClick={() => setStatus(s.id, p.v, "adjudicada")}     className={btnCls("adjudicada")}>     {t("proceso_accion_adjudicar")}</button>
                                      <button onClick={() => setStatus(s.id, p.v, "noseleccionada")} className={btnCls("noseleccionada")}> {t("proceso_accion_rechazar")}</button>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={() => { void handleEnviar(s.id, p.v); }}
                                        disabled={p.status === "enviada" || p.status === "revision"}
                                        className="rounded-xl bg-secondary px-6 py-2.5 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        {t("proceso_btn_enviar")}
                                      </button>
                                      {isSavedHere && (
                                        <div className="inline-flex items-center gap-2 font-body text-sm font-semibold text-accent">
                                          <Check className="size-4" aria-hidden="true" />
                                          {t("proceso_cambios_guardados")}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Read-only card: saved status + comment */}
                                    <div className="mt-5 rounded-xl border border-border bg-surface p-4">
                                      <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                                        {t("proceso_observacion_enviada")}
                                      </p>
                                      <span className={cn("inline-flex items-center rounded-full border px-4 py-1.5 font-body text-sm font-bold", pm)}>
                                        {p.status === "revision"      ? t("proceso_badge_revision")
                                          : p.status === "cambios"    ? t("proceso_badge_cambios")
                                          : p.status === "adjudicada" ? t("proceso_badge_adjudicada")
                                          : t("proceso_badge_nosel")}
                                      </span>
                                      {p.comment && (
                                        <p className="mt-3 font-body text-sm leading-relaxed text-ink">{p.comment}</p>
                                      )}
                                    </div>

                                    {p.dbStatus === "adjudicada" && (
                                      s.calificacion != null ? (
                                        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
                                          <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-accent">
                                            {t("proceso_calificacion_enviada")}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <Star
                                                key={i}
                                                className={cn("size-5", i < s.calificacion! ? "fill-highlight text-highlight" : "text-border")}
                                                aria-hidden="true"
                                              />
                                            ))}
                                          </div>
                                          {s.comentario_calificacion && (
                                            <p className="mt-2 font-body text-sm leading-relaxed text-ink">{s.comentario_calificacion}</p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                                          <p className="mb-3 font-body text-sm font-bold text-ink">
                                            {t("proceso_calificar_titulo")}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => {
                                              const rf = ratingForms[s.offerId] ?? { stars: 0, comment: "", submitting: false };
                                              return (
                                                <button
                                                  key={i}
                                                  type="button"
                                                  onClick={() => setRatingForms((prev) => ({
                                                    ...prev,
                                                    [s.offerId]: { ...(prev[s.offerId] ?? { stars: 0, comment: "", submitting: false }), stars: i + 1 },
                                                  }))}
                                                  aria-label={`${i + 1} ${i === 0 ? "estrella" : "estrellas"}`}
                                                >
                                                  <Star
                                                    className={cn("size-7 transition-colors duration-[var(--duration-fast)]", i < rf.stars ? "fill-highlight text-highlight" : "text-border hover:text-highlight/60")}
                                                    aria-hidden="true"
                                                  />
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <textarea
                                            placeholder={t("proceso_calificar_placeholder")}
                                            value={ratingForms[s.offerId]?.comment ?? ""}
                                            onChange={(e) => setRatingForms((prev) => ({
                                              ...prev,
                                              [s.offerId]: { ...(prev[s.offerId] ?? { stars: 0, comment: "", submitting: false }), comment: e.target.value },
                                            }))}
                                            rows={3}
                                            className="mt-3 block w-full resize-y rounded-xl border border-border bg-canvas p-3.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                                          />
                                          <button
                                            type="button"
                                            disabled={(ratingForms[s.offerId]?.stars ?? 0) === 0 || (ratingForms[s.offerId]?.submitting ?? false)}
                                            onClick={() => { void handleCalificar(s.offerId); }}
                                            className="mt-3 rounded-xl bg-secondary px-5 py-2.5 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-secondary/80 disabled:opacity-50"
                                          >
                                            {(ratingForms[s.offerId]?.submitting ?? false) ? t("proceso_calificar_enviando") : t("proceso_calificar_btn")}
                                          </button>
                                        </div>
                                      )
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Revisión de entregables: solo para el junior adjudicado */}
                    {isAdj && project && (
                      <EntregablesReview projectId={project.id} locale={locale} t={t} />
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

// ── AI assistant helpers ──────────────────────────────────────────────────────

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 font-body text-sm",
          isUser ? "bg-primary text-white" : "bg-surface-sunken text-ink-strong",
        )}
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

function AiAssistant({ onApply }: { onApply: (proposal: ProjectProposal) => void }) {
  const locale = useLocale();
  const t = useTranslations("gestion_page");
  const [idea, setIdea] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<string[]>([]);
  const [disenos, setDisenos] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streamingText, isStreaming]);

  const hasConversation = messages.length > 0;
  const canGenerate = messages.some((m) => m.role === "assistant") && !isStreaming && !isGenerating;

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
      toAiLocale(locale),
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
      setError(t("ai_error_generico"));
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
      setDisenos(result.data.estilos_diseno);
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
    setDisenos([]);
    setApplied(false);
    setIdea("");
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <span className="font-body text-sm font-bold text-primary">{t("ai_titulo")}</span>
        <span className="rounded-full bg-highlight px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-secondary">
          Beta
        </span>
      </div>

      {!hasConversation ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="ai-idea" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("ai_idea_label")}
            </label>
            <textarea
              id="ai-idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t("ai_idea_placeholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={() => void startConversation()}
            disabled={!idea.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-body text-sm font-bold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {t("ai_completar_btn")}
          </button>
          <p className="font-body text-xs text-ink-muted">
            {t("ai_intro_hint")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div ref={scrollRef} className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface p-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {isStreaming && (
              streamingText
                ? <ChatBubble role="assistant" content={streamingText} />
                : <TypingIndicator label={t("ai_escribiendo")} />
            )}
          </div>

          {applied && (
            <div className="space-y-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <p className="font-body text-xs font-semibold text-ink-strong">{t("ai_formulario_completado")}</p>
              </div>
              {disenos.length > 0 && (
                <div className="space-y-1 pl-6">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">{t("ai_referencias_diseno")}</p>
                  <ul className="list-disc space-y-0.5 pl-4 font-body text-xs text-ink-muted">
                    {disenos.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              {pendingQuestions.length > 0 && (
                <div className="space-y-1 pl-6">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">{t("ai_preguntas_pendientes")}</p>
                  <ul className="list-disc space-y-0.5 pl-4 font-body text-xs text-ink-muted">
                    {pendingQuestions.map((q, i) => <li key={i}>{q}</li>)}
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
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void sendReply(); } }}
                disabled={isStreaming}
                placeholder={t("ai_reply_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
              <Button type="button" size="icon" onClick={() => void sendReply()} disabled={!reply.trim() || isStreaming} aria-label={t("aria_enviar")}>
                <Send className="size-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!applied && (
              <Button type="button" variant="accent" onClick={() => void generate()} disabled={!canGenerate} className="gap-2">
                {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {isGenerating ? t("ai_generando") : t("ai_generar_propuesta")}
              </Button>
            )}
            <button type="button" onClick={restart} className="font-body text-xs font-semibold text-ink-muted underline-offset-2 hover:text-primary hover:underline">
              {applied ? t("ai_reiniciar") : t("ai_continuar_manual")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project form (create / edit) — renders inline in the main content area ────

interface FormData {
  titulo: string;
  descripcion: string;
  condiciones: string;
  id_area_negocio: string;
  plazo_dias: string;
  compensacion: string;
  usa_ia: boolean;
  skills: string[];
  tecnologias_extra: string[];
  publicar: boolean;
}

function ProjectFormContent({
  mode,
  project,
  catalogs,
  saving,
  onSave,
  onClose,
}: {
  mode: "create" | "edit";
  project: ApiProject | null;
  catalogs: { areas: CatalogArea[]; skills: CatalogSkill[] };
  saving: boolean;
  onSave: (data: CreateProjectInput | UpdateProjectInput) => Promise<string | null>;
  onClose: () => void;
}) {
  const t = useTranslations("gestion_page");
  const [form, setForm] = useState<FormData>(() => ({
    titulo: project?.titulo ?? "",
    descripcion: project?.descripcion ?? "",
    condiciones: project?.condiciones ?? "",
    id_area_negocio: project?.area?.id ?? "",
    plazo_dias: project ? String(project.plazo_dias) : "10",
    compensacion: project?.compensacion != null ? String(project.compensacion) : "",
    usa_ia: project?.usa_ia ?? false,
    skills: project?.skills.flatMap((s) => s.skill ? [s.skill.id] : []) ?? [],
    tecnologias_extra: project?.tecnologias_extra ?? [],
    publicar: true,
  }));
  const [otrosInput, setOtrosInput] = useState("");
  const [isSuggestingStack, setIsSuggestingStack] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const techSkills = catalogs.skills.filter((s) => s.tipo === "tecnologia");

  function applyProposal(proposal: ProjectProposal) {
    const skillIds = proposal.habilidades
      .map((h) => h.id)
      .filter((id) => techSkills.some((s) => s.id === id));
    setForm((prev) => ({
      ...prev,
      titulo: proposal.nombre || prev.titulo,
      descripcion: proposal.descripcion || proposal.objetivo || prev.descripcion,
      id_area_negocio:
        proposal.id_area_negocio && catalogs.areas.some((a) => a.id === proposal.id_area_negocio)
          ? proposal.id_area_negocio
          : prev.id_area_negocio,
      plazo_dias: proposal.plazo_dias ? String(proposal.plazo_dias) : prev.plazo_dias,
      usa_ia: proposal.usa_ia,
      skills: skillIds,
    }));

    // Auto-sugerir el precio con los datos de la propuesta (solo si el campo sigue vacío). Ya
    // tenemos descripción + plazo + stack, que es justo lo que la sugerencia necesita para anclar.
    const descripcion = (proposal.descripcion || proposal.objetivo || "").trim();
    if (!form.compensacion.trim() && descripcion.length >= 10) {
      const input: SuggestCompensacionInput = { descripcion };
      if (proposal.nombre?.trim()) input.titulo = proposal.nombre.trim();
      if (proposal.id_area_negocio && catalogs.areas.some((a) => a.id === proposal.id_area_negocio)) {
        input.id_area_negocio = proposal.id_area_negocio;
      }
      if (proposal.plazo_dias) input.plazo_dias = proposal.plazo_dias;
      if (skillIds.length > 0) input.skills = skillIds;
      void runPriceSuggestion(input);
    }
  }

  async function handleSuggestStack() {
    if (isSuggestingStack) return;
    const descripcion = form.descripcion.trim();
    if (descripcion.length < 10) return;
    setIsSuggestingStack(true);
    const input: SuggestStackInput = { descripcion };
    if (form.titulo.trim()) input.titulo = form.titulo.trim();
    if (form.id_area_negocio) input.id_area_negocio = form.id_area_negocio;
    const result = await suggestStackAction(input);
    setIsSuggestingStack(false);
    if (result.ok) {
      const suggested = result.data.habilidades
        .map((h) => h.id)
        .filter((id) => techSkills.some((s) => s.id === id));
      setForm((prev) => ({ ...prev, skills: suggested }));
    }
  }

  // Núcleo de la sugerencia de precio (recibe el input explícito para poder llamarse tanto desde
  // el botón como al aplicar una propuesta de IA, sin depender del estado `form` aún sin actualizar).
  async function runPriceSuggestion(input: SuggestCompensacionInput) {
    if (isSuggestingPrice) return;
    setIsSuggestingPrice(true);
    const result = await suggestCompensacionAction(input);
    setIsSuggestingPrice(false);
    if (result.ok) {
      setForm((prev) => ({ ...prev, compensacion: String(result.data.compensacion) }));
      setPriceSuggestion(result.data.justificacion || null);
    } else {
      setPriceSuggestion(result.error);
    }
  }

  async function handleSuggestPrice() {
    const descripcion = form.descripcion.trim();
    if (descripcion.length < 10) return;
    const input: SuggestCompensacionInput = { descripcion };
    if (form.titulo.trim()) input.titulo = form.titulo.trim();
    if (form.id_area_negocio) input.id_area_negocio = form.id_area_negocio;
    const plazo = parseInt(form.plazo_dias, 10);
    if (plazo) input.plazo_dias = plazo;
    if (form.skills.length > 0) input.skills = form.skills;
    await runPriceSuggestion(input);
  }

  function addOtraTecnologia() {
    const val = otrosInput.trim();
    if (!val || form.tecnologias_extra.includes(val)) return;
    setForm((prev) => ({ ...prev, tecnologias_extra: [...prev.tecnologias_extra, val] }));
    setOtrosInput("");
  }

  function removeOtraTecnologia(tech: string) {
    setForm((prev) => ({ ...prev, tecnologias_extra: prev.tecnologias_extra.filter((t) => t !== tech) }));
  }

  function toggleSkill(id: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }));
  }

  async function handleSubmit() {
    if (!form.titulo.trim()) { setError(t("form_error_titulo")); return; }
    if (!form.descripcion.trim()) { setError(t("form_error_descripcion")); return; }
    if (!form.id_area_negocio) { setError(t("form_error_area")); return; }
    const plazo = parseInt(form.plazo_dias, 10);
    if (!plazo || plazo < 5 || plazo > 15) { setError(t("form_error_plazo")); return; }
    const compRaw = form.compensacion.trim();
    let compensacion: number | undefined;
    if (compRaw) {
      const parsed = Number(compRaw);
      if (!Number.isInteger(parsed) || parsed < COMPENSACION_MIN || parsed > COMPENSACION_MAX) {
        setError(
          t("form_error_compensacion_rango", {
            min: COMPENSACION_MIN.toLocaleString("en-US"),
            max: COMPENSACION_MAX.toLocaleString("en-US"),
          }),
        );
        return;
      }
      compensacion = parsed;
    }
    if (mode === "create" && form.publicar && compensacion == null) {
      setError(t("form_error_compensacion_publicar"));
      return;
    }
    setError(null);
    const saveError = mode === "create"
      ? await onSave({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          id_area_negocio: form.id_area_negocio,
          plazo_dias: plazo,
          usa_ia: form.usa_ia,
          skills: form.skills,
          ...(form.tecnologias_extra.length > 0 ? { tecnologias_extra: form.tecnologias_extra } : {}),
          ...(form.condiciones.trim() ? { condiciones: form.condiciones.trim() } : {}),
          ...(compensacion != null ? { compensacion } : {}),
          publicar: form.publicar,
        } satisfies CreateProjectInput)
      : await onSave({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          id_area_negocio: form.id_area_negocio,
          plazo_dias: plazo,
          usa_ia: form.usa_ia,
          skills: form.skills,
          ...(form.tecnologias_extra.length > 0 ? { tecnologias_extra: form.tecnologias_extra } : {}),
          ...(form.condiciones.trim() ? { condiciones: form.condiciones.trim() } : {}),
          ...(compensacion != null ? { compensacion } : {}),
        } satisfies UpdateProjectInput);
    if (saveError) setError(saveError);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-canvas/95 px-6 py-4 backdrop-blur-sm">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          {mode === "create" ? t("form_mode_crear") : t("form_mode_editar")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("aria_cancelar")}
          className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink-strong"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 px-6 py-6">

          {/* AI assistant — only on create */}
          {mode === "create" && <AiAssistant onApply={applyProposal} />}

          {mode === "create" && (
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {t("form_o_manual")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-magenta/10 px-4 py-3 font-body text-sm font-semibold text-magenta">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="pf-titulo" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("form_label_titulo")}
            </label>
            <input
              id="pf-titulo"
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              placeholder={t("form_titulo_placeholder")}
              className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="pf-desc" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("description_label")}
            </label>
            <textarea
              id="pf-desc"
              rows={5}
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder={t("form_descripcion_placeholder")}
              className="min-h-28 w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="pf-condiciones" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("conditions_faq_label")}
            </label>
            <textarea
              id="pf-condiciones"
              rows={4}
              value={form.condiciones}
              onChange={(e) => setForm((p) => ({ ...p, condiciones: e.target.value }))}
              placeholder={t("form_condiciones_placeholder")}
              className="min-h-24 w-full resize-none rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="font-body text-[11px] text-ink-muted">
              {t("form_condiciones_hint")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="pf-area" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("form_label_area")}
              </label>
              <select
                id="pf-area"
                value={form.id_area_negocio}
                onChange={(e) => setForm((p) => ({ ...p, id_area_negocio: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("form_area_placeholder")}</option>
                {catalogs.areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="pf-plazo" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("form_label_plazo")}
              </label>
              <input
                id="pf-plazo"
                type="number"
                min={5}
                max={15}
                value={form.plazo_dias}
                onChange={(e) => setForm((p) => ({ ...p, plazo_dias: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Compensación */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pf-compensacion" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("form_label_compensacion")}
              </label>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => void handleSuggestPrice()}
                disabled={isSuggestingPrice || form.descripcion.trim().length < 10}
                className="gap-1.5"
              >
                {isSuggestingPrice ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                {isSuggestingPrice ? t("form_sugiriendo") : t("form_sugerir_precio")}
              </Button>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-body text-sm font-semibold text-ink-muted" aria-hidden="true">$</span>
              <input
                id="pf-compensacion"
                type="number"
                min={COMPENSACION_MIN}
                max={COMPENSACION_MAX}
                step={10}
                inputMode="numeric"
                value={form.compensacion}
                onChange={(e) => {
                  // Solo dígitos y hasta 5 (el máximo es $10.000): evita montos absurdos y decimales.
                  const value = e.target.value;
                  if (value === "" || /^\d{1,5}$/.test(value)) {
                    setForm((p) => ({ ...p, compensacion: value }));
                  }
                }}
                placeholder={t("form_compensacion_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken py-2 pl-7 pr-14 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-body text-xs font-semibold text-ink-muted" aria-hidden="true">USD</span>
            </div>
            <p className="font-body text-[11px] text-ink-muted">
              {t("form_compensacion_hint", {
                min: COMPENSACION_MIN.toLocaleString("en-US"),
                max: COMPENSACION_MAX.toLocaleString("en-US"),
              })}
            </p>
            {form.compensacion.trim() !== "" &&
              (Number(form.compensacion) < COMPENSACION_MIN || Number(form.compensacion) > COMPENSACION_MAX) && (
                <p className="font-body text-[11px] font-semibold text-magenta">
                  {t("form_compensacion_rango", {
                    min: COMPENSACION_MIN.toLocaleString("en-US"),
                    max: COMPENSACION_MAX.toLocaleString("en-US"),
                  })}
                </p>
              )}
            {priceSuggestion && (
              <p className="font-body text-[11px] text-accent">{priceSuggestion}</p>
            )}
          </div>

          {/* Skills */}
          {techSkills.length > 0 && (
            <fieldset className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("skills_label")}
                </legend>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => void handleSuggestStack()}
                  disabled={isSuggestingStack || form.descripcion.trim().length < 10}
                  className="gap-1.5"
                >
                  {isSuggestingStack ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                  {isSuggestingStack ? t("form_sugiriendo") : t("form_sugerir_stack")}
                </Button>
              </div>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-surface-sunken p-3">
                {techSkills.map((skill) => (
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

              {/* Tecnologías extra */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otrosInput}
                    onChange={(e) => setOtrosInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOtraTecnologia(); } }}
                    placeholder={t("form_otros_placeholder")}
                    className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addOtraTecnologia} disabled={!otrosInput.trim()}>
                    {t("form_agregar")}
                  </Button>
                </div>
                {form.tecnologias_extra.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tecnologias_extra.map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                        {tech}
                        <button type="button" onClick={() => removeOtraTecnologia(tech)} aria-label={t("form_quitar_tech", { tech })} className="rounded-full p-0.5 hover:bg-primary/20">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>
          )}

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.usa_ia}
                onChange={(e) => setForm((c) => ({ ...c, usa_ia: e.target.checked }))}
                className="accent-primary"
              />
              {t("form_usa_ia")}
            </label>
            {mode === "create" && (
              <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.publicar}
                  onChange={(e) => setForm((c) => ({ ...c, publicar: e.target.checked }))}
                  className="accent-primary"
                />
                {t("form_publicar")}
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-canvas px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
        >
          {t("aria_cancelar")}
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving}
          className="flex-1 rounded-full bg-primary px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {saving ? t("form_guardando") : mode === "create" ? t("form_crear") : t("form_guardar_cambios")}
        </button>
      </div>
    </div>
  );
}

// ── Unsaved changes dialog ────────────────────────────────────────────────────

function UnsavedChangesDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("gestion_page");
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-strong/50 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("unsaved_title")}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-canvas p-6 shadow-[var(--shadow-elevated)]"
      >
        <h3 className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          {t("unsaved_title")}<span className="text-warning" aria-hidden="true">.</span>
        </h3>
        <p className="mt-1 font-body text-sm text-ink-muted">
          {t("unsaved_body")}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            {t("unsaved_keep_editing")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-warning px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/80"
          >
            {t("unsaved_leave")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Project action dialog (resume / pause / cancel) ──────────────────────────

type ProjectActionKindProp = "resume" | "pause" | "cancel-step1" | "cancel-step2" | "finalize" | "reopen";

function ProjectActionDialog({
  kind,
  pending,
  error,
  t,
  onResume,
  onPause,
  onCancel,
  onFinalize,
  onReopen,
  onAdvanceToFinal,
  onClose,
}: {
  kind: ProjectActionKindProp;
  pending: boolean;
  error: string | null;
  t: T;
  onResume: () => void;
  onPause: () => void;
  onCancel: () => void;
  onFinalize: () => void;
  onReopen: () => void;
  onAdvanceToFinal: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink-strong/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={!pending ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-canvas p-6 shadow-[var(--shadow-elevated)]"
      >
        {kind === "resume" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-accent/10">
              <Zap className="size-5 text-accent" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("resume_dialog_title")}<span className="text-accent" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("resume_dialog_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("resume_dialog_back")}
              </button>
              <button
                type="button"
                onClick={onResume}
                disabled={pending}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("resume_dialog_confirm")}
              </button>
            </div>
          </>
        )}

        {kind === "pause" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-warning/10">
              <PauseCircle className="size-5 text-warning" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("pause_dialog_title")}<span className="text-warning" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("pause_dialog_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("pause_dialog_back")}
              </button>
              <button
                type="button"
                onClick={onPause}
                disabled={pending}
                className="flex-1 rounded-full bg-warning px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("pause_dialog_confirm")}
              </button>
            </div>
          </>
        )}

        {kind === "cancel-step1" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-warning/10">
              <Ban className="size-5 text-warning" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("cancel_step1_title")}<span className="text-warning" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("cancel_step1_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onPause}
                disabled={pending}
                className="w-full rounded-full bg-warning px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("cancel_step1_pause")}
              </button>
              <button
                type="button"
                onClick={onAdvanceToFinal}
                disabled={pending}
                className="w-full rounded-full border border-magenta/40 px-4 py-2.5 font-body text-sm font-semibold text-magenta transition-colors hover:bg-magenta/5 disabled:opacity-50"
              >
                {t("cancel_step1_cancel")}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="w-full rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("cancel_step1_back")}
              </button>
            </div>
          </>
        )}

        {kind === "cancel-step2" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-magenta/10">
              <Ban className="size-5 text-magenta" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("cancel_step2_title")}<span className="text-magenta" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("cancel_step2_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("cancel_step2_back")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="flex-1 rounded-full bg-magenta px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("cancel_step2_confirm")}
              </button>
            </div>
          </>
        )}

        {kind === "finalize" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="size-5 text-accent" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("finalize_dialog_title")}<span className="text-accent" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("finalize_dialog_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("finalize_dialog_back")}
              </button>
              <button
                type="button"
                onClick={onFinalize}
                disabled={pending}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("finalize_dialog_confirm")}
              </button>
            </div>
          </>
        )}

        {kind === "reopen" && (
          <>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-warning/10">
              <RotateCcw className="size-5 text-warning" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
              {t("reopen_dialog_title")}<span className="text-warning" aria-hidden="true">.</span>
            </h3>
            <p className="mt-1 font-body text-sm text-ink-muted">{t("reopen_dialog_body")}</p>
            {error && (
              <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                {t("reopen_dialog_back")}
              </button>
              <button
                type="button"
                onClick={onReopen}
                disabled={pending}
                className="flex-1 rounded-full bg-warning px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-warning/80 disabled:opacity-60"
              >
                {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("reopen_dialog_confirm")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  projectTitle,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  projectTitle: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("gestion_page");
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink-strong/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("delete_aria")}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-canvas p-6 shadow-[var(--shadow-elevated)]"
      >
        <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-magenta/10">
          <Trash2 className="size-5 text-magenta" aria-hidden="true" />
        </div>
        <h3 className="mt-3 font-heading text-lg font-extrabold tracking-tight text-ink-strong">
          {t("delete_title")}<span className="text-magenta" aria-hidden="true">.</span>
        </h3>
        <p className="mt-1 font-body text-sm text-ink-muted">
          {t.rich("delete_body", {
            titulo: projectTitle,
            strong: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
          })}
        </p>
        {error && (
          <p className="mt-3 rounded-xl bg-magenta/10 px-3 py-2 font-body text-sm font-semibold text-magenta">
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 font-body text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            {t("delete_cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-full bg-magenta px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-magenta/80 disabled:opacity-60"
          >
            {deleting ? t("delete_deleting") : t("delete_confirm")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── MensajesView ──────────────────────────────────────────────────────────────

function MensajesView({
  myOffers,
  myConversaciones,
  projects,
  selectedProjectId,
  selectedProject,
  projectLoading,
  t,
  userId,
  onConversationActivity,
  onSelectProject,
}: {
  myOffers: MyOffer[];
  myConversaciones: ConversacionItem[];
  projects: ApiProject[];
  selectedProjectId: string | null;
  selectedProject: ApiProject | null;
  projectLoading: boolean;
  t: T;
  userId: string | null;
  onConversationActivity: () => Promise<void>;
  onSelectProject: (id: string) => void;
}) {
  // Tracks which panel item the user clicked: "asistente" = bot, "directo" = human chat
  const [activeMode, setActiveMode] = useState<"asistente" | "directo">("asistente");
  const [activePanelId, setActivePanelId] = useState<string | null>(selectedProjectId);

  const directChatIds = new Set(myConversaciones.map((c) => c.proyecto.id));
  const empresaPorId = new Map(projects.map((p) => [p.id, p.empresa?.nombre_comercial ?? ""]));

  const asistentesItems = myOffers
    .filter((o) => o.proyecto)
    .filter((o, idx, arr) => arr.findIndex((x) => x.proyecto?.id === o.proyecto?.id) === idx);

  const titleForId = (id: string) =>
    myOffers.find((o) => o.proyecto?.id === id)?.proyecto?.titulo
    ?? myConversaciones.find((c) => c.proyecto.id === id)?.proyecto.titulo
    ?? "";

  function selectAsistente(id: string) {
    setActiveMode("asistente");
    setActivePanelId(id);
    onSelectProject(id);
  }

  function selectDirecto(id: string) {
    setActiveMode("directo");
    setActivePanelId(id);
    onSelectProject(id);
  }

  // Al iniciarse la conversación (escalada del bot): refresca "Directos" para que aparezca
  // listada Y abre de una el chat humano con la empresa. Antes se quedaba en el bot y la
  // conversación solo era accesible desde la notificación.
  async function handleEscalated() {
    await onConversationActivity();
    if (activePanelId) selectDirecto(activePanelId);
  }

  const activeProject = selectedProject ?? null;
  const activeTitle = activePanelId
    ? (activeProject?.titulo ?? titleForId(activePanelId))
    : "";
  const activeEmpresa = activeProject?.empresa?.nombre_comercial ?? null;

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 8rem)" }}>

      {/* Left panel — chat list */}
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-border">

        {/* Asistentes */}
        <div className="px-4 pt-5 pb-3">
          <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t("mensajes_asistentes")}
          </p>
          {asistentesItems.length === 0 && (
            <p className="font-body text-[12px] text-ink-muted/60">{t("mensajes_sin_asistentes")}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {asistentesItems.map((offer) => {
              if (!offer.proyecto) return null;
              const id = offer.proyecto.id;
              const isSelected = id === activePanelId && activeMode === "asistente";
              const empresa = empresaPorId.get(id) ?? offer.proyecto.titulo;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectAsistente(id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      isSelected ? "bg-secondary/10 ring-1 ring-secondary/20" : "hover:bg-canvas",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15">
                      <Sparkles className="size-4 text-secondary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-[13px] font-semibold text-ink-strong">
                        {t("mensajes_asistente_nombre", { empresa })}
                      </p>
                      <p className="truncate font-body text-[11px] text-ink-muted">
                        {offer.proyecto.titulo}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Directos */}
        <div className="border-t border-border px-4 pt-4 pb-3">
          <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t("mensajes_directos")}
          </p>
          {myConversaciones.length === 0 && (
            <p className="font-body text-[12px] text-ink-muted/60">{t("mensajes_sin_directos")}</p>
          )}
          {myConversaciones.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {myConversaciones.map((conv) => {
                const isSelected = conv.proyecto.id === activePanelId && activeMode === "directo";
                const empresa = empresaPorId.get(conv.proyecto.id) ?? conv.proyecto.titulo;
                const initial = empresa[0]?.toUpperCase() ?? "?";
                return (
                  <li key={conv.proyecto.id}>
                    <button
                      type="button"
                      onClick={() => selectDirecto(conv.proyecto.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                        isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-canvas",
                      )}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-body text-[14px] font-bold text-primary">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate font-body text-[13px] font-semibold text-ink-strong">
                            {empresa}
                          </p>
                          {conv.no_leidos > 0 && (
                            <span className="shrink-0 rounded-full bg-magenta px-[6px] py-[2px] font-body text-[10px] font-bold text-white">
                              {conv.no_leidos}
                            </span>
                          )}
                        </div>
                        <p className="truncate font-body text-[11px] text-ink-muted">
                          {conv.ultimo_mensaje || conv.proyecto.titulo}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="min-w-0 flex-1 bg-canvas">
        {activePanelId ? (
          projectLoading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : activeMode === "asistente" ? (
            // Bot — persists history in localStorage; "Hablar con empresa" triggers escalation
            <div className="mx-auto w-full max-w-3xl px-4 pt-6">
              <ProjectChatbot
                key={activePanelId}
                embedded
                projectId={activePanelId}
                projectTitulo={activeTitle}
                onEscalated={handleEscalated}
              />
            </div>
          ) : (
            // Human chat — bot fallback hidden so only real messages show
            <JuniorContactoPanel
              key={activePanelId}
              projectId={activePanelId}
              projectTitulo={activeTitle}
              empresaNombre={activeEmpresa}
              t={t}
              userId={userId}
              onConversationActivity={onConversationActivity}
              hideBotFallback
            />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary/10">
              <Mail className="size-6 text-secondary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
                {t("mensajes_vacio_titulo")}<span className="text-secondary" aria-hidden="true">.</span>
              </p>
              <p className="mt-1 max-w-xs font-body text-sm leading-relaxed text-ink-muted">
                {t("mensajes_vacio_desc")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bandeja de mensajes de la EMPRESA ─────────────────────────────────────────
// Espejo de la MensajesView del junior, adaptada al modelo de la empresa: una lista de
// conversaciones (un proyecto por fila, con badge de sin-leer) y, a la derecha, el ChatPanel
// del proyecto elegido (que a su vez tiene el selector de juniors). Antes la empresa solo
// llegaba al chat entrando a cada proyecto; esto le da una bandeja unificada e intuitiva.
function EmpresaMensajesView({
  myConversaciones,
  selectedProjectId,
  t,
  userId,
  onSelectProject,
}: {
  myConversaciones: ConversacionItem[];
  selectedProjectId: string | null;
  t: T;
  userId: string | null;
  onSelectProject: (id: string) => void;
}) {
  // Sin leer primero; dentro de cada grupo, la conversación más reciente arriba.
  const conversacionesOrdenadas = [...myConversaciones].sort((a, b) => {
    if ((b.no_leidos > 0 ? 1 : 0) !== (a.no_leidos > 0 ? 1 : 0)) {
      return (b.no_leidos > 0 ? 1 : 0) - (a.no_leidos > 0 ? 1 : 0);
    }
    return (b.ultimo_mensaje ?? "").localeCompare(a.ultimo_mensaje ?? "");
  });

  // Proyecto del chat activo, construido AL INSTANTE desde la conversación (ya está en memoria).
  // Así el ChatPanel nunca recibe el proyecto de otra conversación mientras carga (parpadeo).
  const activeConv = myConversaciones.find((c) => c.proyecto.id === selectedProjectId);
  const chatProject = activeConv
    ? { id: activeConv.proyecto.id, titulo: activeConv.proyecto.titulo, empresa: null }
    : null;

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Lista de conversaciones */}
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-border">
        <div className="px-4 pt-5 pb-3">
          <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t("mensajes_empresa_titulo")}
          </p>
          {conversacionesOrdenadas.length === 0 && (
            <p className="font-body text-[12px] text-ink-muted/60">{t("mensajes_empresa_vacio")}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {conversacionesOrdenadas.map((conv) => {
              const isSelected = conv.proyecto.id === selectedProjectId;
              const titulo = conv.proyecto.titulo;
              const initial = titulo[0]?.toUpperCase() ?? "?";
              return (
                <li key={conv.proyecto.id}>
                  <button
                    type="button"
                    onClick={() => onSelectProject(conv.proyecto.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                      isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-canvas",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-body text-[14px] font-bold text-primary">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "min-w-0 truncate font-body text-[13px] text-ink-strong",
                          conv.no_leidos > 0 ? "font-extrabold" : "font-semibold",
                        )}>
                          {titulo}
                        </p>
                        {conv.no_leidos > 0 && (
                          <span className="shrink-0 rounded-full bg-magenta px-[6px] py-[2px] font-body text-[10px] font-bold text-white">
                            {conv.no_leidos > 9 ? "9+" : conv.no_leidos}
                          </span>
                        )}
                      </div>
                      <p className="truncate font-body text-[11px] text-ink-muted">
                        {t("mensajes_empresa_n_juniors", { count: conv.n_participantes })}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Chat del proyecto elegido */}
      <div className="min-w-0 flex-1 bg-canvas">
        {selectedProjectId && chatProject ? (
          <ChatPanel key={selectedProjectId} isEmpresa project={chatProject} userId={userId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-lg font-extrabold tracking-tight text-ink-strong">
                {t("mensajes_empresa_vacio_titulo")}<span className="text-primary" aria-hidden="true">.</span>
              </p>
              <p className="mt-1 max-w-xs font-body text-sm leading-relaxed text-ink-muted">
                {t("mensajes_empresa_vacio_desc")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

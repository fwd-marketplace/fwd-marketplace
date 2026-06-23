"use client";

import React, { useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Mail,
  Globe,
  Plus,
  X,
  Briefcase,
  History,
  Edit2,
  Check,
  Sparkles,
  ArrowUpRight,
  Clock,
  ChevronRight,
  TrendingUp,
  Zap,
  Calendar,
  Building2,
  Layers,
  BarChart2,
  Code2,
  Palette,
  Camera,
  ChevronDown,
  Loader2,
  AlertCircle,
  MessageSquare,
  Monitor,
  Pencil,
  Trash2,
  GitBranch,
  Bookmark,
} from "lucide-react";
import {
  fullName,
  type Activity,
  type Application,
  type ApplicationStats,
  type MockCalificacion,
  type StudentProfile,
} from "@/app/[locale]/(public)/perfil-estudiante/types";

type WorkProject = {
  id: string;
  title: string;
  description: string;
  netlifyUrl: string;
  repoUrl?: string;
  tags: string[];
};

import type {
  ApiNotificacion,
  ApiProject,
  StudentAvailability,
  StudentProfileUpdate,
  StudentSpecialty,
} from "@/lib/api/types";
import { marcarNotificacionLeidaAction, marcarTodasLeidasAction } from "@/lib/actions/notificaciones";
import { updateStudentProfile, uploadStudentAvatar, deleteStudentAvatar, createPortafolioItemAction, updatePortafolioItemAction, deletePortafolioItemAction } from "@/lib/actions/perfil";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { replicarCalificacionAction, unsaveProjectAction } from "@/lib/actions/marketplace";
import { getInitials } from "@/lib/api/safe-json";

// ── Inline SVG icons ───────────────────────────────────────────────────────────

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);



// ── Helper pure functions ──────────────────────────────────────────────────────

const STAR_CHAR = "★";

function StarRow({ score, size = "sm" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 ${cls}`} aria-label={`${score} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(score) ? "text-highlight" : "text-border"} aria-hidden="true">
          {STAR_CHAR}
        </span>
      ))}
    </span>
  );
}


function CalificacionesSection({
  t,
  initialCalificaciones,
}: {
  t: ReturnType<typeof import("next-intl").useTranslations<"perfil_junior">>;
  initialCalificaciones: MockCalificacion[];
}) {
  const [calificaciones, setCalificaciones] = useState<MockCalificacion[]>(initialCalificaciones);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [isSaving, startSaving] = useTransition();

  function handleSendReply(id: string) {
    if (!replyDraft.trim()) return;
    const target = calificaciones.find((c) => c.id === id);
    startSaving(async () => {
      if (target?.ofertaId) {
        await replicarCalificacionAction(target.ofertaId, { replica: replyDraft.trim() });
      }
      setCalificaciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, reply: replyDraft.trim() } : c)),
      );
      setReplyingId(null);
      setReplyDraft("");
    });
  }

  return (
    <div className="space-y-5 pt-8 border-t border-border/60">
      <div>
        <h2 className="font-heading text-2xl font-bold text-ink-strong">
          {t("calificaciones.title")}<span className="text-primary">.</span>
        </h2>
        <p className="text-sm text-ink-muted mt-1">{t("calificaciones.subtitle")}</p>
      </div>

      {calificaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-body text-sm text-ink-muted">{t("calificaciones.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {calificaciones.map((cal) => (
            <div key={cal.id} className="rounded-2xl border border-border bg-surface shadow-soft flex flex-col overflow-hidden">
              {/* Header con empresa y proyecto */}
              <div className="px-5 pt-5 pb-4 border-b border-border/60">
                {cal.companyName && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted mb-1">{cal.companyName}</p>
                )}
                <p className="font-heading text-lg font-extrabold text-ink-strong leading-tight">{cal.projectName}</p>
                <p className="text-[11px] text-ink-muted mt-1">
                  {new Date(cal.date).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Rating — protagonista */}
              <div className="px-5 py-4 bg-highlight/5 border-b border-border/40 flex items-center gap-3">
                <StarRow score={cal.score} size="lg" />
                <span className="font-heading text-4xl font-extrabold text-highlight leading-none">{cal.score}</span>
                <span className="text-sm text-ink-muted">/5</span>
              </div>

              {/* Comentario — protagonista */}
              <div className="px-5 py-4 flex-grow">
                <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-2">{t("calificaciones.comment_label")}</p>
                <p className="font-body text-base leading-relaxed text-ink">{cal.comment}</p>
              </div>

              {/* Réplica */}
              <div className="px-5 pb-5">
                {cal.reply && (
                  <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1">{t("calificaciones.your_reply")}</p>
                    <p className="font-body text-sm text-ink">{cal.reply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category: Application["category"]) {
  switch (category) {
    case "ux": return <Layers className="w-5 h-5 text-primary" />;
    case "data": return <BarChart2 className="w-5 h-5 text-warning" />;
    case "dev": return <Code2 className="w-5 h-5 text-accent" />;
    case "design": return <Palette className="w-5 h-5 text-magenta" />;
  }
}

function getCategoryBg(category: Application["category"]): string {
  switch (category) {
    case "ux": return "bg-primary/10";
    case "data": return "bg-warning/10";
    case "dev": return "bg-accent/10";
    case "design": return "bg-magenta/10";
  }
}

function toHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}



// ── Tab and filter types ───────────────────────────────────────────────────────

type TabId = "perfil" | "trabajo" | "postulaciones" | "notificaciones" | "sugeridos";
type FilterStatus = "todas" | Application["status"];

const TAB_IDS: TabId[] = ["perfil", "trabajo", "postulaciones", "notificaciones", "sugeridos"];
const FILTER_VALUES: FilterStatus[] = ["todas", "enviada", "vista", "en_proceso", "aceptada", "rechazada"];

const SPECIALTY_VALUES: StudentSpecialty[] = ["frontend", "backend", "fullstack", "ia"];
const AVAILABILITY_VALUES: StudentAvailability[] = [
  "immediate",
  "two_weeks",
  "one_month",
  "unavailable",
];
const MODALITY_VALUES = ["remote", "hybrid", "onsite"] as const;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// ── Component ──────────────────────────────────────────────────────────────────

export interface PerfilUsuarioProps {
  initialProfile: StudentProfile;
  initialActivities: Activity[];
  initialApplications: Application[];
  initialCalificaciones: MockCalificacion[];
  initialNotificaciones?: ApiNotificacion[];
  initialPortafolio?: WorkProject[];
  initialSavedProjects?: ApiProject[];
  stats: ApplicationStats;
  /** Sugerencias de conocimientos no técnicos (catálogo) para autocompletar. */
  knowledgeSuggestions: string[];
  /** Nombres del catálogo de skills para autocompletar y distinguir catalog vs custom. */
  catalogSkills: string[];
}

/**
 * Servicio de captura (sin API key) para la miniatura de la tarjeta del portafolio.
 * mShots de WordPress.com renderiza la web destino y devuelve un PNG, evitando el
 * bloqueo de X-Frame-Options que tendría un <iframe> embebido. Si en el futuro se
 * necesita más fiabilidad/volumen, se cambia esta base por un servicio con key
 * (microlink, urlbox) sin tocar el resto del componente.
 */
const PREVIEW_SCREENSHOT_BASE = "https://s.wordpress.com/mshots/v1/";
const PREVIEW_SCREENSHOT_WIDTH = 1200;

  function ProjectCard({
  project,
  onPreview,
  onEdit,
  onDelete,
}: {
  project: WorkProject;
  onPreview: (project: WorkProject) => void;
  onEdit?: (project: WorkProject) => void;
  onDelete?: (id: string) => void;
}) {
  const t = useTranslations("perfil_junior.work");
  const [previewFailed, setPreviewFailed] = useState(false);
  const hostname = (() => {
    try { return new URL(project.netlifyUrl).hostname; } catch { return project.netlifyUrl || "—"; }
  })();
  const screenshotUrl = (() => {
    try {
      const parsed = new URL(project.netlifyUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      return `${PREVIEW_SCREENSHOT_BASE}${encodeURIComponent(project.netlifyUrl)}?w=${PREVIEW_SCREENSHOT_WIDTH}`;
    } catch {
      return null;
    }
  })();
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Browser chrome header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.97_0.005_245)] border-b border-border">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 rounded bg-white border border-border/50 px-2 py-0.5 text-[11px] text-ink-muted truncate">
          {hostname}
        </div>
      </div>
      {/* Preview area: el degradado + grilla + icono quedan de fondo de carga/fallback;
          la captura de la web se superpone cuando hay URL válida y no ha fallado. */}
      <div className="h-44 bg-gradient-to-tr from-primary/8 to-secondary/8 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px)" }} />
        <Monitor className="w-12 h-12 text-primary/30" />
        {screenshotUrl && !previewFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- captura externa (mShots), no optimizable por next/image
          <img
            src={screenshotUrl}
            alt={project.title}
            loading="lazy"
            onError={() => setPreviewFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        )}
      </div>
      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-extrabold text-ink-strong leading-tight">{project.title}</h3>
          {project.tags[0] && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
              {project.tags[0]}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-primary/80 line-clamp-2 leading-relaxed">{project.description}</p>
        )}
        {project.tags.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.tags.slice(1).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-accent/10 text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => onPreview(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:border-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" /> {t("preview_btn")}
          </button>
          {project.netlifyUrl && (
            <a
              href={project.netlifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-sunken hover:bg-border/30 text-ink rounded-lg transition-colors"
            >
              {t("open_btn")} <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-sunken hover:bg-border/30 text-ink rounded-lg transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            {typeof onEdit === "function" && (
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                aria-label={t("edit_btn")}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {typeof onDelete === "function" && (
              <button
                type="button"
                onClick={() => onDelete(project.id)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-magenta hover:bg-magenta/5 transition-colors cursor-pointer"
                aria-label={t("confirm_delete.confirm")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  project,
  onClose,
}: {
  project: WorkProject;
  onClose: () => void;
}) {
  const t = useTranslations("perfil_junior.work");
  const [iframeStatus, setIframeStatus] = useState<"loading" | "loaded" | "error">("loading");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-strong/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-surface rounded-2xl shadow-elevated flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-strong">{t("preview_modal_title")}: {project.title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={project.netlifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
            >
              {t("open_in_new_tab")} <ArrowUpRight className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-sunken rounded-lg transition-colors cursor-pointer"
              aria-label={t("close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative flex-grow bg-surface-sunken min-h-[50vh] md:h-[70vh]">
          {iframeStatus === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {iframeStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-magenta" />
              <p className="text-sm text-ink-muted max-w-md">{t("iframe_error")}</p>
              <a 
                href={project.netlifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-2 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                {t("open_in_new_tab")}
              </a>
            </div>
          )}
          <iframe 
            src={project.netlifyUrl} 
            className={`w-full h-full border-0 transition-opacity duration-300 ${iframeStatus === 'loading' ? 'opacity-0' : 'opacity-100'}`}
            title={`Preview of ${project.title}`}
            onLoad={() => setIframeStatus("loaded")}
            onError={() => setIframeStatus("error")}
          />
        </div>
      </div>
    </div>
  );
}

const NOTIF_PAGE_SIZE = 10;
const APP_PAGE_SIZE = 6;

export default function PerfilUsuario({
  initialProfile,
  initialActivities,
  initialApplications,
  initialCalificaciones,
  initialNotificaciones,
  initialPortafolio,
  initialSavedProjects = [],
  stats,
  knowledgeSuggestions,
  catalogSkills,
}: PerfilUsuarioProps) {
  const t = useTranslations("perfil_junior");
  const locale = useLocale();

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<TabId>("perfil");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todas");
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [applications] = useState<Application[]>(initialApplications);
  const [savedProjects, setSavedProjects] = useState<ApiProject[]>(initialSavedProjects);
  const [notificaciones, setNotificaciones] = useState<ApiNotificacion[]>(initialNotificaciones ?? []);
  const [notifPage, setNotifPage] = useState(1);
  const [appPage, setAppPage] = useState(1);
  const [showAllPortafolio, setShowAllPortafolio] = useState(false);
  const [previewProject, setPreviewProject] = useState<WorkProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<WorkProject | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<WorkProject | null>(null);
  const [portfolioError, setPortfolioError] = useState("");

  const [workProjectsState, setWorkProjectsState] = useState<WorkProject[]>(initialPortafolio ?? []);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  function parsePortafolioTags(tecnologias: string | null): string[] {
    try { return JSON.parse(tecnologias ?? "[]") as string[]; } catch { return []; }
  }

  function toWorkProject(data: { id: string; titulo: string; descripcion: string | null; url_demo: string | null; url_repositorio: string | null; tecnologias: string | null }): WorkProject {
    return {
      id: data.id,
      title: data.titulo,
      description: data.descripcion ?? "",
      netlifyUrl: data.url_demo ?? "",
      ...(data.url_repositorio ? { repoUrl: data.url_repositorio } : {}),
      tags: parsePortafolioTags(data.tecnologias),
    };
  }

  async function addProject(project: Omit<WorkProject, "id">) {
    setPortfolioError("");
    const result = await createPortafolioItemAction({
      titulo: project.title,
      descripcion: project.description,
      tecnologias: project.tags,
      url_demo: project.netlifyUrl,
      ...(project.repoUrl ? { url_repositorio: project.repoUrl } : {}),
    });
    if (!result.ok) { setPortfolioError(result.error); return; }
    setWorkProjectsState((prev) => [toWorkProject(result.data), ...prev]);
  }

  async function saveEditProject(id: string, updated: Omit<WorkProject, "id">) {
    setPortfolioError("");
    const result = await updatePortafolioItemAction(id, {
      titulo: updated.title,
      descripcion: updated.description,
      tecnologias: updated.tags,
      url_demo: updated.netlifyUrl,
      ...(updated.repoUrl ? { url_repositorio: updated.repoUrl } : { url_repositorio: "" }),
    });
    if (!result.ok) { setPortfolioError(result.error); return; }
    setWorkProjectsState((prev) => prev.map((p) => p.id === id ? toWorkProject(result.data) : p));
    setProjectToEdit(null);
  }

  function requestDeleteProject(id: string) {
    const p = workProjectsState.find((w) => w.id === id) ?? null;
    setProjectToDelete(p);
  }

  async function confirmDeleteProject() {
    if (!projectToDelete) return;
    setPortfolioError("");
    const result = await deletePortafolioItemAction(projectToDelete.id);
    if (!result.ok) { setPortfolioError(result.error); return; }
    setWorkProjectsState((prev) => prev.filter((p) => p.id !== projectToDelete.id));
    setProjectToDelete(null);
  }

  function cancelDelete() {
    setProjectToDelete(null);
  }
  

  const [isPending, startTransition] = useTransition();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editAvailability, setEditAvailability] = useState(profile.availability);
  const [editBio, setEditBio] = useState(profile.bio);
  const [personalError, setPersonalError] = useState("");

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile.firstName);
  const [editLastName1, setEditLastName1] = useState(profile.lastName1);
  const [editLastName2, setEditLastName2] = useState(profile.lastName2);
  const [editSpecialty, setEditSpecialty] = useState(profile.specialty);
  const [editProgram, setEditProgram] = useState(profile.program);
  const [editModalities, setEditModalities] = useState<string[]>(profile.badges);
  const [heroError, setHeroError] = useState("");

  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editGithub, setEditGithub] = useState(profile.links.github ?? "");
  const [editLinkedin, setEditLinkedin] = useState(profile.links.linkedin ?? "");
  const [editPortfolio, setEditPortfolio] = useState(profile.links.portfolio ?? "");
  const [linksError, setLinksError] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillError, setSkillError] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const [newConocimiento, setNewConocimiento] = useState("");
  const [isAddingConocimiento, setIsAddingConocimiento] = useState(false);
  const [conocimientoError, setConocimientoError] = useState("");
  const [showConocimientoSuggestions, setShowConocimientoSuggestions] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // ── Label maps — avoids dynamic key access ─────────────────────────────────

  const TAB_LABELS: Record<TabId, string> = {
    perfil: t("tabs.perfil"),
    trabajo: t("tabs.trabajo"),
    postulaciones: t("tabs.postulaciones"),
    notificaciones: t("tabs.notificaciones"),
    sugeridos: t("tabs.sugeridos"),
  };

  const FILTER_LABELS: Record<FilterStatus, string> = {
    todas: t("applications.filter.all"),
    enviada: t("applications.filter.sent"),
    vista: t("applications.filter.seen"),
    en_proceso: t("applications.filter.in_process"),
    aceptada: t("applications.filter.accepted"),
    rechazada: t("applications.filter.rejected"),
  };

  const SPECIALTY_LABELS: Record<StudentSpecialty, string> = {
    frontend: t("specialty_options.frontend"),
    backend: t("specialty_options.backend"),
    fullstack: t("specialty_options.fullstack"),
    ia: t("specialty_options.ia"),
  };

  const AVAILABILITY_LABELS: Record<StudentAvailability, string> = {
    immediate: t("availability_options.immediate"),
    two_weeks: t("availability_options.two_weeks"),
    one_month: t("availability_options.one_month"),
    unavailable: t("availability_options.unavailable"),
  };

  const MODALITY_LABELS: Record<(typeof MODALITY_VALUES)[number], string> = {
    remote: t("modality_options.remote"),
    hybrid: t("modality_options.hybrid"),
    onsite: t("modality_options.onsite"),
  };

  function specialtyLabel(code: string): string {
    return code in SPECIALTY_LABELS ? SPECIALTY_LABELS[code as StudentSpecialty] : code;
  }
  function availabilityLabel(code: string): string {
    return code in AVAILABILITY_LABELS ? AVAILABILITY_LABELS[code as StudentAvailability] : code;
  }
  function badgeLabel(code: string): string {
    return code in MODALITY_LABELS ? MODALITY_LABELS[code as keyof typeof MODALITY_LABELS] : code;
  }

  // ── Status styles ──────────────────────────────────────────────────────────

  function getStatusStyles(status: Application["status"]) {
    switch (status) {
      case "enviada":
        return { strip: "bg-primary", badge: "bg-primary/10 text-primary border-primary/20", label: t("status.enviada") };
      case "vista":
        return { strip: "bg-warning", badge: "bg-warning/10 text-warning border-warning/20", label: t("status.vista") };
      case "en_proceso":
        return { strip: "bg-secondary", badge: "bg-secondary/10 text-secondary border-secondary/20", label: t("status.en_proceso") };
      case "aceptada":
        return { strip: "bg-accent", badge: "bg-accent/15 text-accent border-accent/20", label: t("status.aceptada") };
      case "rechazada":
        return { strip: "bg-magenta", badge: "bg-magenta/10 text-magenta border-magenta/20", label: t("status.rechazada") };
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function addActivity(description: string) {
    setActivities((prev) => [
      { id: `act-${Date.now()}`, description, timestamp: t("activity.just_now"), tipo: "propia" },
      ...prev,
    ]);
  }

  function persistProfile(
    update: StudentProfileUpdate,
    optimistic: Partial<StudentProfile>,
    setError: (message: string) => void,
    onSuccess?: () => void,
  ) {
    setError("");
    startTransition(async () => {
      const result = await updateStudentProfile(update);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProfile((prev) => ({
        ...prev,
        ...optimistic,
        ...(result.data.skills !== undefined ? { skills: result.data.skills } : {}),
        ...(result.data.conocimientos !== undefined
          ? { conocimientos: result.data.conocimientos }
          : {}),
      }));
      onSuccess?.();
    });
  }

  function openEditHero() {
    setEditFirstName(profile.firstName);
    setEditLastName1(profile.lastName1);
    setEditLastName2(profile.lastName2);
    setEditSpecialty(profile.specialty);
    setEditProgram(profile.program);
    setEditModalities(profile.badges);
    setHeroError("");
    setIsEditingHero(true);
  }

  function toggleModality(code: string) {
    setEditModalities((prev) =>
      prev.includes(code) ? prev.filter((value) => value !== code) : [...prev, code],
    );
  }

  function saveHeroInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const firstName = editFirstName.trim();
    const lastName1 = editLastName1.trim();
    const lastName2 = editLastName2.trim();
    if (!firstName || !lastName1) {
      setHeroError(t("hero.name_required"));
      return;
    }
    const update: StudentProfileUpdate = {
      nombre: firstName,
      apellido1: lastName1,
      apellido2: lastName2,
      titulo_fwd: editProgram.trim(),
      modalidad: editModalities,
    };
    if (editSpecialty) update.especializacion = editSpecialty as StudentSpecialty;
    persistProfile(
      update,
      {
        firstName,
        lastName1,
        lastName2,
        specialty: editSpecialty,
        program: editProgram.trim(),
        badges: editModalities,
      },
      setHeroError,
      () => setIsEditingHero(false),
    );
  }

  function cancelEditHero() {
    setIsEditingHero(false);
    setHeroError("");
  }

  function openEditPersonal() {
    setEditAvailability(profile.availability);
    setEditBio(profile.bio);
    setPersonalError("");
    setIsEditingPersonal(true);
  }

  function savePersonalInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const update: StudentProfileUpdate = { bio: editBio };
    if (editAvailability) update.disponibilidad = editAvailability as StudentAvailability;
    persistProfile(
      update,
      { availability: editAvailability, bio: editBio },
      setPersonalError,
      () => {
        setIsEditingPersonal(false);
        addActivity(t("activity.updated_personal"));
      },
    );
  }

  function cancelEditPersonal() {
    setIsEditingPersonal(false);
    setPersonalError("");
  }

  function openEditLinks() {
    setEditGithub(profile.links.github ?? "");
    setEditLinkedin(profile.links.linkedin ?? "");
    setEditPortfolio(profile.links.portfolio ?? "");
    setLinksError("");
    setIsEditingLinks(true);
  }

  function saveLinks(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const github = editGithub.trim();
    const linkedin = editLinkedin.trim();
    const portfolio = editPortfolio.trim();
    const nextLinks: StudentProfile["links"] = {};
    if (github) nextLinks.github = github;
    if (linkedin) nextLinks.linkedin = linkedin;
    if (portfolio) nextLinks.portfolio = portfolio;
    persistProfile(
      { link_github: github, link_linkedin: linkedin, link_portfolio: portfolio },
      { links: nextLinks },
      setLinksError,
      () => setIsEditingLinks(false),
    );
  }

  function cancelEditLinks() {
    setIsEditingLinks(false);
    setLinksError("");
  }


  function doAddSkill(nameToAdd: string) {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    const next = [...profile.skills, trimmed];
    persistProfile({ skills: next }, {}, setSkillError, () => {
      addActivity(t("activity.added_skill", { skill: trimmed }));
      setNewSkill("");
      setShowSkillSuggestions(false);
      setIsAddingSkill(false);
    });
  }

  function addSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    doAddSkill(newSkill);
  }

  function removeSkill(skillToRemove: string) {
    const next = profile.skills.filter((skill) => skill !== skillToRemove);
    persistProfile({ skills: next }, {}, setSkillError, () => {
      addActivity(t("activity.removed_skill", { skill: skillToRemove }));
    });
  }

  function addConocimiento(e: React.FormEvent | React.FormEvent<HTMLFormElement>, valueOverride?: string) {
    e.preventDefault();
    const trimmed = (valueOverride ?? newConocimiento).trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    if (profile.conocimientos.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setNewConocimiento("");
      setIsAddingConocimiento(false);
      setShowConocimientoSuggestions(false);
      return;
    }
    const next = [...profile.conocimientos, trimmed];
    persistProfile({ conocimientos: next }, {}, setConocimientoError, () => {
      addActivity(t("activity.added_knowledge", { name: trimmed }));
      setNewConocimiento("");
      setIsAddingConocimiento(false);
      setShowConocimientoSuggestions(false);
    });
  }

  function removeConocimiento(toRemove: string) {
    const next = profile.conocimientos.filter((item) => item !== toRemove);
    persistProfile({ conocimientos: next }, {}, setConocimientoError, () => {
      addActivity(t("activity.removed_knowledge", { name: toRemove }));
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) {
      setAvatarError(t("avatar.invalid_type"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t("avatar.too_large"));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingAvatar(true);
    const result = await uploadStudentAvatar(formData);
    setIsUploadingAvatar(false);
    if (!result.ok) {
      setAvatarError(result.error);
      return;
    }
    setProfile((prev) => ({ ...prev, avatarUrl: result.data.url_avatar }));
  }

  async function handleDeleteAvatar() {
    setAvatarError("");
    setIsDeletingAvatar(true);
    const result = await deleteStudentAvatar();
    setIsDeletingAvatar(false);
    if (!result.ok) {
      setAvatarError(result.error);
      return;
    }
    setProfile((prev) => ({ ...prev, avatarUrl: "" }));
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const unreadCount = notificaciones.filter((n) => !n.leida).length;
  const filteredApplications = applications.filter(
    (app) => filterStatus === "todas" || app.status === filterStatus
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-body transition-colors duration-200">

        {/* HERO — full-width, topa con el navbar */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white pt-10 pb-16">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="90%" cy="10%" r="200" stroke="currentColor" strokeWidth="20" />
              <path d="M-100,200 L400,-100 M-50,300 L500,-150" stroke="currentColor" strokeWidth="8" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10 flex flex-col items-center gap-8 md:flex-row md:items-center">

            <div className="shrink-0 space-y-1">
              <div className="relative">
                <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-[var(--shadow-elevated)]">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL externa (Cloudinary)
                    <img
                      src={profile.avatarUrl}
                      alt={t("avatar.alt")}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-heading text-4xl font-extrabold text-white/90">
                      {getInitials(fullName(profile))}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                  {profile.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar || isUploadingAvatar}
                      aria-label={t("avatar.delete")}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-magenta text-white shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeletingAvatar ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <X className="size-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar || isDeletingAvatar}
                    aria-label={t("avatar.change")}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-highlight text-secondary shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Camera className="size-3.5" />
                    )}
                  </button>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              {avatarError && (
                <p className="flex max-w-28 items-center gap-1 pt-5 text-[10px] font-medium text-highlight">
                  <AlertCircle className="size-3 shrink-0" /> {avatarError}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              {isEditingHero ? (
                  <form
                    onSubmit={saveHeroInfo}
                    className="space-y-3 max-w-lg bg-black/30 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor="edit-first-name"
                          className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                        >
                          {t("hero.name_label")}
                        </label>
                        <input
                          id="edit-first-name"
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-last-name-1"
                          className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                        >
                          {t("hero.lastname1_label")}
                        </label>
                        <input
                          id="edit-last-name-1"
                          type="text"
                          value={editLastName1}
                          onChange={(e) => setEditLastName1(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-last-name-2"
                          className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                        >
                          {t("hero.lastname2_label")}
                        </label>
                        <input
                          id="edit-last-name-2"
                          type="text"
                          value={editLastName2}
                          onChange={(e) => setEditLastName2(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="edit-specialty"
                        className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                      >
                        {t("hero.role_label")}
                      </label>
                      <select
                        id="edit-specialty"
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20 [&>option]:text-ink-strong"
                      >
                        <option value="">{t("specialty_options.placeholder")}</option>
                        {SPECIALTY_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {SPECIALTY_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="edit-program"
                        className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                      >
                        {t("hero.program_label")}
                      </label>
                      <input
                        id="edit-program"
                        type="text"
                        value={editProgram}
                        onChange={(e) => setEditProgram(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                        {t("hero.modality_label")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {MODALITY_VALUES.map((value) => {
                          const isSelected = editModalities.includes(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => toggleModality(value)}
                              className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-highlight text-highlight-foreground border-highlight font-semibold"
                                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                              }`}
                            >
                              {MODALITY_LABELS[value]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {heroError && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-highlight">
                        <AlertCircle className="size-3.5 shrink-0" /> {heroError}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-accent hover:opacity-95 text-accent-foreground text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}{" "}
                        {t("hero.save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditHero}
                        disabled={isPending}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer disabled:opacity-60"
                      >
                        {t("hero.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      {profile.specialty && (
                        <span className="inline-flex items-center rounded-full bg-highlight px-3 py-1 font-body text-xs font-bold text-secondary">
                          {specialtyLabel(profile.specialty).toUpperCase()}
                        </span>
                      )}
                      <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                        {fullName(profile) || t("hero.unnamed")}
                        <span className="text-highlight" aria-hidden="true">.</span>
                      </h1>
                      {profile.program && (
                        <p className="font-body text-base leading-relaxed text-white/80">
                          {profile.program}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                      {profile.badges.map((badge) => (
                        <span
                          key={badge}
                          className="px-3 py-1 text-xs uppercase tracking-wider rounded-full bg-white/10 text-white border border-white/20"
                        >
                          {badgeLabel(badge)}
                        </span>
                      ))}
                    </div>

                    {typeof profile.reputacion === "number" && profile.reputacion > 0 && (
                      <div className="flex items-center justify-center gap-2 md:justify-start">
                        <StarRow score={profile.reputacion} size="md" />
                        <span className="font-heading text-lg font-extrabold text-highlight tracking-tight">
                          {profile.reputacion.toFixed(1)}
                        </span>
                        <span className="font-body text-xs text-white/70">
                          {t("hero.reputation_label")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {!isEditingHero && (
              <button
                type="button"
                onClick={openEditHero}
                className="flex items-center gap-1 self-start rounded-full border border-white/20 px-3 py-1.5 font-body text-xs font-semibold text-white/80 transition-colors duration-[var(--duration-fast)] hover:bg-white/10 cursor-pointer md:self-auto"
              >
                <Edit2 className="size-3" />
                {t("hero.edit_profile")}
              </button>
            )}
          </div>
        </section>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-10 py-8 flex-grow space-y-8">

        {/* TAB NAV */}
        <nav
          role="tablist"
          aria-label={t("tabs.nav_label")}
          className="flex border-b border-border gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-none"
        >
          {TAB_IDS.map((tabId) => {
            const isActive = activeTab === tabId;
            let badge: number | null = null;
            if (tabId === "notificaciones" && unreadCount > 0) badge = unreadCount;
            if (tabId === "sugeridos") badge = 0;

            return (
              <button
                key={tabId}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${isActive
                    ? "border-primary text-ink-strong font-semibold"
                    : "border-transparent text-ink-muted hover:text-ink"
                  }`}
              >
                {TAB_LABELS[tabId]}
                {badge !== null && badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${tabId === "notificaciones" ? "bg-primary text-white" : "bg-surface-sunken text-ink-muted border border-border"}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── TAB: PERFIL ─────────────────────────────────────────────────────── */}
        {activeTab === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

 

              {/* Personal info */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-ink-strong">{t("personal.title")}</h2>
                  {!isEditingPersonal && (
                    <button
                      type="button"
                      onClick={openEditPersonal}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> {t("personal.edit")}
                    </button>
                  )}
                </div>

                {isEditingPersonal ? (
                  <form onSubmit={savePersonalInfo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="edit-availability"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("personal.location_field")}
                        </label>
                        <select
                          id="edit-availability"
                          value={editAvailability}
                          onChange={(e) => setEditAvailability(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                        >
                          <option value="">{t("availability_options.placeholder")}</option>
                          {AVAILABILITY_VALUES.map((value) => (
                            <option key={value} value={value}>
                              {AVAILABILITY_LABELS[value]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="edit-email"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("personal.email_field")}
                        </label>
                        <input
                          id="edit-email"
                          type="email"
                          value={profile.email}
                          readOnly
                          aria-describedby="email-readonly-note"
                          className="w-full bg-surface-sunken/60 border border-border text-ink-muted rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                        />
                        <p id="email-readonly-note" className="mt-1 text-xs text-ink-muted">
                          {t("personal.email_readonly")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="edit-bio"
                        className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                      >
                        {t("personal.bio_field")}
                      </label>
                      <textarea
                        id="edit-bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary resize-none"
                      />
                    </div>
                    {personalError && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-magenta">
                        <AlertCircle className="size-3.5 shrink-0" /> {personalError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}{" "}
                        {t("personal.save_changes")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditPersonal}
                        disabled={isPending}
                        className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold py-2 px-4 rounded-xl cursor-pointer disabled:opacity-60"
                      >
                        {t("personal.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                        <Clock className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("personal.location_display")}</span>
                          <span className="font-semibold text-ink-strong">
                            {profile.availability ? availabilityLabel(profile.availability) : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                        <Mail className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("personal.email_display")}</span>
                          <span className="font-semibold text-ink-strong">{profile.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        {t("personal.bio_heading")}
                      </h3>
                      <p className="text-ink leading-relaxed text-sm md:text-base font-normal">
                        {profile.bio || t("personal.bio_empty")}
                      </p>
                    </div>
                  </>
                )}
              </section>

              {/* Stack */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-ink-strong">{t("stack.title")}</h2>
                  {!isAddingSkill && (
                    <button
                      type="button"
                      onClick={() => { setIsAddingSkill(true); setSkillError(""); }}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> {t("stack.add")}
                    </button>
                  )}
                </div>

                {isAddingSkill && (() => {
                  const skillSuggestions = catalogSkills.filter(
                    (cs) =>
                      newSkill.trim().length > 0 &&
                      cs.toLowerCase().includes(newSkill.trim().toLowerCase()) &&
                      !profile.skills.some((ps) => ps.toLowerCase() === cs.toLowerCase()),
                  );
                  const canAddCustom =
                    newSkill.trim().length > 0 &&
                    !skillSuggestions.some((s) => s.toLowerCase() === newSkill.trim().toLowerCase()) &&
                    !profile.skills.some((ps) => ps.toLowerCase() === newSkill.trim().toLowerCase());
                  return (
                    <form onSubmit={addSkill} className="relative max-w-md">
                      <label htmlFor="new-skill" className="sr-only">{t("stack.add")}</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            id="new-skill"
                            type="text"
                            placeholder={t("stack.placeholder")}
                            value={newSkill}
                            autoComplete="off"
                            onChange={(e) => { setNewSkill(e.target.value); setShowSkillSuggestions(true); }}
                            onFocus={() => setShowSkillSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 150)}
                            className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            autoFocus
                          />
                          {showSkillSuggestions && (skillSuggestions.length > 0 || canAddCustom) && (
                            <ul className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-surface shadow-[var(--shadow-elevated)] overflow-hidden">
                              {skillSuggestions.map((s) => (
                                <li key={s}>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); doAddSkill(s); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/5 transition-colors cursor-pointer"
                                  >
                                    <span className="size-2 rounded-full bg-primary shrink-0" />
                                    <span className="text-ink-strong">{s}</span>
                                    <span className="ml-auto text-[10px] font-semibold text-primary uppercase tracking-wide">{t("stack.catalog_label")}</span>
                                  </button>
                                </li>
                              ))}
                              {canAddCustom && (
                                <li>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); doAddSkill(newSkill); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-warning/5 transition-colors cursor-pointer border-t border-border"
                                  >
                                    <Plus className="size-3.5 text-warning shrink-0" />
                                    <span className="text-ink">{t("stack.add_custom")}: <strong>{newSkill.trim()}</strong></span>
                                  </button>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isPending || !newSkill.trim()}
                          className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold px-4 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("stack.add_btn")}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setNewSkill(""); setIsAddingSkill(false); setSkillError(""); setShowSkillSuggestions(false); }}
                          className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold px-3 rounded-xl cursor-pointer"
                          aria-label={t("stack.cancel_btn")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  );
                })()}

                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill) => {
                      return (
                        <div
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-primary/20 bg-primary/10 text-primary transition-all"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            disabled={isPending}
                            className="hover:text-magenta transition-colors focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed opacity-50 hover:opacity-100"
                            aria-label={t("stack.remove_skill", { skill })}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-muted italic">{t("stack.empty")}</p>
                  )}
                </div>

                {skillError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-magenta">
                    <AlertCircle className="size-3.5 shrink-0" /> {skillError}
                  </p>
                )}

              </section>

              {/* Conocimientos adicionales (no técnicos) */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink-strong">{t("knowledge.title")}</h2>
                    <p className="text-sm text-ink-muted mt-1">{t("knowledge.description")}</p>
                  </div>
                  {!isAddingConocimiento && (
                    <button
                      type="button"
                      onClick={() => setIsAddingConocimiento(true)}
                      className="text-accent hover:text-accent/80 transition-colors flex items-center gap-1 text-sm font-semibold cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" /> {t("knowledge.add")}
                    </button>
                  )}
                </div>

                {isAddingConocimiento && (() => {
                  const query = newConocimiento.trim().toLowerCase();
                  const suggestions = knowledgeSuggestions.filter(
                    (s) =>
                      (query.length === 0 || s.toLowerCase().includes(query)) &&
                      !profile.conocimientos.some((c) => c.toLowerCase() === s.toLowerCase()),
                  );
                  const canAddCustom =
                    query.length > 0 &&
                    !knowledgeSuggestions.some((s) => s.toLowerCase() === query) &&
                    !profile.conocimientos.some((c) => c.toLowerCase() === query);
                  const listOpen = showConocimientoSuggestions && (suggestions.length > 0 || canAddCustom);
                  return (
                    <form onSubmit={addConocimiento} className="flex gap-2 max-w-md">
                      <label htmlFor="new-knowledge" className="sr-only">{t("knowledge.add")}</label>
                      <div className="relative flex-grow">
                        <input
                          id="new-knowledge"
                          type="text"
                          placeholder={t("knowledge.placeholder")}
                          value={newConocimiento}
                          onChange={(e) => { setNewConocimiento(e.target.value); setShowConocimientoSuggestions(true); }}
                          onFocus={() => setShowConocimientoSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowConocimientoSuggestions(false), 150)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                          autoFocus
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(e) => { e.preventDefault(); setShowConocimientoSuggestions((v) => !v); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink transition-colors"
                          aria-label="Mostrar sugerencias"
                        >
                          <ChevronDown
                            className={`size-4 transition-transform duration-[var(--duration-fast)] ${listOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                        {listOpen && (
                          <ul className="absolute left-0 top-full z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border bg-surface shadow-elevated">
                            {suggestions.map((s) => (
                              <li key={s}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); addConocimiento({ preventDefault: () => {} } as React.FormEvent, s); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent/5 transition-colors cursor-pointer"
                                >
                                  <span className="size-2 rounded-full bg-accent shrink-0" />
                                  <span className="text-ink-strong">{s}</span>
                                </button>
                              </li>
                            ))}
                            {canAddCustom && (
                              <li>
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); addConocimiento({ preventDefault: () => {} } as React.FormEvent, newConocimiento); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/5 transition-colors cursor-pointer border-t border-border"
                                >
                                  <Plus className="size-3.5 text-primary shrink-0" />
                                  <span className="text-ink">{t("stack.add_custom")}: <strong>{newConocimiento.trim()}</strong></span>
                                </button>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-accent hover:opacity-95 text-white text-sm font-semibold px-4 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("knowledge.add_btn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewConocimiento(""); setIsAddingConocimiento(false); setConocimientoError(""); setShowConocimientoSuggestions(false); }}
                        className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold px-3 rounded-xl cursor-pointer"
                        aria-label={t("knowledge.cancel_btn")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  );
                })()}

                <div className="flex flex-wrap gap-2.5">
                  {profile.conocimientos.length > 0 ? (
                    profile.conocimientos.map((conocimiento) => (
                      <div
                        key={conocimiento}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent/10 border border-accent/30 text-ink hover:border-accent/60 transition-all"
                      >
                        <span>{conocimiento}</span>
                        <button
                          type="button"
                          onClick={() => removeConocimiento(conocimiento)}
                          disabled={isPending}
                          className="text-ink-subtle hover:text-magenta transition-colors focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={t("knowledge.remove", { name: conocimiento })}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted italic">{t("knowledge.empty")}</p>
                  )}
                </div>

                {conocimientoError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-magenta">
                    <AlertCircle className="size-3.5 shrink-0" /> {conocimientoError}
                  </p>
                )}
                <p className="text-xs text-ink-muted">{t("knowledge.hint")}</p>
              </section>

              {/* Links */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-ink-strong">{t("links.title")}</h2>
                  {!isEditingLinks && (
                    <button
                      type="button"
                      onClick={openEditLinks}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> {t("links.edit")}
                    </button>
                  )}
                </div>

                {isEditingLinks ? (
                  <form onSubmit={saveLinks} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="edit-github"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("links.github")}
                        </label>
                        <input
                          id="edit-github"
                          type="url"
                          inputMode="url"
                          placeholder={t("links.github_placeholder")}
                          value={editGithub}
                          onChange={(e) => setEditGithub(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-linkedin"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("links.linkedin")}
                        </label>
                        <input
                          id="edit-linkedin"
                          type="url"
                          inputMode="url"
                          placeholder={t("links.linkedin_placeholder")}
                          value={editLinkedin}
                          onChange={(e) => setEditLinkedin(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-portfolio"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("links.portfolio")}
                        </label>
                        <input
                          id="edit-portfolio"
                          type="url"
                          inputMode="url"
                          placeholder={t("links.portfolio_placeholder")}
                          value={editPortfolio}
                          onChange={(e) => setEditPortfolio(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                        />
                      </div>
                    </div>
                    {linksError && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-magenta">
                        <AlertCircle className="size-3.5 shrink-0" /> {linksError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}{" "}
                        {t("links.save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditLinks}
                        disabled={isPending}
                        className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold py-2 px-4 rounded-xl cursor-pointer disabled:opacity-60"
                      >
                        {t("links.cancel")}
                      </button>
                    </div>
                  </form>
                ) : profile.links.github || profile.links.linkedin || profile.links.portfolio ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profile.links.github && (
                      <a
                        href={toHref(profile.links.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <GithubIcon className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t("links.github")}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(profile.links.github).replace("github.com/", "")}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                    {profile.links.linkedin && (
                      <a
                        href={toHref(profile.links.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <LinkedinIcon className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t("links.linkedin")}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(profile.links.linkedin).replace("linkedin.com/in/", "")}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                    {profile.links.portfolio && (
                      <a
                        href={toHref(profile.links.portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t("links.portfolio")}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(profile.links.portfolio)}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">{t("links.empty")}</p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">

              {/* Activity */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold text-ink-strong">{t("activity.title")}</h2>
                </div>
                {activities.length === 0 ? (
                  <p className="text-xs text-ink-muted">{t("activity.empty")}</p>
                ) : (
                  <div className="relative border-l-2 border-border pl-3 ml-2 space-y-3">
                    {activities.slice(0, 3).map((act) => {
                      const dotColor =
                        act.tipo === "adjudicacion" ? "bg-accent" :
                        act.tipo === "nuevo_mensaje" ? "bg-primary" :
                        act.tipo === "entregable_subido" ? "bg-warning" :
                        act.tipo === "propia" ? "bg-secondary" :
                        "bg-magenta";
                      return (
                        <div key={act.id} className="relative">
                          <span className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-surface ${dotColor}`} />
                          <p className="text-xs text-ink leading-snug line-clamp-2">{act.description}</p>
                          <span className="block text-[11px] text-ink-muted mt-0.5">{act.timestamp}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("notificaciones")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t("activity.ver_notificaciones")}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </section>

              {/* Applications sidebar widget */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-ink-strong">{t("applications_sidebar.title")}</h2>
                </div>
                {applications.length === 0 ? (
                  <p className="text-sm text-ink-muted italic">{t("applications_sidebar.empty")}</p>
                ) : (
                  <div className="space-y-3">
                    {[...applications]
                      .sort((a, b) => new Date(b.relativeTime).getTime() - new Date(a.relativeTime).getTime())
                      .slice(0, 3)
                      .map((app) => {
                        const sidebarStyles = getStatusStyles(app.status);
                        const fecha = new Date(app.relativeTime);
                        const fechaLabel = isNaN(fecha.getTime())
                          ? ""
                          : fecha.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
                        return (
                          <div
                            key={app.id}
                            className="flex justify-between items-start gap-3 p-3 rounded-xl border border-border bg-surface-sunken"
                          >
                            <div className="space-y-1 min-w-0">
                              <h3 className="text-sm font-bold text-ink-strong leading-tight truncate">{app.projectName}</h3>
                              {fechaLabel && <span className="block text-xs text-ink-muted">{fechaLabel}</span>}
                            </div>
                            <span
                              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border shrink-0 ${sidebarStyles.badge}`}
                            >
                              {sidebarStyles.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("postulaciones")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t("applications_sidebar.manage")}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </section>
            </div>
          </div>
        )}

        {/* ── TAB: TRABAJO ─────────────────────────────────────────────────────── */}
        {activeTab === "trabajo" && (
          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("work.title")}<span className="text-primary">.</span>
                </h1>
                <p className="text-sm text-ink-muted leading-relaxed">{t("work.description")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> {t("work.add_project")}
              </button>
            </div>

            <div className="pt-2">
              {portfolioError && (
                <div className="rounded-xl bg-magenta/10 border border-magenta/20 px-4 py-3 text-sm text-magenta">{portfolioError}</div>
              )}
              {(() => {
                const PORTFOLIO_PAGE = 6;
                const visible = showAllPortafolio ? workProjectsState : workProjectsState.slice(0, PORTFOLIO_PAGE);
                const hasMore = workProjectsState.length > PORTFOLIO_PAGE;
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {visible.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onPreview={setPreviewProject}
                          onEdit={setProjectToEdit}
                          onDelete={requestDeleteProject}
                        />
                      ))}
                      {/* Add card — siempre visible */}
                      <button
                        type="button"
                        onClick={() => setShowAddProjectModal(true)}
                        className="rounded-2xl border-2 border-dashed border-border bg-surface hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 p-8 min-h-[220px] cursor-pointer group"
                      >
                        <span className="w-10 h-10 rounded-full border-2 border-border group-hover:border-primary/40 flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5 text-ink-muted group-hover:text-primary transition-colors" />
                        </span>
                        <span className="text-sm font-semibold text-ink-muted group-hover:text-primary transition-colors">{t("work.add_title")}</span>
                        <span className="text-xs text-ink-muted">{t("work.add_formats")}</span>
                      </button>
                    </div>
                    {hasMore && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAllPortafolio((v) => !v)}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-semibold text-ink-muted hover:border-primary/40 hover:text-primary transition-all"
                        >
                          {showAllPortafolio ? t("work.show_less") : t("work.show_more", { count: workProjectsState.length - PORTFOLIO_PAGE })}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showAllPortafolio ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {showAddProjectModal && (
              <AddProjectModal
                onClose={() => setShowAddProjectModal(false)}
                onCreate={async (data) => { await addProject(data); setShowAddProjectModal(false); }}
              />
            )}
            {projectToEdit && (
              <EditProjectModal
                project={projectToEdit}
                onClose={() => setProjectToEdit(null)}
                onSave={saveEditProject}
              />
            )}
            {projectToDelete && (
              <ConfirmDeleteModal project={projectToDelete} onConfirm={confirmDeleteProject} onCancel={cancelDelete} />
            )}

            {/* RF-53 — Calificaciones recibidas con réplica */}
            <CalificacionesSection t={t} initialCalificaciones={initialCalificaciones} />
          </section>
        )}

        {previewProject && (
          <PreviewModal
            project={previewProject}
            onClose={() => setPreviewProject(null)}
          />
        )}

        {/* ── TAB: POSTULACIONES ───────────────────────────────────────────────── */}
        {activeTab === "postulaciones" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                {t("applications.title")}<span className="text-primary">.</span>
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">{t("applications.description")}</p>
            </div>

            {/* Filter pills */}
            <div
              role="group"
              aria-label={t("applications.filter_label")}
              className="flex items-center flex-wrap gap-2 text-xs font-semibold py-2"
            >
              <span className="text-ink-muted mr-1">{t("applications.filter_label")}</span>
              {FILTER_VALUES.map((value) => {
                const isActive = filterStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setFilterStatus(value); setAppPage(1); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${isActive
                        ? "bg-primary border-primary text-white"
                        : "bg-surface-sunken border-border text-ink-muted hover:bg-border/30 hover:text-ink"
                      }`}
                  >
                    {FILTER_LABELS[value]}
                  </button>
                );
              })}
            </div>

            {/* Ir a gestión */}
            <div className="flex justify-end">
              <Link
                href={`/${locale}/gestion`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <ArrowUpRight className="w-4 h-4" />
                {t("applications.go_to_marketplace")}
              </Link>
            </div>

            {/* Stats compactas */}
            {(() => {
              const enProceso = applications.filter((a) => ["enviada", "vista", "en_proceso"].includes(a.status)).length;
              const adjudicados = applications.filter((a) => a.status === "aceptada").length;
              return (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 min-w-[160px]">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-2xl font-extrabold font-heading tracking-tight text-primary leading-none">{enProceso}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mt-0.5">{t("applications.stats.in_progress")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 min-w-[160px]">
                    <Zap className="w-5 h-5 text-accent shrink-0" />
                    <div>
                      <div className="text-2xl font-extrabold font-heading tracking-tight text-accent leading-none">{adjudicados}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-accent/70 mt-0.5">{t("applications.stats.awarded")}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Application list paginada */}
            {(() => {
              const appTotalPages = Math.max(1, Math.ceil(filteredApplications.length / APP_PAGE_SIZE));
              const paginated = filteredApplications.slice((appPage - 1) * APP_PAGE_SIZE, appPage * APP_PAGE_SIZE);
              return (
                <div className="space-y-4">
                  {paginated.map((app) => {
                    const styles = getStatusStyles(app.status);
                    const fecha = new Date(app.relativeTime);
                    const fechaLabel = isNaN(fecha.getTime()) ? app.relativeTime : fecha.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <Link
                        key={app.id}
                        href={app.projectId ? `/${locale}/gestion?proyecto=${app.projectId}` : "#"}
                        className="relative rounded-2xl bg-surface border border-border p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden pl-7 block"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${styles.strip}`} />
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(app.category)}`}>
                            {getCategoryIcon(app.category)}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-ink-strong leading-tight">{app.projectName}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                              {app.companyName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                                  {app.companyName}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                {fechaLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${styles.badge}`}>
                            {styles.label}
                          </span>
                          <ChevronRight className="w-5 h-5 text-ink-subtle hover:text-primary transition-colors shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                  {paginated.length === 0 && (
                    <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                      <p className="text-sm text-ink-muted italic">{t("applications.empty")}</p>
                    </div>
                  )}
                  {appTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={appPage === 1}
                        onClick={() => setAppPage((p) => p - 1)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("notifications.prev")}
                      </button>
                      <span className="font-body text-xs text-ink-muted">{appPage} / {appTotalPages}</span>
                      <button
                        type="button"
                        disabled={appPage === appTotalPages}
                        onClick={() => setAppPage((p) => p + 1)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("notifications.next")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Proyectos guardados ─────────────────────────────────────── */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-highlight" />
                <h2 className="text-base font-bold text-ink-strong">{t("applications.saved_title")}</h2>
                <span className="ml-auto text-xs font-semibold text-ink-muted">{savedProjects.length}</span>
              </div>
              {savedProjects.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center">
                  <p className="text-sm text-ink-muted italic">{t("applications.saved_empty")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedProjects.map((project) => {
                    const isExpired = project.fecha_cierre ? new Date(project.fecha_cierre) < new Date() : false;
                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-soft"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-sm font-bold text-ink-strong leading-tight truncate">{project.titulo}</p>
                          {project.empresa && (
                            <p className="text-xs text-ink-muted truncate">{project.empresa.nombre_comercial}</p>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-magenta">
                              <Clock className="w-3 h-3" />
                              {t("applications.saved_expired")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/${locale}/gestion?proyecto=${project.id}`}
                            className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                          >
                            {t("applications.saved_view")}
                          </Link>
                          <button
                            type="button"
                            aria-label={t("applications.saved_remove")}
                            onClick={async () => {
                              setSavedProjects((prev) => prev.filter((p) => p.id !== project.id));
                              await unsaveProjectAction(project.id);
                            }}
                            className="flex size-8 items-center justify-center rounded-full border border-border text-ink-muted hover:border-magenta hover:text-magenta transition-colors"
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>
        )}

        {/* ── TAB: NOTIFICACIONES ──────────────────────────────────────────────── */}
        {activeTab === "notificaciones" && (() => {
          const totalPages = Math.max(1, Math.ceil(notificaciones.length / NOTIF_PAGE_SIZE));
          const paginated = notificaciones.slice((notifPage - 1) * NOTIF_PAGE_SIZE, notifPage * NOTIF_PAGE_SIZE);

          const notifDotColor = (tipo: string) => {
            if (tipo === "adjudicacion") return "bg-accent";
            if (tipo === "nuevo_mensaje") return "bg-primary";
            if (tipo === "entregable_subido") return "bg-warning";
            return "bg-magenta";
          };

          const handleMarcarLeida = async (id: string) => {
            await marcarNotificacionLeidaAction(id);
            setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
          };

          const handleMarcarTodas = async () => {
            await marcarTodasLeidasAction();
            setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
          };

          return (
            <section className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-ink-strong">
                    {t("notifications.activity_title")}
                  </h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs font-bold text-primary">
                      {unreadCount} {t("notifications.unread")}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { void handleMarcarTodas(); }}
                    className="font-body text-xs font-semibold text-primary hover:underline transition-colors"
                  >
                    {t("notifications.mark_all_read")}
                  </button>
                )}
              </div>

              {/* List */}
              {notificaciones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                  <MessageSquare className="mx-auto mb-3 w-8 h-8 text-ink-muted/40" />
                  <p className="font-body text-sm text-ink-muted">{t("notifications.empty")}</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
                  {paginated.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-4 px-5 py-4 transition-colors ${!notif.leida ? "bg-primary/5" : ""}`}
                    >
                      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${notifDotColor(notif.tipo)}`} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={`font-body text-sm leading-snug ${notif.leida ? "text-ink" : "font-semibold text-ink-strong"}`}>
                          {notif.mensaje}
                        </p>
                        <span className="font-body text-xs text-ink-muted">
                          {new Date(notif.fecha).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}
                          {new Date(notif.fecha).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {!notif.leida && (
                        <button
                          type="button"
                          onClick={() => { void handleMarcarLeida(notif.id); }}
                          className="shrink-0 font-body text-[11px] font-semibold text-ink-muted hover:text-primary transition-colors whitespace-nowrap"
                        >
                          {t("notifications.mark_read")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {notificaciones.length > NOTIF_PAGE_SIZE && (
                <div className="flex items-center justify-between pt-2">
                  <p className="font-body text-xs text-ink-muted">
                    {t("notifications.page_info", {
                      from: (notifPage - 1) * NOTIF_PAGE_SIZE + 1,
                      to: Math.min(notifPage * NOTIF_PAGE_SIZE, notificaciones.length),
                      total: notificaciones.length,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={notifPage === 1}
                      onClick={() => setNotifPage((p) => p - 1)}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("notifications.prev")}
                    </button>
                    <span className="font-body text-xs text-ink-muted">{notifPage} / {totalPages}</span>
                    <button
                      type="button"
                      disabled={notifPage === totalPages}
                      onClick={() => setNotifPage((p) => p + 1)}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("notifications.next")}
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })()}

        {/* ── TAB: SUGERIDOS ───────────────────────────────────────────────────── */}
        {activeTab === "sugeridos" && (
          <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-ink-strong flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t("suggested.title")}
              </h2>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full border border-primary/20">
                {t("suggested.badge")}
              </span>
            </div>
            <p className="text-sm text-ink-muted">{t("suggested.description")}</p>

            <div className="pt-8 border-t border-border/60">
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Sparkles className="mx-auto mb-3 w-7 h-7 text-primary" />
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("two_point_zero.title")}<span className="text-primary">.</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{t("two_point_zero.suggested")}</p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

function ConfirmDeleteModal({
  project,
  onConfirm,
  onCancel,
}: {
  project: WorkProject | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("perfil_junior.work");
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-strong/60 p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-elevated p-6">
        <h3 className="text-lg font-bold text-ink-strong mb-2">{t("confirm_delete.title")}</h3>
        <p className="text-sm text-ink-muted mb-4">{t("confirm_delete.message")}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-surface-sunken">{t("confirm_delete.cancel")}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-magenta text-white">{t("confirm_delete.confirm")}</button>
        </div>
      </div>
    </div>
  );
}
function EditProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: WorkProject;
  onClose: () => void;
  onSave: (id: string, updated: Omit<WorkProject, "id">) => Promise<void>;
}) {
  const t = useTranslations("perfil_junior.work");
  const [name, setName] = useState(project.title);
  const [url, setUrl] = useState(project.netlifyUrl);
  const [repoUrl, setRepoUrl] = useState(project.repoUrl ?? "");
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const SUGGESTED = [
    { name: "React", colorVar: "--primary" },
    { name: "Next.js", colorVar: "--secondary" },
    { name: "Tailwind", colorVar: "--accent" },
    { name: "Node.js", colorVar: "--highlight" },
    { name: "TypeScript", colorVar: "--magenta" },
  ];
  const OTHER_COLORS = ["--primary", "--secondary", "--accent", "--highlight", "--magenta"];
  const [selectedTechs, setSelectedTechs] = useState<{ name: string; colorVar: string }[]>(
    project.tags.map((tag) => {
      const found = SUGGESTED.find((s) => s.name === tag);
      if (found) return found;
      let hash = 0;
      for (let i = 0; i < tag.length; i++) hash = (hash << 5) - hash + tag.charCodeAt(i);
      return { name: tag, colorVar: OTHER_COLORS[Math.abs(hash) % OTHER_COLORS.length] ?? "--primary" };
    }),
  );
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  function toggleTech(item: { name: string; colorVar: string }) {
    setSelectedTechs((prev) => {
      const exists = prev.find((p) => p.name === item.name);
      if (exists) return prev.filter((p) => p.name !== item.name);
      return [...prev, item];
    });
  }

  function addOther() {
    const v = otherValue.trim();
    if (!v) return;
    let hash = 0;
    for (let i = 0; i < v.length; i++) hash = (hash << 5) - hash + v.charCodeAt(i);
    const colorVar = OTHER_COLORS[Math.abs(hash) % OTHER_COLORS.length] ?? "--primary";
    setSelectedTechs((prev) => (prev.some(p => p.name.toLowerCase() === v.toLowerCase()) ? prev : [...prev, { name: v, colorVar }]));
    setOtherValue("");
    setShowOtherInput(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError(t("errors.name_required")); return; }
    setSaving(true);
    const trimmedRepo = repoUrl.trim();
    await onSave(project.id, {
      title: name.trim(),
      netlifyUrl: url.trim(),
      ...(trimmedRepo ? { repoUrl: trimmedRepo } : {}),
      description: description.trim(),
      tags: selectedTechs.map(s => s.name),
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-strong/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-elevated p-6" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t("edit_modal_title")}</h3>
          <button type="button" onClick={onClose} className="text-ink-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-ink-muted mb-1">{t("fields.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-ink bg-surface" />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">{t("fields.url")}</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-ink bg-surface" />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">{t("fields.repo_url")}</label>
            <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-lg border border-border text-ink bg-surface" />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">{t("fields.description")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-ink bg-surface" rows={3} />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-2">{t("fields.techs")}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTED.map((s) => {
                const active = selectedTechs.some((st) => st.name === s.name);
                return (
                  <button type="button" key={s.name} onClick={() => toggleTech(s)}
                    style={active ? { backgroundColor: `var(${s.colorVar})`, color: "white" } : undefined}
                    className={`${active ? "" : "bg-surface-sunken text-ink"} px-3 py-1.5 rounded-full text-sm border border-border/50`}
                  >
                    {s.name}
                  </button>
                );
              })}
              <button type="button" onClick={() => setShowOtherInput((v) => !v)} className="px-3 py-1.5 rounded-full text-sm border border-border/50 bg-surface-sunken">Otros</button>
            </div>
            {showOtherInput && (
              <div className="flex gap-2">
                <input value={otherValue} onChange={(e) => setOtherValue(e.target.value)} placeholder={t("fields.techs_placeholder")} className="flex-grow px-3 py-2 rounded-lg border border-border text-ink bg-surface" />
                <button type="button" onClick={addOther} className="px-3 py-2 rounded-lg bg-primary text-white">Agregar</button>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-magenta">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-ink hover:bg-surface-sunken">{t("cancel")}</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("save_btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Omit<WorkProject, "id">) => Promise<void> }) {
  const t = useTranslations("perfil_junior.work");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // suggested techs mapped to design tokens (see README palette)
  const SUGGESTED = [
    { name: "React", colorVar: "--primary" },
    { name: "Next.js", colorVar: "--secondary" },
    { name: "Tailwind", colorVar: "--accent" },
    { name: "Node.js", colorVar: "--highlight" },
    { name: "TypeScript", colorVar: "--magenta" },
  ];

  const [selectedTechs, setSelectedTechs] = useState<{ name: string; colorVar: string }[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  function toggleTech(item: { name: string; colorVar: string }) {
    setSelectedTechs((prev) => {
      const exists = prev.find((p) => p.name === item.name);
      if (exists) return prev.filter((p) => p.name !== item.name);
      return [...prev, item];
    });
  }

  // use design token CSS variables for other tech pills
  const OTHER_COLORS = ["--primary", "--secondary", "--accent", "--highlight", "--magenta"];

  function addOther() {
    const v = otherValue.trim();
    if (!v) return;
    // deterministic pick based on name
    let hash = 0;
    for (let i = 0; i < v.length; i++) hash = (hash << 5) - hash + v.charCodeAt(i);
    const idx = Math.abs(hash) % OTHER_COLORS.length;
    const colorVar = OTHER_COLORS[idx] ?? "--primary";
    // avoid duplicates
    setSelectedTechs((prev) => (prev.some(p => p.name.toLowerCase() === v.toLowerCase()) ? prev : [...prev, { name: v, colorVar }]));
    setOtherValue("");
    setShowOtherInput(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError(t("work.errors.name_required")); return; }
    if (!url.trim()) { setError(t("work.errors.url_required")); return; }
    setSaving(true);
    const tags = selectedTechs.map(s => s.name);
    const trimmedRepo = repoUrl.trim();
    await onCreate({ title: name.trim(), netlifyUrl: url.trim(), ...(trimmedRepo ? { repoUrl: trimmedRepo } : {}), description: description.trim(), tags });
    setSaving(false);
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-canvas text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-strong/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-surface rounded-2xl shadow-elevated overflow-hidden" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-ink-strong">{t("work.add_modal_title")}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Nombre */}
            <div>
              <label className={labelClass}>{t("work.fields.name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Mi proyecto increíble" />
            </div>

            {/* URLs en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("work.fields.url")}</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://mi-proyecto.netlify.app" />
              </div>
              <div>
                <label className={labelClass}>{t("fields.repo_url")}</label>
                <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputClass} placeholder="https://github.com/..." />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className={labelClass}>{t("work.fields.description")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={2} placeholder="Breve descripción de qué hace este proyecto..." />
            </div>

            {/* Tecnologías */}
            <div>
              <label className={labelClass}>{t("work.fields.techs")}</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => {
                  const active = selectedTechs.some((st) => st.name === s.name);
                  return (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => toggleTech(s)}
                      style={active ? { backgroundColor: `var(${s.colorVar})`, borderColor: `var(${s.colorVar})`, color: "white" } : undefined}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${active ? "" : "border-border bg-surface-sunken text-ink-muted hover:border-primary/30 hover:text-ink"}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowOtherInput((v) => !v)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-border bg-transparent text-ink-muted hover:border-primary/40 hover:text-primary transition-all"
                >
                  + Otros
                </button>
              </div>
              {showOtherInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOther(); } }}
                    placeholder={t("work.fields.techs_placeholder")}
                    className={inputClass}
                  />
                  <button type="button" onClick={addOther} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold shrink-0">Agregar</button>
                </div>
              )}
              {selectedTechs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedTechs.map((st) => (
                    <span key={st.name} style={{ backgroundColor: `var(${st.colorVar})` }} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-semibold text-white">
                      {st.name}
                      <button type="button" onClick={() => setSelectedTechs(prev => prev.filter(p => p.name !== st.name))} className="w-4 h-4 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-magenta/8 border border-magenta/20 px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-magenta shrink-0" />
                <p className="text-sm text-magenta">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-canvas">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-muted border border-border hover:bg-surface-sunken transition-colors">{t("work.cancel")}</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Guardando..." : t("work.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

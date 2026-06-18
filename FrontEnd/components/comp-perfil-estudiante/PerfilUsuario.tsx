"use client";

import React, { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fullName,
  type Activity,
  type Application,
  type ApplicationStats,
  type MockCalificacion,
  type StudentProfile,
} from "@/app/[locale]/(public)/perfil-estudiante/types";
import type {
  StudentAvailability,
  StudentProfileUpdate,
  StudentSpecialty,
} from "@/lib/api/types";
import { updateStudentProfile, uploadStudentAvatar } from "@/lib/actions/perfil";
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

function StarRow({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-xl" : "text-base";
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

const MOCK_CALIFICACIONES: MockCalificacion[] = [
  {
    id: "cal-1",
    companyName: "Global Tech Solutions S.A.",
    projectName: "Dashboard de análisis de ventas en tiempo real",
    score: 5,
    comment: "Excelente trabajo. El junior entregó a tiempo, el código es limpio y documentado. Superó nuestras expectativas en cuanto a la calidad de los componentes React y la integración con la API.",
    date: "2026-06-10T00:00:00Z",
    reply: null,
  },
  {
    id: "cal-2",
    companyName: "LogiTech CR",
    projectName: "App móvil de gestión de inventario",
    score: 4,
    comment: "Buen trabajo general. El junior fue proactivo y comunicó bien los avances. Hubo un par de detalles de UX que requirieron ajuste, pero la entrega final fue sólida.",
    date: "2026-05-20T00:00:00Z",
    reply: "Muchas gracias por la retroalimentación. Tomé nota de los puntos de UX para mejorarlos en proyectos futuros.",
  },
];

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
    startSaving(async () => {
      await new Promise<void>((res) => setTimeout(res, 500));
      setCalificaciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, reply: replyDraft.trim() } : c)),
      );
      setReplyingId(null);
      setReplyDraft("");
    });
  }

  if (calificaciones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="font-body text-sm text-ink-muted">{t("calificaciones.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-ink-strong">
        {t("calificaciones.title")}<span className="text-primary">.</span>
      </h2>
      {calificaciones.map((cal) => (
        <div key={cal.id} className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">{cal.companyName}</p>
              <p className="font-heading text-base font-bold text-ink-strong leading-tight">{cal.projectName}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StarRow score={cal.score} />
              <span className="font-body text-[10px] text-ink-subtle">
                {new Date(cal.date).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed text-ink">{cal.comment}</p>

          {/* Réplica existente o botón para responder */}
          {cal.reply ? (
            <div className="rounded-xl bg-surface-sunken border border-border px-4 py-3">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">{t("calificaciones.your_reply")}</p>
              <p className="font-body text-sm text-ink">{cal.reply}</p>
            </div>
          ) : replyingId === cal.id ? (
            <div className="space-y-2">
              <label htmlFor={`reply-${cal.id}`} className="sr-only">{t("calificaciones.reply_placeholder")}</label>
              <textarea
                id={`reply-${cal.id}`}
                rows={3}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder={t("calificaciones.reply_placeholder")}
                className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSaving || !replyDraft.trim()}
                  onClick={() => handleSendReply(cal.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  {isSaving ? t("calificaciones.reply_sending") : t("calificaciones.reply_send")}
                </button>
                <button
                  type="button"
                  onClick={() => { setReplyingId(null); setReplyDraft(""); }}
                  className="rounded-full border border-border px-3 py-2 font-body text-xs font-semibold text-ink-muted hover:bg-surface-sunken"
                >
                  {t("calificaciones.reply_cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setReplyingId(cal.id); setReplyDraft(""); }}
              className="font-body text-xs font-semibold text-primary hover:underline"
            >
              {t("calificaciones.reply_btn")}
            </button>
          )}
        </div>
      ))}
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
  stats: ApplicationStats;
}

export default function PerfilUsuario({
  initialProfile,
  initialActivities,
  initialApplications,
  stats,
}: PerfilUsuarioProps) {
  const t = useTranslations("perfil_junior");

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<TabId>("perfil");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todas");
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [applications] = useState<Application[]>(initialApplications);

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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
      { id: `act-${Date.now()}`, description, timestamp: t("activity.just_now") },
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

  function addSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;
    const next = [...profile.skills, trimmed];
    persistProfile({ skills: next }, {}, setSkillError, () => {
      addActivity(t("activity.added_skill", { skill: trimmed }));
      setNewSkill("");
      setIsAddingSkill(false);
    });
  }

  function removeSkill(skillToRemove: string) {
    const next = profile.skills.filter((skill) => skill !== skillToRemove);
    persistProfile({ skills: next }, {}, setSkillError, () => {
      addActivity(t("activity.removed_skill", { skill: skillToRemove }));
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

  // ── Derived values ─────────────────────────────────────────────────────────

  const unreadCount = 0;
  const filteredApplications = applications.filter(
    (app) => filterStatus === "todas" || app.status === filterStatus
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-body transition-colors duration-200">
      <main className="w-full max-w-7xl mx-auto px-6 py-8 md:px-10 flex-grow space-y-8">

        {/* HERO */}
        <section className="relative rounded-3xl overflow-hidden shadow-soft bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-white">
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

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start flex-grow">

              <div className="shrink-0 space-y-2">
                <div className="relative">
                  <div className="size-24 md:size-28 overflow-hidden rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL externa (Cloudinary)
                      <img
                        src={profile.avatarUrl}
                        alt={t("avatar.alt")}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="font-heading text-3xl font-extrabold text-white/90">
                        {getInitials(fullName(profile))}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    aria-label={t("avatar.change")}
                    className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                {avatarError && (
                  <p className="flex items-center gap-1 text-xs font-medium text-highlight max-w-28">
                    <AlertCircle className="size-3.5 shrink-0" /> {avatarError}
                  </p>
                )}
              </div>

              <div className="space-y-4 flex-grow">
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
                  <>
                    <div className="space-y-1">
                      <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight uppercase">
                        {fullName(profile) || t("hero.unnamed")}
                        <span className="text-highlight">.</span>
                      </h1>
                      <p className="text-lg md:text-xl font-medium text-white/95">
                        {profile.specialty ? specialtyLabel(profile.specialty) : t("specialty_options.placeholder")}
                        {profile.program && (
                          <>
                            {" "}&mdash; <span className="opacity-90">{profile.program}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {profile.badges.map((badge) => (
                        <span
                          key={badge}
                          className="px-3 py-1 text-xs uppercase tracking-wider rounded-full shadow-sm bg-white/10 text-white border border-white/20"
                        >
                          {badgeLabel(badge)}
                        </span>
                      ))}
                    </div>

                    {/* RF-51 — Reputación acumulada */}
                    {typeof profile.reputacion === "number" && profile.reputacion > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <StarRow score={profile.reputacion} size="md" />
                        <span className="font-heading text-lg font-extrabold text-highlight tracking-tight">
                          {profile.reputacion.toFixed(1)}
                        </span>
                        <span className="font-body text-xs text-white/70">
                          {t("hero.reputation_label")}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {!isEditingHero && (
              <button
                type="button"
                onClick={openEditHero}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-sm font-semibold border border-white/20 backdrop-blur-sm cursor-pointer self-start md:self-auto"
              >
                <Edit2 className="w-4 h-4" />
                {t("hero.edit_profile")}
              </button>
            )}
          </div>
        </section>

        {/* TAB NAV */}
        <nav
          role="tablist"
          aria-label={t("tabs.nav_label")}
          className="flex border-b border-border gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-none"
        >
          {TAB_IDS.map((tabId) => {
            const isActive = activeTab === tabId;
            let badge: number | null = null;
            if (tabId === "postulaciones") badge = applications.length;
            if (tabId === "notificaciones") badge = unreadCount;
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
                {badge !== null && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface-sunken text-ink-muted border border-border">
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
                      onClick={() => setIsAddingSkill(true)}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> {t("stack.add")}
                    </button>
                  )}
                </div>

                {isAddingSkill && (
                  <form onSubmit={addSkill} className="flex gap-2 max-w-md">
                    <label htmlFor="new-skill" className="sr-only">
                      {t("stack.add")}
                    </label>
                    <input
                      id="new-skill"
                      type="text"
                      placeholder={t("stack.placeholder")}
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-grow bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold px-4 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("stack.add_btn")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewSkill(""); setIsAddingSkill(false); setSkillError(""); }}
                      className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold px-3 rounded-xl cursor-pointer"
                      aria-label={t("stack.cancel_btn")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-surface-sunken border border-border text-ink hover:border-border-strong transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          disabled={isPending}
                          className="text-ink-subtle hover:text-magenta transition-colors focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={t("stack.remove_skill", { skill })}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted italic">{t("stack.empty")}</p>
                  )}
                </div>

                {skillError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-magenta">
                    <AlertCircle className="size-3.5 shrink-0" /> {skillError}
                  </p>
                )}
                <p className="text-xs text-ink-muted">{t("stack.catalog_hint")}</p>
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
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink-strong">{t("activity.title")}</h2>
                </div>
                <div className="relative border-l-2 border-border pl-4 ml-2.5 space-y-5">
                  {activities.map((act) => (
                    <div key={act.id} className="relative space-y-1">
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-surface" />
                      <p className="text-sm text-ink-strong font-medium leading-tight">{act.description}</p>
                      <span className="block text-xs text-ink-muted">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-primary hover:underline text-sm font-semibold block pt-2 cursor-pointer w-full text-left"
                >
                  {t("activity.view_all")}
                </button>
              </section>

              {/* Applications sidebar widget */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink-strong">{t("applications_sidebar.title")}</h2>
                </div>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => {
                    const sidebarStyles = getStatusStyles(app.status);
                    return (
                      <div
                        key={app.id}
                        className="flex justify-between items-start gap-4 p-3 rounded-xl border border-border bg-surface-sunken"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-ink-strong leading-tight">{app.projectName}</h3>
                          <span className="block text-xs text-ink-muted">{app.companyName}</span>
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
                <button
                  type="button"
                  onClick={() => setActiveTab("postulaciones")}
                  className="text-primary hover:underline text-sm font-semibold block pt-2 cursor-pointer w-full text-left"
                >
                  {t("applications_sidebar.manage")}
                </button>
              </section>
            </div>
          </div>
        )}

        {/* ── TAB: TRABAJO ─────────────────────────────────────────────────────── */}
        {activeTab === "trabajo" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                {t("work.title")}<span className="text-primary">.</span>
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">{t("work.description")}</p>
            </div>

            {/* RF-53 — Calificaciones recibidas con réplica */}
            <CalificacionesSection t={t} initialCalificaciones={MOCK_CALIFICACIONES} />
          </section>
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
                    onClick={() => setFilterStatus(value)}
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

            {/* Application list */}
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const styles = getStatusStyles(app.status);
                return (
                  <div
                    key={app.id}
                    className="relative rounded-2xl bg-surface border border-border p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden pl-7"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${styles.strip}`} />
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(app.category)}`}
                      >
                        {getCategoryIcon(app.category)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-ink-strong leading-tight">{app.projectName}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            {app.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {app.relativeTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${styles.badge}`}
                      >
                        {styles.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-ink-subtle hover:text-primary transition-colors shrink-0" />
                    </div>
                  </div>
                );
              })}
              {filteredApplications.length === 0 && (
                <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                  <p className="text-sm text-ink-muted italic">{t("applications.empty")}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="bg-primary rounded-2xl p-6 text-white flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <TrendingUp className="w-7 h-7 text-white/80" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight">{stats.activeCount}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    {t("applications.stats.active")}
                  </div>
                </div>
              </div>
              <div className="bg-surface-sunken rounded-2xl p-6 border border-border flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <Calendar className="w-7 h-7 text-primary" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight text-ink-strong">
                    {stats.scheduledInterviews}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t("applications.stats.interviews")}
                  </div>
                </div>
              </div>
              <div className="bg-surface rounded-2xl p-6 border border-border flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <Zap className="w-7 h-7 text-warning" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight text-ink-strong">
                    {stats.compatibilityIndex}%
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t("applications.stats.compatibility")}
                  </div>
                </div>
              </div>
            </div>

            {/* More opportunities */}
            <div className="pt-8 border-t border-border/60">
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Sparkles className="mx-auto mb-3 w-7 h-7 text-primary" />
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("two_point_zero.title")}<span className="text-primary">.</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{t("two_point_zero.applications")}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB: NOTIFICACIONES ──────────────────────────────────────────────── */}
        {activeTab === "notificaciones" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink-strong">
                {t("notifications.activity_title")}
              </span>
              <button
                type="button"
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {t("notifications.mark_all_read")}
              </button>
            </div>

            <div className="pt-8 border-t border-border/60">
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Sparkles className="mx-auto mb-3 w-7 h-7 text-primary" />
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("two_point_zero.title")}<span className="text-primary">.</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{t("two_point_zero.notifications")}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB: SUGERIDOS ───────────────────────────────────────────────────── */}
        {activeTab === "sugeridos" && (
          <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-ink-strong flex items-center gap-2">
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

      {/* FOOTER */}
      <footer className="border-t border-border mt-16 bg-surface">
        <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:flex md:justify-between md:items-center text-xs text-ink-muted space-y-4 md:space-y-0">
          <p className="text-center md:text-left">{t("footer.copyright")}</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-primary transition-colors">{t("footer.support")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

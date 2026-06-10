"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
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
  Search,
  Box,
  UserCog,
  Play,
  Eye,
  Compass,
} from "lucide-react";
import {
  StudentProfile,
  Activity,
  Application,
  ApplicationStats,
  NotifType,
  MockNotification,
  MockSuggestedProject,
  WorkProject,
  OpportunityItem,
} from "@/app/[locale]/(public)/perfil-estudiante/types";
import {
  MOCK_NOTIFICATIONS_HOY,
  MOCK_NOTIFICATIONS_AYER,
  MOCK_SUGGESTED_PROJECTS,
  MOCK_WORK_PROJECTS,
  MOCK_OPPORTUNITIES,
} from "@/app/[locale]/(public)/perfil-estudiante/mock-data";

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

function getCategoryIcon(category: Application["category"]) {
  switch (category) {
    case "ux":     return <Layers    className="w-5 h-5 text-primary" />;
    case "data":   return <BarChart2 className="w-5 h-5 text-warning" />;
    case "dev":    return <Code2     className="w-5 h-5 text-accent" />;
    case "design": return <Palette   className="w-5 h-5 text-magenta" />;
  }
}

function getCategoryBg(category: Application["category"]): string {
  switch (category) {
    case "ux":     return "bg-primary/10";
    case "data":   return "bg-warning/10";
    case "dev":    return "bg-accent/10";
    case "design": return "bg-magenta/10";
  }
}

function getNotifIconStyle(type: NotifType): string {
  switch (type) {
    case "oportunidad": return "bg-primary/10 text-primary border border-primary/20";
    case "rechazo":     return "bg-magenta/10 text-magenta border border-magenta/20";
    case "visibilidad": return "bg-warning/10 text-warning border border-warning/20";
    case "proyecto":    return "bg-accent/15 text-accent border border-accent/20";
  }
}

function getNotifIcon(type: NotifType) {
  switch (type) {
    case "oportunidad": return <Compass className="w-5 h-5" />;
    case "rechazo":     return <X       className="w-5 h-5" />;
    case "visibilidad": return <Eye     className="w-5 h-5" />;
    case "proyecto":    return <Check   className="w-5 h-5" />;
  }
}

function renderBoldMessage(message: string): React.ReactNode[] {
  const parts = message.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-ink-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function buildWorkProjectPreview(project: WorkProject) {
  switch (project.variant) {
    case "dashboard":
      return (
        <div className="bg-canvas p-4 flex gap-3 h-44 overflow-hidden border-b border-border/40 select-none">
          <div className="w-8 shrink-0 bg-surface border border-border/50 rounded flex flex-col gap-1.5 p-1">
            <div className="w-full h-2 rounded bg-primary/20" />
            <div className="w-full h-1 bg-border rounded" />
            <div className="w-full h-1 bg-border rounded" />
            <div className="w-full h-1 bg-border rounded" />
          </div>
          <div className="flex-grow flex flex-col gap-2">
            <div className="w-full h-4 bg-surface border border-border/50 rounded flex items-center px-1.5 justify-between">
              <div className="w-10 h-1.5 bg-border rounded" />
              <div className="w-4 h-1.5 bg-primary/30 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2 flex-grow">
              <div className="bg-surface border border-border/40 rounded p-1.5 flex flex-col justify-between">
                <div className="w-full h-1 bg-border rounded" />
                <div className="w-8 h-3 bg-secondary/15 rounded" />
              </div>
              <div className="bg-surface border border-border/40 rounded p-1.5 flex flex-col justify-between">
                <div className="w-full h-1 bg-border rounded" />
                <div className="w-6 h-3 bg-primary/15 rounded" />
              </div>
              <div className="bg-surface border border-border/40 rounded p-1.5 flex flex-col justify-between">
                <div className="w-full h-1 bg-border rounded" />
                <div className="w-10 h-3 bg-accent/15 rounded" />
              </div>
            </div>
            <div className="w-full h-10 bg-surface border border-border/40 rounded p-1.5 flex flex-col gap-1">
              <div className="w-full h-1 bg-border rounded" />
              <div className="w-4/5 h-1 bg-border/60 rounded" />
            </div>
          </div>
        </div>
      );
    case "landing":
      return (
        <div className="bg-canvas p-4 h-44 overflow-hidden border-b border-border/40 select-none flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <div className="w-8 h-2 bg-primary/40 rounded" />
            <div className="flex gap-1.5">
              <div className="w-4 h-1.5 bg-border rounded" />
              <div className="w-4 h-1.5 bg-border rounded" />
            </div>
          </div>
          <div className="flex-grow bg-ink-strong/95 rounded-lg flex flex-col items-center justify-center p-3 relative text-center border border-border/50">
            <div className="w-20 h-1.5 bg-primary/30 rounded mb-1.5" />
            <div className="w-28 h-2.5 bg-border rounded mb-3" />
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-soft">
              <Play className="w-3.5 h-3.5 fill-primary text-primary ml-0.5" />
            </div>
          </div>
        </div>
      );
    case "inventory":
      return (
        <div className="bg-canvas p-4 h-44 overflow-hidden border-b border-border/40 select-none flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="w-16 h-3.5 bg-primary/20 rounded" />
            <div className="w-5 h-5 rounded-full bg-primary/80" />
          </div>
          <div className="space-y-2 flex-grow">
            <div className="bg-surface border border-border/40 rounded p-1.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-5 h-5 bg-border rounded shrink-0" />
              <div className="flex-grow space-y-1">
                <div className="w-24 h-1.5 bg-border rounded" />
                <div className="w-16 h-1 bg-border/60 rounded" />
              </div>
            </div>
            <div className="bg-surface border border-border/40 rounded p-1.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-5 h-5 bg-border rounded shrink-0" />
              <div className="flex-grow space-y-1">
                <div className="w-28 h-1.5 bg-border rounded" />
                <div className="w-12 h-1 bg-border/60 rounded" />
              </div>
            </div>
          </div>
        </div>
      );
  }
}

const OPPORTUNITY_ICONS = [
  <UserCog key="user-cog" className="w-6 h-6 text-ink-muted" />,
  <Box     key="box"      className="w-6 h-6 text-ink-muted" />,
] as const;

function getOpportunityIcon(index: number): React.ReactNode {
  return OPPORTUNITY_ICONS[index] ?? OPPORTUNITY_ICONS[0];
}

// ── Tab and filter types ───────────────────────────────────────────────────────

type TabId = "perfil" | "trabajo" | "postulaciones" | "notificaciones" | "sugeridos";
type FilterStatus = "todas" | Application["status"];

const TAB_IDS: TabId[] = ["perfil", "trabajo", "postulaciones", "notificaciones", "sugeridos"];
const FILTER_VALUES: FilterStatus[] = ["todas", "enviada", "vista", "en_proceso", "aceptada", "rechazada"];

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

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editBio, setEditBio] = useState(profile.bio);

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editRole, setEditRole] = useState(profile.role);
  const [editProgram, setEditProgram] = useState(profile.program);

  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // ── Label maps — avoids dynamic key access ─────────────────────────────────

  const TAB_LABELS: Record<TabId, string> = {
    perfil:         t("tabs.perfil"),
    trabajo:        t("tabs.trabajo"),
    postulaciones:  t("tabs.postulaciones"),
    notificaciones: t("tabs.notificaciones"),
    sugeridos:      t("tabs.sugeridos"),
  };

  const FILTER_LABELS: Record<FilterStatus, string> = {
    todas:      t("applications.filter.all"),
    enviada:    t("applications.filter.sent"),
    vista:      t("applications.filter.seen"),
    en_proceso: t("applications.filter.in_process"),
    aceptada:   t("applications.filter.accepted"),
    rechazada:  t("applications.filter.rejected"),
  };

  // ── Status styles ──────────────────────────────────────────────────────────

  function getStatusStyles(status: Application["status"]) {
    switch (status) {
      case "enviada":
        return { strip: "bg-primary",   badge: "bg-primary/10 text-primary border-primary/20",       label: t("status.enviada") };
      case "vista":
        return { strip: "bg-warning",   badge: "bg-warning/10 text-warning border-warning/20",       label: t("status.vista") };
      case "en_proceso":
        return { strip: "bg-secondary", badge: "bg-secondary/10 text-secondary border-secondary/20", label: t("status.en_proceso") };
      case "aceptada":
        return { strip: "bg-accent",    badge: "bg-accent/15 text-accent border-accent/20",          label: t("status.aceptada") };
      case "rechazada":
        return { strip: "bg-magenta",   badge: "bg-magenta/10 text-magenta border-magenta/20",       label: t("status.rechazada") };
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function savePersonalInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, location: editLocation, email: editEmail, bio: editBio }));
    setIsEditingPersonal(false);
    setActivities((prev) => [
      { id: `act-${Date.now()}`, description: t("activity.updated_personal"), timestamp: t("activity.just_now") },
      ...prev,
    ]);
  }

  function saveHeroInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, role: editRole, program: editProgram }));
    setIsEditingHero(false);
  }

  function removeSkill(skillToRemove: string) {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
    setActivities((prev) => [
      { id: `act-${Date.now()}`, description: t("activity.removed_skill", { skill: skillToRemove }), timestamp: t("activity.just_now") },
      ...prev,
    ]);
  }

  function addSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setActivities((prev) => [
      { id: `act-${Date.now()}`, description: t("activity.added_skill", { skill: trimmed }), timestamp: t("activity.just_now") },
      ...prev,
    ]);
    setNewSkill("");
    setIsAddingSkill(false);
  }

  function cancelEditPersonal() {
    setEditLocation(profile.location);
    setEditEmail(profile.email);
    setEditBio(profile.bio);
    setIsEditingPersonal(false);
  }

  function cancelEditHero() {
    setEditRole(profile.role);
    setEditProgram(profile.program);
    setIsEditingHero(false);
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const unreadCount = [...MOCK_NOTIFICATIONS_HOY, ...MOCK_NOTIFICATIONS_AYER].filter((n) => n.unread).length;
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

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              {isEditingHero ? (
                <form
                  onSubmit={saveHeroInfo}
                  className="space-y-3 max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm"
                >
                  <div>
                    <label
                      htmlFor="edit-role"
                      className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                    >
                      {t("hero.role_label")}
                    </label>
                    <input
                      id="edit-role"
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                      required
                    />
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
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-accent hover:opacity-95 text-accent-foreground text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> {t("hero.save")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditHero}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                    >
                      {t("hero.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight uppercase">
                      {profile.name}
                      <span className="text-highlight">.</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-white/95">
                      {profile.role} &mdash; <span className="opacity-90">{profile.program}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.badges.map((badge) => {
                      const badgeLower = badge.toLowerCase();
                      let badgeStyle = "bg-white/10 text-white border border-white/20";
                      if (badgeLower === "disponible") badgeStyle = "bg-accent text-accent-foreground font-semibold";
                      if (badgeLower === "frontend")   badgeStyle = "bg-highlight text-highlight-foreground font-semibold";
                      return (
                        <span
                          key={badge}
                          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full shadow-sm ${badgeStyle}`}
                        >
                          {badge}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {!isEditingHero && (
              <button
                type="button"
                onClick={() => setIsEditingHero(true)}
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
            if (tabId === "postulaciones")  badge = applications.length;
            if (tabId === "notificaciones") badge = unreadCount;
            if (tabId === "sugeridos")      badge = MOCK_SUGGESTED_PROJECTS.length;

            return (
              <button
                key={tabId}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
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
                      onClick={() => setIsEditingPersonal(true)}
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
                          htmlFor="edit-location"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("personal.location_field")}
                        </label>
                        <input
                          id="edit-location"
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                          required
                        />
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
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                          required
                        />
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
                        className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary resize-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> {t("personal.save_changes")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditPersonal}
                        className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold py-2 px-4 rounded-xl cursor-pointer"
                      >
                        {t("personal.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("personal.location_display")}</span>
                          <span className="font-semibold text-ink-strong">{profile.location}</span>
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
                      <p className="text-ink leading-relaxed text-sm md:text-base font-normal">{profile.bio}</p>
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
                      className="bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold px-4 rounded-xl cursor-pointer"
                    >
                      {t("stack.add_btn")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewSkill(""); setIsAddingSkill(false); }}
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
                          className="text-ink-subtle hover:text-magenta transition-colors focus:outline-none cursor-pointer"
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
              </section>

              {/* Links */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-ink-strong">{t("links.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.links.github && (
                    <a
                      href={`https://${profile.links.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <GithubIcon className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("links.github")}</span>
                          <span className="text-sm font-bold text-ink-strong break-all">
                            {profile.links.github.replace("github.com/", "")}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  )}
                  {profile.links.linkedin && (
                    <a
                      href={`https://${profile.links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <LinkedinIcon className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("links.linkedin")}</span>
                          <span className="text-sm font-bold text-ink-strong break-all">
                            {profile.links.linkedin.replace("linkedin.com/in/", "")}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  )}
                  {profile.links.portfolio && (
                    <a
                      href={`https://${profile.links.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("links.portfolio")}</span>
                          <span className="text-sm font-bold text-ink-strong break-all">{profile.links.portfolio}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  )}
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {MOCK_WORK_PROJECTS.map((project: WorkProject) => (
                <div
                  key={project.id}
                  className="bg-surface rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col"
                >
                  <div className="bg-surface-sunken border-b border-border px-4 py-2.5 flex items-center gap-2 text-xs shrink-0 select-none">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                    </div>
                    <div className="flex-grow max-w-xs mx-auto bg-surface border border-border/60 rounded-md px-3 py-0.5 text-ink-subtle text-[10px] flex items-center gap-1 font-mono">
                      <span className="text-primary/70">fwd-talent.io</span>/{project.browserBar.replace("fwd-talent.io/", "")}
                    </div>
                  </div>
                  {buildWorkProjectPreview(project)}
                  <div className="p-5 flex-grow flex flex-col justify-between gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base font-bold text-ink-strong leading-tight">{project.title}</h3>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {t("work.badge_product")}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{project.description}</p>
                  </div>
                </div>
              ))}

              {/* Add project card */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
                className="bg-surface border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[260px] rounded-2xl group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink-strong text-base mb-1">{t("work.add_title")}</h3>
                <p className="text-xs text-ink-subtle">{t("work.add_formats")}</p>
              </div>
            </div>
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
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isActive
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
            <div className="pt-8 border-t border-border/60 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("applications.opportunities_title")}<span className="text-primary">.</span>
                </h2>
                <p className="text-sm text-ink-muted">{t("applications.opportunities_description")}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {MOCK_OPPORTUNITIES.map((opp: OpportunityItem, index: number) => (
                    <div
                      key={opp.id}
                      className="bg-surface rounded-2xl border border-border/80 p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-border/60 flex items-center justify-center bg-surface-sunken shrink-0">
                          {getOpportunityIcon(index)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm md:text-base font-bold text-ink-strong leading-tight">{opp.title}</h3>
                          <p className="text-xs md:text-sm text-ink-muted">{opp.location}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-[10px] md:text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {t("applications.view_details")} <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative bg-gradient-to-br from-primary/5 to-secondary/15 rounded-3xl border border-border/40 p-6 flex items-center justify-center min-h-[180px] overflow-hidden group">
                  <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-primary/10 pointer-events-none transition-transform group-hover:scale-110 duration-500" />
                  <div className="absolute -right-4 -top-4 w-12 h-12 rounded-lg bg-secondary/10 rotate-12 pointer-events-none transition-transform group-hover:rotate-45 duration-500" />
                  <div className="relative z-10 bg-surface rounded-2xl p-6 shadow-soft hover:shadow-md transition-shadow duration-200 w-full max-w-[220px] flex flex-col items-center justify-center text-center space-y-4 border border-border/40">
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <div className="w-10 h-1 rounded-full bg-primary/40" />
                      <div className="w-6 h-1 rounded-full bg-primary/20" />
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="w-6 h-6" />
                      <span className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-surface flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-primary tracking-wider uppercase">
                      {t("applications.explore_routes")}
                    </span>
                  </div>
                </div>
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

            {/* Today */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold font-heading text-ink-strong shrink-0">
                  {t("notifications.today")}
                </h2>
                <div className="flex-grow border-t border-border/80" />
              </div>
              <div className="space-y-4">
                {MOCK_NOTIFICATIONS_HOY.map((notif: MockNotification) => (
                  <div
                    key={notif.id}
                    className="bg-surface border border-border rounded-2xl px-6 py-5 flex items-center gap-6 shadow-soft hover:shadow-md hover:border-border-strong transition-all duration-200"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border ${getNotifIconStyle(notif.type)}`}
                      >
                        {getNotifIcon(notif.type)}
                      </div>
                      {notif.unread && (
                        <span className="absolute top-0 right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-surface" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                          {notif.category}
                        </span>
                        <span className="text-xs text-ink-subtle shrink-0 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">{renderBoldMessage(notif.message)}</p>
                      {notif.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {notif.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-medium bg-surface-sunken border border-border text-ink-muted px-2.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yesterday */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold font-heading text-ink-strong shrink-0">
                  {t("notifications.yesterday")}
                </h2>
                <div className="flex-grow border-t border-border/80" />
              </div>
              <div className="space-y-4">
                {MOCK_NOTIFICATIONS_AYER.map((notif: MockNotification) => (
                  <div
                    key={notif.id}
                    className="bg-surface border border-border rounded-2xl px-6 py-5 flex items-center gap-6 shadow-soft hover:shadow-md hover:border-border-strong transition-all duration-200"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border ${getNotifIconStyle(notif.type)}`}
                      >
                        {getNotifIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                          {notif.category}
                        </span>
                        <span className="text-xs text-ink-subtle shrink-0 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">{renderBoldMessage(notif.message)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 py-14 bg-surface rounded-2xl border border-dashed border-border-strong/50">
              <History className="w-8 h-8 text-ink-subtle" />
              <span className="text-sm text-ink-subtle font-medium">{t("notifications.older_empty")}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_SUGGESTED_PROJECTS.map((project: MockSuggestedProject) => (
                <div
                  key={project.id}
                  className="bg-surface-sunken rounded-xl border border-border p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-soft transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-base font-bold text-ink-strong leading-snug">{project.title}</h3>
                        <span className="text-xs text-ink-muted font-medium">{project.company}</span>
                      </div>
                      <span className="bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 rounded-md border border-accent/20">
                        {project.match} {t("suggested.match_label")}
                      </span>
                    </div>
                    <p className="text-xs text-ink leading-relaxed line-clamp-3">{project.description}</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-surface text-[10px] font-semibold text-ink px-2 py-0.5 rounded border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border/60">
                      <span className="text-xs text-ink-muted font-medium">
                        {t("suggested.duration_prefix")} {project.duration}
                      </span>
                      <button
                        type="button"
                        className="text-primary hover:text-primary/95 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {t("suggested.apply")} <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

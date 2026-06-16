"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  StudentProfile,
  Activity,
  Application,
  ApplicationStats,
} from "@/app/[locale]/(public)/perfil-estudiante/types";

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
  const [editAvailability, setEditAvailability] = useState(profile.availability);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editBio, setEditBio] = useState(profile.bio);

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editSpecialty, setEditSpecialty] = useState(profile.specialty);
  const [editProgram, setEditProgram] = useState(profile.program);

  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

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

  function savePersonalInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, availability: editAvailability, email: editEmail, bio: editBio }));
    setIsEditingPersonal(false);
    setActivities((prev) => [
      { id: `act-${Date.now()}`, description: t("activity.updated_personal"), timestamp: t("activity.just_now") },
      ...prev,
    ]);
  }

  function saveHeroInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, specialty: editSpecialty, program: editProgram }));
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
    setEditAvailability(profile.availability);
    setEditEmail(profile.email);
    setEditBio(profile.bio);
    setIsEditingPersonal(false);
  }

  function cancelEditHero() {
    setEditSpecialty(profile.specialty);
    setEditProgram(profile.program);
    setIsEditingHero(false);
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

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              {isEditingHero ? (
                <form
                  onSubmit={saveHeroInfo}
                  className="space-y-3 max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm"
                >
                  <div>
                    <label
                      htmlFor="edit-specialty"
                      className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1"
                    >
                      {t("hero.role_label")}
                    </label>
                    <input
                      id="edit-specialty"
                      type="text"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
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
                      {profile.specialty} &mdash; <span className="opacity-90">{profile.program}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.badges.map((badge) => {
                      const badgeLower = badge.toLowerCase();
                      let badgeStyle = "bg-white/10 text-white border border-white/20";
                      if (badgeLower === "disponible") badgeStyle = "bg-accent text-accent-foreground font-semibold";
                      if (badgeLower === "frontend") badgeStyle = "bg-highlight text-highlight-foreground font-semibold";
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
                          htmlFor="edit-availability"
                          className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1"
                        >
                          {t("personal.location_field")}
                        </label>
                        <input
                          id="edit-availability"
                          type="text"
                          value={editAvailability}
                          onChange={(e) => setEditAvailability(e.target.value)}
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
                        <Clock className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">{t("personal.location_display")}</span>
                          <span className="font-semibold text-ink-strong">{profile.availability}</span>
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

            <div className="pt-8 border-t border-border/60">
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Sparkles className="mx-auto mb-3 w-7 h-7 text-primary" />
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  {t("two_point_zero.title")}<span className="text-primary">.</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{t("two_point_zero.work")}</p>
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

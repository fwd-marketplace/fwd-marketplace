"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Check,
  X,
  Eye,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

interface Project {
  id: string;
  title: string;
  publishedDays: number;
  appliedCount: number;
  status: "active" | "paused";
  colorClass: string; // Left border color token
}

interface CandidateMatch {
  id: string;
  projectId: string;
  name: string;
  role: string;
  initials: string;
  matchScore: number;
  avatarBg: string; // Tailwind class for avatar background tint
  stats: {
    techStack: number;
    availability: number;
    modality: number;
  };
  skills: string[];
}

interface Application {
  id: string;
  juniorName: string;
  initials: string;
  avatarColor: string; // Tailwind color class
  projectId: string;
  projectName: string;
  matchScore: number;
  status: "reviewed" | "pending" | "interview" | "accepted" | "rejected";
}

const BORDER_COLOR_CYCLE: string[] = [
  "border-l-4 border-accent",
  "border-l-4 border-warning",
  "border-l-4 border-secondary",
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Frontend Senior React",
    publishedDays: 2,
    appliedCount: 24,
    status: "active",
    colorClass: "border-l-4 border-accent",
  },
  {
    id: "p2",
    title: "UX/UI Designer Sprint",
    publishedDays: 5,
    appliedCount: 18,
    status: "active",
    colorClass: "border-l-4 border-warning",
  },
  {
    id: "p3",
    title: "Backend Node.js Architect",
    publishedDays: 0,
    appliedCount: 56,
    status: "paused",
    colorClass: "border-l-4 border-secondary",
  },
];

const INITIAL_CANDIDATES: CandidateMatch[] = [
  {
    id: "c1",
    projectId: "p1",
    name: "Alejandro Martínez",
    role: "Frontend Developer Jr.",
    initials: "AM",
    matchScore: 98,
    avatarBg: "bg-primary/10 text-primary border border-primary/20",
    stats: { techStack: 85, availability: 100, modality: 80 },
    skills: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "c2",
    projectId: "p1",
    name: "Valeria Gómez",
    role: "Frontend Engineer",
    initials: "VG",
    matchScore: 91,
    avatarBg: "bg-accent/15 text-accent border border-accent/20",
    stats: { techStack: 95, availability: 80, modality: 100 },
    skills: ["React", "Next.js", "Redux"],
  },
  {
    id: "c3",
    projectId: "p2",
    name: "Cata Pereira",
    role: "UI Designer",
    initials: "CP",
    matchScore: 78,
    avatarBg: "bg-warning/10 text-warning border border-warning/20",
    stats: { techStack: 70, availability: 90, modality: 75 },
    skills: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    id: "c4",
    projectId: "p2",
    name: "Liam Neeson",
    role: "UX Researcher",
    initials: "LN",
    matchScore: 85,
    avatarBg: "bg-magenta/10 text-magenta border border-magenta/20",
    stats: { techStack: 80, availability: 90, modality: 85 },
    skills: ["Figma", "Research", "Wireframes"],
  },
  {
    id: "c5",
    projectId: "p3",
    name: "Sofía Rodríguez",
    role: "Backend Developer Jr.",
    initials: "SR",
    matchScore: 82,
    avatarBg: "bg-warning/10 text-warning border border-warning/20",
    stats: { techStack: 78, availability: 50, modality: 96 },
    skills: ["Node.js", "PostgreSQL", "Docker"],
  },
  {
    id: "c6",
    projectId: "p3",
    name: "Mateo García",
    role: "Backend Engineer",
    initials: "MG",
    matchScore: 88,
    avatarBg: "bg-secondary/10 text-secondary border border-secondary/20",
    stats: { techStack: 90, availability: 80, modality: 95 },
    skills: ["Node.js", "NestJS", "Express"],
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "a1",
    juniorName: "Lucas Rivas",
    initials: "LR",
    avatarColor: "bg-accent/15 text-accent border border-accent/20",
    projectId: "p1",
    projectName: "Frontend Senior React",
    matchScore: 94,
    status: "reviewed",
  },
  {
    id: "a2",
    juniorName: "Cata Pereira",
    initials: "CP",
    avatarColor: "bg-warning/10 text-warning border border-warning/20",
    projectId: "p2",
    projectName: "UX/UI Designer Sprint",
    matchScore: 78,
    status: "pending",
  },
  {
    id: "a3",
    juniorName: "Mateo García",
    initials: "MG",
    avatarColor: "bg-secondary/10 text-secondary border border-secondary/20",
    projectId: "p3",
    projectName: "Backend Node.js Architect",
    matchScore: 88,
    status: "interview",
  },
  {
    id: "a4",
    juniorName: "Sofía Rodríguez",
    initials: "SR",
    avatarColor: "bg-warning/10 text-warning border border-warning/20",
    projectId: "p3",
    projectName: "Backend Node.js Architect",
    matchScore: 82,
    status: "pending",
  },
  {
    id: "a5",
    juniorName: "Alejandro Martínez",
    initials: "AM",
    avatarColor: "bg-primary/10 text-primary border border-primary/20",
    projectId: "p1",
    projectName: "Frontend Senior React",
    matchScore: 98,
    status: "interview",
  },
];

export function PerfilEmpresa() {
  const t = useTranslations("empresa_dashboard");
  const tMatches = useTranslations("matches_empresa");
  const router = useRouter();
  const locale = useLocale();
  const [logoError, setLogoError] = useState(false);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [candidates] = useState<CandidateMatch[]>(INITIAL_CANDIDATES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("p1");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState<"active" | "paused">("active");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleEditProfile = () => {
    triggerToast(tMatches("toast_profile_edit"));
  };

  const handleViewProjects = () => {
    document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId((prev) => (prev === projectId ? null : projectId));
    router.push(`/${locale}/dashboard`);
  };

  const handleOpenModal = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewProjectModalOpen(false);
    setNewProjectName("");
    setNewProjectStatus("active");
  };

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const colorClass: string = BORDER_COLOR_CYCLE[projects.length % BORDER_COLOR_CYCLE.length] ?? "border-l-4 border-accent";
    const newId = `p-${Date.now()}`;

    const newProj: Project = {
      id: newId,
      title: newProjectName.trim(),
      publishedDays: 0,
      appliedCount: 0,
      status: newProjectStatus,
      colorClass,
    };

    setProjects((prev) => [...prev, newProj]);
    triggerToast(t("new_project_modal.success_message"));
    handleCloseModal();
    setSelectedProjectId(newId);
  };

  const handleAcceptApplication = (appId: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "accepted" } : app))
    );
    triggerToast(t("notifications.accepted", { name }));
  };

  const handleRejectApplication = (appId: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "rejected" } : app))
    );
    triggerToast(t("notifications.rejected", { name }));
  };

  const stats = useMemo(() => {
    const activeCount = projects.filter((p) => p.status === "active").length;
    const totalApplications = applications.length;
    const reviewedCount = applications.filter(
      (a) => a.status === "reviewed" || a.status === "accepted" || a.status === "rejected"
    ).length;
    const pendingMatchCount = applications.filter(
      (a) => a.status === "pending" || a.status === "interview"
    ).length;

    return {
      activeCount,
      totalApplications,
      reviewedCount,
      pendingMatchCount,
    };
  }, [projects, applications]);

  const filteredCandidates = useMemo(() => {
    if (!selectedProjectId) return candidates;
    return candidates.filter((c) => c.projectId === selectedProjectId);
  }, [candidates, selectedProjectId]);

  const filteredApplications = useMemo(() => {
    if (!selectedProjectId) return applications;
    return applications.filter((a) => a.projectId === selectedProjectId);
  }, [applications, selectedProjectId]);

  const getStatusText = (status: Application["status"]) => {
    switch (status) {
      case "reviewed":
        return t("applications.status.reviewed");
      case "pending":
        return t("applications.status.pending");
      case "interview":
        return t("applications.status.interview");
      case "accepted":
        return t("applications.status.accepted");
      case "rejected":
        return t("applications.status.rejected");
    }
  };

  const getStatusVariant = (status: Application["status"]) => {
    switch (status) {
      case "reviewed":
        return "success";
      case "pending":
        return "warning";
      case "interview":
        return "secondary";
      case "accepted":
        return "success";
      case "rejected":
        return "magenta";
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-accent" />
          <p className="font-body text-sm font-semibold text-ink-strong">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-ink-subtle hover:text-ink-strong"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* --- HERO BANNER (Brand Expresivo adapts for Empresa) --- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-primary p-6 text-white shadow-[var(--shadow-soft)] md:p-10">
        <FwdGeoBackdrop />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* Foto de la empresa (Logo) */}
              <div className="relative size-20 md:size-24 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[var(--shadow-soft)] flex items-center justify-center">
                {!logoError ? (
                  <Image
                    src="/company_logo.png"
                    alt="Logo Empresa"
                    width={96}
                    height={96}
                    className="size-full object-contain p-2"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-secondary font-heading text-2xl font-extrabold text-white">
                    FWD
                  </div>
                )}
              </div>

              {/* Título y Descripción */}
              <div className="space-y-2">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {t("label_empresa")}
                </span>
                <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3.5xl uppercase leading-none">
                  {t("title")}
                  <span className="text-primary" aria-hidden="true">
                    .
                  </span>
                </h1>
                <p className="font-body text-sm text-white/80 max-w-2xl leading-relaxed">
                  {t("company_desc")}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-body text-xs font-semibold text-white">
                    {t("tag_socio")}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-body text-xs font-semibold text-white">
                    {t("tag_location")}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-body text-xs font-semibold text-white">
                    {t("tag_size")}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 shrink-0 self-start md:self-center">
              <Button
                variant="outline"
                onClick={handleEditProfile}
                className="h-10 rounded-full border-white/20 px-5 text-sm font-bold text-white hover:bg-white/10 hover:text-white"
              >
                {t("edit_profile_btn")}
              </Button>
              <Button
                variant="default"
                onClick={handleViewProjects}
                className="h-10 rounded-full bg-highlight px-5 text-sm font-bold text-secondary hover:bg-highlight/90"
              >
                {t("view_projects_btn")}
              </Button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex h-24 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-colors hover:bg-white/10">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("stats.active_projects")}
              </span>
              <span className="font-heading text-3xl font-extrabold text-white">
                {stats.activeCount}
              </span>
            </div>

            <div className="flex h-24 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-colors hover:bg-white/10">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("stats.applications")}
              </span>
              <span className="font-heading text-3xl font-extrabold text-white">
                {stats.totalApplications}
              </span>
            </div>

            <div className="flex h-24 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-colors hover:bg-white/10">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("stats.reviewed")}
              </span>
              <span className="font-heading text-3xl font-extrabold text-white">
                {stats.reviewedCount}
              </span>
            </div>

            <div className="flex h-24 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-colors hover:bg-white/10">
              <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("stats.pending_match")}
              </span>
              <span className="font-heading text-3xl font-extrabold text-white">
                {stats.pendingMatchCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- MIDDLE INTERACTIVE BLOCK --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Tus Proyectos */}
        <section id="projects-section" className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
              {t("projects.title")}
              <span className="text-primary">.</span>
            </h2>
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-xs bg-primary text-primary-foreground font-semibold"
              onClick={handleOpenModal}
            >
              <Plus className="size-3.5" />
              <span>{t("projects.new_btn")}</span>
            </Button>
          </div>

          <div className="space-y-3">
            {projects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={`w-full text-left rounded-2xl border p-4 bg-surface shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] ${project.colorClass} ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 scale-[1.01]"
                      : "border-border hover:border-border-strong hover:scale-[1.005]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-heading text-base font-bold text-ink-strong leading-snug">
                        {project.title}
                      </h3>
                      <p className="font-body text-xs text-ink-muted">
                        {project.status === "paused"
                          ? t("projects.paused")
                          : t("projects.published_days", { days: project.publishedDays })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block font-heading text-lg font-bold text-ink-strong">
                        {project.appliedCount || 0}
                      </span>
                      <span className="block font-body text-[9px] font-bold text-ink-subtle uppercase tracking-wider">
                        {t("projects.label_applied")}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Column: Compatibilidad (Matches) */}
        <section className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
              {t("compatibility.title")}
              <span className="text-primary">.</span>
            </h2>
            <p className="font-body text-xs text-ink-muted">
              {t("compatibility.subtitle")}
            </p>
          </div>

          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] hover:border-border-strong"
                >
                  <div className="space-y-4">
                    {/* Header candidate */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-11 shrink-0 items-center justify-center rounded-full font-body text-sm font-bold uppercase ${candidate.avatarBg}`}
                        >
                          {candidate.initials}
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-ink-strong">
                            {candidate.name}
                          </h3>
                          <p className="font-body text-xs text-ink-muted">{candidate.role}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`block font-heading text-lg font-extrabold leading-none ${
                            candidate.matchScore >= 90
                              ? "text-accent"
                              : candidate.matchScore >= 70
                              ? "text-warning"
                              : "text-magenta"
                          }`}
                        >
                          {candidate.matchScore}%
                        </span>
                        <span className="font-body text-[8px] font-bold text-ink-subtle tracking-wider uppercase">
                          {t("compatibility.match_total")}
                        </span>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2.5 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-ink-muted">
                          <span>{t("compatibility.tech_stack")}</span>
                          <span className="text-ink-strong">{candidate.stats.techStack}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all duration-[var(--duration-slow)]"
                            style={{ width: `${candidate.stats.techStack}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-ink-muted">
                          <span>{t("compatibility.availability")}</span>
                          <span className="text-ink-strong">{candidate.stats.availability}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                          <div
                            className="h-1.5 rounded-full bg-accent transition-all duration-[var(--duration-slow)]"
                            style={{ width: `${candidate.stats.availability}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-ink-muted">
                          <span>{t("compatibility.modality")}</span>
                          <span className="text-ink-strong">{candidate.stats.modality}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                          <div
                            className="h-1.5 rounded-full bg-secondary transition-all duration-[var(--duration-slow)]"
                            style={{ width: `${candidate.stats.modality}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-surface-sunken border border-border px-2 py-1 font-body text-[10px] font-medium text-ink"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center">
              <FolderKanban className="size-8 text-ink-subtle mb-2" />
              <p className="font-body text-sm font-semibold text-ink-muted">
                {t("compatibility.empty_state")}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* --- BOTTOM SECTION: QUIENES SE POSTULARON (Table) --- */}
      <section className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-heading text-lg font-bold tracking-tight text-ink-strong">
            {t("applications.title")}
            <span className="text-primary">.</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          {filteredApplications.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-sunken/50 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-6 py-3.5">{t("applications.table.junior")}</th>
                  <th className="px-6 py-3.5">{t("applications.table.project")}</th>
                  <th className="px-6 py-3.5 text-center">{t("applications.table.match")}</th>
                  <th className="px-6 py-3.5 text-center">{t("applications.table.status")}</th>
                  <th className="px-6 py-3.5 text-right">{t("applications.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-body text-sm">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="transition-colors hover:bg-surface-sunken/20 duration-[var(--duration-fast)]"
                  >
                    {/* Junior info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full font-body text-xs font-bold uppercase ${app.avatarColor}`}
                        >
                          {app.initials}
                        </div>
                        <span className="font-semibold text-ink-strong">{app.juniorName}</span>
                      </div>
                    </td>

                    {/* Project title */}
                    <td className="px-6 py-4 font-normal text-ink">{app.projectName}</td>

                    {/* Match total */}
                    <td className="px-6 py-4 text-center font-semibold">
                      <span
                        className={
                          app.matchScore >= 90
                            ? "text-accent"
                            : app.matchScore >= 70
                            ? "text-warning"
                            : "text-magenta"
                        }
                      >
                        {app.matchScore}%
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 text-center">
                      <StatusPill
                        label={getStatusText(app.status) ?? ""}
                        variant={getStatusVariant(app.status)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3.5">
                        <button
                          type="button"
                          className="font-body text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
                        >
                          <Eye className="size-3.5" />
                          <span>{t("applications.actions.view")}</span>
                        </button>

                        {app.status !== "accepted" && app.status !== "rejected" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAcceptApplication(app.id, app.juniorName)}
                              className="font-body text-xs font-bold text-accent hover:opacity-80 transition-opacity"
                            >
                              {t("applications.actions.accept")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectApplication(app.id, app.juniorName)}
                              className="font-body text-xs font-bold text-magenta hover:opacity-80 transition-opacity"
                            >
                              {t("applications.actions.reject")}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-ink-subtle flex items-center gap-1">
                            <Check className="size-3.5 text-ink-muted" />
                            <span>{t("applications.actions.completed")}</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
              <FolderKanban className="size-8 text-ink-subtle mb-2" />
              <p className="font-body text-sm font-semibold text-ink-muted">
                {t("applications.empty_state")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- NEW PROJECT MODAL (Interactive Mock) --- */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-[var(--duration-fast)]">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] animate-in scale-in duration-[var(--duration-base)] ease-[var(--ease-out)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold text-ink-strong">
                {t("new_project_modal.title")}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label htmlFor="new-project-name" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("new_project_modal.name_label")}
                </label>
                <input
                  id="new-project-name"
                  type="text"
                  required
                  placeholder={t("new_project_modal.placeholder")}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-project-status" className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("new_project_modal.status_label")}
                </label>
                <select
                  id="new-project-status"
                  value={newProjectStatus}
                  onChange={(e) =>
                    setNewProjectStatus(e.target.value as "active" | "paused")
                  }
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">{t("new_project_modal.active")}</option>
                  <option value="paused">{t("new_project_modal.paused")}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="h-9 px-4 text-sm font-semibold border-border hover:bg-surface-sunken"
                >
                  {t("new_project_modal.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="h-9 px-4 text-sm font-semibold bg-primary text-white hover:bg-primary/85"
                >
                  {t("new_project_modal.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

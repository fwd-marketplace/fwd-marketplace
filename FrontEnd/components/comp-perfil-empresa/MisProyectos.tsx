"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Code2, FileText, Image as ImageIcon, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { InsightSection } from "@/components/ui/insight-section";
import { cn } from "@/lib/utils";

interface ProjectDetail {
  id: string;
  title: string;
  status: "active" | "paused";
  publishedDate: string;
  modality: string;
  level: string;
  budgetRange: string;
  objective: string;
  requirements: string[];
  deliverables: Array<{
    id: string;
    icon: "code" | "docs";
    title: string;
    description: string;
  }>;
  techStack: Array<{
    name: string;
    colorClass: string;
  }>;
  metrics: {
    talentMatch: number;
    activeApplicants: number;
  };
}

const INITIAL_PROJECT: ProjectDetail = {
  id: "proj-1",
  title: "Desarrollo de Interfaz de Análisis Predictivo.",
  status: "active",
  publishedDate: "14 de Oct, 2023",
  modality: "Remoto",
  level: "Senior",
  budgetRange: "$2.500 - $3.200 USD",
  objective:
    "Diseñar y desarrollar una interfaz de usuario avanzada para nuestra herramienta de análisis predictivo interna. El objetivo es permitir que los científicos de datos visualicen modelos de regresión complejos de manera intuitiva, facilitando la toma de decisiones basada en datos para el departamento de logística industrial. La interfaz debe ser receptiva, con alta fidelidad gráfica y optimizada para la interpretación rápida de KPIs críticos.",
  requirements: [
    "Implementación de Dashboards interactivos con D3.js o Recharts.",
    "Sistema de filtrado dinámico por fecha, región y categoría de producto.",
    "Integración con API REST para consumo de microservicios de predicción.",
    "Módulo de exportación de reportes en PDF y formato CSV optimizado.",
  ],
  deliverables: [
    {
      id: "del-1",
      icon: "code",
      title: "Código Fuente",
      description: "Repositorio Git documentado",
    },
    {
      id: "del-2",
      icon: "docs",
      title: "Documentación",
      description: "Guía de arquitectura y uso",
    },
  ],
  techStack: [
    { name: "React 18", colorClass: "bg-primary/10 text-primary" },
    { name: "TypeScript", colorClass: "bg-secondary/10 text-secondary" },
    { name: "TailwindCSS", colorClass: "bg-accent/10 text-accent" },
    { name: "Node.js", colorClass: "bg-magenta/10 text-magenta" },
    { name: "PostgreSQL", colorClass: "bg-warning/10 text-warning" },
  ],
  metrics: {
    talentMatch: 94,
    activeApplicants: 18,
  },
};

type TabType = "project" | "mockups" | "applications";

export function MisProyectos() {
  const t = useTranslations("mis_proyectos");
  const [project, setProject] = useState<ProjectDetail>(INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState<TabType>("project");
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editModality, setEditModality] = useState(project.modality);
  const [editBudget, setEditBudget] = useState(project.budgetRange);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleStatus = () => {
    const newStatus = project.status === "active" ? "paused" : "active";
    setProject((prev) => ({ ...prev, status: newStatus }));
    triggerToast(
      newStatus === "paused"
        ? t("notifications.paused")
        : t("notifications.reactivated")
    );
  };

  const handleOpenEdit = () => {
    setEditTitle(project.title);
    setEditModality(project.modality);
    setEditBudget(project.budgetRange);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setProject((prev) => ({
      ...prev,
      title: editTitle,
      modality: editModality,
      budgetRange: editBudget,
    }));
    setIsEditModalOpen(false);
    triggerToast(t("edit_modal.success"));
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

      {/* --- HERO BANNER --- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-primary p-6 text-white shadow-[var(--shadow-soft)] md:p-10">
        <FwdGeoBackdrop />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusPill 
                label={project.status === "active" ? t("status_active") : t("status_paused")} 
                variant={project.status === "active" ? "new-talent" : "secondary"} 
              />
              <span className="font-body text-sm font-medium text-white/80">
                • {t("published_on", { date: project.publishedDate })}
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl text-white max-w-3xl">
              {project.title.endsWith(".") ? project.title.slice(0, -1) : project.title}
              <span className="text-primary" aria-hidden="true">.</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 font-body text-sm font-medium text-white/80">
              <span>{t("modality_label")}: {project.modality}</span>
              <span>•</span>
              <span>{t("level_label")}: {project.level}</span>
              <span>•</span>
              <span>{t("budget_label")}: {project.budgetRange}</span>
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={handleOpenEdit}
            >
              {t("edit_btn")}
            </Button>
            <Button
              variant="secondary"
              className="bg-primary/85 text-white hover:bg-primary/75 border-transparent shadow-none"
              onClick={handleToggleStatus}
            >
              {project.status === "active" ? t("pause_btn") : t("reactivate_btn")}
            </Button>
          </div>
        </div>
      </section>

      {/* --- TABS --- */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {(["project", "mockups", "applications"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-3 font-body text-sm font-bold transition-colors",
                activeTab === tab ? "text-primary" : "text-ink-muted hover:text-ink-strong"
              )}
            >
              {t(`tabs.${tab}`)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB CONTENT: PROJECT --- */}
      {activeTab === "project" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-8">
            <div className="space-y-3">
              <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
                {t("objective_title")}
              </h2>
              <p className="font-body text-sm text-ink leading-relaxed">
                {project.objective}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
                {t("scope_title")}
              </h2>
              <ul className="space-y-3">
                {project.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                    <span className="font-body text-sm text-ink">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
                {t("deliverables_title")}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {project.deliverables.map((del) => (
                  <div
                    key={del.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken">
                      {del.icon === "code" ? (
                        <Code2 className="size-5 text-primary" />
                      ) : (
                        <FileText className="size-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-ink-strong">
                        {del.title}
                      </h3>
                      <p className="font-body text-xs text-ink-muted">
                        {del.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-4">
            {/* Tech Stack */}
            <div className="space-y-3">
              <h3 className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {t("stack_title")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className={cn(
                      "rounded-lg px-2.5 py-1 font-body text-xs font-semibold",
                      tech.colorClass
                    )}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <InsightSection title={t("metrics_title")}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between font-body text-xs font-semibold">
                    <span className="text-ink-strong">{t("metrics_talent_match")}</span>
                    <span className="text-primary">{project.metrics.talentMatch}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                    <div
                      className="h-1.5 rounded-full bg-primary/85 transition-all duration-[var(--duration-slow)]"
                      style={{ width: `${project.metrics.talentMatch}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-body text-xs font-semibold">
                    <span className="text-ink-strong">{t("metrics_active_applicants")}</span>
                    <span className="text-secondary">{project.metrics.activeApplicants}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                    <div
                      className="h-1.5 rounded-full bg-secondary transition-all duration-[var(--duration-slow)]"
                      style={{ width: `50%` }}
                    />
                  </div>
                </div>
              </div>
            </InsightSection>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MOCKUPS (Empty State) --- */}
      {activeTab === "mockups" && (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface-sunken/50 p-6 text-center">
          <ImageIcon className="size-10 text-ink-subtle mb-3" />
          <p className="font-body text-sm font-semibold text-ink-muted">
            {t("mockups_empty")}
          </p>
        </div>
      )}

      {/* --- TAB CONTENT: APPLICATIONS (Empty State) --- */}
      {activeTab === "applications" && (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface-sunken/50 p-6 text-center">
          <Users className="size-10 text-ink-subtle mb-3" />
          <p className="font-body text-sm font-semibold text-ink-muted">
            {t("applications_empty")}
          </p>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-[var(--duration-fast)]">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] animate-in scale-in duration-[var(--duration-base)] ease-[var(--ease-out)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold text-ink-strong">
                {t("edit_modal.title")}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("edit_modal.name_label")}
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("edit_modal.modality_label")}
                </label>
                <input
                  type="text"
                  required
                  value={editModality}
                  onChange={(e) => setEditModality(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t("edit_modal.budget_label")}
                </label>
                <input
                  type="text"
                  required
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 px-4 text-sm font-semibold border-border hover:bg-surface-sunken"
                >
                  {t("edit_modal.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="h-9 px-4 text-sm font-semibold bg-primary text-white hover:bg-primary/85"
                >
                  {t("edit_modal.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

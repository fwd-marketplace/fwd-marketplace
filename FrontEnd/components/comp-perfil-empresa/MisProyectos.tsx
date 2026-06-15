"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Code2,
  FileText,
  Image as ImageIcon,
  Users,
  X,
  Search,
  Filter,
  ArrowRight,
  FolderOpen
} from "lucide-react";
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

const INITIAL_PROJECTS: ProjectDetail[] = [
  {
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
  },
  {
    id: "proj-2",
    title: "Sistema de Sincronización para E-commerce Mobile.",
    status: "active",
    publishedDate: "05 de Nov, 2023",
    modality: "Híbrido",
    level: "Semi-Senior",
    budgetRange: "$1.800 - $2.400 USD",
    objective:
      "Desarrollar un servicio middleware robusto para sincronizar el inventario local en tiempo real con múltiples plataformas de comercio electrónico (Shopify, WooCommerce y MercadoLibre). El sistema debe resolver conflictos transaccionales y manejar colas de mensajes fallidas mediante reintentos exponenciales con jitter.",
    requirements: [
      "Diseño de arquitectura dirigida por eventos con Redis y RabbitMQ.",
      "Implementación de webhooks optimizados con firma criptográfica.",
      "Pruebas de carga para soportar al menos 500 peticiones concurrentes por segundo.",
    ],
    deliverables: [
      {
        id: "del-3",
        icon: "code",
        title: "Middleware Engine",
        description: "Servicio Node/TS dockerizado",
      },
      {
        id: "del-4",
        icon: "docs",
        title: "Dashboard de Control",
        description: "UI básica de logs de sync",
      },
    ],
    techStack: [
      { name: "TypeScript", colorClass: "bg-secondary/10 text-secondary" },
      { name: "Node.js", colorClass: "bg-magenta/10 text-magenta" },
      { name: "Redis", colorClass: "bg-magenta/10 text-magenta" },
      { name: "Docker", colorClass: "bg-primary/10 text-primary" },
    ],
    metrics: {
      talentMatch: 88,
      activeApplicants: 12,
    },
  },
  {
    id: "proj-3",
    title: "Refactorización de Portal Corporativo y Accesibilidad.",
    status: "paused",
    publishedDate: "28 de Ago, 2023",
    modality: "Presencial",
    level: "Junior",
    budgetRange: "$1.000 - $1.400 USD",
    objective:
      "Rediseñar el front-end del portal web institucional para cumplir con las normativas WCAG 2.1 AA. Se requiere mejorar la accesibilidad móvil, optimizar el bundle de javascript para carga en redes móviles lentas y reestructurar semánticamente el HTML para una lectura correcta por lectores de pantalla.",
    requirements: [
      "Auditoría completa de accesibilidad con Lighthouse y Axe Core.",
      "Migración de componentes legacy inline a Tailwind CSS modular.",
      "Navegación 100% controlable por teclado con foco visible.",
    ],
    deliverables: [
      {
        id: "del-5",
        icon: "code",
        title: "Portal Accesible",
        description: "Front-end SPA optimizado",
      },
      {
        id: "del-6",
        icon: "docs",
        title: "Reporte de Accesibilidad",
        description: "Certificación WCAG inicial",
      },
    ],
    techStack: [
      { name: "React 18", colorClass: "bg-primary/10 text-primary" },
      { name: "TailwindCSS", colorClass: "bg-accent/10 text-accent" },
      { name: "HTML5/CSS3", colorClass: "bg-warning/10 text-warning" },
    ],
    metrics: {
      talentMatch: 75,
      activeApplicants: 5,
    },
  },
  {
    id: "proj-4",
    title: "Migración de Base de Datos y Pipeline ETL.",
    status: "active",
    publishedDate: "12 de Ene, 2024",
    modality: "Remoto",
    level: "Semi-Senior",
    budgetRange: "$3.000 - $3.800 USD",
    objective:
      "Migrar de una base de datos MySQL local a una arquitectura serverless en Supabase/PostgreSQL. Construir un pipeline ETL para transformar datos históricos de transacciones sin perder consistencia, saneando registros duplicados y encriptando datos personales sensibles en tránsito.",
    requirements: [
      "Scripting de migración SQL optimizado para procesamiento por lotes.",
      "Configuración de políticas de seguridad a nivel de fila (RLS).",
      "Validaciones cruzadas para asegurar un 100% de consistencia post-migración.",
    ],
    deliverables: [
      {
        id: "del-7",
        icon: "code",
        title: "Pipeline ETL",
        description: "Scripts JS/SQL automatizados",
      },
      {
        id: "del-8",
        icon: "docs",
        title: "Mapeo de Datos",
        description: "Documento de transformación",
      },
    ],
    techStack: [
      { name: "PostgreSQL", colorClass: "bg-warning/10 text-warning" },
      { name: "Supabase", colorClass: "bg-accent/10 text-accent" },
      { name: "Node.js", colorClass: "bg-magenta/10 text-magenta" },
    ],
    metrics: {
      talentMatch: 91,
      activeApplicants: 14,
    },
  }
];

type TabType = "project" | "mockups" | "applications";

export function MisProyectos() {
  const t = useTranslations("mis_proyectos");
  
  // State for all projects and selected project for detail modal
  const [projects, setProjects] = useState<ProjectDetail[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("project");
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Edit project state (within details modal context)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editModality, setEditModality] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Find currently active project detail
  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Handler for toggle status (updates status of the active project in state)
  const handleToggleStatus = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const newStatus = p.status === "active" ? "paused" : "active";
          triggerToast(
            newStatus === "paused"
              ? t("notifications.paused")
              : t("notifications.reactivated")
          );
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleOpenEdit = (project: ProjectDetail) => {
    setEditTitle(project.title);
    setEditModality(project.modality);
    setEditBudget(project.budgetRange);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            title: editTitle,
            modality: editModality,
            budgetRange: editBudget,
          };
        }
        return p;
      })
    );
    setIsEditModalOpen(false);
    triggerToast(t("edit_modal.success"));
  };

  // Get unique filter options dynamically from data
  const modalities = ["all", ...Array.from(new Set(projects.map((p) => p.modality)))];
  const levels = ["all", ...Array.from(new Set(projects.map((p) => p.level)))];

  // Filtering logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : project.status === statusFilter;
    const matchesModality =
      modalityFilter === "all" ? true : project.modality === modalityFilter;
    const matchesLevel =
      levelFilter === "all" ? true : project.level === levelFilter;

    return matchesSearch && matchesStatus && matchesModality && matchesLevel;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setModalityFilter("all");
    setLevelFilter("all");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] animate-in slide-in-from-bottom-5">
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

      {/* --- FILTER BAR --- */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Filter className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-ink-strong uppercase tracking-wide">
              {t("filters.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("filters.search_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken pl-10 pr-4 py-2 font-body text-sm text-ink-strong outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col gap-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.status_all")}</option>
                <option value="active">{t("filters.status_active")}</option>
                <option value="paused">{t("filters.status_paused")}</option>
              </select>
            </div>

            {/* Modality Dropdown */}
            <div className="flex flex-col gap-1">
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.modality_all")}</option>
                {modalities.filter(m => m !== "all").map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Level Dropdown */}
            <div className="flex flex-col gap-1">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-sunken px-3.5 py-2 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t("filters.level_all")}</option>
                {levels.filter(l => l !== "all").map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== "all" || modalityFilter !== "all" || levelFilter !== "all") && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-8 rounded-full border-primary/20 text-primary hover:bg-primary/5 text-xs font-semibold"
              >
                {t("filters.clear")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --- GRID OF CARDS --- */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                setSelectedProjectId(project.id);
                setActiveTab("project"); // Reset tab on open
              }}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)] hover:border-primary/40 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-elevated)] cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusPill
                    label={project.status === "active" ? t("status_active") : t("status_paused")}
                    variant={project.status === "active" ? "new-talent" : "secondary"}
                  />
                  <span className="font-body text-xs font-medium text-ink-muted">
                    {project.publishedDate}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-ink-strong group-hover:text-primary transition-colors duration-[var(--duration-fast)]">
                    {project.title.endsWith(".") ? project.title.slice(0, -1) : project.title}
                    <span className="text-primary" aria-hidden="true">.</span>
                  </h3>
                  <p className="font-body text-sm text-ink-muted line-clamp-3 leading-relaxed">
                    {project.objective}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech.name}
                      className={cn(
                        "rounded-lg px-2 py-0.5 font-body text-[10px] font-semibold",
                        tech.colorClass
                      )}
                    >
                      {tech.name}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="rounded-lg bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-semibold text-ink-muted">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
                <div className="flex items-center gap-4 text-xs font-semibold text-ink-muted">
                  <div className="flex items-center gap-1">
                    <Users className="size-4 text-secondary" />
                    <span>{project.metrics.activeApplicants} {t("tabs.applications")}</span>
                  </div>
                  <span>•</span>
                  <span>{project.modality}</span>
                </div>
                
                <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-[var(--duration-fast)]">
                  {t("filters.view_details")}
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <FolderOpen className="size-12 text-ink-muted mb-4" />
          <h3 className="font-heading text-lg font-bold text-ink-strong mb-1">
            {t("filters.empty_title")}
          </h3>
          <p className="font-body text-sm text-ink-muted max-w-md">
            {t("filters.empty_desc")}
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4 border-primary/20 text-primary hover:bg-primary/5 rounded-full font-semibold"
          >
            {t("filters.clear")}
          </Button>
        </div>
      )}

      {/* --- DETAIL MODAL (FULLSCREEN TABS STYLE) --- */}
      {selectedProjectId && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm transition-opacity duration-[var(--duration-fast)] ease-out animate-in fade-in">
          <div className="relative flex h-full w-full flex-col bg-canvas sm:rounded-3xl border border-border shadow-[var(--shadow-elevated)] max-w-5xl sm:h-[90vh] overflow-hidden animate-in zoom-in-95 duration-[var(--duration-base)] ease-[var(--ease-out)]">
            
            {/* Modal header with close button */}
            <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                {activeProject.id.toUpperCase()} • Detalle de Proyecto
              </span>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* --- HERO BANNER (REPLICATED FROM CURRENT COMPONENT) --- */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-primary p-6 text-white shadow-[var(--shadow-soft)] md:p-8">
                <FwdGeoBackdrop />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <StatusPill 
                        label={activeProject.status === "active" ? t("status_active") : t("status_paused")} 
                        variant={activeProject.status === "active" ? "new-talent" : "secondary"} 
                      />
                      <span className="font-body text-sm font-medium text-white/80">
                        • {t("published_on", { date: activeProject.publishedDate })}
                      </span>
                    </div>

                    <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl text-white max-w-2xl">
                      {activeProject.title.endsWith(".") ? activeProject.title.slice(0, -1) : activeProject.title}
                      <span className="text-primary" aria-hidden="true">.</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 font-body text-xs font-medium text-white/80">
                      <span>{t("modality_label")}: {activeProject.modality}</span>
                      <span>•</span>
                      <span>{t("level_label")}: {activeProject.level}</span>
                      <span>•</span>
                      <span>{t("budget_label")}: {activeProject.budgetRange}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <Button
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => handleOpenEdit(activeProject)}
                    >
                      {t("edit_btn")}
                    </Button>
                    <Button
                      variant="secondary"
                      className="bg-primary/85 text-white hover:bg-primary/75 border-transparent shadow-none"
                      onClick={() => handleToggleStatus(activeProject.id)}
                    >
                      {activeProject.status === "active" ? t("pause_btn") : t("reactivate_btn")}
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
                        {activeProject.objective}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
                        {t("scope_title")}
                      </h2>
                      <ul className="space-y-3">
                        {activeProject.requirements.map((req, i) => (
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
                        {activeProject.deliverables.map((del) => (
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
                        {activeProject.techStack.map((tech) => (
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
                            <span className="text-primary">{activeProject.metrics.talentMatch}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                            <div
                              className="h-1.5 rounded-full bg-primary/85 transition-all duration-[var(--duration-slow)]"
                              style={{ width: `${activeProject.metrics.talentMatch}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between font-body text-xs font-semibold">
                            <span className="text-ink-strong">{t("metrics_active_applicants")}</span>
                            <span className="text-secondary">{activeProject.metrics.activeApplicants}</span>
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
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-sunken/50 p-6 text-center">
                  <ImageIcon className="size-10 text-ink-subtle mb-3" />
                  <p className="font-body text-sm font-semibold text-ink-muted">
                    {t("mockups_empty")}
                  </p>
                </div>
              )}

              {/* --- TAB CONTENT: APPLICATIONS (Empty State) --- */}
              {activeTab === "applications" && (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-sunken/50 p-6 text-center">
                  <Users className="size-10 text-ink-subtle mb-3" />
                  <p className="font-body text-sm font-semibold text-ink-muted">
                    {t("applications_empty")}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (UPDATED FOR INDIVIDUAL PROJECT context) --- */}
      {isEditModalOpen && activeProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-[var(--duration-fast)]">
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

            <form onSubmit={(e) => handleSaveEdit(e, activeProject.id)} className="space-y-4 pt-4">
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

"use client";

import React, { useState } from "react";
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
import { StudentProfile, Activity, Application, ApplicationStats } from "@/app/[locale]/(public)/Perfil_Estudiante/types";

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

const getCategoryIcon = (category: Application["category"]) => {
  switch (category) {
    case "ux":
      return <Layers className="w-5 h-5 text-primary" />;
    case "data":
      return <BarChart2 className="w-5 h-5 text-warning" />;
    case "dev":
      return <Code2 className="w-5 h-5 text-accent" />;
    case "design":
      return <Palette className="w-5 h-5 text-magenta" />;
    default:
      return <Briefcase className="w-5 h-5 text-ink-muted" />;
  }
};

const getCategoryBg = (category: Application["category"]) => {
  switch (category) {
    case "ux":
      return "bg-primary/10";
    case "data":
      return "bg-warning/10";
    case "dev":
      return "bg-accent/10";
    case "design":
      return "bg-magenta/10";
    default:
      return "bg-surface-sunken";
  }
};

const getStatusStyles = (status: Application["status"]) => {
  switch (status) {
    case "enviada":
      return {
        strip: "bg-primary",
        badge: "bg-primary/10 text-primary border-primary/20",
        label: "Enviada",
      };
    case "vista":
      return {
        strip: "bg-warning",
        badge: "bg-warning/10 text-warning border-warning/20",
        label: "Vista",
      };
    case "en_proceso":
      return {
        strip: "bg-secondary",
        badge: "bg-secondary/10 text-secondary border-secondary/20",
        label: "En proceso",
      };
    case "aceptada":
      return {
        strip: "bg-accent",
        badge: "bg-accent/15 text-accent border-accent/20",
        label: "Aceptada",
      };
    case "rechazada":
      return {
        strip: "bg-magenta",
        badge: "bg-magenta/10 text-magenta border-magenta/20",
        label: "Rechazada",
      };
    default:
      return {
        strip: "bg-ink-subtle",
        badge: "bg-surface-sunken text-ink-muted border-border",
        label: "Desconocido",
      };
  }
};

const renderMessage = (message: string) => {
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
};

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
  // Navigation State
  const [activeTab, setActiveTab] = useState<"perfil" | "trabajo" | "postulaciones" | "notificaciones" | "sugeridos">("perfil");

  // Filter state for applications
  const [filterStatus, setFilterStatus] = useState<"todas" | Application["status"]>("todas");

  // Profile data state
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [applications] = useState<Application[]>(initialApplications);

  // Edit Personal Info State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editBio, setEditBio] = useState(profile.bio);

  // Edit Hero Info State
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [editRole, setEditRole] = useState(profile.role);
  const [editProgram, setEditProgram] = useState(profile.program);

  // Stack State
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Handlers for Personal Info Edit
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      location: editLocation,
      email: editEmail,
      bio: editBio,
    }));
    setIsEditingPersonal(false);

    // Add activity log
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      description: "Actualizó su información personal de contacto",
      timestamp: "Hace un momento",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handlers for Hero Edit
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      role: editRole,
      program: editProgram,
    }));
    setIsEditingHero(false);
  };

  // Handlers for Stack Edit
  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));

    // Add activity log
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      description: `Eliminó la habilidad '${skillToRemove}' de su stack`,
      timestamp: "Hace un momento",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
      setIsAddingSkill(false);

      // Add activity log
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        description: `Agregó la habilidad '${newSkill.trim()}' a su stack`,
        timestamp: "Hace un momento",
      };
      setActivities((prev) => [newAct, ...prev]);
    }
  };

  // Mock Notifications — agrupadas por fecha
  const mockNotificationsHoy = [
    {
      id: "not-1",
      type: "oportunidad" as const,
      category: "NUEVA OPORTUNIDAD",
      time: "10:30 AM",
      message: "Se ha publicado un proyecto de **Diseño UX de Alta Fidelidad** que coincide perfectamente con tu perfil técnico.",
      tags: ["Industrial Tech", "Remoto"],
      unread: true,
    },
    {
      id: "not-2",
      type: "rechazo" as const,
      category: "ESTADO DE POSTULACIÓN",
      time: "Hace 3h",
      message: "Tu postulación para **Lead Developer** no fue seleccionada esta vez. ¡No te desanimes! Sigue explorando nuevas vacantes.",
      tags: [] as string[],
      unread: false,
    },
  ];

  const mockNotificationsAyer = [
    {
      id: "not-3",
      type: "visibilidad" as const,
      category: "VISIBILIDAD",
      time: "Ayer, 4:15 PM",
      message: "Un reclutador de **Logistics Global** ha revisado tu perfil y portafolio.",
      tags: [] as string[],
      unread: false,
    },
    {
      id: "not-4",
      type: "proyecto" as const,
      category: "ACTUALIZACIÓN DE PROYECTO",
      time: "Ayer, 11:00 AM",
      message: 'Tu entrega del hito **"Estructura de Datos"** ha sido aprobada. El pago se procesará en las próximas 24 horas.',
      tags: [] as string[],
      unread: false,
    },
  ];

  type NotifType = "oportunidad" | "rechazo" | "visibilidad" | "proyecto";

  const getNotifIcon = (type: NotifType) => {
    switch (type) {
      case "oportunidad":
        return <Compass className="w-5 h-5" />;
      case "rechazo":
        return <X className="w-5 h-5" />;
      case "visibilidad":
        return <Eye className="w-5 h-5" />;
      case "proyecto":
        return <Check className="w-5 h-5" />;
    }
  };

  const getNotifIconStyle = (type: NotifType) => {
    switch (type) {
      case "oportunidad":
        return "bg-primary/10 text-primary border border-primary/20";
      case "rechazo":
        return "bg-magenta/10 text-magenta border border-magenta/20";
      case "visibilidad":
        return "bg-warning/10 text-warning border border-warning/20";
      case "proyecto":
        return "bg-accent/15 text-accent border border-accent/20";
    }
  };

  // Mock Suggested Projects
  const mockSuggestedProjects = [
    {
      id: "sug-1",
      title: "Desarrollo de Landing Page React",
      company: "Startup Lab",
      duration: "4 semanas",
      match: "100%",
      description: "Buscamos un estudiante o egresado FWD para maquetar una landing page responsiva en React.js y Tailwind CSS.",
      skills: ["React.js", "Tailwind CSS", "Figma UI"],
    },
    {
      id: "sug-2",
      title: "Migración y Refactorización a TypeScript",
      company: "Core Services Co.",
      duration: "6 semanas",
      match: "80%",
      description: "Migración de un panel administrativo desarrollado originalmente en Vanilla JS a TypeScript strict dentro de Next.js.",
      skills: ["TypeScript", "Next.js", "React.js"],
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans transition-colors duration-200">
      {/* Container Principal */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 md:px-8 flex-grow space-y-8">

        {/* HERO HEADER - Estilo Brand Expresivo Adaptado */}
        <section className="relative rounded-3xl overflow-hidden shadow-soft bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-white">
          {/* FwdGeoBackdrop decorativo de fondo */}
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
                <form onSubmit={handleSaveHero} className="space-y-3 max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Rol</label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:bg-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Programa / Cohorte</label>
                    <input
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
                      <Check className="w-3.5 h-3.5" /> Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditRole(profile.role);
                        setEditProgram(profile.program);
                        setIsEditingHero(false);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight uppercase">
                      {profile.name}
                      <span className="text-primary">.</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-white/95">
                      {profile.role} &mdash; <span className="opacity-90">{profile.program}</span>
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.badges.map((badge, idx) => {
                      let badgeStyle = "bg-white/10 text-white border border-white/20";
                      if (badge.toLowerCase() === "disponible") {
                        badgeStyle = "bg-accent text-accent-foreground font-semibold";
                      } else if (badge.toLowerCase() === "frontend") {
                        badgeStyle = "bg-highlight text-highlight-foreground font-semibold";
                      }
                      return (
                        <span
                          key={idx}
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
                onClick={() => setIsEditingHero(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-sm font-semibold border border-white/20 backdrop-blur-sm cursor-pointer self-start md:self-auto"
              >
                <Edit2 className="w-4 h-4" />
                Editar perfil
              </button>
            )}
          </div>
        </section>

        {/* NAVEGACIÓN POR TABS */}
        <nav className="flex border-b border-border gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${activeTab === "perfil"
              ? "border-primary text-ink-strong font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            Mi perfil
          </button>
          <button
            onClick={() => setActiveTab("trabajo")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${activeTab === "trabajo"
              ? "border-primary text-ink-strong font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            Mi trabajo
          </button>
          <button
            onClick={() => setActiveTab("postulaciones")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${activeTab === "postulaciones"
              ? "border-primary text-ink-strong font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            Postulaciones
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface-sunken text-ink-muted border border-border">
              {applications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("notificaciones")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${activeTab === "notificaciones"
              ? "border-primary text-ink-strong font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            Notificaciones
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface-sunken text-ink-muted border border-border">
              {[...mockNotificationsHoy, ...mockNotificationsAyer].filter(n => n.unread).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sugeridos")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${activeTab === "sugeridos"
              ? "border-primary text-ink-strong font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            Proyectos sugeridos
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface-sunken text-ink-muted border border-border">
              {mockSuggestedProjects.length}
            </span>
          </button>
        </nav>

        {/* CONTENIDO SEGÚN TAB ACTIVO */}
        {activeTab === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLUMNA IZQUIERDA (INFORMACION GENERAL Y STACK) */}
            <div className="lg:col-span-2 space-y-8">

              {/* CARD: INFORMACIÓN PERSONAL */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-ink-strong">
                    Información Personal
                  </h2>
                  {!isEditingPersonal && (
                    <button
                      onClick={() => setIsEditingPersonal(true)}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                </div>

                {isEditingPersonal ? (
                  <form onSubmit={handleSavePersonal} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-surface-sunken border border-border text-ink rounded-lg px-3 py-2 text-sm focus:outline-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                        Biografía profesional
                      </label>
                      <textarea
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
                        <Check className="w-4 h-4" /> Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditLocation(profile.location);
                          setEditEmail(profile.email);
                          setEditBio(profile.bio);
                          setIsEditingPersonal(false);
                        }}
                        className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold py-2 px-4 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">Ubicación</span>
                          <span className="font-semibold text-ink-strong">{profile.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                        <Mail className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="block text-xs text-ink-muted">Contacto</span>
                          <span className="font-semibold text-ink-strong">{profile.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Sobre Mí
                      </h3>
                      <p className="text-ink leading-relaxed text-sm md:text-base font-normal">
                        {profile.bio}
                      </p>
                    </div>
                  </>
                )}
              </section>

              {/* CARD: MI STACK */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-ink-strong">
                    Mi Stack Tecnológico
                  </h2>
                  {!isAddingSkill && (
                    <button
                      onClick={() => setIsAddingSkill(true)}
                      className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  )}
                </div>

                {isAddingSkill && (
                  <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Ej. Node.js, GraphQL, PostgreSQL..."
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
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewSkill("");
                        setIsAddingSkill(false);
                      }}
                      className="bg-surface-sunken hover:bg-border/30 text-ink text-sm font-semibold px-3 rounded-xl cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-surface-sunken border border-border text-ink hover:border-border-strong transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-ink-subtle hover:text-magenta transition-colors focus:outline-none cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted italic">No hay tecnologías agregadas.</p>
                  )}
                </div>
              </section>

              {/* CARD: LINKS DEL TALENTO */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-ink-strong">
                  Enlaces del Talento
                </h2>

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
                          <span className="block text-xs text-ink-muted">GitHub</span>
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
                          <span className="block text-xs text-ink-muted">LinkedIn</span>
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
                          <span className="block text-xs text-ink-muted">Portafolio</span>
                          <span className="text-sm font-bold text-ink-strong break-all">
                            {profile.links.portfolio}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  )}
                </div>
              </section>

            </div>

            {/* COLUMNA DERECHA (SIDEBAR: ACTIVIDADES Y POSTULACIONES RESUMIDAS) */}
            <div className="space-y-8">

              {/* CARD: ACTIVIDAD RECIENTE */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink-strong">
                    Actividad Reciente
                  </h2>
                </div>

                <div className="relative border-l-2 border-border pl-4 ml-2.5 space-y-5">
                  {activities.map((act) => (
                    <div key={act.id} className="relative space-y-1">
                      {/* Círculo indicador */}
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-surface" />
                      <p className="text-sm text-ink-strong font-medium leading-tight">
                        {act.description}
                      </p>
                      <span className="block text-xs text-ink-muted">
                        {act.timestamp}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => alert("Historial completo en desarrollo")}
                  className="text-primary hover:underline text-sm font-semibold block pt-2 cursor-pointer w-full text-left"
                >
                  Ver todo el historial
                </button>
              </section>

              {/* CARD: POSTULACIONES RESUMIDAS */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-ink-strong">
                    Postulaciones
                  </h2>
                </div>

                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => {
                    const sidebarStyles = getStatusStyles(app.status);
                    return (
                      <div key={app.id} className="flex justify-between items-start gap-4 p-3 rounded-xl border border-border bg-surface-sunken">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-ink-strong leading-tight">
                            {app.projectName}
                          </h3>
                          <span className="block text-xs text-ink-muted">
                            {app.companyName}
                          </span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border shrink-0 ${sidebarStyles.badge}`}>
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
                  Gestionar postulaciones
                </button>
              </section>

            </div>

          </div>
        )}

        {activeTab === "trabajo" && (
          <section className="space-y-6">
            {/* Header Info */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                Mi trabajo<span className="text-primary">.</span>
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                Gestiona y exhibe tus desarrollos más impactantes. Aquí puedes visualizar tus productos terminados y añadir nuevas piezas a tu portafolio profesional.
              </p>
            </div>

            {/* Grid de Proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Proyecto 1: Dashboard de Analítica */}
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col">
                {/* Browser bar */}
                <div className="bg-surface-sunken border-b border-border px-4 py-2.5 flex items-center gap-2 text-xs shrink-0 select-none">
                  {/* macOS dots */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                  </div>
                  {/* Address bar */}
                  <div className="flex-grow max-w-xs mx-auto bg-surface border border-border/60 rounded-md px-3 py-0.5 text-ink-subtle text-[10px] flex items-center gap-1 font-mono">
                    <span className="text-primary/70">fwd-talent.io</span>/dashboard/v1
                  </div>
                </div>
                {/* Browser canvas - Dashboard layout */}
                <div className="bg-canvas p-4 flex gap-3 h-44 overflow-hidden border-b border-border/40 select-none">
                  {/* Mock Sidebar */}
                  <div className="w-8 shrink-0 bg-surface border border-border/50 rounded flex flex-col gap-1.5 p-1">
                    <div className="w-full h-2 rounded bg-primary/20" />
                    <div className="w-full h-1 bg-border rounded" />
                    <div className="w-full h-1 bg-border rounded" />
                    <div className="w-full h-1 bg-border rounded" />
                  </div>
                  {/* Mock Main Content */}
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
                {/* Card Info */}
                <div className="p-5 flex-grow flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-ink-strong leading-tight">
                      Dashboard de Analítica
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                      Product
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Plataforma de visualización de datos en tiempo real con integración de APIs externas.
                  </p>
                </div>
              </div>

              {/* Proyecto 2: Landing Page Conversión */}
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col">
                {/* Browser bar */}
                <div className="bg-surface-sunken border-b border-border px-4 py-2.5 flex items-center gap-2 text-xs shrink-0 select-none">
                  {/* macOS dots */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                  </div>
                  {/* Address bar */}
                  <div className="flex-grow max-w-xs mx-auto bg-surface border border-border/60 rounded-md px-3 py-0.5 text-ink-subtle text-[10px] flex items-center gap-1 font-mono">
                    <span className="text-primary/70">fwd-talent.io</span>/lp-high-perf
                  </div>
                </div>
                {/* Browser canvas - Video Hero layout */}
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
                    <div className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all cursor-pointer border border-primary/20 shadow-soft">
                      <Play className="w-3.5 h-3.5 fill-primary text-primary ml-0.5" />
                    </div>
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-5 flex-grow flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-ink-strong leading-tight">
                      Landing Page Conversión
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                      Product
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Diseño minimalista enfocado en alta tasa de conversión y performance técnico.
                  </p>
                </div>
              </div>

              {/* Proyecto 3: Sistema de Inventario */}
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col">
                {/* Browser bar */}
                <div className="bg-surface-sunken border-b border-border px-4 py-2.5 flex items-center gap-2 text-xs shrink-0 select-none">
                  {/* macOS dots */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                  </div>
                  {/* Address bar */}
                  <div className="flex-grow max-w-xs mx-auto bg-surface border border-border/60 rounded-md px-3 py-0.5 text-ink-subtle text-[10px] flex items-center gap-1 font-mono">
                    <span className="text-primary/70">fwd-talent.io</span>/app-inventory
                  </div>
                </div>
                {/* Browser canvas - Inventory list layout */}
                <div className="bg-canvas p-4 h-44 overflow-hidden border-b border-border/40 select-none flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-3.5 bg-primary/20 rounded" />
                    <div className="w-5 h-5 rounded-full bg-primary/80" />
                  </div>
                  <div className="space-y-2 flex-grow">
                    {/* Row 1 */}
                    <div className="bg-surface border border-border/40 rounded p-1.5 flex items-center gap-2.5 shadow-sm">
                      <div className="w-5 h-5 bg-border rounded shrink-0" />
                      <div className="flex-grow space-y-1">
                        <div className="w-24 h-1.5 bg-border rounded" />
                        <div className="w-16 h-1 bg-border/60 rounded" />
                      </div>
                    </div>
                    {/* Row 2 */}
                    <div className="bg-surface border border-border/40 rounded p-1.5 flex items-center gap-2.5 shadow-sm">
                      <div className="w-5 h-5 bg-border rounded shrink-0" />
                      <div className="flex-grow space-y-1">
                        <div className="w-28 h-1.5 bg-border rounded" />
                        <div className="w-12 h-1 bg-border/60 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-5 flex-grow flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-ink-strong leading-tight">
                      Sistema de Inventario
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                      Product
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Aplicación CRUD robusta con gestión de usuarios y roles administrativos.
                  </p>
                </div>
              </div>

              {/* Proyecto 4: Agregar Proyecto (Dashed Card) */}
              <div
                onClick={() => alert("Función para agregar proyecto en desarrollo")}
                className="bg-surface border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[260px] rounded-2xl group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink-strong text-base mb-1">
                  Agregar proyecto
                </h3>
                <p className="text-xs text-ink-subtle">
                  Formatos soportados: Link, Figma, GitHub
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "postulaciones" && (
          <section className="space-y-6">
            {/* Header Info */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                Mis postulaciones<span className="text-primary">..</span>
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                Gestiona y haz seguimiento en tiempo real de tus procesos de selección abiertos y finalizados.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold py-2">
              <span className="text-ink-muted mr-1">Filtrar por:</span>
              {[
                { value: "todas", label: "Todas" },
                { value: "enviada", label: "Enviadas" },
                { value: "vista", label: "Vistas" },
                { value: "en_proceso", label: "En proceso" },
                { value: "aceptada", label: "Aceptadas" },
                { value: "rechazada", label: "Rechazadas" },
              ].map((filter) => {
                const isActive = filterStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value as "todas" | Application["status"])}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${isActive
                      ? "bg-primary border-primary text-white"
                      : "bg-surface-sunken border-border text-ink-muted hover:bg-border/30 hover:text-ink"
                      }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications
                .filter((app) => filterStatus === "todas" || app.status === filterStatus)
                .map((app) => {
                  const styles = getStatusStyles(app.status);
                  return (
                    <div
                      key={app.id}
                      className="relative rounded-2xl bg-surface border border-border p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden pl-7"
                    >
                      {/* Accent left border strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${styles.strip}`} />

                      <div className="flex items-center gap-4">
                        {/* Icon Container */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(app.category)}`}>
                          {getCategoryIcon(app.category)}
                        </div>

                        {/* Text Info */}
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-ink-strong leading-tight">
                            {app.projectName}
                          </h3>
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

                      {/* Right Side */}
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${styles.badge}`}>
                          {styles.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-ink-subtle hover:text-primary transition-colors shrink-0" />
                      </div>
                    </div>
                  );
                })}
              {applications.filter((app) => filterStatus === "todas" || app.status === filterStatus).length === 0 && (
                <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                  <p className="text-sm text-ink-muted italic">No se encontraron postulaciones con este estado.</p>
                </div>
              )}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Card 1: Active Postulaciones (Blue background) */}
              <div className="bg-primary rounded-2xl p-6 text-white flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <TrendingUp className="w-7 h-7 text-white/80" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight">
                    {stats.activeCount}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    Postulaciones Activas
                  </div>
                </div>
              </div>

              {/* Card 2: Interviews (Gray background) */}
              <div className="bg-surface-sunken rounded-2xl p-6 border border-border flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <Calendar className="w-7 h-7 text-primary" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight text-ink-strong">
                    {stats.scheduledInterviews}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Entrevistas Programadas
                  </div>
                </div>
              </div>

              {/* Card 3: Compatibility (White background) */}
              <div className="bg-surface rounded-2xl p-6 border border-border flex flex-col justify-between h-36 shadow-soft hover:shadow-md transition-all">
                <Zap className="w-7 h-7 text-warning" />
                <div>
                  <div className="text-3xl font-extrabold font-heading tracking-tight text-ink-strong">
                    {stats.compatibilityIndex}%
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Índice de Compatibilidad
                  </div>
                </div>
              </div>
            </div>

            {/* Otras Oportunidades para ti */}
            <div className="pt-8 border-t border-border/60 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-ink-strong">
                  Otras oportunidades para ti<span className="text-primary">.</span>
                </h2>
                <p className="text-sm text-ink-muted">
                  Basado en tu perfil de talento industrial tech, estas posiciones podrían encajar con tu trayectoria profesional.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Lista de posiciones */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {/* Oportunidad 1 */}
                  <div className="bg-surface rounded-2xl border border-border/80 p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-border/60 flex items-center justify-center bg-surface-sunken text-ink-strong shrink-0">
                        <UserCog className="w-6 h-6 text-ink-muted" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm md:text-base font-bold text-ink-strong leading-tight">
                          Director de Infraestructura Tech
                        </h3>
                        <p className="text-xs md:text-sm text-ink-muted">
                          Santiago, Chile · Remoto
                        </p>
                      </div>
                    </div>
                    <button className="text-[10px] md:text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0">
                      Ver detalles <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Oportunidad 2 */}
                  <div className="bg-surface rounded-2xl border border-border/80 p-5 flex items-center justify-between shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-border/60 flex items-center justify-center bg-surface-sunken text-ink-strong shrink-0">
                        <Box className="w-6 h-6 text-ink-muted" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm md:text-base font-bold text-ink-strong leading-tight">
                          Blockchain Architect
                        </h3>
                        <p className="text-xs md:text-sm text-ink-muted">
                          Bogotá, Col · Híbrido
                        </p>
                      </div>
                    </div>
                    <button className="text-[10px] md:text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0">
                      Ver detalles <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Explora Nuevas Rutas */}
                <div className="relative bg-gradient-to-br from-primary/5 to-secondary/15 rounded-3xl border border-border/40 p-6 flex items-center justify-center min-h-[180px] overflow-hidden group">
                  {/* Decorative background shapes */}
                  <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-primary/10 pointer-events-none transition-transform group-hover:scale-110 duration-500" />
                  <div className="absolute -right-4 -top-4 w-12 h-12 rounded-lg bg-secondary/10 rotate-12 pointer-events-none transition-transform group-hover:rotate-45 duration-500" />

                  {/* Central White Card */}
                  <div className="relative z-10 bg-surface rounded-2xl p-6 shadow-soft hover:shadow-md transition-shadow duration-200 w-full max-w-[220px] flex flex-col items-center justify-center text-center space-y-4 border border-border/40">
                    {/* Two horizontal decorative lines */}
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <div className="w-10 h-1 rounded-full bg-primary/40" />
                      <div className="w-6 h-1 rounded-full bg-primary/20" />
                    </div>

                    {/* Search Check Icon */}
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="w-6 h-6" />
                      <span className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-surface flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </div>

                    {/* Explora Nuevas Rutas Text */}
                    <span className="text-[10px] font-extrabold text-primary tracking-wider uppercase">
                      Explora nuevas rutas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "notificaciones" && (
          <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink-strong">
                Actividad Reciente
              </span>
              <button
                type="button"
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Marcar todas como leídas
              </button>
            </div>

            {/* Grupo: Hoy */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold font-heading text-ink-strong shrink-0">Hoy</h2>
                <div className="flex-grow border-t border-border/80" />
              </div>
              <div className="space-y-4">
                {mockNotificationsHoy.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-surface border border-border rounded-2xl px-6 py-5 flex items-center gap-6 shadow-soft hover:shadow-md hover:border-border-strong transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getNotifIconStyle(notif.type)}`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      {notif.unread && (
                        <span className="absolute top-0 right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-surface" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                          {notif.category}
                        </span>
                        <span className="text-xs text-ink-subtle shrink-0 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">
                        {renderMessage(notif.message)}
                      </p>
                      {notif.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {notif.tags.map((tag, idx) => (
                            <span
                              key={idx}
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

            {/* Grupo: Ayer */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold font-heading text-ink-strong shrink-0">Ayer</h2>
                <div className="flex-grow border-t border-border/80" />
              </div>
              <div className="space-y-4">
                {mockNotificationsAyer.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-surface border border-border rounded-2xl px-6 py-5 flex items-center gap-6 shadow-soft hover:shadow-md hover:border-border-strong transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getNotifIconStyle(notif.type)}`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      {notif.unread && (
                        <span className="absolute top-0 right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-surface" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                          {notif.category}
                        </span>
                        <span className="text-xs text-ink-subtle shrink-0 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">
                        {renderMessage(notif.message)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado vacío — notificaciones antiguas */}
            <div className="flex flex-col items-center justify-center gap-3 py-14 bg-surface rounded-2xl border border-dashed border-border-strong/50">
              <History className="w-8 h-8 text-ink-subtle" />
              <span className="text-sm text-ink-subtle font-medium">
                No hay notificaciones más antiguas.
              </span>
            </div>
          </section>
        )}

        {activeTab === "sugeridos" && (
          <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-ink-strong flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Proyectos Sugeridos
              </h2>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full border border-primary/20">
                IA Matcher
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              Proyectos freelance recomendados automáticamente basándose en tu stack tecnológico.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSuggestedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-surface-sunken rounded-xl border border-border p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-soft transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-base font-bold text-ink-strong leading-snug">
                          {project.title}
                        </h3>
                        <span className="text-xs text-ink-muted font-medium">{project.company}</span>
                      </div>
                      <span className="bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 rounded-md border border-accent/20">
                        {project.match} Match
                      </span>
                    </div>

                    <p className="text-xs text-ink leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((s, idx) => (
                        <span key={idx} className="bg-surface text-[10px] font-semibold text-ink px-2 py-0.5 rounded border border-border">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-border/60">
                      <span className="text-xs text-ink-muted font-medium">Duración: {project.duration}</span>
                      <button
                        onClick={() => alert(`Postulándose a ${project.title}`)}
                        className="text-primary hover:text-primary/95 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Postularme <ArrowUpRight className="w-3.5 h-3.5" />
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
        <div className="w-full max-w-6xl mx-auto px-4 py-8 md:px-8 md:flex md:justify-between md:items-center text-xs text-ink-muted space-y-4 md:space-y-0">
          <p className="text-center md:text-left">
            &copy; 2026 FWD Talent. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

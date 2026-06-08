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
  Bell,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { StudentProfile, Activity, Application } from "@/app/Perfil_Estudiante/types";

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

export interface PerfilUsuarioProps {
  initialProfile: StudentProfile;
  initialActivities: Activity[];
  initialApplications: Application[];
}

export default function PerfilUsuario({
  initialProfile,
  initialActivities,
  initialApplications,
}: PerfilUsuarioProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"perfil" | "postulaciones" | "notificaciones" | "sugeridos">("perfil");

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

  // Mock Notifications
  const mockNotifications = [
    {
      id: "not-1",
      title: "Postulación en revisión",
      message: "Tu postulación para el proyecto 'Panel de Monitoreo IoT' de Logistics Pro ha sido abierta.",
      time: "Hace 2 horas",
      unread: true,
    },
    {
      id: "not-2",
      title: "Nueva oferta sugerida",
      message: "Se ha publicado un nuevo proyecto 'Refactorización a TypeScript' que coincide con tu stack.",
      time: "Ayer",
      unread: false,
    },
    {
      id: "not-3",
      title: "Postulación aceptada",
      message: "¡Felicidades! Tu postulación para 'Landing Page Campaña Solidaria' ha sido aceptada. La empresa se contactará contigo pronto.",
      time: "Hace 3 días",
      unread: false,
    },
  ];

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
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "perfil"
                ? "border-primary text-ink-strong font-semibold"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Mi perfil
          </button>
          <button
            onClick={() => setActiveTab("postulaciones")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "postulaciones"
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
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "notificaciones"
                ? "border-primary text-ink-strong font-semibold"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Notificaciones
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface-sunken text-ink-muted border border-border">
              {mockNotifications.filter(n => n.unread).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sugeridos")}
            className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sugeridos"
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
                    let pillStyle = "bg-primary/10 text-primary border-primary/20";
                    if (app.status === "aceptada") pillStyle = "bg-accent/15 text-accent border-accent/20";
                    if (app.status === "pendiente") pillStyle = "bg-warning/10 text-warning border-warning/20";
                    if (app.status === "rechazada") pillStyle = "bg-magenta/10 text-magenta border-magenta/20";

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
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border shrink-0 ${pillStyle}`}>
                          {app.status}
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

        {activeTab === "postulaciones" && (
          <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-ink-strong flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Gestión de Postulaciones
            </h2>
            <p className="text-sm text-ink-muted">
              Aquí puedes ver el estado y los detalles de los proyectos a los que te has postulado.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-sunken">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Proyecto</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Empresa</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Estado</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-ink-muted text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {applications.map((app) => {
                    let pillStyle = "bg-primary/10 text-primary border-primary/20";
                    if (app.status === "aceptada") pillStyle = "bg-accent/15 text-accent border-accent/20";
                    if (app.status === "pendiente") pillStyle = "bg-warning/10 text-warning border-warning/20";
                    if (app.status === "rechazada") pillStyle = "bg-magenta/10 text-magenta border-magenta/20";

                    return (
                      <tr key={app.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-4 font-bold text-ink-strong">{app.projectName}</td>
                        <td className="p-4 text-ink-muted">{app.companyName}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border inline-block ${pillStyle}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => alert(`Detalles de ${app.projectName} en desarrollo`)}
                            className="text-primary hover:text-primary/80 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            Ver Detalles <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "notificaciones" && (
          <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-ink-strong flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notificaciones
            </h2>
            <p className="text-sm text-ink-muted">
              Entérate de las últimas actualizaciones e interacciones de tus postulaciones.
            </p>

            <div className="space-y-4">
              {mockNotifications.map((not) => (
                <div
                  key={not.id}
                  className={`p-4 rounded-xl border flex gap-3 transition-colors ${
                    not.unread
                      ? "bg-primary/5 border-primary/20"
                      : "bg-surface-sunken border-border"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${not.unread ? "bg-primary" : "bg-transparent"}`} />
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-sm ${not.unread ? "font-bold text-ink-strong" : "font-semibold text-ink"}`}>
                        {not.title}
                      </h3>
                      <span className="text-xs text-ink-muted shrink-0">{not.time}</span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed">
                      {not.message}
                    </p>
                  </div>
                </div>
              ))}
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

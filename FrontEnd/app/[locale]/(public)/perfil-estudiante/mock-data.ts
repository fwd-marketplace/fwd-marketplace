import {
  StudentProfile,
  Activity,
  Application,
  ApplicationStats,
  MockNotification,
  MockSuggestedProject,
  WorkProject,
  OpportunityItem,
} from "./types";

export const MOCK_PROFILE: StudentProfile = {
  name: "María Rodríguez",
  role: "Frontend Developer",
  program: "Egresada FWD 2025",
  location: "San José, Costa Rica",
  email: "maria.rodriguez@fwd.cr",
  bio: "Desarrolladora Frontend apasionada por crear interfaces de usuario hermosas, accesibles y eficientes. Graduada con honores del programa de formación FWD. Busco proyectos freelance retadores donde pueda aportar valor con React y Next.js.",
  badges: ["Frontend", "Disponible", "Remoto"],
  skills: ["React.js", "Tailwind CSS", "TypeScript", "Next.js", "Figma UI"],
  links: {
    github: "github.com/mariarodriguez",
    linkedin: "linkedin.com/in/mariarodriguez",
    portfolio: "mariarodriguez.dev",
  },
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    description: "Postuló al proyecto 'Senior UX Architect'",
    timestamp: "Hace 2 días",
  },
  {
    id: "act-2",
    description: "Actualizó su stack tecnológico agregando Next.js",
    timestamp: "Ayer",
  },
  {
    id: "act-3",
    description: "Completó su información de contacto y enlaces del talento",
    timestamp: "Hace 3 días",
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    projectName: "Senior UX Architect",
    companyName: "TechFlow Systems",
    status: "enviada",
    relativeTime: "Enviada hace 2 días",
    category: "ux",
  },
  {
    id: "app-2",
    projectName: "Data Analyst Lead",
    companyName: "Quantum Analytics",
    status: "vista",
    relativeTime: "Vista hace 4 horas",
    category: "data",
  },
  {
    id: "app-3",
    projectName: "Fullstack Engineer",
    companyName: "Nomad Digital",
    status: "aceptada",
    relativeTime: "Aceptada ayer",
    category: "dev",
  },
  {
    id: "app-4",
    projectName: "Visual Designer",
    companyName: "Creative Pulse",
    status: "rechazada",
    relativeTime: "Rechazada hace 1 semana",
    category: "design",
  },
  {
    id: "app-5",
    projectName: "React Developer",
    companyName: "DevLabs Costa Rica",
    status: "en_proceso",
    relativeTime: "En proceso desde hace 3 días",
    category: "dev",
  },
];

export const MOCK_STATS: ApplicationStats = {
  activeCount: 12,
  scheduledInterviews: 3,
  compatibilityIndex: 85,
};

export const MOCK_NOTIFICATIONS_HOY: MockNotification[] = [
  {
    id: "not-1",
    type: "oportunidad",
    category: "NUEVA OPORTUNIDAD",
    time: "10:30 AM",
    message:
      "Se ha publicado un proyecto de **Diseño UX de Alta Fidelidad** que coincide perfectamente con tu perfil técnico.",
    tags: ["Industrial Tech", "Remoto"],
    unread: true,
  },
  {
    id: "not-2",
    type: "rechazo",
    category: "ESTADO DE POSTULACIÓN",
    time: "Hace 3h",
    message:
      "Tu postulación para **Lead Developer** no fue seleccionada esta vez. ¡No te desanimes! Sigue explorando nuevas vacantes.",
    tags: [],
    unread: false,
  },
];

export const MOCK_NOTIFICATIONS_AYER: MockNotification[] = [
  {
    id: "not-3",
    type: "visibilidad",
    category: "VISIBILIDAD",
    time: "Ayer, 4:15 PM",
    message: "Un reclutador de **Logistics Global** ha revisado tu perfil y portafolio.",
    tags: [],
    unread: false,
  },
  {
    id: "not-4",
    type: "proyecto",
    category: "ACTUALIZACIÓN DE PROYECTO",
    time: "Ayer, 11:00 AM",
    message:
      'Tu entrega del hito **"Estructura de Datos"** ha sido aprobada. El pago se procesará en las próximas 24 horas.',
    tags: [],
    unread: false,
  },
];

export const MOCK_SUGGESTED_PROJECTS: MockSuggestedProject[] = [
  {
    id: "sug-1",
    title: "Desarrollo de Landing Page React",
    company: "Startup Lab",
    duration: "4 semanas",
    match: "100%",
    description:
      "Buscamos un estudiante o egresado FWD para maquetar una landing page responsiva en React.js y Tailwind CSS.",
    skills: ["React.js", "Tailwind CSS", "Figma UI"],
  },
  {
    id: "sug-2",
    title: "Migración y Refactorización a TypeScript",
    company: "Core Services Co.",
    duration: "6 semanas",
    match: "80%",
    description:
      "Migración de un panel administrativo desarrollado originalmente en Vanilla JS a TypeScript strict dentro de Next.js.",
    skills: ["TypeScript", "Next.js", "React.js"],
  },
];

export const MOCK_WORK_PROJECTS: WorkProject[] = [
  {
    id: "work-1",
    title: "Dashboard de Analítica",
    description:
      "Plataforma de visualización de datos en tiempo real con integración de APIs externas.",
    browserBar: "fwd-talent.io/dashboard/v1",
    variant: "dashboard",
  },
  {
    id: "work-2",
    title: "Landing Page Conversión",
    description: "Diseño minimalista enfocado en alta tasa de conversión y performance técnico.",
    browserBar: "fwd-talent.io/lp-high-perf",
    variant: "landing",
  },
  {
    id: "work-3",
    title: "Sistema de Inventario",
    description: "Aplicación CRUD robusta con gestión de usuarios y roles administrativos.",
    browserBar: "fwd-talent.io/app-inventory",
    variant: "inventory",
  },
];

export const MOCK_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    title: "Director de Infraestructura Tech",
    location: "Santiago, Chile · Remoto",
  },
  {
    id: "opp-2",
    title: "Blockchain Architect",
    location: "Bogotá, Col · Híbrido",
  },
];

import { StudentProfile, Activity, Application, ApplicationStats } from "./types";

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

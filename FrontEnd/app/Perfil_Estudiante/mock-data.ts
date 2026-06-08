import { StudentProfile, Activity, Application } from "./types";

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
    description: "Postuló al proyecto 'Rediseño de Catálogo Digital'",
    timestamp: "Hace 2 horas",
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
    projectName: "Rediseño de Catálogo Digital",
    companyName: "Tienda El Sol",
    status: "enviada",
  },
  {
    id: "app-2",
    projectName: "Panel de Monitoreo IoT",
    companyName: "Logistics Pro",
    status: "pendiente",
  },
  {
    id: "app-3",
    projectName: "Landing Page Campaña Solidaria",
    companyName: "Fundación Esperanza",
    status: "aceptada",
  },
];

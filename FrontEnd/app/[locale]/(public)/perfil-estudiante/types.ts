export interface StudentProfile {
  name: string;
  specialty: string;
  program: string;
  availability: string;
  email: string;
  bio: string;
  badges: string[];
  skills: string[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

export interface Application {
  id: string;
  projectName: string;
  companyName: string;
  status: "enviada" | "vista" | "en_proceso" | "aceptada" | "rechazada";
  relativeTime: string;
  category: "ux" | "data" | "dev" | "design";
}

export interface ApplicationStats {
  activeCount: number;
  scheduledInterviews: number;
  compatibilityIndex: number;
}

export interface StudentProfile {
  name: string;
  role: string;
  program: string;
  location: string;
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

export type NotifType = "oportunidad" | "rechazo" | "visibilidad" | "proyecto";

export interface MockNotification {
  id: string;
  type: NotifType;
  category: string;
  time: string;
  message: string;
  tags: string[];
  unread: boolean;
}

export interface MockSuggestedProject {
  id: string;
  title: string;
  company: string;
  duration: string;
  match: string;
  description: string;
  skills: string[];
}

export interface WorkProject {
  id: string;
  title: string;
  description: string;
  browserBar: string;
  variant: "dashboard" | "landing" | "inventory";
}

export interface OpportunityItem {
  id: string;
  title: string;
  location: string;
}

export interface StudentProfile {
  firstName: string;
  lastName1: string;
  lastName2: string;
  specialty: string;
  program: string;
  availability: string;
  email: string;
  bio: string;
  badges: string[];
  skills: string[];
  avatarUrl: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  reputacion?: number | null;
}

export type MockCalificacion = {
  id: string;
  companyName: string;
  projectName: string;
  score: number;
  comment: string;
  date: string;
  reply?: string | null;
};

export function fullName(profile: Pick<StudentProfile, "firstName" | "lastName1" | "lastName2">): string {
  return [profile.firstName, profile.lastName1, profile.lastName2].filter(Boolean).join(" ");
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

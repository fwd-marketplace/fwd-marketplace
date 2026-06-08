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
  status: "enviada" | "pendiente" | "aceptada" | "rechazada";
}

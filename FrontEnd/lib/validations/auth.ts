import { z } from "zod";

export const JuniorProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  specialization: z.enum(["frontend", "backend", "fullstack", "ia"]),
  modalities: z.array(z.enum(["remote", "hybrid", "onsite"])).min(1),
  availability: z.enum(["immediate", "two_weeks", "one_month", "unavailable"]),
  techStack: z.array(z.string()).min(1),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
});

export const EmpresaProfileSchema = z.object({
  companyName: z.string().min(2).max(150),
  sectors: z.array(z.enum(["tech", "fintech", "health", "logistics", "education", "energy", "retail", "manufacturing", "consulting", "other"])).min(1),
  description: z.string().min(10).max(300),
  websiteUrl: z.string().url(),
  cedulaJuridica: z.string().min(5).max(20),
  projectTypes: z.array(z.enum(["web", "mobile", "ai", "automation", "dashboards", "integrations", "ux", "data", "other"])).min(1),
  logoUrl: z.string().url().optional(),
});

export const EmprendedorProfileSchema = z.object({
  projectName: z.string().min(2).max(100),
  stage: z.enum(["idea", "mvp", "validating", "scaling"]),
  neededSupport: z.array(z.enum(["web", "mobile", "backend", "ai", "ux", "data", "automation", "other"])).min(1),
  budget: z.enum(["under_500", "range_500_1000", "range_1000_2500", "flexible"]),
  description: z.string().max(400).optional(),
});

export type JuniorProfile = z.infer<typeof JuniorProfileSchema>;
export type EmpresaProfile = z.infer<typeof EmpresaProfileSchema>;
export type EmprendedorProfile = z.infer<typeof EmprendedorProfileSchema>;

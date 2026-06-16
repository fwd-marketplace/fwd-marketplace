import { z } from "zod";

/**
 * Normaliza un campo URL opcional: recorta espacios, añade "https://" si falta
 * protocolo, y valida que sea una URL bien formada — o que esté vacío.
 * El backend acepta z.union([z.string().url(), z.literal("")]).optional(),
 * así que esta transformación garantiza que nunca llegue una URL sin protocolo.
 */
const normalizedUrl = z
  .string()
  .transform((val) => {
    const v = val.trim();
    if (!v) return "";
    return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
  })
  .pipe(z.union([z.string().url(), z.literal("")]))
  .optional();

export const JuniorProfileSchema = z.object({
  nombre:        z.string().min(2).max(50),
  apellido1:     z.string().min(2).max(50),
  apellido2:     z.string().min(2).max(50),
  cedula:        z.string().min(5).max(20),
  specialization: z.enum(["frontend", "backend", "fullstack", "ia"]),
  modalities:    z.array(z.enum(["remote", "hybrid", "onsite"])).min(1),
  availability:  z.enum(["immediate", "two_weeks", "one_month", "unavailable"]),
  techStack:     z.array(z.string()).min(1),
  githubUrl:     normalizedUrl,
  linkedinUrl:   normalizedUrl,
  portfolioUrl:  normalizedUrl,
  bio:           z.string().max(500).optional(),
});

export const EmpresaProfileSchema = z.object({
  companyName:     z.string().min(2).max(150),
  sectors:         z.array(z.enum(["tech", "fintech", "health", "logistics", "education", "energy", "retail", "manufacturing", "consulting", "other"])).min(1),
  description:     z.string().min(10).max(300),
  cedulaJuridica:  z.string().min(5).max(20),
  direccion:       z.string().min(5).max(200),
  projectTypes:    z.array(z.enum(["web", "mobile", "ai", "automation", "dashboards", "integrations", "ux", "data", "other"])).min(1),
  logoUrl:         z.string().url().optional().or(z.literal("")),
});

export const EmprendedorProfileSchema = z.object({
  projectName:   z.string().min(2).max(100),
  stage:         z.enum(["idea", "mvp", "validating", "scaling"]),
  neededSupport: z.array(z.enum(["web", "mobile", "backend", "ai", "ux", "data", "automation", "other"])).min(1),
  budget:        z.enum(["under_500", "range_500_1000", "range_1000_2500", "flexible"]),
  description:   z.string().max(400).optional(),
});

export const MIN_PASSWORD_LENGTH = 8;

export const ResetPasswordSchema = z
  .object({
    email: z.string().min(1).email(),
    password: z.string().min(MIN_PASSWORD_LENGTH),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type JuniorProfile      = z.infer<typeof JuniorProfileSchema>;
export type EmpresaProfile     = z.infer<typeof EmpresaProfileSchema>;
export type EmprendedorProfile = z.infer<typeof EmprendedorProfileSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

import { z } from "zod";

/**
 * Validaciones de los cuerpos de onboarding. Usan los NOMBRES DE CAMPO DEL
 * FRONTEND (ver BackEnd/docs/auth-contract.md). El service traduce esos nombres
 * a las columnas de la BD.
 */

/** URL opcional que también admite cadena vacía (el FE manda "" cuando no hay valor). */
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();

/** PANTALLA 3A — Onboarding Junior. */
export const JuniorOnboardingSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellido1: z.string().min(1).max(100),
  apellido2: z.string().max(100).optional(),
  cedula: z.string().min(1).max(20),
  especializacion: z.enum(["frontend", "backend", "fullstack", "ia"]),
  modalidad: z.array(z.string()).min(1),
  disponibilidad: z.enum(["immediate", "two_weeks", "one_month", "unavailable"]),
  tech_stack: z.array(z.string().min(1)).min(1),
  link_github: optionalUrl,
  link_linkedin: optionalUrl,
  link_portfolio: optionalUrl,
  bio: z.string().max(500).optional(),
});

/** PANTALLA 3B — Onboarding Empresa. */
export const EmpresaOnboardingSchema = z.object({
  tipo: z.literal("empresa"),
  nombre_empresa: z.string().min(1).max(255),
  sector: z.array(z.string().min(1)).min(1),
  descripcion: z.string().min(1).max(300),
  datos_legales: z.object({
    ruc: z.string().min(1).max(30),
    direccion: z.string().min(1),
  }),
  tipos_proyecto: z.array(z.string().min(1)).min(1),
});

/** PANTALLA 3C — Onboarding Emprendedor. */
export const EmprendedorOnboardingSchema = z.object({
  tipo: z.literal("emprendedor"),
  nombre_proyecto: z.string().min(2).max(100),
  // El emprendedor es persona física: su cédula personal va a users.cedula.
  cedula: z.string().min(5).max(20),
  etapa: z.enum(["idea", "mvp", "validating", "scaling"]),
  soporte_tecnico: z.array(z.enum(["web", "mobile", "backend", "ai", "ux", "data", "automation", "other"])).min(1),
  presupuesto: z.enum(["under_500", "range_500_1000", "range_1000_2500", "flexible"]),
  descripcion: z.string().max(400).optional(),
});

export type JuniorOnboarding = z.infer<typeof JuniorOnboardingSchema>;
export type EmpresaOnboarding = z.infer<typeof EmpresaOnboardingSchema>;
export type EmprendedorOnboarding = z.infer<typeof EmprendedorOnboardingSchema>;

import { z } from "zod";

/**
 * Validaciones de edición de perfil. Usan los NOMBRES DE CAMPO DEL FRONTEND
 * (ver BackEnd/docs/auth-contract.md); el service los traduce a columnas de la BD.
 * Como es un PATCH (actualización parcial) todos los campos son opcionales, pero
 * se exige al menos uno para no disparar un UPDATE vacío.
 */

/** URL opcional que también admite cadena vacía (el FE manda "" cuando no hay valor). */
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();

const NON_EMPTY = { message: "Enviá al menos un campo para actualizar" };

export const PerfilEstudianteSchema = z
  .object({
    nombre: z.string().min(1).max(100).optional(),
    apellido1: z.string().min(1).max(100).optional(),
    apellido2: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    especializacion: z.enum(["frontend", "backend", "fullstack", "ia"]).optional(),
    titulo_fwd: z.string().max(100).optional(),
    modalidad: z.array(z.string().min(1)).optional(),
    disponibilidad: z.enum(["immediate", "two_weeks", "one_month", "unavailable"]).optional(),
    skills: z.array(z.string().min(1)).optional(),
    link_github: optionalUrl,
    link_linkedin: optionalUrl,
    link_portfolio: optionalUrl,
  })
  .refine((value) => Object.keys(value).length > 0, NON_EMPTY);

/** PATCH del perfil de empresa/emprendedor: columnas editables de `empresario`. */
export const PerfilEmpresarioSchema = z
  .object({
    nombre_comercial: z.string().min(1).max(255).optional(),
    descripcion: z.string().max(400).optional(),
    sector: z.array(z.string().min(1)).min(1).optional(),
    tipos_proyecto: z.array(z.string().min(1)).min(1).optional(),
    soporte_tecnico: z.array(z.string().min(1)).min(1).optional(),
    ruc: z.string().min(1).max(30).optional(),
    direccion: z.string().min(1).optional(),
    url_sitio_web: optionalUrl,
    etapa: z.enum(["idea", "mvp", "validating", "scaling"]).optional(),
    presupuesto: z.enum(["under_500", "range_500_1000", "range_1000_2500", "flexible"]).optional(),
    mision: z.string().max(1000).optional(),
    vision: z.string().max(1000).optional(),
    cultura: z.string().max(1000).optional(),
    valores: z.array(z.string().min(1)).optional(),
    contactos: z
      .array(z.object({ name: z.string().min(1), role: z.string().min(1), email: z.string().email() }))
      .optional(),
    cantidad_empleados: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, NON_EMPTY);

export type PerfilEstudianteInput = z.infer<typeof PerfilEstudianteSchema>;
export type PerfilEmpresarioInput = z.infer<typeof PerfilEmpresarioSchema>;

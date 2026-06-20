import { z } from "zod";

/** Cuerpo para crear un proyecto (empresa). Nombres alineados con la BD. */
export const CreateProjectSchema = z.object({
  titulo: z.string().min(1).max(255),
  descripcion: z.string().min(1),
  id_area_negocio: z.string().uuid(),
  plazo_dias: z.number().int().min(5).max(15),
  usa_ia: z.boolean().optional(),
  // ids de skills del catálogo (tecnologías requeridas por el proyecto).
  skills: z.array(z.string().uuid()).optional(),
  // Tecnologías "Otros" escritas a mano (no están en el catálogo de skills).
  tecnologias_extra: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  // true -> se publica (en_recepcion); false/omitido -> queda en borrador.
  publicar: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * Estados que la empresa dueña puede asignar a su proyecto para gestionar su
 * ciclo de vida. Excluye 'borrador' (solo al crear) y 'cancelado' (reservado a
 * la moderación del admin).
 */
export const PROJECT_STATES_EMPRESA = [
  "en_recepcion",
  "en_evaluacion",
  "adjudicado",
  "en_desarrollo",
  "cerrado",
] as const;

/** Cuerpo para que la empresa cambie el estado de su proyecto. */
export const ChangeProjectStateSchema = z.object({
  estado: z.enum(PROJECT_STATES_EMPRESA),
});

export type ChangeProjectStateInput = z.infer<typeof ChangeProjectStateSchema>;

/** Cuerpo para editar un proyecto existente. Todos los campos son opcionales. */
export const UpdateProjectSchema = z.object({
  titulo: z.string().min(1).max(255).optional(),
  descripcion: z.string().min(1).optional(),
  id_area_negocio: z.string().uuid().optional(),
  plazo_dias: z.number().int().min(5).max(15).optional(),
  usa_ia: z.boolean().optional(),
  skills: z.array(z.string().uuid()).optional(),
  tecnologias_extra: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

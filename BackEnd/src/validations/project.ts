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
  // true -> se publica (en_recepcion); false/omitido -> queda en borrador.
  publicar: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

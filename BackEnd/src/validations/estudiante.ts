import { z } from "zod";

/** Filtros del directorio de talento (GET /api/students/search, query string). */
export const SearchStudentsSchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  especialidad: z.enum(["frontend", "backend", "fullstack", "ia"]).optional(),
  disponibilidad: z.enum(["immediate", "two_weeks", "one_month", "unavailable"]).optional(),
  skill: z.string().uuid().optional(),
  modalidad: z.string().trim().min(1).max(40).optional(),
  // Si es true, solo estudiantes SIN proyecto activo (libres).
  solo_disponibles: z.coerce.boolean().optional(),
});

export type SearchStudentsInput = z.infer<typeof SearchStudentsSchema>;

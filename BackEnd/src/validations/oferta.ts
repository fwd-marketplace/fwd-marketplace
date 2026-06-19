import { z } from "zod";

/** El junior postula: su carta (propuesta) y, opcional, un prototipo y docs. */
export const CreateOfertaSchema = z.object({
  propuesta: z.string().min(1).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal("")]).optional(),
  url_repositorio: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  documentacion_tecnica: z.string().optional().nullable(),
  documentacion_url: z.union([z.string().url(), z.literal("")]).optional().nullable(),
});

/** La empresa decide sobre una postulación. */
export const DecideOfertaSchema = z.object({
  accion: z.enum(["aceptar", "rechazar"]),
});

/** La empresa califica al junior tras cerrar el proyecto. */
export const CalificarOfertaSchema = z.object({
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().optional(),
});

/** El junior replica a la calificación recibida. */
export const ReplicarCalificacionSchema = z.object({
  replica: z.string().min(1).max(1000),
});

export type CreateOfertaInput = z.infer<typeof CreateOfertaSchema>;
export type DecideOfertaInput = z.infer<typeof DecideOfertaSchema>;
export type CalificarOfertaInput = z.infer<typeof CalificarOfertaSchema>;
export type ReplicarCalificacionInput = z.infer<typeof ReplicarCalificacionSchema>;

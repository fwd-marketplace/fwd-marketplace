import { z } from "zod";

/** El junior postula: su carta (propuesta) y, opcional, un prototipo y docs. */
export const CreateOfertaSchema = z.object({
  propuesta: z.string().min(1).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal("")]).optional(),
  url_repositorio: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  documentacion_tecnica: z.string().optional().nullable(),
  documentacion_url: z.union([z.string().url(), z.literal("")]).optional().nullable(),
}).refine(
  (d) => !!(d.prototipo_url || d.documentacion_url),
  { message: "Debés adjuntar un enlace de documentación o subir un archivo PDF" },
);

/** La empresa decide sobre una postulación. */
export const DecideOfertaSchema = z.object({
  accion: z.enum(["aceptar", "rechazar"]),
});

/** La empresa revisa una postulación: cambia estado y deja comentario opcional. */
export const ReviewOfertaSchema = z.object({
  accion: z.enum(["en_revision", "solicitar_cambios", "aceptar", "rechazar"]),
  comentario: z.string().max(2000).optional(),
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

/** El junior edita su propia propuesta (solo si aún está en "enviada"). */
export const EditOfertaSchema = z.object({
  propuesta: z.string().min(1).max(5000).optional(),
  prototipo_url: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  url_repositorio: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  documentacion_tecnica: z.string().optional().nullable(),
  documentacion_url: z.union([z.string().url(), z.literal("")]).optional().nullable(),
});

export type CreateOfertaInput = z.infer<typeof CreateOfertaSchema>;
export type DecideOfertaInput = z.infer<typeof DecideOfertaSchema>;
export type ReviewOfertaInput = z.infer<typeof ReviewOfertaSchema>;
export type CalificarOfertaInput = z.infer<typeof CalificarOfertaSchema>;
export type ReplicarCalificacionInput = z.infer<typeof ReplicarCalificacionSchema>;
export type EditOfertaInput = z.infer<typeof EditOfertaSchema>;

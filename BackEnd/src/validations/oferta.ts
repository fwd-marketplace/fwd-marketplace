import { z } from "zod";

/** El junior postula: su carta (propuesta) y, opcional, un prototipo. */
export const CreateOfertaSchema = z.object({
  propuesta: z.string().min(1).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal("")]).optional(),
});

/** La empresa decide sobre una postulación. */
export const DecideOfertaSchema = z.object({
  accion: z.enum(["aceptar", "rechazar"]),
});

export type CreateOfertaInput = z.infer<typeof CreateOfertaSchema>;
export type DecideOfertaInput = z.infer<typeof DecideOfertaSchema>;

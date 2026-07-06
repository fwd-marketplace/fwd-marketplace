import { z } from "zod";

/** Cuerpo del cotejo previo al registro: solo la cédula del aspirante a junior. */
export const VerificarEgresadoSchema = z.object({
  cedula: z.string().min(1, "La cédula es obligatoria").max(20),
});

export type VerificarEgresado = z.infer<typeof VerificarEgresadoSchema>;

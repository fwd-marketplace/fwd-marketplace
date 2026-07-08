import { z } from "zod";

/** Motivos de reporte de un mensaje (deben coincidir con el CHECK de `mensaje_reporte.motivo`). */
export const MOTIVOS_REPORTE = [
  "falta_respeto",
  "spam",
  "contenido_inapropiado",
  "fuera_de_lugar",
  "otro",
] as const;

/** Cuerpo de `POST /api/reportes`: un participante reporta un mensaje del chat. */
export const CrearReporteSchema = z.object({
  id_mensaje: z.string().uuid(),
  motivo: z.enum(MOTIVOS_REPORTE),
  detalle: z.string().max(1000).optional(),
});

export type CrearReporteInput = z.infer<typeof CrearReporteSchema>;

/** Estados con los que el admin resuelve un reporte (no 'pendiente', que es el inicial). */
export const ResolverReporteSchema = z.object({
  estado: z.enum(["revisado", "desestimado"]),
});

export type ResolverReporteInput = z.infer<typeof ResolverReporteSchema>;

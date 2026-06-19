import { z } from "zod";

/**
 * Un turno del historial conversacional que el FrontEnd reenvía en cada llamada
 * (la API no tiene memoria). Solo roles del usuario y del asistente; el `system`
 * lo añade el BackEnd, nunca llega del cliente.
 */
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

/** Cuerpo de `POST /ai/asistente-proyecto` y `POST /ai/generar-propuesta`. */
export const AsistenteRequestSchema = z.object({
  history: z.array(ChatMessageSchema).min(1).max(40),
});

export type AsistenteRequestInput = z.infer<typeof AsistenteRequestSchema>;

/**
 * Validación del JSON que devuelve el modelo, ANTES de mapearlo al formulario.
 * Es permisiva a propósito (el modelo varía en formato): el service normaliza,
 * acota y descarta lo inválido. Lo único que garantizamos aquí es la forma.
 */
export const ProposalRawSchema = z.object({
  nombre: z.string().optional(),
  // Descripción redactada por el modelo (texto natural y detallado para el formulario).
  descripcion: z.string().optional(),
  objetivo: z.string().optional(),
  // Funcionalidades concretas del proyecto (respaldo estructurado).
  funcionalidades: z.array(z.string()).optional(),
  publico_objetivo: z.string().optional(),
  area_negocio: z.string().optional(),
  // El modelo a veces devuelve el plazo como número y a veces como texto ("10 días").
  plazo_dias: z.union([z.number(), z.string()]).optional(),
  // A veces strings ("React"), a veces objetos ({ nombre: "React" }).
  habilidades: z.array(z.union([z.string(), z.object({ nombre: z.string() })])).optional(),
  usa_ia: z.boolean().optional(),
  estilos_diseno: z.array(z.string()).optional(),
  preguntas_pendientes: z.array(z.string()).optional(),
});

export type ProposalRaw = z.infer<typeof ProposalRawSchema>;

/** Cuerpo de `POST /ai/sugerir-stack` (flujo manual: ya hay una descripción del proyecto). */
export const SugerirStackRequestSchema = z.object({
  titulo: z.string().max(255).optional(),
  descripcion: z.string().min(10).max(5000),
  id_area_negocio: z.string().uuid().optional(),
});

export type SugerirStackInput = z.infer<typeof SugerirStackRequestSchema>;

/** Validación del JSON que devuelve el modelo para la sugerencia de stack. */
export const StackRawSchema = z.object({
  habilidades: z.array(z.union([z.string(), z.object({ nombre: z.string() })])).optional(),
  justificacion: z.string().optional(),
});

export type StackRaw = z.infer<typeof StackRawSchema>;

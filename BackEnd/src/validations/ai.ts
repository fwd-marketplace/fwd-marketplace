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

/**
 * Idioma en el que debe responder la IA. Llega del FrontEnd (el locale de la URL /es o /en).
 * Por defecto español, para no romper clientes que aún no lo envíen.
 */
export const LocaleSchema = z.enum(["es", "en"]);

export type AppLocale = z.infer<typeof LocaleSchema>;

/** Cuerpo de `POST /ai/asistente-proyecto` y `POST /ai/generar-propuesta`. */
export const AsistenteRequestSchema = z.object({
  history: z.array(ChatMessageSchema).min(1).max(40),
  locale: LocaleSchema.default("es"),
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
  locale: LocaleSchema.default("es"),
});

export type SugerirStackInput = z.infer<typeof SugerirStackRequestSchema>;

/**
 * Cuerpo de `POST /ai/mejorar-mensaje`: el borrador que la empresa va a enviar en el chat y,
 * opcionalmente, el proyecto al que pertenece la conversación (para precisar el contexto técnico).
 */
export const MejorarMensajeRequestSchema = z.object({
  borrador: z.string().min(1).max(5000),
  proyecto_id: z.string().uuid().optional(),
});

export type MejorarMensajeInput = z.infer<typeof MejorarMensajeRequestSchema>;

/** Validación del JSON que devuelve el modelo para la sugerencia de stack. */
export const StackRawSchema = z.object({
  habilidades: z.array(z.union([z.string(), z.object({ nombre: z.string() })])).optional(),
  justificacion: z.string().optional(),
});

export type StackRaw = z.infer<typeof StackRawSchema>;

/** Cuerpo de `POST /ai/sugerir-compensacion` (flujo manual: la empresa ya describió el proyecto). */
export const SugerirCompensacionRequestSchema = z.object({
  titulo: z.string().max(255).optional(),
  descripcion: z.string().min(10).max(5000),
  id_area_negocio: z.string().uuid().optional(),
  plazo_dias: z.number().int().min(5).max(15).optional(),
  skills: z.array(z.string().uuid()).max(30).optional(),
  locale: LocaleSchema.default("es"),
});

export type SugerirCompensacionInput = z.infer<typeof SugerirCompensacionRequestSchema>;

/** Validación del JSON que devuelve el modelo para la sugerencia de compensación. */
export const CompensacionRawSchema = z.object({
  // El modelo a veces devuelve el monto como número y a veces como texto ("500").
  compensacion: z.union([z.number(), z.string()]).optional(),
  justificacion: z.string().optional(),
});

export type CompensacionRaw = z.infer<typeof CompensacionRawSchema>;

/**
 * Cuerpo de `POST /ai/sugerir-cotizacion` (flujo del junior): a partir de una descripción del
 * proyecto, la IA propone cómo llenar el formulario de la calculadora de cotización. El cálculo
 * del monto lo hace después la lógica pura del FrontEnd; la IA solo estima los campos.
 */
export const SugerirCotizacionRequestSchema = z.object({
  descripcion: z.string().min(10).max(5000),
  locale: LocaleSchema.default("es"),
});

export type SugerirCotizacionInput = z.infer<typeof SugerirCotizacionRequestSchema>;

/**
 * Validación del JSON que devuelve el modelo para la sugerencia de cotización. Permisivo a
 * propósito (el modelo varía en formato): el service normaliza, acota y descarta lo inválido.
 * Las claves son las del contrato del prompt (snake_case).
 */
export const CotizacionRawSchema = z.object({
  modo_alcance: z.string().optional(),
  horas_estimadas: z.union([z.number(), z.string()]).optional(),
  semanas: z.union([z.number(), z.string()]).optional(),
  horas_por_semana: z.union([z.number(), z.string()]).optional(),
  complejidad: z.string().optional(),
  stack: z.array(z.string()).optional(),
  funcionalidades: z
    .array(
      z.object({
        nombre: z.string().optional(),
        cantidad: z.union([z.number(), z.string()]).optional(),
        tamano: z.string().optional(),
      }),
    )
    .optional(),
  tarifa_hora: z.union([z.number(), z.string()]).optional(),
  modalidad: z.string().optional(),
  aplica_iva: z.boolean().optional(),
  justificacion: z.string().optional(),
});

export type CotizacionRaw = z.infer<typeof CotizacionRawSchema>;

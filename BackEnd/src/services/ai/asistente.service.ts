import { supabaseForToken } from "../../config/supabase";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import type { Json } from "../../types/database.types";
import {
  ProposalRawSchema,
  StackRawSchema,
  CompensacionRawSchema,
  CotizacionRawSchema,
  type AppLocale,
  type ProposalRaw,
  type StackRaw,
  type CompensacionRaw,
  type CotizacionRaw,
} from "../../validations/ai";
import {
  buildSystemPromptConversacion,
  buildSystemPromptPropuesta,
  buildSystemPromptStack,
  buildSystemPromptCompensacion,
  buildSystemPromptCotizacion,
  COMPENSACION_MAX_USD,
  COMPENSACION_MIN_USD,
  PLAZO_MAX_DIAS,
  PLAZO_MIN_DIAS,
  TARIFA_HORA_BASE_USD,
  TARIFA_HORA_MAX_USD,
  TARIFA_HORA_MIN_USD,
  type CatalogArea,
  type CatalogSkill,
  type ProjectCatalog,
} from "./prompts";
import {
  createChatCompletion,
  streamChatCompletion,
  type ChatMessage,
  type StreamChunk,
} from "./provider";

/** Una habilidad de la propuesta, ya validada contra el catálogo (incluye su id). */
export interface ProposalSkill {
  id: string;
  nombre: string;
}

/**
 * Propuesta final que mapea 1:1 al formulario manual de "Crear proyecto".
 * Mantiene los campos del contrato (nombre, objetivo, area_negocio, plazo_dias,
 * habilidades, usa_ia, preguntas_pendientes) y agrega los ids ya resueltos
 * (`id_area_negocio` y `habilidades[].id`) para que el FrontEnd prellene directo.
 */
export interface ProjectProposal {
  nombre: string;
  /** Objetivo central del proyecto (2-4 frases). */
  objetivo: string;
  /** Funcionalidades concretas que pidió/necesita el proyecto. */
  funcionalidades: string[];
  publico_objetivo: string | null;
  /**
   * Descripción rica y estructurada (objetivo + funcionalidades en viñetas + público),
   * ya lista para precargar el campo `descripcion` del formulario. Es lo que reduce las
   * dudas del junior frente a una descripción vaga.
   */
  descripcion: string;
  area_negocio: string | null;
  id_area_negocio: string | null;
  plazo_dias: number;
  habilidades: ProposalSkill[];
  usa_ia: boolean;
  /** 2-3 ideas de estilo visual para que la empresa elija (informativo). */
  estilos_diseno: string[];
  preguntas_pendientes: string[];
}

export interface AsistenteParams {
  history: ChatMessage[];
  userId: string;
  accessToken: string;
  /** Idioma en el que debe responder la IA (locale del usuario). */
  locale: AppLocale;
  signal?: AbortSignal;
}

const TEMPERATURE_CONVERSACION = 0.5;
// Un poco más alta que 0 para que la descripción salga natural (no robótica); el modo
// JSON garantiza igual que la salida sea un objeto válido.
const TEMPERATURE_PROPUESTA = 0.35;
const DEFAULT_TITULO = "Proyecto sin título";
const DEFAULT_PLAZO_DIAS = 10;
const MAX_HABILIDADES = 15;
const MAX_FUNCIONALIDADES = 10;
const MAX_ESTILOS_DISENO = 3;
// Memoria/evolución con el uso: cuántos ejemplos anclar y cuánto recortar cada uno.
const MAX_EXEMPLARS = 3;
const EXEMPLAR_DESC_MAX_CHARS = 400;
const RESUMEN_MAX_CHARS = 1000;

/**
 * Carga áreas y habilidades del catálogo con la identidad del usuario (RLS:
 * `catalogo_lectura`). Sirve tanto para el contexto del modelo como para validar
 * y mapear su salida a ids reales.
 */
async function loadProjectCatalog(accessToken: string): Promise<ProjectCatalog> {
  const client = supabaseForToken(accessToken);

  const [skillsResult, areasResult] = await Promise.all([
    // Solo tecnologías: las habilidades blandas no aplican al stack de un proyecto.
    client.from("skills").select("id, nombre, tipo, categoria").eq("tipo", "tecnologia").order("nombre"),
    client.from("area_negocio").select("id, nombre, descripcion").eq("activo", true).order("nombre"),
  ]);

  if (skillsResult.error) throw new ApiError(500, skillsResult.error.message);
  if (areasResult.error) throw new ApiError(500, areasResult.error.message);

  const skills: CatalogSkill[] = skillsResult.data.map((skill) => ({
    id: skill.id,
    nombre: skill.nombre,
    tipo: skill.tipo ?? null,
    categoria: skill.categoria ?? null,
  }));
  const areas: CatalogArea[] = areasResult.data.map((area) => ({
    id: area.id,
    nombre: area.nombre,
    descripcion: area.descripcion ?? null,
  }));

  return { skills, areas };
}

/** Normaliza un nombre para comparar sin distinguir mayúsculas ni acentos. */
function normalizeName(value: string): string {
  // Bloque Unicode "Combining Diacritical Marks" (U+0300–U+036F): tras NFD, los
  // acentos quedan como marcas combinantes separadas que aquí se eliminan.
  const COMBINING_MARKS = /[̀-ͯ]/g;
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .trim()
    .toLowerCase();
}

/** Coacciona el plazo a un entero dentro del rango permitido (5-15). */
function clampPlazo(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PLAZO_DIAS;
  }
  return Math.min(PLAZO_MAX_DIAS, Math.max(PLAZO_MIN_DIAS, Math.round(parsed)));
}

/** Extrae el primer objeto JSON del texto, tolerando markdown o texto alrededor. */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

/** Parsea y valida el JSON del modelo; lanza 502 si no se pudo obtener algo usable. */
function parseProposal(content: string): ProposalRaw {
  const candidate = extractJsonObject(content);
  if (!candidate) {
    logger.warn("ai_proposal_parse_failed", { reason: "sin_objeto_json" });
    throw new ApiError(502, "El asistente no devolvió una propuesta válida. Completá el formulario manualmente.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    logger.warn("ai_proposal_parse_failed", { reason: "json_invalido" });
    throw new ApiError(502, "El asistente no devolvió una propuesta válida. Completá el formulario manualmente.");
  }

  const result = ProposalRawSchema.safeParse(parsed);
  if (!result.success) {
    logger.warn("ai_proposal_parse_failed", { reason: "forma_invalida" });
    throw new ApiError(502, "El asistente no devolvió una propuesta válida. Completá el formulario manualmente.");
  }
  return result.data;
}

/** Convierte los nombres de habilidades del modelo en habilidades reales del catálogo. */
function mapHabilidades(
  raw: ProposalRaw["habilidades"],
  catalog: ProjectCatalog,
): ProposalSkill[] {
  if (!raw || raw.length === 0) {
    return [];
  }

  const byName = new Map<string, CatalogSkill>();
  const byId = new Map<string, CatalogSkill>();
  for (const skill of catalog.skills) {
    byName.set(normalizeName(skill.nombre), skill);
    byId.set(skill.id, skill);
  }

  const seen = new Set<string>();
  const habilidades: ProposalSkill[] = [];
  for (const entry of raw) {
    const value = typeof entry === "string" ? entry : entry.nombre;
    if (!value) {
      continue;
    }
    // El modelo debería devolver nombres, pero aceptamos un id por si acaso.
    const match = byName.get(normalizeName(value)) ?? byId.get(value.trim());
    if (!match || seen.has(match.id)) {
      continue; // habilidad inventada o repetida -> se descarta
    }
    seen.add(match.id);
    habilidades.push({ id: match.id, nombre: match.nombre });
    if (habilidades.length >= MAX_HABILIDADES) {
      break;
    }
  }
  return habilidades;
}

/** Resuelve el nombre de área que eligió el modelo a un área real del catálogo. */
function resolveArea(
  rawArea: string | undefined,
  catalog: ProjectCatalog,
): { nombre: string | null; id: string | null } {
  if (!rawArea) {
    return { nombre: null, id: null };
  }
  const match = catalog.areas.find((area) => normalizeName(area.nombre) === normalizeName(rawArea));
  return match ? { nombre: match.nombre, id: match.id } : { nombre: null, id: null };
}

/**
 * Arma una descripción rica y estructurada a partir del objetivo, las funcionalidades y
 * el público. Es lo que precarga el formulario, para que el junior tenga claridad sobre
 * qué construir en vez de una descripción vaga.
 */
function composeDescripcion(
  objetivo: string,
  funcionalidades: string[],
  publicoObjetivo: string | null,
): string {
  const bloques: string[] = [];
  if (objetivo) {
    bloques.push(objetivo);
  }
  if (funcionalidades.length > 0) {
    bloques.push(["Funcionalidades principales:", ...funcionalidades.map((f) => `- ${f}`)].join("\n"));
  }
  if (publicoObjetivo) {
    bloques.push(`Público objetivo: ${publicoObjetivo}`);
  }
  return bloques.join("\n\n");
}

/** Construye la propuesta final (mapeada al formulario) a partir del JSON crudo. */
function mapProposal(raw: ProposalRaw, catalog: ProjectCatalog): ProjectProposal {
  const area = resolveArea(raw.area_negocio, catalog);
  const preguntas = (raw.preguntas_pendientes ?? [])
    .map((pregunta) => pregunta.trim())
    .filter((pregunta) => pregunta.length > 0);

  const objetivo = raw.objetivo?.trim() ?? "";
  const funcionalidades = (raw.funcionalidades ?? [])
    .map((funcionalidad) => funcionalidad.trim())
    .filter((funcionalidad) => funcionalidad.length > 0)
    .slice(0, MAX_FUNCIONALIDADES);
  const publicoObjetivo = raw.publico_objetivo?.trim() || null;
  const estilosDiseno = (raw.estilos_diseno ?? [])
    .map((estilo) => estilo.trim())
    .filter((estilo) => estilo.length > 0)
    .slice(0, MAX_ESTILOS_DISENO);

  return {
    nombre: raw.nombre?.trim() || DEFAULT_TITULO,
    objetivo,
    funcionalidades,
    publico_objetivo: publicoObjetivo,
    // Se prefiere la descripción que redactó el modelo (más natural); si no vino, se
    // compone una a partir de objetivo + funcionalidades + público como respaldo.
    descripcion: raw.descripcion?.trim() || composeDescripcion(objetivo, funcionalidades, publicoObjetivo),
    area_negocio: area.nombre,
    id_area_negocio: area.id,
    plazo_dias: clampPlazo(raw.plazo_dias),
    habilidades: mapHabilidades(raw.habilidades, catalog),
    usa_ia: raw.usa_ia ?? false,
    estilos_diseno: estilosDiseno,
    preguntas_pendientes: preguntas,
  };
}

/** Resume los mensajes del usuario para guardar el contexto de la conversación. */
function buildConversationSummary(history: ChatMessage[]): string {
  return history
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter((content) => content.length > 0)
    .join(" | ")
    .slice(0, RESUMEN_MAX_CHARS);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Extrae { nombre, descripcion } de una propuesta guardada (Json) si tiene descripción. */
function extractEjemplo(propuesta: Json): { nombre: string; descripcion: string } | null {
  if (propuesta && typeof propuesta === "object" && !Array.isArray(propuesta)) {
    const descripcion = typeof propuesta.descripcion === "string" ? propuesta.descripcion.trim() : "";
    if (descripcion) {
      const nombreRaw = typeof propuesta.nombre === "string" ? propuesta.nombre.trim() : "";
      return { nombre: nombreRaw || "Proyecto", descripcion };
    }
  }
  return null;
}

/**
 * Recupera ejemplos de proyectos bien definidos para anclar la propuesta nueva: proyectos
 * reales visibles en la plataforma (cross-empresa, públicos por RLS) y las propias propuestas
 * anteriores de la empresa. Es lo que hace que el asistente "evolucione con el uso": a más
 * proyectos creados, mejores referencias. Lectura best-effort (cada query usa `data ?? []`),
 * así que si la tabla de memoria todavía no está aplicada, simplemente no aporta ejemplos.
 */
async function loadExemplars(accessToken: string): Promise<string | null> {
  const client = supabaseForToken(accessToken);
  const ejemplos: string[] = [];

  // 1. Proyectos reales visibles en la plataforma (cross-empresa).
  const proyectos = await client
    .from("proyecto")
    .select("titulo, descripcion")
    .order("fecha_publicacion", { ascending: false, nullsFirst: false })
    .limit(MAX_EXEMPLARS);
  for (const proyecto of proyectos.data ?? []) {
    const descripcion = proyecto.descripcion?.trim();
    if (descripcion) {
      ejemplos.push(`- ${proyecto.titulo}: ${truncate(descripcion, EXEMPLAR_DESC_MAX_CHARS)}`);
    }
  }

  // 2. Propias propuestas anteriores de la empresa (memoria; requiere la migración 0024).
  const propias = await client
    .from("ai_propuesta_ejemplo")
    .select("propuesta")
    .order("fecha", { ascending: false })
    .limit(MAX_EXEMPLARS);
  for (const fila of propias.data ?? []) {
    const ejemplo = extractEjemplo(fila.propuesta);
    if (ejemplo) {
      ejemplos.push(`- ${ejemplo.nombre}: ${truncate(ejemplo.descripcion, EXEMPLAR_DESC_MAX_CHARS)}`);
    }
  }

  const unicos = [...new Set(ejemplos)].slice(0, MAX_EXEMPLARS);
  if (unicos.length === 0) {
    return null;
  }
  return `Ejemplos de proyectos reales bien definidos en la plataforma (inspirate en el nivel de
detalle y el tono; NO los copies, adaptate a lo que pidió esta empresa):
${unicos.join("\n")}`;
}

/**
 * Guarda la propuesta generada como "memoria" para evolucionar con el uso. Best-effort: si la
 * tabla aún no existe o el insert falla, se registra un warning y se sigue (no bloquea la
 * respuesta al usuario).
 */
async function storeExample(
  accessToken: string,
  userId: string,
  proposal: ProjectProposal,
  resumen: string,
): Promise<void> {
  const client = supabaseForToken(accessToken);
  const propuesta: Json = {
    nombre: proposal.nombre,
    objetivo: proposal.objetivo,
    descripcion: proposal.descripcion,
    funcionalidades: proposal.funcionalidades,
    habilidades: proposal.habilidades.map((habilidad) => habilidad.nombre),
    plazo_dias: proposal.plazo_dias,
  };
  const { error } = await client.from("ai_propuesta_ejemplo").insert({
    id_usuario: userId,
    id_area_negocio: proposal.id_area_negocio,
    resumen_conversacion: resumen,
    propuesta,
  });
  if (error) {
    logger.warn("ai_ejemplo_store_failed", { reason: error.message });
  }
}

/**
 * Turno conversacional con streaming. Antepone el system prompt al historial que
 * llega del FrontEnd y reemite los fragmentos del proveedor. En el evento final
 * registra el uso (tokens/latencia) sin guardar el contenido de la conversación.
 */
export async function* streamAsistente(params: AsistenteParams): AsyncGenerator<StreamChunk> {
  const catalog = await loadProjectCatalog(params.accessToken);
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptConversacion(catalog, params.locale) },
    ...params.history,
  ];

  for await (const chunk of streamChatCompletion({
    messages,
    temperature: TEMPERATURE_CONVERSACION,
    signal: params.signal,
  })) {
    if (chunk.type === "done") {
      logger.info("ai_usage", {
        userId: params.userId,
        action: "asistente",
        provider: chunk.provider,
        model: chunk.model,
        totalTokens: chunk.usage?.totalTokens ?? null,
        latencyMs: chunk.latencyMs,
      });
    }
    yield chunk;
  }
}

/**
 * Genera la propuesta estructurada final a partir de la conversación. Fuerza JSON,
 * lo valida, mapea habilidades y área a ids reales del catálogo y acota el plazo.
 * Si el modelo no devuelve algo usable, lanza 502 para que el FrontEnd degrade al
 * formulario manual.
 */
export async function generarPropuesta(params: AsistenteParams): Promise<ProjectProposal> {
  const catalog = await loadProjectCatalog(params.accessToken);

  // Evolución con el uso: anclar la propuesta en ejemplos reales (best-effort).
  let ejemplos: string | null = null;
  try {
    ejemplos = await loadExemplars(params.accessToken);
  } catch (error) {
    logger.warn("ai_ejemplos_load_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptPropuesta(catalog, params.locale) },
    ...(ejemplos ? [{ role: "system" as const, content: ejemplos }] : []),
    ...params.history,
    { role: "user", content: "Generá ahora la propuesta final en el JSON pedido, sin texto adicional." },
  ];

  const completion = await createChatCompletion({
    messages,
    temperature: TEMPERATURE_PROPUESTA,
    json: true,
    signal: params.signal,
  });

  logger.info("ai_usage", {
    userId: params.userId,
    action: "propuesta",
    provider: completion.provider,
    model: completion.model,
    totalTokens: completion.usage?.totalTokens ?? null,
    latencyMs: completion.latencyMs,
  });

  const raw = parseProposal(completion.content);
  const proposal = mapProposal(raw, catalog);

  // Guardar la propuesta como memoria para evolucionar con el uso (best-effort).
  try {
    await storeExample(
      params.accessToken,
      params.userId,
      proposal,
      buildConversationSummary(params.history),
    );
  } catch (error) {
    logger.warn("ai_ejemplo_store_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  return proposal;
}

/** Sugerencia de stack tecnológico para el formulario manual de crear proyecto. */
export interface StackSuggestion {
  habilidades: ProposalSkill[];
  justificacion: string;
}

export interface SugerirStackParams {
  titulo?: string;
  descripcion: string;
  areaId?: string;
  userId: string;
  accessToken: string;
  /** Idioma en el que debe responder la IA (locale del usuario). */
  locale: AppLocale;
  signal?: AbortSignal;
}

/** Parsea y valida el JSON de la sugerencia de stack; lanza 502 si no es usable. */
function parseStack(content: string): StackRaw {
  const candidate = extractJsonObject(content);
  const mensajeError = "No se pudo sugerir un stack. Probá elegir las habilidades manualmente.";
  if (!candidate) {
    throw new ApiError(502, mensajeError);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new ApiError(502, mensajeError);
  }
  const result = StackRawSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(502, mensajeError);
  }
  return result.data;
}

/**
 * A partir de la descripción de un proyecto (flujo manual), recomienda habilidades del
 * catálogo. Valida y mapea contra el catálogo real (descarta inventadas) y devuelve una
 * justificación corta para un usuario sin perfil técnico.
 */
export async function sugerirStack(params: SugerirStackParams): Promise<StackSuggestion> {
  const catalog = await loadProjectCatalog(params.accessToken);
  const areaNombre = params.areaId
    ? (catalog.areas.find((area) => area.id === params.areaId)?.nombre ?? null)
    : null;

  const contexto = [
    params.titulo ? `Título: ${params.titulo}` : null,
    areaNombre ? `Área: ${areaNombre}` : null,
    `Descripción: ${params.descripcion}`,
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptStack(catalog, params.locale) },
    { role: "user", content: `${contexto}\n\nRecomendá el stack en el JSON pedido.` },
  ];

  const completion = await createChatCompletion({
    messages,
    temperature: TEMPERATURE_PROPUESTA,
    json: true,
    signal: params.signal,
  });

  logger.info("ai_usage", {
    userId: params.userId,
    action: "sugerir_stack",
    provider: completion.provider,
    model: completion.model,
    totalTokens: completion.usage?.totalTokens ?? null,
    latencyMs: completion.latencyMs,
  });

  const raw = parseStack(completion.content);
  return {
    habilidades: mapHabilidades(raw.habilidades, catalog),
    justificacion: raw.justificacion?.trim() ?? "",
  };
}

/** Sugerencia de compensación (pago total en USD) para el formulario manual de crear proyecto. */
export interface CompensacionSuggestion {
  compensacion: number;
  justificacion: string;
}

export interface SugerirCompensacionParams {
  titulo?: string;
  descripcion: string;
  areaId?: string;
  plazoDias?: number;
  skillIds?: string[];
  userId: string;
  accessToken: string;
  /** Idioma en el que debe responder la IA (locale del usuario). */
  locale: AppLocale;
  signal?: AbortSignal;
}

/** Coacciona el monto a un entero dentro del rango permitido (50-10000 USD). */
function clampCompensacion(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) {
    return COMPENSACION_MIN_USD;
  }
  return Math.min(COMPENSACION_MAX_USD, Math.max(COMPENSACION_MIN_USD, Math.round(parsed)));
}

/** Parsea y valida el JSON de la sugerencia de compensación; lanza 502 si no es usable. */
function parseCompensacion(content: string): CompensacionRaw {
  const candidate = extractJsonObject(content);
  const mensajeError = "No se pudo sugerir un monto. Escribí la compensación manualmente.";
  if (!candidate) {
    throw new ApiError(502, mensajeError);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new ApiError(502, mensajeError);
  }
  const result = CompensacionRawSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(502, mensajeError);
  }
  return result.data;
}

/** Cuántos proyectos reales anclan la sugerencia de precio. */
const MAX_PRICE_EXEMPLARS = 5;

/**
 * Trae compensaciones de proyectos reales YA PUBLICADOS para anclar la sugerencia en datos de la
 * propia plataforma (no en la conjetura del modelo). Prioriza los de la misma área y completa con
 * los más recientes. La visibilidad la garantiza el RLS (publicados o propios). Best-effort: ante
 * cualquier error devuelve null y la sugerencia cae en las bandas orientativas del prompt. Es lo
 * que hace que el precio "evolucione con el uso": a más proyectos con precio, mejores anclas.
 */
async function loadCompensacionExemplars(
  accessToken: string,
  areaNombre: string | null,
): Promise<string | null> {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("proyecto")
    .select("titulo, plazo_dias, compensacion, moneda, area:area_negocio(nombre)")
    .not("compensacion", "is", null)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false })
    .limit(20);
  if (error || !data || data.length === 0) {
    return null;
  }

  // Priorizar la misma área (mejores comparables), completar con el resto de los más recientes.
  const mismaArea = areaNombre ? data.filter((p) => p.area?.nombre === areaNombre) : [];
  const resto = data.filter((p) => !mismaArea.includes(p));
  const elegidos = [...mismaArea, ...resto].slice(0, MAX_PRICE_EXEMPLARS);
  if (elegidos.length === 0) {
    return null;
  }

  const lineas = elegidos.map(
    (p) =>
      `- ${p.titulo} (${p.area?.nombre ?? "sin área"}, ${p.plazo_dias} días): $${(p.compensacion ?? 0).toLocaleString("en-US")} ${p.moneda}`,
  );
  return `Precios de proyectos reales comparables ya publicados en la plataforma. Usalos como
referencia PRINCIPAL para calibrar tu sugerencia (por sobre las bandas orientativas); adaptate al
alcance de ESTE proyecto y respetá siempre el rango permitido:
${lineas.join("\n")}`;
}

/**
 * A partir de la descripción de un proyecto (flujo manual), sugiere un pago total en USD para el
 * junior, dentro del rango del sistema, con una justificación corta para alguien sin perfil técnico.
 * Ancla la sugerencia en precios de proyectos reales comparables de la plataforma (best-effort). El
 * monto se acota al rango permitido por si el modelo se sale. Es informativo: la empresa decide.
 */
export async function sugerirCompensacion(
  params: SugerirCompensacionParams,
): Promise<CompensacionSuggestion> {
  const catalog = await loadProjectCatalog(params.accessToken);
  const areaNombre = params.areaId
    ? (catalog.areas.find((area) => area.id === params.areaId)?.nombre ?? null)
    : null;
  const skillNombres = (params.skillIds ?? [])
    .map((id) => catalog.skills.find((skill) => skill.id === id)?.nombre)
    .filter((nombre): nombre is string => Boolean(nombre));

  // Anclar en datos reales de la plataforma (best-effort: si falla, se usan las bandas del prompt).
  let ejemplos: string | null = null;
  try {
    ejemplos = await loadCompensacionExemplars(params.accessToken, areaNombre);
  } catch (error) {
    logger.warn("ai_compensacion_ejemplos_load_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  const contexto = [
    params.titulo ? `Título: ${params.titulo}` : null,
    areaNombre ? `Área: ${areaNombre}` : null,
    params.plazoDias ? `Plazo: ${params.plazoDias} días` : null,
    skillNombres.length > 0 ? `Stack: ${skillNombres.join(", ")}` : null,
    `Descripción: ${params.descripcion}`,
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptCompensacion(catalog, params.locale) },
    ...(ejemplos ? [{ role: "system" as const, content: ejemplos }] : []),
    { role: "user", content: `${contexto}\n\nSugerí la compensación en el JSON pedido.` },
  ];

  const completion = await createChatCompletion({
    messages,
    temperature: TEMPERATURE_PROPUESTA,
    json: true,
    signal: params.signal,
  });

  logger.info("ai_usage", {
    userId: params.userId,
    action: "sugerir_compensacion",
    provider: completion.provider,
    model: completion.model,
    totalTokens: completion.usage?.totalTokens ?? null,
    latencyMs: completion.latencyMs,
  });

  const raw = parseCompensacion(completion.content);
  return {
    compensacion: clampCompensacion(raw.compensacion),
    justificacion: raw.justificacion?.trim() ?? "",
  };
}

// ── Sugerencia de cotización (flujo del junior: llenar la calculadora) ─────────────

/** Modo de alcance, complejidad, modalidad y tamaño de funcionalidad: dominios cerrados del form. */
type CotizacionModoAlcance = "horas" | "semanas";
type CotizacionComplejidad = "baja" | "media" | "alta";
type CotizacionModalidad = "remoto" | "hibrido" | "presencial";
type CotizacionTamano = "muy_pequena" | "pequena" | "media" | "grande";

/** Una funcionalidad sugerida, ya normalizada al dominio del formulario. */
export interface CotizacionFuncionalidad {
  nombre: string;
  cantidad: number;
  tamano: CotizacionTamano;
}

/**
 * Sugerencia para llenar el formulario de la calculadora de cotización. Mapea 1:1 a los campos
 * que maneja `FrontEnd/components/gestion/PricingCalculator.tsx`. El monto NO viene aquí: lo
 * calcula la lógica pura del FrontEnd con estos campos.
 */
export interface CotizacionSuggestion {
  modoAlcance: CotizacionModoAlcance;
  horasEstimadas: number;
  semanas: number;
  horasPorSemana: number;
  complejidad: CotizacionComplejidad;
  stack: string[];
  funcionalidades: CotizacionFuncionalidad[];
  /** Tarifa por hora en USD, ya acotada al rango permitido. */
  tarifaHora: number;
  modalidad: CotizacionModalidad;
  aplicaIva: boolean;
  justificacion: string;
}

export interface SugerirCotizacionParams {
  descripcion: string;
  userId: string;
  accessToken: string;
  /** Idioma en el que debe responder la IA (locale del usuario). */
  locale: AppLocale;
  signal?: AbortSignal;
}

const HORAS_POR_SEMANA_COTIZACION_DEFAULT = 20;
const MAX_FUNCIONALIDADES_COTIZACION = 20;
const TAMANOS_VALIDOS: readonly CotizacionTamano[] = ["muy_pequena", "pequena", "media", "grande"];
const COMPLEJIDADES_VALIDAS: readonly CotizacionComplejidad[] = ["baja", "media", "alta"];
const MODALIDADES_VALIDAS: readonly CotizacionModalidad[] = ["remoto", "hibrido", "presencial"];

/** Convierte number|string|undefined a un número finito >= 0 (0 si no es parseable). */
function toNonNegativeNumber(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Escoge `value` si está dentro del conjunto permitido; si no, devuelve `fallback`. */
function pickEnum<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes((value ?? "") as T) ? (value as T) : fallback;
}

/** Acota la tarifa por hora al rango permitido; cae en la base si no es parseable. */
function clampTarifa(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return TARIFA_HORA_BASE_USD;
  }
  return Math.min(TARIFA_HORA_MAX_USD, Math.max(TARIFA_HORA_MIN_USD, Math.round(parsed * 100) / 100));
}

/** Parsea y valida el JSON de la cotización; lanza 502 si no es usable. */
function parseCotizacion(content: string): CotizacionRaw {
  const candidate = extractJsonObject(content);
  const mensajeError = "No se pudo generar la cotización. Llená el formulario manualmente.";
  if (!candidate) {
    throw new ApiError(502, mensajeError);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new ApiError(502, mensajeError);
  }
  const result = CotizacionRawSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(502, mensajeError);
  }
  return result.data;
}

/** Normaliza las funcionalidades crudas del modelo al dominio del formulario (cap y defaults). */
function normalizeFuncionalidades(raw: CotizacionRaw["funcionalidades"]): CotizacionFuncionalidad[] {
  if (!raw) {
    return [];
  }
  return raw.slice(0, MAX_FUNCIONALIDADES_COTIZACION).map((funcionalidad) => ({
    nombre: funcionalidad.nombre?.trim() ?? "",
    cantidad: Math.max(1, Math.floor(toNonNegativeNumber(funcionalidad.cantidad)) || 1),
    tamano: pickEnum(funcionalidad.tamano, TAMANOS_VALIDOS, "media"),
  }));
}

/**
 * A partir de la descripción del proyecto (flujo del junior), sugiere cómo llenar la calculadora de
 * cotización: alcance, complejidad, stack, funcionalidades, tarifa, modalidad e IVA. Normaliza y
 * acota todo al dominio del formulario; el monto final lo calcula la lógica pura del FrontEnd. El
 * FrontEnd vuelve a filtrar el stack contra sus opciones por si el modelo devuelve algo fuera de lista.
 */
export async function sugerirCotizacion(params: SugerirCotizacionParams): Promise<CotizacionSuggestion> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptCotizacion(params.locale) },
    { role: "user", content: `Descripción: ${params.descripcion}\n\nGenerá la cotización en el JSON pedido.` },
  ];

  const completion = await createChatCompletion({
    messages,
    temperature: TEMPERATURE_PROPUESTA,
    json: true,
    signal: params.signal,
  });

  logger.info("ai_usage", {
    userId: params.userId,
    action: "sugerir_cotizacion",
    provider: completion.provider,
    model: completion.model,
    totalTokens: completion.usage?.totalTokens ?? null,
    latencyMs: completion.latencyMs,
  });

  const raw = parseCotizacion(completion.content);
  const horasPorSemana = toNonNegativeNumber(raw.horas_por_semana) || HORAS_POR_SEMANA_COTIZACION_DEFAULT;
  return {
    modoAlcance: pickEnum<CotizacionModoAlcance>(raw.modo_alcance, ["horas", "semanas"], "horas"),
    horasEstimadas: Math.round(toNonNegativeNumber(raw.horas_estimadas)),
    semanas: Math.round(toNonNegativeNumber(raw.semanas)),
    horasPorSemana: Math.round(horasPorSemana),
    complejidad: pickEnum(raw.complejidad, COMPLEJIDADES_VALIDAS, "media"),
    stack: (raw.stack ?? []).map((tecnologia) => tecnologia.trim()).filter(Boolean),
    funcionalidades: normalizeFuncionalidades(raw.funcionalidades),
    tarifaHora: clampTarifa(raw.tarifa_hora),
    modalidad: pickEnum(raw.modalidad, MODALIDADES_VALIDAS, "remoto"),
    aplicaIva: raw.aplica_iva === true,
    justificacion: raw.justificacion?.trim() ?? "",
  };
}

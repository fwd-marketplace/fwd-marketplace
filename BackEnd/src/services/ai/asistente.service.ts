import { supabaseForToken } from "../../config/supabase";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { ProposalRawSchema, type ProposalRaw } from "../../validations/ai";
import {
  buildSystemPromptConversacion,
  buildSystemPromptPropuesta,
  PLAZO_MAX_DIAS,
  PLAZO_MIN_DIAS,
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
  objetivo: string;
  area_negocio: string | null;
  id_area_negocio: string | null;
  plazo_dias: number;
  habilidades: ProposalSkill[];
  usa_ia: boolean;
  preguntas_pendientes: string[];
}

export interface AsistenteParams {
  history: ChatMessage[];
  userId: string;
  accessToken: string;
  signal?: AbortSignal;
}

const TEMPERATURE_CONVERSACION = 0.5;
const TEMPERATURE_PROPUESTA = 0.2;
const DEFAULT_TITULO = "Proyecto sin título";
const DEFAULT_PLAZO_DIAS = 10;
const MAX_HABILIDADES = 15;

/**
 * Carga áreas y habilidades del catálogo con la identidad del usuario (RLS:
 * `catalogo_lectura`). Sirve tanto para el contexto del modelo como para validar
 * y mapear su salida a ids reales.
 */
async function loadProjectCatalog(accessToken: string): Promise<ProjectCatalog> {
  const client = supabaseForToken(accessToken);

  const [skillsResult, areasResult] = await Promise.all([
    client.from("skills").select("id, nombre, tipo, categoria").order("nombre"),
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

/** Construye la propuesta final (mapeada al formulario) a partir del JSON crudo. */
function mapProposal(raw: ProposalRaw, catalog: ProjectCatalog): ProjectProposal {
  const area = resolveArea(raw.area_negocio, catalog);
  const preguntas = (raw.preguntas_pendientes ?? [])
    .map((pregunta) => pregunta.trim())
    .filter((pregunta) => pregunta.length > 0);

  return {
    nombre: raw.nombre?.trim() || DEFAULT_TITULO,
    objetivo: raw.objetivo?.trim() ?? "",
    area_negocio: area.nombre,
    id_area_negocio: area.id,
    plazo_dias: clampPlazo(raw.plazo_dias),
    habilidades: mapHabilidades(raw.habilidades, catalog),
    usa_ia: raw.usa_ia ?? false,
    preguntas_pendientes: preguntas,
  };
}

/**
 * Turno conversacional con streaming. Antepone el system prompt al historial que
 * llega del FrontEnd y reemite los fragmentos del proveedor. En el evento final
 * registra el uso (tokens/latencia) sin guardar el contenido de la conversación.
 */
export async function* streamAsistente(params: AsistenteParams): AsyncGenerator<StreamChunk> {
  const catalog = await loadProjectCatalog(params.accessToken);
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptConversacion(catalog) },
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
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptPropuesta(catalog) },
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
  return mapProposal(raw, catalog);
}

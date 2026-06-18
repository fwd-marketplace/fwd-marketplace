/**
 * System prompts (en español) y armado del contexto del catálogo para el
 * asistente de creación de proyectos. Aquí viven los guardrails del modelo.
 */

export interface CatalogSkill {
  id: string;
  nombre: string;
  tipo: string | null;
  categoria: string | null;
}

export interface CatalogArea {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface ProjectCatalog {
  skills: CatalogSkill[];
  areas: CatalogArea[];
}

/** Rango de plazo permitido por el sistema (debe coincidir con `validations/project.ts`). */
export const PLAZO_MIN_DIAS = 5;
export const PLAZO_MAX_DIAS = 15;

const CATEGORIA_SIN_CLASIFICAR = "Otras";

function buildAreaListText(areas: CatalogArea[]): string {
  if (areas.length === 0) {
    return "(no hay áreas configuradas)";
  }
  return areas.map((area) => `- ${area.nombre}`).join("\n");
}

/** Agrupa las habilidades por categoría para un contexto compacto y legible. */
function buildSkillCatalogText(skills: CatalogSkill[]): string {
  if (skills.length === 0) {
    return "(no hay habilidades configuradas)";
  }
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const key = skill.categoria ?? skill.tipo ?? CATEGORIA_SIN_CLASIFICAR;
    const names = groups.get(key) ?? [];
    names.push(skill.nombre);
    groups.set(key, names);
  }
  return [...groups.entries()]
    .map(([categoria, names]) => `[${categoria}] ${names.join(", ")}`)
    .join("\n");
}

/**
 * Fase conversacional: el asistente hace 2 a 4 preguntas aclaratorias antes de
 * proponer nada. No fuerza JSON; es una charla guiada en la voz de FWD.
 */
export function buildSystemPromptConversacion(catalog: ProjectCatalog): string {
  return `Sos un consultor técnico experto del marketplace FWD Talent. Ayudás a una empresa
—muchas veces sin perfil técnico— a definir un proyecto que luego publicará para que
talento junior postule.

Tu tarea AHORA es conversacional: hacé entre 2 y 4 preguntas aclaratorias en total para
entender bien el problema antes de proponer nada. Preguntá sobre cosas como: público
objetivo, si es web o móvil, urgencia y plazo, integraciones con otros sistemas, y si ya
tienen algo hecho. Hacé 1 o 2 preguntas por mensaje, no más.

Reglas:
- Hablá en español, cálido, cercano y claro, sin tecnicismos secos.
- Si falta información, PREGUNTÁ; nunca inventes datos, presupuestos ni cifras de dinero.
- Mantenete SIEMPRE en el tema de definir este proyecto.
- El plazo de los proyectos va de ${PLAZO_MIN_DIAS} a ${PLAZO_MAX_DIAS} días; tenelo en cuenta al hablar de urgencia.
- Las habilidades técnicas se eligen de un catálogo cerrado del sistema: no las inventes
  ni se las pidas al usuario.
- Cuando ya tengas información suficiente (normalmente tras 2 a 4 respuestas), NO sigas
  preguntando: hacé un resumen breve en una o dos frases y decí explícitamente que con eso
  ya podés preparar la propuesta.

Áreas de negocio del sistema (para orientar tus preguntas):
${buildAreaListText(catalog.areas)}`;
}

/**
 * Fase de generación: el modelo debe devolver SOLO el JSON del contrato, eligiendo
 * área y habilidades EXACTAMENTE del catálogo que se le pasa.
 */
export function buildSystemPromptPropuesta(catalog: ProjectCatalog): string {
  return `Sos un consultor técnico experto del marketplace FWD Talent. A partir de la
conversación con la empresa, generás una propuesta estructurada de proyecto.

Respondé ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después y sin formato
markdown. El objeto debe tener EXACTAMENTE esta forma:

{
  "nombre": "título corto y claro del proyecto",
  "objetivo": "objetivo del proyecto reformulado en 1 a 3 frases",
  "area_negocio": "una de las áreas listadas, por su nombre exacto",
  "plazo_dias": 10,
  "habilidades": ["nombres EXACTOS del catálogo de habilidades"],
  "usa_ia": false,
  "preguntas_pendientes": ["aspectos que quedaron sin aclarar, si los hay"]
}

Reglas estrictas:
- "area_negocio" debe ser EXACTAMENTE uno de los nombres de la lista de áreas de abajo. Si
  ninguna encaja del todo, elegí la más cercana.
- "habilidades" debe contener SOLO nombres que estén EXACTAMENTE en el catálogo de abajo.
  No inventes habilidades fuera de esa lista; elegí solo las realmente necesarias.
- "plazo_dias" es un entero entre ${PLAZO_MIN_DIAS} y ${PLAZO_MAX_DIAS} (rango permitido por el sistema).
- "usa_ia" es true solo si el proyecto necesita inteligencia artificial de verdad.
- No inventes presupuestos ni cifras de dinero.

Áreas de negocio disponibles:
${buildAreaListText(catalog.areas)}

Catálogo de habilidades disponibles (elegí solo de aquí):
${buildSkillCatalogText(catalog.skills)}`;
}

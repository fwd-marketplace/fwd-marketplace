import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { estudiantesOcupados } from "./oferta.service";
import type { SearchStudentsInput } from "../validations/estudiante";

type Client = ReturnType<typeof supabaseForToken>;

/**
 * Columnas del directorio de talento. NO incluye `correo`: la búsqueda de
 * talento muestra el perfil público; el contacto se expone aparte (postulación).
 */
const STUDENT_SELECT =
  "id, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, estado_verificacion, reputacion, url_avatar, usuario:users(id, nombre, apellido1)";

/** `modalidad_preferida` se guarda como array JSON serializado (texto). */
function parseModalidades(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((m) => String(m)) : [];
  } catch {
    return [];
  }
}

/** Nombres de skills por estudiante (2 idas y vueltas, sin N+1 ni embeds anidados). */
async function skillsDeEstudiantes(client: Client, ids: string[]): Promise<Map<string, string[]>> {
  const skillsByStudent = new Map<string, string[]>();
  if (ids.length === 0) return skillsByStudent;

  const { data: links, error } = await client
    .from("student_skills")
    .select("id_estudiante, id_skill")
    .in("id_estudiante", ids);
  if (error) throw new ApiError(500, error.message);

  const skillIds = [...new Set((links ?? []).map((l) => l.id_skill))];
  const nameById = new Map<string, string>();
  if (skillIds.length > 0) {
    const { data: skills, error: skillsError } = await client
      .from("skills")
      .select("id, nombre")
      .in("id", skillIds);
    if (skillsError) throw new ApiError(500, skillsError.message);
    for (const s of skills ?? []) nameById.set(s.id, s.nombre);
  }

  for (const link of links ?? []) {
    const nombre = nameById.get(link.id_skill);
    if (!nombre) continue;
    const list = skillsByStudent.get(link.id_estudiante) ?? [];
    list.push(nombre);
    skillsByStudent.set(link.id_estudiante, list);
  }
  return skillsByStudent;
}

/**
 * Directorio de talento para empresas/emprendedores: lista estudiantes
 * VERIFICADOS con filtros. El RLS (estudiante_ver_perfil + users_company_ve_
 * verificados de la 0039) garantiza que solo un company/admin reciba datos y
 * solo de estudiantes verificados. Filtros de especialidad/disponibilidad/skill
 * van server-side; nombre/modalidad/disponibilidad-real se afinan en memoria.
 */
export async function searchStudents(accessToken: string, filters: SearchStudentsInput) {
  const client = supabaseForToken(accessToken);

  // Si filtran por skill, primero resolvemos qué estudiantes la tienen.
  let idsConSkill: string[] | null = null;
  if (filters.skill) {
    const { data: links, error } = await client
      .from("student_skills")
      .select("id_estudiante")
      .eq("id_skill", filters.skill);
    if (error) throw new ApiError(500, error.message);
    idsConSkill = [...new Set((links ?? []).map((l) => l.id_estudiante))];
    if (idsConSkill.length === 0) return [];
  }

  let query = client
    .from("estudiante")
    .select(STUDENT_SELECT)
    .eq("estado_verificacion", "verificado");
  if (filters.especialidad) query = query.eq("especialidad", filters.especialidad);
  if (filters.disponibilidad) query = query.eq("disponibilidad", filters.disponibilidad);
  if (idsConSkill) query = query.in("id", idsConSkill);

  const { data, error } = await query.order("id", { ascending: true });
  if (error) throw new ApiError(500, error.message);

  let rows = data ?? [];
  if (rows.length === 0) return [];

  if (filters.q) {
    const needle = filters.q.toLowerCase();
    rows = rows.filter((e) => {
      const nombre = `${e.usuario?.nombre ?? ""} ${e.usuario?.apellido1 ?? ""}`.toLowerCase();
      return nombre.includes(needle);
    });
  }

  if (filters.modalidad) {
    rows = rows.filter((e) => parseModalidades(e.modalidad_preferida).includes(filters.modalidad!));
  }

  const skillsByStudent = await skillsDeEstudiantes(client, rows.map((e) => e.id));
  const userIds = rows.map((e) => e.usuario?.id).filter((id): id is string => Boolean(id));
  const ocupados = await estudiantesOcupados(client, userIds);

  let result = rows.map((e) => ({
    ...e,
    skills: skillsByStudent.get(e.id) ?? [],
    // disponible = NO tiene un proyecto activo (no está ocupado).
    disponible: e.usuario ? !ocupados.has(e.usuario.id) : true,
  }));

  if (filters.solo_disponibles) {
    result = result.filter((e) => e.disponible);
  }

  return result;
}

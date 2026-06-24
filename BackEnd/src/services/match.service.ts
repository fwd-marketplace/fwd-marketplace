import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { readAppSettings } from "./settings.service";
import { searchStudents } from "./estudiante.service";

export interface MatchCandidate {
  id: string;
  usuario: { id: string; nombre: string; apellido1: string | null } | null;
  especialidad: string | null;
  titulo_fwd: string | null;
  url_avatar: string | null;
  modalidad_preferida: string | null;
  reputacion: number | null;
  estado_verificacion: string;
  skills: string[];
  disponible: boolean;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/** Cuántos candidatos se devuelven como máximo (los de mayor afinidad). */
const MAX_CANDIDATOS = 20;

/**
 * Puntúa la afinidad (0-100) entre las skills que pide el proyecto y las del
 * estudiante, premiando la disponibilidad y la reputación. Función pura (testeable).
 *  - Base: cobertura de skills hasta 80 puntos; estar disponible suma 20.
 *    Si el proyecto no declara skills, la cobertura es neutra (0.5).
 *  - Reputación: bonus de hasta +10 (reputacion 1-5 → 2-10). Es un desempate
 *    POSITIVO: a quien no tiene calificaciones (null) no se le resta nada, para no
 *    penalizar a los juniors nuevos. El total se topa en 100.
 * Devuelve también qué skills coinciden y cuáles faltan, para mostrarlas en la UI.
 */
export function computeMatchScore(
  projectSkills: string[],
  studentSkills: string[],
  disponible: boolean,
  reputacion: number | null = null,
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
  const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const matchedSkills = projectSkills.filter((s) => studentSet.has(s.toLowerCase()));
  const missingSkills = projectSkills.filter((s) => !studentSet.has(s.toLowerCase()));
  const cobertura = projectSkills.length > 0 ? matchedSkills.length / projectSkills.length : 0.5;
  const base = cobertura * 80 + (disponible ? 20 : 0);
  const repBonus = reputacion != null ? (reputacion / 5) * 10 : 0;
  const score = Math.min(100, Math.round(base + repBonus));
  return { score, matchedSkills, missingSkills };
}

/**
 * Candidatos rankeados por afinidad para un proyecto de la empresa. Verifica que
 * el usuario sea dueño del proyecto y respeta el flag global `enable_matching`.
 * Reutiliza el directorio de talento (estudiantes verificados con skills y
 * disponibilidad) y aplica el score contra las skills del proyecto.
 */
export async function matchStudentsForProject(
  accessToken: string,
  userId: string,
  projectId: string,
): Promise<{ enabled: boolean; candidates: MatchCandidate[] }> {
  const settings = await readAppSettings();
  if (!settings.enable_matching) return { enabled: false, candidates: [] };

  const client = supabaseForToken(accessToken);

  // Proyecto: dueño + skills requeridas.
  const { data: proyecto, error } = await client
    .from("proyecto")
    .select("id, empresa:empresario(id_usuario), skills:project_skills(skill:skills(nombre))")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  const projectSkills = (proyecto.skills ?? [])
    .map((s) => s.skill?.nombre)
    .filter((n): n is string => Boolean(n));

  // Estudiantes verificados (con skills y disponibilidad ya resueltas).
  const students = await searchStudents(accessToken, {});

  const candidates: MatchCandidate[] = students
    .map((e) => {
      const { score, matchedSkills, missingSkills } = computeMatchScore(
        projectSkills,
        e.skills,
        e.disponible,
        e.reputacion,
      );
      return {
        id: e.id,
        usuario: e.usuario ?? null,
        especialidad: e.especialidad,
        titulo_fwd: e.titulo_fwd,
        url_avatar: e.url_avatar,
        modalidad_preferida: e.modalidad_preferida,
        reputacion: e.reputacion,
        estado_verificacion: e.estado_verificacion,
        skills: e.skills,
        disponible: e.disponible,
        score,
        matchedSkills,
        missingSkills,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATOS);

  return { enabled: true, candidates };
}

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
  /** El estudiante ya postuló a este proyecto (tiene una oferta). */
  yaPostulo: boolean;
  /** La empresa ya invitó a este estudiante a este proyecto. */
  yaInvitado: boolean;
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
 *
 * Anota el estado real de cada candidato frente a ESTE proyecto para no tratar a
 * todos como si la empresa partiera de cero: quién ya postuló (`yaPostulo`) y a
 * quién ya se invitó (`yaInvitado`, persistido, no solo en la sesión del cliente).
 * `puedeInvitar` indica si el proyecto sigue recibiendo propuestas (solo en
 * `en_recepcion` la invitación es válida). Si el proyecto declara skills, los
 * candidatos sin ninguna skill en común no son "match" y se excluyen.
 */
export async function matchStudentsForProject(
  accessToken: string,
  userId: string,
  projectId: string,
): Promise<{ enabled: boolean; puedeInvitar: boolean; candidates: MatchCandidate[] }> {
  const settings = await readAppSettings();
  if (!settings.enable_matching) return { enabled: false, puedeInvitar: false, candidates: [] };

  const client = supabaseForToken(accessToken);

  // Proyecto: dueño + estado + skills requeridas.
  const { data: proyecto, error } = await client
    .from("proyecto")
    .select(
      "id, empresa:empresario(id_usuario), estado:estado_proyecto(nombre), skills:project_skills(skill:skills(nombre))",
    )
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  // Invitar solo tiene sentido mientras el proyecto recibe propuestas.
  const puedeInvitar = proyecto.estado?.nombre === "en_recepcion";

  const projectSkills = (proyecto.skills ?? [])
    .map((s) => s.skill?.nombre)
    .filter((n): n is string => Boolean(n));

  // Estado de la relación proyecto <-> estudiante: quién ya postuló y a quién ya
  // se invitó. Ambas consultas están acotadas por RLS al dueño del proyecto.
  const [{ data: ofertas, error: ofertasError }, { data: invitaciones, error: invitacionesError }] =
    await Promise.all([
      client.from("oferta").select("id_usuario").eq("id_proyecto", projectId),
      client.from("invitacion").select("id_usuario").eq("id_proyecto", projectId),
    ]);
  if (ofertasError) throw new ApiError(500, ofertasError.message);
  if (invitacionesError) throw new ApiError(500, invitacionesError.message);
  const postulantes = new Set((ofertas ?? []).map((o) => o.id_usuario));
  const invitados = new Set((invitaciones ?? []).map((i) => i.id_usuario));

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
      const usuarioId = e.usuario?.id ?? null;
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
        yaPostulo: usuarioId != null && postulantes.has(usuarioId),
        yaInvitado: usuarioId != null && invitados.has(usuarioId),
      };
    })
    // Si el proyecto pide skills, sin ninguna en común no es un match (score bajo
    // y ruido). Con proyecto sin skills no hay con qué discriminar: se muestran todos.
    .filter((c) => projectSkills.length === 0 || c.matchedSkills.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATOS);

  return { enabled: true, puedeInvitar, candidates };
}

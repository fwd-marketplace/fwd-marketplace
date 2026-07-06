import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { computeMatchScore } from "./match.service";

type Client = ReturnType<typeof supabaseForToken>;

export interface RecommendedProject {
  id: string;
  titulo: string;
  empresa: string;
  skills: string[];
  matchScore: number;
  matchedSkills: string[];
  plazoDias: number | null;
  fechaPublicacion: string | null;
}

export interface JuniorDashboardData {
  proyectosCompatibles: number;
  matchPromedio: number;
  postulacionesActivas: number;
  rachaDias: number;
  recomendados: RecommendedProject[];
}

const ESTADOS_PROYECTO_INACTIVOS = ["cerrado", "cancelado"] as const;
const COMPATIBLE_THRESHOLD = 50;
const MAX_RECOMENDADOS = 3;

async function getRachaDias(client: Client, userId: string): Promise<number> {
  const { data: rows } = await client
    .from("viaje_progress")
    .select("created_at")
    .eq("user_id", userId);

  if (!rows || rows.length === 0) return 0;

  // Unique calendar dates (UTC), sorted descending
  const days = [...new Set(rows.map((r) => r.created_at.slice(0, 10)))].sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak only counts if activity happened today or yesterday
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00Z");
    const curr = new Date(days[i] + "T00:00:00Z");
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

// Shape of a row from the proyecto query (drive the cast cleanly).
interface ProyectoRow {
  id: string;
  titulo: string | null;
  plazo_dias: number | null;
  fecha_publicacion: string | null;
  empresa: { nombre_comercial: string } | null;
  skills: Array<{ skill: { nombre: string } | null }> | null;
}

export async function getJuniorDashboard(
  token: string,
  userId: string,
): Promise<JuniorDashboardData> {
  const client = supabaseForToken(token);

  // Run all independent reads in parallel.
  const [estudianteResult, activeOffersResult, estadoRecResult, rachaDias] = await Promise.all([
    client.from("estudiante").select("id, disponibilidad, reputacion").eq("id_usuario", userId).maybeSingle(),
    client
      .from("oferta")
      .select("estado:estado_oferta(nombre), proyecto:proyecto(estado:estado_proyecto(nombre))")
      .eq("id_usuario", userId),
    client.from("estado_proyecto").select("id").eq("nombre", "en_recepcion").maybeSingle(),
    getRachaDias(client, userId),
  ]);

  if (estudianteResult.error) throw new ApiError(500, estudianteResult.error.message);
  if (activeOffersResult.error) throw new ApiError(500, activeOffersResult.error.message);
  if (estadoRecResult.error) throw new ApiError(500, estadoRecResult.error.message);

  const estudianteRow = estudianteResult.data;

  // Proyectos en los que el junior está participando activamente:
  // oferta adjudicada cuyo proyecto aún no está cerrado ni cancelado.
  const postulacionesActivas = (activeOffersResult.data ?? []).filter((o) => {
    const estadoOferta = (o.estado as { nombre: string } | null)?.nombre ?? "";
    const estadoProyecto =
      (o.proyecto as { estado: { nombre: string } | null } | null)?.estado?.nombre ?? "";
    return (
      estadoOferta === "adjudicada" &&
      !(ESTADOS_PROYECTO_INACTIVOS as readonly string[]).includes(estadoProyecto)
    );
  }).length;

  // If no estudiante row the user has no profile — return empty stats.
  if (!estudianteRow?.id) {
    return { proyectosCompatibles: 0, matchPromedio: 0, postulacionesActivas, rachaDias, recomendados: [] };
  }

  // Get junior's skill names (2-step: links → names).
  const { data: skillLinks } = await client
    .from("student_skills")
    .select("id_skill")
    .eq("id_estudiante", estudianteRow.id);

  let juniorSkills: string[] = [];
  const skillIds = (skillLinks ?? []).map((s) => s.id_skill);
  if (skillIds.length > 0) {
    const { data: skillsData } = await client
      .from("skills")
      .select("nombre")
      .in("id", skillIds);
    juniorSkills = (skillsData ?? []).map((s) => s.nombre);
  }

  // Get all active marketplace projects with their skills.
  const estadoRecId = estadoRecResult.data?.id;
  if (!estadoRecId) {
    return { proyectosCompatibles: 0, matchPromedio: 0, postulacionesActivas, rachaDias, recomendados: [] };
  }

  const now = new Date().toISOString();
  const { data: rawProyectos, error: proyectosError } = await client
    .from("proyecto")
    .select(
      "id, titulo, plazo_dias, fecha_publicacion, empresa:empresario(nombre_comercial), skills:project_skills(skill:skills(nombre))",
    )
    .eq("id_estado", estadoRecId)
    .or(`fecha_cierre.is.null,fecha_cierre.gt.${now}`);

  if (proyectosError) throw new ApiError(500, proyectosError.message);

  const proyectos = (rawProyectos ?? []) as unknown as ProyectoRow[];
  const disponible = estudianteRow.disponibilidad !== "unavailable" && estudianteRow.disponibilidad != null;

  // Score each project against the junior's profile.
  const scored: RecommendedProject[] = proyectos
    .map((p) => {
      const projectSkills = (p.skills ?? [])
        .map((s) => s.skill?.nombre)
        .filter((n): n is string => Boolean(n));

      const { score, matchedSkills } = computeMatchScore(
        projectSkills,
        juniorSkills,
        disponible,
        estudianteRow.reputacion ?? null,
      );

      return {
        id: p.id,
        titulo: p.titulo ?? "",
        empresa: p.empresa?.nombre_comercial ?? "",
        skills: projectSkills,
        matchScore: score,
        matchedSkills,
        plazoDias: p.plazo_dias ?? null,
        fechaPublicacion: p.fecha_publicacion ?? null,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const compatibles = scored.filter((p) => p.matchScore >= COMPATIBLE_THRESHOLD);
  const matchPromedio =
    scored.length > 0
      ? Math.round(scored.reduce((sum, p) => sum + p.matchScore, 0) / scored.length)
      : 0;

  return {
    proyectosCompatibles: compatibles.length,
    matchPromedio,
    postulacionesActivas,
    rachaDias,
    recomendados: scored.slice(0, MAX_RECOMENDADOS),
  };
}

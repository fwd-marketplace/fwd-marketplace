import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { User } from "@supabase/supabase-js";

export type MilestoneStatus = "done" | "pending";

export interface HeroMilestone {
  status: MilestoneStatus;
  /** ISO date string when the milestone was achieved, empty string if not done. */
  date: string;
  /** Only meaningful for 'transformacion': 0-100 learning percentage. null for others. */
  learningPct: number | null;
}

export interface HeroJourneyData {
  llamado: HeroMilestone;
  preparacion: HeroMilestone;
  desafio: HeroMilestone;
  transformacion: HeroMilestone;
  reconocimiento: HeroMilestone;
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}

export async function getHeroJourney(
  token: string,
  userId: string,
  authUser: User,
): Promise<HeroJourneyData> {
  const client = supabaseForToken(token);

  // --- El Llamado: always done (user has an account) ---
  const llamado: HeroMilestone = {
    status: "done",
    date: formatDate(authUser.created_at),
    learningPct: null,
  };

  // --- La Preparacion: profile has descripcion + especialidad filled ---
  const { data: estudianteRow, error: estudianteError } = await client
    .from("estudiante")
    .select("descripcion, especialidad")
    .eq("id_usuario", userId)
    .maybeSingle();

  if (estudianteError) throw new ApiError(500, estudianteError.message);

  const profileFilled =
    !!estudianteRow?.descripcion?.trim() && !!estudianteRow?.especialidad?.trim();

  const preparacion: HeroMilestone = {
    status: profileFilled ? "done" : "pending",
    date: profileFilled ? formatDate(authUser.updated_at ?? authUser.created_at) : "",
    learningPct: null,
  };

  // --- El Desafio: at least one application submitted ---
  const { data: firstOferta, error: desafioError } = await client
    .from("oferta")
    .select("fecha_envio")
    .eq("id_usuario", userId)
    .order("fecha_envio", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (desafioError) throw new ApiError(500, desafioError.message);

  const desafio: HeroMilestone = {
    status: firstOferta ? "done" : "pending",
    date: firstOferta ? formatDate(firstOferta.fecha_envio) : "",
    learningPct: null,
  };

  // --- La Transformacion: learning journey progress from viaje_progress ---
  // Total de estrellas definidas en FrontEnd/components/viaje-de-aprendizaje/data/stars.ts.
  // La UI calcula: Math.round(lit / total * 100) donde lit = filas en viaje_progress del usuario.
  const TOTAL_LEARNING_STARS = 16;

  const { count: completedStars, error: progressError } = await client
    .from("viaje_progress")
    .select("star_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (progressError) throw new ApiError(500, progressError.message);

  const learningPct = Math.round(((completedStars ?? 0) / TOTAL_LEARNING_STARS) * 100);

  const transformacion: HeroMilestone = {
    status: learningPct >= 100 ? "done" : "pending",
    date: learningPct >= 100 ? formatDate(new Date().toISOString()) : "",
    learningPct,
  };

  // --- El Reconocimiento: at least one offer adjudicated ---
  const { data: adjudicadaRow, error: reconError } = await client
    .from("oferta")
    .select("updated_at, estado:estado_oferta(nombre)")
    .eq("id_usuario", userId)
    .order("updated_at", { ascending: true })
    .limit(20)
    .then(({ data, error }) => ({
      data: data?.find((o) => (o.estado as { nombre: string } | null)?.nombre === "adjudicada") ?? null,
      error,
    }));

  if (reconError) throw new ApiError(500, reconError.message);

  const reconocimiento: HeroMilestone = {
    status: adjudicadaRow ? "done" : "pending",
    date: adjudicadaRow ? formatDate(adjudicadaRow.updated_at) : "",
    learningPct: null,
  };

  return { llamado, preparacion, desafio, transformacion, reconocimiento };
}

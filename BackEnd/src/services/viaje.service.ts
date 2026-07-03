import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

type Client = ReturnType<typeof supabaseForToken>;

export interface ProgressRow {
  star_id: string;
  mastery: number;
}

/** Devuelve todas las estrellas completadas del usuario. */
export async function getProgress(token: string, userId: string): Promise<ProgressRow[]> {
  const client: Client = supabaseForToken(token);

  const { data, error } = await client
    .from("viaje_progress")
    .select("star_id, mastery")
    .eq("user_id", userId);

  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

/** Guarda o actualiza el mastery de una estrella. Idempotente. */
export async function upsertProgress(
  token: string,
  userId: string,
  starId: string,
  mastery: number,
): Promise<void> {
  const client: Client = supabaseForToken(token);

  const { error } = await client
    .from("viaje_progress")
    .upsert(
      { user_id: userId, star_id: starId, mastery },
      { onConflict: "user_id,star_id" },
    );

  if (error) throw new ApiError(500, error.message);
}

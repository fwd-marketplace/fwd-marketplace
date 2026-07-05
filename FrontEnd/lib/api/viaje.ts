import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { HeroJourneyData } from "@/lib/hero-journey/mock";

export type ProgressRow = {
  star_id: string;
  mastery: number;
};

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

/** GET /api/viaje/progress — carga el progreso del usuario autenticado. */
export function getProgress(): Promise<Result<ProgressRow[]>> {
  return asResult(async () => {
    const res = await apiAuth<{ progress: ProgressRow[] }>("/viaje/progress");
    return res.progress;
  });
}

/** PUT /api/viaje/progress/:starId — guarda o actualiza el mastery de una estrella. */
export function putProgress(starId: string, mastery: number): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/viaje/progress/${starId}`, {
      method: "PUT",
      body: JSON.stringify({ mastery }),
    });
  });
}

/** GET /api/junior/hero-journey — hitos del Viaje del Héroe del junior autenticado. */
export function getHeroJourney(): Promise<Result<HeroJourneyData>> {
  return asResult(async () => apiAuth<HeroJourneyData>("/junior/hero-journey"));
}

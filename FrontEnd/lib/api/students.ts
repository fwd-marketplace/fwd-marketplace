import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { TalentSearchParams, TalentSearchResponse } from "@/lib/api/types";

/**
 * Directorio de talento: busca estudiantes verificados con filtros (para
 * empresa/emprendedor). Pega a GET /students/search del BackEnd, que limita los
 * resultados por RLS a estudiantes verificados.
 */
export async function searchStudents(
  params: TalentSearchParams = {},
): Promise<Result<TalentSearchResponse>> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.especialidad) qs.set("especialidad", params.especialidad);
  if (params.disponibilidad) qs.set("disponibilidad", params.disponibilidad);
  if (params.skill) qs.set("skill", params.skill);
  if (params.modalidad) qs.set("modalidad", params.modalidad);
  if (params.solo_disponibles) qs.set("solo_disponibles", "true");

  const query = qs.toString();
  const path = query ? `/students/search?${query}` : "/students/search";

  try {
    return ok(await apiAuth<TalentSearchResponse>(path));
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexión");
  }
}

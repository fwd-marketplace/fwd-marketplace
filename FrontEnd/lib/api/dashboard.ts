import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";

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

export const MOCK_DASHBOARD: JuniorDashboardData = {
  proyectosCompatibles: 0,
  matchPromedio: 0,
  postulacionesActivas: 0,
  rachaDias: 0,
  recomendados: [],
};

export async function getDashboardData(): Promise<Result<JuniorDashboardData>> {
  try {
    return ok(await apiAuth<JuniorDashboardData>("/junior/dashboard"));
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

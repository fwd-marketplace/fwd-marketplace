"use server";

import { searchStudents } from "@/lib/api/students";
import type { TalentSearchParams } from "@/lib/api/types";

/** Busca estudiantes verificados con filtros (directorio de talento de empresa). */
export async function searchStudentsAction(params: TalentSearchParams = {}) {
  return searchStudents(params);
}

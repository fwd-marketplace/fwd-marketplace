"use server";

import { getRanking } from "@/lib/api/marketplace";

export async function getRankingAction(especialidad?: string) {
  return getRanking(especialidad);
}

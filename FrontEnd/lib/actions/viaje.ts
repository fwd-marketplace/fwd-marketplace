"use server";

import { getProgress, putProgress } from "@/lib/api/viaje";
import type { ProgressRow } from "@/lib/api/viaje";
import type { Result } from "@/lib/result";

export async function getProgressAction(): Promise<Result<ProgressRow[]>> {
  return getProgress();
}

export async function putProgressAction(
  starId: string,
  mastery: number,
): Promise<Result<void>> {
  return putProgress(starId, mastery);
}

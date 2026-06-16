import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { MeResponse } from "@/lib/api/types";

export async function getMe(): Promise<Result<MeResponse>> {
  try {
    return ok(await apiAuth<MeResponse>("/users/me"));
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export function savePreferenciasNotificacion(
  preferencias: Record<string, boolean>,
): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth("/users/me/preferencias-notificacion", {
      method: "PATCH",
      body: JSON.stringify({ preferencias }),
    });
  });
}

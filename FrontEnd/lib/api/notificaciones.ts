import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { ApiNotificacion, NotificacionesResponse } from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

/** Notificaciones del usuario autenticado (mas recientes primero). */
export function getNotificaciones(): Promise<Result<ApiNotificacion[]>> {
  return asResult(async () => {
    const res = await apiAuth<NotificacionesResponse>("/notificaciones");
    return res.notificaciones;
  });
}

/** Marca una notificacion como leida. */
export function marcarNotificacionLeida(id: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/notificaciones/${id}/leida`, { method: "PATCH" });
  });
}

/** Marca todas las notificaciones del usuario como leidas. */
export function marcarTodasLeidas(): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth("/notificaciones/leidas", { method: "PATCH" });
  });
}

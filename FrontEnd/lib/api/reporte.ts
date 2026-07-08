import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { MotivoReporte } from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

/** Reporta un mensaje del chat para moderación. Devuelve el id del reporte creado. */
export function reportarMensaje(
  idMensaje: string,
  motivo: MotivoReporte,
  detalle?: string,
): Promise<Result<{ id: string }>> {
  return asResult(async () => {
    const body: Record<string, unknown> = { id_mensaje: idMensaje, motivo };
    if (detalle && detalle.trim()) {
      body.detalle = detalle.trim();
    }
    const res = await apiAuth<{ reporte: { id: string } }>("/reportes", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.reporte;
  });
}

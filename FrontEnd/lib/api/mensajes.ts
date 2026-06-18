import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { ApiMensaje, MensajesResponse } from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export function getProjectMensajes(projectId: string): Promise<Result<ApiMensaje[]>> {
  return asResult(async () => {
    const res = await apiAuth<MensajesResponse>(`/mensajes/proyecto/${projectId}`);
    return res.mensajes;
  });
}

export function sendMensaje(
  projectId: string,
  contenido: string,
): Promise<Result<ApiMensaje>> {
  return asResult(async () => {
    const res = await apiAuth<{ mensaje: ApiMensaje }>(`/mensajes/proyecto/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ contenido }),
    });
    return res.mensaje;
  });
}

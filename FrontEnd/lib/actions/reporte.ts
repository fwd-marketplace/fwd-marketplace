"use server";

import { reportarMensaje } from "@/lib/api/reporte";
import type { MotivoReporte } from "@/lib/api/types";

/** Reporta un mensaje del chat (server action: usa la cookie httpOnly de sesión). */
export async function reportarMensajeAction(
  idMensaje: string,
  motivo: MotivoReporte,
  detalle?: string,
) {
  return reportarMensaje(idMensaje, motivo, detalle);
}

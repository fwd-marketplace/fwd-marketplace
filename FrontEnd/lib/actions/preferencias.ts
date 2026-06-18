"use server";

import { savePreferenciasNotificacion } from "@/lib/api/preferencias";

export async function savePreferenciasNotificacionAction(preferencias: Record<string, boolean>) {
  return savePreferenciasNotificacion(preferencias);
}

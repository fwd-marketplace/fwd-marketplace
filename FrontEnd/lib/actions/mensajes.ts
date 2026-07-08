"use server";

import { getLocale } from "next-intl/server";
import { getProjectMensajes, sendMensaje, getMyConversaciones } from "@/lib/api/mensajes";
import { toAiLocale } from "@/lib/api/ai-client";

export async function getProjectMensajesAction(projectId: string, remitenteId?: string) {
  return getProjectMensajes(projectId, remitenteId);
}

export async function sendMensajeAction(
  projectId: string,
  contenido: string,
  idDestinatario?: string,
) {
  const locale = await getLocale();
  return sendMensaje(projectId, contenido, toAiLocale(locale), idDestinatario);
}

export async function getMyConversacionesAction() {
  return getMyConversaciones();
}

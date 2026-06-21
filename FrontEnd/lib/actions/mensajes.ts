"use server";

import { getProjectMensajes, sendMensaje, getMyConversaciones } from "@/lib/api/mensajes";

export async function getProjectMensajesAction(projectId: string) {
  return getProjectMensajes(projectId);
}

export async function sendMensajeAction(
  projectId: string,
  contenido: string,
  idDestinatario?: string,
) {
  return sendMensaje(projectId, contenido, idDestinatario);
}

export async function getMyConversacionesAction() {
  return getMyConversaciones();
}

"use server";

import { getProjectMensajes, sendMensaje } from "@/lib/api/mensajes";

export async function getProjectMensajesAction(projectId: string) {
  return getProjectMensajes(projectId);
}

export async function sendMensajeAction(projectId: string, contenido: string) {
  return sendMensaje(projectId, contenido);
}

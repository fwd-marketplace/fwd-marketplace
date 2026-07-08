"use server";

import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "@/lib/api/notificaciones";

export async function getNotificacionesAction() {
  return getNotificaciones();
}

export async function marcarNotificacionLeidaAction(id: string) {
  return marcarNotificacionLeida(id);
}

export async function marcarTodasLeidasAction() {
  return marcarTodasLeidas();
}

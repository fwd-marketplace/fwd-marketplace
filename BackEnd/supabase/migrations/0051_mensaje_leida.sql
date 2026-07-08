-- Rastreo de mensajes sin leer en el chat junior<->empresa.
--
-- El código ya consultaba `mensaje.leida` (listConversaciones -> no_leidos, marcado de leídos al
-- abrir el hilo, badge "sin ver" en gestión), pero la columna nunca se creó: la tabla `mensaje`
-- (migración 0005) solo tenía id/proyecto/remitente/destinatario/contenido/es_publico/fecha_envio.
-- Sin esta columna, GET /mensajes/conversaciones devolvía 500 ("column mensaje.leida does not
-- exist") y los "Chats directos" del junior quedaban siempre vacíos.
--
-- Idempotente (IF NOT EXISTS): seguro de aplicar en cualquier entorno, exista o no la columna.
ALTER TABLE public.mensaje
  ADD COLUMN IF NOT EXISTS leida boolean NOT NULL DEFAULT false;

-- Acelera el conteo de no leídos por destinatario (patrón: id_destinatario = ? AND leida = false).
CREATE INDEX IF NOT EXISTS mensaje_destinatario_no_leida_idx
  ON public.mensaje (id_destinatario)
  WHERE leida = false;

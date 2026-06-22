-- ─────────────────────────────────────────────────────────────────────────────
-- 0038_mensaje_reporte.sql
-- Reportes de mensajes del chat directo (moderacion). Cualquier participante (junior o empresa)
-- puede reportar un mensaje que considere una falta de respeto o fuera de lugar; el admin los
-- revisa en el panel de Moderacion y actua (suspender cuenta / cancelar proyecto con las acciones
-- que ya existen).
--
-- Privacidad: el admin NO participa del chat, asi que por RLS no puede leer mensajes privados.
-- Para no abrirle todos los DMs ni arriesgar recursion de policies, se guarda un SNAPSHOT del
-- mensaje (contenido + autor + proyecto) al momento de reportar: lo escribe el reportante, que SI
-- es participante y puede leer el mensaje. El admin solo ve los mensajes que fueron reportados.
--
-- Aplicar en el SQL Editor de Supabase y regenerar database.types.ts:
--   npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.mensaje_reporte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_mensaje uuid NOT NULL REFERENCES public.mensaje(id) ON DELETE CASCADE,
  -- Quien reporta (es el participante que escribe el reporte).
  id_reportante uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Autor del mensaje reportado (a quien el admin podria suspender). Denormalizado del snapshot.
  id_reportado uuid REFERENCES public.users(id) ON DELETE SET NULL,
  -- Proyecto de la conversacion (para agrupar/navegar y poder cancelarlo). Denormalizado.
  id_proyecto uuid REFERENCES public.proyecto(id) ON DELETE SET NULL,
  -- Copia del texto del mensaje al momento de reportar (el admin no puede leer el DM por RLS).
  contenido_snapshot text NOT NULL,
  motivo varchar(30) NOT NULL
    CHECK (motivo IN ('falta_respeto', 'spam', 'contenido_inapropiado', 'fuera_de_lugar', 'otro')),
  -- Comentario opcional del reportante.
  detalle varchar(1000),
  estado varchar(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'revisado', 'desestimado')),
  -- Admin que resolvio el reporte (null hasta que se revisa).
  id_admin uuid REFERENCES public.users(id) ON DELETE SET NULL,
  fecha timestamptz NOT NULL DEFAULT now(),
  fecha_resolucion timestamptz,
  -- Un mismo usuario no reporta dos veces el mismo mensaje.
  CONSTRAINT mensaje_reporte_unico UNIQUE (id_mensaje, id_reportante)
);

-- El panel de moderacion filtra por estado (pendientes primero) y por fecha.
CREATE INDEX mensaje_reporte_estado_idx ON public.mensaje_reporte (estado, fecha DESC);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.mensaje_reporte ENABLE ROW LEVEL SECURITY;

-- El reportante crea su propio reporte (solo como si mismo).
DROP POLICY IF EXISTS "reporte_crear" ON public.mensaje_reporte;
CREATE POLICY "reporte_crear" ON public.mensaje_reporte FOR INSERT
  WITH CHECK (id_reportante = auth.uid());

-- El reportante puede leer sus propios reportes (necesario para el INSERT ... RETURNING).
DROP POLICY IF EXISTS "reporte_ver_propio" ON public.mensaje_reporte;
CREATE POLICY "reporte_ver_propio" ON public.mensaje_reporte FOR SELECT
  USING (id_reportante = auth.uid());

-- El admin ve todos los reportes (panel de Moderacion).
DROP POLICY IF EXISTS "reporte_ver_admin" ON public.mensaje_reporte;
CREATE POLICY "reporte_ver_admin" ON public.mensaje_reporte FOR SELECT
  USING (public.is_admin());

-- Solo el admin resuelve un reporte (cambia estado / asigna id_admin).
DROP POLICY IF EXISTS "reporte_resolver_admin" ON public.mensaje_reporte;
CREATE POLICY "reporte_resolver_admin" ON public.mensaje_reporte FOR UPDATE
  USING (public.is_admin());

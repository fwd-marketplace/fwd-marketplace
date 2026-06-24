-- 0045_invitacion.sql
-- Invitaciones: una empresa puede invitar a un estudiante verificado a postular a
-- uno de sus proyectos (desde el panel de "match"). El estudiante recibe una
-- notificación y puede ir a postular. Una invitación por (proyecto, estudiante).

CREATE TABLE IF NOT EXISTS public.invitacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id) ON DELETE CASCADE,
  id_usuario uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,          -- junior invitado
  id_empresa_usuario uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,  -- empresa que invita
  mensaje varchar(500),
  estado varchar(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  fecha timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_proyecto, id_usuario)
);

CREATE INDEX IF NOT EXISTS invitacion_usuario_idx ON public.invitacion (id_usuario, fecha DESC);
CREATE INDEX IF NOT EXISTS invitacion_proyecto_idx ON public.invitacion (id_proyecto);

ALTER TABLE public.invitacion ENABLE ROW LEVEL SECURITY;

-- La empresa que invita gestiona (crea/ve) las invitaciones que emitió.
DROP POLICY IF EXISTS "invitacion_empresa" ON public.invitacion;
CREATE POLICY "invitacion_empresa" ON public.invitacion FOR ALL
  USING (id_empresa_usuario = auth.uid())
  WITH CHECK (id_empresa_usuario = auth.uid());

-- El estudiante invitado ve sus invitaciones.
DROP POLICY IF EXISTS "invitacion_invitado_ver" ON public.invitacion;
CREATE POLICY "invitacion_invitado_ver" ON public.invitacion FOR SELECT
  USING (id_usuario = auth.uid());

-- El estudiante invitado puede responder (aceptar/rechazar) su invitación.
DROP POLICY IF EXISTS "invitacion_invitado_responder" ON public.invitacion;
CREATE POLICY "invitacion_invitado_responder" ON public.invitacion FOR UPDATE
  USING (id_usuario = auth.uid());

-- Sumar 'invitacion' a los tipos de notificación permitidos.
ALTER TABLE public.notificacion DROP CONSTRAINT IF EXISTS notificacion_tipo_check;
ALTER TABLE public.notificacion ADD CONSTRAINT notificacion_tipo_check
  CHECK (tipo IN ('adjudicacion', 'vencimiento_plazo', 'nuevo_mensaje', 'entregable_subido', 'cambio_estado', 'invitacion'));

notify pgrst, 'reload schema';

-- 0049_notificaciones_nuevos_tipos.sql
-- Cuatro nuevos tipos de notificación para el dashboard del junior:
--
--   visita_perfil              — una empresa visitó el perfil público del junior
--   nuevo_proyecto_compatible  — proyecto publicado con match >= 70% para el junior
--   oferta_revisada            — la empresa abrió el detalle de la postulación del junior
--   nueva_calificacion         — la empresa calificó al junior tras cerrar el proyecto

-- 1. Ampliar el CHECK de tipo (reemplaza el de 0046_invitacion).
ALTER TABLE public.notificacion DROP CONSTRAINT IF EXISTS notificacion_tipo_check;
ALTER TABLE public.notificacion ADD CONSTRAINT notificacion_tipo_check
  CHECK (tipo IN (
    'adjudicacion',
    'vencimiento_plazo',
    'nuevo_mensaje',
    'entregable_subido',
    'cambio_estado',
    'invitacion',
    'visita_perfil',
    'nuevo_proyecto_compatible',
    'oferta_revisada',
    'nueva_calificacion'
  ));

-- 2. Tabla de visitas al perfil (deduplicación: 1 notif por empresa+junior+día).
CREATE TABLE IF NOT EXISTS public.perfil_visita (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  id_junior_usuario  uuid    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id_empresa_usuario uuid    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fecha              date    NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (id_junior_usuario, id_empresa_usuario, fecha)
);

CREATE INDEX IF NOT EXISTS perfil_visita_junior_idx
  ON public.perfil_visita (id_junior_usuario, fecha DESC);

ALTER TABLE public.perfil_visita ENABLE ROW LEVEL SECURITY;

-- El junior puede ver quién lo visitó (feed de actividad).
DROP POLICY IF EXISTS "perfil_visita_junior_ver" ON public.perfil_visita;
CREATE POLICY "perfil_visita_junior_ver" ON public.perfil_visita FOR SELECT
  USING (id_junior_usuario = auth.uid());

-- 3. Log de ofertas ya notificadas como "revisadas" (solo notificar una vez).
CREATE TABLE IF NOT EXISTS public.oferta_revisada_log (
  id_oferta  uuid        PRIMARY KEY REFERENCES public.oferta(id) ON DELETE CASCADE,
  fecha      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oferta_revisada_log ENABLE ROW LEVEL SECURITY;
-- Solo el backend (service_role) lee/escribe esta tabla.

-- 4. Actualizar el default de preferencias_notificacion para incluir los nuevos tipos
--    (usuarios existentes reciben los nuevos tipos activados por defecto también).
ALTER TABLE public.users
  ALTER COLUMN preferencias_notificacion
  SET DEFAULT '{
    "adjudicacion": true,
    "vencimiento_plazo": true,
    "nuevo_mensaje": true,
    "entregable_subido": true,
    "cambio_estado": true,
    "invitacion": true,
    "visita_perfil": true,
    "nuevo_proyecto_compatible": true,
    "oferta_revisada": true,
    "nueva_calificacion": true
  }'::jsonb;

notify pgrst, 'reload schema';

-- 0044_notificacion_referencia.sql
-- Agrega una referencia a la entidad relacionada en cada notificación para poder
-- hacer "deep-link" desde la campanita. Caso principal: 'nuevo_mensaje' guarda el
-- id del proyecto, así que al hacer click la empresa/junior va DIRECTO al chat de
-- ese proyecto (no a la lista general).
--
--  - id_referencia: id de la entidad referida (p.ej. id_proyecto); null si no aplica.

ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS id_referencia uuid;

COMMENT ON COLUMN public.notificacion.id_referencia IS
  'Entidad referida por la notificación (p.ej. id_proyecto para nuevo_mensaje); null si no aplica.';

-- Reemplaza la función de sistema para aceptar y guardar la referencia. Se elimina
-- la versión de 3 argumentos para no dejar dos overloads (la 0034 quedaba sin ref).
DROP FUNCTION IF EXISTS public.sistema_crear_notificacion(uuid, text, text);

CREATE OR REPLACE FUNCTION public.sistema_crear_notificacion(
  p_id_usuario    uuid,
  p_tipo          text,
  p_mensaje       text,
  p_id_referencia uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Respetar preferencias del destinatario (true por defecto si no está seteada).
  IF COALESCE(
    (SELECT (preferencias_notificacion ->> p_tipo)::boolean
     FROM public.users WHERE id = p_id_usuario),
    true
  ) IS FALSE THEN
    RETURN;
  END IF;

  INSERT INTO public.notificacion (id_usuario, tipo, mensaje, id_referencia)
  VALUES (p_id_usuario, p_tipo, p_mensaje, p_id_referencia);
END;
$$;

REVOKE ALL ON FUNCTION public.sistema_crear_notificacion(uuid, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sistema_crear_notificacion(uuid, text, text, uuid) TO service_role;

-- PostgREST necesita recargar el esquema tras cambios de columnas/funciones.
notify pgrst, 'reload schema';

-- 0034_sistema_crear_notificacion.sql
-- Funcion SECURITY DEFINER para que el backend (service_role) cree notificaciones
-- sin depender de auth.uid() ni de GRANTs directos sobre la tabla.
-- Corre como el owner (postgres), bypasea RLS completamente.

CREATE OR REPLACE FUNCTION public.sistema_crear_notificacion(
  p_id_usuario uuid,
  p_tipo       text,
  p_mensaje    text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Respetar preferencias del destinatario (true por defecto si no esta seteada).
  IF COALESCE(
    (SELECT (preferencias_notificacion ->> p_tipo)::boolean
     FROM public.users WHERE id = p_id_usuario),
    true
  ) IS FALSE THEN
    RETURN;
  END IF;

  INSERT INTO public.notificacion (id_usuario, tipo, mensaje)
  VALUES (p_id_usuario, p_tipo, p_mensaje);
END;
$$;

REVOKE ALL ON FUNCTION public.sistema_crear_notificacion(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sistema_crear_notificacion(uuid, text, text) TO service_role;

-- 0050_onboard_emprendedor_cedula.sql
-- El emprendedor es una persona física: debe registrar su cédula personal en
-- `users.cedula` (diseño documentado en 0007). El onboarding original
-- (0019) no la capturaba, dejando `users.cedula = NULL` para todo emprendedor.
-- Se reemplaza la RPC para recibir y persistir la cédula, con un pre-chequeo
-- de unicidad que devuelve un error propio (P0003) distinguible del
-- ALREADY_ONBOARDED (P0001) y del duplicate key genérico (23505).

-- Se elimina la firma anterior (7 args) para no dejar una sobrecarga ambigua.
DROP FUNCTION IF EXISTS public.onboard_emprendedor(
  uuid, text, text, text, text, text, text
);

CREATE OR REPLACE FUNCTION public.onboard_emprendedor(
  p_user_id          uuid,
  p_correo           text,
  p_nombre_proyecto  text,
  p_etapa            text,
  p_apoyo_tecnico    text,
  p_presupuesto      text,
  p_descripcion      text,
  p_cedula           text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ONBOARDED' USING ERRCODE = 'P0001';
  END IF;
  -- users.cedula es UNIQUE (global). Se valida antes de insertar para devolver
  -- un error claro en vez de un 23505 crudo (que se confundiría con re-onboarding).
  IF p_cedula IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE cedula = p_cedula) THEN
    RAISE EXCEPTION 'CEDULA_TAKEN' USING ERRCODE = 'P0003';
  END IF;

  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'company';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'MISSING_ROLE' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.users (id, correo, id_rol, nombre, cedula)
  VALUES (p_user_id, p_correo, v_role_id, p_nombre_proyecto, p_cedula);

  INSERT INTO public.empresario (
    id_usuario, tipo, nombre_comercial, etapa, apoyo_tecnico_necesario,
    presupuesto, descripcion
  ) VALUES (
    p_user_id, 'emprendedor', p_nombre_proyecto, p_etapa, p_apoyo_tecnico,
    p_presupuesto, p_descripcion
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.onboard_emprendedor(
  uuid, text, text, text, text, text, text, text
) TO authenticated;

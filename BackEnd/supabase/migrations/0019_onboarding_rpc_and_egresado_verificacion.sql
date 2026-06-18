-- 0019_onboarding_rpc_and_egresado_verificacion.sql
-- Dos cosas independientes que comparten este hueco de numeración (0019, reservado
-- para BackEnd entre las 0018 y 0020 de las otras personas del equipo):
--
--   #3  Onboarding transaccional "de verdad": funciones SECURITY DEFINER que crean
--       users + estudiante/empresario (+ student_skills) en UNA sola transacción.
--       Reemplazan el rollback compensatorio en código: si cualquier paso falla, la
--       función entera revierte y no queda una cuenta a medias.
--
--   #4  Verificación de egresados FWD: el admin necesita VER los estudiantes y fijar
--       su `estado_verificacion`. Hoy el RLS de `estudiante` solo deja al admin ver los
--       'verificado' y no le da UPDATE, así que no podía verificar a los 'pendiente'.
--
-- Nota de orden: esta migración corre ANTES de la 0020-0022, pero las funciones se
-- EJECUTAN en runtime (con todo el esquema ya migrado). Las columnas que 0017/0018/0022
-- agregaron a `empresario` son nullables, así que los INSERT de abajo no las necesitan.

-- ───────────────────────────────────────────────────────────────────────────
-- #4 · Verificación de egresados: políticas de admin sobre `estudiante`
-- ───────────────────────────────────────────────────────────────────────────
-- El admin puede ver TODOS los estudiantes (no solo los 'verificado') para revisarlos,
-- y actualizarlos para fijar `estado_verificacion`. Se suman a las políticas existentes
-- (RLS evalúa las políticas con OR), sin tocar el acceso del propio estudiante.
DROP POLICY IF EXISTS "estudiante_admin_ver" ON public.estudiante;
CREATE POLICY "estudiante_admin_ver" ON public.estudiante FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "estudiante_admin_verifica" ON public.estudiante;
CREATE POLICY "estudiante_admin_verifica" ON public.estudiante FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ───────────────────────────────────────────────────────────────────────────
-- #3 · Onboarding transaccional (SECURITY DEFINER)
-- ───────────────────────────────────────────────────────────────────────────
-- Cada función:
--   · Exige p_user_id = auth.uid()  -> nadie hace onboarding por otro (FORBIDDEN).
--   · Falla si ya hay fila en users -> ALREADY_ONBOARDED (no re-onboarding).
--   · Resuelve el rol por nombre    -> MISSING_ROLE si falta el seed.
--   · Inserta users + perfil (+ skills) atómicamente.
-- Los campos que llegan como arrays serializados (modalidad, sector, tipos_proyecto,
-- apoyo_tecnico) se pasan ya como text JSON desde el BackEnd, igual que hoy.

-- Junior: users + estudiante + student_skills (match de tech_stack contra el catálogo).
CREATE OR REPLACE FUNCTION public.onboard_junior(
  p_user_id        uuid,
  p_correo         text,
  p_nombre         text,
  p_apellido1      text,
  p_apellido2      text,
  p_cedula         text,
  p_especialidad   text,
  p_modalidad      text,
  p_disponibilidad text,
  p_url_github     text,
  p_url_linkedin   text,
  p_url_portfolio  text,
  p_descripcion    text,
  p_tech_stack     text[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role_id uuid;
  v_estudiante_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ONBOARDED' USING ERRCODE = 'P0001';
  END IF;

  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'student';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'MISSING_ROLE' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.users (id, correo, id_rol, nombre, apellido1, apellido2, cedula)
  VALUES (p_user_id, p_correo, v_role_id, p_nombre, p_apellido1, p_apellido2, p_cedula);

  INSERT INTO public.estudiante (
    id_usuario, especialidad, modalidad_preferida, disponibilidad,
    url_github, url_linkedin, url_portfolio, descripcion
  ) VALUES (
    p_user_id, p_especialidad, p_modalidad, p_disponibilidad,
    p_url_github, p_url_linkedin, p_url_portfolio, p_descripcion
  ) RETURNING id INTO v_estudiante_id;

  -- Skills: vincula las que coincidan por nombre (case-insensitive) con el catálogo.
  -- `nivel` usa su DEFAULT ('intermedio', 0007). on conflict por si llega repetida.
  INSERT INTO public.student_skills (id_estudiante, id_skill)
  SELECT DISTINCT v_estudiante_id, s.id
  FROM public.skills s
  JOIN unnest(p_tech_stack) AS t(nombre) ON lower(s.nombre) = lower(t.nombre)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Empresa: users + empresario(tipo='empresa').
CREATE OR REPLACE FUNCTION public.onboard_empresa(
  p_user_id         uuid,
  p_correo          text,
  p_nombre_comercial text,
  p_sector          text,
  p_descripcion     text,
  p_cedula_juridica text,
  p_direccion       text,
  p_tipos_proyecto  text
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

  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'company';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'MISSING_ROLE' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.users (id, correo, id_rol, nombre)
  VALUES (p_user_id, p_correo, v_role_id, p_nombre_comercial);

  INSERT INTO public.empresario (
    id_usuario, tipo, nombre_comercial, sector, descripcion,
    cedula_juridica, direccion, tipos_proyecto
  ) VALUES (
    p_user_id, 'empresa', p_nombre_comercial, p_sector, p_descripcion,
    p_cedula_juridica, p_direccion, p_tipos_proyecto
  );
END;
$$;

-- Emprendedor: users + empresario(tipo='emprendedor').
CREATE OR REPLACE FUNCTION public.onboard_emprendedor(
  p_user_id          uuid,
  p_correo           text,
  p_nombre_proyecto  text,
  p_etapa            text,
  p_apoyo_tecnico    text,
  p_presupuesto      text,
  p_descripcion      text
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

  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'company';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'MISSING_ROLE' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.users (id, correo, id_rol, nombre)
  VALUES (p_user_id, p_correo, v_role_id, p_nombre_proyecto);

  INSERT INTO public.empresario (
    id_usuario, tipo, nombre_comercial, etapa, apoyo_tecnico_necesario,
    presupuesto, descripcion
  ) VALUES (
    p_user_id, 'emprendedor', p_nombre_proyecto, p_etapa, p_apoyo_tecnico,
    p_presupuesto, p_descripcion
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.onboard_junior(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text[]
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.onboard_empresa(
  uuid, text, text, text, text, text, text, text
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.onboard_emprendedor(
  uuid, text, text, text, text, text, text
) TO authenticated;
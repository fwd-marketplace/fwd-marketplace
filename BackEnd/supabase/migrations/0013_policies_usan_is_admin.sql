-- 0013_policies_usan_is_admin.sql
-- Salda la deuda de RLS: varias politicas de la 0008 chequean el rol del usuario
-- con un EXISTS inline (SELECT FROM public.users JOIN public.roles). Eso depende
-- de las politicas de `users` y puede reintroducir recursion (42P17) en
-- combinaciones nuevas. Se reemplaza por funciones SECURITY DEFINER que leen el
-- rol SIN disparar RLS:
--   - public.is_admin()         -> ya existe (0009), para chequeos de admin.
--   - public.current_app_role() -> NUEVA, para chequeos de varios roles
--                                  (ej. company/admin).
-- Idempotente: CREATE OR REPLACE + DROP POLICY IF EXISTS + CREATE POLICY.
-- Las politicas mantienen EXACTAMENTE la misma logica; solo cambia COMO se
-- evalua el rol. `users_admin_ver_todos` no se toca (ya migrada en la 0009).

-- ── Helpers SECURITY DEFINER ────────────────────────────────────────────────

-- Re-afirma is_admin() por si el proyecto no tuviera la version definitiva.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  );
$$;

-- Devuelve el nombre del rol del usuario autenticado (o NULL). Para chequeos
-- que abarcan varios roles, ej. current_app_role() IN ('company','admin').
-- Nombre con prefijo 'app' para no confundir con el current_role de Postgres.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT r.nombre
  FROM public.users u
  JOIN public.roles r ON u.id_rol = r.id
  WHERE u.id = auth.uid();
$$;

-- ── Politicas de admin puro -> is_admin() ───────────────────────────────────

DROP POLICY IF EXISTS "admin_catalogo" ON public.area_negocio;
CREATE POLICY "admin_catalogo" ON public.area_negocio FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_catalogo" ON public.skills;
CREATE POLICY "admin_catalogo" ON public.skills FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "oferta_ver_admin" ON public.oferta;
CREATE POLICY "oferta_ver_admin" ON public.oferta FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "ai_logs_admin" ON public.ai_logs;
CREATE POLICY "ai_logs_admin" ON public.ai_logs FOR SELECT
  USING (public.is_admin());

-- ── Politicas con rama de admin dentro de un OR (se reescribe completa) ──────

DROP POLICY IF EXISTS "evaluacion_ver" ON public.evaluacion;
CREATE POLICY "evaluacion_ver" ON public.evaluacion FOR SELECT
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "historial_ver" ON public.historial_estado_proyecto;
CREATE POLICY "historial_ver" ON public.historial_estado_proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.oferta o
      JOIN public.estado_oferta eo ON o.id_estado = eo.id
      WHERE o.id_proyecto = id_proyecto
        AND o.id_usuario = auth.uid()
        AND eo.nombre = 'adjudicada'
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "conv_ia_ver" ON public.conversacion_ia;
CREATE POLICY "conv_ia_ver" ON public.conversacion_ia FOR SELECT
  USING (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
    OR public.is_admin()
  );

-- ── Politicas de company/admin -> current_app_role() ────────────────────────

DROP POLICY IF EXISTS "estudiante_ver_perfil" ON public.estudiante;
CREATE POLICY "estudiante_ver_perfil" ON public.estudiante FOR SELECT
  USING (
    id_usuario = auth.uid()
    OR (
      estado_verificacion = 'verificado'
      AND public.current_app_role() IN ('company', 'admin')
    )
  );

DROP POLICY IF EXISTS "portafolio_visible" ON public.portafolio_proyecto;
CREATE POLICY "portafolio_visible" ON public.portafolio_proyecto FOR SELECT
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
    OR visibilidad = 'publico'
    OR (
      visibilidad = 'solo_empresas'
      AND public.current_app_role() IN ('company', 'admin')
    )
  );

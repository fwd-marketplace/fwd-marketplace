-- 0009_fix_rls_recursion_and_grants.sql
-- Reconcilia las DOS versiones de la 0009 que surgieron en paralelo (ramas Sarai
-- y andres) y que arreglaban el mismo bug. Esta es la version unica y definitiva.
--
-- Corrige los problemas detectados al probar el API con un usuario autenticado:
--   1. Recursion infinita (42P17) en las politicas de 'users': una politica de
--      users consultaba la propia tabla users -> recursion. Rompia cualquier
--      lectura de users (login, /me, aprobacion), no solo el admin.
--   2. Faltaba la politica de UPDATE del admin, sin la cual aprobar/suspender
--      cuentas era imposible.
--   3. Faltaban los GRANT de tabla para anon/authenticated, por lo que cualquier
--      consulta daba "permission denied for table ...".
-- Todo el script es idempotente (CREATE OR REPLACE / DROP IF EXISTS): re-correrlo
-- sobre una DB donde ya se aplico no produce cambios ni errores.

-- 1. Helper SECURITY DEFINER: lee 'users' SIN disparar RLS, evitando la recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  );
$$;

-- 2. Reemplazar la politica recursiva de SELECT por una que use is_admin().
DROP POLICY IF EXISTS "users_admin_ver_todos" ON public.users;

CREATE POLICY "users_admin_ver_todos" ON public.users FOR SELECT
  USING (public.is_admin());

-- 3. Permitir que el admin ACTUALICE a otros usuarios (aprobar / suspender).
--    Sin esta politica el flujo de aprobacion del admin era imposible.
DROP POLICY IF EXISTS "users_admin_editar_todos" ON public.users;

CREATE POLICY "users_admin_editar_todos" ON public.users FOR UPDATE
  USING (public.is_admin());

-- 4. Permisos de acceso a tablas para los roles de Supabase.
--    El RLS sigue controlando QUE filas ve cada quien; esto solo habilita el acceso.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Para tablas/secuencias futuras, otorgar por defecto.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

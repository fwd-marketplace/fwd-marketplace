-- Corrige dos problemas detectados al probar el API con un usuario autenticado:
--   1. Recursion infinita en las politicas de 'users' (una politica de users
--      consultaba la propia tabla users).
--   2. Faltaban los GRANT de tabla para los roles anon/authenticated, por lo que
--      cualquier consulta daba "permission denied for table ...".

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

-- 2. Reemplazar la politica recursiva de 'users' por una que use is_admin().
DROP POLICY IF EXISTS "users_admin_ver_todos" ON public.users;

CREATE POLICY "users_admin_ver_todos" ON public.users FOR SELECT
  USING (public.is_admin());

-- 3. Permisos de acceso a tablas para los roles de Supabase.
--    El RLS sigue controlando QUE filas ve cada quien; esto solo habilita el acceso.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Para tablas/secuencias futuras, otorgar por defecto.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

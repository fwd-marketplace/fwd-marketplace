-- 0009_fix_users_rls_recursion.sql
-- Arregla la recursión infinita (42P17) en las políticas de public.users.
--
-- Causa: la política "users_admin_ver_todos" hacía un SELECT sobre public.users
-- DESDE una política aplicada a public.users -> recursión infinita. Eso rompía
-- cualquier lectura de users (login, /me, aprobación), no solo el admin.
--
-- Solución: una función SECURITY DEFINER que evalúa el rol admin saltándose RLS,
-- por lo que su SELECT interno no vuelve a disparar las políticas de users.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  );
$$;

-- Reemplaza la política recursiva por una basada en la función.
DROP POLICY IF EXISTS "users_admin_ver_todos" ON public.users;
CREATE POLICY "users_admin_ver_todos" ON public.users FOR SELECT
  USING (public.is_admin());

-- Faltaba: permitir que el admin ACTUALICE a otros usuarios (aprobar / suspender).
-- Sin esto, el flujo de aprobación del admin era imposible.
DROP POLICY IF EXISTS "users_admin_editar_todos" ON public.users;
CREATE POLICY "users_admin_editar_todos" ON public.users FOR UPDATE
  USING (public.is_admin());

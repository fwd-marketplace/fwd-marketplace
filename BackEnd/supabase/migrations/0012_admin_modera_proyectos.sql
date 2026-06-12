-- 0012_admin_modera_proyectos.sql
-- El admin puede VER cualquier proyecto (incluidos borradores) y MODERARLO
-- (cancelarlo). El RLS base solo deja ver publicados y editar al dueño.
-- Usa is_admin() (definer, sin recursión — ver 0009).

CREATE POLICY "proyecto_admin_ver" ON public.proyecto FOR SELECT
  USING (public.is_admin());

CREATE POLICY "proyecto_admin_moderar" ON public.proyecto FOR UPDATE
  USING (public.is_admin());

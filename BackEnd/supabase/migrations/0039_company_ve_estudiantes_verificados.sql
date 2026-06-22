-- 0039_company_ve_estudiantes_verificados.sql
-- Habilita el DIRECTORIO DE TALENTO: que una empresa/emprendedor pueda buscar y
-- filtrar estudiantes VERIFICADOS (no solo a sus postulantes).
--
-- El RLS de `estudiante` ya deja ver a los verificados (estudiante_ver_perfil).
-- Lo único que faltaba era el NOMBRE, que vive en `users`: hoy una empresa solo
-- ve el `users` de sus postulantes (users_empresa_ve_postulantes, 0011). Esta
-- migración suma una política para ver el `users` de cualquier estudiante
-- verificado.
--
-- Se usan funciones SECURITY DEFINER para evitar la recursión de RLS sobre
-- `users` (consultar users dentro de una policy de users = 42P17). Misma técnica
-- que is_admin() (0009) e is_applicant_to_my_project() (0011).

-- ¿El que llama es empresa o admin?
CREATE OR REPLACE FUNCTION public.is_company_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre IN ('company', 'admin')
  );
$$;

-- ¿`candidate` es un estudiante con estado_verificacion = 'verificado'?
CREATE OR REPLACE FUNCTION public.is_verified_student(candidate uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estudiante e
    WHERE e.id_usuario = candidate AND e.estado_verificacion = 'verificado'
  );
$$;

DROP POLICY IF EXISTS "users_company_ve_verificados" ON public.users;
CREATE POLICY "users_company_ve_verificados" ON public.users FOR SELECT
  USING (public.is_company_or_admin() AND public.is_verified_student(users.id));

notify pgrst, 'reload schema';

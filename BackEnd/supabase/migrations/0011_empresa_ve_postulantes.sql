-- 0011_empresa_ve_postulantes.sql
-- Permite que una empresa vea los datos basicos (users) y el perfil (estudiante)
-- de los juniors que postularon a SUS proyectos. Sin esto, al listar las
-- postulaciones el nombre del postulante venia null.
--
-- Se usa una funcion SECURITY DEFINER: la version "inline" (EXISTS ... FROM oferta)
-- causaba recursion infinita (42P17), porque consultar oferta dispara su RLS
-- (oferta_ver_admin hace SELECT sobre users), que reentra en estas politicas.
-- Al correr como definer, la funcion se salta el RLS de oferta/proyecto/empresario
-- y rompe el ciclo. Misma tecnica que is_admin() en la 0009.

CREATE OR REPLACE FUNCTION public.is_applicant_to_my_project(candidate uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.oferta o
    JOIN public.proyecto p ON o.id_proyecto = p.id
    JOIN public.empresario e ON p.id_empresario = e.id
    WHERE o.id_usuario = candidate AND e.id_usuario = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "users_empresa_ve_postulantes" ON public.users;
CREATE POLICY "users_empresa_ve_postulantes" ON public.users FOR SELECT
  USING (public.is_applicant_to_my_project(users.id));

DROP POLICY IF EXISTS "estudiante_empresa_ve_postulantes" ON public.estudiante;
CREATE POLICY "estudiante_empresa_ve_postulantes" ON public.estudiante FOR SELECT
  USING (public.is_applicant_to_my_project(estudiante.id_usuario));

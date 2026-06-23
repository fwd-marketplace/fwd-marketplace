-- 0043_empresa_ve_interlocutores_chat.sql
-- La empresa puede ver el `users` (nombre) de cualquier junior que le haya escrito
-- (o al que le haya escrito) en un proyecto suyo, aunque NO haya postulado ni esté
-- verificado. Sin esto, un junior que contacta a la empresa por el chat del proyecto
-- aparece sin nombre y el chat se ve VACÍO: la notificación y el indicador de "chat
-- nuevo" sí funcionan (no necesitan el join a users), pero el ChatPanel arma la lista
-- de interlocutores desde el join `remitente`/`destinatario_info`, que vuelve null.
--
-- Se usa una función SECURITY DEFINER para evitar la recursión de RLS sobre `users`
-- (consultar tablas dentro de una policy de users dispara su RLS = 42P17). Misma
-- técnica que is_admin() (0009), is_applicant_to_my_project() (0011) e
-- is_verified_student() (0039).

CREATE OR REPLACE FUNCTION public.has_message_in_my_project(candidate uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mensaje m
    JOIN public.proyecto p   ON m.id_proyecto = p.id
    JOIN public.empresario e ON p.id_empresario = e.id
    WHERE e.id_usuario = auth.uid()
      AND (m.id_remitente = candidate OR m.id_destinatario = candidate)
  );
$$;

DROP POLICY IF EXISTS "users_empresa_ve_interlocutores" ON public.users;
CREATE POLICY "users_empresa_ve_interlocutores" ON public.users FOR SELECT
  USING (public.has_message_in_my_project(users.id));

notify pgrst, 'reload schema';

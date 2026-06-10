ALTER TABLE public.estudiante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfil estudiante visible"
  ON public.estudiante FOR SELECT
  USING (
    id_usuario = auth.uid()
    OR
    (estado_verificacion = 'verificado' AND EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.id_rol = r.id
      WHERE u.id = auth.uid()
      AND r.nombre IN ('company', 'admin')
    ))
  );

CREATE POLICY "estudiante edita su perfil"
  ON public.estudiante FOR UPDATE
  USING (id_usuario = auth.uid());

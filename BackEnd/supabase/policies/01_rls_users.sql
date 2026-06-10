ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve su propio perfil"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "admin ve todos los usuarios"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.id_rol = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'admin'
    )
  );

CREATE POLICY "usuario actualiza su propio perfil"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

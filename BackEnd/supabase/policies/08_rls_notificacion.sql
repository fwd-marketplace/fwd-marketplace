ALTER TABLE public.notificacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve sus notificaciones"
  ON public.notificacion FOR SELECT
  USING (id_usuario = auth.uid());

CREATE POLICY "usuario marca como leida"
  ON public.notificacion FOR UPDATE
  USING (id_usuario = auth.uid());

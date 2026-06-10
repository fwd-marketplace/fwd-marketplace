ALTER TABLE public.oferta ENABLE ROW LEVEL SECURITY;

-- FK directa a Users: política simple via auth.uid()
CREATE POLICY "estudiante ve sus ofertas"
  ON public.oferta FOR SELECT
  USING (id_usuario = auth.uid());

CREATE POLICY "empresa ve ofertas de sus proyectos"
  ON public.oferta FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );

CREATE POLICY "estudiante crea su oferta"
  ON public.oferta FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

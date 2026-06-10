ALTER TABLE public.entregable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estudiante ve sus entregables"
  ON public.entregable FOR SELECT
  USING (id_usuario = auth.uid());

CREATE POLICY "empresa ve entregables de sus proyectos"
  ON public.entregable FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );

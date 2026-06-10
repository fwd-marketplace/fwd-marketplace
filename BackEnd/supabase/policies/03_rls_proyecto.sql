ALTER TABLE public.proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proyectos publicados visibles"
  ON public.proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estado_proyecto ep
      WHERE ep.id = id_estado AND ep.nombre != 'borrador'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );

CREATE POLICY "empresa crea proyectos"
  ON public.proyecto FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );

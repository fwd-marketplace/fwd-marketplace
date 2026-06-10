ALTER TABLE public.historial_estado_proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partes del proyecto ven el historial"
  ON public.historial_estado_proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.oferta o
      JOIN public.estado_oferta eo ON o.id_estado = eo.id
      WHERE o.id_proyecto = id_proyecto
      AND o.id_usuario = auth.uid()
      AND eo.nombre = 'adjudicada'
    )
  );

-- Log inmutable: solo INSERT. Nunca UPDATE ni DELETE.
CREATE POLICY "solo se insertan filas en el historial"
  ON public.historial_estado_proyecto FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

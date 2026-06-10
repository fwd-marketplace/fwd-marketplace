ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve su avatar"
  ON public.files FOR SELECT
  USING (id_usuario = auth.uid() OR id_usuario IS NULL);

CREATE POLICY "logos de empresa son publicos"
  ON public.files FOR SELECT
  USING (tipo = 'logo' AND id_empresario IS NOT NULL);

CREATE POLICY "entregable accesible para partes del proyecto"
  ON public.files FOR SELECT
  USING (
    tipo = 'entregable' AND (
      EXISTS (
        SELECT 1 FROM public.entregable en
        WHERE en.id = id_entregable AND en.id_usuario = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.entregable en
        JOIN public.proyecto p ON en.id_proyecto = p.id
        JOIN public.empresario e ON p.id_empresario = e.id
        WHERE en.id = id_entregable AND e.id_usuario = auth.uid()
      )
    )
  );

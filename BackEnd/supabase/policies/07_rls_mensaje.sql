ALTER TABLE public.mensaje ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mensajes publicos visibles para autenticados"
  ON public.mensaje FOR SELECT
  USING (es_publico = true);

CREATE POLICY "mensajes privados solo para partes"
  ON public.mensaje FOR SELECT
  USING (
    es_publico = false AND (
      id_remitente = auth.uid() OR
      id_destinatario = auth.uid()
    )
  );

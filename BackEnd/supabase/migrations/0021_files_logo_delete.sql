-- Allow an empresario to delete their own logo from the files table.
-- Without this policy, uploadMyLogo cannot remove the previous logo row
-- before inserting a new one, causing duplicate rows and a maybeSingle() error.
CREATE POLICY "files_logo_eliminar" ON public.files FOR DELETE
  USING (
    tipo = 'logo' AND EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );

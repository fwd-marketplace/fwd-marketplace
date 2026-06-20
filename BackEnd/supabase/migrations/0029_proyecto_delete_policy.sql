-- Permite al dueño del proyecto eliminar sus propios proyectos.
-- Sin esta política el DELETE era bloqueado silenciosamente por RLS
-- (PostgREST devuelve éxito sin eliminar ninguna fila).
CREATE POLICY "proyecto_eliminar" ON public.proyecto FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );

-- 0035_oferta_delete_policy.sql
-- Permite al junior eliminar (retirar) sus propias postulaciones
-- siempre que estén en estado "enviada" o "en_revision".
-- Sin esta policy, RLS bloqueaba el DELETE aunque el GRANT de authenticated
-- estuviera presente (0009_fix_rls_recursion_and_grants.sql).

CREATE POLICY "junior_retirar_propia_oferta" ON public.oferta
  FOR DELETE
  USING (
    id_usuario = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.estado_oferta eo
      WHERE eo.id = id_estado
        AND eo.nombre IN ('enviada', 'en_revision')
    )
  );

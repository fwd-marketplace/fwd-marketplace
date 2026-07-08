-- 0014_fix_historial_ver_proyecto.sql
-- Corrige un bug latente (pre-existente desde la 0008) en la politica
-- `historial_ver` de public.historial_estado_proyecto.
--
-- En la rama de "junior adjudicado", la condicion `o.id_proyecto = id_proyecto`
-- quedaba como `o.id_proyecto = o.id_proyecto` (tautologia: siempre true), porque
-- el nombre sin calificar `id_proyecto` se resolvia hacia la columna de `oferta o`
-- (que tambien se llama id_proyecto) en vez de la fila externa del historial.
-- Efecto: un junior con CUALQUIER oferta adjudicada podia ver el historial de
-- CUALQUIER proyecto.
--
-- Fix: calificar la columna externa (historial_estado_proyecto.id_proyecto) en
-- ambas ramas EXISTS. La logica de roles ya quedo en is_admin() (0013).
-- Idempotente.

DROP POLICY IF EXISTS "historial_ver" ON public.historial_estado_proyecto;
CREATE POLICY "historial_ver" ON public.historial_estado_proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = historial_estado_proyecto.id_proyecto
        AND e.id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.oferta o
      JOIN public.estado_oferta eo ON o.id_estado = eo.id
      WHERE o.id_proyecto = historial_estado_proyecto.id_proyecto
        AND o.id_usuario = auth.uid()
        AND eo.nombre = 'adjudicada'
    )
    OR public.is_admin()
  );

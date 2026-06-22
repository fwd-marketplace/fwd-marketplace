-- ─────────────────────────────────────────────────────────────────────────────
-- 0037_proyecto_condiciones.sql
-- "Condiciones y preguntas frecuentes" del proyecto: texto libre y OPCIONAL que la empresa
-- redacta al crear/editar el proyecto (alcance, expectativas, dudas comunes). Lo usa el chatbot
-- del proyecto para responderle al junior con informacion real de la empresa, sin inventar.
-- No es para el pago/remuneracion entre empresa y junior (fuera del MVP): solo condiciones del
-- trabajo a realizar. Aplicar en el SQL Editor de Supabase y regenerar database.types.ts.
--   npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts
-- No requiere politicas nuevas: las de SELECT/UPDATE de `proyecto` ya cubren la columna.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.proyecto
  ADD COLUMN condiciones text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.proyecto.condiciones IS
  'Condiciones y preguntas frecuentes del proyecto (texto libre, opcional). Lo usa el chatbot del proyecto como contexto para responder dudas del junior.';

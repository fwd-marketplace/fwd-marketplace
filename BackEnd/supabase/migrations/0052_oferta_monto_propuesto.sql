-- ─────────────────────────────────────────────────────────────────────────────
-- 0052_oferta_monto_propuesto.sql
-- Contraoferta del junior: monto en USD que el junior propone cobrar por el
-- proyecto, calculado con la calculadora de cotización (alcance, complejidad,
-- stack, funcionalidades, tarifa, modalidad, IVA). Es informativo, igual que
-- proyecto.compensacion; la plataforma NO procesa pagos (cobro externo).
--
-- Rango idéntico al de proyecto.compensacion (0047) para mantener consistencia:
-- entre 50 y 10000 USD. NULL = el junior no envió contraoferta.
--
-- Aplicar en el SQL Editor de Supabase y regenerar database.types.ts:
--   npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts
--
-- No requiere políticas RLS nuevas: las de SELECT/INSERT/UPDATE de `oferta` ya
-- cubren las columnas nuevas (el junior escribe las suyas; la empresa las lee).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.oferta
  ADD COLUMN IF NOT EXISTS monto_propuesto numeric(10,2)
    CHECK (monto_propuesto IS NULL OR (monto_propuesto >= 50 AND monto_propuesto <= 10000)),
  ADD COLUMN IF NOT EXISTS moneda_propuesta varchar(3) NOT NULL DEFAULT 'USD'
    CHECK (moneda_propuesta IN ('USD'));

COMMENT ON COLUMN public.oferta.monto_propuesto IS
  'Monto total en USD que el junior propone cobrar por el proyecto (contraoferta). Informativo; el cobro es externo.';
COMMENT ON COLUMN public.oferta.moneda_propuesta IS
  'Moneda de la contraoferta. MVP: solo USD.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 0047_proyecto_compensacion.sql
-- Compensación declarada por proyecto: monto que la empresa/emprendedor indica
-- estar dispuesto a pagar al junior por completar el trabajo. Es informativo;
-- la plataforma NO procesa pagos (cobro externo entre las partes).
--
-- Aplicar en el SQL Editor de Supabase y regenerar database.types.ts:
--   npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts
--
-- No requiere políticas RLS nuevas: las de SELECT/UPDATE de `proyecto` ya cubren
-- las columnas nuevas.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.proyecto
  ADD COLUMN IF NOT EXISTS compensacion numeric(10,2)
    CHECK (compensacion IS NULL OR (compensacion >= 50 AND compensacion <= 10000)),
  ADD COLUMN IF NOT EXISTS moneda varchar(3) NOT NULL DEFAULT 'USD'
    CHECK (moneda IN ('USD')),
  ADD COLUMN IF NOT EXISTS compensacion_actualizada_en timestamptz;

COMMENT ON COLUMN public.proyecto.compensacion IS
  'Monto total declarado que la empresa pagará al junior por el proyecto. Informativo; el cobro es externo.';
COMMENT ON COLUMN public.proyecto.moneda IS
  'Moneda de la compensación. MVP: solo USD.';
COMMENT ON COLUMN public.proyecto.compensacion_actualizada_en IS
  'Última modificación de compensacion (transparencia para postulantes).';

CREATE INDEX IF NOT EXISTS proyecto_compensacion_idx
  ON public.proyecto (compensacion)
  WHERE compensacion IS NOT NULL;

-- Legacy (Opción B): proyectos ya publicados sin compensación → pausados y ocultos
-- del marketplace (listProjects filtra en_recepcion). Se congela fecha_cierre igual
-- que pauseMyProject en la app.
UPDATE public.proyecto p
SET
  id_estado = ep_pausado.id,
  fecha_cierre = NULL
FROM public.estado_proyecto ep_rec,
     public.estado_proyecto ep_pausado
WHERE p.compensacion IS NULL
  AND p.id_estado = ep_rec.id
  AND ep_rec.nombre = 'en_recepcion'
  AND ep_pausado.nombre = 'pausado';

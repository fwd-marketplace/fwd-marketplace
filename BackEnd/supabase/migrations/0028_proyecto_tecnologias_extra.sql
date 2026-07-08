-- ─────────────────────────────────────────────────────────────────────────────
-- 0028_proyecto_tecnologias_extra.sql
-- Tecnologías "Otros" del proyecto: tecnologías escritas a mano por la empresa que no
-- están en el catálogo de skills. Se guardan por-proyecto (no ensucian el catálogo global)
-- como un arreglo de texto. Aplicar en el SQL Editor de Supabase y regenerar database.types.ts.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.proyecto
  ADD COLUMN tecnologias_extra text[] NOT NULL DEFAULT '{}';

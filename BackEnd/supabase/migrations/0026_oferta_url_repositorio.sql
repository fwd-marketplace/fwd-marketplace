-- 0026_oferta_url_repositorio.sql
-- Repositorio del prototipo en la propuesta del junior. Junto con prototipo_url
-- (deploy embebible) y documentacion_url/documentacion_tecnica (link y notas),
-- permite que la empresa revise el demo más allá de lo visual. La visibilidad de
-- la oferta ya está restringida a (junior que envía + empresa dueña) por el RLS
-- existente, así que no hace falta tocar políticas.

ALTER TABLE public.oferta ADD COLUMN IF NOT EXISTS url_repositorio varchar(500);

-- Recargar el cache de esquema de PostgREST para exponer la columna nueva.
notify pgrst, 'reload schema';

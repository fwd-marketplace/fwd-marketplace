-- 0041: Traducción bilingüe (es/en) del contenido de proyectos.
--
-- "Traducir al escribir, guardar ambos idiomas": cuando una empresa crea o edita un proyecto,
-- el BackEnd traduce el contenido al idioma opuesto y lo guarda aquí. El FrontEnd muestra el
-- ORIGINAL y, con un botón "ver traducción", la versión guardada.
--
--  - idioma_original: idioma en que la empresa escribió el proyecto ('es' | 'en').
--  - traduccion: JSON { titulo, descripcion, condiciones } en el idioma OPUESTO; null si la
--    traducción automática no estuvo disponible (best-effort, no bloquea la creación).

ALTER TABLE public.proyecto
  ADD COLUMN idioma_original varchar(2) NOT NULL DEFAULT 'es',
  ADD COLUMN traduccion jsonb;

COMMENT ON COLUMN public.proyecto.idioma_original IS
  'Idioma original del contenido del proyecto (es/en).';
COMMENT ON COLUMN public.proyecto.traduccion IS
  'Traducción { titulo, descripcion, condiciones } al idioma opuesto; null si no disponible.';

-- PostgREST necesita recargar el esquema tras cambios de columnas.
notify pgrst, 'reload schema';

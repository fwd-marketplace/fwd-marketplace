-- 0041: Traducción bilingüe (es/en) de los mensajes del chat humano empresa<->estudiante.
--
-- "Traducir al enviar, guardar ambos idiomas": al enviar un mensaje, el BackEnd traduce el
-- contenido al idioma opuesto y lo guarda aquí. El FrontEnd muestra el ORIGINAL y, con un botón
-- "ver traducción", la versión traducida.
--
--  - idioma_original: idioma en que el remitente escribió el mensaje ('es' | 'en').
--  - contenido_traducido: el mensaje en el idioma OPUESTO; null si la traducción no estuvo
--    disponible (best-effort, no bloquea el envío).

ALTER TABLE public.mensaje
  ADD COLUMN idioma_original varchar(2) NOT NULL DEFAULT 'es',
  ADD COLUMN contenido_traducido text;

COMMENT ON COLUMN public.mensaje.idioma_original IS
  'Idioma original del mensaje (es/en).';
COMMENT ON COLUMN public.mensaje.contenido_traducido IS
  'Contenido traducido al idioma opuesto; null si no disponible.';

-- PostgREST necesita recargar el esquema tras cambios de columnas.
notify pgrst, 'reload schema';

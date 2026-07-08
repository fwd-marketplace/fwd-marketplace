-- Agrega el estado "solicitar_cambios" a la tabla de estados de oferta
-- y una columna para que la empresa deje comentarios de revisión.

-- 1. Nuevo estado de oferta
INSERT INTO public.estado_oferta (nombre, descripcion)
VALUES ('solicitar_cambios', 'La empresa solicitó ajustes en la propuesta del junior')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Columna para comentarios de revisión (empresa → junior, durante el proceso)
ALTER TABLE public.oferta
  ADD COLUMN IF NOT EXISTS comentario_revision text;

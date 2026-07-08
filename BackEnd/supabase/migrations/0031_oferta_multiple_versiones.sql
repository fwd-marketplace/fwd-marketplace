-- Permite múltiples ofertas del mismo junior para el mismo proyecto
-- (una por cada ronda de revisión cuando la empresa solicita cambios).
-- La unicidad se mantiene en lógica de negocio: solo se acepta una nueva
-- oferta cuando la más reciente está en estado 'solicitar_cambios'.
ALTER TABLE public.oferta
  DROP CONSTRAINT IF EXISTS oferta_id_proyecto_id_usuario_key;

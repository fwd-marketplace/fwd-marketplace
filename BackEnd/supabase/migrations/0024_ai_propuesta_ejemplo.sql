-- ─────────────────────────────────────────────────────────────────────────────
-- 0024_ai_propuesta_ejemplo.sql
-- "Memoria" del asistente de IA: guarda cada propuesta generada para que el sistema
-- mejore con el uso. Sirve para (a) recuperar ejemplos previos de la propia empresa
-- como referencia al generar una nueva propuesta, y (b) tener la señal de qué se
-- propuso vs. qué terminó creando la empresa.
--
-- El asistente funciona igual sin esta tabla: la lectura y escritura son best-effort
-- (si la tabla no existe, se omite y se sigue). Aplicar en el SQL Editor de Supabase
-- y luego regenerar database.types.ts.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.ai_propuesta_ejemplo (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id_area_negocio      uuid REFERENCES public.area_negocio(id),
  resumen_conversacion text,
  propuesta            jsonb NOT NULL,
  fecha                timestamptz NOT NULL DEFAULT now()
);

-- Para recuperar rápido las últimas propuestas de un usuario.
CREATE INDEX ai_propuesta_ejemplo_usuario_fecha_idx
  ON public.ai_propuesta_ejemplo (id_usuario, fecha DESC);

ALTER TABLE public.ai_propuesta_ejemplo ENABLE ROW LEVEL SECURITY;

-- Cada empresa solo inserta y lee SUS propias propuestas (memoria por empresa, privacy-safe).
CREATE POLICY "ai_propuesta_ejemplo_owner_insert" ON public.ai_propuesta_ejemplo
  FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "ai_propuesta_ejemplo_owner_select" ON public.ai_propuesta_ejemplo
  FOR SELECT USING (auth.uid() = id_usuario);

-- Grant base para el rol authenticated (el RLS filtra fila por fila).
GRANT SELECT, INSERT ON public.ai_propuesta_ejemplo TO authenticated;

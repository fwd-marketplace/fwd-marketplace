-- Progreso del junior en el Viaje de Aprendizaje.
-- Solo se guardan estrellas completadas (mastery >= 1).
-- El estado locked/available se re-deriva en el cliente con recompute().

CREATE TABLE IF NOT EXISTS viaje_progress (
  user_id    UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  star_id    TEXT     NOT NULL,
  mastery    SMALLINT NOT NULL DEFAULT 1 CHECK (mastery BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, star_id)
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_viaje_progress_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_viaje_progress_updated_at
  BEFORE UPDATE ON viaje_progress
  FOR EACH ROW EXECUTE FUNCTION update_viaje_progress_updated_at();

-- RLS: cada junior solo ve y modifica su propio progreso
ALTER TABLE viaje_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "junior_ve_su_progreso"
  ON viaje_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "junior_modifica_su_progreso"
  ON viaje_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "junior_actualiza_su_progreso"
  ON viaje_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

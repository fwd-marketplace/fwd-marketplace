ALTER TABLE public.empresario
  ADD COLUMN IF NOT EXISTS modalidades TEXT NULL,
  ADD COLUMN IF NOT EXISTS horario     VARCHAR(20) NULL
    CONSTRAINT empresario_horario_check
      CHECK (horario IN ('flexible', 'fixed'));

-- Agrega columnas de identidad y cultura al perfil de empresa/emprendedor
ALTER TABLE empresario
  ADD COLUMN IF NOT EXISTS mision  TEXT,
  ADD COLUMN IF NOT EXISTS vision  TEXT,
  ADD COLUMN IF NOT EXISTS cultura TEXT,
  ADD COLUMN IF NOT EXISTS valores TEXT;

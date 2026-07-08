-- Agrega contactos de reclutamiento al perfil de empresa/emprendedor
ALTER TABLE empresario
  ADD COLUMN IF NOT EXISTS contactos TEXT;

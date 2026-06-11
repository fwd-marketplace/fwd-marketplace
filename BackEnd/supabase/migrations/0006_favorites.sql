-- id_proyecto nullable: null = favorito global, con valor = favorito por proyecto
-- UNIQUE(id_empresario, id_estudiante, id_proyecto): permite mismo estudiante en ambos modos
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresario uuid NOT NULL REFERENCES public.empresario(id) ON DELETE CASCADE,
  id_estudiante uuid NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
  id_proyecto uuid REFERENCES public.proyecto(id),
  nota text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id_empresario, id_estudiante, id_proyecto)
);

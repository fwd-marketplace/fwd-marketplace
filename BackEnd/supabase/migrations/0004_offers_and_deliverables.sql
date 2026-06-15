-- id_usuario (no id_estudiante) — FK directa a Users para simplificar RLS via auth.uid()
CREATE TABLE public.oferta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id),
  id_usuario uuid NOT NULL REFERENCES public.users(id),
  id_estado uuid NOT NULL REFERENCES public.estado_oferta(id),
  propuesta text NOT NULL, -- el junior SIEMPRE escribe la suya. La IA nunca la genera.
  prototipo_url varchar(500),
  calificacion integer CHECK (calificacion BETWEEN 1 AND 5),
  comentario_calificacion text,   -- comentario del empresario (RF-36)
  replica_calificacion text,      -- respuesta del junior, una sola vez (RF-53)
  fecha_envio timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id_proyecto, id_usuario) -- un junior no puede postular dos veces al mismo proyecto
);

-- id_usuario (no id_estudiante) — FK directa a Users para simplificar RLS
CREATE TABLE public.entregable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id),
  id_usuario uuid NOT NULL REFERENCES public.users(id),
  id_estado uuid NOT NULL REFERENCES public.estado_entregable(id),
  group_id uuid NOT NULL, -- agrupa todas las versiones del mismo entregable
  tipo varchar(10) NOT NULL CHECK (tipo IN ('parcial', 'final')),
  version integer NOT NULL DEFAULT 1,
  fecha timestamptz NOT NULL DEFAULT now()
);

-- id_estudiante se mantiene (semántica de egresado verificado en la regla de negocio)
-- UNIQUE(id_proyecto): solo una evaluación por proyecto
CREATE TABLE public.evaluacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id),
  id_estudiante uuid NOT NULL REFERENCES public.estudiante(id),
  puntuacion integer NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario text,
  replica text, -- respuesta del estudiante al comentario, una sola vez (RF-53)
  fecha timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id_proyecto)
);

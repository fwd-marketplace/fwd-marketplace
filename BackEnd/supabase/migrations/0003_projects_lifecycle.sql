CREATE TABLE public.proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresario uuid NOT NULL REFERENCES public.empresario(id),
  id_area_negocio uuid NOT NULL REFERENCES public.area_negocio(id),
  id_estado uuid NOT NULL REFERENCES public.estado_proyecto(id),
  titulo varchar(255) NOT NULL,
  descripcion text NOT NULL,
  usa_ia boolean NOT NULL DEFAULT false,
  plazo_dias integer NOT NULL CHECK (plazo_dias BETWEEN 5 AND 15),
  fecha_publicacion timestamptz,
  fecha_cierre timestamptz -- derivada: fecha_publicacion + plazo_dias. La calcula la app, no el usuario.
);

-- Tecnologías requeridas por el proyecto
CREATE TABLE public.project_skills (
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id) ON DELETE CASCADE,
  id_skill uuid NOT NULL REFERENCES public.skills(id),
  PRIMARY KEY (id_proyecto, id_skill)
);

-- Historial de cambios de estado — LOG INMUTABLE
-- REGLA: solo INSERT. Nunca UPDATE ni DELETE.
CREATE TABLE public.historial_estado_proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id) ON DELETE CASCADE,
  id_estado_anterior uuid REFERENCES public.estado_proyecto(id),
  id_estado_nuevo uuid NOT NULL REFERENCES public.estado_proyecto(id),
  motivo text, -- obligatorio cuando id_estado_nuevo apunta a 'cancelado'
  id_usuario uuid NOT NULL REFERENCES public.users(id),
  fecha timestamptz NOT NULL DEFAULT now()
);

-- Conversación IA para definir requerimientos del proyecto
CREATE TABLE public.conversacion_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresario uuid NOT NULL REFERENCES public.empresario(id),
  id_proyecto uuid REFERENCES public.proyecto(id), -- null hasta que el empresario confirma y publica
  historial jsonb NOT NULL DEFAULT '[]'::jsonb,
  estado varchar(20) NOT NULL DEFAULT 'en_curso'
    CHECK (estado IN ('en_curso', 'finalizada')),
  fecha timestamptz NOT NULL DEFAULT now()
);

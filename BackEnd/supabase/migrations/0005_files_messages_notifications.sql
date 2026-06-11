-- CHECK constraint obligatorio: exactamente una FK tiene valor, las demás null
-- Previene archivos huérfanos y dueños ambiguos
CREATE TABLE public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid REFERENCES public.users(id),
  id_empresario uuid REFERENCES public.empresario(id),
  id_oferta uuid REFERENCES public.oferta(id),
  id_entregable uuid REFERENCES public.entregable(id),
  tipo varchar(20) NOT NULL
    CHECK (tipo IN ('avatar', 'logo', 'prototipo', 'entregable', 'cv')),
  tamano bigint NOT NULL, -- SIEMPRE en bytes. El frontend convierte a KB/MB/GB.
  storage_path varchar(500) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT files_single_owner CHECK (
    (id_usuario IS NOT NULL)::int +
    (id_empresario IS NOT NULL)::int +
    (id_oferta IS NOT NULL)::int +
    (id_entregable IS NOT NULL)::int = 1
  )
);

-- Mensajería unificada: preguntas públicas (EN_RECEPCION) + chat privado 1:1
-- id_destinatario: null si es_publico=true, requerido si es_publico=false
CREATE TABLE public.mensaje (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto uuid NOT NULL REFERENCES public.proyecto(id),
  id_remitente uuid NOT NULL REFERENCES public.users(id),
  id_destinatario uuid REFERENCES public.users(id),
  contenido text NOT NULL,
  es_publico boolean NOT NULL DEFAULT false,
  fecha_envio timestamptz NOT NULL DEFAULT now()
);

-- Notificaciones internas
-- La IA consulta users.preferencias_notificacion antes de insertar aquí
CREATE TABLE public.notificacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo varchar(50) NOT NULL
    CHECK (tipo IN ('adjudicacion','vencimiento_plazo','nuevo_mensaje','entregable_subido','cambio_estado')),
  mensaje varchar(500) NOT NULL,
  leida boolean NOT NULL DEFAULT false,
  fecha timestamptz NOT NULL DEFAULT now()
);

-- Auditoría obligatoria de llamadas a IA (RNF-32) — nunca exponer al frontend
CREATE TABLE public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo varchar(20) NOT NULL CHECK (tipo IN ('agente','matching','sugerencia')),
  id_usuario uuid REFERENCES public.users(id),
  proveedor varchar(20) NOT NULL CHECK (proveedor IN ('groq','gemini')),
  tokens_input integer,
  tokens_output integer,
  duracion_ms integer,
  fecha timestamptz NOT NULL DEFAULT now()
);

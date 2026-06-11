-- Users.id = auth.users.id (Opción A acordada por el equipo)
-- Sin columna contrasena_hash — Supabase Auth maneja las credenciales
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre varchar(100) NOT NULL,
  apellido1 varchar(100) NOT NULL,
  apellido2 varchar(100),
  cedula varchar(20) UNIQUE NOT NULL,
  correo varchar(255) UNIQUE NOT NULL,
  id_rol uuid NOT NULL REFERENCES public.roles(id),
  preferencias_notificacion jsonb DEFAULT '{"adjudicacion":true,"vencimiento_plazo":true,"nuevo_mensaje":true,"entregable_subido":true,"cambio_estado":true}'::jsonb,
  estado_cuenta varchar(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_cuenta IN ('activa', 'pendiente', 'suspendida')),
  fecha_registro timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Perfil del estudiante (junior) — 1:1 con Users
CREATE TABLE public.estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo_fwd varchar(100),
  estado_verificacion varchar(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_verificacion IN ('pendiente', 'verificado', 'rechazado')),
  reputacion decimal(3,2) CHECK (reputacion BETWEEN 1.00 AND 5.00),
  descripcion text,
  url_github varchar(500) NOT NULL,
  url_linkedin varchar(500) NOT NULL
);

-- Perfil del empresario — 1:1 con Users
CREATE TABLE public.empresario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo varchar(20) NOT NULL CHECK (tipo IN ('empresa', 'emprendedor')),
  sector varchar(100),
  descripcion text
);

-- Portafolio personal del estudiante (RF-10 a RF-13)
-- Distinto de los proyectos de la plataforma
CREATE TABLE public.portafolio_proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_estudiante uuid NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
  titulo varchar(255) NOT NULL,
  descripcion text,
  tecnologias text, -- texto libre separado por comas
  url_repositorio varchar(500),
  url_demo varchar(500),
  fecha date,
  visibilidad varchar(20) NOT NULL DEFAULT 'publico'
    CHECK (visibilidad IN ('publico', 'solo_empresas'))
);

-- Skills del estudiante (N:M con nivel de dominio)
CREATE TABLE public.student_skills (
  id_estudiante uuid NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
  id_skill uuid NOT NULL REFERENCES public.skills(id),
  nivel varchar(20) NOT NULL CHECK (nivel IN ('basico', 'intermedio', 'avanzado')),
  PRIMARY KEY (id_estudiante, id_skill)
);

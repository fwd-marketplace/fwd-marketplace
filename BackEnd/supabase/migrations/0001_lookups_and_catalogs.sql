-- Lookup: estados del proyecto (reemplaza enum nativo — extensible con INSERT)
CREATE TABLE public.estado_proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(50) UNIQUE NOT NULL,
  descripcion varchar(255),
  orden integer NOT NULL,
  es_final boolean NOT NULL DEFAULT false
);

-- Lookup: estados de la oferta
CREATE TABLE public.estado_oferta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(50) UNIQUE NOT NULL,
  descripcion varchar(255)
);

-- Lookup: estados del entregable
CREATE TABLE public.estado_entregable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(50) UNIQUE NOT NULL,
  descripcion varchar(255)
);

-- Catálogo: roles del sistema (extensible con INSERT, no con ALTER TYPE)
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(50) UNIQUE NOT NULL,
  descripcion varchar(255)
);

-- Catálogo: permisos de vistas por rol
CREATE TABLE public.roles_permisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_rol uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  vista varchar(100) NOT NULL,
  puede_acceder boolean NOT NULL DEFAULT true,
  UNIQUE(id_rol, vista)
);

-- Catálogo: áreas de negocio (RF-20, RF-68 — administrado por el admin)
CREATE TABLE public.area_negocio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(100) UNIQUE NOT NULL,
  descripcion varchar(255),
  activo boolean NOT NULL DEFAULT true
);

-- Catálogo: skills unificado (fusiona Habilidad + Tecnologia del SRS)
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(100) NOT NULL,
  tipo varchar(20) NOT NULL CHECK (tipo IN ('habilidad', 'tecnologia')),
  categoria varchar(100)
);

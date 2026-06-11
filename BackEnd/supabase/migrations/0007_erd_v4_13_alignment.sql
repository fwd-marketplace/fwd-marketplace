-- Alineación con el ERD v4.13 (aprobado por el equipo).
-- Aplica el delta sobre el esquema base (0001-0006). Seguro e idempotente.

-- 1. Limpieza: fwd_graduates fue creada por error en la configuración inicial.
--    La verificación de egresados se resolverá por otra vía.
DROP TABLE IF EXISTS public.fwd_graduates;

-- 2. Estudiante: campos del onboarding completo (Steps 2-4).
ALTER TABLE public.estudiante
  ADD COLUMN IF NOT EXISTS url_portfolio varchar(500),
  ADD COLUMN IF NOT EXISTS especialidad varchar(20)
    CHECK (especialidad IN ('frontend','backend','fullstack','ia')),
  ADD COLUMN IF NOT EXISTS modalidad_preferida varchar(50),
  ADD COLUMN IF NOT EXISTS disponibilidad varchar(20)
    CHECK (disponibilidad IN ('immediate','two_weeks','one_month','unavailable'));

COMMENT ON COLUMN public.estudiante.url_portfolio IS
  'URL general de portafolio (Behance, portafolio personal, etc). Distinta de portafolio_proyecto.';
COMMENT ON COLUMN public.estudiante.especialidad IS
  'Área de especialización — Step 2 del onboarding junior.';
COMMENT ON COLUMN public.estudiante.modalidad_preferida IS
  'Modalidad de trabajo preferida — Step 3. Puede contener múltiples valores separados por coma.';
COMMENT ON COLUMN public.estudiante.disponibilidad IS
  'Disponibilidad para iniciar proyectos — Step 4 del onboarding.';

-- 3. Empresario: campos completos de empresa y emprendedor (Step 1).
ALTER TABLE public.empresario
  ADD COLUMN IF NOT EXISTS nombre_comercial varchar(255),
  ADD COLUMN IF NOT EXISTS cedula_juridica varchar(30),
  ADD COLUMN IF NOT EXISTS url_sitio_web varchar(500),
  ADD COLUMN IF NOT EXISTS etapa varchar(20)
    CHECK (etapa IN ('idea','mvp','validating','scaling')),
  ADD COLUMN IF NOT EXISTS apoyo_tecnico_necesario text,
  ADD COLUMN IF NOT EXISTS presupuesto varchar(30)
    CHECK (presupuesto IN ('under_500','range_500_1000','range_1000_2500','flexible')),
  ADD COLUMN IF NOT EXISTS tipos_proyecto varchar(500);

COMMENT ON COLUMN public.empresario.nombre_comercial IS
  'Nombre comercial de la empresa o emprendimiento — Step 1 del onboarding.';
COMMENT ON COLUMN public.empresario.cedula_juridica IS
  'Solo para tipo=empresa. NULL para emprendedor (emprendedor usa users.cedula).';
COMMENT ON COLUMN public.empresario.etapa IS
  'Etapa del emprendimiento — solo para tipo=emprendedor.';
COMMENT ON COLUMN public.empresario.presupuesto IS
  'Rango de presupuesto — solo para tipo=emprendedor.';
COMMENT ON COLUMN public.empresario.tipos_proyecto IS
  'Tipos de proyectos a publicar — texto libre para MVP.';

-- 4. Student_skills: default 'intermedio' para el onboarding.
ALTER TABLE public.student_skills
  ALTER COLUMN nivel SET DEFAULT 'intermedio';

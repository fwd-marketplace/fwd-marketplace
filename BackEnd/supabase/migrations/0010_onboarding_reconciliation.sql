-- 0010_onboarding_reconciliation.sql
-- Alinea el esquema con lo que el FrontEnd recolecta en el onboarding.
-- Decisiones acordadas con el equipo (ver BackEnd/docs/auth-contract.md).

-- 1. users: apellido1 y cedula son personales (solo del junior).
--    Empresa y emprendedor no los recolectan -> deben poder ser NULL.
--    (users.nombre se mantiene NOT NULL: para empresa/emprendedor se usa el
--     nombre comercial / del proyecto como nombre visible.)
ALTER TABLE public.users ALTER COLUMN apellido1 DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN cedula DROP NOT NULL;

-- 2. estudiante: el FE marca GitHub y LinkedIn como opcionales (Step 6).
ALTER TABLE public.estudiante ALTER COLUMN url_github DROP NOT NULL;
ALTER TABLE public.estudiante ALTER COLUMN url_linkedin DROP NOT NULL;

-- 3. Campos que guardarán arrays serializados como JSON -> ampliar a text.
--    modalidad_preferida (junior) y sector (empresa) llegan como arrays.
ALTER TABLE public.estudiante ALTER COLUMN modalidad_preferida TYPE text;
ALTER TABLE public.empresario  ALTER COLUMN sector TYPE text;

-- 4. empresario: dirección de los datos legales (onboarding empresa, Step 4).
ALTER TABLE public.empresario ADD COLUMN IF NOT EXISTS direccion text;

-- 5. users.estado_cuenta: permitir 'rechazada' (el admin puede rechazar cuentas).
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_estado_cuenta_check;
ALTER TABLE public.users ADD CONSTRAINT users_estado_cuenta_check
  CHECK (estado_cuenta IN ('activa', 'pendiente', 'suspendida', 'rechazada'));

-- Configuración global del marketplace (fila única, id = 1). La edita el admin desde
-- el panel de Configuración; el backend la lee para gatear comportamiento (registros
-- de talento, registro de empresas, postulaciones, matching).

CREATE TABLE IF NOT EXISTS public.app_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  allow_signups boolean NOT NULL DEFAULT true,
  allow_companies boolean NOT NULL DEFAULT true,
  allow_applications boolean NOT NULL DEFAULT true,
  enable_matching boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Fila única de configuración (idempotente).
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado puede leer los flags (no son sensibles).
DROP POLICY IF EXISTS "app_settings_leer" ON public.app_settings;
CREATE POLICY "app_settings_leer" ON public.app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Escritura: solo admin (is_admin() ya existe, ver migración 0013).
DROP POLICY IF EXISTS "app_settings_admin_editar" ON public.app_settings;
CREATE POLICY "app_settings_admin_editar" ON public.app_settings FOR UPDATE
  USING (public.is_admin());

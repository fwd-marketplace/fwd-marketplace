-- Tabla de egresados FWD para verificación de estudiantes
CREATE TABLE IF NOT EXISTS public.fwd_graduates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula varchar(20) UNIQUE NOT NULL,
  nombre_completo varchar(255) NOT NULL,
  cohorte varchar(50),
  fecha_graduacion date
);

-- Datos de prueba — reemplazar con datos reales antes del Demo Day
INSERT INTO public.fwd_graduates (cedula, nombre_completo, cohorte) VALUES
  ('1-1234-5678', 'Carlos Rodríguez Mora', 'Cohorte 2026-1'),
  ('2-3456-7890', 'Ana Mora Jiménez', 'Cohorte 2026-1'),
  ('3-5678-9012', 'Luis Castro Vargas', 'Cohorte 2025-2');

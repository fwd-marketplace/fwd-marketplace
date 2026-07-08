-- ============================================================
-- Registro externo de egresados FWD  (proyecto Supabase SEPARADO del marketplace)
--
-- IMPORTANTE: este script NO se corre contra el proyecto principal (fwd-marketplace).
-- Se ejecuta UNA vez, en el SQL Editor del proyecto "fwd-egresados-registry", que
-- simula la base oficial de egresados de Fundación Forward. El marketplace lo consulta
-- por HTTP (variables FWD_REGISTRY_URL / FWD_REGISTRY_KEY) vía la función
-- verificar_egresado. La tabla queda cerrada por RLS: solo la función puede leerla,
-- así que se puede verificar una cédula puntual pero NO volcar la lista completa.
--
-- Datos de egresados: 100% ficticios (no hay acceso a la base real de FWD).
-- ============================================================

-- 1. Tabla de egresados
create table if not exists public.egresado (
  cedula          text primary key,
  nombre_completo text not null,
  titulo          text not null,
  fecha_egreso    date,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now()
);

-- 2. RLS habilitado SIN políticas -> nadie lee la tabla directo por la API.
alter table public.egresado enable row level security;

-- 3. Función de verificación (SECURITY DEFINER: lee la tabla saltándose RLS).
--    Normaliza la cédula (ignora guiones y espacios) para no depender del formato.
--    Devuelve la fila del egresado ACTIVO si coincide; si no, no devuelve nada.
create or replace function public.verificar_egresado(p_cedula text)
returns table (nombre_completo text, titulo text, fecha_egreso date)
language sql
security definer
set search_path = public
as $$
  select e.nombre_completo, e.titulo, e.fecha_egreso
  from public.egresado e
  where regexp_replace(e.cedula, '[^0-9]', '', 'g') = regexp_replace(p_cedula, '[^0-9]', '', 'g')
    and e.activo = true;
$$;

-- 4. Permisos: la API (anon/authenticated) SOLO puede EJECUTAR la función, no leer la tabla.
revoke all on function public.verificar_egresado(text) from public;
grant execute on function public.verificar_egresado(text) to anon, authenticated;

-- 5. Seed: 12 egresados de prueba (datos ficticios).
insert into public.egresado (cedula, nombre_completo, titulo, fecha_egreso) values
  ('1-1234-5678', 'María Fernanda Jiménez Mora',    'Desarrollo Web Full Stack',       '2024-06-14'),
  ('2-0765-0432', 'José Andrés Rodríguez Vargas',   'Desarrollo Back-End',             '2024-06-14'),
  ('1-1588-0910', 'Valeria Solís Campos',           'Desarrollo Front-End',            '2023-11-30'),
  ('3-0456-0789', 'Diego Alberto Mora Chaves',      'Data e Inteligencia Artificial',  '2024-06-14'),
  ('1-1699-0123', 'Gabriela Herrera Ugalde',        'Diseño UX/UI',                    '2023-11-30'),
  ('4-0234-0567', 'Luis Fernando Castro Quesada',   'Desarrollo Web Full Stack',       '2025-03-20'),
  ('1-1720-0456', 'Andrea Camila Vega Salas',       'Desarrollo Front-End',            '2025-03-20'),
  ('2-0678-0891', 'Kevin Josué Araya Núñez',        'Desarrollo Back-End',             '2024-06-14'),
  ('1-1345-0672', 'Daniela Patricia Rojas León',    'Data e Inteligencia Artificial',  '2025-03-20'),
  ('6-0389-0210', 'Esteban Alonso Fonseca Ramírez', 'Desarrollo Web Full Stack',       '2023-11-30'),
  ('1-1811-0334', 'Melissa Alfaro Cordero',         'Diseño UX/UI',                    '2025-03-20'),
  ('7-0145-0623', 'Bryan Steven Méndez Aguilar',    'Desarrollo Back-End',             '2024-06-14')
on conflict (cedula) do nothing;

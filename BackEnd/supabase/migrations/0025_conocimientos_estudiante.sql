-- 0025_conocimientos_estudiante.sql
-- Conocimientos adicionales (no técnicos) del estudiante: contabilidad, RRHH,
-- marketing, etc. Amplían el perfil más allá del stack técnico para que el match
-- estudiante<->empresa sea más preciso.
--
-- Modelo: catálogo de sugerencias `conocimiento` (curado por admin, solo para
-- autocompletar en el FE) + lista por estudiante `estudiante_conocimiento` que
-- guarda el NOMBRE como string. Así las entradas libres ("otro") también se
-- persisten y cuentan para el match, no solo las del catálogo. Se mantiene
-- separado del catálogo `skills` (stack técnico) para no mezclarlos.

-- Catálogo de sugerencias (lo gestiona el admin; el FE lo usa para autocompletar).
create table public.conocimiento (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(60) not null unique,
  categoria varchar(100)
);

-- Conocimientos elegidos o escritos por cada estudiante (nombre libre o de catálogo).
create table public.estudiante_conocimiento (
  id_estudiante uuid not null references public.estudiante(id) on delete cascade,
  nombre varchar(60) not null,
  primary key (id_estudiante, nombre)
);

-- ── RLS ──
alter table public.conocimiento enable row level security;
create policy "catalogo_lectura" on public.conocimiento
  for select using (auth.uid() is not null);
create policy "admin_catalogo" on public.conocimiento for all
  using (exists (
    select 1 from public.users u join public.roles r on u.id_rol = r.id
    where u.id = auth.uid() and r.nombre = 'admin'
  ));

alter table public.estudiante_conocimiento enable row level security;
-- Cualquier autenticado los puede leer (la empresa los ve en el perfil / para el match).
create policy "conocimiento_ver" on public.estudiante_conocimiento for select
  using (auth.uid() is not null);
-- El estudiante gestiona solo los suyos.
create policy "conocimiento_gestionar" on public.estudiante_conocimiento for all
  using (
    id_estudiante in (
      select id from public.estudiante where id_usuario = auth.uid()
    )
  );

-- ── Semilla de sugerencias iniciales (el admin puede ampliarla luego) ──
insert into public.conocimiento (nombre, categoria) values
  ('Contabilidad', 'Finanzas'),
  ('Finanzas', 'Finanzas'),
  ('Recursos Humanos', 'Administración'),
  ('Administración de empresas', 'Administración'),
  ('Gestión de proyectos', 'Administración'),
  ('Emprendimiento', 'Administración'),
  ('Marketing', 'Marketing y ventas'),
  ('Marketing digital', 'Marketing y ventas'),
  ('Ventas', 'Marketing y ventas'),
  ('Atención al cliente', 'Marketing y ventas'),
  ('Community management', 'Marketing y ventas'),
  ('Investigación de mercado', 'Marketing y ventas'),
  ('Diseño gráfico', 'Diseño'),
  ('Diseño UX/UI', 'Diseño'),
  ('Redacción y creación de contenido', 'Comunicación'),
  ('Comunicación', 'Comunicación'),
  ('Inglés', 'Idiomas'),
  ('Portugués', 'Idiomas'),
  ('Análisis de datos', 'Datos'),
  ('Logística', 'Operaciones')
on conflict (nombre) do nothing;

-- Recargar el cache de esquema de PostgREST para exponer las tablas nuevas.
notify pgrst, 'reload schema';

-- 0029_notificaciones_y_eliminar_proyecto.sql
--
-- Dos funciones SECURITY DEFINER (corren con privilegios del owner, saltan RLS):
--
--  1) crear_notificacion: la tabla `notificacion` solo tiene politicas RLS de
--     SELECT/UPDATE sobre lo propio (id_usuario = auth.uid()) y NINGUNA de INSERT,
--     asi que las notificaciones se crean por esta via. Valida que quien llama (una
--     empresa) tiene relacion con el destinatario via una oferta en un proyecto suyo,
--     y respeta las preferencias del usuario (users.preferencias_notificacion).
--
--  2) eliminar_proyecto: la empresa duena borra de verdad su proyecto. No hay
--     politica de DELETE en RLS y las tablas hijas (oferta, entregable, evaluacion,
--     mensaje, conversacion_ia, favorites) NO tienen ON DELETE CASCADE, por eso se
--     borran aqui en una transaccion. Protege los proyectos 'cerrado' (registro
--     historico del junior). project_skills e historial_estado_proyecto cascadean solos.

create or replace function public.crear_notificacion(
  p_id_usuario uuid,
  p_tipo text,
  p_mensaje text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Autorizacion: quien llama debe ser la empresa de un proyecto donde el
  -- destinatario tiene (o tuvo) una postulacion.
  if not exists (
    select 1
    from public.oferta o
    join public.proyecto p on o.id_proyecto = p.id
    join public.empresario e on p.id_empresario = e.id
    where o.id_usuario = p_id_usuario
      and e.id_usuario = auth.uid()
  ) then
    raise exception 'FORBIDDEN: no podes notificar a este usuario';
  end if;

  -- Respetar las preferencias del destinatario (true por defecto si no esta seteada).
  if coalesce(
       (select (preferencias_notificacion ->> p_tipo)::boolean
        from public.users where id = p_id_usuario),
       true
     ) is false then
    return null;
  end if;

  insert into public.notificacion (id_usuario, tipo, mensaje)
  values (p_id_usuario, p_tipo, p_mensaje)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.crear_notificacion(uuid, text, text) to authenticated;

create or replace function public.eliminar_proyecto(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
begin
  -- Solo la empresa duena del proyecto.
  if not exists (
    select 1
    from public.proyecto p
    join public.empresario e on p.id_empresario = e.id
    where p.id = p_id and e.id_usuario = auth.uid()
  ) then
    raise exception 'FORBIDDEN: este proyecto no es tuyo';
  end if;

  -- Proteger el registro historico de un proyecto ya cerrado.
  select ep.nombre into v_estado
  from public.proyecto p
  join public.estado_proyecto ep on p.id_estado = ep.id
  where p.id = p_id;

  if v_estado = 'cerrado' then
    raise exception 'CONFLICT: no se puede eliminar un proyecto cerrado';
  end if;

  -- Borrar los hijos sin ON DELETE CASCADE.
  delete from public.mensaje where id_proyecto = p_id;
  delete from public.evaluacion where id_proyecto = p_id;
  delete from public.entregable where id_proyecto = p_id;
  delete from public.oferta where id_proyecto = p_id;
  delete from public.conversacion_ia where id_proyecto = p_id;
  delete from public.favorites where id_proyecto = p_id;
  -- project_skills e historial_estado_proyecto cascadean por su FK.
  delete from public.proyecto where id = p_id;
end;
$$;

grant execute on function public.eliminar_proyecto(uuid) to authenticated;

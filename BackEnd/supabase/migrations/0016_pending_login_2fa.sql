-- 0016_pending_login_2fa.sql
-- Soporte para el 2FA por email (obligatorio en login email+contraseña).
-- Tabla EFÍMERA que sostiene la sesión entre el login y la verificación del código:
-- guarda el refresh_token del usuario + el código (hasheado), con expiración e intentos.
-- Acceso SOLO vía funciones SECURITY DEFINER: la tabla tiene RLS habilitado SIN políticas,
-- así anon/authenticated no la tocan directo.

create table if not exists public.pending_login (
  ticket uuid primary key default gen_random_uuid(),
  id_usuario uuid not null references public.users(id) on delete cascade,
  codigo_hash text not null,
  refresh_token text not null,
  expira_en timestamptz not null,
  intentos integer not null default 0,
  creado_en timestamptz not null default now()
);

alter table public.pending_login enable row level security;
-- Sin políticas a propósito: nadie accede directo; solo las funciones definer de abajo.

-- Crea un pending_login y devuelve el ticket. La llama el BackEnd DESPUÉS de validar la
-- contraseña (la función no valida credenciales; el gate es que el BackEnd ya autenticó).
create or replace function public.crear_pending_login(
  p_id_usuario uuid,
  p_codigo_hash text,
  p_refresh_token text,
  p_ttl_segundos integer
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_ticket uuid;
begin
  insert into public.pending_login (id_usuario, codigo_hash, refresh_token, expira_en)
  values (p_id_usuario, p_codigo_hash, p_refresh_token,
          now() + make_interval(secs => p_ttl_segundos))
  returning ticket into v_ticket;
  return v_ticket;
end;
$$;

-- Verifica el código de un ticket. Si es correcto y no expiró, devuelve el refresh_token y
-- borra la fila (un solo uso). Si no, incrementa intentos y devuelve null. Máx 5 intentos.
create or replace function public.consumir_pending_login(
  p_ticket uuid,
  p_codigo_hash text
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_row public.pending_login%rowtype;
begin
  select * into v_row from public.pending_login where ticket = p_ticket for update;
  if not found then
    return null;
  end if;

  if v_row.expira_en < now() or v_row.intentos >= 5 then
    delete from public.pending_login where ticket = p_ticket;
    return null;
  end if;

  if v_row.codigo_hash = p_codigo_hash then
    delete from public.pending_login where ticket = p_ticket;
    return v_row.refresh_token;
  end if;

  update public.pending_login set intentos = intentos + 1 where ticket = p_ticket;
  return null;
end;
$$;

grant execute on function public.crear_pending_login(uuid, text, text, integer) to anon, authenticated;
grant execute on function public.consumir_pending_login(uuid, text) to anon, authenticated;

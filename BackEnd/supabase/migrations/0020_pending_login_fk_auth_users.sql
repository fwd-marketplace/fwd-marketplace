-- 0020_pending_login_fk_auth_users.sql
-- Corrige la FK de pending_login (creada en la 0016): debe referenciar
-- auth.users(id), NO public.users(id).
--
-- Motivo: el 2FA ocurre en el login con el id de auth.users. Un usuario autenticado
-- puede NO tener todavía fila en public.users (recién registrado, login social sin
-- onboarding, etc.), así que la FK a public.users rompía el INSERT con error 23503
-- ("violates foreign key constraint"). auth.users siempre tiene la fila tras autenticar.
--
-- (Numerada 0020 para no chocar con las 0017-0019 de otro dev de BackEnd.)

alter table public.pending_login
  drop constraint if exists pending_login_id_usuario_fkey;

alter table public.pending_login
  add constraint pending_login_id_usuario_fkey
  foreign key (id_usuario) references auth.users(id) on delete cascade;

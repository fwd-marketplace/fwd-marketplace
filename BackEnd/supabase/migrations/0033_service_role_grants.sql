-- 0033_service_role_grants.sql
-- Otorga permisos de tabla al rol service_role de Supabase.
-- La migracion 0009 concedia grants a anon/authenticated pero no a service_role.
-- Sin estos grants, el cliente admin (usado para crear notificaciones y otras
-- operaciones de sistema) recibe "permission denied" aunque bypasee RLS.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Para tablas y secuencias creadas en el futuro.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;

-- 0043_entregable_url_github.sql
-- Agrega url_github al entregable para separar el repositorio del link de previsualización.
-- url        = deploy en Netlify/Vercel (para el iframe)
-- url_github = repositorio en GitHub

alter table public.entregable
  add column if not exists url_github varchar(500);

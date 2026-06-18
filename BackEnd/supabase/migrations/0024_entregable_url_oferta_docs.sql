-- URL del entregable: enlace al artefacto (GitHub, Netlify, Drive, etc.)
ALTER TABLE public.entregable ADD COLUMN IF NOT EXISTS url varchar(500);

-- Comentario que la empresa deja al solicitar cambios en un entregable (RF-44)
ALTER TABLE public.entregable ADD COLUMN IF NOT EXISTS comentario_revision text;

-- Documentación técnica adicional enviada por el junior al postular (RF-30)
ALTER TABLE public.oferta ADD COLUMN IF NOT EXISTS documentacion_tecnica text;
ALTER TABLE public.oferta ADD COLUMN IF NOT EXISTS documentacion_url varchar(500);

-- Agrega el estado 'pausado' al catálogo de estados de proyecto.
-- Un proyecto pausado no aparece en el marketplace y su fecha_cierre
-- se limpia para congelar el plazo; la empresa puede retomarlo después.
INSERT INTO public.estado_proyecto (nombre, descripcion, orden, es_final) VALUES
  ('pausado', 'Proyecto pausado temporalmente por la empresa', 8, false)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.estado_proyecto (nombre, descripcion, orden, es_final) VALUES
  ('borrador', 'Proyecto creado pero no publicado', 1, false),
  ('en_recepcion', 'Abierto para recibir postulaciones', 2, false),
  ('en_evaluacion', 'Plazo vencido, empresa evalúa ofertas', 3, false),
  ('adjudicado', 'Empresa seleccionó un junior', 4, false),
  ('en_desarrollo', 'Junior trabajando en el proyecto', 5, false),
  ('cerrado', 'Proyecto finalizado y evaluado', 6, true),
  ('cancelado', 'Proyecto cancelado con motivo registrado', 7, true);

INSERT INTO public.estado_oferta (nombre, descripcion) VALUES
  ('enviada', 'Postulación enviada por el junior'),
  ('en_revision', 'Empresa está revisando la oferta'),
  ('adjudicada', 'Esta oferta fue seleccionada'),
  ('no_seleccionada', 'No fue elegida en este proyecto');

INSERT INTO public.estado_entregable (nombre, descripcion) VALUES
  ('enviado', 'Archivo subido por el junior'),
  ('aprobado', 'Empresa aprobó el entregable'),
  ('cambios_solicitados', 'Empresa solicitó ajustes');

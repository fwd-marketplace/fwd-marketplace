INSERT INTO public.roles (nombre, descripcion) VALUES
  ('admin', 'Administrador de la plataforma FWD'),
  ('student', 'Junior egresado de FWD Costa Rica'),
  ('company', 'Empresa o emprendedor que publica proyectos');

INSERT INTO public.roles_permisos (id_rol, vista, puede_acceder)
SELECT r.id, v.vista, true
FROM public.roles r,
(VALUES
  ('student', 'listado_proyectos'),
  ('student', 'detalle_proyecto'),
  ('student', 'perfil_estudiante'),
  ('student', 'editar_perfil'),
  ('student', 'mis_postulaciones'),
  ('company', 'listado_proyectos'),
  ('company', 'mis_proyectos'),
  ('company', 'publicar_proyecto'),
  ('company', 'ver_postulaciones'),
  ('company', 'mis_favoritos'),
  ('admin', 'dashboard_admin'),
  ('admin', 'panel_moderacion'),
  ('admin', 'gestionar_usuarios'),
  ('admin', 'gestionar_catalogos')
) AS v(rol_nombre, vista)
WHERE r.nombre = v.rol_nombre;

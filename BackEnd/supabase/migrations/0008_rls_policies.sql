-- Políticas RLS para las 24 tablas (ERD v4.13).
-- Reemplaza los archivos sueltos de policies/01..09 (que cubrían solo 9 tablas).
-- Regla: nunca habilitar RLS sin agregar políticas en la misma ejecución;
-- una tabla con RLS habilitado y sin políticas queda cerrada para todos.

-- ── 4.1 Catálogos: lectura pública para autenticados, escritura solo admin ──
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_oferta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_entregable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalogo_lectura" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.roles_permisos
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.area_negocio
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.skills
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.estado_proyecto
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.estado_oferta
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "catalogo_lectura" ON public.estado_entregable
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_catalogo" ON public.area_negocio FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  ));
CREATE POLICY "admin_catalogo" ON public.skills FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  ));

-- ── 4.2 Users ──
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_ver_propio" ON public.users FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "users_admin_ver_todos" ON public.users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  ));
CREATE POLICY "users_crear_propio" ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());
CREATE POLICY "users_editar_propio" ON public.users FOR UPDATE
  USING (id = auth.uid());

-- ── 4.3 Estudiante ──
ALTER TABLE public.estudiante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estudiante_ver_perfil" ON public.estudiante FOR SELECT
  USING (
    id_usuario = auth.uid()
    OR (
      estado_verificacion = 'verificado'
      AND EXISTS (
        SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
        WHERE u.id = auth.uid() AND r.nombre IN ('company','admin')
      )
    )
  );
CREATE POLICY "estudiante_crear_perfil" ON public.estudiante FOR INSERT
  WITH CHECK (id_usuario = auth.uid());
CREATE POLICY "estudiante_editar_perfil" ON public.estudiante FOR UPDATE
  USING (id_usuario = auth.uid());

-- ── 4.4 Empresario ──
ALTER TABLE public.empresario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresario_ver_perfil" ON public.empresario FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "empresario_crear_perfil" ON public.empresario FOR INSERT
  WITH CHECK (id_usuario = auth.uid());
CREATE POLICY "empresario_editar_perfil" ON public.empresario FOR UPDATE
  USING (id_usuario = auth.uid());

-- ── 4.5 Portafolio_proyecto ──
ALTER TABLE public.portafolio_proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portafolio_visible" ON public.portafolio_proyecto FOR SELECT
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
    OR visibilidad = 'publico'
    OR (
      visibilidad = 'solo_empresas'
      AND EXISTS (
        SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
        WHERE u.id = auth.uid() AND r.nombre IN ('company','admin')
      )
    )
  );
CREATE POLICY "portafolio_gestionar" ON public.portafolio_proyecto FOR ALL
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
  );

-- ── 4.6 Student_skills ──
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_ver" ON public.student_skills FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "skills_gestionar" ON public.student_skills FOR ALL
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
  );

-- ── 4.7 Proyecto ──
ALTER TABLE public.proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proyecto_ver_publicados" ON public.proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estado_proyecto ep
      WHERE ep.id = id_estado AND ep.nombre != 'borrador'
    )
    OR EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "proyecto_crear" ON public.proyecto FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "proyecto_editar" ON public.proyecto FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    )
  );

-- ── 4.8 Project_skills ──
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pskills_ver" ON public.project_skills FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "pskills_gestionar" ON public.project_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );

-- ── 4.9 Oferta ──
ALTER TABLE public.oferta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oferta_ver_propia" ON public.oferta FOR SELECT
  USING (id_usuario = auth.uid());
CREATE POLICY "oferta_ver_empresa" ON public.oferta FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "oferta_ver_admin" ON public.oferta FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  ));
CREATE POLICY "oferta_crear" ON public.oferta FOR INSERT
  WITH CHECK (id_usuario = auth.uid());
CREATE POLICY "oferta_calificar_empresa" ON public.oferta FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "oferta_replica_estudiante" ON public.oferta FOR UPDATE
  USING (id_usuario = auth.uid() AND replica_calificacion IS NULL);

-- ── 4.10 Entregable ──
ALTER TABLE public.entregable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entregable_ver_propio" ON public.entregable FOR SELECT
  USING (id_usuario = auth.uid());
CREATE POLICY "entregable_ver_empresa" ON public.entregable FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "entregable_subir" ON public.entregable FOR INSERT
  WITH CHECK (id_usuario = auth.uid());
CREATE POLICY "entregable_actualizar_estado" ON public.entregable FOR UPDATE
  USING (
    id_usuario = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );

-- ── 4.11 Evaluacion ──
ALTER TABLE public.evaluacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluacion_ver" ON public.evaluacion FOR SELECT
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'admin'
    )
  );
CREATE POLICY "evaluacion_crear_empresa" ON public.evaluacion FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
  );
CREATE POLICY "evaluacion_replica_estudiante" ON public.evaluacion FOR UPDATE
  USING (
    id_estudiante IN (
      SELECT id FROM public.estudiante WHERE id_usuario = auth.uid()
    )
    AND replica IS NULL
  );

-- ── 4.12 Files ──
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_avatar" ON public.files FOR SELECT
  USING (tipo = 'avatar' AND id_usuario = auth.uid());
CREATE POLICY "files_logo_publico" ON public.files FOR SELECT
  USING (tipo = 'logo' AND auth.uid() IS NOT NULL);
CREATE POLICY "files_prototipo" ON public.files FOR SELECT
  USING (
    tipo = 'prototipo' AND (
      EXISTS (
        SELECT 1 FROM public.oferta o
        WHERE o.id = id_oferta AND o.id_usuario = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.oferta o
        JOIN public.proyecto p ON o.id_proyecto = p.id
        JOIN public.empresario e ON p.id_empresario = e.id
        WHERE o.id = id_oferta AND e.id_usuario = auth.uid()
      )
    )
  );
CREATE POLICY "files_entregable" ON public.files FOR SELECT
  USING (
    tipo = 'entregable' AND (
      EXISTS (
        SELECT 1 FROM public.entregable en
        WHERE en.id = id_entregable AND en.id_usuario = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.entregable en
        JOIN public.proyecto p ON en.id_proyecto = p.id
        JOIN public.empresario e ON p.id_empresario = e.id
        WHERE en.id = id_entregable AND e.id_usuario = auth.uid()
      )
    )
  );
CREATE POLICY "files_insertar" ON public.files FOR INSERT
  WITH CHECK (
    (tipo = 'avatar' AND id_usuario = auth.uid())
    OR (tipo = 'logo' AND EXISTS (
      SELECT 1 FROM public.empresario e
      WHERE e.id = id_empresario AND e.id_usuario = auth.uid()
    ))
    OR (tipo IN ('prototipo','entregable','cv') AND (
      id_usuario = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.oferta o
        WHERE o.id = id_oferta AND o.id_usuario = auth.uid()
      )
    ))
  );

-- ── 4.13 Favorites ──
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_ver" ON public.favorites FOR SELECT
  USING (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
  );
CREATE POLICY "favorites_agregar" ON public.favorites FOR INSERT
  WITH CHECK (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
  );
CREATE POLICY "favorites_eliminar" ON public.favorites FOR DELETE
  USING (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
  );

-- ── 4.14 Mensaje ──
ALTER TABLE public.mensaje ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mensaje_publico" ON public.mensaje FOR SELECT
  USING (es_publico = true AND auth.uid() IS NOT NULL);
CREATE POLICY "mensaje_privado" ON public.mensaje FOR SELECT
  USING (
    es_publico = false AND (
      id_remitente = auth.uid() OR
      id_destinatario = auth.uid()
    )
  );
CREATE POLICY "mensaje_enviar" ON public.mensaje FOR INSERT
  WITH CHECK (id_remitente = auth.uid());

-- ── 4.15 Notificacion ──
ALTER TABLE public.notificacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_ver" ON public.notificacion FOR SELECT
  USING (id_usuario = auth.uid());
CREATE POLICY "notif_marcar_leida" ON public.notificacion FOR UPDATE
  USING (id_usuario = auth.uid());

-- ── 4.16 Historial_estado_proyecto ── (log inmutable: solo INSERT)
ALTER TABLE public.historial_estado_proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "historial_ver" ON public.historial_estado_proyecto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto p
      JOIN public.empresario e ON p.id_empresario = e.id
      WHERE p.id = id_proyecto AND e.id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.oferta o
      JOIN public.estado_oferta eo ON o.id_estado = eo.id
      WHERE o.id_proyecto = id_proyecto
        AND o.id_usuario = auth.uid()
        AND eo.nombre = 'adjudicada'
    )
    OR EXISTS (
      SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'admin'
    )
  );
CREATE POLICY "historial_insertar" ON public.historial_estado_proyecto FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

-- ── 4.17 Conversacion_IA ──
ALTER TABLE public.conversacion_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_ia_ver" ON public.conversacion_ia FOR SELECT
  USING (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'admin'
    )
  );
CREATE POLICY "conv_ia_crear" ON public.conversacion_ia FOR INSERT
  WITH CHECK (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
  );
CREATE POLICY "conv_ia_actualizar" ON public.conversacion_ia FOR UPDATE
  USING (
    id_empresario IN (
      SELECT id FROM public.empresario WHERE id_usuario = auth.uid()
    )
  );

-- ── 4.18 AI_logs ── (solo admins leen; el sistema inserta via service_role)
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_logs_admin" ON public.ai_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.id_rol = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  ));

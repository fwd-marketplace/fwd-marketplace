export type ApiRoleName = "student" | "company" | "admin";

export type AccountState = "activa" | "pendiente" | "suspendida" | "rechazada";

export type ProjectState =
  | "borrador"
  | "en_recepcion"
  | "en_evaluacion"
  | "adjudicado"
  | "en_desarrollo"
  | "cerrado"
  | "cancelado"
  | "pausado";

export type CompanyProjectState = Exclude<ProjectState, "borrador" | "cancelado">;

export type OfferState = "enviada" | "en_revision" | "solicitar_cambios" | "adjudicada" | "no_seleccionada";

export type CatalogArea = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};

export type CatalogSkill = {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string | null;
};

export type CatalogProjectState = {
  id: string;
  nombre: ProjectState;
  orden: number;
};

/** Sugerencias de conocimientos no técnicos (contabilidad, RRHH, etc.). */
export type CatalogKnowledge = {
  id: string;
  nombre: string;
  categoria: string | null;
};

export type CatalogsResponse = {
  areas: CatalogArea[];
  skills: CatalogSkill[];
  projectStates: CatalogProjectState[];
  conocimientos: CatalogKnowledge[];
};

/** Contenido del proyecto traducido al idioma opuesto al original (para "ver traducción"). */
export type ProjectTranslation = {
  titulo: string;
  descripcion: string;
  condiciones: string;
};

export type ApiProject = {
  id: string;
  titulo: string;
  descripcion: string;
  condiciones?: string;
  usa_ia: boolean;
  plazo_dias: number;
  /** Monto total declarado que la empresa pagará al junior por el proyecto (informativo). */
  compensacion: number | null;
  /** Moneda de la compensación. MVP: solo USD. */
  moneda: string;
  /** Última modificación de la compensación (transparencia para postulantes). */
  compensacion_actualizada_en: string | null;
  tecnologias_extra?: string[];
  /** Idioma en que la empresa escribió el proyecto. */
  idioma_original?: AiLocale;
  /** Traducción al idioma opuesto; null/ausente si no está disponible. */
  traduccion?: ProjectTranslation | null;
  fecha_publicacion: string | null;
  fecha_cierre: string | null;
  estado: { id?: string; nombre: ProjectState };
  area: { id: string; nombre: string } | null;
  empresa: { id?: string; nombre_comercial: string; tipo: "empresa" | "emprendedor" } | null;
  skills: Array<{ skill: CatalogSkill | null }>;
  n_ofertas?: number;
  /** Propuestas pendientes de decisión (enviada/en_revision): cola de revisión de la empresa. */
  n_por_revisar?: number;
};

export type ProjectsResponse = {
  projects: ApiProject[];
};

/**
 * Filtros server-side del listado de proyectos (los soporta el backend con índices en DB).
 * El marketplace hoy filtra en el cliente por UX instantánea; estos filtros están disponibles
 * para cuando el volumen justifique mover el filtrado al servidor.
 */
export type MarketplaceProjectFilters = {
  area?: string;
  skill?: string;
  plazoMax?: number;
  compensacionMin?: number;
  compensacionMax?: number;
  q?: string;
};

export type CreateProjectInput = {
  titulo: string;
  descripcion: string;
  condiciones?: string;
  id_area_negocio: string;
  plazo_dias: number;
  usa_ia: boolean;
  skills: string[];
  tecnologias_extra?: string[];
  /** Monto total en USD que la empresa pagará al junior. Obligatorio al publicar. */
  compensacion?: number;
  publicar: boolean;
};

// ── Asistente de IA para crear proyectos ──────────────────────────────────────

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Idioma en el que debe responder la IA (coincide con los locales de next-intl). */
export type AiLocale = "es" | "en";

export type ProposalSkill = {
  id: string;
  nombre: string;
};

/** Propuesta estructurada que devuelve el asistente, ya mapeada al formulario. */
export type ProjectProposal = {
  nombre: string;
  objetivo: string;
  funcionalidades: string[];
  publico_objetivo: string | null;
  /** Descripción rica (objetivo + funcionalidades + público), lista para el textarea. */
  descripcion: string;
  area_negocio: string | null;
  id_area_negocio: string | null;
  plazo_dias: number;
  habilidades: ProposalSkill[];
  usa_ia: boolean;
  estilos_diseno: string[];
  preguntas_pendientes: string[];
};

export type GenerateProposalResponse = {
  propuesta: ProjectProposal;
};

export type UpdateProjectInput = {
  titulo?: string;
  descripcion?: string;
  condiciones?: string;
  id_area_negocio?: string;
  plazo_dias?: number;
  usa_ia?: boolean;
  skills?: string[];
  tecnologias_extra?: string[];
  /** Monto total en USD que la empresa pagará al junior. */
  compensacion?: number;
};

export type SuggestStackInput = {
  titulo?: string;
  descripcion: string;
  id_area_negocio?: string;
};

export type StackSuggestion = {
  habilidades: ProposalSkill[];
  justificacion: string;
};

export type SuggestStackResponse = {
  sugerencia: StackSuggestion;
};

export type SuggestCompensacionInput = {
  titulo?: string;
  descripcion: string;
  id_area_negocio?: string;
  plazo_dias?: number;
  skills?: string[];
};

export type CompensacionSuggestion = {
  /** Monto total sugerido en USD, ya acotado al rango permitido. */
  compensacion: number;
  justificacion: string;
};

export type SuggestCompensacionResponse = {
  sugerencia: CompensacionSuggestion;
};

export type SuggestCotizacionInput = {
  descripcion: string;
};

/** Una funcionalidad sugerida por la IA para la calculadora de cotización. */
export type CotizacionFuncionalidadSuggestion = {
  nombre: string;
  cantidad: number;
  tamano: "muy_pequena" | "pequena" | "media" | "grande";
};

/**
 * Sugerencia de la IA para llenar el formulario de la calculadora de cotización (del junior).
 * Mapea 1:1 al estado de `PricingCalculator`. El monto NO viene aquí: lo calcula la lógica pura.
 */
export type CotizacionSuggestion = {
  modoAlcance: "horas" | "semanas";
  horasEstimadas: number;
  semanas: number;
  horasPorSemana: number;
  complejidad: "baja" | "media" | "alta";
  stack: string[];
  funcionalidades: CotizacionFuncionalidadSuggestion[];
  /** Tarifa por hora en USD, ya acotada al rango permitido. */
  tarifaHora: number;
  modalidad: "remoto" | "hibrido" | "presencial";
  aplicaIva: boolean;
  justificacion: string;
};

export type SuggestCotizacionResponse = {
  sugerencia: CotizacionSuggestion;
};

export type ProjectOffer = {
  id: string;
  propuesta: string;
  prototipo_url: string | null;
  url_repositorio?: string | null;
  documentacion_tecnica?: string | null;
  documentacion_url?: string | null;
  fecha_envio: string;
  comentario_revision?: string | null;
  calificacion?: number | null;
  comentario_calificacion?: string | null;
  estado: { nombre: OfferState };
  /** false si el postulante ya tiene un proyecto activo (ocupado). */
  disponible?: boolean;
  junior: {
    id: string;
    nombre: string;
    apellido1: string | null;
  };
};

export type ProjectOffersResponse = {
  ofertas: ProjectOffer[];
};

/** Candidato (estudiante verificado) rankeado por afinidad con un proyecto. */
export type MatchCandidate = {
  id: string;
  usuario: { id: string; nombre: string; apellido1: string | null } | null;
  especialidad: string | null;
  titulo_fwd: string | null;
  url_avatar: string | null;
  modalidad_preferida: string | null;
  reputacion: number | null;
  estado_verificacion: string;
  skills: string[];
  disponible: boolean;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  /** El estudiante ya postuló a este proyecto. */
  yaPostulo: boolean;
  /** La empresa ya invitó a este estudiante a este proyecto (persistido). */
  yaInvitado: boolean;
};

export type ProjectMatchesResponse = {
  /** false si el administrador desactivó el matching (enable_matching). */
  enabled: boolean;
  /** true solo si el proyecto sigue recibiendo propuestas (en_recepcion). */
  puedeInvitar: boolean;
  candidates: MatchCandidate[];
};

/** Contacto del junior de UNA oferta (GET /ofertas/:id). Solo lo ve el dueño del proyecto. */
export type OfertaContacto = {
  id: string;
  junior: {
    id: string;
    nombre: string;
    apellido1: string | null;
    correo: string | null;
  } | null;
};

export type OfertaContactoResponse = { oferta: OfertaContacto };

export type MyOffer = {
  id: string;
  propuesta: string;
  prototipo_url: string | null;
  url_repositorio?: string | null;
  documentacion_tecnica?: string | null;
  documentacion_url?: string | null;
  /** Contraoferta del junior: monto total en USD que propone cobrar. Informativo. */
  monto_propuesto?: number | null;
  moneda_propuesta?: string | null;
  fecha_envio: string;
  comentario_revision?: string | null;
  calificacion?: number | null;
  comentario_calificacion?: string | null;
  estado: { nombre: OfferState };
  proyecto: { id: string; titulo: string; fecha_cierre?: string | null } | null;
};

export type MyOffersResponse = {
  ofertas: MyOffer[];
};

export type SavedProjectsResponse = {
  proyectos: ApiProject[];
};

export type SavedProjectIdsResponse = {
  ids: string[];
};

export type ApiEstudianteDetail = {
  descripcion: string | null;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  reputacion: number | null;
  url_avatar: string | null;
  url_github: string | null;
  url_linkedin: string | null;
  url_portfolio: string | null;
  skills: string[];
  conocimientos: string[];
  /** false si el estudiante ya tiene un proyecto activo (no puede postular). */
  disponible?: boolean;
};

export type StudentSpecialty = "frontend" | "backend" | "fullstack" | "ia";
export type StudentAvailability = "immediate" | "two_weeks" | "one_month" | "unavailable";

export type StudentProfileUpdate = {
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  bio?: string;
  especializacion?: StudentSpecialty;
  titulo_fwd?: string;
  disponibilidad?: StudentAvailability;
  modalidad?: string[];
  skills?: string[];
  conocimientos?: string[];
  link_github?: string;
  link_linkedin?: string;
  link_portfolio?: string;
};

export type StudentPerfilResponse = {
  id: string;
  descripcion: string | null;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  url_avatar: string | null;
  url_github: string | null;
  url_linkedin: string | null;
  url_portfolio: string | null;
  skills?: string[];
  conocimientos?: string[];
};

export type ApiEmpresarioDetail = {
  tipo: 'empresa' | 'emprendedor';
  nombre_comercial: string | null;
  sector: string | null;
  descripcion: string | null;
  url_sitio_web: string | null;
  cedula_juridica: string | null;
  etapa: 'idea' | 'mvp' | 'validating' | 'scaling' | null;
  apoyo_tecnico_necesario: string | null;
  presupuesto: 'under_500' | 'range_500_1000' | 'range_1000_2500' | 'flexible' | null;
  tipos_proyecto: string | null;
  direccion: string | null;
  url_logo: string | null;
  mision: string | null;
  vision: string | null;
  cultura: string | null;
  valores: string | null;
  contactos: string | null;
  cantidad_empleados: string | null;
  modalidades: string | null;
  horario: string | null;
};

export type EmpresarioUpdateInput = {
  nombre_comercial?: string;
  sector?: string[];
  descripcion?: string;
  url_sitio_web?: string;
  direccion?: string;
  tipos_proyecto?: string[];
  soporte_tecnico?: string[];
  etapa?: 'idea' | 'mvp' | 'validating' | 'scaling';
  presupuesto?: 'under_500' | 'range_500_1000' | 'range_1000_2500' | 'flexible';
  mision?: string;
  vision?: string;
  cultura?: string;
  valores?: string[];
  contactos?: Array<{ name: string; role: string; email: string }>;
  cantidad_empleados?: string;
  modalidades?: string[];
  horario?: string;
};

export type ApiMeProfile = {
  id: string;
  nombre: string;
  apellido1: string | null;
  apellido2: string | null;
  cedula: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName };
  estudiante?: ApiEstudianteDetail | null;
  empresario?: ApiEmpresarioDetail | null;
};

export type MeResponse = {
  user: unknown;
  profile: ApiMeProfile | null;
};

export type PortafolioItem = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tecnologias: string | null;
  url_demo: string | null;
  url_repositorio: string | null;
  visibilidad: string;
  fecha: string | null;
};

// ── Perfiles públicos ─────────────────────────────────────────────────────────

export type PublicEmpresaProfile = {
  id: string;
  tipo: "empresa" | "emprendedor";
  nombre_comercial: string | null;
  descripcion: string | null;
  sector: string | null;
  url_sitio_web: string | null;
  etapa: "idea" | "mvp" | "validating" | "scaling" | null;
  tipos_proyecto: string | null;
  apoyo_tecnico_necesario: string | null;
  presupuesto: "under_500" | "range_500_1000" | "range_1000_2500" | "flexible" | null;
  mision: string | null;
  vision: string | null;
  cultura: string | null;
  valores: string | null;
  contactos: string | null;
  cantidad_empleados: string | null;
  modalidades: string | null;
  horario: string | null;
  direccion: string | null;
  url_logo: string | null;
};

/** Empresa/emprendedor en el directorio público, con sus proyectos publicados. */
export type EmpresaDirectorio = {
  id: string;
  nombre_comercial: string | null;
  tipo: "empresa" | "emprendedor";
  descripcion: string | null;
  url_logo: string | null;
  proyectos: { id: string; titulo: string }[];
};

export type PublicJuniorProfile = {
  id: string;
  nombre: string;
  apellido1: string | null;
  apellido2: string | null;
  descripcion: string | null;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  url_avatar: string | null;
  url_github: string | null;
  url_linkedin: string | null;
  url_portfolio: string | null;
  skills: string[];
  conocimientos: string[];
  portafolio: PortafolioItem[];
};

export type AdminPendingUser = {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName } | null;
  /** Avatar del estudiante o logo de la empresa; null para admins o sin foto. */
  url_foto: string | null;
  /** Para usuarios 'company': distingue empresa de emprendedor. */
  empresario?: { tipo: "empresa" | "emprendedor" } | null;
};

export type AdminPendingUsersResponse = {
  users: AdminPendingUser[];
};

export type AdminProject = {
  id: string;
  titulo: string;
  fecha_publicacion: string | null;
  estado: { nombre: ProjectState };
  empresa: { id?: string; url_logo: string | null; nombre_comercial: string; tipo: "empresa" | "emprendedor" } | null;
};

export type AdminProjectsResponse = {
  projects: AdminProject[];
};

export type AdminStudentProfile = {
  especialidad: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  reputacion: number | null;
  url_github: string | null;
  url_linkedin: string | null;
  url_portfolio: string | null;
};

export type AdminStudentUser = {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName } | null;
  estudiante: AdminStudentProfile[] | AdminStudentProfile | null;
};

export type StudentVerification = "pendiente" | "verificado" | "rechazado";

export type AdminStudent = {
  id: string;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  estado_verificacion: StudentVerification;
  reputacion: number | null;
  url_avatar: string | null;
  usuario: { id: string; nombre: string; apellido1: string | null; correo: string } | null;
  skills: string[];
};

export type AdminStudentsResponse = {
  students: AdminStudent[];
};

// ── Gestión de usuarios (admin) ──

export type AdminUser = {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName } | null;
  /** Avatar del estudiante o logo de la empresa; null para admins o sin foto. */
  url_foto: string | null;
};

export type AdminUsersResponse = {
  users: AdminUser[];
};

export type AdminUserMutationResponse = {
  user: AdminUser;
};

export type AdminUserStudentProfile = {
  descripcion: string | null;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  estado_verificacion: StudentVerification;
  reputacion: number | null;
  url_avatar: string | null;
  url_github: string | null;
  url_linkedin: string | null;
  url_portfolio: string | null;
  skills: string[];
};

export type AdminUserCompanyProfile = {
  tipo: "empresa" | "emprendedor";
  nombre_comercial: string | null;
  cedula_juridica: string | null;
  descripcion: string | null;
  sector: string | null;
  etapa: string | null;
  url_sitio_web: string | null;
  direccion: string | null;
  cantidad_empleados: string | null;
  modalidades: string | null;
  horario: string | null;
  presupuesto: string | null;
  tipos_proyecto: string | null;
  apoyo_tecnico_necesario: string | null;
  mision: string | null;
  vision: string | null;
  cultura: string | null;
  valores: string | null;
  contactos: string | null;
};

export type AdminUserDetail = {
  id: string;
  nombre: string;
  apellido1: string | null;
  apellido2: string | null;
  cedula: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName } | null;
  /** Avatar del estudiante o logo de la empresa; null para admins o sin foto. */
  url_foto: string | null;
  estudiante: AdminUserStudentProfile | null;
  empresario: AdminUserCompanyProfile | null;
};

export type AdminUserDetailResponse = {
  user: AdminUserDetail;
};

// ── Configuración global (admin) ──

export type AdminSettings = {
  allow_signups: boolean;
  allow_companies: boolean;
  allow_applications: boolean;
  enable_matching: boolean;
};

export type AdminSettingsResponse = {
  settings: AdminSettings;
};

export type UpdateAdminSettingsInput = Partial<AdminSettings>;

// ── Gestión de empresas (admin) ──

export type CompanyType = "empresa" | "emprendedor";

export type AdminCompany = {
  id: string;
  tipo: CompanyType;
  url_logo: string | null;
  nombre_comercial: string | null;
  sector: string | null;
  etapa: string | null;
  descripcion: string | null;
  direccion: string | null;
  url_sitio_web: string | null;
  cantidad_empleados: string | null;
  modalidades: string | null;
  presupuesto: string | null;
  usuario: {
    id: string;
    nombre: string;
    apellido1: string | null;
    correo: string;
    estado_cuenta: AccountState;
    fecha_registro: string;
  } | null;
};

export type AdminCompaniesResponse = {
  companies: AdminCompany[];
};

export type AdminCompanyMutationResponse = {
  company: AdminCompany;
};

export type CreateAdminCompanyInput = {
  correo: string;
  password: string;
  nombre: string;
  apellido1?: string;
  tipo: CompanyType;
  nombre_comercial: string;
  sector?: string;
};

export type UpdateAdminCompanyInput = {
  tipo?: CompanyType;
  nombre_comercial?: string;
  sector?: string;
  etapa?: string;
  descripcion?: string;
  direccion?: string;
  url_sitio_web?: string;
  cantidad_empleados?: string;
};

export type CreateAdminUserInput = {
  correo: string;
  password: string;
  nombre: string;
  apellido1?: string;
  rol: ApiRoleName;
};

export type UpdateAdminUserInput = {
  nombre?: string;
  apellido1?: string;
  apellido2?: string | null;
  correo?: string;
  rol?: ApiRoleName;
  estado_cuenta?: AccountState;
};

export type ProjectDetailResponse = {
  project: ApiProject;
};

export type SubmitOfferInput = {
  propuesta: string;
  prototipo_url?: string;
  url_repositorio?: string;
  documentacion_tecnica?: string;
  documentacion_url?: string;
  /** Contraoferta opcional del junior (monto entero USD, 50–10000). */
  monto_propuesto?: number | null;
};

export type ReviewOfferInput = {
  accion: "en_revision" | "solicitar_cambios" | "aceptar" | "rechazar";
  comentario?: string;
};

export type EditOfferInput = {
  propuesta?: string;
  prototipo_url?: string | null;
  url_repositorio?: string | null;
  documentacion_tecnica?: string | null;
  documentacion_url?: string | null;
  /** Contraoferta opcional del junior (monto entero USD, 50–10000). */
  monto_propuesto?: number | null;
};

// Estados reales en la BD (seed de estado_entregable): el junior envía ('enviado'),
// la empresa aprueba ('aprobado') o pide cambios ('cambios_solicitados').
export type EntregableState = "enviado" | "aprobado" | "cambios_solicitados";
export type EntregableTipo = "parcial" | "final";

export type Entregable = {
  id: string;
  id_proyecto?: string;
  group_id?: string;
  tipo: EntregableTipo;
  version: number;
  fecha: string;
  estado: { nombre: EntregableState };
  url: string | null;
  url_github: string | null;
  comentario_revision?: string | null;
  junior?: { id: string; nombre: string; apellido1: string | null } | null;
  proyecto?: { id: string; titulo: string } | null;
};

export type SubmitEntregableInput = {
  id_proyecto: string;
  url: string;
  url_github?: string;
  tipo: EntregableTipo;
};

export type EntregablesResponse = {
  entregables: Entregable[];
};

// ── Calificaciones ───────────────────────────────────────────────────────────

export type CalificarInput = {
  calificacion: number;
  comentario?: string;
};

export type ReplicaInput = {
  replica: string;
};

// ── Mensajería ────────────────────────────────────────────────────────────────

export type ApiMensajeUser = { id: string; nombre: string; apellido1: string | null };

export type ApiMensaje = {
  id: string;
  contenido: string;
  /** Idioma original del mensaje. */
  idioma_original?: AiLocale;
  /** Contenido traducido al idioma opuesto; null/ausente si no está disponible. */
  contenido_traducido?: string | null;
  fecha_envio: string;
  es_publico: boolean;
  /** true si el destinatario ya lo vio; sirve para marcar chats "sin ver" en gestión. */
  leida?: boolean;
  remitente: ApiMensajeUser | null;
  destinatario_info: ApiMensajeUser | null;
  id_destinatario: string | null;
};

export type MensajesResponse = {
  mensajes: ApiMensaje[];
};

export type ConversacionItem = {
  proyecto: { id: string; titulo: string };
  ultimo_mensaje: string;
  n_participantes: number;
  no_leidos: number;
};

export type ConversacionesResponse = {
  conversaciones: ConversacionItem[];
};

// ── Reportes de mensajes (moderación) ─────────────────────────────────────────

export type MotivoReporte =
  | "falta_respeto"
  | "spam"
  | "contenido_inapropiado"
  | "fuera_de_lugar"
  | "otro";

export type ReporteEstado = "pendiente" | "revisado" | "desestimado";

export type ReporteUserMini = {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
};

export type AdminReporte = {
  id: string;
  contenido_snapshot: string;
  motivo: MotivoReporte;
  detalle: string | null;
  estado: ReporteEstado;
  fecha: string;
  fecha_resolucion: string | null;
  id_mensaje: string;
  id_reportante: string;
  id_reportado: string | null;
  id_proyecto: string | null;
  reportante: ReporteUserMini | null;
  reportado: ReporteUserMini | null;
  proyecto: { id: string; titulo: string } | null;
};

export type AdminReportesResponse = {
  reportes: AdminReporte[];
};

// ── Ranking ───────────────────────────────────────────────────────────────────

export type ApiRankedJunior = {
  id: string;
  especialidad: string | null;
  disponibilidad: string | null;
  reputacion: number;
  usuario: { id: string; nombre: string; apellido1: string | null } | null;
  skills: string[];
};

export type RankingResponse = {
  juniors: ApiRankedJunior[];
};

export type ApiCalificacion = {
  id: string;
  calificacion: number;
  comentario_calificacion: string | null;
  replica_calificacion: string | null;
  updated_at: string;
  proyecto: {
    id: string;
    titulo: string;
    empresa: { nombre_comercial: string | null } | null;
  } | null;
};

export type CalificacionesResponse = {
  calificaciones: ApiCalificacion[];
};

// ── Notificaciones in-app ──────────────────────────────────────────────────────

export type ApiNotificacion = {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  id_referencia: string | null;
};

export type NotificacionesResponse = {
  notificaciones: ApiNotificacion[];
};

// ── Directorio de talento (búsqueda de estudiantes para empresa) ────────────────

export type TalentStudent = {
  id: string;
  especialidad: string | null;
  modalidad_preferida: string | null;
  disponibilidad: string | null;
  titulo_fwd: string | null;
  estado_verificacion: StudentVerification;
  reputacion: number | null;
  url_avatar: string | null;
  usuario: { id: string; nombre: string; apellido1: string | null } | null;
  skills: string[];
  /** false si el estudiante ya tiene un proyecto activo (ocupado). */
  disponible: boolean;
};

export type TalentSearchParams = {
  q?: string;
  especialidad?: StudentSpecialty;
  disponibilidad?: StudentAvailability;
  skill?: string;
  modalidad?: string;
  solo_disponibles?: boolean;
};

export type TalentSearchResponse = {
  students: TalentStudent[];
};



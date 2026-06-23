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
};

export type ProjectsResponse = {
  projects: ApiProject[];
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

export type MyOffer = {
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
};

export type EntregableState = "pendiente" | "enviado" | "en_revision" | "aprobado";
export type EntregableTipo = "parcial" | "final";

export type Entregable = {
  id: string;
  id_proyecto: string;
  tipo: EntregableTipo;
  version: number;
  fecha: string;
  estado: { nombre: EntregableState };
  url: string | null;
  junior?: { id: string; nombre: string; apellido1: string | null } | null;
  proyecto?: { id: string; titulo: string } | null;
};

export type SubmitEntregableInput = {
  id_proyecto: string;
  url: string;
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



export type ApiRoleName = "student" | "company" | "admin";

export type AccountState = "activa" | "pendiente" | "suspendida" | "rechazada";

export type ProjectState =
  | "borrador"
  | "en_recepcion"
  | "en_evaluacion"
  | "adjudicado"
  | "en_desarrollo"
  | "cerrado"
  | "cancelado";

export type CompanyProjectState = Exclude<ProjectState, "borrador" | "cancelado">;

export type OfferState = "enviada" | "en_revision" | "adjudicada" | "no_seleccionada";

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

export type ApiProject = {
  id: string;
  titulo: string;
  descripcion: string;
  usa_ia: boolean;
  plazo_dias: number;
  tecnologias_extra?: string[];
  fecha_publicacion: string | null;
  fecha_cierre: string | null;
  estado: { id?: string; nombre: ProjectState };
  area: { id: string; nombre: string } | null;
  empresa: { id?: string; nombre_comercial: string; tipo: "empresa" | "emprendedor" } | null;
  skills: Array<{ skill: CatalogSkill | null }>;
};

export type ProjectsResponse = {
  projects: ApiProject[];
};

export type CreateProjectInput = {
  titulo: string;
  descripcion: string;
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
  id_area_negocio?: string;
  plazo_dias?: number;
  usa_ia?: boolean;
  skills?: string[];
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
  estado: { nombre: OfferState };
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
  estado: { nombre: OfferState };
  proyecto: { id: string; titulo: string; fecha_cierre?: string | null } | null;
};

export type MyOffersResponse = {
  ofertas: MyOffer[];
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

export type AdminPendingUser = {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
  estado_cuenta: AccountState;
  fecha_registro: string;
  role: { nombre: ApiRoleName } | null;
};

export type AdminPendingUsersResponse = {
  users: AdminPendingUser[];
};

export type AdminProject = {
  id: string;
  titulo: string;
  fecha_publicacion: string | null;
  estado: { nombre: ProjectState };
  empresa: { nombre_comercial: string; tipo: "empresa" | "emprendedor" } | null;
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

export type ApiMensaje = {
  id: string;
  contenido: string;
  fecha_envio: string;
  es_publico: boolean;
  remitente: { id: string; nombre: string; apellido1: string | null } | null;
  id_destinatario: string | null;
};

export type MensajesResponse = {
  mensajes: ApiMensaje[];
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


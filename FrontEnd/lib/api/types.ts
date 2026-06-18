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

export type CatalogsResponse = {
  areas: CatalogArea[];
  skills: CatalogSkill[];
  projectStates: CatalogProjectState[];
};

export type ApiProject = {
  id: string;
  titulo: string;
  descripcion: string;
  usa_ia: boolean;
  plazo_dias: number;
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
  publicar: boolean;
};

export type ProjectOffer = {
  id: string;
  propuesta: string;
  prototipo_url: string | null;
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
  fecha_envio: string;
  estado: { nombre: OfferState };
  proyecto: { id: string; titulo: string } | null;
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

export type ProjectDetailResponse = {
  project: ApiProject;
};

export type SubmitOfferInput = {
  propuesta: string;
  prototipo_url?: string;
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

import type { ApiProject, CatalogArea, CatalogSkill, MockThread, MyOffer } from "@/lib/api/types";

// ─── Mock Catalogs ────────────────────────────────────────────────────────────

export const MOCK_AREAS: CatalogArea[] = [
  { id: "area-1", nombre: "Tecnología e Innovación" },
  { id: "area-2", nombre: "Marketing Digital" },
  { id: "area-3", nombre: "Finanzas y Contabilidad" },
  { id: "area-4", nombre: "Logística y Operaciones" },
  { id: "area-5", nombre: "Recursos Humanos" },
  { id: "area-6", nombre: "Atención al Cliente" },
  { id: "area-7", nombre: "Ventas y Comercial" },
  { id: "area-8", nombre: "Análisis de Datos" },
];

export const MOCK_SKILLS: CatalogSkill[] = [
  { id: "sk-1",  nombre: "React",          tipo: "tecnologia", categoria: "Frontend" },
  { id: "sk-2",  nombre: "TypeScript",     tipo: "tecnologia", categoria: "Frontend" },
  { id: "sk-3",  nombre: "Tailwind CSS",   tipo: "tecnologia", categoria: "Frontend" },
  { id: "sk-4",  nombre: "Node.js",        tipo: "tecnologia", categoria: "Backend" },
  { id: "sk-5",  nombre: "Python",         tipo: "tecnologia", categoria: "Backend" },
  { id: "sk-6",  nombre: "PostgreSQL",     tipo: "tecnologia", categoria: "Base de datos" },
  { id: "sk-7",  nombre: "Figma",          tipo: "tecnologia", categoria: "Diseño" },
  { id: "sk-8",  nombre: "Next.js",        tipo: "tecnologia", categoria: "Frontend" },
  { id: "sk-9",  nombre: "AWS",            tipo: "tecnologia", categoria: "Infraestructura" },
  { id: "sk-10", nombre: "Docker",         tipo: "tecnologia", categoria: "DevOps" },
  { id: "sk-11", nombre: "UX Research",    tipo: "habilidad",  categoria: "Diseño" },
  { id: "sk-12", nombre: "Power BI",       tipo: "tecnologia", categoria: "Datos" },
  { id: "sk-13", nombre: "Vue.js",         tipo: "tecnologia", categoria: "Frontend" },
  { id: "sk-14", nombre: "REST APIs",      tipo: "habilidad",  categoria: "Backend" },
  { id: "sk-15", nombre: "Git / GitHub",   tipo: "habilidad",  categoria: "General" },
];

// ─── Mock Projects — empresa dashboard ───────────────────────────────────────

export const MOCK_PROJECTS: ApiProject[] = [
  {
    id: "proj-1",
    titulo: "Dashboard de análisis de ventas en tiempo real",
    descripcion:
      "Necesitamos un dashboard interactivo que conecte con nuestra API de ventas y muestre métricas clave en tiempo real: ingresos diarios, productos más vendidos, conversión por canal y alertas automáticas cuando una métrica cae por debajo del umbral. El equipo de ventas lo usará a diario sin conocimientos técnicos.",
    usa_ia: true,
    plazo_dias: 12,
    fecha_publicacion: "2026-05-28T08:00:00Z",
    fecha_cierre: "2026-06-09T08:00:00Z",
    estado: { nombre: "en_recepcion" },
    area: { id: "area-8", nombre: "Análisis de Datos" },
    empresa: { nombre_comercial: "Global Tech Solutions S.A.", tipo: "empresa" },
    skills: [
      { skill: { id: "sk-1",  nombre: "React",      tipo: "tecnologia", categoria: "Frontend" } },
      { skill: { id: "sk-12", nombre: "Power BI",   tipo: "tecnologia", categoria: "Datos" } },
      { skill: { id: "sk-14", nombre: "REST APIs",  tipo: "habilidad",  categoria: "Backend" } },
      { skill: { id: "sk-2",  nombre: "TypeScript", tipo: "tecnologia", categoria: "Frontend" } },
    ],
  },
  {
    id: "proj-2",
    titulo: "Rediseño de experiencia de compra en e-commerce",
    descripcion:
      "Nuestra tienda online tiene una tasa de abandono del carrito del 72%. Queremos rediseñar el flujo completo de compra: home, listado de productos, ficha de producto, carrito y checkout. Se busca una experiencia moderna, rápida y accesible que incremente la conversión al menos un 20%.",
    usa_ia: false,
    plazo_dias: 15,
    fecha_publicacion: "2026-06-02T10:00:00Z",
    fecha_cierre: "2026-06-17T10:00:00Z",
    estado: { nombre: "en_evaluacion" },
    area: { id: "area-2", nombre: "Marketing Digital" },
    empresa: { nombre_comercial: "Global Tech Solutions S.A.", tipo: "empresa" },
    skills: [
      { skill: { id: "sk-7",  nombre: "Figma",        tipo: "tecnologia", categoria: "Diseño" } },
      { skill: { id: "sk-11", nombre: "UX Research",  tipo: "habilidad",  categoria: "Diseño" } },
      { skill: { id: "sk-1",  nombre: "React",        tipo: "tecnologia", categoria: "Frontend" } },
      { skill: { id: "sk-3",  nombre: "Tailwind CSS", tipo: "tecnologia", categoria: "Frontend" } },
    ],
  },
  {
    id: "proj-3",
    titulo: "API de integración con sistema ERP SAP",
    descripcion:
      "Requerimos una API REST que actúe como middleware entre nuestro ERP SAP y las aplicaciones internas de la empresa. Debe manejar sincronización bidireccional de inventario, órdenes de compra y facturas. La integración debe ser robusta, con manejo de errores y reintentos automáticos.",
    usa_ia: false,
    plazo_dias: 10,
    fecha_publicacion: "2026-06-10T09:00:00Z",
    fecha_cierre: "2026-06-20T09:00:00Z",
    estado: { nombre: "adjudicado" },
    area: { id: "area-4", nombre: "Logística y Operaciones" },
    empresa: { nombre_comercial: "Global Tech Solutions S.A.", tipo: "empresa" },
    skills: [
      { skill: { id: "sk-4",  nombre: "Node.js",    tipo: "tecnologia", categoria: "Backend" } },
      { skill: { id: "sk-6",  nombre: "PostgreSQL", tipo: "tecnologia", categoria: "Base de datos" } },
      { skill: { id: "sk-14", nombre: "REST APIs",  tipo: "habilidad",  categoria: "Backend" } },
      { skill: { id: "sk-15", nombre: "Git / GitHub", tipo: "habilidad", categoria: "General" } },
    ],
  },
  {
    id: "proj-4",
    titulo: "App de gestión de turnos para clínica veterinaria",
    descripcion:
      "Necesitamos una aplicación web para que nuestros clientes puedan agendar citas con los veterinarios, ver el historial médico de sus mascotas, recibir recordatorios por correo y calificar el servicio. El personal de la clínica debe poder gestionar la agenda desde un panel de administración.",
    usa_ia: true,
    plazo_dias: 14,
    fecha_publicacion: null,
    fecha_cierre: null,
    estado: { nombre: "borrador" },
    area: { id: "area-1", nombre: "Tecnología e Innovación" },
    empresa: { nombre_comercial: "Global Tech Solutions S.A.", tipo: "empresa" },
    skills: [
      { skill: { id: "sk-8",  nombre: "Next.js",      tipo: "tecnologia", categoria: "Frontend" } },
      { skill: { id: "sk-4",  nombre: "Node.js",      tipo: "tecnologia", categoria: "Backend" } },
      { skill: { id: "sk-6",  nombre: "PostgreSQL",   tipo: "tecnologia", categoria: "Base de datos" } },
      { skill: { id: "sk-2",  nombre: "TypeScript",   tipo: "tecnologia", categoria: "Frontend" } },
    ],
  },
];

// ─── Mock Projects — marketplace público (IDs mock-1..6) ─────────────────────
// Fallback cuando el backend no está disponible.

export const MOCK_MARKETPLACE_PROJECTS: ApiProject[] = [
  {
    id: 'mock-1',
    titulo: 'Sistema de Gestión de Créditos',
    descripcion: 'Rediseño integral de la plataforma B2B para optimizar flujos de aprobación y visualización de KPIs financieros en tiempo real.',
    usa_ia: true,
    plazo_dias: 15,
    fecha_publicacion: '2026-06-10T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-1', nombre: 'Fintech' },
    empresa: { nombre_comercial: 'BancaCR Digital', tipo: 'empresa' },
    skills: [
      { skill: { id: 'sk-1', nombre: 'React', tipo: 'tecnologia', categoria: 'Frontend' } },
      { skill: { id: 'sk-5', nombre: 'Python', tipo: 'tecnologia', categoria: 'Backend' } },
      { skill: { id: 'sk-6', nombre: 'PostgreSQL', tipo: 'tecnologia', categoria: 'Base de datos' } },
    ],
  },
  {
    id: 'mock-2',
    titulo: 'Plataforma de Telemedicina',
    descripcion: 'Módulo de citas virtuales con videollamada integrada, historial clínico y recordatorios automáticos para pacientes y médicos.',
    usa_ia: false,
    plazo_dias: 12,
    fecha_publicacion: '2026-06-08T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-2', nombre: 'Salud' },
    empresa: { nombre_comercial: 'MediConnect CR', tipo: 'empresa' },
    skills: [
      { skill: { id: 'sk-4', nombre: 'Node.js', tipo: 'tecnologia', categoria: 'Backend' } },
      { skill: { id: 'sk-2', nombre: 'TypeScript', tipo: 'tecnologia', categoria: 'Frontend' } },
    ],
  },
  {
    id: 'mock-3',
    titulo: 'App de Seguimiento de Pedidos',
    descripcion: 'Aplicación móvil para que clientes rastreen sus pedidos en tiempo real con notificaciones push y mapa de ruta del repartidor.',
    usa_ia: false,
    plazo_dias: 10,
    fecha_publicacion: '2026-06-05T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-3', nombre: 'E-Commerce' },
    empresa: { nombre_comercial: 'ShopRápido', tipo: 'emprendedor' },
    skills: [
      { skill: { id: 'sk-13', nombre: 'Vue.js', tipo: 'tecnologia', categoria: 'Frontend' } },
      { skill: { id: 'sk-4', nombre: 'Node.js', tipo: 'tecnologia', categoria: 'Backend' } },
    ],
  },
  {
    id: 'mock-4',
    titulo: 'Dashboard de Métricas de Distribución',
    descripcion: 'Panel interactivo para supervisores de flota con métricas de entregas, rutas óptimas y alertas de desviación en tiempo real.',
    usa_ia: true,
    plazo_dias: 14,
    fecha_publicacion: '2026-06-03T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-4', nombre: 'Logística' },
    empresa: { nombre_comercial: 'FleetOps Latam', tipo: 'empresa' },
    skills: [
      { skill: { id: 'sk-1', nombre: 'React', tipo: 'tecnologia', categoria: 'Frontend' } },
      { skill: { id: 'sk-2', nombre: 'TypeScript', tipo: 'tecnologia', categoria: 'Frontend' } },
      { skill: { id: 'sk-5', nombre: 'Python', tipo: 'tecnologia', categoria: 'Backend' } },
    ],
  },
  {
    id: 'mock-5',
    titulo: 'Plataforma de Cursos en Vivo',
    descripcion: 'Aulas virtuales con video en tiempo real, pizarra colaborativa y seguimiento de progreso por estudiante y módulo.',
    usa_ia: false,
    plazo_dias: 15,
    fecha_publicacion: '2026-06-01T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-5', nombre: 'Edutech' },
    empresa: { nombre_comercial: 'AprenderCR', tipo: 'emprendedor' },
    skills: [
      { skill: { id: 'sk-1', nombre: 'React', tipo: 'tecnologia', categoria: 'Frontend' } },
      { skill: { id: 'sk-4', nombre: 'Node.js', tipo: 'tecnologia', categoria: 'Backend' } },
    ],
  },
  {
    id: 'mock-6',
    titulo: 'Automatización de Reportes de Campaña',
    descripcion: 'Herramienta que conecta con Google Ads y Meta Ads para generar reportes automáticos con visualizaciones y exportación a PDF.',
    usa_ia: true,
    plazo_dias: 8,
    fecha_publicacion: '2026-05-28T00:00:00Z',
    fecha_cierre: null,
    estado: { nombre: 'en_recepcion' },
    area: { id: 'mock-area-6', nombre: 'Marketing' },
    empresa: { nombre_comercial: 'GrowthLab CR', tipo: 'empresa' },
    skills: [
      { skill: { id: 'sk-5', nombre: 'Python', tipo: 'tecnologia', categoria: 'Backend' } },
      { skill: { id: 'sk-2', nombre: 'TypeScript', tipo: 'tecnologia', categoria: 'Frontend' } },
    ],
  },
];

export const MOCK_MARKETPLACE_BY_ID = new Map(
  MOCK_MARKETPLACE_PROJECTS.map((p) => [p.id, p]),
);

// ─── Mock Offers — mis-postulaciones (fallback cuando el backend no responde) ──

export const MOCK_OFFERS: MyOffer[] = [
  {
    id: "offer-1",
    propuesta:
      "Tengo experiencia sólida en React y TypeScript. He desarrollado dashboards financieros con integración de APIs REST y visualizaciones dinámicas con Recharts. Mi propuesta es implementar el módulo por fases semanales, comenzando por los KPIs críticos, con entregas parciales para mantener visibilidad del avance.",
    prototipo_url: null,
    fecha_envio: "2026-06-12T10:00:00Z",
    estado: { nombre: "en_revision" },
    proyecto: { id: "mock-1", titulo: "Sistema de Gestión de Créditos" },
  },
  {
    id: "offer-2",
    propuesta:
      "Soy desarrolladora full-stack con experiencia en proyectos de salud digital. He trabajado en módulos de agendamiento similares y conozco los estándares de privacidad de datos médicos. Adjunto prototipo de la interfaz de citas.",
    prototipo_url: "https://www.figma.com/file/example-telemedicina",
    fecha_envio: "2026-06-10T14:30:00Z",
    estado: { nombre: "adjudicada" },
    proyecto: { id: "mock-2", titulo: "Plataforma de Telemedicina", fecha_cierre: null },
  },
  {
    id: "offer-3",
    propuesta:
      "Me especializo en dashboards con React y D3.js. Propongo un panel interactivo con WebSockets para actualizaciones en tiempo real, exportación a PDF y diseño adaptable para supervisores de flota en campo.",
    prototipo_url: null,
    fecha_envio: "2026-06-08T09:15:00Z",
    estado: { nombre: "enviada" },
    proyecto: {
      id: "mock-4",
      titulo: "Dashboard de Métricas de Distribución",
      fecha_cierre: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
    },
  },
];

// ─── Mock Threads de Mensajería (RF-45) ──────────────────────────────────────

export const MOCK_THREADS: MockThread[] = [
  {
    projectId: "proj-1",
    projectTitle: "Dashboard de análisis de ventas en tiempo real",
    companyName: "Global Tech Solutions S.A.",
    unreadCount: 2,
    messages: [
      {
        id: "msg-1-1",
        author: "empresa",
        text: "Hola, vimos tu propuesta y nos parece muy completa. ¿Podés contarnos un poco más sobre tu experiencia con Power BI?",
        timestamp: "2026-06-10T10:00:00Z",
      },
      {
        id: "msg-1-2",
        author: "junior",
        text: "Con gusto. Trabajé con Power BI en dos proyectos universitarios donde construí dashboards de seguimiento de inventario y KPIs de ventas. Puedo compartirte los links si te interesa.",
        timestamp: "2026-06-10T10:45:00Z",
      },
      {
        id: "msg-1-3",
        author: "empresa",
        text: "Perfecto, sí compartílos. También queríamos confirmar tu disponibilidad para empezar la próxima semana.",
        timestamp: "2026-06-10T11:20:00Z",
      },
      {
        id: "msg-1-4",
        author: "empresa",
        text: "Ah, y una pregunta más: ¿tenés experiencia con APIs REST para consumir datos en tiempo real?",
        timestamp: "2026-06-11T09:00:00Z",
      },
    ],
  },
  {
    projectId: "proj-3",
    projectTitle: "App móvil de gestión de inventario",
    companyName: "LogiTech CR",
    unreadCount: 0,
    messages: [
      {
        id: "msg-3-1",
        author: "empresa",
        text: "Buen día. Te confirmamos que tu postulación fue adjudicada. Vamos a estar coordinando los primeros pasos del proyecto por aquí.",
        timestamp: "2026-06-08T08:30:00Z",
      },
      {
        id: "msg-3-2",
        author: "junior",
        text: "Muchas gracias por la confianza. Estoy listo para empezar. ¿Cuál es el primer entregable que necesitan?",
        timestamp: "2026-06-08T09:10:00Z",
      },
      {
        id: "msg-3-3",
        author: "empresa",
        text: "Para empezar necesitamos un wireframe de las pantallas principales: login, listado de inventario y detalle de producto. Plazo: 3 días.",
        timestamp: "2026-06-08T14:00:00Z",
      },
      {
        id: "msg-3-4",
        author: "junior",
        text: "Entendido. Estaré entregando el wireframe el jueves a más tardar.",
        timestamp: "2026-06-08T14:30:00Z",
      },
      {
        id: "msg-3-5",
        author: "empresa",
        text: "El wireframe que entregaste se ve muy bien. Tenemos algunos comentarios menores. Los coordino por acá mañana.",
        timestamp: "2026-06-11T17:00:00Z",
      },
    ],
  },
];

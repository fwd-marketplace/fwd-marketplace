import type { ApiProject, CatalogArea, CatalogSkill } from "@/lib/api/types";

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

// ─── Mock Projects ────────────────────────────────────────────────────────────

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

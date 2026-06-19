import type { Entregable, ProjectOffer } from "@/lib/api/types";

// ─── Propuestas del proyecto mock-1 (Sistema de Gestión de Créditos) ─────────

export const MOCK_PROJECT_OFFERS: ProjectOffer[] = [
  {
    id: "po-adjudicada",
    propuesta:
      "Tengo 2 años de experiencia en React y TypeScript, y he construido dashboards financieros con integración de APIs REST y visualizaciones dinámicas. Mi propuesta es entregar el módulo en dos fases: primero los KPIs críticos con filtros básicos, luego las alertas automáticas y el panel de roles. Trabajo con metodología ágil y entrego actualizaciones cada 3 días.",
    prototipo_url: "https://www.figma.com/file/creditos-v2-prototipo",
    fecha_envio: "2026-06-12T10:00:00Z",
    estado: { nombre: "adjudicada" },
    junior: { id: "j-diego", nombre: "Diego", apellido1: "Ramírez" },
  },
  {
    id: "po-en-revision",
    propuesta:
      "Soy desarrolladora full-stack con experiencia en proyectos fintech. He trabajado en módulos de aprobación de créditos para una cooperativa y entiendo los flujos de autorización en cascada. Propongo un diseño modular que facilite la incorporación futura de reglas de negocio dinámicas sin tocar el núcleo de la aplicación.",
    prototipo_url: null,
    fecha_envio: "2026-06-13T14:30:00Z",
    estado: { nombre: "en_revision" },
    junior: { id: "j-ana", nombre: "Ana", apellido1: "López" },
  },
  {
    id: "po-enviada",
    propuesta:
      "Mi stack principal es Python para el backend de análisis y React para el dashboard. He construido dashboards similares con Recharts y tengo experiencia conectando APIs de instituciones financieras. Adjunto un portafolio con tres proyectos de data visualization similares al solicitado.",
    prototipo_url: "https://github.com/carlosm/porfolio-dashboards",
    fecha_envio: "2026-06-15T09:00:00Z",
    estado: { nombre: "enviada" },
    junior: { id: "j-carlos", nombre: "Carlos", apellido1: "Martínez" },
  },
  {
    id: "po-no-seleccionada",
    propuesta:
      "Desarrollador con 6 meses de experiencia en React y PostgreSQL. Puedo completar el dashboard básico dentro del plazo indicado. Mi propuesta incluye gráficos con Chart.js y una API REST con Express para alimentar los datos en tiempo real.",
    prototipo_url: null,
    fecha_envio: "2026-06-11T11:00:00Z",
    estado: { nombre: "no_seleccionada" },
    junior: { id: "j-sofia", nombre: "Sofia", apellido1: "Vargas" },
  },
];

// ─── Entregables del junior adjudicado (Diego R.) ─────────────────────────────

export const MOCK_PROCESO_ENTREGABLES: Entregable[] = [
  {
    id: "ent-1",
    id_proyecto: "mock-1",
    tipo: "parcial",
    version: 1,
    fecha: "2026-06-15T10:00:00Z",
    estado: { nombre: "aprobado" },
    url: "https://github.com/diegoramirez/creditos-v1",
  },
  {
    id: "ent-2",
    id_proyecto: "mock-1",
    tipo: "final",
    version: 2,
    fecha: "2026-06-17T15:30:00Z",
    estado: { nombre: "en_revision" },
    url: "https://github.com/diegoramirez/creditos-v2",
  },
];

// ─── Chat de revisiones entre empresa y junior adjudicado ─────────────────────

export interface RevisionMessage {
  id: string;
  from: "empresa" | "junior";
  text: string;
  fecha: string;
}

export const MOCK_REVISION_MESSAGES: RevisionMessage[] = [
  {
    id: "rc-1",
    from: "empresa",
    text: "La estructura del dashboard se ve sólida. Necesito que los colores del módulo de KPIs coincidan con nuestro branding corporativo: el azul principal es #1A73E8.",
    fecha: "2026-06-15T11:00:00Z",
  },
  {
    id: "rc-2",
    from: "junior",
    text: "Perfecto, tomo nota. En la v2 actualizo los tokens de color y también ajusto el contraste del texto para que pase accesibilidad WCAG AA.",
    fecha: "2026-06-15T12:30:00Z",
  },
  {
    id: "rc-3",
    from: "empresa",
    text: "La v2 ya luce mucho mejor. Estoy revisando el módulo de alertas, vuelvo con feedback esta tarde.",
    fecha: "2026-06-17T16:00:00Z",
  },
];

import type { Star } from "./types";

export const STARS: Star[] = [
  // ── Fundamentos ──────────────────────────────────────────────────────────
  {
    id: "htmlcss", label: "HTML & CSS", area: "fundamentos",
    x: 180, y: 900, state: "done", mastery: 3,
    whatItIs: "La estructura y el estilo de toda interfaz. La base sobre la que se construye lo demás.",
    unlockedDate: "14 mar", via: "Reto: Maquetá una landing",
  },
  {
    id: "git", label: "Git", area: "fundamentos",
    x: 330, y: 770, state: "done", mastery: 2,
    whatItIs: "Control de versiones. Guardás tu trabajo, colaborás sin pisarte y volvés atrás cuando hace falta.",
    unlockedDate: "20 mar", via: "Reto: Tu primer pull request",
  },
  {
    id: "terminal", label: "Terminal", area: "fundamentos",
    x: 250, y: 610, state: "done", mastery: 2,
    whatItIs: "Hablarle directo a la máquina. Más rápido que el mouse una vez le agarrás la mano.",
    unlockedDate: "22 mar", via: "Reto: 10 comandos esenciales",
  },
  {
    id: "javascript", label: "JavaScript", area: "fundamentos",
    x: 450, y: 660, state: "done", mastery: 3,
    whatItIs: "El lenguaje de la web. Le da vida e interacción a todo lo que construís en el navegador.",
    unlockedDate: "2 abr", via: "Proyecto: Quiz interactivo",
  },

  // ── Frontend ──────────────────────────────────────────────────────────────
  {
    id: "react", label: "React", area: "frontend",
    x: 650, y: 500, state: "done", mastery: 2,
    whatItIs: "La librería para armar interfaces por componentes. El corazón del frontend en FWD.",
    unlockedDate: "28 abr", via: "Proyecto: Dashboard de tareas",
  },
  {
    id: "typescript", label: "TypeScript", area: "frontend",
    x: 560, y: 330, state: "done", mastery: 1,
    whatItIs: "JavaScript con tipos. Atrapás errores antes de que lleguen al usuario.",
    unlockedDate: "10 may", via: "Reto: Tipá una API",
  },
  {
    id: "nextjs", label: "Next.js", area: "frontend",
    x: 790, y: 310, state: "available", mastery: 0,
    whatItIs: "El framework de React que usa FWD Talent. Rutas, render en servidor y deploy sin dolor.",
    howToUnlock: "Completá el proyecto \"Página de empresa\" para encender esta estrella.",
    via: "Proyecto: Página de empresa",
  },
  {
    id: "tailwind", label: "Tailwind", area: "frontend",
    x: 850, y: 490, state: "locked", mastery: 0,
    whatItIs: "Estilos por utilidades. Diseñás rápido sin salir del HTML.",
    howToUnlock: "Encendé Next.js primero para abrir este tramo de la constelación.",
    via: "Reto: Recreá un componente del sistema FWD",
  },

  // ── Backend ───────────────────────────────────────────────────────────────
  {
    id: "nodejs", label: "Node.js", area: "backend",
    x: 1010, y: 580, state: "locked", mastery: 0,
    whatItIs: "JavaScript del lado del servidor. La puerta de entrada al backend.",
    howToUnlock: "Avanzá en Frontend hasta encender Tailwind para abrir el camino al backend.",
    via: "Reto: Tu primera API",
  },
  {
    id: "apis", label: "APIs REST", area: "backend",
    x: 1190, y: 480, state: "locked", mastery: 0,
    whatItIs: "El idioma con el que el frontend y el backend se hablan.",
    howToUnlock: "Encendé Node.js para seguir el camino del backend.",
    via: "Proyecto: API de proyectos",
  },
  {
    id: "supabase", label: "Supabase", area: "backend",
    x: 1120, y: 700, state: "locked", mastery: 0,
    whatItIs: "La base de datos y auth que usa FWD Talent. Postgres con superpoderes.",
    howToUnlock: "Encendé Node.js y APIs REST para llegar acá.",
    via: "Proyecto: Login con Supabase",
  },
  {
    id: "postgres", label: "PostgreSQL", area: "backend",
    x: 1300, y: 670, state: "locked", mastery: 0,
    whatItIs: "La base de datos relacional. Donde vive y se ordena la información.",
    howToUnlock: "Llegá hasta Supabase para abrir esta estrella.",
    via: "Reto: Modelá un esquema",
  },

  // ── Datos & IA ────────────────────────────────────────────────────────────
  {
    id: "sql", label: "SQL", area: "datos",
    x: 1030, y: 210, state: "locked", mastery: 0,
    whatItIs: "El lenguaje para preguntarle cosas a los datos.",
    howToUnlock: "Conectá con el backend a través de APIs REST para abrir Datos & IA.",
    via: "Reto: Consultas que cuentan historias",
  },
  {
    id: "python", label: "Python", area: "datos",
    x: 1210, y: 150, state: "locked", mastery: 0,
    whatItIs: "El lenguaje favorito de datos e IA. Legible, potente, en todos lados.",
    howToUnlock: "Encendé SQL para seguir esta constelación.",
    via: "Proyecto: Analizá un dataset",
  },
  {
    id: "claude", label: "Claude API", area: "datos",
    x: 1370, y: 250, state: "locked", mastery: 0,
    whatItIs: "Integrar IA generativa en tus productos, como hace FWD Talent.",
    howToUnlock: "Encendé Python para acercarte a esta estrella.",
    via: "Proyecto: Asistente con IA",
  },
  {
    id: "prompting", label: "Prompting", area: "datos",
    x: 1270, y: 390, state: "locked", mastery: 0,
    whatItIs: "El arte de pedirle bien a la IA. La habilidad que multiplica a todas las demás.",
    howToUnlock: "Encendé Claude API para completar la frontera.",
    via: "Reto: Diseñá un prompt de producción",
  },
];

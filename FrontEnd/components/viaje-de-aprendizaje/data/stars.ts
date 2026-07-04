import type { Star } from "./types";

export const STARS: Star[] = [
  // ── Fundamentos — arriba izquierda ───────────────────────────────────────
  // Flujo: terminal(izq) → git(arriba) → htmlcss(der) → javascript(abajo-der, salida DUAL)
  {
    id: "terminal", label: "Terminal", area: "fundamentos",
    x: 150, y: 310, state: "available", mastery: 0,
    whatItIs: "Hablarle directo a la máquina. Más rápido que el mouse una vez le agarrás la mano.",
    howToUnlock: "El punto de partida. Dominá los 10 comandos esenciales para encender esta estrella.",
    via: "Reto: 10 comandos esenciales",
  },
  {
    id: "git", label: "Git", area: "fundamentos",
    x: 290, y: 165, state: "locked", mastery: 0,
    whatItIs: "Control de versiones. Guardás tu trabajo, colaborás sin pisarte y volvés atrás cuando hace falta.",
    howToUnlock: "Encendé Terminal para abrir este tramo.",
    via: "Reto: Tu primer pull request",
  },
  {
    id: "htmlcss", label: "HTML & CSS", area: "fundamentos",
    x: 430, y: 240, state: "locked", mastery: 0,
    whatItIs: "La estructura y el estilo de toda interfaz. La base sobre la que se construye lo demás.",
    howToUnlock: "Encendé Git para continuar el camino.",
    via: "Reto: Maquetá una landing",
  },
  {
    id: "javascript", label: "JavaScript", area: "fundamentos",
    x: 450, y: 390, state: "locked", mastery: 0,
    whatItIs: "El lenguaje de la web. Le da vida e interacción a todo lo que construís en el navegador.",
    howToUnlock: "Encendé HTML & CSS para llegar acá. Desde acá se abre tanto Frontend como Backend.",
    via: "Proyecto: Quiz interactivo",
  },

  // ── Frontend — abajo izquierda ────────────────────────────────────────────
  {
    id: "react", label: "React", area: "frontend",
    x: 300, y: 640, state: "locked", mastery: 0,
    whatItIs: "La librería para armar interfaces por componentes. El corazón del frontend en FWD.",
    howToUnlock: "Encendé JavaScript para abrir la constelación Frontend.",
    via: "Proyecto: Dashboard de tareas",
  },
  {
    id: "typescript", label: "TypeScript", area: "frontend",
    x: 165, y: 800, state: "locked", mastery: 0,
    whatItIs: "JavaScript con tipos. Atrapás errores antes de que lleguen al usuario.",
    howToUnlock: "Encendé React para seguir este camino.",
    via: "Reto: Tipá una API",
  },
  {
    id: "nextjs", label: "Next.js", area: "frontend",
    x: 450, y: 770, state: "locked", mastery: 0,
    whatItIs: "El framework de React que usa FWD Talent. Rutas, render en servidor y deploy sin dolor.",
    howToUnlock: "Completá React o TypeScript para encender esta estrella.",
    via: "Proyecto: Página de empresa",
  },
  {
    id: "tailwind", label: "Tailwind", area: "frontend",
    x: 510, y: 930, state: "locked", mastery: 0,
    whatItIs: "Estilos por utilidades. Diseñás rápido sin salir del HTML.",
    howToUnlock: "Encendé Next.js primero para abrir este tramo de la constelación.",
    via: "Reto: Recreá un componente del sistema FWD",
  },

  // ── Backend — abajo derecha ───────────────────────────────────────────────
  // Desbloquea desde JavaScript (paralelo a Frontend)
  {
    id: "nodejs", label: "Node.js", area: "backend",
    x: 870, y: 860, state: "locked", mastery: 0,
    whatItIs: "JavaScript del lado del servidor. La puerta de entrada al backend.",
    howToUnlock: "Encendé JavaScript para abrir la constelación Backend en paralelo con Frontend.",
    via: "Reto: Tu primera API",
  },
  {
    id: "apis", label: "APIs REST", area: "backend",
    x: 1060, y: 710, state: "locked", mastery: 0,
    whatItIs: "El idioma con el que el frontend y el backend se hablan.",
    howToUnlock: "Encendé Node.js para seguir el camino del backend.",
    via: "Proyecto: API de proyectos",
  },
  {
    id: "supabase", label: "Supabase", area: "backend",
    x: 950, y: 1000, state: "locked", mastery: 0,
    whatItIs: "La base de datos y auth que usa FWD Talent. Postgres con superpoderes.",
    howToUnlock: "Encendé Node.js o APIs REST para llegar acá.",
    via: "Proyecto: Login con Supabase",
  },
  {
    id: "postgres", label: "PostgreSQL", area: "backend",
    x: 1190, y: 900, state: "locked", mastery: 0,
    whatItIs: "La base de datos relacional. Donde vive y se ordena la información.",
    howToUnlock: "Llegá hasta Supabase o APIs REST para abrir esta estrella.",
    via: "Reto: Modelá un esquema",
  },

  // ── IA & Datos — arriba derecha ───────────────────────────────────────────
  {
    id: "sql", label: "SQL", area: "datos",
    x: 1020, y: 370, state: "locked", mastery: 0,
    whatItIs: "El lenguaje para preguntarle cosas a los datos.",
    howToUnlock: "Encendé APIs REST para abrir la constelación IA & Datos.",
    via: "Reto: Consultas que cuentan historias",
  },
  {
    id: "python", label: "Python", area: "datos",
    x: 1170, y: 190, state: "locked", mastery: 0,
    whatItIs: "El lenguaje favorito de datos e IA. Legible, potente, en todos lados.",
    howToUnlock: "Encendé SQL para seguir esta constelación.",
    via: "Proyecto: Analizá un dataset",
  },
  {
    id: "ia_fundamentos", label: "Fundamentos de IA", area: "datos",
    x: 1370, y: 210, state: "locked", mastery: 0,
    whatItIs: "Cómo funcionan los modelos de IA y el Machine Learning. La base para integrarlo en tus productos.",
    howToUnlock: "Encendé Python para acercarte a esta estrella.",
    via: "Proyecto: Clasificador con ML",
  },
  {
    id: "ia_prompting", label: "Prompting profesional", area: "datos",
    x: 1300, y: 370, state: "locked", mastery: 0,
    whatItIs: "El arte de pedirle bien a la IA. La habilidad que multiplica a todas las demás.",
    howToUnlock: "Encendé Fundamentos de IA para completar la constelación.",
    via: "Reto: Diseñá un prompt de producción",
  },
];

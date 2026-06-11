import type { Constellation } from "./types";

export const CONSTELLATIONS: Record<string, Constellation> = {
  fundamentos: {
    id: "fundamentos",
    name: "Fundamentos",
    color: "#F7901E",
    tagline: "Donde empieza todo camino.",
    label: { x: 150, y: 980 },
  },
  frontend: {
    id: "frontend",
    name: "Frontend",
    color: "#20BEC6",
    tagline: "Lo que la gente toca y ve.",
    label: { x: 560, y: 200 },
  },
  backend: {
    id: "backend",
    name: "Backend",
    color: "#EC008C",
    tagline: "El motor detrás de escena.",
    label: { x: 1030, y: 760 },
  },
  datos: {
    id: "datos",
    name: "Datos & IA",
    color: "#0A6CB9",
    tagline: "La frontera que se abre.",
    label: { x: 1180, y: 70 },
  },
};

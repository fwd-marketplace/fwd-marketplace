import type { Constellation } from "./types";

export const CONSTELLATIONS: Record<string, Constellation> = {
  fundamentos: {
    id: "fundamentos",
    name: "Fundamentos",
    color: "#F7901E",
    tagline: "Donde empieza todo camino.",
    label: { x: 290, y: 110 },
  },
  frontend: {
    id: "frontend",
    name: "Frontend",
    color: "#20BEC6",
    tagline: "Lo que la gente toca y ve.",
    label: { x: 310, y: 990 },
  },
  backend: {
    id: "backend",
    name: "Backend",
    color: "#EC008C",
    tagline: "El motor detrás de escena.",
    label: { x: 1030, y: 1065 },
  },
  datos: {
    id: "datos",
    name: "IA & Datos",
    color: "#0A6CB9",
    tagline: "La frontera que se abre.",
    label: { x: 1200, y: 110 },
  },
};

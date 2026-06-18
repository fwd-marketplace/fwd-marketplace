/**
 * Datos de la constelacion del logo FWD: cada nodo es un punto que se enlaza
 * para dibujar el contorno del logo antes de que la marca aparezca.
 * Coordenadas en un lienzo logico de 100x100.
 */

export type ConstellationNodeKind = "pt" | "tip" | "center";

export interface ConstellationNode {
  readonly x: number;
  readonly y: number;
  readonly k: ConstellationNodeKind;
}

export interface ConstellationPoint {
  readonly x: number;
  readonly y: number;
}

export interface ConstellationData {
  readonly box: number;
  readonly center: ConstellationPoint;
  readonly nodes: readonly ConstellationNode[];
}

export const LOGO_CONSTELLATION: ConstellationData = {
  box: 100,
  center: { x: 50.354, y: 48.372 },
  nodes: [
    { x: 65.05, y: 1.564, k: "pt" },
    { x: 66.43, y: 1.603, k: "tip" },
    { x: 65.78, y: 20.338, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 66.92, y: 22.13, k: "pt" },
    { x: 82.91, y: 11.484, k: "pt" },
    { x: 100, y: 39.625, k: "tip" },
    { x: 87.68, y: 47.22, k: "pt" },
    { x: 82.88, y: 49.012, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 82.88, y: 51.027, k: "pt" },
    { x: 87.68, y: 52.819, k: "pt" },
    { x: 100, y: 60.423, k: "pt" },
    { x: 82.91, y: 88.564, k: "tip" },
    { x: 66.92, y: 77.909, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 65.55, y: 78.955, k: "pt" },
    { x: 66.44, y: 83.362, k: "pt" },
    { x: 66.43, y: 98.436, k: "pt" },
    { x: 33.57, y: 98.436, k: "tip" },
    { x: 33.47, y: 84.68, k: "pt" },
    { x: 34.57, y: 78.441, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 33.08, y: 77.909, k: "pt" },
    { x: 17.09, y: 88.564, k: "tip" },
    { x: 0, y: 60.423, k: "pt" },
    { x: 12.37, y: 52.819, k: "pt" },
    { x: 17.12, y: 51.027, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 17.12, y: 49.012, k: "pt" },
    { x: 12.37, y: 47.22, k: "pt" },
    { x: 0, y: 39.625, k: "tip" },
    { x: 17.09, y: 11.484, k: "pt" },
    { x: 33.08, y: 22.13, k: "pt" },
    { x: 50.354, y: 48.372, k: "center" },
    { x: 34.57, y: 21.597, k: "pt" },
    { x: 33.47, y: 15.359, k: "pt" },
    { x: 33.57, y: 1.603, k: "tip" },
    { x: 64.8, y: 1.603, k: "pt" },
  ],
};

/** Radios y opacidades de cada tipo de estrella, en unidades del lienzo 100x100. */
export const CONSTELLATION_STAR_STYLE = {
  center: { haloRadius: 6.5, coreRadius: 2.0, sparkRadius: 5.2, haloOpacity: 0.7 },
  tip: { haloRadius: 4.2, coreRadius: 1.35, sparkRadius: 3.4, haloOpacity: 0.5 },
  pt: { haloRadius: 2.6, coreRadius: 0.85, sparkRadius: 0, haloOpacity: 0.5 },
} as const;

/** Duracion del trazado completo del contorno, en milisegundos. */
export const CONSTELLATION_DRAW_DURATION_MS = 3600;

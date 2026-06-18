import type { ConstellationNode } from "@/lib/constants/logo-constellation";

const SPARKLE_POINT_COUNT = 8;
const SPARKLE_INNER_RATIO = 0.32;
const QUARTER_TURN = Math.PI / 4;

const LCG_MULTIPLIER = 9301;
const LCG_INCREMENT = 49297;
const LCG_MODULUS = 233280;

/**
 * Generador congruencial lineal sembrado: produce numeros pseudoaleatorios
 * deterministas en [0,1). Mismo seed -> misma secuencia, asi el render del
 * servidor y del cliente coinciden y no hay desajustes de hidratacion.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    return state / LCG_MODULUS;
  };
}

/**
 * Construye el atributo `d` de un path SVG que recorre todos los nodos en orden
 * y cierra el contorno volviendo al primero.
 */
export function buildConstellationPathData(
  nodes: readonly ConstellationNode[],
): string {
  const first = nodes[0];
  if (!first) return "";
  const loop: ConstellationNode[] = [...nodes, first];
  return loop
    .map((node, index) => `${index === 0 ? "M" : "L"}${node.x} ${node.y}`)
    .join(" ");
}

/**
 * Para cada nodo devuelve la fraccion (0..1) de la longitud total del contorno
 * a la que se llega al alcanzarlo. Sirve para encender cada estrella en sincronia
 * con el trazado de la linea.
 */
export function computeNodeFractions(
  nodes: readonly ConstellationNode[],
): number[] {
  const first = nodes[0];
  if (!first) return [];
  const loop: ConstellationNode[] = [...nodes, first];
  const cumulative: number[] = new Array<number>(loop.length).fill(0);
  for (let index = 1; index < loop.length; index++) {
    const previous = loop[index - 1];
    const current = loop[index];
    if (!previous || !current) continue;
    const segmentLength = Math.hypot(
      current.x - previous.x,
      current.y - previous.y,
    );
    cumulative[index] = (cumulative[index - 1] ?? 0) + segmentLength;
  }
  const total = cumulative[cumulative.length - 1] ?? 0;
  if (total === 0) return nodes.map(() => 0);
  return nodes.map((_, index) => (cumulative[index] ?? 0) / total);
}

/**
 * Genera los puntos de un destello de cuatro puntas centrado en (centerX, centerY).
 */
export function buildSparklePoints(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRatio: number = SPARKLE_INNER_RATIO,
): string {
  const innerRadius = outerRadius * innerRatio;
  const points: string[] = [];
  for (let index = 0; index < SPARKLE_POINT_COUNT; index++) {
    const angle = index * QUARTER_TURN - Math.PI / 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const pointX = centerX + Math.cos(angle) * radius;
    const pointY = centerY + Math.sin(angle) * radius;
    points.push(`${pointX.toFixed(2)},${pointY.toFixed(2)}`);
  }
  return points.join(" ");
}

import type { Star, Edge } from "./data/types";

export function recompute(stars: Star[], edges: Edge[]): Star[] {
  const doneSet = new Set(stars.filter((s) => s.state === "done").map((s) => s.id));
  const adj: Record<string, string[]> = {};
  edges.forEach(([a, b]) => {
    (adj[a] ??= []).push(b);
    (adj[b] ??= []).push(a);
  });
  return stars.map((s) => {
    if (s.state === "done") return s;
    const isOpen = (adj[s.id] ?? []).some((n) => doneSet.has(n));
    return { ...s, state: isOpen ? "available" : "locked" };
  });
}

export function starPolygon(
  points: number,
  outerR: number,
  innerR: number,
  cx = 50,
  cy = 50,
): string {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += `${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d.trim();
}

export const STAR_SHAPES = {
  sixpoint: starPolygon(6, 48, 20),
  diamond: starPolygon(4, 49, 16),
} as const;

import type { BoardSize, Edge } from "./types";

export const BOARD: BoardSize = { w: 1500, h: 1150 };

export const EDGES: Edge[] = [
  // fundamentos
  ["htmlcss", "git"], ["git", "terminal"], ["terminal", "javascript"], ["git", "javascript"],
  // puente a frontend
  ["javascript", "react"],
  // frontend
  ["react", "typescript"], ["react", "nextjs"], ["typescript", "nextjs"], ["nextjs", "tailwind"],
  // puente a backend
  ["tailwind", "nodejs"],
  // backend
  ["nodejs", "apis"], ["nodejs", "supabase"], ["supabase", "postgres"], ["apis", "postgres"],
  // puente a datos & ia
  ["apis", "sql"],
  // datos & ia
  ["sql", "python"], ["python", "claude"], ["claude", "prompting"], ["sql", "prompting"],
];

export const META = {
  streakDays: 5,
  level: "Aprendiz",
  initialXp: 700,
} as const;

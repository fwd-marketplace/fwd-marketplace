import type { BoardSize, Edge } from "./types";

export const BOARD: BoardSize = { w: 1500, h: 1150 };

export const EDGES: Edge[] = [
  // fundamentos (terminal → git → htmlcss → javascript)
  ["terminal", "git"], ["git", "htmlcss"], ["htmlcss", "javascript"],
  // javascript desbloquea Frontend Y Backend en paralelo
  ["javascript", "react"],
  ["javascript", "nodejs"],
  // frontend
  ["react", "typescript"], ["react", "nextjs"], ["typescript", "nextjs"], ["nextjs", "tailwind"],
  // backend
  ["nodejs", "apis"], ["nodejs", "supabase"], ["supabase", "postgres"], ["apis", "postgres"],
  // puente a ia & datos (desde apis)
  ["apis", "sql"],
  // ia & datos
  ["sql", "python"], ["python", "ia_fundamentos"], ["ia_fundamentos", "ia_prompting"],
];

export const META = {
  streakDays: 0,
  level: "Explorador",
  initialXp: 0,
} as const;

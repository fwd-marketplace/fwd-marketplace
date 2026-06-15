/**
 * Reglas de los mensajes de commit para TODO el repo (FrontEnd y BackEnd).
 * Obliga el formato Conventional Commits (ver CLAUDE.md / AGENTS.md §11).
 *
 *   <tipo>(<alcance opcional>): <descripción>
 *
 * Ejemplos válidos:
 *   feat(frontend): listado de proyectos con filtros por stack
 *   fix(backend): validar email antes de llamar a Supabase
 *   docs: actualizar reglas en AGENTS.md
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Tipos permitidos (Conventional Commits). Si usás otro, el commit se rechaza.
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
    ],
    // El asunto no puede ir vacío y no termina en punto.
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    // Margen amplio para el encabezado (no bloquear descripciones razonables).
    "header-max-length": [2, "always", 100],
  },
};

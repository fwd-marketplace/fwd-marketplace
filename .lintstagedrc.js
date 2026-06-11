/**
 * Qué se verifica ANTES de cada commit, según qué archivos tocaste.
 * Se ejecuta solo el chequeo de la app afectada ("según corresponda").
 *
 * - Si tocaste el FrontEnd  -> corre su lint (eslint).
 * - Si tocaste el BackEnd   -> corre su typecheck (tsc --noEmit).
 *
 * Las funciones devuelven el comando a correr ignorando la lista de archivos:
 * se valida la app completa, que es lo que pide el Definition of Done.
 */
module.exports = {
  "FrontEnd/**/*.{ts,tsx,js,jsx}": () => "npm --prefix FrontEnd run lint",
  "BackEnd/**/*.ts": () => "npm --prefix BackEnd run typecheck",
};

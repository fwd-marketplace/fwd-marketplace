import "dotenv/config";

/**
 * Lee y valida las variables de entorno una sola vez al arrancar.
 * Si falta alguna obligatoria, el proceso falla rápido (fail-fast)
 * en vez de romper en mitad de una petición.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",

  supabaseUrl: required("SUPABASE_URL"),
  // Clave anon/publishable: el BackEnd actúa en nombre del usuario vía Supabase Auth.
  supabaseKey: required("SUPABASE_KEY"),
} as const;

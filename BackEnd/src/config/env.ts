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

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },

  // Envío de correos (códigos de 2FA) vía un Web App de Google Apps Script.
  // Opcionales para el arranque: si faltan, el envío responde error claro.
  appsScript: {
    url: process.env.APPS_SCRIPT_URL ?? "",
    secret: process.env.APPS_SCRIPT_SECRET ?? "",
  },

  // Asistente de IA para crear proyectos. Proveedor principal Groq (endpoint
  // compatible con OpenAI). La key NO es obligatoria para arrancar: si falta, el
  // asistente degrada con un error claro y el usuario completa el formulario a mano.
  ai: {
    // Proveedor lógico principal (solo informativo para logs/respuestas).
    provider: process.env.AI_PROVIDER ?? "groq",
    apiKey: process.env.GROQ_API_KEY ?? "",
    baseUrl: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
    model: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
    // Timeout por llamada al proveedor y reintentos ante 429/5xx antes de degradar.
    requestTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 30_000,
    maxRetries: Number(process.env.AI_MAX_RETRIES) || 2,
    // Fallback opcional a Google Gemini (endpoint compatible con OpenAI),
    // desactivado por defecto. Se intenta solo si el principal falla.
    fallback: {
      enabled: process.env.AI_FALLBACK_ENABLED === "true",
      apiKey: process.env.GEMINI_API_KEY ?? "",
      baseUrl: process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    },
  },
} as const;

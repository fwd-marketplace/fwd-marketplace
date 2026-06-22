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

/**
 * Valor para `app.set("trust proxy", ...)`. Por defecto `false` (no confiar en
 * `X-Forwarded-For`). En producción, detrás de un proxy/balanceador DE CONFIANZA,
 * poné `TRUST_PROXY=1` (número de saltos) para que el rate limiting use la IP real
 * del cliente. Solo activarlo si el proxy es de confianza: si no, se podría falsear
 * `X-Forwarded-For` y evadir los límites.
 */
function parseTrustProxy(raw?: string): boolean | number | string {
  if (!raw) return false;
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value; // subred o keyword de Express (p. ej. "loopback", "10.0.0.0/8")
}

export const env = {
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  // Confianza en el proxy para resolver la IP real del cliente (rate limiting).
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),

  supabaseUrl: required("SUPABASE_URL"),
  // Clave anon/publishable: el BackEnd actúa en nombre del usuario vía Supabase Auth.
  supabaseKey: required("SUPABASE_KEY"),
  // Clave service_role: bypassa RLS para operaciones de sistema (auto-cierre de proyectos).
  // Supabase Dashboard → Project Settings → API → service_role key.
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",

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

  // Apariencia de los correos transaccionales (nombre del remitente y logo).
  // El logo debe ser una imagen hosteada por HTTPS (PNG/JPG); los correos no
  // renderizan SVG. Si no hay logo, la plantilla cae a un wordmark de texto.
  email: {
    fromName: process.env.EMAIL_FROM_NAME ?? "FWD Marketplace",
    logoUrl: process.env.EMAIL_LOGO_URL ?? "",
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

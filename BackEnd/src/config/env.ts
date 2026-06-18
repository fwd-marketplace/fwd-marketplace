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

  // Apariencia de los correos transaccionales (nombre del remitente y logo).
  // El logo debe ser una imagen hosteada por HTTPS (PNG/JPG); los correos no
  // renderizan SVG. Si no hay logo, la plantilla cae a un wordmark de texto.
  email: {
    fromName: process.env.EMAIL_FROM_NAME ?? "FWD Marketplace",
    logoUrl: process.env.EMAIL_LOGO_URL ?? "",
  },
} as const;

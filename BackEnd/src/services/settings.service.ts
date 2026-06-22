import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import type { UpdateSettingsInput } from "../validations/adminSettings";

/** La configuración global vive en una fila única (ver migración 0040). */
const SETTINGS_ID = 1;
const SETTINGS_SELECT = "allow_signups, allow_companies, allow_applications, enable_matching";

export interface AppSettings {
  allow_signups: boolean;
  allow_companies: boolean;
  allow_applications: boolean;
  enable_matching: boolean;
}

/** Defaults (todo habilitado): se usan como fail-open si no se puede leer la config. */
const DEFAULT_SETTINGS: AppSettings = {
  allow_signups: true,
  allow_companies: true,
  allow_applications: true,
  enable_matching: true,
};

/**
 * Lee la configuración global con service_role (server-side, sin sesión), para gatear
 * flujos públicos como el onboarding. Fail-open: ante cualquier problema (sin service
 * key, fila ausente, error) devuelve los defaults para no bloquear la plataforma.
 */
export async function readAppSettings(): Promise<AppSettings> {
  if (!env.supabaseServiceKey) return DEFAULT_SETTINGS;
  const { data, error } = await supabaseAdmin()
    .from("app_settings")
    .select(SETTINGS_SELECT)
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return data;
}

/** Lectura para el panel admin (su token tiene permiso de lectura por RLS). */
export async function getAppSettings(accessToken: string): Promise<AppSettings> {
  const { data, error } = await supabaseForToken(accessToken)
    .from("app_settings")
    .select(SETTINGS_SELECT)
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  return data ?? DEFAULT_SETTINGS;
}

/**
 * Actualiza la configuración global. Solo admin (la ruta exige requireAdmin). Usa
 * service_role para no depender de matices de RLS en el UPDATE. Requiere SUPABASE_SERVICE_KEY.
 */
export async function updateAppSettings(input: UpdateSettingsInput): Promise<AppSettings> {
  if (!env.supabaseServiceKey) {
    throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: editar la configuración no está disponible");
  }
  const changes: Partial<AppSettings> & { updated_at: string } = { updated_at: new Date().toISOString() };
  if (input.allow_signups !== undefined) changes.allow_signups = input.allow_signups;
  if (input.allow_companies !== undefined) changes.allow_companies = input.allow_companies;
  if (input.allow_applications !== undefined) changes.allow_applications = input.allow_applications;
  if (input.enable_matching !== undefined) changes.enable_matching = input.enable_matching;

  const { data, error } = await supabaseAdmin()
    .from("app_settings")
    .update(changes)
    .eq("id", SETTINGS_ID)
    .select(SETTINGS_SELECT)
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Configuración no encontrada");
  return data;
}

import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { readAppSettings } from "./settings.service";
import { verificarEgresado } from "./egresado.service";
import type {
  JuniorOnboarding,
  EmpresaOnboarding,
  EmprendedorOnboarding,
} from "../validations/onboarding";

/**
 * Resultado del onboarding. Por defecto la cuenta queda 'pendiente' (aprobación del
 * admin); un junior cuya cédula sea de egresado FWD verificado queda 'activa' de una.
 */
type OnboardingResult = { role: "student" | "company"; estado_cuenta: "pendiente" | "activa" };

/**
 * El onboarding corre dentro de una función SECURITY DEFINER (ver
 * `supabase/migrations/0019_*.sql`) que crea `users` + el perfil (+ skills) en UNA
 * transacción: si algún paso falla, la BD revierte todo y no queda una cuenta a medias
 * (sin esto se necesitaba un rollback compensatorio en código). Se llama con el cliente
 * del usuario para que `auth.uid()` dentro de la función sea él mismo.
 */

/**
 * Traduce el error de una RPC de onboarding al ApiError con el código HTTP correcto.
 * Las funciones lanzan errcodes/mensajes conocidos (ver la migración 0019).
 */
function mapOnboardingError(error: { code?: string; message?: string }): never {
  const code = error.code ?? "";
  const message = error.message ?? "";
  if (code === "42501" || /FORBIDDEN/i.test(message)) {
    throw new ApiError(403, "No podés hacer el onboarding de otra cuenta");
  }
  if (code === "23505" || /ALREADY_ONBOARDED|duplicate key/i.test(message)) {
    throw new ApiError(409, "Este usuario ya completó el onboarding");
  }
  if (/MISSING_ROLE/i.test(message)) {
    throw new ApiError(500, "Falta el rol en la BD (seeds no aplicados)");
  }
  throw new ApiError(400, message || "No se pudo completar el onboarding");
}

/** Onboarding del junior: users (pendiente) + estudiante + student_skills, atómico. */
export async function onboardJunior(
  accessToken: string,
  userId: string,
  correo: string,
  input: JuniorOnboarding,
): Promise<OnboardingResult> {
  const settings = await readAppSettings();
  if (!settings.allow_signups) {
    throw new ApiError(403, "Los registros de talento están deshabilitados temporalmente.");
  }
  const client = supabaseForToken(accessToken);
  const { error } = await client.rpc("onboard_junior", {
    p_user_id: userId,
    p_correo: correo,
    p_nombre: input.nombre,
    p_apellido1: input.apellido1,
    p_apellido2: input.apellido2 ?? null,
    p_cedula: input.cedula,
    p_especialidad: input.especializacion,
    p_modalidad: JSON.stringify(input.modalidad),
    p_disponibilidad: input.disponibilidad,
    p_url_github: input.link_github || null,
    p_url_linkedin: input.link_linkedin || null,
    p_url_portfolio: input.link_portfolio || null,
    p_descripcion: input.bio ?? null,
    p_tech_stack: input.tech_stack,
  });
  if (error) mapOnboardingError(error);

  // Verificación de egresado FWD: si la cédula está en el registro externo, la cuenta se
  // ACTIVA de una (estado_cuenta='activa') y el estudiante queda 'verificado' con su
  // título FWD, sin revisión manual del admin. Opción A: si no coincide o el registro no
  // responde, la cuenta queda 'pendiente' y el registro NUNCA se bloquea; por eso el
  // cotejo va en un try/catch que solo loguea.
  let estadoCuenta: "pendiente" | "activa" = "pendiente";
  try {
    const match = await verificarEgresado(input.cedula);
    if (match.elegible) {
      const admin = supabaseAdmin();
      const { error: estudianteError } = await admin
        .from("estudiante")
        .update({ estado_verificacion: "verificado", titulo_fwd: match.titulo })
        .eq("id_usuario", userId);
      const { error: cuentaError } = await admin
        .from("users")
        .update({ estado_cuenta: "activa" })
        .eq("id", userId);
      if (estudianteError || cuentaError) {
        logger.error("no se pudo activar al egresado verificado", {
          error: (estudianteError ?? cuentaError)?.message,
        });
      } else {
        estadoCuenta = "activa";
      }
    }
  } catch (cause) {
    logger.error("cotejo de egresado falló; la cuenta queda pendiente", {
      error: (cause as Error).message,
    });
  }

  return { role: "student", estado_cuenta: estadoCuenta };
}

/** Onboarding de empresa: users (pendiente) + empresario(tipo='empresa'), atómico. */
export async function onboardEmpresa(
  accessToken: string,
  userId: string,
  correo: string,
  input: EmpresaOnboarding,
): Promise<OnboardingResult> {
  const settings = await readAppSettings();
  if (!settings.allow_companies) {
    throw new ApiError(403, "El registro de empresas está deshabilitado temporalmente.");
  }
  const client = supabaseForToken(accessToken);
  const { error } = await client.rpc("onboard_empresa", {
    p_user_id: userId,
    p_correo: correo,
    p_nombre_comercial: input.nombre_empresa,
    p_sector: JSON.stringify(input.sector),
    p_descripcion: input.descripcion,
    p_cedula_juridica: input.datos_legales.ruc,
    p_direccion: input.datos_legales.direccion,
    p_tipos_proyecto: JSON.stringify(input.tipos_proyecto),
  });
  if (error) mapOnboardingError(error);

  return { role: "company", estado_cuenta: "pendiente" };
}

/** Onboarding de emprendedor: users (pendiente) + empresario(tipo='emprendedor'), atómico. */
export async function onboardEmprendedor(
  accessToken: string,
  userId: string,
  correo: string,
  input: EmprendedorOnboarding,
): Promise<OnboardingResult> {
  const settings = await readAppSettings();
  if (!settings.allow_companies) {
    throw new ApiError(403, "El registro de empresas está deshabilitado temporalmente.");
  }
  const client = supabaseForToken(accessToken);
  const { error } = await client.rpc("onboard_emprendedor", {
    p_user_id: userId,
    p_correo: correo,
    p_nombre_proyecto: input.nombre_proyecto,
    p_etapa: input.etapa,
    p_apoyo_tecnico: JSON.stringify(input.soporte_tecnico),
    p_presupuesto: input.presupuesto,
    p_descripcion: input.descripcion ?? null,
  });
  if (error) mapOnboardingError(error);

  return { role: "company", estado_cuenta: "pendiente" };
}
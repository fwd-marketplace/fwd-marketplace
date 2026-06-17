import { createHash, randomInt } from "node:crypto";
import { supabase, createEphemeralClient } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { sendEmail } from "./email.service";

/** El código de 2FA vive 10 minutos. */
const OTP_TTL_SECONDS = 600;

/** Hash determinístico del código (para no guardarlo en claro). */
function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Código de 6 dígitos (con ceros a la izquierda). */
function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Inicia el 2FA por email: genera un código, lo guarda hasheado junto al
 * refresh_token del usuario en `pending_login` (vía RPC definer), y lo envía por
 * correo. Devuelve el `ticket` con el que el FrontEnd verificará el código.
 */
export async function startEmailMfa(input: {
  userId: string;
  email: string;
  refreshToken: string;
}): Promise<string> {
  const code = generateCode();

  const { data: ticket, error } = await supabase.rpc("crear_pending_login", {
    p_id_usuario: input.userId,
    p_codigo_hash: hashCode(code),
    p_refresh_token: input.refreshToken,
    p_ttl_segundos: OTP_TTL_SECONDS,
  });
  if (error || !ticket) {
    throw new ApiError(500, "No se pudo iniciar la verificación en dos pasos");
  }

  await sendEmail({
    to: input.email,
    subject: "Tu código de acceso — FWD Marketplace",
    body:
      `<p>Tu código de acceso es:</p>` +
      `<p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>` +
      `<p>Vence en 10 minutos. Si no intentaste iniciar sesión, ignorá este correo.</p>`,
  });

  return ticket;
}

/**
 * Verifica el código del ticket. Si es correcto y no expiró, refresca el
 * refresh_token guardado y devuelve una sesión nueva (mismo shape que login).
 * Si el código es inválido/expiró o se agotaron los intentos, lanza 401.
 */
export async function verifyEmailMfa(ticket: string, code: string) {
  const { data: refreshToken, error } = await supabase.rpc("consumir_pending_login", {
    p_ticket: ticket,
    p_codigo_hash: hashCode(code),
  });
  if (error) {
    throw new ApiError(500, error.message);
  }
  if (!refreshToken) {
    throw new ApiError(401, "Código inválido o expirado");
  }

  const client = createEphemeralClient();
  const { data, error: refreshError } = await client.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (refreshError || !data.session) {
    throw new ApiError(401, "La sesión expiró, iniciá sesión de nuevo");
  }
  return { user: data.user, session: data.session };
}

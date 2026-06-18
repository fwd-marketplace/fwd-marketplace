import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

/**
 * Envía un correo HTML a través del Web App de Google Apps Script (MailApp).
 * Elegido porque manda correos reales de Gmail a cualquier destinatario, gratis
 * y sin dominio propio (las reglas DKIM/DMARC de 2024 bloquean enviar "desde un
 * gmail" por un SMTP de terceros). Manda `html` (cuerpo maquetado) y `text`
 * (alternativa plana); el Apps Script los pasa a `htmlBody`/`body` de MailApp.
 * La URL y el secreto viven solo en el BackEnd.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!env.appsScript.url || !env.appsScript.secret) {
    throw new ApiError(500, "El envío de correo no está configurado (APPS_SCRIPT_URL/SECRET)");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(env.appsScript.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text ?? "",
        name: env.email.fromName,
        secret: env.appsScript.secret,
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      logger.error("Apps Script rechazó el envío", { status: res.status, error: data.error });
      throw new ApiError(502, "No se pudo enviar el correo");
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    logger.error("Fallo al contactar el Apps Script", { error: e instanceof Error ? e.message : String(e) });
    throw new ApiError(502, "Error al contactar el servicio de correo");
  } finally {
    clearTimeout(timeout);
  }
}

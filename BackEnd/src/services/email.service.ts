import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/**
 * Envía un correo a través del Web App de Google Apps Script (MailApp). Elegido
 * porque manda correos reales de Gmail a cualquier destinatario, gratis y sin
 * dominio propio (las reglas DKIM/DMARC de 2024 bloquean enviar "desde un gmail"
 * por un SMTP de terceros). La URL y el secreto viven solo en el BackEnd.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  body: string;
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
        body: input.body,
        secret: env.appsScript.secret,
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
    if (!res.ok || !data.ok) {
      throw new ApiError(502, "No se pudo enviar el correo");
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(502, "Error al contactar el servicio de correo");
  } finally {
    clearTimeout(timeout);
  }
}

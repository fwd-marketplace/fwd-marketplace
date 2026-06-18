import { env } from "../config/env";

/**
 * Plantillas de correo transaccional con la identidad FWD.
 *
 * El HTML de correo es distinto al de la web: no hay Tailwind ni tokens CSS, los
 * clientes (Gmail, Outlook) solo entienden estilos en línea y colores literales,
 * y conviene maquetar con tablas. Por eso aquí sí usamos los hex de la paleta FWD
 * (§7.1 del CLAUDE.md), que es la fuente de verdad de esos valores.
 */

const COLOR = {
  primary: "#0A6CB9",
  secondary: "#662D91",
  accent: "#20BEC6",
  highlight: "#FFCB05",
  warning: "#F7901E",
  magenta: "#EC008C",
  inkStrong: "#1f2430",
  inkMuted: "#6b7280",
  canvas: "#f4f5f7",
  surface: "#ffffff",
  border: "#e5e7eb",
  primaryTint: "#eef4fb",
  primaryTintBorder: "#cfe0f2",
} as const;

/** Los 6 colores de marca, en orden, para la franja superior multicolor. */
const BRAND_STRIPE = [
  COLOR.primary,
  COLOR.secondary,
  COLOR.accent,
  COLOR.highlight,
  COLOR.warning,
  COLOR.magenta,
];

const FONT_STACK = "Arial, Helvetica, sans-serif";

/** Franja superior con los 6 colores de marca (eco del logo FWD multicolor). */
function renderBrandStripe(): string {
  const cells = BRAND_STRIPE.map(
    (color) => `<td style="background:${color};">&nbsp;</td>`,
  ).join("");
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="border-collapse:collapse;">` +
    `<tr style="height:6px;line-height:6px;font-size:0;">${cells}</tr>` +
    `</table>`
  );
}

/**
 * Cabecera de marca: el logo hosteado si hay `EMAIL_LOGO_URL`, o un wordmark
 * "FWD." con el subtítulo de la Fundación como fallback (siempre renderiza).
 */
function renderHeader(): string {
  if (env.email.logoUrl) {
    return (
      `<img src="${env.email.logoUrl}" alt="${env.email.fromName}" width="160" ` +
      `style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />`
    );
  }
  return (
    `<span style="font-family:${FONT_STACK};font-size:28px;font-weight:800;` +
    `letter-spacing:-0.5px;color:${COLOR.primary};">FWD` +
    `<span style="color:${COLOR.magenta};">.</span></span>` +
    `<div style="font-family:${FONT_STACK};font-size:10px;font-weight:700;` +
    `letter-spacing:2px;color:${COLOR.secondary};margin-top:4px;">` +
    `COSTA RICA &middot; TECH &amp; FREEDOM</div>`
  );
}

/**
 * Envuelve el contenido de un correo en la cáscara de marca (franja multicolor,
 * cabecera con logo, tarjeta blanca centrada y pie). `contentHtml` es el cuerpo
 * ya maquetado.
 */
function wrapEmail(contentHtml: string): string {
  return (
    `<!doctype html>` +
    `<html lang="es"><head><meta charset="utf-8" />` +
    `<meta name="viewport" content="width=device-width, initial-scale=1" />` +
    `</head>` +
    `<body style="margin:0;padding:0;background:${COLOR.canvas};">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="background:${COLOR.canvas};padding:32px 12px;">` +
    `<tr><td align="center">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="max-width:480px;background:${COLOR.surface};border:1px solid ${COLOR.border};` +
    `border-radius:16px;overflow:hidden;">` +
    `<tr><td style="padding:0;">${renderBrandStripe()}</td></tr>` +
    `<tr><td style="padding:28px 32px 8px 32px;">${renderHeader()}</td></tr>` +
    `<tr><td style="padding:8px 32px 28px 32px;">${contentHtml}</td></tr>` +
    `</table>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">` +
    `<tr><td style="padding:18px 32px;text-align:center;font-family:${FONT_STACK};` +
    `font-size:12px;line-height:18px;color:${COLOR.inkMuted};">` +
    `${env.email.fromName} &mdash; Fundación Forward Costa Rica<br />` +
    `Este es un correo automático, por favor no respondas.` +
    `</td></tr></table>` +
    `</td></tr></table>` +
    `</body></html>`
  );
}

/** Correo del código de verificación en dos pasos (2FA). */
export function renderOtpEmail(input: { code: string; minutes: number }): {
  subject: string;
  html: string;
  text: string;
} {
  const { code, minutes } = input;

  const content =
    `<h1 style="margin:16px 0 8px 0;font-family:${FONT_STACK};font-size:22px;` +
    `font-weight:700;color:${COLOR.inkStrong};">Tu código de acceso</h1>` +
    `<p style="margin:0 0 20px 0;font-family:${FONT_STACK};font-size:15px;` +
    `line-height:22px;color:${COLOR.inkMuted};">` +
    `Usá este código para completar tu inicio de sesión:</p>` +
    `<div style="background:${COLOR.primaryTint};border:1px solid ${COLOR.primaryTintBorder};` +
    `border-radius:12px;padding:22px;text-align:center;margin:0 0 20px 0;">` +
    `<div style="font-family:${FONT_STACK};font-size:11px;font-weight:700;` +
    `letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.primary};margin-bottom:10px;">` +
    `Código de verificación</div>` +
    `<span style="font-family:${FONT_STACK};font-size:36px;font-weight:800;` +
    `letter-spacing:10px;color:${COLOR.primary};">${code}</span>` +
    `</div>` +
    `<p style="margin:0 0 6px 0;font-family:${FONT_STACK};font-size:14px;` +
    `line-height:21px;color:${COLOR.inkMuted};">` +
    `Vence en <span style="color:${COLOR.warning};font-weight:700;">${minutes} minutos</span>.</p>` +
    `<p style="margin:0;font-family:${FONT_STACK};font-size:14px;line-height:21px;` +
    `color:${COLOR.inkMuted};">` +
    `Si no intentaste iniciar sesión, podés ignorar este correo de forma segura.</p>`;

  const text =
    `Tu código de acceso es: ${code}\n` +
    `Vence en ${minutes} minutos.\n` +
    `Si no intentaste iniciar sesión, ignorá este correo.`;

  return {
    subject: `Tu código de acceso — ${env.email.fromName}`,
    html: wrapEmail(content),
    text,
  };
}

import type { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ApiError } from "../utils/ApiError";

/** Largo mínimo de contraseña, unificado entre registro y recuperación. */
const MIN_PASSWORD_LENGTH = 8;

/** Comprueba que email y password vengan como strings no vacíos. */
function readCredentials(body: unknown): { email: string; password: string; name?: string } {
  const { email, password, name } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    throw new ApiError(400, "El email es obligatorio");
  }
  if (typeof password !== "string" || !password) {
    throw new ApiError(400, "La contraseña es obligatoria");
  }

  return { email, password, name: typeof name === "string" ? name : undefined };
}

/** Lee el ticket + el código de 6 dígitos del paso de 2FA del login. */
function readVerifyLoginInput(body: unknown): { ticket: string; code: string } {
  const { ticket, code } = (body ?? {}) as Record<string, unknown>;

  if (typeof ticket !== "string" || !ticket.trim()) {
    throw new ApiError(400, "Falta el ticket de verificación");
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    throw new ApiError(400, "El código debe ser de 6 dígitos");
  }

  return { ticket, code };
}

function readResetInput(body: unknown): { email: string; locale?: string } {
  // Recuperación de contraseña: solo necesita el email. NO se pide la contraseña
  // (quien la olvidó no la sabe); Supabase Auth manda el correo con el enlace para
  // fijar una nueva. `locale` (opcional) decide el idioma del enlace del correo.
  const { email, locale } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    throw new ApiError(400, "El email es obligatorio");
  }

  return {
    email: email.trim(),
    locale: typeof locale === "string" ? locale : undefined,
  };
}

/**
 * Lee los datos del paso 2 de recuperación: la contraseña nueva + la sesión de
 * recovery, que puede venir como `access_token`+`refresh_token` (correo default,
 * sesión en el fragment) o como `token_hash` (plantilla personalizada).
 */
function readConfirmResetInput(body: unknown): {
  tokenHash?: string;
  accessToken?: string;
  refreshToken?: string;
  password: string;
} {
  const { token_hash, access_token, refresh_token, password } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  if (typeof token_hash === "string" && token_hash.trim()) {
    return { tokenHash: token_hash, password };
  }
  if (
    typeof access_token === "string" &&
    access_token.trim() &&
    typeof refresh_token === "string" &&
    refresh_token.trim()
  ) {
    return { accessToken: access_token, refreshToken: refresh_token, password };
  }
  throw new ApiError(400, "Falta el token de recuperación");
}

/** Lee y valida el `refresh_token` del body. */
function readRefreshToken(body: unknown): string {
  const { refresh_token } = (body ?? {}) as Record<string, unknown>;

  if (typeof refresh_token !== "string" || !refresh_token.trim()) {
    throw new ApiError(400, "El refresh_token es obligatorio");
  }

  return refresh_token;
}

/** POST /api/users/register */
export async function register(req: Request, res: Response) {
  const credentials = readCredentials(req.body);
  if (credentials.password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  const result = await userService.registerUser(credentials);
  res.status(201).json(result);
}

/** POST /api/users/login */
export async function login(req: Request, res: Response) {
  const { email, password } = readCredentials(req.body);
  // Con 2FA obligatorio, devuelve { mfa_required: true, ticket } (no la sesión).
  const result = await userService.loginUser({ email, password });
  res.status(200).json(result);
}

/** POST /api/users/login/verify-otp (paso 2 del login: valida el código de email) */
export async function verifyLoginOtp(req: Request, res: Response) {
  const { ticket, code } = readVerifyLoginInput(req.body);
  const result = await userService.verifyLoginOtp(ticket, code);
  res.status(200).json(result);
}

/** POST /api/users/reset-password (paso 1: pide el correo de recuperación) */
export async function resetPassword(req: Request, res: Response) {
  const { email, locale } = readResetInput(req.body);
  await userService.requestPasswordReset(email, locale);
  res.status(200).json({ ok: true });
}

/** POST /api/users/reset-password/confirm (paso 2: define la clave nueva) */
export async function confirmResetPassword(req: Request, res: Response) {
  const input = readConfirmResetInput(req.body);
  await userService.confirmPasswordReset(input);
  res.status(200).json({ ok: true });
}

/** GET /api/users/oauth/:provider (devuelve la URL de autorización del provider) */
export async function oauthStart(req: Request, res: Response) {
  const provider = req.params.provider;
  if (typeof provider !== "string" || !userService.isOAuthProvider(provider)) {
    throw new ApiError(400, "Proveedor de OAuth no soportado");
  }
  // El FE manda el locale para construir el callback localizado. Se valida a un
  // código de 2 letras para no inyectar nada raro en la redirect URL.
  const localeRaw = req.query.locale;
  const locale = typeof localeRaw === "string" && /^[a-z]{2}$/.test(localeRaw) ? localeRaw : "es";

  const url = await userService.getOAuthUrl(provider, locale);
  res.status(200).json({ url });
}

/** POST /api/users/refresh */
export async function refresh(req: Request, res: Response) {
  const refreshToken = readRefreshToken(req.body);
  const result = await userService.refreshSession(refreshToken);
  res.status(200).json(result);
}

/** POST /api/users/logout */
export async function logout(req: Request, res: Response) {
  const refreshToken = readRefreshToken(req.body);
  await userService.logoutUser(refreshToken);
  res.status(200).json({ ok: true });
}

/** GET /api/users/me (ruta protegida) */
export async function me(req: Request, res: Response) {
  // `req.user` y `req.accessToken` los inyecta el middleware de autenticación.
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  // `profile` es null si la cuenta existe en Auth pero aún no hizo onboarding.
  const profile = await userService.getMyProfile(req.accessToken, req.user.id);
  res.status(200).json({ user: req.user, profile });
}

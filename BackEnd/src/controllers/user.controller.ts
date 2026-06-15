import type { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ApiError } from "../utils/ApiError";

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
  const result = await userService.registerUser(credentials);
  res.status(201).json(result);
}

/** POST /api/users/login */
export async function login(req: Request, res: Response) {
  const { email, password } = readCredentials(req.body);
  const result = await userService.loginUser({ email, password });
  res.status(200).json(result);
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

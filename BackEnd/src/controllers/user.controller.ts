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

/** GET /api/users/me (ruta protegida) */
export async function me(req: Request, res: Response) {
  // `req.user` lo inyecta el middleware de autenticación tras validar el token.
  res.status(200).json({ user: req.user });
}

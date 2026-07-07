import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { parseBody } from "../utils/parseBody";
import {
  JuniorOnboardingSchema,
  EmpresaOnboardingSchema,
  EmprendedorOnboardingSchema,
} from "../validations/onboarding";
import {
  onboardJunior,
  onboardEmpresa,
  onboardEmprendedor,
} from "../services/onboarding.service";

/** Extrae token + identidad del usuario autenticado (los inyecta `authenticate`). */
function requireAuth(req: Request): { token: string; userId: string; correo: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado", "NOT_AUTHENTICATED");
  }
  const correo = req.user.email;
  if (!correo) {
    throw new ApiError(400, "La cuenta no tiene un email asociado", "NO_EMAIL");
  }
  return { token: req.accessToken, userId: req.user.id, correo };
}

/** POST /api/users/onboarding/junior */
export async function onboardJuniorController(req: Request, res: Response) {
  const { token, userId, correo } = requireAuth(req);
  const input = parseBody(JuniorOnboardingSchema, req.body);
  const result = await onboardJunior(token, userId, correo, input);
  res.status(201).json(result);
}

/** POST /api/users/onboarding/empresa */
export async function onboardEmpresaController(req: Request, res: Response) {
  const { token, userId, correo } = requireAuth(req);
  const input = parseBody(EmpresaOnboardingSchema, req.body);
  const result = await onboardEmpresa(token, userId, correo, input);
  res.status(201).json(result);
}

/** POST /api/users/onboarding/emprendedor */
export async function onboardEmprendedorController(req: Request, res: Response) {
  const { token, userId, correo } = requireAuth(req);
  const input = parseBody(EmprendedorOnboardingSchema, req.body);
  const result = await onboardEmprendedor(token, userId, correo, input);
  res.status(201).json(result);
}

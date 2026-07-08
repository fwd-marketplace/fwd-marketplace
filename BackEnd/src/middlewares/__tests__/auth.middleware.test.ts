import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

/** Resultado que devolverá el `getUserFromToken` mockeado. */
const { state } = vi.hoisted(() => ({
  state: {
    user: { id: "u1" } as unknown,
    error: null as unknown,
  },
}));

vi.mock("../../services/user.service", () => ({
  getUserFromToken: (_token: string) =>
    state.error ? Promise.reject(state.error) : Promise.resolve(state.user),
}));

import { authenticate } from "../auth.middleware";

/**
 * Ejecuta el middleware (envuelto en asyncHandler) y resuelve cuando llama a
 * `next`: con el error si lo hubo, o `undefined` si pasó. Devuelve también el
 * `req` para verificar lo que el middleware inyectó.
 */
function run(req: Record<string, unknown>): Promise<{ error: unknown; req: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const next: NextFunction = ((err?: unknown) => resolve({ error: err, req })) as NextFunction;
    authenticate(req as unknown as Request, {} as Response, next);
  });
}

beforeEach(() => {
  state.user = { id: "u1" };
  state.error = null;
});

describe("authenticate", () => {
  it("inyecta req.user y req.accessToken con un Bearer válido", async () => {
    const { error, req } = await run({ headers: { authorization: "Bearer good-token" } });
    expect(error).toBeUndefined();
    expect(req.user).toMatchObject({ id: "u1" });
    expect(req.accessToken).toBe("good-token");
  });

  it("responde 401 si no hay header Authorization", async () => {
    const { error } = await run({ headers: {} });
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it("responde 401 si el header no empieza con 'Bearer '", async () => {
    const { error } = await run({ headers: { authorization: "Token abc" } });
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it("propaga el 401 si el token no es válido", async () => {
    state.error = { statusCode: 401, message: "Token inválido o expirado" };
    const { error } = await run({ headers: { authorization: "Bearer bad-token" } });
    expect(error).toMatchObject({ statusCode: 401 });
  });
});
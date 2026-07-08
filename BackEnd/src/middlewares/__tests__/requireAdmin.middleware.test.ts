import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

/** Respuesta del `maybeSingle()` que resuelve el rol del usuario. */
const { state } = vi.hoisted(() => ({
  state: { response: { data: null as unknown, error: null as unknown } },
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      from: chain,
      select: chain,
      eq: chain,
      maybeSingle: () => Promise.resolve(state.response),
    });
    return builder;
  },
}));

import { requireAdmin } from "../requireAdmin.middleware";

/** Ejecuta el middleware y resuelve con el error pasado a `next` (o undefined). */
function run(req: Record<string, unknown>): Promise<{ error: unknown }> {
  return new Promise((resolve) => {
    const next: NextFunction = ((err?: unknown) => resolve({ error: err })) as NextFunction;
    requireAdmin(req as unknown as Request, {} as Response, next);
  });
}

const SESSION = { accessToken: "token", user: { id: "u1" } };

beforeEach(() => {
  state.response = { data: null, error: null };
});

describe("requireAdmin", () => {
  it("deja pasar (next sin error) si el rol es admin", async () => {
    state.response = { data: { role: { nombre: "admin" } }, error: null };
    const { error } = await run(SESSION);
    expect(error).toBeUndefined();
  });

  it("responde 401 si no hay sesión", async () => {
    const { error } = await run({});
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it("responde 403 si el rol no es admin", async () => {
    state.response = { data: { role: { nombre: "student" } }, error: null };
    const { error } = await run(SESSION);
    expect(error).toMatchObject({ statusCode: 403 });
  });

  it("responde 500 si la consulta del rol falla", async () => {
    state.response = { data: null, error: { message: "boom" } };
    const { error } = await run(SESSION);
    expect(error).toMatchObject({ statusCode: 500 });
  });
});
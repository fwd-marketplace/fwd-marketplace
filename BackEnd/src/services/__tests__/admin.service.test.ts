import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Estado compartido del mock: la respuesta del `maybeSingle()` terminal y el
 * payload capturado del `update()` (para verificar el estado_cuenta enviado).
 */
const { state } = vi.hoisted(() => ({
  state: {
    response: { data: null as unknown, error: null as unknown },
    lastUpdate: null as Record<string, unknown> | null,
  },
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      from: chain,
      update: (payload: Record<string, unknown>) => {
        state.lastUpdate = payload;
        return builder;
      },
      select: chain,
      eq: chain,
      order: () => Promise.resolve(state.response),
      maybeSingle: () => Promise.resolve(state.response),
    });
    return builder;
  },
}));

import {
  approveUser,
  rejectUser,
  suspendUser,
  listPendingStudents,
  verifyStudent,
  rejectStudent,
} from "../admin.service";

const TOKEN = "token";
const USER = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
  state.response = { data: null, error: null };
  state.lastUpdate = null;
});

describe("admin.service — cambios de estado de cuenta", () => {
  it("approveUser pone estado_cuenta = 'activa'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "activa" }, error: null };
    const result = await approveUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "activa" });
    expect(result).toMatchObject({ estado_cuenta: "activa" });
  });

  it("rejectUser pone estado_cuenta = 'rechazada'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "rechazada" }, error: null };
    await rejectUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "rechazada" });
  });

  it("suspendUser pone estado_cuenta = 'suspendida'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "suspendida" }, error: null };
    await suspendUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "suspendida" });
  });

  it("lanza 404 si el usuario no existe", async () => {
    state.response = { data: null, error: null };
    await expect(rejectUser(TOKEN, USER)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("propaga un error de Supabase como 400", async () => {
    state.response = { data: null, error: { message: "boom" } };
    await expect(suspendUser(TOKEN, USER)).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("admin.service — verificación de egresados FWD", () => {
  const ESTUDIANTE = "660e8400-e29b-41d4-a716-446655440000";

  it("listPendingStudents devuelve la lista de pendientes", async () => {
    state.response = {
      data: [{ id: ESTUDIANTE, titulo_fwd: "Cohorte 2026", estado_verificacion: "pendiente" }],
      error: null,
    };
    const result = await listPendingStudents(TOKEN);
    expect(result).toHaveLength(1);
  });

  it("verifyStudent pone estado_verificacion = 'verificado'", async () => {
    state.response = { data: { id: ESTUDIANTE, estado_verificacion: "verificado" }, error: null };
    const result = await verifyStudent(TOKEN, ESTUDIANTE);
    expect(state.lastUpdate).toMatchObject({ estado_verificacion: "verificado" });
    expect(result).toMatchObject({ estado_verificacion: "verificado" });
  });

  it("rejectStudent pone estado_verificacion = 'rechazado'", async () => {
    state.response = { data: { id: ESTUDIANTE, estado_verificacion: "rechazado" }, error: null };
    await rejectStudent(TOKEN, ESTUDIANTE);
    expect(state.lastUpdate).toMatchObject({ estado_verificacion: "rechazado" });
  });

  it("lanza 404 si el estudiante no existe", async () => {
    state.response = { data: null, error: null };
    await expect(verifyStudent(TOKEN, ESTUDIANTE)).rejects.toMatchObject({ statusCode: 404 });
  });
});

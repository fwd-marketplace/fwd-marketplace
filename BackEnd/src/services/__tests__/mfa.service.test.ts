import { describe, it, expect, beforeEach, vi } from "vitest";

const { state } = vi.hoisted(() => ({
  state: {
    rpcResult: { data: null as unknown, error: null as unknown },
    refreshResult: { data: { user: null, session: null }, error: null } as {
      data: { user: unknown; session: unknown };
      error: unknown;
    },
    rpcCalls: [] as Array<{ fn: string }>,
    emailCalls: 0,
  },
}));

vi.mock("../../config/supabase", () => ({
  supabase: {
    rpc: (fn: string, _args: unknown) => {
      state.rpcCalls.push({ fn });
      return Promise.resolve(state.rpcResult);
    },
  },
  createEphemeralClient: () => ({
    auth: {
      refreshSession: (_args: { refresh_token: string }) => Promise.resolve(state.refreshResult),
    },
  }),
}));

vi.mock("../email.service", () => ({
  sendEmail: () => {
    state.emailCalls += 1;
    return Promise.resolve();
  },
}));

import { startEmailMfa, verifyEmailMfa } from "../mfa.service";

beforeEach(() => {
  state.rpcResult = { data: null, error: null };
  state.refreshResult = { data: { user: null, session: null }, error: null };
  state.rpcCalls = [];
  state.emailCalls = 0;
});

describe("startEmailMfa", () => {
  it("crea el pending_login, envía el correo y devuelve el ticket", async () => {
    state.rpcResult = { data: "ticket-123", error: null };

    const ticket = await startEmailMfa({ userId: "u1", email: "a@b.com", refreshToken: "rt" });

    expect(ticket).toBe("ticket-123");
    expect(state.emailCalls).toBe(1);
    expect(state.rpcCalls[0]?.fn).toBe("crear_pending_login");
  });

  it("lanza 500 y NO envía correo si la RPC falla", async () => {
    state.rpcResult = { data: null, error: { message: "boom" } };

    await expect(
      startEmailMfa({ userId: "u1", email: "a@b.com", refreshToken: "rt" }),
    ).rejects.toMatchObject({ statusCode: 500 });
    expect(state.emailCalls).toBe(0);
  });
});

describe("verifyEmailMfa", () => {
  it("devuelve la sesión cuando el código es correcto", async () => {
    state.rpcResult = { data: "stored-refresh", error: null };
    state.refreshResult = {
      data: { user: { id: "u1" }, session: { access_token: "a", refresh_token: "r" } },
      error: null,
    };

    const result = await verifyEmailMfa("ticket-123", "123456");

    expect(result).toMatchObject({ user: { id: "u1" }, session: { access_token: "a" } });
    expect(state.rpcCalls[0]?.fn).toBe("consumir_pending_login");
  });

  it("lanza 401 si el código es inválido o expiró (RPC devuelve null)", async () => {
    state.rpcResult = { data: null, error: null };

    await expect(verifyEmailMfa("ticket-123", "000000")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

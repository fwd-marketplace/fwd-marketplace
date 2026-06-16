import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Estado compartido del mock: la respuesta que devolverá `refreshSession` del
 * cliente Supabase efímero, y un contador de llamadas a `signOut`.
 */
const { state } = vi.hoisted(() => ({
  state: {
    refreshResult: { data: { user: null, session: null }, error: null } as {
      data: { user: unknown; session: unknown };
      error: unknown;
    },
    verifyOtpResult: { data: { session: null }, error: null } as {
      data: { session: unknown };
      error: unknown;
    },
    updateUserResult: { error: null } as { error: unknown },
    signOutCalls: 0,
    updateUserCalls: 0,
  },
}));

vi.mock("../../config/supabase", () => ({
  supabase: {},
  supabaseForToken: () => ({}),
  createEphemeralClient: () => ({
    auth: {
      refreshSession: (_args: { refresh_token: string }) => Promise.resolve(state.refreshResult),
      signOut: () => {
        state.signOutCalls += 1;
        return Promise.resolve({ error: null });
      },
      verifyOtp: (_args: { token_hash: string; type: string }) =>
        Promise.resolve(state.verifyOtpResult),
      updateUser: (_args: { password: string }) => {
        state.updateUserCalls += 1;
        return Promise.resolve(state.updateUserResult);
      },
    },
  }),
}));

import { refreshSession, logoutUser, confirmPasswordReset } from "../user.service";

beforeEach(() => {
  state.refreshResult = { data: { user: null, session: null }, error: null };
  state.verifyOtpResult = { data: { session: null }, error: null };
  state.updateUserResult = { error: null };
  state.signOutCalls = 0;
  state.updateUserCalls = 0;
});

describe("refreshSession", () => {
  it("devuelve user + session cuando el refresh_token es válido", async () => {
    state.refreshResult = {
      data: {
        user: { id: "u1" },
        session: { access_token: "new-access", refresh_token: "new-refresh" },
      },
      error: null,
    };

    const result = await refreshSession("valid-refresh");

    expect(result).toMatchObject({
      user: { id: "u1" },
      session: { access_token: "new-access" },
    });
  });

  it("lanza 401 si el refresh_token es inválido o expiró", async () => {
    state.refreshResult = {
      data: { user: null, session: null },
      error: { status: 401, message: "Invalid Refresh Token" },
    };

    await expect(refreshSession("bad")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("lanza 401 si no hay error pero tampoco sesión", async () => {
    state.refreshResult = { data: { user: null, session: null }, error: null };

    await expect(refreshSession("bad")).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("logoutUser", () => {
  it("revoca la sesión (signOut) cuando el refresh_token es válido", async () => {
    state.refreshResult = {
      data: { user: { id: "u1" }, session: { access_token: "a", refresh_token: "r" } },
      error: null,
    };

    await logoutUser("valid-refresh");

    expect(state.signOutCalls).toBe(1);
  });

  it("es idempotente: no falla ni llama signOut si el token ya no sirve", async () => {
    state.refreshResult = {
      data: { user: null, session: null },
      error: { status: 401, message: "Invalid" },
    };

    await expect(logoutUser("bad")).resolves.toBeUndefined();
    expect(state.signOutCalls).toBe(0);
  });
});

describe("confirmPasswordReset", () => {
  it("actualiza la contraseña cuando el token de recovery es válido", async () => {
    state.verifyOtpResult = { data: { session: { access_token: "recovery" } }, error: null };
    state.updateUserResult = { error: null };

    await expect(confirmPasswordReset("token-ok", "nuevaClave123")).resolves.toBeUndefined();
    expect(state.updateUserCalls).toBe(1);
  });

  it("lanza 400 si el token es inválido/expiró (sin sesión)", async () => {
    state.verifyOtpResult = { data: { session: null }, error: { message: "invalid" } };

    await expect(confirmPasswordReset("bad", "nuevaClave123")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(state.updateUserCalls).toBe(0);
  });

  it("lanza 400 si updateUser falla", async () => {
    state.verifyOtpResult = { data: { session: { access_token: "recovery" } }, error: null };
    state.updateUserResult = { error: { message: "weak password" } };

    await expect(confirmPasswordReset("token-ok", "nuevaClave123")).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

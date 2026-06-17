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
    setSessionResult: { error: null } as { error: unknown },
    updateUserResult: { error: null } as { error: unknown },
    resetPasswordResult: { error: null } as { error: unknown },
    resetRedirectTo: "" as string,
    signOutCalls: 0,
    updateUserCalls: 0,
  },
}));

vi.mock("../../config/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (_email: string, opts: { redirectTo: string }) => {
        state.resetRedirectTo = opts.redirectTo;
        return Promise.resolve(state.resetPasswordResult);
      },
    },
  },
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
      setSession: (_args: { access_token: string; refresh_token: string }) =>
        Promise.resolve(state.setSessionResult),
      updateUser: (_args: { password: string }) => {
        state.updateUserCalls += 1;
        return Promise.resolve(state.updateUserResult);
      },
    },
  }),
}));

import {
  refreshSession,
  logoutUser,
  confirmPasswordReset,
  requestPasswordReset,
} from "../user.service";

beforeEach(() => {
  state.refreshResult = { data: { user: null, session: null }, error: null };
  state.verifyOtpResult = { data: { session: null }, error: null };
  state.setSessionResult = { error: null };
  state.updateUserResult = { error: null };
  state.resetPasswordResult = { error: null };
  state.resetRedirectTo = "";
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
  it("actualiza la contraseña con token_hash válido", async () => {
    state.verifyOtpResult = { data: { session: {} }, error: null };

    await expect(
      confirmPasswordReset({ tokenHash: "token-ok", password: "nuevaClave123" }),
    ).resolves.toBeUndefined();
    expect(state.updateUserCalls).toBe(1);
  });

  it("actualiza la contraseña con access_token + refresh_token (correo default)", async () => {
    state.setSessionResult = { error: null };

    await expect(
      confirmPasswordReset({ accessToken: "a", refreshToken: "r", password: "nuevaClave123" }),
    ).resolves.toBeUndefined();
    expect(state.updateUserCalls).toBe(1);
  });

  it("lanza 400 si el token_hash es inválido/expiró", async () => {
    state.verifyOtpResult = { data: { session: null }, error: { message: "invalid" } };

    await expect(
      confirmPasswordReset({ tokenHash: "bad", password: "nuevaClave123" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(state.updateUserCalls).toBe(0);
  });

  it("lanza 400 si la sesión (access/refresh) es inválida", async () => {
    state.setSessionResult = { error: { message: "invalid" } };

    await expect(
      confirmPasswordReset({ accessToken: "a", refreshToken: "r", password: "nuevaClave123" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(state.updateUserCalls).toBe(0);
  });

  it("lanza 400 si updateUser falla", async () => {
    state.verifyOtpResult = { data: { session: {} }, error: null };
    state.updateUserResult = { error: { message: "weak password" } };

    await expect(
      confirmPasswordReset({ tokenHash: "token-ok", password: "nuevaClave123" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("requestPasswordReset", () => {
  it("usa el locale 'es' por defecto cuando el FrontEnd no lo manda", async () => {
    await requestPasswordReset("user@example.com");

    expect(state.resetRedirectTo).toMatch(/\/es\/nueva-contrasena$/);
  });

  it("respeta el locale 'en' en el enlace del correo", async () => {
    await requestPasswordReset("user@example.com", "en");

    expect(state.resetRedirectTo).toMatch(/\/en\/nueva-contrasena$/);
  });

  it("cae a 'es' si el locale no está soportado", async () => {
    await requestPasswordReset("user@example.com", "fr");

    expect(state.resetRedirectTo).toMatch(/\/es\/nueva-contrasena$/);
  });

  it("lanza 502 si el proveedor de correo cae (error 5xx)", async () => {
    state.resetPasswordResult = { error: { status: 503, message: "smtp down" } };

    await expect(requestPasswordReset("user@example.com")).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("no revela si el correo existe: no lanza ante errores que no son 5xx", async () => {
    state.resetPasswordResult = { error: { status: 400, message: "rate limit" } };

    await expect(requestPasswordReset("user@example.com")).resolves.toBeUndefined();
  });
});

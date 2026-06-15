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
    signOutCalls: 0,
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
    },
  }),
}));

import { refreshSession, logoutUser } from "../user.service";

beforeEach(() => {
  state.refreshResult = { data: { user: null, session: null }, error: null };
  state.signOutCalls = 0;
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

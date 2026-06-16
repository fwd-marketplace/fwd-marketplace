import { describe, it, expect, beforeEach, vi } from "vitest";

/** Respuesta del query mínimo que hace el healthcheck. */
const { state } = vi.hoisted(() => ({
  state: { response: { error: null as unknown } },
}));

vi.mock("../../config/supabase", () => ({
  supabase: {
    from: () => {
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      Object.assign(builder, {
        select: chain,
        limit: () => Promise.resolve(state.response),
      });
      return builder;
    },
  },
}));

import { isDatabaseReachable } from "../health.service";

beforeEach(() => {
  state.response = { error: null };
});

describe("isDatabaseReachable", () => {
  it("devuelve true si la consulta responde sin error", async () => {
    state.response = { error: null };
    await expect(isDatabaseReachable()).resolves.toBe(true);
  });

  it("devuelve false si la consulta falla (conexión caída)", async () => {
    state.response = { error: { message: "fetch failed" } };
    await expect(isDatabaseReachable()).resolves.toBe(false);
  });
});
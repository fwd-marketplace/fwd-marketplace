import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, apiAuth, ApiError, SESSION_COOKIE, REFRESH_COOKIE } from "../api-client";

// Mock next/headers
vi.mock("next/headers", () => {
  const store = new Map<string, any>();
  return {
    cookies: vi.fn(() => ({
      get: (name: string) => store.get(name),
      set: (name: string, value: string, opts: any) => store.set(name, { value, ...opts }),
      delete: (name: string) => store.delete(name),
    })),
  };
});

describe("api-client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("apiAuth", () => {
    it("should throw ApiError if fetch returns 401 and no refresh token exists", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      } as Response);

      await expect(apiAuth("/protected")).rejects.toThrow("Unauthorized");
    });
  });
});

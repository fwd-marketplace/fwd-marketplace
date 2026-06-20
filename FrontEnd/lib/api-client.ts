import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const SESSION_COOKIE = "fwd_token";
export const REFRESH_COOKIE = "fwd_refresh";
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(res.status, body.error ?? "Error desconocido");
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiAuth<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  try {
    return await apiFetch<T>(path, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      const refreshToken = jar.get(REFRESH_COOKIE)?.value;
      if (!refreshToken) {
        jar.delete(SESSION_COOKIE);
        jar.delete(REFRESH_COOKIE);
        throw e;
      }

      const refreshRes = await fetch(`${BASE_URL}/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!refreshRes.ok) {
        jar.delete(SESSION_COOKIE);
        jar.delete(REFRESH_COOKIE);
        throw e;
      }

      const refreshData = await refreshRes.json();
      const newAccess = refreshData.session?.access_token;
      const newRefresh = refreshData.session?.refresh_token;

      if (newAccess && newRefresh) {
        jar.set(SESSION_COOKIE, newAccess, COOKIE_OPTS);
        jar.set(REFRESH_COOKIE, newRefresh, COOKIE_OPTS);

        return await apiFetch<T>(path, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${newAccess}`,
          },
        });
      } else {
        jar.delete(SESSION_COOKIE);
        jar.delete(REFRESH_COOKIE);
        throw e;
      }
    }
    throw e;
  }
}

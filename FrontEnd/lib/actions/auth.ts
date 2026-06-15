"use server";

import { cookies } from "next/headers";
import { apiFetch, apiAuth, ApiError, SESSION_COOKIE, REFRESH_COOKIE, COOKIE_OPTS } from "@/lib/api-client";
import {
  JuniorProfileSchema,
  EmpresaProfileSchema,
  EmprendedorProfileSchema,
} from "@/lib/validations/auth";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";

type ProfileData = {
  estado_cuenta: string;
  role: { nombre: string };
};

export type LoginResult = {
  role: string;
  estado_cuenta: string;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function registerUser(input: {
  email: string;
  password: string;
}): Promise<Result<void>> {
  try {
    const data = await apiFetch<{
      user: unknown;
      session: { access_token: string; refresh_token: string } | null;
    }>("/users/register", { method: "POST", body: JSON.stringify(input) });

    if (data.session?.access_token) {
      const jar = await cookies();
      jar.set(SESSION_COOKIE, data.session.access_token, COOKIE_OPTS);
      if (data.session.refresh_token) {
        jar.set(REFRESH_COOKIE, data.session.refresh_token, COOKIE_OPTS);
      }
    }
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<Result<LoginResult>> {
  try {
    const loginData = await apiFetch<{
      user: unknown;
      session: { access_token: string; refresh_token: string };
    }>("/users/login", { method: "POST", body: JSON.stringify(input) });

    const token = loginData.session?.access_token;
    const refreshToken = loginData.session?.refresh_token;
    if (!token) return err("No se recibió sesión del servidor");

    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, COOKIE_OPTS);
    if (refreshToken) {
      jar.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    }

    const meData = await apiFetch<{ user: unknown; profile: ProfileData | null }>(
      "/users/me",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!meData.profile) {
      return ok({ role: "none", estado_cuenta: "no_profile" });
    }

    return ok({
      role: meData.profile.role.nombre,
      estado_cuenta: meData.profile.estado_cuenta,
    });
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function logoutUser(): Promise<void> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  
  if (refreshToken) {
    try {
      await apiFetch("/users/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Ignoramos el error porque el logout es idempotente
    }
  }

  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export async function saveJuniorProfile(raw: unknown): Promise<Result<void>> {
  const parsed = JuniorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const d = parsed.data;
  try {
    await apiAuth("/users/onboarding/junior", {
      method: "POST",
      body: JSON.stringify({
        nombre:         d.nombre,
        apellido1:      d.apellido1,
        apellido2:      d.apellido2,
        cedula:         d.cedula,
        especializacion: d.specialization,
        modalidad:      d.modalities,
        disponibilidad: d.availability,
        tech_stack:     d.techStack,
        link_github:    d.githubUrl    ?? "",
        link_linkedin:  d.linkedinUrl  ?? "",
        link_portfolio: d.portfolioUrl ?? "",
        bio:            d.bio          ?? "",
      }),
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function saveEmpresaProfile(raw: unknown): Promise<Result<void>> {
  const parsed = EmpresaProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const d = parsed.data;
  try {
    await apiAuth("/users/onboarding/empresa", {
      method: "POST",
      body: JSON.stringify({
        tipo:           "empresa",
        nombre_empresa: d.companyName,
        sector:         d.sectors,
        descripcion:    d.description,
        datos_legales:  { ruc: d.cedulaJuridica, direccion: d.direccion },
        tipos_proyecto: d.projectTypes,
      }),
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function saveEmprendedorProfile(raw: unknown): Promise<Result<void>> {
  const parsed = EmprendedorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const d = parsed.data;
  try {
    await apiAuth("/users/onboarding/emprendedor", {
      method: "POST",
      body: JSON.stringify({
        tipo:            "emprendedor",
        nombre_proyecto: d.projectName,
        etapa:           d.stage,
        soporte_tecnico: d.neededSupport,
        presupuesto:     d.budget,
        descripcion:     d.description ?? "",
      }),
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

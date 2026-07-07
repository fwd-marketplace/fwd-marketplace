"use server";

import { cookies } from "next/headers";
import { apiFetch, apiAuth, ApiError, SESSION_COOKIE, REFRESH_COOKIE, COOKIE_OPTS } from "@/lib/api-client";
import {
  JuniorProfileSchema,
  EmpresaProfileSchema,
  EmprendedorProfileSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
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

/**
 * Paso 1 del login: valida email+contraseña. Con 2FA obligatorio, NO devuelve la
 * sesión: el BackEnd manda un código por correo y devuelve un `ticket`. El FE pide
 * el código y lo confirma con `verifyLoginOtp`.
 */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<Result<{ ticket: string }>> {
  try {
    const data = await apiFetch<{ mfa_required: boolean; ticket: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!data.ticket) return err("No se recibió el ticket de verificación");
    return ok({ ticket: data.ticket });
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

/**
 * Paso 2 del login: confirma el código de 2FA. Si es correcto, setea las cookies
 * httpOnly con la sesión y devuelve rol/estado para enrutar (igual que el login).
 */
export async function verifyLoginOtp(input: {
  ticket: string;
  code: string;
}): Promise<Result<LoginResult>> {
  try {
    const data = await apiFetch<{
      user: unknown;
      session: { access_token: string; refresh_token: string };
    }>("/users/login/verify-otp", { method: "POST", body: JSON.stringify(input) });

    const token = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;
    if (!token) return err("No se recibió sesión del servidor");

    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, COOKIE_OPTS);
    if (refreshToken) {
      jar.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    }

    const meData = await apiFetch<{ user: unknown; profile: ProfileData | null }>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

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

/** Pide al BackEnd la URL de autorización del provider para iniciar el login social. */
export async function startOAuth(
  provider: "google" | "github",
  locale: string,
): Promise<Result<{ url: string }>> {
  try {
    const data = await apiFetch<{ url: string }>(
      `/users/oauth/${provider}?locale=${encodeURIComponent(locale)}`,
    );
    return ok(data);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

/**
 * Completa el login social: valida la sesión que llegó en el fragment del
 * callback (vía /me), setea las cookies httpOnly y devuelve rol/estado para
 * enrutar. Si el usuario no tiene perfil (típico de Google), va a onboarding.
 */
export async function completeOAuth(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<Result<LoginResult>> {
  if (!input.accessToken || !input.refreshToken) {
    return err("No se recibió la sesión del proveedor");
  }
  try {
    // Valida el token y trae el perfil antes de setear las cookies.
    const meData = await apiFetch<{ user: unknown; profile: ProfileData | null }>("/users/me", {
      headers: { Authorization: `Bearer ${input.accessToken}` },
    });

    const jar = await cookies();
    jar.set(SESSION_COOKIE, input.accessToken, COOKIE_OPTS);
    jar.set(REFRESH_COOKIE, input.refreshToken, COOKIE_OPTS);

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

/** Paso 1: pide el correo de recuperación (con el enlace para definir la clave). */
export async function resetPassword(raw: unknown): Promise<Result<void>> {
  const parsed = ResetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  try {
    await apiFetch("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: parsed.data.email }),
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

/**
 * Paso 2: confirma la contraseña nueva con la sesión de recovery que trae el
 * enlace del correo. Los tokens los lee la página `/nueva-contrasena` del
 * fragment de la URL (no se pueden leer en el servidor) y los pasa aquí.
 */
export async function confirmResetPassword(input: {
  accessToken?: string;
  refreshToken?: string;
  tokenHash?: string;
  password: string;
  confirmPassword: string;
}): Promise<Result<void>> {
  const parsed = NewPasswordSchema.safeParse({
    password: input.password,
    confirmPassword: input.confirmPassword,
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const body: Record<string, string> = { password: parsed.data.password };
  if (input.tokenHash) {
    body.token_hash = input.tokenHash;
  } else if (input.accessToken && input.refreshToken) {
    body.access_token = input.accessToken;
    body.refresh_token = input.refreshToken;
  } else {
    return err("El enlace de recuperación es inválido o expiró");
  }

  try {
    await apiFetch("/users/reset-password/confirm", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return ok(undefined);
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
        cedula:          d.cedula,
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

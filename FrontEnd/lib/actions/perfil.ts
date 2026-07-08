"use server";

import { cookies } from "next/headers";
import {
  apiAuth,
  ApiError,
  BASE_URL,
  SESSION_COOKIE,
} from "@/lib/api-client";
import { ok, err, type Result } from "@/lib/result";
import type {
  StudentPerfilResponse,
  StudentProfileUpdate,
  EmpresarioUpdateInput,
  PortafolioItem,
} from "@/lib/api/types";

export async function updateEmpresarioProfile(
  input: EmpresarioUpdateInput,
): Promise<Result<void>> {
  if (Object.keys(input).length === 0) {
    return err("No hay cambios para guardar");
  }
  try {
    await apiAuth("/users/me/perfil", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function updateStudentProfile(
  input: StudentProfileUpdate,
): Promise<Result<StudentPerfilResponse>> {
  if (Object.keys(input).length === 0) {
    return err("No hay cambios para guardar");
  }
  try {
    const data = await apiAuth<{ perfil: StudentPerfilResponse }>("/users/me/perfil", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return ok(data.perfil);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function uploadEmpresarioLogo(
  formData: FormData,
): Promise<Result<{ url_logo: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("No se recibió ninguna imagen");
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return err("No autenticado");
  }

  const forwarded = new FormData();
  forwarded.append("file", file);

  try {
    const res = await fetch(`${BASE_URL}/users/me/perfil/logo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: forwarded,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return err(body.error ?? "No se pudo subir el logo");
    }
    const data = (await res.json()) as { url_logo: string };
    return ok(data);
  } catch {
    return err("Error de conexión");
  }
}

export async function deleteEmpresarioLogo(): Promise<Result<void>> {
  try {
    await apiAuth("/users/me/perfil/logo", { method: "DELETE" });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function deleteStudentAvatar(): Promise<Result<void>> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return err("No autenticado");

  try {
    const res = await fetch(`${BASE_URL}/users/me/perfil/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return err(body.error ?? "No se pudo eliminar la imagen");
    }
    return ok(undefined);
  } catch {
    return err("Error de conexión");
  }
}

export async function uploadStudentAvatar(
  formData: FormData,
): Promise<Result<{ url_avatar: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("No se recibió ninguna imagen");
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return err("No autenticado");
  }

  const forwarded = new FormData();
  forwarded.append("file", file);

  try {
    const res = await fetch(`${BASE_URL}/users/me/perfil/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: forwarded,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return err(body.error ?? "No se pudo subir la imagen");
    }
    const data = (await res.json()) as { perfil: { url_avatar: string } };
    return ok(data.perfil);
  } catch {
    return err("Error de conexión");
  }
}

export type PortafolioInput = {
  titulo: string;
  descripcion?: string | undefined;
  tecnologias?: string[] | undefined;
  url_demo?: string | undefined;
  url_repositorio?: string | undefined;
};

export async function createPortafolioItemAction(
  input: PortafolioInput,
): Promise<Result<PortafolioItem>> {
  try {
    const data = await apiAuth<{ item: PortafolioItem }>("/users/me/perfil/portafolio", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return ok(data.item);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function updatePortafolioItemAction(
  id: string,
  input: Partial<PortafolioInput>,
): Promise<Result<PortafolioItem>> {
  try {
    const data = await apiAuth<{ item: PortafolioItem }>(`/users/me/perfil/portafolio/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return ok(data.item);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

export async function deletePortafolioItemAction(id: string): Promise<Result<void>> {
  try {
    await apiAuth(`/users/me/perfil/portafolio/${id}`, { method: "DELETE" });
    return ok(undefined);
  } catch (e) {
    return err(e instanceof ApiError ? e.message : "Error de conexión");
  }
}

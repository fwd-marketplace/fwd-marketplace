import { ApiError, apiAuth, apiFetch } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type { ApiProject, MeResponse, PortafolioItem, PublicEmpresaProfile, PublicJuniorProfile } from "@/lib/api/types";

export async function getMe(): Promise<Result<MeResponse>> {
  try {
    return ok(await apiAuth<MeResponse>("/users/me"));
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export async function getMyPortafolio(): Promise<Result<PortafolioItem[]>> {
  try {
    const data = await apiAuth<{ items: PortafolioItem[] }>("/users/me/perfil/portafolio");
    return ok(data.items);
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export async function getPublicEmpresaProfile(id: string): Promise<Result<PublicEmpresaProfile>> {
  try {
    const data = await apiFetch<{ perfil: PublicEmpresaProfile }>(`/perfil/empresa/${id}`);
    return ok(data.perfil);
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export async function getPublicEmpresaProjects(id: string): Promise<Result<ApiProject[]>> {
  try {
    const data = await apiFetch<{ proyectos: ApiProject[] }>(`/perfil/empresa/${id}/proyectos`);
    return ok(data.proyectos);
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export async function getPublicJuniorProfile(id: string): Promise<Result<PublicJuniorProfile>> {
  try {
    const data = await apiFetch<{ perfil: PublicJuniorProfile }>(`/perfil/junior/${id}`);
    return ok(data.perfil);
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  AdminPendingUsersResponse,
  AdminProjectsResponse,
  AdminReportesResponse,
  AdminStudentsResponse,
} from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export function getPendingUsers(): Promise<Result<AdminPendingUsersResponse>> {
  return asResult(() => apiAuth<AdminPendingUsersResponse>("/admin/users/pending"));
}

export function getAdminProjects(): Promise<Result<AdminProjectsResponse>> {
  return asResult(() => apiAuth<AdminProjectsResponse>("/admin/projects"));
}

export function getAdminStudents(): Promise<Result<AdminStudentsResponse>> {
  return asResult(() => apiAuth<AdminStudentsResponse>("/admin/students"));
}

export function approveAdminUser(userId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/users/${userId}/aprobar`, { method: "PATCH" });
  });
}

export function rejectAdminUser(userId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/users/${userId}/rechazar`, { method: "PATCH" });
  });
}

export function suspendAdminUser(userId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/users/${userId}/suspender`, { method: "PATCH" });
  });
}

export function cancelAdminProject(projectId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/projects/${projectId}/cancelar`, { method: "PATCH" });
  });
}

export function getReportes(): Promise<Result<AdminReportesResponse>> {
  return asResult(() => apiAuth<AdminReportesResponse>("/admin/reportes"));
}

export function resolverReporte(
  reporteId: string,
  estado: "revisado" | "desestimado",
): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/reportes/${reporteId}/resolver`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  });
}

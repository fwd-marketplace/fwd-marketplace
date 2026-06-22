import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  AdminPendingUsersResponse,
  AdminProjectsResponse,
  AdminReportesResponse,
  AdminStudentsResponse,
  AdminUsersResponse,
  AdminUserDetailResponse,
  AdminUserMutationResponse,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  AdminCompaniesResponse,
  AdminCompanyMutationResponse,
  CreateAdminCompanyInput,
  UpdateAdminCompanyInput,
  AdminSettingsResponse,
  UpdateAdminSettingsInput,
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

export function getAllUsers(): Promise<Result<AdminUsersResponse>> {
  return asResult(() => apiAuth<AdminUsersResponse>("/admin/users"));
}

export function getAdminUserDetail(userId: string): Promise<Result<AdminUserDetailResponse>> {
  return asResult(() => apiAuth<AdminUserDetailResponse>(`/admin/users/${userId}`));
}

export function createAdminUser(input: CreateAdminUserInput): Promise<Result<AdminUserMutationResponse>> {
  return asResult(() =>
    apiAuth<AdminUserMutationResponse>("/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export function updateAdminUser(
  userId: string,
  input: UpdateAdminUserInput,
): Promise<Result<AdminUserMutationResponse>> {
  return asResult(() =>
    apiAuth<AdminUserMutationResponse>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export function deleteAdminUser(userId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/users/${userId}`, { method: "DELETE" });
  });
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

export function getAdminSettings(): Promise<Result<AdminSettingsResponse>> {
  return asResult(() => apiAuth<AdminSettingsResponse>("/admin/settings"));
}

export function updateAdminSettings(input: UpdateAdminSettingsInput): Promise<Result<AdminSettingsResponse>> {
  return asResult(() =>
    apiAuth<AdminSettingsResponse>("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export function getAllCompanies(): Promise<Result<AdminCompaniesResponse>> {
  return asResult(() => apiAuth<AdminCompaniesResponse>("/admin/companies"));
}

export function createAdminCompany(input: CreateAdminCompanyInput): Promise<Result<AdminCompanyMutationResponse>> {
  return asResult(() =>
    apiAuth<AdminCompanyMutationResponse>("/admin/companies", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export function updateAdminCompany(
  companyId: string,
  input: UpdateAdminCompanyInput,
): Promise<Result<AdminCompanyMutationResponse>> {
  return asResult(() =>
    apiAuth<AdminCompanyMutationResponse>(`/admin/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export function verifyAdminStudent(studentId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/students/${studentId}/verificar`, { method: "PATCH" });
  });
}

export function rejectAdminStudent(studentId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/admin/students/${studentId}/rechazar`, { method: "PATCH" });
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

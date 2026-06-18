import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  ApiProject,
  CatalogsResponse,
  CompanyProjectState,
  CreateProjectInput,
  MyOffersResponse,
  ProjectDetailResponse,
  ProjectOffer,
  ProjectOffersResponse,
  ProjectsResponse,
  SubmitOfferInput,
} from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

export function getCatalogs(): Promise<Result<CatalogsResponse>> {
  return asResult(() => apiAuth<CatalogsResponse>("/catalogs"));
}

export function getMyProjects(): Promise<Result<ProjectsResponse>> {
  return asResult(() => apiAuth<ProjectsResponse>("/projects/mias"));
}

export function getProjectOffers(projectId: string): Promise<Result<ProjectOffersResponse>> {
  return asResult(() => apiAuth<ProjectOffersResponse>(`/projects/${projectId}/ofertas`));
}

export function getMyOffers(): Promise<Result<MyOffersResponse>> {
  return asResult(() => apiAuth<MyOffersResponse>("/ofertas/mias"));
}

export function createProject(input: CreateProjectInput): Promise<Result<ProjectsResponse["projects"][number]>> {
  return asResult(async () => {
    const response = await apiAuth<{ project: ProjectsResponse["projects"][number] }>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.project;
  });
}

export function decideOffer(offerId: string, accion: "aceptar" | "rechazar"): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${offerId}`, {
      method: "PATCH",
      body: JSON.stringify({ accion }),
    });
  });
}

export function changeProjectState(projectId: string, estado: CompanyProjectState): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/projects/${projectId}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  });
}

export function getProjectById(id: string): Promise<Result<ApiProject>> {
  return asResult(async () => {
    const res = await apiAuth<ProjectDetailResponse>(`/projects/${id}`);
    return res.project;
  });
}

export function submitOffer(projectId: string, input: SubmitOfferInput): Promise<Result<ProjectOffer>> {
  return asResult(async () => {
    const res = await apiAuth<{ oferta: ProjectOffer }>(`/projects/${projectId}/ofertas`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.oferta;
  });
}

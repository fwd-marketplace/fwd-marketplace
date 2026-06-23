import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  AiLocale,
  ApiCalificacion,
  ApiProject,
  ApiRankedJunior,
  CalificarInput,
  CalificacionesResponse,
  CatalogsResponse,
  CompanyProjectState,
  CreateProjectInput,
  EditOfferInput,
  Entregable,
  EntregablesResponse,
  MyOffersResponse,
  ProjectDetailResponse,
  ProjectOffer,
  ProjectOffersResponse,
  ProjectsResponse,
  RankingResponse,
  ReplicaInput,
  ReviewOfferInput,
  SavedProjectIdsResponse,
  SavedProjectsResponse,
  SubmitEntregableInput,
  SubmitOfferInput,
  UpdateProjectInput,
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

export function createProject(
  input: CreateProjectInput,
  locale: AiLocale,
): Promise<Result<ProjectsResponse["projects"][number]>> {
  return asResult(async () => {
    const response = await apiAuth<{ project: ProjectsResponse["projects"][number] }>("/projects", {
      method: "POST",
      body: JSON.stringify({ ...input, locale }),
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

export function getProjects(): Promise<Result<ProjectsResponse>> {
  return asResult(() => apiAuth<ProjectsResponse>("/projects"));
}

export function getProjectById(id: string): Promise<Result<ApiProject>> {
  return asResult(async () => {
    const res = await apiAuth<ProjectDetailResponse>(`/projects/${id}`);
    return res.project;
  });
}

export function getMyEntregables(): Promise<Result<EntregablesResponse>> {
  return asResult(() => apiAuth<EntregablesResponse>("/entregables/mios"));
}

export function getProjectEntregables(projectId: string): Promise<Result<EntregablesResponse>> {
  return asResult(() => apiAuth<EntregablesResponse>(`/projects/${projectId}/entregables`));
}

export function submitEntregable(input: SubmitEntregableInput): Promise<Result<Entregable>> {
  return asResult(async () => {
    const res = await apiAuth<{ entregable: Entregable }>("/entregables", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.entregable;
  });
}

export function reviewEntregable(
  entregableId: string,
  accion: "revisar" | "aprobar" | "solicitar_cambios",
  comentario?: string,
): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/entregables/${entregableId}`, {
      method: "PATCH",
      body: JSON.stringify({ accion, ...(comentario ? { comentario } : {}) }),
    });
  });
}

export function calificarOferta(
  ofertaId: string,
  input: CalificarInput,
): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${ofertaId}/calificar`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  });
}

export function replicarCalificacion(
  ofertaId: string,
  input: ReplicaInput,
): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${ofertaId}/replica`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  });
}

export function getRanking(especialidad?: string): Promise<Result<ApiRankedJunior[]>> {
  return asResult(async () => {
    const params = especialidad ? `?especialidad=${especialidad}` : "";
    const res = await apiAuth<RankingResponse>(`/ranking${params}`);
    return res.juniors;
  });
}

export function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  locale: AiLocale,
): Promise<Result<ApiProject>> {
  return asResult(async () => {
    const res = await apiAuth<{ project: ApiProject }>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ ...input, locale }),
    });
    return res.project;
  });
}

export function getMyCalificaciones(): Promise<Result<ApiCalificacion[]>> {
  return asResult(async () => {
    const res = await apiAuth<CalificacionesResponse>("/ofertas/mis-calificaciones");
    return res.calificaciones;
  });
}

export function reviewOffer(offerId: string, input: ReviewOfferInput): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${offerId}/revisar`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  });
}

export function withdrawOffer(offerId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${offerId}/retirar`, { method: "DELETE" });
  });
}

export function editOffer(offerId: string, input: EditOfferInput): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/ofertas/${offerId}/editar`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
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

/** Cancela/oculta (soft) el proyecto propio: pasa a estado 'cancelado', reversible. */
export function cancelProject(projectId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/projects/${projectId}/cancelar`, { method: "PATCH" });
  });
}

/** Pausa temporalmente el proyecto propio: congela el plazo y lo oculta del marketplace. */
export function pauseProject(projectId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/projects/${projectId}/pausar`, { method: "PATCH" });
  });
}

/** Reactiva un proyecto pausado, volviéndolo al estado en_recepcion. */
export function resumeProject(projectId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/projects/${projectId}/reactivar`, { method: "PATCH" });
  });
}

/** Elimina definitivamente (hard) el proyecto propio. No se puede deshacer. */
export function deleteProject(projectId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/projects/${projectId}`, { method: "DELETE" });
  });
}

// ── Proyectos guardados ───────────────────────────────────────────────────────

export function getSavedProjects(): Promise<Result<SavedProjectsResponse>> {
  return asResult(() => apiAuth<SavedProjectsResponse>("/guardados"));
}

export function getSavedProjectIds(): Promise<Result<SavedProjectIdsResponse>> {
  return asResult(() => apiAuth<SavedProjectIdsResponse>("/guardados/ids"));
}

export function saveProject(proyectoId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/guardados/${proyectoId}`, { method: "POST" });
  });
}

export function unsaveProject(proyectoId: string): Promise<Result<void>> {
  return asResult(async () => {
    await apiAuth(`/guardados/${proyectoId}`, { method: "DELETE" });
  });
}

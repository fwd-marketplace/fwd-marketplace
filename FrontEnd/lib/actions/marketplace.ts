"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { BASE_URL, SESSION_COOKIE } from "@/lib/api-client";
import { toAiLocale } from "@/lib/api/ai-client";
import type { Result } from "@/lib/result";
import {
  calificarOferta,
  cancelProject,
  changeProjectState,
  createProject,
  decideOffer,
  deleteProject,
  editOffer,
  getCatalogs,
  getMyOffers,
  getMyProjects,
  getProjectById,
  getProjectEntregables,
  getProjectMatches,
  getProjectOffers,
  inviteToProject,
  getProjects,
  getSavedProjects,
  getSavedProjectIds,
  pauseProject,
  resumeProject,
  saveProject,
  unsaveProject,
  replicarCalificacion,
  reviewEntregable,
  reviewOffer,
  submitEntregable,
  submitOffer,
  updateProject,
  withdrawOffer,
} from "@/lib/api/marketplace";
import type {
  CalificarInput,
  CompanyProjectState,
  CreateProjectInput,
  EditOfferInput,
  ReplicaInput,
  ReviewOfferInput,
  SubmitEntregableInput,
  SubmitOfferInput,
  UpdateProjectInput,
} from "@/lib/api/types";

export async function getCatalogsAction() {
  return getCatalogs();
}

export async function createProjectAction(input: CreateProjectInput) {
  const locale = await getLocale();
  const result = await createProject(input, toAiLocale(locale));
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function updateProjectAction(projectId: string, input: UpdateProjectInput) {
  const locale = await getLocale();
  const result = await updateProject(projectId, input, toAiLocale(locale));
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function changeProjectStateAction(projectId: string, estado: CompanyProjectState) {
  const result = await changeProjectState(projectId, estado);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function cancelProjectAction(projectId: string) {
  const result = await cancelProject(projectId);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function pauseProjectAction(projectId: string) {
  const result = await pauseProject(projectId);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function resumeProjectAction(projectId: string) {
  const result = await resumeProject(projectId);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function deleteProjectAction(projectId: string) {
  const result = await deleteProject(projectId);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function decideOfferAction(offerId: string, accion: "aceptar" | "rechazar") {
  const result = await decideOffer(offerId, accion);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function reviewOfferAction(offerId: string, input: ReviewOfferInput) {
  const result = await reviewOffer(offerId, input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function getProjectOffersAction(projectId: string) {
  return getProjectOffers(projectId);
}

export async function getProjectMatchesAction(projectId: string) {
  return getProjectMatches(projectId);
}

export async function inviteToProjectAction(projectId: string, juniorUserId: string) {
  return inviteToProject(projectId, juniorUserId);
}

export async function submitOfferAction(projectId: string, input: SubmitOfferInput) {
  return submitOffer(projectId, input);
}

export async function submitEntregableAction(input: SubmitEntregableInput) {
  const result = await submitEntregable(input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function getProjectByIdAction(id: string) {
  return getProjectById(id);
}

export async function getProjectEntregablesAction(projectId: string) {
  return getProjectEntregables(projectId);
}

export async function reviewEntregableAction(
  entregableId: string,
  accion: "revisar" | "aprobar" | "solicitar_cambios",
  comentario?: string,
) {
  const result = await reviewEntregable(entregableId, accion, comentario);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function withdrawOfferAction(offerId: string) {
  const result = await withdrawOffer(offerId);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function editOfferAction(offerId: string, input: EditOfferInput) {
  const result = await editOffer(offerId, input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function calificarOfertaAction(ofertaId: string, input: CalificarInput) {
  const result = await calificarOferta(ofertaId, input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function replicarCalificacionAction(ofertaId: string, input: ReplicaInput) {
  const result = await replicarCalificacion(ofertaId, input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function getMyProjectsAction() {
  return getMyProjects();
}

export async function getProjectsAction() {
  return getProjects();
}

export async function getSavedProjectsAction() {
  return getSavedProjects();
}

export async function getSavedProjectIdsAction() {
  return getSavedProjectIds();
}

export async function saveProjectAction(proyectoId: string) {
  return saveProject(proyectoId);
}

export async function unsaveProjectAction(proyectoId: string) {
  return unsaveProject(proyectoId);
}

export async function getMyOffersAction() {
  return getMyOffers();
}

export async function uploadDocumentoAction(formData: FormData): Promise<Result<string>> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  try {
    const res = await fetch(`${BASE_URL}/upload/documento`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: body.error ?? "No se pudo subir el archivo" };
    }
    const data = await res.json() as { url: string };
    return { ok: true, data: data.url };
  } catch {
    return { ok: false, error: "Error al subir el archivo. Intentá de nuevo." };
  }
}

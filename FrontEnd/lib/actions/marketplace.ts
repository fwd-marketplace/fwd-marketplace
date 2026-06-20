"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { BASE_URL, SESSION_COOKIE } from "@/lib/api-client";
import type { Result } from "@/lib/result";
import {
  calificarOferta,
  changeProjectState,
  createProject,
  decideOffer,
  deleteProject,
  getCatalogs,
  getMyOffers,
  getMyProjects,
  getProjectById,
  getProjectEntregables,
  getProjectOffers,
  getProjects,
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
  const result = await createProject(input);
  if (result.ok) {
    revalidatePath("/");
  }
  return result;
}

export async function updateProjectAction(projectId: string, input: UpdateProjectInput) {
  const result = await updateProject(projectId, input);
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

export async function deleteProjectAction(projectId: string) {
  const result = await deleteProject(projectId);
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

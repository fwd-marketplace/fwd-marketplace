"use server";

import { revalidatePath } from "next/cache";
import {
  calificarOferta,
  cancelProject,
  changeProjectState,
  createProject,
  decideOffer,
  deleteProject,
  getMyOffers,
  getMyProjects,
  getProjectById,
  getProjectEntregables,
  getProjectOffers,
  getProjects,
  replicarCalificacion,
  reviewEntregable,
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
  SubmitEntregableInput,
  SubmitOfferInput,
  UpdateProjectInput,
} from "@/lib/api/types";

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

export async function cancelProjectAction(projectId: string) {
  const result = await cancelProject(projectId);
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

export async function getMyProjectsAction() {
  return getMyProjects();
}

export async function getProjectsAction() {
  return getProjects();
}

export async function getMyOffersAction() {
  return getMyOffers();
}

"use server";

import { revalidatePath } from "next/cache";
import {
  changeProjectState,
  createProject,
  decideOffer,
  getProjectById,
  getProjectEntregables,
  getProjectOffers,
  reviewEntregable,
  submitEntregable,
  submitOffer,
  updateProject,
  withdrawOffer,
} from "@/lib/api/marketplace";
import type {
  CompanyProjectState,
  CreateProjectInput,
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

export async function reviewEntregableAction(entregableId: string, accion: "revisar" | "aprobar") {
  const result = await reviewEntregable(entregableId, accion);
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

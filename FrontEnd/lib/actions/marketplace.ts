"use server";

import { revalidatePath } from "next/cache";
import {
  changeProjectState,
  createProject,
  decideOffer,
  getProjectOffers,
  submitOffer,
} from "@/lib/api/marketplace";
import type { CompanyProjectState, CreateProjectInput, SubmitOfferInput } from "@/lib/api/types";

export async function createProjectAction(input: CreateProjectInput) {
  const result = await createProject(input);
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

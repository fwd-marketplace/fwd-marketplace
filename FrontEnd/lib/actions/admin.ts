"use server";

import { revalidatePath } from "next/cache";
import {
  approveAdminUser,
  cancelAdminProject,
  createAdminCompany,
  createAdminUser,
  deleteAdminUser,
  getAdminUserDetail,
  rejectAdminStudent,
  rejectAdminUser,
  resolverReporte,
  suspendAdminUser,
  updateAdminCompany,
  updateAdminSettings,
  updateAdminUser,
  verifyAdminStudent,
} from "@/lib/api/admin";
import { getProjectById } from "@/lib/api/marketplace";
import type {
  CreateAdminCompanyInput,
  CreateAdminUserInput,
  UpdateAdminCompanyInput,
  UpdateAdminSettingsInput,
  UpdateAdminUserInput,
} from "@/lib/api/types";

export async function updateAdminSettingsAction(input: UpdateAdminSettingsInput) {
  const result = await updateAdminSettings(input);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function approveAdminUserAction(userId: string) {
  const result = await approveAdminUser(userId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function rejectAdminUserAction(userId: string) {
  const result = await rejectAdminUser(userId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function suspendAdminUserAction(userId: string) {
  const result = await suspendAdminUser(userId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function getAdminUserDetailAction(userId: string) {
  return getAdminUserDetail(userId);
}

export async function createAdminUserAction(input: CreateAdminUserInput) {
  const result = await createAdminUser(input);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function updateAdminUserAction(userId: string, input: UpdateAdminUserInput) {
  const result = await updateAdminUser(userId, input);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function deleteAdminUserAction(userId: string) {
  const result = await deleteAdminUser(userId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function cancelAdminProjectAction(projectId: string) {
  const result = await cancelAdminProject(projectId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function getAdminProjectDetailAction(projectId: string) {
  return getProjectById(projectId);
}

export async function createAdminCompanyAction(input: CreateAdminCompanyInput) {
  const result = await createAdminCompany(input);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function updateAdminCompanyAction(companyId: string, input: UpdateAdminCompanyInput) {
  const result = await updateAdminCompany(companyId, input);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function verifyAdminStudentAction(studentId: string) {
  const result = await verifyAdminStudent(studentId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function rejectAdminStudentAction(studentId: string) {
  const result = await rejectAdminStudent(studentId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function resolverReporteAction(
  reporteId: string,
  estado: "revisado" | "desestimado",
) {
  const result = await resolverReporte(reporteId, estado);
  if (result.ok) revalidatePath("/");
  return result;
}

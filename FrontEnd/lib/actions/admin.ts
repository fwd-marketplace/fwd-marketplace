"use server";

import { revalidatePath } from "next/cache";
import {
  approveAdminUser,
  cancelAdminProject,
  rejectAdminUser,
  suspendAdminUser,
} from "@/lib/api/admin";

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

export async function cancelAdminProjectAction(projectId: string) {
  const result = await cancelAdminProject(projectId);
  if (result.ok) revalidatePath("/");
  return result;
}

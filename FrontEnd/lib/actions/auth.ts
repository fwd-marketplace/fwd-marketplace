"use server";

import type { JuniorProfile, EmpresaProfile, EmprendedorProfile } from "@/lib/validations/auth";
import { JuniorProfileSchema, EmpresaProfileSchema, EmprendedorProfileSchema } from "@/lib/validations/auth";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function saveJuniorProfile(
  raw: unknown
): Promise<ActionResult<JuniorProfile>> {
  const parsed = JuniorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  // TODO(issue-1): persist to Supabase once auth session is available
  return { success: true, data: parsed.data };
}

export async function saveEmpresaProfile(
  raw: unknown
): Promise<ActionResult<EmpresaProfile>> {
  const parsed = EmpresaProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  // TODO(issue-1): persist to Supabase once auth session is available
  return { success: true, data: parsed.data };
}

export async function saveEmprendedorProfile(
  raw: unknown
): Promise<ActionResult<EmprendedorProfile>> {
  const parsed = EmprendedorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  // TODO(issue-1): persist to Supabase once auth session is available
  return { success: true, data: parsed.data };
}

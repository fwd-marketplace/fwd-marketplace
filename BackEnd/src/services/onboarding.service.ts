import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { Database } from "../types/database.types";
import type {
  JuniorOnboarding,
  EmpresaOnboarding,
  EmprendedorOnboarding,
} from "../validations/onboarding";

type Client = SupabaseClient<Database>;

/** Resultado común del onboarding: el usuario queda pendiente de aprobación. */
type OnboardingResult = { role: "student" | "company"; estado_cuenta: "pendiente" };

/** Devuelve el id de un rol por nombre, o 500 si falta el seed. */
async function getRoleId(client: Client, nombre: string): Promise<string> {
  const { data, error } = await client
    .from("roles")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(500, `Falta el rol '${nombre}' (seeds no aplicados)`);
  return data.id;
}

/** Evita re-onboarding: si ya hay fila en users para este id, 409. */
async function ensureNotOnboarded(client: Client, userId: string): Promise<void> {
  const { data, error } = await client
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (data) throw new ApiError(409, "Este usuario ya completó el onboarding");
}

/**
 * Crea la fila base en `users` con rol y estado 'pendiente' (default de la BD).
 * Para empresa/emprendedor, apellido y cédula quedan nulos y `nombre` es el
 * nombre comercial / del proyecto.
 */
async function createUserRow(
  client: Client,
  userId: string,
  correo: string,
  idRol: string,
  nombre: string,
  personal?: { apellido1: string; apellido2: string | null; cedula: string },
): Promise<void> {
  const { error } = await client.from("users").insert({
    id: userId,
    correo,
    id_rol: idRol,
    nombre,
    ...(personal
      ? { apellido1: personal.apellido1, apellido2: personal.apellido2, cedula: personal.cedula }
      : {}),
  });
  if (error) throw new ApiError(400, error.message);
}

/** Vincula el tech_stack (nombres libres) con el catálogo `skills` (match por nombre). */
async function linkStudentSkills(
  client: Client,
  estudianteId: string,
  techStack: string[],
): Promise<void> {
  const { data: skills, error } = await client.from("skills").select("id, nombre");
  if (error) throw new ApiError(500, error.message);

  const idByName = new Map(skills.map((s) => [s.nombre.toLowerCase(), s.id]));
  const skillIds = [
    ...new Set(
      techStack
        .map((tech) => idByName.get(tech.toLowerCase()))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (skillIds.length === 0) return; // ninguna coincidió con el catálogo

  const { error: linkError } = await client
    .from("student_skills")
    .insert(skillIds.map((id_skill) => ({ id_estudiante: estudianteId, id_skill })));
  if (linkError) throw new ApiError(400, linkError.message);
}

/** Onboarding del junior: users (pendiente) + estudiante + student_skills. */
export async function onboardJunior(
  accessToken: string,
  userId: string,
  correo: string,
  input: JuniorOnboarding,
): Promise<OnboardingResult> {
  const client = supabaseForToken(accessToken);
  await ensureNotOnboarded(client, userId);

  const studentRoleId = await getRoleId(client, "student");
  await createUserRow(client, userId, correo, studentRoleId, input.nombre, {
    apellido1: input.apellido1,
    apellido2: input.apellido2 ?? null,
    cedula: input.cedula,
  });

  const { data: estudiante, error } = await client
    .from("estudiante")
    .insert({
      id_usuario: userId,
      especialidad: input.especializacion,
      modalidad_preferida: JSON.stringify(input.modalidad),
      disponibilidad: input.disponibilidad,
      url_github: input.link_github || null,
      url_linkedin: input.link_linkedin || null,
      url_portfolio: input.link_portfolio || null,
      descripcion: input.bio ?? null,
    })
    .select("id")
    .single();
  if (error) throw new ApiError(400, error.message);

  await linkStudentSkills(client, estudiante.id, input.tech_stack);
  return { role: "student", estado_cuenta: "pendiente" };
}

/** Onboarding de empresa: users (pendiente) + empresario(tipo='empresa'). */
export async function onboardEmpresa(
  accessToken: string,
  userId: string,
  correo: string,
  input: EmpresaOnboarding,
): Promise<OnboardingResult> {
  const client = supabaseForToken(accessToken);
  await ensureNotOnboarded(client, userId);

  const companyRoleId = await getRoleId(client, "company");
  await createUserRow(client, userId, correo, companyRoleId, input.nombre_empresa);

  const { error } = await client.from("empresario").insert({
    id_usuario: userId,
    tipo: "empresa",
    nombre_comercial: input.nombre_empresa,
    sector: JSON.stringify(input.sector),
    descripcion: input.descripcion,
    cedula_juridica: input.datos_legales.ruc,
    direccion: input.datos_legales.direccion,
    tipos_proyecto: JSON.stringify(input.tipos_proyecto),
  });
  if (error) throw new ApiError(400, error.message);

  return { role: "company", estado_cuenta: "pendiente" };
}

/** Onboarding de emprendedor: users (pendiente) + empresario(tipo='emprendedor'). */
export async function onboardEmprendedor(
  accessToken: string,
  userId: string,
  correo: string,
  input: EmprendedorOnboarding,
): Promise<OnboardingResult> {
  const client = supabaseForToken(accessToken);
  await ensureNotOnboarded(client, userId);

  const companyRoleId = await getRoleId(client, "company");
  await createUserRow(client, userId, correo, companyRoleId, input.nombre_proyecto);

  const { error } = await client.from("empresario").insert({
    id_usuario: userId,
    tipo: "emprendedor",
    nombre_comercial: input.nombre_proyecto,
    etapa: input.etapa,
    apoyo_tecnico_necesario: JSON.stringify(input.soporte_tecnico),
    presupuesto: input.presupuesto,
    descripcion: input.descripcion ?? null,
  });
  if (error) throw new ApiError(400, error.message);

  return { role: "company", estado_cuenta: "pendiente" };
}

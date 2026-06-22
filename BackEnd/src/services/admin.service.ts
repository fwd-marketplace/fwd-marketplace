import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

/**
 * Lista los usuarios con la cuenta en 'pendiente' (a la espera de aprobación).
 * Solo un admin puede leerlos (RLS: `users_admin_ver_todos` via `is_admin()`).
 */
export async function listPendingUsers(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .select(
      "id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre), empresario:empresario(tipo)",
    )
    .eq("estado_cuenta", "pendiente")
    .order("fecha_registro", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Estados válidos de `users.estado_cuenta` (coincide con el CHECK de la BD). */
type EstadoCuenta = "activa" | "pendiente" | "suspendida" | "rechazada";

/**
 * Cambia el estado de una cuenta. Solo admin (RLS: `users_admin_editar_todos`
 * via `is_admin()`). 404 si el usuario no existe. Base de approve/reject/suspend.
 */
async function setAccountState(accessToken: string, targetUserId: string, estado: EstadoCuenta) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .update({ estado_cuenta: estado, updated_at: new Date().toISOString() })
    .eq("id", targetUserId)
    .select("id, estado_cuenta")
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Usuario no encontrado");
  return data;
}

/** Aprueba una cuenta: estado_cuenta -> 'activa'. */
export function approveUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "activa");
}

/** Rechaza una cuenta pendiente: estado_cuenta -> 'rechazada'. */
export function rejectUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "rechazada");
}

/** Suspende una cuenta activa: estado_cuenta -> 'suspendida'. */
export function suspendUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "suspendida");
}

/**
 * Lista todos los proyectos para moderación (incluye borradores).
 * Solo admin (RLS: `proyecto_admin_ver`).
 */
export async function listAllProjects(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("proyecto")
    .select(
      "id, titulo, fecha_publicacion, estado:estado_proyecto(nombre), empresa:empresario(nombre_comercial, tipo)",
    )
    .order("fecha_publicacion", { ascending: false, nullsFirst: false });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Modera un proyecto cancelándolo: estado -> 'cancelado'. Solo admin
 * (RLS: `proyecto_admin_moderar`). 404 si el proyecto no existe.
 */
export async function cancelProject(accessToken: string, projectId: string) {
  const client = supabaseForToken(accessToken);

  const { data: estado, error: estadoError } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", "cancelado")
    .maybeSingle();
  if (estadoError) throw new ApiError(500, estadoError.message);
  if (!estado) throw new ApiError(500, "Falta el estado 'cancelado' (seeds no aplicados)");

  const { data, error } = await client
    .from("proyecto")
    .update({ id_estado: estado.id })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Proyecto no encontrado");
  return data;
}

/**
 * Lista los estudiantes (egresados FWD) con la verificación 'pendiente', para que el
 * admin los revise. Solo admin (RLS: `estudiante_admin_ver` via `is_admin()`, 0019).
 * Trae el `titulo_fwd` auto-declarado y los datos del usuario para identificarlos.
 */
export async function listPendingStudents(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("estudiante")
    .select("id, titulo_fwd, estado_verificacion, usuario:users(id, nombre, apellido1, correo)")
    .eq("estado_verificacion", "pendiente")
    .order("id", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Lista TODOS los estudiantes (egresados FWD) con su info de perfil, para la vista
 * "Talento" del admin. Solo admin. Ver a todos requiere la política `estudiante_admin_ver`
 * (migración 0019); sin ella, el RLS solo deja ver los 'verificado'. Las skills se traen
 * aparte (mismo enfoque sin embeds anidados que el resto del código) en 2 consultas.
 */
export async function listAllStudents(accessToken: string) {
  const client = supabaseForToken(accessToken);

  const { data: estudiantes, error } = await client
    .from("estudiante")
    .select(
      "id, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, estado_verificacion, reputacion, url_avatar, usuario:users(id, nombre, apellido1, correo)",
    )
    .order("id", { ascending: true });
  if (error) throw new ApiError(500, error.message);

  const rows = estudiantes ?? [];
  if (rows.length === 0) return [];

  // Skills de todos los estudiantes en 2 idas y vueltas (sin N+1 ni embeds anidados).
  const ids = rows.map((e) => e.id);
  const { data: links, error: linksError } = await client
    .from("student_skills")
    .select("id_estudiante, id_skill")
    .in("id_estudiante", ids);
  if (linksError) throw new ApiError(500, linksError.message);

  const skillIds = [...new Set((links ?? []).map((l) => l.id_skill))];
  const nameById = new Map<string, string>();
  if (skillIds.length > 0) {
    const { data: skills, error: skillsError } = await client
      .from("skills")
      .select("id, nombre")
      .in("id", skillIds);
    if (skillsError) throw new ApiError(500, skillsError.message);
    for (const s of skills ?? []) nameById.set(s.id, s.nombre);
  }

  const skillsByStudent = new Map<string, string[]>();
  for (const link of links ?? []) {
    const nombre = nameById.get(link.id_skill);
    if (!nombre) continue;
    const list = skillsByStudent.get(link.id_estudiante) ?? [];
    list.push(nombre);
    skillsByStudent.set(link.id_estudiante, list);
  }

  return rows.map((e) => ({ ...e, skills: skillsByStudent.get(e.id) ?? [] }));
}

/** Estados de verificación que el admin puede fijar (no 'pendiente': eso es el default). */
type VerificationState = "verificado" | "rechazado";

/**
 * Fija la verificación de un estudiante. Solo admin (RLS: `estudiante_admin_verifica`
 * via `is_admin()`, 0019). 404 si no existe. Base de verify/reject.
 */
async function setStudentVerification(
  accessToken: string,
  estudianteId: string,
  estado: VerificationState,
) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("estudiante")
    .update({ estado_verificacion: estado })
    .eq("id", estudianteId)
    .select("id, estado_verificacion, titulo_fwd")
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Estudiante no encontrado");
  return data;
}

/** Verifica al egresado: estado_verificacion -> 'verificado' (lo hace visible a empresas). */
export function verifyStudent(accessToken: string, estudianteId: string) {
  return setStudentVerification(accessToken, estudianteId, "verificado");
}

/** Rechaza la verificación del egresado: estado_verificacion -> 'rechazado'. */
export function rejectStudent(accessToken: string, estudianteId: string) {
  return setStudentVerification(accessToken, estudianteId, "rechazado");
}

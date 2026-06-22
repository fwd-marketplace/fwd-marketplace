import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import type { CreateUserInput, UpdateUserInput } from "../validations/adminUser";
import type { CreateCompanyInput, UpdateCompanyInput } from "../validations/adminCompany";

/** Columnas del perfil de empresa que muestra/filtra la pantalla de gestión. */
const COMPANY_SELECT =
  "id, tipo, nombre_comercial, sector, etapa, descripcion, direccion, url_sitio_web, cantidad_empleados, modalidades, presupuesto, usuario:users(id, nombre, apellido1, correo, estado_cuenta, fecha_registro)";

/** Columnas que devuelve la lista/detalle base de un usuario (sin perfil anidado). */
const USER_BASE_SELECT =
  "id, nombre, apellido1, apellido2, cedula, correo, estado_cuenta, fecha_registro, role:roles(nombre)";

/**
 * Lista los usuarios con la cuenta en 'pendiente' (a la espera de aprobación).
 * Solo un admin puede leerlos (RLS: `users_admin_ver_todos` via `is_admin()`).
 */
export async function listPendingUsers(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .select("id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre)")
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
 * Lista TODOS los usuarios (no solo los pendientes) para la pantalla de gestión.
 * Solo admin (RLS: `users_admin_ver_todos` via `is_admin()`).
 */
export async function listAllUsers(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .select("id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre)")
    .order("fecha_registro", { ascending: false });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Nombres de las skills de un estudiante (catálogo `skills` vía `student_skills`). */
async function getStudentSkills(
  client: ReturnType<typeof supabaseForToken>,
  estudianteId: string,
): Promise<string[]> {
  const { data: links, error: linksError } = await client
    .from("student_skills")
    .select("id_skill")
    .eq("id_estudiante", estudianteId);
  if (linksError) throw new ApiError(500, linksError.message);

  const skillIds = (links ?? []).map((link) => link.id_skill);
  if (skillIds.length === 0) return [];

  const { data: skills, error: skillsError } = await client
    .from("skills")
    .select("nombre")
    .in("id", skillIds);
  if (skillsError) throw new ApiError(500, skillsError.message);

  return (skills ?? []).map((skill) => skill.nombre);
}

/**
 * Detalle completo de un usuario para el modal "Ver". Trae la fila `users` y, según
 * el rol, el perfil de `estudiante` (con skills) o `empresario`. Solo admin: las
 * políticas `users_admin_ver_todos`, `estudiante_admin_ver` y `empresario_ver_perfil`
 * dejan que un admin lea estos datos con su propia identidad.
 */
export async function getUserDetail(accessToken: string, targetUserId: string) {
  const client = supabaseForToken(accessToken);
  const { data: user, error } = await client
    .from("users")
    .select(USER_BASE_SELECT)
    .eq("id", targetUserId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!user) throw new ApiError(404, "Usuario no encontrado");

  if (user.role?.nombre === "student") {
    const { data: estudiante, error: estudianteError } = await client
      .from("estudiante")
      .select(
        "id, descripcion, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, estado_verificacion, reputacion, url_avatar, url_github, url_linkedin, url_portfolio",
      )
      .eq("id_usuario", targetUserId)
      .maybeSingle();
    if (estudianteError) throw new ApiError(500, estudianteError.message);
    if (!estudiante) return { ...user, estudiante: null, empresario: null };

    const skills = await getStudentSkills(client, estudiante.id);
    return { ...user, estudiante: { ...estudiante, skills }, empresario: null };
  }

  if (user.role?.nombre === "company") {
    const { data: empresario, error: empresarioError } = await client
      .from("empresario")
      .select("id, tipo, nombre_comercial, descripcion, sector, etapa, url_sitio_web")
      .eq("id_usuario", targetUserId)
      .maybeSingle();
    if (empresarioError) throw new ApiError(500, empresarioError.message);
    return { ...user, estudiante: null, empresario: empresario ?? null };
  }

  return { ...user, estudiante: null, empresario: null };
}

/** Resuelve el `id` de un rol a partir de su nombre. 400 si no existe (seeds). */
async function resolveRoleId(
  client: ReturnType<typeof supabaseAdmin>,
  roleName: string,
): Promise<string> {
  const { data: rol, error } = await client
    .from("roles")
    .select("id")
    .eq("nombre", roleName)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!rol) throw new ApiError(400, "El rol indicado no existe");
  return rol.id;
}

/**
 * Crea una cuenta de usuario desde el panel admin: solo cuenta base + rol. El perfil
 * (estudiante/empresario) lo completa después el propio usuario en el onboarding.
 * Usa el cliente service_role (bypassa RLS) porque crea identidades en Auth, una
 * acción de sistema. La cuenta queda 'activa' (la creó un admin, no necesita aprobación).
 * Requiere `SUPABASE_SERVICE_KEY`.
 */
export async function createUser(input: CreateUserInput) {
  if (!env.supabaseServiceKey) {
    throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: crear usuarios no está disponible");
  }
  const admin = supabaseAdmin();
  const roleId = await resolveRoleId(admin, input.rol);

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.correo,
    password: input.password,
    email_confirm: true,
  });
  if (authError || !created.user) {
    throw new ApiError(400, authError?.message ?? "No se pudo crear la cuenta en Auth");
  }
  const userId = created.user.id;

  const { data: row, error: insertError } = await admin
    .from("users")
    .insert({
      id: userId,
      correo: input.correo,
      nombre: input.nombre,
      apellido1: input.apellido1 ?? null,
      id_rol: roleId,
      estado_cuenta: "activa",
    })
    .select("id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre)")
    .maybeSingle();

  if (insertError || !row) {
    // Rollback: si el insert falla, se borra el auth user para no dejar huérfanos.
    await admin.auth.admin.deleteUser(userId);
    throw new ApiError(400, insertError?.message ?? "No se pudo crear el perfil de usuario");
  }
  return row;
}

/**
 * Edita los datos base de un usuario (nombre, apellidos, correo, rol, estado). Solo
 * admin (RLS: `users_admin_editar_todos`). Si cambia el correo, también se actualiza
 * en Auth con el cliente service_role para mantener login y fila sincronizados.
 * 404 si el usuario no existe.
 */
export async function updateUser(accessToken: string, targetUserId: string, input: UpdateUserInput) {
  const client = supabaseForToken(accessToken);

  const changes: {
    nombre?: string;
    apellido1?: string;
    apellido2?: string | null;
    correo?: string;
    estado_cuenta?: string;
    id_rol?: string;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };
  if (input.nombre !== undefined) changes.nombre = input.nombre;
  if (input.apellido1 !== undefined) changes.apellido1 = input.apellido1;
  if (input.apellido2 !== undefined) changes.apellido2 = input.apellido2;
  if (input.correo !== undefined) changes.correo = input.correo;
  if (input.estado_cuenta !== undefined) changes.estado_cuenta = input.estado_cuenta;
  if (input.rol !== undefined) {
    changes.id_rol = await resolveRoleId(supabaseAdmin(), input.rol);
  }

  const { data, error } = await client
    .from("users")
    .update(changes)
    .eq("id", targetUserId)
    .select("id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre)")
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Usuario no encontrado");

  if (input.correo !== undefined) {
    if (!env.supabaseServiceKey) {
      throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: no se pudo actualizar el correo en Auth");
    }
    const { error: authError } = await supabaseAdmin().auth.admin.updateUserById(targetUserId, {
      email: input.correo,
    });
    if (authError) throw new ApiError(400, authError.message);
  }

  return data;
}

/**
 * Elimina un usuario por completo. Borra la identidad en Auth con el cliente
 * service_role; la fila `public.users` y sus perfiles caen en cascada (FK
 * `ON DELETE CASCADE`). Un admin no puede borrarse a sí mismo. Requiere
 * `SUPABASE_SERVICE_KEY`.
 */
export async function deleteUser(adminUserId: string, targetUserId: string) {
  if (adminUserId === targetUserId) {
    throw new ApiError(400, "No podés eliminar tu propia cuenta de administrador");
  }
  if (!env.supabaseServiceKey) {
    throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: eliminar usuarios no está disponible");
  }
  const { error } = await supabaseAdmin().auth.admin.deleteUser(targetUserId);
  if (error) throw new ApiError(400, error.message);
}

/**
 * Lista todas las empresas (perfiles `empresario`) con su cuenta asociada, para la
 * pantalla de gestión y sus filtros. Solo admin: `empresario_ver_perfil` deja leer el
 * perfil a cualquier autenticado y `users_admin_ver_todos` la fila de usuario.
 */
export async function listAllCompanies(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("empresario")
    .select(COMPANY_SELECT)
    .order("id", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Crea una empresa desde el panel admin: cuenta base (Auth + `users` rol company) más
 * un perfil `empresario` mínimo (tipo + nombre comercial), de modo que aparezca de una
 * en el listado y sea editable. La cuenta queda 'activa'. Usa service_role (acción de
 * sistema que crea identidad en Auth e inserta saltando RLS). Requiere SUPABASE_SERVICE_KEY.
 */
export async function createCompany(input: CreateCompanyInput) {
  if (!env.supabaseServiceKey) {
    throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: crear empresas no está disponible");
  }
  const admin = supabaseAdmin();
  const roleId = await resolveRoleId(admin, "company");

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.correo,
    password: input.password,
    email_confirm: true,
  });
  if (authError || !created.user) {
    throw new ApiError(400, authError?.message ?? "No se pudo crear la cuenta en Auth");
  }
  const userId = created.user.id;

  const { error: userError } = await admin.from("users").insert({
    id: userId,
    correo: input.correo,
    nombre: input.nombre,
    apellido1: input.apellido1 ?? null,
    id_rol: roleId,
    estado_cuenta: "activa",
  });
  if (userError) {
    await admin.auth.admin.deleteUser(userId);
    throw new ApiError(400, userError.message);
  }

  const { data: company, error: companyError } = await admin
    .from("empresario")
    .insert({ id_usuario: userId, tipo: input.tipo, nombre_comercial: input.nombre_comercial, sector: input.sector ?? null })
    .select(COMPANY_SELECT)
    .maybeSingle();
  if (companyError || !company) {
    // Rollback total: borrar el auth user (cascada elimina la fila users).
    await admin.auth.admin.deleteUser(userId);
    throw new ApiError(400, companyError?.message ?? "No se pudo crear el perfil de empresa");
  }
  return company;
}

/**
 * Edita el perfil `empresario`. La política `empresario_editar_perfil` solo permite al
 * dueño, así que un admin usa service_role para saltar RLS. 404 si no existe.
 * Requiere SUPABASE_SERVICE_KEY.
 */
export async function updateCompany(empresarioId: string, input: UpdateCompanyInput) {
  if (!env.supabaseServiceKey) {
    throw new ApiError(500, "Falta SUPABASE_SERVICE_KEY: editar empresas no está disponible");
  }
  const changes: {
    tipo?: string;
    nombre_comercial?: string;
    sector?: string;
    etapa?: string;
    descripcion?: string;
    direccion?: string;
    url_sitio_web?: string;
    cantidad_empleados?: string;
  } = {};
  if (input.tipo !== undefined) changes.tipo = input.tipo;
  if (input.nombre_comercial !== undefined) changes.nombre_comercial = input.nombre_comercial;
  if (input.sector !== undefined) changes.sector = input.sector;
  if (input.etapa !== undefined) changes.etapa = input.etapa;
  if (input.descripcion !== undefined) changes.descripcion = input.descripcion;
  if (input.direccion !== undefined) changes.direccion = input.direccion;
  if (input.url_sitio_web !== undefined) changes.url_sitio_web = input.url_sitio_web;
  if (input.cantidad_empleados !== undefined) changes.cantidad_empleados = input.cantidad_empleados;

  const { data, error } = await supabaseAdmin()
    .from("empresario")
    .update(changes)
    .eq("id", empresarioId)
    .select(COMPANY_SELECT)
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Empresa no encontrada");
  return data;
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

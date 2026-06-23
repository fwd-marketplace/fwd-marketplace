import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { parseBody } from "../utils/parseBody";
import { uploadImage, destroyImageByUrl } from "./upload.service";
import type { Database } from "../types/database.types";
import {
  PerfilEstudianteSchema,
  PerfilEmpresarioSchema,
  type PerfilEstudianteInput,
  type PerfilEmpresarioInput,
} from "../validations/perfil";

type Client = ReturnType<typeof supabaseForToken>;
type UsersUpdate = Database["public"]["Tables"]["users"]["Update"];
type EstudianteUpdate = Database["public"]["Tables"]["estudiante"]["Update"];
type EmpresarioUpdate = Database["public"]["Tables"]["empresario"]["Update"];

const AVATAR_FOLDER = "fwd/avatars";
const LOGO_FOLDER = "fwd/logos";

/** Columnas que se devuelven tras editar cada perfil. */
const ESTUDIANTE_SELECT =
  "id, descripcion, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, estado_verificacion, url_avatar, url_github, url_linkedin, url_portfolio";
const EMPRESARIO_SELECT =
  "id, tipo, nombre_comercial, descripcion, sector, tipos_proyecto, apoyo_tecnico_necesario, cedula_juridica, direccion, url_sitio_web, etapa, presupuesto, cantidad_empleados, modalidades, horario, mision, vision, cultura, valores, contactos";

function toUserUpdate(input: PerfilEstudianteInput): UsersUpdate {
  const updates: UsersUpdate = {};
  if (input.nombre !== undefined) updates.nombre = input.nombre;
  if (input.apellido1 !== undefined) updates.apellido1 = input.apellido1;
  if (input.apellido2 !== undefined) updates.apellido2 = input.apellido2 || null;
  return updates;
}

/** Traduce los nombres FE del junior a columnas de `estudiante` (solo los enviados). */
function toEstudianteUpdate(input: PerfilEstudianteInput): EstudianteUpdate {
  const updates: EstudianteUpdate = {};
  if (input.bio !== undefined) updates.descripcion = input.bio;
  if (input.especializacion !== undefined) updates.especialidad = input.especializacion;
  if (input.titulo_fwd !== undefined) {
    updates.titulo_fwd = input.titulo_fwd;
    // El título FWD es auto-declarado; cambiarlo re-encola la verificación del admin
    // (vuelve a 'pendiente') para que nadie se "verifique" y luego cambie el dato.
    updates.estado_verificacion = "pendiente";
  }
  if (input.modalidad !== undefined) updates.modalidad_preferida = JSON.stringify(input.modalidad);
  if (input.disponibilidad !== undefined) updates.disponibilidad = input.disponibilidad;
  // Los links se guardan tal cual (cadena vacía = "sin link"); el Update generado
  // de url_github/url_linkedin no admite null, así que no convertimos "" a null.
  if (input.link_github !== undefined) updates.url_github = input.link_github;
  if (input.link_linkedin !== undefined) updates.url_linkedin = input.link_linkedin;
  if (input.link_portfolio !== undefined) updates.url_portfolio = input.link_portfolio;
  return updates;
}

async function syncStudentSkills(
  client: Client,
  estudianteId: string,
  names: string[],
): Promise<string[]> {
  const { data: catalog, error } = await client.from("skills").select("id, nombre");
  if (error) throw new ApiError(500, error.message);

  const catalogByLower = new Map((catalog ?? []).map((s) => [s.nombre.toLowerCase(), s]));
  const matched = new Map<string, string>(); // id → display name
  const toCreate: string[] = [];
  const seenKeys = new Set<string>();

  for (const name of names) {
    const normalized = name.trim().toLowerCase();
    if (!normalized || seenKeys.has(normalized)) continue;
    seenKeys.add(normalized);
    const existing = catalogByLower.get(normalized);
    if (existing) {
      matched.set(existing.id, existing.nombre);
    } else {
      toCreate.push(normalized);
    }
  }

  // Insertar skills nuevas en el catálogo usando service role (el catálogo es
  // una tabla de sistema; el token del usuario no tiene permiso de INSERT en ella).
  if (toCreate.length > 0) {
    const admin = supabaseAdmin();
    const { data: created, error: createError } = await admin
      .from("skills")
      .insert(toCreate.map((nombre) => ({ nombre, tipo: "tecnologia" as const })))
      .select("id, nombre");
    if (createError) {
      // Race condition: otro request ya insertó la misma skill; la buscamos.
      const { data: fetched } = await admin
        .from("skills")
        .select("id, nombre")
        .in("nombre", toCreate);
      for (const s of fetched ?? []) matched.set(s.id, s.nombre);
    } else {
      for (const s of created ?? []) matched.set(s.id, s.nombre);
    }
  }

  const { error: deleteError } = await client
    .from("student_skills")
    .delete()
    .eq("id_estudiante", estudianteId);
  if (deleteError) throw new ApiError(400, deleteError.message);

  if (matched.size > 0) {
    const rows = [...matched.keys()].map((id_skill) => ({ id_estudiante: estudianteId, id_skill }));
    const { error: insertError } = await client.from("student_skills").insert(rows);
    if (insertError) throw new ApiError(400, insertError.message);
  }

  return [...matched.values()];
}

/**
 * Sincroniza los conocimientos adicionales (no técnicos) del estudiante. A
 * diferencia de las skills, NO se filtra contra un catálogo: se guarda el nombre
 * tal cual (normalizado) para que las entradas libres ("otro") también persistan
 * y cuenten para el match. Se normaliza (trim + espacios colapsados) y se
 * deduplica sin distinguir mayúsculas para evitar repetidos.
 */
async function syncStudentConocimientos(
  client: Client,
  estudianteId: string,
  names: string[],
): Promise<string[]> {
  const byKey = new Map<string, string>();
  for (const raw of names) {
    const nombre = raw.trim().replace(/\s+/g, " ");
    if (!nombre) continue;
    const key = nombre.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, nombre);
  }

  const { error: deleteError } = await client
    .from("estudiante_conocimiento")
    .delete()
    .eq("id_estudiante", estudianteId);
  if (deleteError) throw new ApiError(400, deleteError.message);

  if (byKey.size > 0) {
    const rows = [...byKey.values()].map((nombre) => ({ id_estudiante: estudianteId, nombre }));
    const { error: insertError } = await client.from("estudiante_conocimiento").insert(rows);
    if (insertError) throw new ApiError(400, insertError.message);
  }

  return [...byKey.values()];
}

async function updateEstudiante(client: Client, userId: string, body: unknown) {
  const input = parseBody(PerfilEstudianteSchema, body);

  const userUpdates = toUserUpdate(input);
  if (Object.keys(userUpdates).length > 0) {
    const { error } = await client.from("users").update(userUpdates).eq("id", userId);
    if (error) throw new ApiError(400, error.message);
  }

  const estudianteUpdates = toEstudianteUpdate(input);
  const result =
    Object.keys(estudianteUpdates).length > 0
      ? await client
          .from("estudiante")
          .update(estudianteUpdates)
          .eq("id_usuario", userId)
          .select(ESTUDIANTE_SELECT)
          .maybeSingle()
      : await client
          .from("estudiante")
          .select(ESTUDIANTE_SELECT)
          .eq("id_usuario", userId)
          .maybeSingle();
  if (result.error) throw new ApiError(400, result.error.message);
  const estudiante = result.data;
  if (!estudiante) throw new ApiError(404, "No tenés un perfil de estudiante");

  let enriched: Record<string, unknown> = estudiante;
  if (input.skills !== undefined) {
    const skills = await syncStudentSkills(client, estudiante.id, input.skills);
    enriched = { ...enriched, skills };
  }
  if (input.conocimientos !== undefined) {
    const conocimientos = await syncStudentConocimientos(client, estudiante.id, input.conocimientos);
    enriched = { ...enriched, conocimientos };
  }

  return enriched;
}

/** Traduce los nombres FE de empresa/emprendedor a columnas de `empresario`. */
function toEmpresarioUpdate(input: PerfilEmpresarioInput): EmpresarioUpdate {
  const updates: EmpresarioUpdate = {};
  if (input.nombre_comercial !== undefined) updates.nombre_comercial = input.nombre_comercial;
  if (input.descripcion !== undefined) updates.descripcion = input.descripcion;
  if (input.sector !== undefined) updates.sector = JSON.stringify(input.sector);
  if (input.tipos_proyecto !== undefined) {
    updates.tipos_proyecto = JSON.stringify(input.tipos_proyecto);
  }
  if (input.soporte_tecnico !== undefined) {
    updates.apoyo_tecnico_necesario = JSON.stringify(input.soporte_tecnico);
  }
  if (input.ruc !== undefined) updates.cedula_juridica = input.ruc;
  if (input.direccion !== undefined) updates.direccion = input.direccion;
  if (input.url_sitio_web !== undefined) updates.url_sitio_web = input.url_sitio_web || null;
  if (input.etapa !== undefined) updates.etapa = input.etapa;
  if (input.presupuesto !== undefined) updates.presupuesto = input.presupuesto;
  if (input.mision !== undefined) updates.mision = input.mision;
  if (input.vision !== undefined) updates.vision = input.vision;
  if (input.cultura !== undefined) updates.cultura = input.cultura;
  if (input.valores !== undefined) updates.valores = JSON.stringify(input.valores);
  if (input.contactos !== undefined) updates.contactos = JSON.stringify(input.contactos);
  if (input.cantidad_empleados !== undefined) updates.cantidad_empleados = input.cantidad_empleados;
  if (input.modalidades !== undefined) updates.modalidades = JSON.stringify(input.modalidades);
  if (input.horario !== undefined) updates.horario = input.horario;
  return updates;
}

/**
 * Devuelve el perfil propio del usuario para precargar el formulario de edición:
 * el junior su fila `estudiante`, la empresa o emprendedor su fila `empresario`.
 * Mismas columnas que devuelve `updateMyPerfil`. El RLS de lectura del propio
 * perfil (`estudiante_ver_perfil` / `empresario_ver_perfil`) ya lo permite.
 */
export async function getMyPerfil(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);

  const { data: cuenta, error: cuentaError } = await client
    .from("users")
    .select("role:roles(nombre)")
    .eq("id", userId)
    .maybeSingle();
  if (cuentaError) throw new ApiError(500, cuentaError.message);
  if (!cuenta) throw new ApiError(403, "Completá tu onboarding antes de ver tu perfil");

  const rol = cuenta.role?.nombre;

  if (rol === "student") {
    const { data, error } = await client
      .from("estudiante")
      .select(ESTUDIANTE_SELECT)
      .eq("id_usuario", userId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "No tenés un perfil de estudiante");
    return data;
  }

  if (rol === "company") {
    const { data, error } = await client
      .from("empresario")
      .select(EMPRESARIO_SELECT)
      .eq("id_usuario", userId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "No tenés un perfil de empresa");
    return data;
  }

  throw new ApiError(403, "Tu rol no tiene un perfil editable");
}

/**
 * El usuario edita su propio perfil: el junior su fila `estudiante`, la empresa
 * o emprendedor su fila `empresario`. La validación depende del rol (que vive en
 * la BD, no en el body), por eso se resuelve el rol primero y luego se valida el
 * body con el schema correspondiente. El RLS (`estudiante_editar_perfil` /
 * `empresario_editar_perfil`, ambos `id_usuario = auth.uid()`) garantiza que solo
 * se edite el perfil propio.
 */
export async function updateMyPerfil(accessToken: string, userId: string, body: unknown) {
  const client = supabaseForToken(accessToken);

  const { data: cuenta, error: cuentaError } = await client
    .from("users")
    .select("role:roles(nombre)")
    .eq("id", userId)
    .maybeSingle();
  if (cuentaError) throw new ApiError(500, cuentaError.message);
  if (!cuenta) throw new ApiError(403, "Completá tu onboarding antes de editar tu perfil");

  const rol = cuenta.role?.nombre;

  if (rol === "student") {
    return updateEstudiante(client, userId, body);
  }

  if (rol === "company") {
    const updates = toEmpresarioUpdate(parseBody(PerfilEmpresarioSchema, body));
    const { data, error } = await client
      .from("empresario")
      .update(updates)
      .eq("id_usuario", userId)
      .select(EMPRESARIO_SELECT)
      .maybeSingle();
    if (error) throw new ApiError(400, error.message);
    if (!data) throw new ApiError(404, "No tenés un perfil de empresa");
    // No se realizan consultas externas aquí.

    return data;
  }

  throw new ApiError(403, "Tu rol no tiene un perfil editable");
}

export async function uploadMyLogo(
  accessToken: string,
  userId: string,
  fileBuffer: Buffer,
  fileSize: number,
): Promise<{ url_logo: string }> {
  const url = await uploadImage(fileBuffer, LOGO_FOLDER);

  const client = supabaseForToken(accessToken);

  const { data: empresario, error: empError } = await client
    .from("empresario")
    .select("id")
    .eq("id_usuario", userId)
    .maybeSingle();
  if (empError) throw new ApiError(500, empError.message);
  if (!empresario) throw new ApiError(404, "No tenés un perfil de empresa");

  // Logo(s) anterior(es): se leen antes de borrar para liberar su asset en Cloudinary.
  const { data: logosPrevios } = await client
    .from("files")
    .select("storage_path")
    .eq("id_empresario", empresario.id)
    .eq("tipo", "logo");

  const { error: deleteError } = await client
    .from("files")
    .delete()
    .eq("id_empresario", empresario.id)
    .eq("tipo", "logo");
  if (deleteError) throw new ApiError(400, deleteError.message);

  const { error: insertError } = await client.from("files").insert({
    id_empresario: empresario.id,
    tipo: "logo",
    tamano: fileSize,
    storage_path: url,
  });
  if (insertError) throw new ApiError(400, insertError.message);

  // Best-effort: liberar los assets viejos de Cloudinary (no bloquea la respuesta).
  for (const previo of logosPrevios ?? []) destroyImageByUrl(previo.storage_path);

  return { url_logo: url };
}

export async function deleteMyLogo(accessToken: string, userId: string): Promise<void> {
  const client = supabaseForToken(accessToken);

  const { data: empresario, error: empError } = await client
    .from("empresario")
    .select("id")
    .eq("id_usuario", userId)
    .maybeSingle();
  if (empError) throw new ApiError(500, empError.message);
  if (!empresario) throw new ApiError(404, "No tenés un perfil de empresa");

  // Logo(s) a borrar: se leen antes para liberar su asset en Cloudinary.
  const { data: logosPrevios } = await client
    .from("files")
    .select("storage_path")
    .eq("id_empresario", empresario.id)
    .eq("tipo", "logo");

  const { error } = await client
    .from("files")
    .delete()
    .eq("id_empresario", empresario.id)
    .eq("tipo", "logo");
  if (error) throw new ApiError(400, error.message);

  // Best-effort: liberar los assets viejos de Cloudinary.
  for (const previo of logosPrevios ?? []) destroyImageByUrl(previo.storage_path);
}

/**
 * Guarda las preferencias de notificación del usuario.
 * El campo `preferencias_notificacion` es de tipo Json en Supabase; se castea
 * a Record<string, boolean> porque el schema de la tabla lo define como un
 * mapa de claves booleanas de preferencias del usuario.
 */
export async function savePreferenciasNotificacion(
  accessToken: string,
  userId: string,
  preferencias: Record<string, boolean>,
): Promise<{ ok: true }> {
  const client = supabaseForToken(accessToken);
  const { error } = await client
    .from("users")
    .update({
      // Cast justificado: el campo Json de Supabase almacena un objeto de preferencias
      // booleanas; el tipo generado es Json (union de primitivos), pero en la práctica
      // siempre es Record<string, boolean> según el schema de la BD.
      preferencias_notificacion: preferencias as unknown as import("../types/database.types").Json,
    })
    .eq("id", userId);
  if (error) throw new ApiError(400, error.message);
  return { ok: true };
}

export async function removeMyAvatar(accessToken: string, userId: string): Promise<void> {
  const client = supabaseForToken(accessToken);

  const { data: previo } = await client
    .from("estudiante")
    .select("url_avatar")
    .eq("id_usuario", userId)
    .maybeSingle();

  const { error } = await client
    .from("estudiante")
    .update({ url_avatar: null })
    .eq("id_usuario", userId);
  if (error) throw new ApiError(400, error.message);

  if (previo?.url_avatar) destroyImageByUrl(previo.url_avatar);
}

// ── Portafolio de proyectos del estudiante ────────────────────────────────────

const PORTAFOLIO_SELECT = "id, titulo, descripcion, tecnologias, url_demo, url_repositorio, visibilidad, fecha";

async function getEstudianteId(client: Client, userId: string): Promise<string> {
  const { data, error } = await client
    .from("estudiante")
    .select("id")
    .eq("id_usuario", userId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "No tenés un perfil de estudiante");
  return data.id;
}

export async function getMyPortafolio(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const estudianteId = await getEstudianteId(client, userId);
  const { data, error } = await client
    .from("portafolio_proyecto")
    .select(PORTAFOLIO_SELECT)
    .eq("id_estudiante", estudianteId)
    .order("fecha", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

export async function createPortafolioItem(
  accessToken: string,
  userId: string,
  body: unknown,
) {
  const input = parsePortafolioBody(body);
  const client = supabaseForToken(accessToken);
  const estudianteId = await getEstudianteId(client, userId);
  if (!input.titulo) throw new ApiError(400, "titulo requerido");
  const { data, error } = await client
    .from("portafolio_proyecto")
    .insert({
      id_estudiante: estudianteId,
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      tecnologias: input.tecnologias ? JSON.stringify(input.tecnologias) : null,
      url_demo: input.url_demo ?? null,
      url_repositorio: input.url_repositorio ?? null,
      visibilidad: "publico",
      fecha: new Date().toISOString().slice(0, 10),
    })
    .select(PORTAFOLIO_SELECT)
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

export async function updatePortafolioItem(
  accessToken: string,
  userId: string,
  itemId: string,
  body: unknown,
) {
  const input = parsePortafolioBody(body);
  const client = supabaseForToken(accessToken);
  const estudianteId = await getEstudianteId(client, userId);
  type PortafolioUpdate = Database["public"]["Tables"]["portafolio_proyecto"]["Update"];
  const updates: PortafolioUpdate = {};
  if (input.titulo !== undefined) updates.titulo = input.titulo;
  if (input.descripcion !== undefined) updates.descripcion = input.descripcion ?? null;
  if (input.tecnologias !== undefined) updates.tecnologias = JSON.stringify(input.tecnologias);
  if (input.url_demo !== undefined) updates.url_demo = input.url_demo ?? null;
  if (input.url_repositorio !== undefined) updates.url_repositorio = input.url_repositorio ?? null;
  const { data, error } = await client
    .from("portafolio_proyecto")
    .update(updates)
    .eq("id", itemId)
    .eq("id_estudiante", estudianteId)
    .select(PORTAFOLIO_SELECT)
    .single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Proyecto no encontrado");
  return data;
}

export async function deletePortafolioItem(
  accessToken: string,
  userId: string,
  itemId: string,
) {
  const client = supabaseForToken(accessToken);
  const estudianteId = await getEstudianteId(client, userId);
  const { error } = await client
    .from("portafolio_proyecto")
    .delete()
    .eq("id", itemId)
    .eq("id_estudiante", estudianteId);
  if (error) throw new ApiError(400, error.message);
}

function parsePortafolioBody(body: unknown): {
  titulo?: string;
  descripcion?: string | null;
  tecnologias?: string[];
  url_demo?: string | null;
  url_repositorio?: string | null;
} {
  if (typeof body !== "object" || body === null) throw new ApiError(400, "Cuerpo inválido");
  const b = body as Record<string, unknown>;
  const result: ReturnType<typeof parsePortafolioBody> = {};
  if (b.titulo !== undefined) {
    if (typeof b.titulo !== "string" || !b.titulo.trim()) throw new ApiError(400, "titulo requerido");
    result.titulo = b.titulo.trim();
  }
  if (b.descripcion !== undefined) result.descripcion = typeof b.descripcion === "string" ? b.descripcion.trim() || null : null;
  if (b.tecnologias !== undefined) result.tecnologias = Array.isArray(b.tecnologias) ? (b.tecnologias as string[]).filter(Boolean) : [];
  if (b.url_demo !== undefined) result.url_demo = typeof b.url_demo === "string" ? b.url_demo.trim() || null : null;
  if (b.url_repositorio !== undefined) result.url_repositorio = typeof b.url_repositorio === "string" ? b.url_repositorio.trim() || null : null;
  return result;
}

// ── Perfiles públicos (sin autenticación) ─────────────────────────────────────

/** Devuelve el perfil público completo de una empresa/emprendedor por empresario.id (PK). */
export async function getPublicEmpresaProfile(empresarioId: string) {
  const admin = supabaseAdmin();

  const { data: empresario, error } = await admin
    .from("empresario")
    .select(EMPRESARIO_SELECT)
    .eq("id", empresarioId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!empresario) throw new ApiError(404, "Perfil de empresa no encontrado");

  const { data: logoFile } = await admin
    .from("files")
    .select("storage_path")
    .eq("id_empresario", empresarioId)
    .eq("tipo", "logo")
    .maybeSingle();

  return { ...empresario, url_logo: logoFile?.storage_path ?? null };
}

/** Devuelve los proyectos publicados de una empresa para su perfil público. */
export async function getPublicEmpresaProjects(empresarioId: string) {
  const admin = supabaseAdmin();

  const { data: estadosBorrador } = await admin
    .from("estado_proyecto")
    .select("id")
    .in("nombre", ["borrador", "cancelado"]);

  const excludeIds = (estadosBorrador ?? []).map((e: { id: string }) => e.id);

  const query = admin
    .from("proyecto")
    .select(`
      id,
      titulo,
      descripcion,
      usa_ia,
      plazo_dias,
      tecnologias_extra,
      fecha_publicacion,
      fecha_cierre,
      estado:estado_proyecto(id, nombre),
      area:area_negocio(id, nombre),
      empresa:empresario(id, nombre_comercial, tipo),
      skills:project_skills(skill:skills(id, nombre, tipo, categoria))
    `)
    .eq("id_empresario", empresarioId)
    .not("fecha_publicacion", "is", null)
    .order("fecha_publicacion", { ascending: false });

  const { data, error } = excludeIds.length > 0
    ? await query.not("id_estado", "in", `(${excludeIds.join(",")})`)
    : await query;

  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

/**
 * Devuelve el perfil público de un junior por users.id.
 * Solo incluye items de portafolio con visibilidad = 'publico'.
 */
export async function getPublicJuniorProfile(userId: string) {
  const admin = supabaseAdmin();

  const { data: user, error: userError } = await admin
    .from("users")
    .select("nombre, apellido1, apellido2")
    .eq("id", userId)
    .maybeSingle();
  if (userError) throw new ApiError(500, userError.message);
  if (!user) throw new ApiError(404, "Usuario no encontrado");

  const { data: estudiante, error: estError } = await admin
    .from("estudiante")
    .select(ESTUDIANTE_SELECT)
    .eq("id_usuario", userId)
    .maybeSingle();
  if (estError) throw new ApiError(500, estError.message);
  if (!estudiante) throw new ApiError(404, "Perfil de junior no encontrado");

  const { data: skillLinks } = await admin
    .from("student_skills")
    .select("id_skill")
    .eq("id_estudiante", estudiante.id);
  const skillIds = (skillLinks ?? []).map((l) => l.id_skill);
  let skills: string[] = [];
  if (skillIds.length > 0) {
    const { data: skillRows } = await admin.from("skills").select("nombre").in("id", skillIds);
    skills = (skillRows ?? []).map((s) => s.nombre);
  }

  const { data: conocRows } = await admin
    .from("estudiante_conocimiento")
    .select("nombre")
    .eq("id_estudiante", estudiante.id);
  const conocimientos = (conocRows ?? []).map((r) => r.nombre);

  const { data: portafolio } = await admin
    .from("portafolio_proyecto")
    .select(PORTAFOLIO_SELECT)
    .eq("id_estudiante", estudiante.id)
    .eq("visibilidad", "publico")
    .order("fecha", { ascending: false });

  const { id: _estudianteId, ...estudianteFields } = estudiante;
  return {
    id: userId,
    nombre: user.nombre,
    apellido1: user.apellido1,
    apellido2: user.apellido2,
    ...estudianteFields,
    skills,
    conocimientos,
    portafolio: portafolio ?? [],
  };
}

export async function updateMyAvatar(
  accessToken: string,
  userId: string,
  fileBuffer: Buffer,
): Promise<{ url_avatar: string }> {
  const url = await uploadImage(fileBuffer, AVATAR_FOLDER);

  const client = supabaseForToken(accessToken);

  // Avatar anterior: para liberar su asset en Cloudinary tras reemplazarlo.
  const { data: previo } = await client
    .from("estudiante")
    .select("url_avatar")
    .eq("id_usuario", userId)
    .maybeSingle();

  const { data, error } = await client
    .from("estudiante")
    .update({ url_avatar: url })
    .eq("id_usuario", userId)
    .select("url_avatar")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "No tenés un perfil de estudiante");

  // Best-effort: liberar el avatar viejo de Cloudinary (no bloquea la respuesta).
  if (previo?.url_avatar && previo.url_avatar !== url) destroyImageByUrl(previo.url_avatar);

  return { url_avatar: data.url_avatar ?? url };
}

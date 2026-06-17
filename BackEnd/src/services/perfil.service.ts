import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { parseBody } from "../utils/parseBody";
import { uploadImage } from "./upload.service";
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

/** Columnas que se devuelven tras editar cada perfil. */
const ESTUDIANTE_SELECT =
  "id, descripcion, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, url_avatar, url_github, url_linkedin, url_portfolio";
const EMPRESARIO_SELECT =
  "id, tipo, nombre_comercial, descripcion, sector, tipos_proyecto, apoyo_tecnico_necesario, cedula_juridica, direccion, url_sitio_web, etapa, presupuesto";

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
  if (input.titulo_fwd !== undefined) updates.titulo_fwd = input.titulo_fwd;
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

  const idByName = new Map((catalog ?? []).map((skill) => [skill.nombre.toLowerCase(), skill]));
  const matched = new Map<string, string>();
  for (const name of names) {
    const hit = idByName.get(name.trim().toLowerCase());
    if (hit) matched.set(hit.id, hit.nombre);
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

  if (input.skills !== undefined) {
    const skills = await syncStudentSkills(client, estudiante.id, input.skills);
    return { ...estudiante, skills };
  }

  return estudiante;
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
  return updates;
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

export async function updateMyAvatar(
  accessToken: string,
  userId: string,
  fileBuffer: Buffer,
): Promise<{ url_avatar: string }> {
  const url = await uploadImage(fileBuffer, AVATAR_FOLDER);

  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("estudiante")
    .update({ url_avatar: url })
    .eq("id_usuario", userId)
    .select("url_avatar")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "No tenés un perfil de estudiante");

  return { url_avatar: data.url_avatar ?? url };
}

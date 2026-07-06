/**
 * notificacionTriggers.service.ts
 *
 * Lógica de disparo para los cuatro tipos de notificación nuevos del junior:
 *   visita_perfil              — empresa visita el perfil público del junior
 *   nuevo_proyecto_compatible  — proyecto publicado con match >= umbral para el junior
 *   oferta_revisada            — empresa abre el detalle de la postulación del junior
 *   nueva_calificacion         — empresa califica al junior al cerrar el proyecto
 *
 * Todas las funciones son best-effort (no lanzan si fallan, solo loguean).
 * Usan supabaseAdmin() para bypassar RLS, igual que crearNotificacion().
 */

import { supabaseAdmin } from "../config/supabase";
import { crearNotificacion, crearNotificaciones } from "./notificacion.service";
import { computeMatchScore } from "./match.service";
import { logger } from "../utils/logger";

const MATCH_NOTIF_THRESHOLD = 70;

// ─────────────────────────────────────────────────────────────────────────────
// 1. VISITA_PERFIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Llamado cuando una empresa (caller autenticado) abre el perfil público de un
 * junior. Registra la visita en `perfil_visita` y, si es la primera del día para
 * esa empresa+junior, crea la notificación al junior.
 *
 * @param juniorUserId  users.id del junior cuyo perfil se está viendo
 * @param callerUserId  users.id del visitante (empresa u otro rol autenticado)
 */
export async function triggerVisitaPerfil(
  juniorUserId: string,
  callerUserId: string,
): Promise<void> {
  if (callerUserId === juniorUserId) return; // El junior no se notifica a sí mismo.

  try {
    const admin = supabaseAdmin();
    const hoy = new Date().toISOString().slice(0, 10);

    // ¿Es empresa (empresario) quien visita? Solo notificamos visitas de empresas.
    const { data: empresario } = await admin
      .from("empresario")
      .select("nombre_comercial")
      .eq("id_usuario", callerUserId)
      .maybeSingle();

    if (!empresario) return; // El visitante no es empresa — no notificar.

    // Insertar visita (UNIQUE por empresa+junior+día → deduplicación automática).
    const { error: insertError, data: insertData } = await admin
      .from("perfil_visita")
      .insert({
        id_junior_usuario: juniorUserId,
        id_empresa_usuario: callerUserId,
        fecha: hoy,
      })
      .select("id")
      .maybeSingle();

    // Si ya existe la visita de hoy, `insertData` es null (conflicto ON UNIQUE → no row).
    if (insertError || !insertData) return;

    const empresa = empresario.nombre_comercial ?? "Una empresa";
    await crearNotificacion(
      "",
      juniorUserId,
      `${empresa} visitó tu perfil.`,
      "visita_perfil",
    );
  } catch (err) {
    logger.warn("triggerVisitaPerfil falló (best-effort)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NUEVO_PROYECTO_COMPATIBLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Llamado justo después de que un proyecto pasa a estado `en_recepcion`.
 * Calcula el match de cada junior verificado contra las skills del proyecto y
 * envía notificación a quienes superen MATCH_NOTIF_THRESHOLD (70 %).
 *
 * @param projectId   id del proyecto recién publicado
 * @param projectTitle  titulo del proyecto (ya disponible en el caller)
 */
export async function triggerNuevoProyectoCompatible(
  projectId: string,
  projectTitle: string,
): Promise<void> {
  try {
    const admin = supabaseAdmin();

    // Skills del proyecto.
    const { data: skillRows } = await admin
      .from("project_skills")
      .select("skill:skills(nombre)")
      .eq("id_proyecto", projectId);

    const projectSkills = (skillRows ?? [])
      .map((r) => (r.skill as { nombre: string } | null)?.nombre)
      .filter((n): n is string => Boolean(n));

    // Todos los juniors verificados con sus skills y disponibilidad.
    const { data: estudiantes } = await admin
      .from("estudiante")
      .select("id, id_usuario, disponibilidad, reputacion")
      .eq("estado_verificacion", "verificado");

    if (!estudiantes || estudiantes.length === 0) return;

    // Obtener skills de todos los estudiantes en una sola query.
    const estudianteIds = estudiantes.map((e) => e.id);
    const { data: allSkillLinks } = await admin
      .from("student_skills")
      .select("id_estudiante, id_skill")
      .in("id_estudiante", estudianteIds);

    const skillIdSet = new Set(
      (allSkillLinks ?? []).map((l) => l.id_skill),
    );
    const { data: skillCatalog } = await admin
      .from("skills")
      .select("id, nombre")
      .in("id", [...skillIdSet]);

    const skillNameById = new Map(
      (skillCatalog ?? []).map((s) => [s.id, s.nombre]),
    );

    // Índice: id_estudiante → nombres de skills.
    const skillsByEstudiante = new Map<string, string[]>();
    for (const link of allSkillLinks ?? []) {
      const nombre = skillNameById.get(link.id_skill);
      if (!nombre) continue;
      const arr = skillsByEstudiante.get(link.id_estudiante) ?? [];
      arr.push(nombre);
      skillsByEstudiante.set(link.id_estudiante, arr);
    }

    // Calcular match y filtrar quienes superan el umbral.
    const recipientUserIds: string[] = [];
    for (const est of estudiantes) {
      if (!est.id_usuario) continue;
      const juniorSkills = skillsByEstudiante.get(est.id) ?? [];
      const disponible =
        est.disponibilidad !== "unavailable" && est.disponibilidad != null;
      const { score } = computeMatchScore(
        projectSkills,
        juniorSkills,
        disponible,
        est.reputacion ?? null,
      );
      if (score >= MATCH_NOTIF_THRESHOLD) {
        recipientUserIds.push(est.id_usuario);
      }
    }

    if (recipientUserIds.length === 0) return;

    await crearNotificaciones(
      "",
      recipientUserIds,
      `Nuevo proyecto compatible con tu perfil: "${projectTitle}". Revisalo en el marketplace.`,
      "nuevo_proyecto_compatible",
      projectId,
    );
  } catch (err) {
    logger.warn("triggerNuevoProyectoCompatible falló (best-effort)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OFERTA_REVISADA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Llamado cuando la empresa abre el detalle de una postulación específica del
 * junior (GET /api/ofertas/:id). Solo genera notificación la primera vez.
 *
 * @param ofertaId      id de la oferta que se acaba de abrir
 * @param juniorUserId  users.id del junior que postulo
 * @param projectTitle  titulo del proyecto
 */
export async function triggerOfertaRevisada(
  ofertaId: string,
  juniorUserId: string,
  projectTitle: string,
): Promise<void> {
  try {
    const admin = supabaseAdmin();

    // Insertar en el log (PRIMARY KEY → deduplicación: si ya existe no hace nada).
    const { error } = await admin
      .from("oferta_revisada_log")
      .insert({ id_oferta: ofertaId });

    // error.code '23505' = unique_violation (ya existe) → no notificar de nuevo.
    if (error) return;

    await crearNotificacion(
      "",
      juniorUserId,
      `La empresa revisó tu postulación para "${projectTitle}". Mantente atento a la decisión.`,
      "oferta_revisada",
      ofertaId,
    );
  } catch (err) {
    logger.warn("triggerOfertaRevisada falló (best-effort)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. NUEVA_CALIFICACION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Llamado justo después de que la empresa guarda la calificación del junior.
 *
 * @param juniorUserId  users.id del junior calificado
 * @param estrellas     puntuación 1-5
 * @param projectTitle  titulo del proyecto calificado
 * @param ofertaId      id de la oferta (para deep-link)
 */
export async function triggerNuevaCalificacion(
  juniorUserId: string,
  estrellas: number,
  projectTitle: string,
  ofertaId: string,
): Promise<void> {
  try {
    const estrellaStr = `${estrellas} ${estrellas === 1 ? "estrella" : "estrellas"}`;
    await crearNotificacion(
      "",
      juniorUserId,
      `Recibiste una calificación de ${estrellaStr} en el proyecto "${projectTitle}". Revisá tu perfil.`,
      "nueva_calificacion",
      ofertaId,
    );
  } catch (err) {
    logger.warn("triggerNuevaCalificacion falló (best-effort)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Cliente Supabase mockeado, separado por tabla y por si la consulta fue de
 * lectura (`reads`) o de escritura (`updates`). `reviewEntregable` usa la tabla
 * `entregable` dos veces: primero la lee (dueño) y luego la actualiza (estado).
 */
const { reads, updates } = vi.hoisted(() => ({
  reads: {} as Record<string, { data: unknown; error: unknown }>,
  updates: {} as Record<string, { data: unknown; error: unknown }>,
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      let isUpdate = false;
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      const resolveSingle = () =>
        Promise.resolve((isUpdate ? updates[table] : reads[table]) ?? { data: null, error: null });
      Object.assign(builder, {
        select: chain,
        update: () => {
          isUpdate = true;
          return builder;
        },
        insert: chain,
        eq: chain,
        maybeSingle: resolveSingle,
        single: resolveSingle,
      });
      return builder;
    },
  }),
}));

// La notificación al junior es best-effort; se anula para aislar la lógica.
vi.mock("../notificacion.service", () => ({
  crearNotificacion: vi.fn(),
  MENSAJES_NOTIFICACION: {
    entregableAprobado: () => "",
    entregableCambiosSolicitados: () => "",
  },
  TIPO_POR_MENSAJE: {
    entregableAprobado: "entregable_aprobado",
    entregableCambiosSolicitados: "entregable_cambios",
  },
}));

import { estadoEntregablePorAccion, reviewEntregable } from "../entregable.service";

const TOKEN = "token";
const OWNER = "550e8400-e29b-41d4-a716-446655440000";
const JUNIOR = "660e8400-e29b-41d4-a716-446655440111";
const ENTREGABLE = "770e8400-e29b-41d4-a716-446655440222";
const PROYECTO = "880e8400-e29b-41d4-a716-446655440333";

/** Estado por defecto: entregable existe, proyecto del OWNER, estado destino existe, update OK. */
function happyPath() {
  reads["entregable"] = {
    data: { id: ENTREGABLE, id_proyecto: PROYECTO, id_usuario: JUNIOR },
    error: null,
  };
  reads["proyecto"] = {
    data: { titulo: "Landing", empresa: { id_usuario: OWNER } },
    error: null,
  };
  reads["estado_entregable"] = { data: { id: "estado-destino" }, error: null };
  updates["entregable"] = {
    data: { id: ENTREGABLE, estado: { nombre: "aprobado" } },
    error: null,
  };
}

beforeEach(() => {
  for (const key of Object.keys(reads)) delete reads[key];
  for (const key of Object.keys(updates)) delete updates[key];
});

describe("estadoEntregablePorAccion", () => {
  it("aprobar mapea al estado 'aprobado'", () => {
    expect(estadoEntregablePorAccion("aprobar")).toBe("aprobado");
  });

  it("solicitar_cambios mapea al estado 'cambios_solicitados' (no 'enviado')", () => {
    expect(estadoEntregablePorAccion("solicitar_cambios")).toBe("cambios_solicitados");
  });

  it("solo produce estados que existen en el seed de estado_entregable", () => {
    const validos = new Set(["enviado", "aprobado", "cambios_solicitados"]);
    expect(validos.has(estadoEntregablePorAccion("aprobar"))).toBe(true);
    expect(validos.has(estadoEntregablePorAccion("solicitar_cambios"))).toBe(true);
  });
});

describe("reviewEntregable", () => {
  it("aprueba cuando el proyecto es del usuario", async () => {
    happyPath();
    const result = await reviewEntregable(TOKEN, OWNER, ENTREGABLE, "aprobar");
    expect(result).toMatchObject({ estado: { nombre: "aprobado" } });
  });

  it("rechaza (404) si el entregable no existe", async () => {
    happyPath();
    reads["entregable"] = { data: null, error: null };
    await expect(reviewEntregable(TOKEN, OWNER, ENTREGABLE, "aprobar")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rechaza (403) si el proyecto no es del usuario", async () => {
    happyPath();
    reads["proyecto"] = {
      data: { titulo: "Landing", empresa: { id_usuario: "otro-user" } },
      error: null,
    };
    await expect(reviewEntregable(TOKEN, OWNER, ENTREGABLE, "aprobar")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("falla (500) si falta el estado destino en la BD (seeds)", async () => {
    happyPath();
    reads["estado_entregable"] = { data: null, error: null };
    await expect(
      reviewEntregable(TOKEN, OWNER, ENTREGABLE, "solicitar_cambios"),
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

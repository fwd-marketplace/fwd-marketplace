import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Respuestas del cliente Supabase mockeado, separadas por tabla y por si la
 * consulta fue de lectura (`reads`) o de escritura (`updates`). Esto importa
 * porque `changeProjectState` usa la tabla `proyecto` dos veces: primero para
 * leer al dueño y luego para actualizar el estado.
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
      const resolve = () =>
        Promise.resolve(
          (isUpdate ? updates[table] : reads[table]) ?? { data: null, error: null },
        );
      Object.assign(builder, {
        select: chain,
        update: () => {
          isUpdate = true;
          return builder;
        },
        insert: chain,
        eq: chain,
        order: chain,
        maybeSingle: resolve,
        single: resolve,
      });
      return builder;
    },
  }),
}));

import { changeProjectState } from "../proyecto.service";

const TOKEN = "token";
const USER = "550e8400-e29b-41d4-a716-446655440000";
const PROJECT = "660e8400-e29b-41d4-a716-446655440111";
const input = { estado: "cerrado" } as const;

/** Estado por defecto: proyecto del usuario, estado destino existe, update OK. */
function happyPath() {
  reads["proyecto"] = { data: { id: PROJECT, empresa: { id_usuario: USER } }, error: null };
  reads["estado_proyecto"] = { data: { id: "estado-cerrado" }, error: null };
  updates["proyecto"] = { data: { id: PROJECT, estado: { nombre: "cerrado" } }, error: null };
}

beforeEach(() => {
  for (const key of Object.keys(reads)) delete reads[key];
  for (const key of Object.keys(updates)) delete updates[key];
});

describe("changeProjectState", () => {
  it("cambia el estado cuando el proyecto es del usuario", async () => {
    happyPath();
    const result = await changeProjectState(TOKEN, USER, PROJECT, input);
    expect(result).toMatchObject({ estado: { nombre: "cerrado" } });
  });

  it("rechaza (404) si el proyecto no existe", async () => {
    happyPath();
    reads["proyecto"] = { data: null, error: null };
    await expect(changeProjectState(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rechaza (403) si el proyecto no es del usuario", async () => {
    happyPath();
    reads["proyecto"] = { data: { id: PROJECT, empresa: { id_usuario: "otro-user" } }, error: null };
    await expect(changeProjectState(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("falla (500) si falta el estado destino en la BD (seeds)", async () => {
    happyPath();
    reads["estado_proyecto"] = { data: null, error: null };
    await expect(changeProjectState(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

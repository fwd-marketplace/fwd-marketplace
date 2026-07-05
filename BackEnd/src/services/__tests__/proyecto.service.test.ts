import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Respuestas del cliente Supabase mockeado, separadas por tabla y por si la
 * consulta fue de lectura (`reads`) o de escritura (`updates`). Esto importa
 * porque `changeProjectState` usa la tabla `proyecto` dos veces: primero para
 * leer al dueño y luego para actualizar el estado.
 */
const { reads, updates, lists } = vi.hoisted(() => ({
  reads: {} as Record<string, { data: unknown; error: unknown }>,
  updates: {} as Record<string, { data: unknown; error: unknown }>,
  lists: {} as Record<string, { data: unknown; error: unknown }>,
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      let isUpdate = false;
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      const resolveSingle = () =>
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
        in: chain,
        order: chain,
        maybeSingle: resolveSingle,
        single: resolveSingle,
        // Para queries de lista que se awaitean directo (sin maybeSingle/single).
        then: (onFulfilled: (v: unknown) => unknown) =>
          onFulfilled(lists[table] ?? { data: [], error: null }),
      });
      return builder;
    },
  }),
}));

import { changeProjectState, listMyProjects, resolveCompensacionUpdate } from "../proyecto.service";

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
  for (const key of Object.keys(lists)) delete lists[key];
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

describe("listMyProjects", () => {
  it("devuelve los proyectos del empresario del usuario", async () => {
    reads["empresario"] = { data: { id: "emp-1" }, error: null };
    lists["proyecto"] = { data: [{ id: PROJECT, titulo: "Landing" }], error: null };
    const result = await listMyProjects(TOKEN, USER);
    // listMyProjects agrega n_ofertas (conteo de postulaciones) a cada proyecto.
    expect(result).toEqual([{ id: PROJECT, titulo: "Landing", n_ofertas: 0 }]);
  });

  it("rechaza (403) si el usuario no tiene perfil de empresa", async () => {
    reads["empresario"] = { data: null, error: null };
    await expect(listMyProjects(TOKEN, USER)).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("resolveCompensacionUpdate", () => {
  it("permite subir compensacion en recepcion con postulaciones", () => {
    expect(resolveCompensacionUpdate("en_recepcion", 500, 800, true)).toEqual({
      allowed: true,
      notifyIncrease: true,
    });
  });

  it("bloquea bajar compensacion con postulaciones activas", () => {
    expect(resolveCompensacionUpdate("en_recepcion", 800, 500, true)).toEqual({
      allowed: false,
      statusCode: 400,
      message: "No podés reducir la compensación mientras haya postulaciones activas",
    });
  });

  it("permite bajar compensacion sin postulaciones", () => {
    expect(resolveCompensacionUpdate("en_recepcion", 800, 500, false)).toEqual({
      allowed: true,
      notifyIncrease: false,
    });
  });

  it("permite editar compensacion en pausado", () => {
    expect(resolveCompensacionUpdate("pausado", null, 750, false)).toEqual({
      allowed: true,
      notifyIncrease: false,
    });
  });

  it("bloquea editar compensacion en adjudicado", () => {
    expect(resolveCompensacionUpdate("adjudicado", 750, 900, false)).toEqual({
      allowed: false,
      statusCode: 409,
      message: "No podés editar la compensación en este estado",
    });
  });
});

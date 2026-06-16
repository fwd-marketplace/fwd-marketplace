import { describe, it, expect, beforeEach, vi } from "vitest";

/** Respuestas que el cliente Supabase mockeado devuelve por tabla. */
const { responses } = vi.hoisted(() => ({
  responses: {} as Record<string, { data: unknown; error: unknown }>,
}));

// getCatalogs lanza las tres consultas con Promise.all, así que cada `from()`
// devuelve un builder PROPIO que captura su tabla (un singleton mezclaría las
// respuestas entre tablas al resolverse en paralelo). El terminal de cada query
// es `.order()`, que se await-ea directo vía `then`.
vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      const result = () => responses[table] ?? { data: null, error: null };
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      Object.assign(builder, {
        select: chain,
        eq: chain,
        order: chain,
        then: (resolve: (value: unknown) => unknown) => resolve(result()),
      });
      return builder;
    },
  }),
}));

import { getCatalogs } from "../catalog.service";

const TOKEN = "token";

beforeEach(() => {
  for (const key of Object.keys(responses)) delete responses[key];
});

describe("getCatalogs", () => {
  function happyPath() {
    responses["area_negocio"] = { data: [{ id: "a1", nombre: "Web" }], error: null };
    responses["skills"] = { data: [{ id: "s1", nombre: "React" }], error: null };
    responses["estado_proyecto"] = {
      data: [{ id: "e1", nombre: "en_recepcion", orden: 2 }],
      error: null,
    };
  }

  it("devuelve areas, skills y projectStates", async () => {
    happyPath();
    const result = await getCatalogs(TOKEN);
    expect(result).toMatchObject({
      areas: [{ nombre: "Web" }],
      skills: [{ nombre: "React" }],
      projectStates: [{ nombre: "en_recepcion" }],
    });
  });

  it("propaga (500) si falla la consulta de areas", async () => {
    happyPath();
    responses["area_negocio"] = { data: null, error: { message: "boom" } };
    await expect(getCatalogs(TOKEN)).rejects.toMatchObject({ statusCode: 500 });
  });

  it("propaga (500) si falla la consulta de skills", async () => {
    happyPath();
    responses["skills"] = { data: null, error: { message: "boom" } };
    await expect(getCatalogs(TOKEN)).rejects.toMatchObject({ statusCode: 500 });
  });
});
import { describe, it, expect, beforeEach, vi } from "vitest";

/** Respuestas que el cliente Supabase mockeado devuelve por tabla. */
const { responses } = vi.hoisted(() => ({
  responses: {} as Record<string, { data: unknown; error: unknown }>,
}));

// Builder encadenable: el terminal (maybeSingle/single) resuelve la respuesta
// configurada para la última tabla usada en `from()`. Igual patrón que oferta.service.test.
vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    let table = "";
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      from: (t: string) => {
        table = t;
        return builder;
      },
      select: chain,
      insert: chain,
      update: chain,
      eq: chain,
      order: chain,
      maybeSingle: () => Promise.resolve(responses[table] ?? { data: null, error: null }),
      single: () => Promise.resolve(responses[table] ?? { data: null, error: null }),
    });
    return builder;
  },
}));

import { updateMyPerfil } from "../perfil.service";

const TOKEN = "token";
const USER = "user-1";

beforeEach(() => {
  for (const key of Object.keys(responses)) delete responses[key];
});

describe("updateMyPerfil", () => {
  it("actualiza el perfil del estudiante con los campos enviados", async () => {
    responses["users"] = { data: { role: { nombre: "student" } }, error: null };
    responses["estudiante"] = {
      data: { id: "est-1", descripcion: "Hola", url_github: "https://github.com/ana" },
      error: null,
    };
    const perfil = await updateMyPerfil(TOKEN, USER, {
      bio: "Hola",
      link_github: "https://github.com/ana",
    });
    expect(perfil).toMatchObject({ id: "est-1", descripcion: "Hola" });
  });

  it("actualiza el perfil de la empresa con los campos enviados", async () => {
    responses["users"] = { data: { role: { nombre: "company" } }, error: null };
    responses["empresario"] = {
      data: { id: "emp-1", nombre_comercial: "Acme CR", descripcion: "Nueva" },
      error: null,
    };
    const perfil = await updateMyPerfil(TOKEN, USER, {
      nombre_comercial: "Acme CR",
      descripcion: "Nueva",
    });
    expect(perfil).toMatchObject({ id: "emp-1", nombre_comercial: "Acme CR" });
  });

  it("rechaza (403) si el usuario no completó onboarding", async () => {
    responses["users"] = { data: null, error: null };
    await expect(updateMyPerfil(TOKEN, USER, { bio: "x" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rechaza (403) si el rol no tiene perfil editable", async () => {
    responses["users"] = { data: { role: { nombre: "admin" } }, error: null };
    await expect(updateMyPerfil(TOKEN, USER, { bio: "x" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rechaza (400) si no se envía ningún campo", async () => {
    responses["users"] = { data: { role: { nombre: "student" } }, error: null };
    await expect(updateMyPerfil(TOKEN, USER, {})).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rechaza (400) si un campo no pasa la validación", async () => {
    responses["users"] = { data: { role: { nombre: "student" } }, error: null };
    await expect(
      updateMyPerfil(TOKEN, USER, { especializacion: "qa" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rechaza (404) si no existe la fila de perfil", async () => {
    responses["users"] = { data: { role: { nombre: "student" } }, error: null };
    responses["estudiante"] = { data: null, error: null };
    await expect(updateMyPerfil(TOKEN, USER, { bio: "x" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

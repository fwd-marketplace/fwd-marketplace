import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Respuestas que el cliente Supabase mockeado devolverá por tabla.
 * Cada test las configura antes de llamar al servicio.
 */
const { responses } = vi.hoisted(() => ({
  responses: {} as Record<string, { data: unknown; error: unknown }>,
}));

// Mock del cliente: un builder encadenable cuyo terminal (maybeSingle/single)
// resuelve la respuesta configurada para la última tabla usada en `from()`.
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

import { createOferta, decideOferta, getOfertaContacto } from "../oferta.service";

const TOKEN = "token";
const USER = "user-1";
const PROJECT = "project-1";
const OFERTA = "oferta-1";
const input = { propuesta: "Me interesa este proyecto" };

/** Estado por defecto: junior aprobado, proyecto en recepción, estado e inserción OK. */
function happyPath() {
  responses["users"] = { data: { estado_cuenta: "activa", role: { nombre: "student" } }, error: null };
  responses["proyecto"] = { data: { id: PROJECT, estado: { nombre: "en_recepcion" } }, error: null };
  responses["estado_oferta"] = { data: { id: "estado-enviada" }, error: null };
  responses["oferta"] = { data: { id: "oferta-1", fecha_envio: "2026-06-12T00:00:00Z" }, error: null };
}

beforeEach(() => {
  for (const key of Object.keys(responses)) delete responses[key];
});

describe("createOferta", () => {
  it("crea la oferta cuando todo es válido", async () => {
    happyPath();
    const oferta = await createOferta(TOKEN, USER, PROJECT, input);
    expect(oferta).toMatchObject({ id: "oferta-1" });
  });

  it("rechaza (403) si la cuenta no está aprobada", async () => {
    happyPath();
    responses["users"] = { data: { estado_cuenta: "pendiente", role: { nombre: "student" } }, error: null };
    await expect(createOferta(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rechaza (403) si el rol no es student", async () => {
    happyPath();
    responses["users"] = { data: { estado_cuenta: "activa", role: { nombre: "company" } }, error: null };
    await expect(createOferta(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rechaza (404) si el proyecto no existe", async () => {
    happyPath();
    responses["proyecto"] = { data: null, error: null };
    await expect(createOferta(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rechaza (409) si el proyecto no está en recepción", async () => {
    happyPath();
    responses["proyecto"] = { data: { id: PROJECT, estado: { nombre: "cerrado" } }, error: null };
    await expect(createOferta(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("mapea la violación de unicidad (23505) a 409 'ya postulaste'", async () => {
    happyPath();
    responses["oferta"] = { data: null, error: { code: "23505", message: "duplicate key" } };
    await expect(createOferta(TOKEN, USER, PROJECT, input)).rejects.toMatchObject({ statusCode: 409 });
  });
});

/**
 * Estado por defecto para decidir: la oferta existe y es de un proyecto del
 * usuario. La misma respuesta de "oferta" sirve para la búsqueda de propiedad
 * (lee id_proyecto) y para el update final (devuelve id + estado), porque el
 * mock no aplica el update: devuelve la data configurada para la tabla.
 */
function decideHappyPath(estadoFinal = "adjudicada") {
  responses["oferta"] = {
    data: { id: OFERTA, id_proyecto: PROJECT, estado: { nombre: estadoFinal } },
    error: null,
  };
  responses["proyecto"] = { data: { empresa: { id_usuario: USER } }, error: null };
  responses["estado_oferta"] = { data: { id: "estado-x" }, error: null };
}

describe("decideOferta", () => {
  it("adjudica cuando la empresa es dueña y la acción es aceptar", async () => {
    decideHappyPath("adjudicada");
    const oferta = await decideOferta(TOKEN, USER, OFERTA, { accion: "aceptar" });
    expect(oferta).toMatchObject({ id: OFERTA, estado: { nombre: "adjudicada" } });
  });

  it("marca no_seleccionada cuando la acción es rechazar", async () => {
    decideHappyPath("no_seleccionada");
    const oferta = await decideOferta(TOKEN, USER, OFERTA, { accion: "rechazar" });
    expect(oferta).toMatchObject({ id: OFERTA, estado: { nombre: "no_seleccionada" } });
  });

  it("rechaza (404) si la postulación no existe", async () => {
    decideHappyPath();
    responses["oferta"] = { data: null, error: null };
    await expect(
      decideOferta(TOKEN, USER, OFERTA, { accion: "aceptar" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rechaza (403) si el proyecto no es del usuario", async () => {
    decideHappyPath();
    responses["proyecto"] = { data: { empresa: { id_usuario: "otra-empresa" } }, error: null };
    await expect(
      decideOferta(TOKEN, USER, OFERTA, { accion: "aceptar" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

/** Estado por defecto para ver el contacto: oferta de un proyecto del usuario. */
function contactoHappyPath() {
  responses["oferta"] = {
    data: {
      id: OFERTA,
      id_proyecto: PROJECT,
      propuesta: "Me interesa este proyecto",
      prototipo_url: null,
      fecha_envio: "2026-06-12T00:00:00Z",
      estado: { nombre: "adjudicada" },
      proyecto: { id: PROJECT, titulo: "Landing" },
      junior: {
        id: "junior-1",
        nombre: "Ana",
        apellido1: "Soto",
        apellido2: null,
        correo: "ana@example.com",
        estudiante: {
          url_github: "https://github.com/ana",
          url_linkedin: "",
          url_portfolio: "",
        },
      },
    },
    error: null,
  };
  responses["proyecto"] = { data: { empresa: { id_usuario: USER } }, error: null };
}

describe("getOfertaContacto", () => {
  it("devuelve el contacto del junior cuando la empresa es dueña", async () => {
    contactoHappyPath();
    const oferta = await getOfertaContacto(TOKEN, USER, OFERTA);
    expect(oferta).toMatchObject({
      id: OFERTA,
      junior: {
        correo: "ana@example.com",
        estudiante: { url_github: "https://github.com/ana" },
      },
    });
  });

  it("rechaza (404) si la postulación no existe", async () => {
    contactoHappyPath();
    responses["oferta"] = { data: null, error: null };
    await expect(getOfertaContacto(TOKEN, USER, OFERTA)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rechaza (403) si el proyecto no es del usuario", async () => {
    contactoHappyPath();
    responses["proyecto"] = { data: { empresa: { id_usuario: "otra-empresa" } }, error: null };
    await expect(getOfertaContacto(TOKEN, USER, OFERTA)).rejects.toMatchObject({ statusCode: 403 });
  });
});

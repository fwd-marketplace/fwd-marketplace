import { describe, it, expect, beforeEach, vi } from "vitest";

// Estado controlable por los mocks (hoisted para poder usarlo en vi.mock).
const { providerState, catalog } = vi.hoisted(() => ({
  providerState: { content: "", chunks: [] as unknown[] },
  catalog: {
    skills: [] as unknown[],
    areas: [] as unknown[],
  },
}));

// Silenciamos el logger en los tests.
vi.mock("../../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock del proveedor: createChatCompletion devuelve `providerState.content`;
// streamChatCompletion emite `providerState.chunks`.
vi.mock("../provider", () => ({
  createChatCompletion: vi.fn(async () => ({
    content: providerState.content,
    provider: "groq",
    model: "test-model",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    latencyMs: 1,
  })),
  // eslint-disable-next-line require-yield
  streamChatCompletion: async function* stream() {
    for (const chunk of providerState.chunks) {
      yield chunk;
    }
  },
}));

// Mock de Supabase: cada `from(table)` devuelve un builder propio cuyo terminal
// `.order()` resuelve con la data del catálogo (mismo patrón que catalog.service.test).
vi.mock("../../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      const data = table === "skills" ? catalog.skills : catalog.areas;
      const builder: Record<string, unknown> = {};
      const chain = (): Record<string, unknown> => builder;
      Object.assign(builder, {
        select: chain,
        eq: chain,
        order: chain,
        then: (resolve: (value: unknown) => unknown) => resolve({ data, error: null }),
      });
      return builder;
    },
  }),
}));

import { generarPropuesta, streamAsistente } from "../asistente.service";

const TOKEN = "token";
const PARAMS = { history: [{ role: "user" as const, content: "Quiero una tienda" }], userId: "u1", accessToken: TOKEN };

beforeEach(() => {
  providerState.content = "";
  providerState.chunks = [];
  catalog.skills = [
    { id: "s1", nombre: "React", tipo: "tecnologia", categoria: "Frontend" },
    { id: "s2", nombre: "Node.js", tipo: "tecnologia", categoria: "Backend" },
  ];
  catalog.areas = [{ id: "a1", nombre: "Desarrollo Web", descripcion: null }];
});

describe("generarPropuesta", () => {
  it("mapea una propuesta válida a ids reales del catálogo", async () => {
    providerState.content = JSON.stringify({
      nombre: "Tienda online",
      objetivo: "Vender productos por internet",
      area_negocio: "Desarrollo Web",
      plazo_dias: 10,
      habilidades: ["React", "Node.js"],
      usa_ia: false,
      preguntas_pendientes: [],
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta).toMatchObject({
      nombre: "Tienda online",
      objetivo: "Vender productos por internet",
      area_negocio: "Desarrollo Web",
      id_area_negocio: "a1",
      plazo_dias: 10,
      usa_ia: false,
      preguntas_pendientes: [],
    });
    expect(propuesta.habilidades).toEqual([
      { id: "s1", nombre: "React" },
      { id: "s2", nombre: "Node.js" },
    ]);
  });

  it("descarta habilidades inventadas, deduplica y acota el plazo al máximo", async () => {
    providerState.content = JSON.stringify({
      nombre: "X",
      objetivo: "Y",
      area_negocio: "desarrollo web", // sin acentos/mayúsculas: debe matchear igual
      plazo_dias: 30, // fuera de rango -> 15
      habilidades: ["React", "Cobol", "React"], // Cobol no existe; React repetida
      usa_ia: true,
      preguntas_pendientes: ["¿Tienen presupuesto?"],
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta.plazo_dias).toBe(15);
    expect(propuesta.id_area_negocio).toBe("a1");
    expect(propuesta.usa_ia).toBe(true);
    expect(propuesta.habilidades).toEqual([{ id: "s1", nombre: "React" }]);
    expect(propuesta.preguntas_pendientes).toEqual(["¿Tienen presupuesto?"]);
  });

  it("acepta plazo como texto y lo sube al mínimo; habilidades como objetos", async () => {
    providerState.content = JSON.stringify({
      nombre: "App",
      area_negocio: "Desarrollo Web",
      plazo_dias: "3", // por debajo del mínimo -> 5
      habilidades: [{ nombre: "Node.js" }],
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta.plazo_dias).toBe(5);
    expect(propuesta.habilidades).toEqual([{ id: "s2", nombre: "Node.js" }]);
  });

  it("deja el área en null si no matchea ninguna del catálogo", async () => {
    providerState.content = JSON.stringify({
      nombre: "Campaña",
      area_negocio: "Marketing", // no existe en el catálogo
      plazo_dias: 7,
      habilidades: [],
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta.area_negocio).toBeNull();
    expect(propuesta.id_area_negocio).toBeNull();
  });

  it("extrae el JSON aunque venga envuelto en markdown y texto", async () => {
    providerState.content = [
      "Claro, acá tenés la propuesta:",
      "```json",
      '{ "nombre": "Z", "area_negocio": "Desarrollo Web", "plazo_dias": 7, "habilidades": [] }',
      "```",
      "Espero que te sirva.",
    ].join("\n");

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta.nombre).toBe("Z");
    expect(propuesta.plazo_dias).toBe(7);
  });

  it("aplica defaults cuando el modelo devuelve un objeto vacío", async () => {
    providerState.content = "{}";

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta).toMatchObject({
      nombre: "Proyecto sin título",
      objetivo: "",
      area_negocio: null,
      id_area_negocio: null,
      plazo_dias: 10,
      usa_ia: false,
    });
    expect(propuesta.habilidades).toEqual([]);
  });

  it("lanza 502 si la respuesta no contiene un JSON parseable", async () => {
    providerState.content = "No puedo ayudarte con eso.";
    await expect(generarPropuesta(PARAMS)).rejects.toMatchObject({ statusCode: 502 });
  });

  it("lanza 502 si el JSON está corrupto", async () => {
    providerState.content = "{ esto no es json válido }";
    await expect(generarPropuesta(PARAMS)).rejects.toMatchObject({ statusCode: 502 });
  });
});

describe("streamAsistente", () => {
  it("reemite los fragmentos del proveedor (deltas + done)", async () => {
    providerState.chunks = [
      { type: "delta", text: "Hola" },
      { type: "delta", text: " empresa" },
      { type: "done", provider: "groq", model: "test-model", usage: undefined, latencyMs: 5 },
    ];

    const received: unknown[] = [];
    for await (const chunk of streamAsistente(PARAMS)) {
      received.push(chunk);
    }

    expect(received).toHaveLength(3);
    expect(received[0]).toEqual({ type: "delta", text: "Hola" });
    expect(received[2]).toMatchObject({ type: "done" });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";

// Estado controlable por los mocks (hoisted para poder usarlo en vi.mock).
const { providerState, catalog, db } = vi.hoisted(() => ({
  providerState: {
    content: "",
    chunks: [] as unknown[],
    lastMessages: [] as { role: string; content: string }[],
  },
  catalog: {
    skills: [] as unknown[],
    areas: [] as unknown[],
  },
  db: {
    proyecto: [] as unknown[],
    ai_propuesta_ejemplo: [] as unknown[],
    inserts: [] as { table: string; row: unknown }[],
  },
}));

// Silenciamos el logger en los tests.
vi.mock("../../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock del proveedor: createChatCompletion devuelve `providerState.content`;
// streamChatCompletion emite `providerState.chunks`.
vi.mock("../provider", () => ({
  createChatCompletion: vi.fn(async (opts: { messages: { role: string; content: string }[] }) => {
    providerState.lastMessages = opts.messages;
    return {
      content: providerState.content,
      provider: "groq",
      model: "test-model",
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 1,
    };
  }),
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
      const dataFor = (): unknown => {
        if (table === "skills") return catalog.skills;
        if (table === "area_negocio") return catalog.areas;
        if (table === "proyecto") return db.proyecto;
        if (table === "ai_propuesta_ejemplo") return db.ai_propuesta_ejemplo;
        return [];
      };
      const builder: Record<string, unknown> = {};
      const chain = (): Record<string, unknown> => builder;
      Object.assign(builder, {
        select: chain,
        eq: chain,
        order: chain,
        limit: chain,
        insert: (row: unknown) => {
          db.inserts.push({ table, row });
          return Promise.resolve({ error: null });
        },
        then: (resolve: (value: unknown) => unknown) => resolve({ data: dataFor(), error: null }),
      });
      return builder;
    },
  }),
}));

import { generarPropuesta, streamAsistente, sugerirStack } from "../asistente.service";

const TOKEN = "token";
const PARAMS = { history: [{ role: "user" as const, content: "Quiero una tienda" }], userId: "u1", accessToken: TOKEN, locale: "es" as const };

beforeEach(() => {
  providerState.content = "";
  providerState.chunks = [];
  providerState.lastMessages = [];
  db.proyecto = [];
  db.ai_propuesta_ejemplo = [];
  db.inserts = [];
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
      objetivo: "Vender productos por internet a clientes de una panaderia.",
      funcionalidades: ["catalogo de productos", "carrito de compras", "pago en linea"],
      publico_objetivo: "clientes de una panaderia local",
      area_negocio: "Desarrollo Web",
      plazo_dias: 10,
      habilidades: ["React", "Node.js"],
      usa_ia: false,
      estilos_diseno: ["Minimalista y profesional", "Calido y cercano"],
      preguntas_pendientes: [],
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta).toMatchObject({
      nombre: "Tienda online",
      objetivo: "Vender productos por internet a clientes de una panaderia.",
      publico_objetivo: "clientes de una panaderia local",
      area_negocio: "Desarrollo Web",
      id_area_negocio: "a1",
      plazo_dias: 10,
      usa_ia: false,
      preguntas_pendientes: [],
    });
    expect(propuesta.funcionalidades).toEqual([
      "catalogo de productos",
      "carrito de compras",
      "pago en linea",
    ]);
    expect(propuesta.estilos_diseno).toEqual(["Minimalista y profesional", "Calido y cercano"]);
    // La descripcion compone objetivo + funcionalidades en vinetas + publico.
    expect(propuesta.descripcion).toContain("Vender productos por internet");
    expect(propuesta.descripcion).toContain("Funcionalidades principales:");
    expect(propuesta.descripcion).toContain("- catalogo de productos");
    expect(propuesta.descripcion).toContain("Público objetivo: clientes de una panaderia local");
    expect(propuesta.habilidades).toEqual([
      { id: "s1", nombre: "React" },
      { id: "s2", nombre: "Node.js" },
    ]);
  });

  it("usa la descripción que redacta el modelo cuando viene (sin composición mecánica)", async () => {
    const descripcionModelo =
      "Imaginá una web simple y cálida donde los pacientes de tu clínica reservan sus " +
      "citas en pocos clics, ven su historial y reciben un recordatorio antes de cada visita.";
    providerState.content = JSON.stringify({
      nombre: "Agenda dental",
      descripcion: descripcionModelo,
      objetivo: "Reservar citas en línea",
      funcionalidades: ["agendar citas eligiendo fecha y hora"],
      area_negocio: "Desarrollo Web",
      plazo_dias: 8,
    });

    const propuesta = await generarPropuesta(PARAMS);

    expect(propuesta.descripcion).toBe(descripcionModelo);
    // Cuando el modelo ya dio una descripción, NO se usa la composición con viñetas.
    expect(propuesta.descripcion).not.toContain("Funcionalidades principales:");
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
      descripcion: "",
      publico_objetivo: null,
      area_negocio: null,
      id_area_negocio: null,
      plazo_dias: 10,
      usa_ia: false,
    });
    expect(propuesta.habilidades).toEqual([]);
    expect(propuesta.funcionalidades).toEqual([]);
  });

  it("lanza 502 si la respuesta no contiene un JSON parseable", async () => {
    providerState.content = "No puedo ayudarte con eso.";
    await expect(generarPropuesta(PARAMS)).rejects.toMatchObject({ statusCode: 502 });
  });

  it("lanza 502 si el JSON está corrupto", async () => {
    providerState.content = "{ esto no es json válido }";
    await expect(generarPropuesta(PARAMS)).rejects.toMatchObject({ statusCode: 502 });
  });

  it("guarda la propuesta generada como memoria (best-effort)", async () => {
    providerState.content = JSON.stringify({
      nombre: "Tienda online",
      descripcion: "Una tienda simple para vender en línea.",
      area_negocio: "Desarrollo Web",
      plazo_dias: 9,
      habilidades: ["React"],
    });

    await generarPropuesta(PARAMS);

    const guardado = db.inserts.find((registro) => registro.table === "ai_propuesta_ejemplo");
    expect(guardado).toBeDefined();
    expect(guardado?.row).toMatchObject({ id_usuario: "u1", id_area_negocio: "a1" });
  });

  it("inyecta ejemplos de proyectos reales en el prompt cuando existen", async () => {
    db.proyecto = [
      {
        titulo: "Agenda de citas",
        descripcion: "Una web donde los clientes reservan turnos y reciben recordatorios.",
      },
    ];
    providerState.content = JSON.stringify({
      nombre: "Otro proyecto",
      descripcion: "Algo nuevo.",
      area_negocio: "Desarrollo Web",
      plazo_dias: 7,
      habilidades: [],
    });

    await generarPropuesta(PARAMS);

    const tieneEjemplos = providerState.lastMessages.some(
      (mensaje) => mensaje.role === "system" && mensaje.content.includes("Ejemplos de proyectos reales"),
    );
    const tieneTitulo = providerState.lastMessages.some((mensaje) =>
      mensaje.content.includes("Agenda de citas"),
    );
    expect(tieneEjemplos).toBe(true);
    expect(tieneTitulo).toBe(true);
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

describe("sugerirStack", () => {
  it("recomienda habilidades del catálogo y descarta las inventadas", async () => {
    providerState.content = JSON.stringify({
      habilidades: ["React", "Node.js", "Inventada"],
      justificacion: "Para una web con frontend y backend.",
    });

    const sugerencia = await sugerirStack({
      descripcion: "Una tienda online para vender productos.",
      userId: "u1",
      accessToken: TOKEN,
      locale: "es",
    });

    expect(sugerencia.habilidades).toEqual([
      { id: "s1", nombre: "React" },
      { id: "s2", nombre: "Node.js" },
    ]);
    expect(sugerencia.justificacion).toBe("Para una web con frontend y backend.");
  });

  it("lanza 502 si el modelo no devuelve un JSON usable", async () => {
    providerState.content = "no es json";
    await expect(
      sugerirStack({ descripcion: "Una tienda online.", userId: "u1", accessToken: TOKEN, locale: "es" }),
    ).rejects.toMatchObject({ statusCode: 502 });
  });
});

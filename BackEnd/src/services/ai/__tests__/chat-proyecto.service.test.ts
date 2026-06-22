import { describe, it, expect, beforeEach, vi } from "vitest";

// Estado controlable por los mocks (hoisted para usarlo dentro de vi.mock).
const { providerState, db } = vi.hoisted(() => ({
  providerState: {
    chunks: [] as unknown[],
    lastMessages: [] as { role: string; content: string }[],
  },
  db: {
    // Proyecto único que devuelve `from("proyecto").maybeSingle()`; null = no visible.
    proyecto: null as unknown,
  },
}));

vi.mock("../../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// El proveedor: streamChatCompletion captura los mensajes (para verificar el contexto) y
// emite los chunks configurados.
vi.mock("../provider", () => ({
  // eslint-disable-next-line require-yield
  streamChatCompletion: async function* stream(opts: {
    messages: { role: string; content: string }[];
  }) {
    providerState.lastMessages = opts.messages;
    for (const chunk of providerState.chunks) {
      yield chunk;
    }
  },
}));

// Supabase: `from("proyecto")` resuelve `.maybeSingle()` con `db.proyecto`.
vi.mock("../../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      const builder: Record<string, unknown> = {};
      const chain = (): Record<string, unknown> => builder;
      Object.assign(builder, {
        select: chain,
        eq: chain,
        maybeSingle: () =>
          Promise.resolve({ data: table === "proyecto" ? db.proyecto : null, error: null }),
      });
      return builder;
    },
  }),
}));

import { streamChatProyecto, type ChatProyectoParams } from "../chat-proyecto.service";

const PARAMS: ChatProyectoParams = {
  proyectoId: "11111111-1111-1111-1111-111111111111",
  history: [{ role: "user", content: "¿Esto es web o app de celular?" }],
  userId: "u1",
  accessToken: "token",
};

const PROYECTO_VISIBLE = {
  titulo: "Tienda online para panadería",
  descripcion: "Una web donde los clientes compran panes y pagan en línea.",
  usa_ia: false,
  plazo_dias: 10,
  tecnologias_extra: ["Figma"],
  area: { nombre: "Desarrollo Web" },
  empresa: { nombre_comercial: "Panadería La Espiga" },
  skills: [{ skill: { nombre: "React" } }, { skill: { nombre: "Node.js" } }],
};

beforeEach(() => {
  providerState.chunks = [];
  providerState.lastMessages = [];
  db.proyecto = null;
});

describe("streamChatProyecto", () => {
  it("reemite los fragmentos del proveedor (deltas + done)", async () => {
    db.proyecto = PROYECTO_VISIBLE;
    providerState.chunks = [
      { type: "delta", text: "Es una " },
      { type: "delta", text: "página web." },
      { type: "done", provider: "groq", model: "test-model", usage: undefined, latencyMs: 5 },
    ];

    const received: unknown[] = [];
    for await (const chunk of streamChatProyecto(PARAMS)) {
      received.push(chunk);
    }

    expect(received).toHaveLength(3);
    expect(received[0]).toEqual({ type: "delta", text: "Es una " });
    expect(received[2]).toMatchObject({ type: "done" });
  });

  it("inyecta el contexto del proyecto (título, descripción, tecnologías) en el system prompt", async () => {
    db.proyecto = PROYECTO_VISIBLE;
    providerState.chunks = [
      { type: "done", provider: "groq", model: "test-model", usage: undefined, latencyMs: 1 },
    ];

    for await (const _ of streamChatProyecto(PARAMS)) {
      // Solo nos interesa el efecto: que el system prompt llegue armado al proveedor.
    }

    const system = providerState.lastMessages.find((m) => m.role === "system");
    expect(system).toBeDefined();
    expect(system?.content).toContain("Tienda online para panadería");
    expect(system?.content).toContain("compran panes y pagan en línea");
    // Unifica skills del catálogo con las tecnologías extra de la empresa.
    expect(system?.content).toContain("React");
    expect(system?.content).toContain("Figma");
    expect(system?.content).toContain("Panadería La Espiga");
    // El historial del junior se mantiene después del system prompt.
    expect(providerState.lastMessages.at(-1)).toMatchObject({ role: "user" });
  });

  it("lanza 404 si el proyecto no existe o no es visible para el junior", async () => {
    db.proyecto = null;

    await expect(async () => {
      for await (const _ of streamChatProyecto(PARAMS)) {
        // No debería emitir nada: loadProyectoContexto lanza antes.
      }
    }).rejects.toMatchObject({ statusCode: 404 });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";

const { providerState, db } = vi.hoisted(() => ({
  providerState: {
    content: "",
    lastMessages: [] as { role: string; content: string }[],
  },
  db: {
    proyecto: null as unknown,
  },
}));

vi.mock("../../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

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
}));

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

import { mejorarMensaje } from "../mejorar-mensaje.service";

const BASE = { borrador: "ola sube el codigo cuando puedas", userId: "u1", accessToken: "token" };

beforeEach(() => {
  providerState.content = "";
  providerState.lastMessages = [];
  db.proyecto = null;
});

describe("mejorarMensaje", () => {
  it("devuelve el texto reescrito (recortado)", async () => {
    providerState.content = "  Hola, cuando puedas subí el código al repositorio. ¡Gracias!  ";

    const mejorado = await mejorarMensaje(BASE);

    expect(mejorado).toBe("Hola, cuando puedas subí el código al repositorio. ¡Gracias!");
  });

  it("inyecta el contexto del proyecto en el system prompt cuando llega proyecto_id", async () => {
    db.proyecto = {
      titulo: "Tienda online",
      descripcion: "Una web para vender productos.",
      tecnologias_extra: ["Stripe"],
      skills: [{ skill: { nombre: "React" } }],
    };
    providerState.content = "Mensaje reescrito.";

    await mejorarMensaje({ ...BASE, proyectoId: "11111111-1111-1111-1111-111111111111" });

    const system = providerState.lastMessages.find((m) => m.role === "system");
    expect(system?.content).toContain("Tienda online");
    expect(system?.content).toContain("React");
    expect(system?.content).toContain("Stripe");
    // El borrador llega como mensaje del usuario.
    expect(providerState.lastMessages.at(-1)).toMatchObject({ role: "user", content: BASE.borrador });
  });

  it("funciona sin proyecto_id (sin contexto de proyecto)", async () => {
    providerState.content = "Mensaje reescrito.";

    const mejorado = await mejorarMensaje(BASE);

    expect(mejorado).toBe("Mensaje reescrito.");
    const system = providerState.lastMessages.find((m) => m.role === "system");
    expect(system?.content).not.toContain("Contexto del proyecto");
  });

  it("lanza 502 si el modelo devuelve un texto vacío", async () => {
    providerState.content = "   ";
    await expect(mejorarMensaje(BASE)).rejects.toMatchObject({ statusCode: 502 });
  });
});

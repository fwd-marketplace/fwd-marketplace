import { describe, it, expect, beforeEach, vi } from "vitest";

// Estado controlable por el mock del proveedor (hoisted para usarlo dentro de vi.mock).
const { providerState } = vi.hoisted(() => ({
  providerState: {
    content: "",
    shouldThrow: false,
    lastMessages: [] as { role: string; content: string }[],
  },
}));

vi.mock("../../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// El traductor solo usa createChatCompletion: devuelve providerState.content (o lanza).
vi.mock("../provider", () => ({
  createChatCompletion: vi.fn(async (opts: { messages: { role: string; content: string }[] }) => {
    providerState.lastMessages = opts.messages;
    if (providerState.shouldThrow) {
      throw new Error("provider caído");
    }
    return {
      content: providerState.content,
      provider: "groq",
      model: "test-model",
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      latencyMs: 1,
    };
  }),
}));

import { translateFields, translateText, oppositeLocale } from "../translation.service";

beforeEach(() => {
  providerState.content = "";
  providerState.shouldThrow = false;
  providerState.lastMessages = [];
});

describe("translateFields", () => {
  it("traduce los valores y conserva las claves", async () => {
    providerState.content = JSON.stringify({ titulo: "Online store", descripcion: "Sell products" });

    const result = await translateFields({
      fields: { titulo: "Tienda online", descripcion: "Vender productos" },
      from: "es",
      to: "en",
    });

    expect(result).toEqual({ titulo: "Online store", descripcion: "Sell products" });
  });

  it("preserva los campos vacíos sin mandarlos al modelo", async () => {
    providerState.content = JSON.stringify({ titulo: "Online store" });

    const result = await translateFields({
      fields: { titulo: "Tienda online", condiciones: "" },
      from: "es",
      to: "en",
    });

    expect(result).toEqual({ titulo: "Online store", condiciones: "" });
    // El campo vacío no se envía al modelo: el user message solo contiene "titulo".
    const userMessage = providerState.lastMessages.find((m) => m.role === "user");
    expect(userMessage?.content).toContain("titulo");
    expect(userMessage?.content).not.toContain("condiciones");
  });

  it("devuelve null si el idioma origen y destino coinciden", async () => {
    const result = await translateFields({
      fields: { titulo: "Tienda" },
      from: "es",
      to: "es",
    });
    expect(result).toBeNull();
  });

  it("devuelve null si no hay nada que traducir (todo vacío)", async () => {
    const result = await translateFields({
      fields: { titulo: "", descripcion: "   " },
      from: "es",
      to: "en",
    });
    expect(result).toBeNull();
  });

  it("devuelve null si el modelo no devuelve un JSON válido", async () => {
    providerState.content = "No puedo traducir esto";
    const result = await translateFields({
      fields: { titulo: "Tienda online" },
      from: "es",
      to: "en",
    });
    expect(result).toBeNull();
  });

  it("devuelve null si falta una clave en la traducción (incompleta)", async () => {
    providerState.content = JSON.stringify({ titulo: "Online store" });
    const result = await translateFields({
      fields: { titulo: "Tienda online", descripcion: "Vender productos" },
      from: "es",
      to: "en",
    });
    expect(result).toBeNull();
  });

  it("devuelve null si el proveedor lanza (best-effort, no propaga)", async () => {
    providerState.shouldThrow = true;
    const result = await translateFields({
      fields: { titulo: "Tienda online" },
      from: "es",
      to: "en",
    });
    expect(result).toBeNull();
  });

  it("incluye el idioma destino en el system prompt", async () => {
    providerState.content = JSON.stringify({ titulo: "Online store" });
    await translateFields({ fields: { titulo: "Tienda online" }, from: "es", to: "en" });

    const systemMessage = providerState.lastMessages.find((m) => m.role === "system");
    expect(systemMessage?.content).toContain("English");
  });
});

describe("translateText", () => {
  it("traduce un único texto", async () => {
    providerState.content = JSON.stringify({ texto: "Hello, how are you?" });
    const result = await translateText("Hola, ¿cómo estás?", "es", "en");
    expect(result).toBe("Hello, how are you?");
  });

  it("devuelve null si la traducción falla", async () => {
    providerState.shouldThrow = true;
    const result = await translateText("Hola", "es", "en");
    expect(result).toBeNull();
  });
});

describe("oppositeLocale", () => {
  it("devuelve el idioma opuesto", () => {
    expect(oppositeLocale("es")).toBe("en");
    expect(oppositeLocale("en")).toBe("es");
  });
});

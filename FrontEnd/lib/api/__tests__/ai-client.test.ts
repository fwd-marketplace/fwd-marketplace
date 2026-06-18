import { describe, it, expect, vi, afterEach } from "vitest";
import { streamAssistant, type AiStreamEvent } from "../ai-client";

/** Construye un ReadableStream que emite los chunks de texto dados. */
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>, status = 200): Promise<AiStreamEvent[]> {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(stream, { status })));
  const events: AiStreamEvent[] = [];
  await streamAssistant([{ role: "user", content: "hola" }], (event) => events.push(event));
  return events;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("streamAssistant", () => {
  it("emite los deltas y el done de un stream SSE", async () => {
    const events = await collect(
      sseStream([
        'event: delta\ndata: {"text":"Hola"}\n\n',
        'event: delta\ndata: {"text":" mundo"}\n\n',
        'event: done\ndata: {"usage":null}\n\n',
      ]),
    );

    expect(events).toEqual([
      { type: "delta", text: "Hola" },
      { type: "delta", text: " mundo" },
      { type: "done" },
    ]);
  });

  it("reensambla eventos partidos entre chunks", async () => {
    const events = await collect(
      sseStream(["event: delta\nda", 'ta: {"text":"AB"}\n\n', "event: done\ndata: {}\n\n"]),
    );

    expect(events).toContainEqual({ type: "delta", text: "AB" });
    expect(events).toContainEqual({ type: "done" });
  });

  it("reporta un evento de error si la respuesta no es ok", async () => {
    const body = sseStream([JSON.stringify({ error: "boom" })]);
    const events = await collect(body, 502);

    expect(events).toEqual([{ type: "error", error: "boom" }]);
  });

  it("propaga un evento error embebido en el stream", async () => {
    const events = await collect(sseStream(['event: error\ndata: {"error":"se cayó"}\n\n']));
    expect(events).toEqual([{ type: "error", error: "se cayó" }]);
  });
});

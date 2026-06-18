import { cookies } from "next/headers";
import { BASE_URL, SESSION_COOKIE } from "@/lib/api-client";

// La cookie de sesión es httpOnly: el cliente no puede leer el token para llamar
// al BackEnd directo. Este route handler corre en el servidor, lee la cookie y
// reenvía el streaming SSE del asistente al navegador (mismo origen, sin CORS).
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return jsonError("No autenticado", 401);
  }

  // El cuerpo ({ history: [...] }) se reenvía tal cual; el BackEnd lo valida.
  const body = await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/ai/asistente-proyecto`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
  } catch {
    return jsonError("No se pudo contactar al asistente de IA.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    let message = "No se pudo contactar al asistente de IA.";
    try {
      const parsed = (await upstream.json()) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // sin cuerpo legible: se usa el mensaje por defecto.
    }
    return jsonError(message, upstream.status || 502);
  }

  // Pipe directo del stream SSE del BackEnd hacia el cliente.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

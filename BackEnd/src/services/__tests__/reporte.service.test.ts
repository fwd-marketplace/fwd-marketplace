import { describe, it, expect, beforeEach, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    mensaje: null as unknown,
    insertError: null as { code?: string; message?: string } | null,
    lastInsert: null as Record<string, unknown> | null,
  },
}));

// Supabase: `from("mensaje").maybeSingle()` -> db.mensaje; `from("mensaje_reporte").insert().single()`
// -> éxito o db.insertError.
vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => ({
    from: (table: string) => {
      if (table === "mensaje") {
        const builder: Record<string, unknown> = {};
        Object.assign(builder, {
          select: () => builder,
          eq: () => builder,
          maybeSingle: () => Promise.resolve({ data: db.mensaje, error: null }),
        });
        return builder;
      }
      if (table === "mensaje_reporte") {
        const builder: Record<string, unknown> = {};
        Object.assign(builder, {
          insert: (row: Record<string, unknown>) => {
            db.lastInsert = row;
            const inserted: Record<string, unknown> = {};
            Object.assign(inserted, {
              select: () => inserted,
              single: () =>
                Promise.resolve(
                  db.insertError
                    ? { data: null, error: db.insertError }
                    : { data: { id: "r1", estado: "pendiente", fecha: "2026-01-01" }, error: null },
                ),
            });
            return inserted;
          },
        });
        return builder;
      }
      return {};
    },
  }),
}));

import { crearReporte } from "../reporte.service";

const MENSAJE = {
  id: "m1",
  contenido: "mensaje ofensivo",
  id_remitente: "autor",
  id_proyecto: "p1",
};

const INPUT = { id_mensaje: "m1", motivo: "falta_respeto" as const, detalle: "fue grosero" };

beforeEach(() => {
  db.mensaje = MENSAJE;
  db.insertError = null;
  db.lastInsert = null;
});

describe("crearReporte", () => {
  it("crea el reporte con snapshot del mensaje (autor, proyecto, contenido)", async () => {
    const reporte = await crearReporte("token", "reportante", INPUT);

    expect(reporte).toMatchObject({ id: "r1", estado: "pendiente" });
    expect(db.lastInsert).toMatchObject({
      id_mensaje: "m1",
      id_reportante: "reportante",
      id_reportado: "autor",
      id_proyecto: "p1",
      contenido_snapshot: "mensaje ofensivo",
      motivo: "falta_respeto",
      detalle: "fue grosero",
    });
  });

  it("lanza 404 si el mensaje no existe o no es visible para el reportante", async () => {
    db.mensaje = null;
    await expect(crearReporte("token", "reportante", INPUT)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("lanza 400 si intentás reportar tu propio mensaje", async () => {
    await expect(crearReporte("token", "autor", INPUT)).rejects.toMatchObject({ statusCode: 400 });
  });

  it("lanza 409 si ya reportaste ese mensaje (violación de unicidad)", async () => {
    db.insertError = { code: "23505" };
    await expect(crearReporte("token", "reportante", INPUT)).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

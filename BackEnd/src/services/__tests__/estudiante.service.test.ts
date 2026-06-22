import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Respuestas del cliente Supabase mockeado, por tabla. El builder es "thenable"
 * (como el real de supabase-js): se puede await en cualquier punto de la cadena
 * y resuelve la respuesta de la última tabla usada en `from()`.
 */
const { responses } = vi.hoisted(() => ({
  responses: {} as Record<string, { data: unknown; error: unknown }>,
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    let table = "";
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    const resolve = () => Promise.resolve(responses[table] ?? { data: [], error: null });
    Object.assign(builder, {
      from: (t: string) => { table = t; return builder; },
      select: chain, insert: chain, update: chain, delete: chain,
      eq: chain, in: chain, order: chain,
      maybeSingle: () => resolve(),
      single: () => resolve(),
      then: (onF: unknown, onR: unknown) =>
        resolve().then(onF as () => unknown, onR as () => unknown),
    });
    return builder;
  },
}));

import { searchStudents } from "../estudiante.service";

const ESTUDIANTE = {
  id: "e1",
  especialidad: "frontend",
  modalidad_preferida: '["remote"]',
  disponibilidad: "immediate",
  titulo_fwd: null,
  estado_verificacion: "verificado",
  reputacion: null,
  url_avatar: null,
  usuario: { id: "u1", nombre: "Ana", apellido1: "Soto" },
};

const OCUPADO = {
  data: [{ id_usuario: "u1", estado: { nombre: "adjudicada" }, proyecto: { estado: { nombre: "en_desarrollo" } } }],
  error: null,
};

beforeEach(() => {
  for (const k of Object.keys(responses)) delete responses[k];
  responses["estudiante"] = { data: [ESTUDIANTE], error: null };
  responses["student_skills"] = { data: [], error: null };
  responses["skills"] = { data: [], error: null };
  responses["oferta"] = { data: [], error: null }; // nadie ocupado por defecto
});

describe("searchStudents", () => {
  it("devuelve estudiantes verificados con su flag disponible", async () => {
    const result = await searchStudents("token", {});
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "e1", disponible: true, skills: [] });
  });

  it("marca disponible=false si el estudiante tiene un proyecto activo", async () => {
    responses["oferta"] = OCUPADO;
    const result = await searchStudents("token", {});
    expect(result[0]?.disponible).toBe(false);
  });

  it("con solo_disponibles=true excluye a los ocupados", async () => {
    responses["oferta"] = OCUPADO;
    const result = await searchStudents("token", { solo_disponibles: true });
    expect(result).toHaveLength(0);
  });

  it("filtra por nombre (q)", async () => {
    const result = await searchStudents("token", { q: "zzz" });
    expect(result).toHaveLength(0);
  });

  it("filtra por modalidad", async () => {
    const sinMatch = await searchStudents("token", { modalidad: "onsite" });
    expect(sinMatch).toHaveLength(0);
    const conMatch = await searchStudents("token", { modalidad: "remote" });
    expect(conMatch).toHaveLength(1);
  });
});

import { describe, it, expect } from "vitest";
import { CreateProjectSchema } from "../project";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("CreateProjectSchema", () => {
  const valido = {
    titulo: "Landing para fintech",
    descripcion: "Necesito una landing en Next.js",
    id_area_negocio: UUID,
    plazo_dias: 10,
  };

  it("acepta datos válidos", () => {
    expect(CreateProjectSchema.safeParse(valido).success).toBe(true);
  });

  it("rechaza plazo_dias menor a 5", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, plazo_dias: 3 }).success).toBe(false);
  });

  it("rechaza plazo_dias mayor a 15", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, plazo_dias: 20 }).success).toBe(false);
  });

  it("rechaza id_area_negocio que no es UUID", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, id_area_negocio: "abc" }).success).toBe(false);
  });

  it("acepta skills como lista de UUIDs", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, skills: [UUID] }).success).toBe(true);
  });

  it("rechaza skills con un valor que no es UUID", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, skills: ["no-uuid"] }).success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { CreateProjectSchema, ChangeProjectStateSchema } from "../project";

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

  it("acepta borrador sin compensacion", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, publicar: false }).success).toBe(true);
  });

  it("rechaza publicar sin compensacion", () => {
    expect(CreateProjectSchema.safeParse({ ...valido, publicar: true }).success).toBe(false);
  });

  it("acepta publicar con compensacion valida", () => {
    expect(
      CreateProjectSchema.safeParse({ ...valido, publicar: true, compensacion: 750 }).success,
    ).toBe(true);
  });

  it("rechaza compensacion menor al minimo", () => {
    expect(
      CreateProjectSchema.safeParse({ ...valido, publicar: true, compensacion: 25 }).success,
    ).toBe(false);
  });

  it("rechaza compensacion mayor al maximo", () => {
    expect(
      CreateProjectSchema.safeParse({ ...valido, publicar: true, compensacion: 20_000 }).success,
    ).toBe(false);
  });

  it("rechaza compensacion con centavos (debe ser entera)", () => {
    expect(
      CreateProjectSchema.safeParse({ ...valido, publicar: true, compensacion: 500.5 }).success,
    ).toBe(false);
  });
});

describe("ChangeProjectStateSchema", () => {
  it("acepta un estado válido de la empresa", () => {
    expect(ChangeProjectStateSchema.safeParse({ estado: "cerrado" }).success).toBe(true);
  });

  it("rechaza 'cancelado' (reservado a la moderación del admin)", () => {
    expect(ChangeProjectStateSchema.safeParse({ estado: "cancelado" }).success).toBe(false);
  });

  it("rechaza 'borrador' (solo aplica al crear)", () => {
    expect(ChangeProjectStateSchema.safeParse({ estado: "borrador" }).success).toBe(false);
  });

  it("rechaza un estado inexistente", () => {
    expect(ChangeProjectStateSchema.safeParse({ estado: "lo_que_sea" }).success).toBe(false);
  });
});

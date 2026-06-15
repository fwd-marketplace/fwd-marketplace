import { describe, it, expect } from "vitest";
import { PerfilEstudianteSchema, PerfilEmpresarioSchema } from "../perfil";

describe("PerfilEstudianteSchema", () => {
  it("acepta una actualización parcial", () => {
    expect(PerfilEstudianteSchema.safeParse({ bio: "Hola" }).success).toBe(true);
  });

  it("rechaza un body vacío", () => {
    expect(PerfilEstudianteSchema.safeParse({}).success).toBe(false);
  });

  it("rechaza una especialización fuera del enum", () => {
    expect(PerfilEstudianteSchema.safeParse({ especializacion: "qa" }).success).toBe(false);
  });

  it("rechaza un link inválido", () => {
    expect(PerfilEstudianteSchema.safeParse({ link_github: "no-es-url" }).success).toBe(false);
  });

  it("acepta un link vacío", () => {
    expect(PerfilEstudianteSchema.safeParse({ link_github: "" }).success).toBe(true);
  });
});

describe("PerfilEmpresarioSchema", () => {
  it("acepta una actualización parcial", () => {
    expect(PerfilEmpresarioSchema.safeParse({ descripcion: "Nueva" }).success).toBe(true);
  });

  it("rechaza un body vacío", () => {
    expect(PerfilEmpresarioSchema.safeParse({}).success).toBe(false);
  });

  it("rechaza una etapa fuera del enum", () => {
    expect(PerfilEmpresarioSchema.safeParse({ etapa: "growth" }).success).toBe(false);
  });
});

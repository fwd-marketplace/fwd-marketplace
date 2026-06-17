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

  it("acepta editar nombre y apellidos", () => {
    expect(
      PerfilEstudianteSchema.safeParse({ nombre: "Ana", apellido1: "Mora" }).success,
    ).toBe(true);
  });

  it("acepta el título FWD (programa) como texto libre", () => {
    expect(PerfilEstudianteSchema.safeParse({ titulo_fwd: "Cohorte 2026" }).success).toBe(true);
  });

  it("acepta un arreglo de skills (incluido vacío para limpiarlas)", () => {
    expect(PerfilEstudianteSchema.safeParse({ skills: ["React", "Node.js"] }).success).toBe(true);
    expect(PerfilEstudianteSchema.safeParse({ skills: [] }).success).toBe(true);
  });

  it("rechaza un nombre vacío", () => {
    expect(PerfilEstudianteSchema.safeParse({ nombre: "" }).success).toBe(false);
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

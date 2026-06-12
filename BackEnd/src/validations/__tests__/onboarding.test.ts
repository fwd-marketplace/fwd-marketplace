import { describe, it, expect } from "vitest";
import {
  JuniorOnboardingSchema,
  EmpresaOnboardingSchema,
  EmprendedorOnboardingSchema,
} from "../onboarding";

describe("JuniorOnboardingSchema", () => {
  const valido = {
    nombre: "Ana",
    apellido1: "Soto",
    cedula: "1-2345-6789",
    especializacion: "frontend",
    modalidad: ["remote"],
    disponibilidad: "immediate",
    tech_stack: ["React"],
  };

  it("acepta datos válidos", () => {
    expect(JuniorOnboardingSchema.safeParse(valido).success).toBe(true);
  });

  it("rechaza una especialización fuera del enum", () => {
    expect(JuniorOnboardingSchema.safeParse({ ...valido, especializacion: "qa" }).success).toBe(false);
  });

  it("rechaza tech_stack vacío", () => {
    expect(JuniorOnboardingSchema.safeParse({ ...valido, tech_stack: [] }).success).toBe(false);
  });

  it("rechaza si falta la cédula", () => {
    const { cedula: _omit, ...sinCedula } = valido;
    expect(JuniorOnboardingSchema.safeParse(sinCedula).success).toBe(false);
  });

  it("acepta links opcionales vacíos", () => {
    const result = JuniorOnboardingSchema.safeParse({ ...valido, link_github: "", link_linkedin: "" });
    expect(result.success).toBe(true);
  });

  it("rechaza un link con URL inválida", () => {
    expect(JuniorOnboardingSchema.safeParse({ ...valido, link_github: "no-es-url" }).success).toBe(false);
  });
});

describe("EmpresaOnboardingSchema", () => {
  const valido = {
    tipo: "empresa",
    nombre_empresa: "Acme CR",
    sector: ["tech"],
    descripcion: "Una empresa de prueba",
    datos_legales: { ruc: "3-101-000000", direccion: "San José" },
    tipos_proyecto: ["web"],
  };

  it("acepta datos válidos", () => {
    expect(EmpresaOnboardingSchema.safeParse(valido).success).toBe(true);
  });

  it("exige tipo === 'empresa'", () => {
    expect(EmpresaOnboardingSchema.safeParse({ ...valido, tipo: "emprendedor" }).success).toBe(false);
  });

  it("rechaza si faltan los datos legales", () => {
    const { datos_legales: _omit, ...sinLegales } = valido;
    expect(EmpresaOnboardingSchema.safeParse(sinLegales).success).toBe(false);
  });
});

describe("EmprendedorOnboardingSchema", () => {
  const valido = {
    tipo: "emprendedor",
    nombre_proyecto: "MiApp",
    etapa: "mvp",
    soporte_tecnico: ["web"],
    presupuesto: "range_500_1000",
  };

  it("acepta datos válidos", () => {
    expect(EmprendedorOnboardingSchema.safeParse(valido).success).toBe(true);
  });

  it("rechaza una etapa inválida", () => {
    expect(EmprendedorOnboardingSchema.safeParse({ ...valido, etapa: "unicornio" }).success).toBe(false);
  });

  it("rechaza un presupuesto fuera del enum", () => {
    expect(EmprendedorOnboardingSchema.safeParse({ ...valido, presupuesto: "millones" }).success).toBe(false);
  });
});

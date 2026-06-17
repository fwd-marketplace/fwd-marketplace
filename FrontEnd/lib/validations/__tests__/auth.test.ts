import { describe, it, expect } from "vitest";
import {
  JuniorProfileSchema,
  EmpresaProfileSchema,
  EmprendedorProfileSchema,
  ResetPasswordSchema,
} from "../auth";

describe("ResetPasswordSchema", () => {
  const VALID_RESET = {
    email: "maria@ejemplo.com",
    password: "supersegura",
    confirmPassword: "supersegura",
  };

  it("acepta datos válidos", () => {
    expect(ResetPasswordSchema.safeParse(VALID_RESET).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(
      ResetPasswordSchema.safeParse({ ...VALID_RESET, email: "no-es-correo" }).success,
    ).toBe(false);
  });

  it("rechaza una contraseña de menos de 8 caracteres", () => {
    expect(
      ResetPasswordSchema.safeParse({ ...VALID_RESET, password: "1234", confirmPassword: "1234" })
        .success,
    ).toBe(false);
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    const result = ResetPasswordSchema.safeParse({
      ...VALID_RESET,
      confirmPassword: "otraDistinta",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });
});

/* ── JuniorProfileSchema ─────────────────────────────────── */
describe("JuniorProfileSchema", () => {
  const VALID_JUNIOR = {
    nombre: "María",
    apellido1: "García",
    apellido2: "López",
    cedula: "1-1234-5678",
    specialization: "frontend" as const,
    modalities: ["remote"] as const,
    availability: "immediate" as const,
    techStack: ["React", "TypeScript"],
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    bio: undefined,
  };

  it("accepts a valid junior profile", () => {
    expect(JuniorProfileSchema.safeParse(VALID_JUNIOR).success).toBe(true);
  });

  it("accepts a profile with all optional fields filled", () => {
    const result = JuniorProfileSchema.safeParse({
      ...VALID_JUNIOR,
      githubUrl: "https://github.com/user",
      linkedinUrl: "https://linkedin.com/in/user",
      portfolioUrl: "https://user.dev",
      bio: "Desarrolladora frontend apasionada por React.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when nombre is too short", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, nombre: "A" }).success
    ).toBe(false);
  });

  it("rejects an invalid specialization", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, specialization: "devops" }).success
    ).toBe(false);
  });

  it("rejects empty modalities array", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, modalities: [] }).success
    ).toBe(false);
  });

  it("rejects empty techStack array", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, techStack: [] }).success
    ).toBe(false);
  });

  it("rejects an invalid URL for githubUrl", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, githubUrl: "not-a-url" }).success
    ).toBe(false);
  });

  it("rejects bio longer than 500 chars", () => {
    expect(
      JuniorProfileSchema.safeParse({ ...VALID_JUNIOR, bio: "a".repeat(501) }).success
    ).toBe(false);
  });
});

/* ── EmpresaProfileSchema ────────────────────────────────── */
describe("EmpresaProfileSchema", () => {
  const VALID_EMPRESA = {
    companyName: "TechCR S.A.",
    sectors: ["tech"] as const,
    description: "Empresa de software enfocada en soluciones logísticas.",
    websiteUrl: "https://techcr.com",
    cedulaJuridica: "3-101-123456",
    direccion: "San José, Costa Rica",
    projectTypes: ["web"] as const,
    logoUrl: undefined,
  };

  it("accepts a valid empresa profile", () => {
    expect(EmpresaProfileSchema.safeParse(VALID_EMPRESA).success).toBe(true);
  });

  it("accepts multiple sectors and project types", () => {
    const result = EmpresaProfileSchema.safeParse({
      ...VALID_EMPRESA,
      sectors: ["tech", "fintech"],
      projectTypes: ["web", "mobile", "ai"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts with optional logoUrl", () => {
    const result = EmpresaProfileSchema.safeParse({
      ...VALID_EMPRESA,
      logoUrl: "https://techcr.com/logo.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when companyName is too short", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, companyName: "X" }).success
    ).toBe(false);
  });

  it("rejects empty sectors array", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, sectors: [] }).success
    ).toBe(false);
  });

  it("rejects description shorter than 10 chars", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, description: "Corta" }).success
    ).toBe(false);
  });

  it("rejects description longer than 300 chars", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, description: "a".repeat(301) }).success
    ).toBe(false);
  });

  it("rejects an invalid websiteUrl", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, websiteUrl: "techcr.com" }).success
    ).toBe(false);
  });

  it("rejects empty projectTypes array", () => {
    expect(
      EmpresaProfileSchema.safeParse({ ...VALID_EMPRESA, projectTypes: [] }).success
    ).toBe(false);
  });
});

/* ── EmprendedorProfileSchema ────────────────────────────── */
describe("EmprendedorProfileSchema", () => {
  const VALID_EMPRENDEDOR = {
    projectName: "EcoLogik",
    stage: "mvp" as const,
    neededSupport: ["web", "backend"] as const,
    budget: "range_500_1000" as const,
    description: undefined,
  };

  it("accepts a valid emprendedor profile", () => {
    expect(EmprendedorProfileSchema.safeParse(VALID_EMPRENDEDOR).success).toBe(true);
  });

  it("accepts with optional description", () => {
    const result = EmprendedorProfileSchema.safeParse({
      ...VALID_EMPRENDEDOR,
      description: "App para conectar productores locales con consumidores.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when projectName is too short", () => {
    expect(
      EmprendedorProfileSchema.safeParse({ ...VALID_EMPRENDEDOR, projectName: "X" }).success
    ).toBe(false);
  });

  it("rejects an invalid stage", () => {
    expect(
      EmprendedorProfileSchema.safeParse({ ...VALID_EMPRENDEDOR, stage: "launched" }).success
    ).toBe(false);
  });

  it("rejects empty neededSupport array", () => {
    expect(
      EmprendedorProfileSchema.safeParse({ ...VALID_EMPRENDEDOR, neededSupport: [] }).success
    ).toBe(false);
  });

  it("rejects an invalid budget value", () => {
    expect(
      EmprendedorProfileSchema.safeParse({ ...VALID_EMPRENDEDOR, budget: "free" }).success
    ).toBe(false);
  });

  it("rejects description longer than 400 chars", () => {
    expect(
      EmprendedorProfileSchema.safeParse({
        ...VALID_EMPRENDEDOR,
        description: "a".repeat(401),
      }).success
    ).toBe(false);
  });
});

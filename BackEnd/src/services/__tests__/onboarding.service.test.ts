import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  JuniorOnboarding,
  EmpresaOnboarding,
  EmprendedorOnboarding,
} from "../../validations/onboarding";

/**
 * El onboarding ahora corre vía RPC transaccional (ver migración 0019). El mock
 * captura la llamada y devuelve la respuesta configurada para cada función.
 */
const { state } = vi.hoisted(() => ({
  state: {
    result: { error: null as unknown },
    calls: [] as Array<{ fn: string; args: Record<string, unknown> }>,
  },
}));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => ({
    rpc: (fn: string, args: Record<string, unknown>) => {
      state.calls.push({ fn, args });
      return Promise.resolve(state.result);
    },
  }),
}));

import { onboardJunior, onboardEmpresa, onboardEmprendedor } from "../onboarding.service";

const TOKEN = "token";
const USER = "user-1";
const CORREO = "user@example.com";

const juniorInput: JuniorOnboarding = {
  nombre: "Ana",
  apellido1: "Soto",
  apellido2: "Jimenez",
  cedula: "1-2345-6789",
  especializacion: "frontend",
  modalidad: ["remote"],
  disponibilidad: "immediate",
  tech_stack: ["React"],
  link_github: "",
  link_linkedin: "",
  link_portfolio: "",
  bio: "Hola",
};

const empresaInput: EmpresaOnboarding = {
  tipo: "empresa",
  nombre_empresa: "Acme CR",
  sector: ["tech"],
  descripcion: "Software a medida",
  datos_legales: { ruc: "3-101-000000", direccion: "San Jose" },
  tipos_proyecto: ["web"],
};

const emprendedorInput: EmprendedorOnboarding = {
  tipo: "emprendedor",
  nombre_proyecto: "MiApp",
  etapa: "mvp",
  soporte_tecnico: ["web"],
  presupuesto: "range_500_1000",
  descripcion: "Una app",
};

beforeEach(() => {
  state.result = { error: null };
  state.calls = [];
});

describe("onboardJunior", () => {
  it("llama al RPC onboard_junior y devuelve student/pendiente", async () => {
    const result = await onboardJunior(TOKEN, USER, CORREO, juniorInput);

    expect(result).toEqual({ role: "student", estado_cuenta: "pendiente" });
    expect(state.calls[0]?.fn).toBe("onboard_junior");
    // El locale/arrays se serializan; el user id se propaga.
    expect(state.calls[0]?.args).toMatchObject({
      p_user_id: USER,
      p_correo: CORREO,
      p_modalidad: JSON.stringify(["remote"]),
      p_tech_stack: ["React"],
    });
  });

  it("rechaza (409) si el usuario ya completó onboarding", async () => {
    state.result = { error: { code: "P0001", message: "ALREADY_ONBOARDED" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rechaza (403) si intenta onboardear otra cuenta (FORBIDDEN)", async () => {
    state.result = { error: { code: "42501", message: "FORBIDDEN" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rechaza (500) si falta el rol en la BD (seeds no aplicados)", async () => {
    state.result = { error: { code: "P0002", message: "MISSING_ROLE" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("propaga (400) ante un error genérico del RPC", async () => {
    state.result = { error: { code: "23502", message: "null value" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("onboardEmpresa", () => {
  it("llama al RPC onboard_empresa y devuelve company/pendiente", async () => {
    const result = await onboardEmpresa(TOKEN, USER, CORREO, empresaInput);

    expect(result).toEqual({ role: "company", estado_cuenta: "pendiente" });
    expect(state.calls[0]?.fn).toBe("onboard_empresa");
    expect(state.calls[0]?.args).toMatchObject({
      p_nombre_comercial: "Acme CR",
      p_cedula_juridica: "3-101-000000",
    });
  });

  it("rechaza (409) si el usuario ya completó onboarding", async () => {
    state.result = { error: { code: "P0001", message: "ALREADY_ONBOARDED" } };
    await expect(onboardEmpresa(TOKEN, USER, CORREO, empresaInput)).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe("onboardEmprendedor", () => {
  it("llama al RPC onboard_emprendedor y devuelve company/pendiente", async () => {
    const result = await onboardEmprendedor(TOKEN, USER, CORREO, emprendedorInput);

    expect(result).toEqual({ role: "company", estado_cuenta: "pendiente" });
    expect(state.calls[0]?.fn).toBe("onboard_emprendedor");
  });
});
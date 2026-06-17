import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  JuniorOnboarding,
  EmpresaOnboarding,
  EmprendedorOnboarding,
} from "../../validations/onboarding";

/** Respuestas por tabla + registro de los `delete()` para verificar el rollback. */
const { responses, tracker } = vi.hoisted(() => ({
  responses: {} as Record<string, { data: unknown; error: unknown }>,
  tracker: { deletes: [] as string[] },
}));

// Builder encadenable: los terminales (maybeSingle/single) y el await directo
// (`then`) resuelven la respuesta configurada para la última tabla usada en
// `from()`. El onboarding es secuencial (await entre cada `from`), así que un
// builder singleton basta. Mismo patrón que perfil.service.test / oferta.service.test.
vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    let table = "";
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      from: (t: string) => {
        table = t;
        return builder;
      },
      select: chain,
      insert: chain,
      update: chain,
      delete: () => {
        tracker.deletes.push(table);
        return builder;
      },
      eq: chain,
      in: chain,
      order: chain,
      maybeSingle: () => Promise.resolve(responses[table] ?? { data: null, error: null }),
      single: () => Promise.resolve(responses[table] ?? { data: null, error: null }),
      then: (resolve: (value: unknown) => unknown) =>
        resolve(responses[table] ?? { data: null, error: null }),
    });
    return builder;
  },
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
  for (const key of Object.keys(responses)) delete responses[key];
  tracker.deletes = [];
});

describe("onboardJunior", () => {
  /** users sin onboarding previo (data null) + inserts OK; rol y estudiante OK. */
  function happyPath() {
    responses["users"] = { data: null, error: null };
    responses["roles"] = { data: { id: "role-student" }, error: null };
    responses["estudiante"] = { data: { id: "est-1" }, error: null };
    responses["skills"] = { data: [{ id: "s1", nombre: "React" }], error: null };
    responses["student_skills"] = { data: null, error: null };
  }

  it("crea users + estudiante + skills y devuelve student/pendiente", async () => {
    happyPath();
    const result = await onboardJunior(TOKEN, USER, CORREO, juniorInput);
    expect(result).toEqual({ role: "student", estado_cuenta: "pendiente" });
  });

  it("rechaza (409) si el usuario ya completó onboarding", async () => {
    happyPath();
    responses["users"] = { data: { id: USER }, error: null };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rechaza (500) si falta el rol en la BD (seeds no aplicados)", async () => {
    happyPath();
    responses["roles"] = { data: null, error: null };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("propaga (400) si falla la creación del estudiante", async () => {
    happyPath();
    responses["estudiante"] = { data: null, error: { message: "boom" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("limpia la fila users (rollback) si falla un paso posterior", async () => {
    happyPath();
    responses["estudiante"] = { data: null, error: { message: "boom" } };
    await expect(onboardJunior(TOKEN, USER, CORREO, juniorInput)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(tracker.deletes).toContain("users");
  });
});

describe("onboardEmpresa", () => {
  it("crea users + empresario y devuelve company/pendiente", async () => {
    responses["users"] = { data: null, error: null };
    responses["roles"] = { data: { id: "role-company" }, error: null };
    responses["empresario"] = { data: null, error: null };
    const result = await onboardEmpresa(TOKEN, USER, CORREO, empresaInput);
    expect(result).toEqual({ role: "company", estado_cuenta: "pendiente" });
  });

  it("rechaza (409) si el usuario ya completó onboarding", async () => {
    responses["users"] = { data: { id: USER }, error: null };
    await expect(onboardEmpresa(TOKEN, USER, CORREO, empresaInput)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("propaga (400) si falla la creación del empresario", async () => {
    responses["users"] = { data: null, error: null };
    responses["roles"] = { data: { id: "role-company" }, error: null };
    responses["empresario"] = { data: null, error: { message: "boom" } };
    await expect(onboardEmpresa(TOKEN, USER, CORREO, empresaInput)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("onboardEmprendedor", () => {
  it("crea users + empresario(emprendedor) y devuelve company/pendiente", async () => {
    responses["users"] = { data: null, error: null };
    responses["roles"] = { data: { id: "role-company" }, error: null };
    responses["empresario"] = { data: null, error: null };
    const result = await onboardEmprendedor(TOKEN, USER, CORREO, emprendedorInput);
    expect(result).toEqual({ role: "company", estado_cuenta: "pendiente" });
  });
});
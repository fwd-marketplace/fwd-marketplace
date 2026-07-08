import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Estado compartido del mock: la respuesta del `maybeSingle()` terminal y el
 * payload capturado del `update()` (para verificar el estado_cuenta enviado).
 */
const { state, adminState } = vi.hoisted(() => ({
  state: {
    response: { data: null as unknown, error: null as unknown },
    byTable: {} as Record<string, { data: unknown; error: unknown }>,
    lastUpdate: null as Record<string, unknown> | null,
  },
  // Estado del cliente service_role (createUser/createCompany): respuestas por tabla,
  // tablas en las que se llamó `insert()` y cuántas veces se borró el auth user (rollback).
  adminState: {
    byTable: {} as Record<string, { data: unknown; error: unknown }>,
    insertedTables: [] as string[],
    createUserError: null as unknown,
    createdUserId: "new-user-id",
    deleteUserCalls: 0,
  },
}));

vi.mock("../../config/env", () => ({ env: { supabaseServiceKey: "service-key" } }));

vi.mock("../../config/supabase", () => ({
  supabaseForToken: () => {
    let table = "";
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    // Resuelve la respuesta de la última tabla usada en `from()` (o la global).
    const resolve = () => Promise.resolve(state.byTable[table] ?? state.response);
    Object.assign(builder, {
      from: (t: string) => {
        table = t;
        return builder;
      },
      update: (payload: Record<string, unknown>) => {
        state.lastUpdate = payload;
        return builder;
      },
      select: chain,
      eq: chain,
      in: resolve,
      order: resolve,
      maybeSingle: resolve,
    });
    return builder;
  },
  supabaseAdmin: () => {
    let table = "";
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    const resolve = () => Promise.resolve(adminState.byTable[table] ?? { data: null, error: null });
    Object.assign(builder, {
      auth: {
        admin: {
          createUser: () =>
            Promise.resolve(
              adminState.createUserError
                ? { data: { user: null }, error: adminState.createUserError }
                : { data: { user: { id: adminState.createdUserId } }, error: null },
            ),
          deleteUser: () => {
            adminState.deleteUserCalls += 1;
            return Promise.resolve({ data: null, error: null });
          },
        },
      },
      from: (t: string) => {
        table = t;
        return builder;
      },
      insert: () => {
        adminState.insertedTables.push(table);
        return builder;
      },
      select: chain,
      eq: chain,
      maybeSingle: resolve,
      then: (onFulfilled: (value: unknown) => unknown) =>
        onFulfilled(adminState.byTable[table] ?? { data: null, error: null }),
    });
    return builder;
  },
}));

import {
  approveUser,
  rejectUser,
  suspendUser,
  createUser,
  listAllStudents,
  listPendingStudents,
  verifyStudent,
  rejectStudent,
} from "../admin.service";

const TOKEN = "token";
const USER = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
  state.response = { data: null, error: null };
  state.byTable = {};
  state.lastUpdate = null;
  adminState.byTable = {};
  adminState.insertedTables = [];
  adminState.createUserError = null;
  adminState.createdUserId = "new-user-id";
  adminState.deleteUserCalls = 0;
});

describe("admin.service — cambios de estado de cuenta", () => {
  it("approveUser pone estado_cuenta = 'activa'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "activa" }, error: null };
    const result = await approveUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "activa" });
    expect(result).toMatchObject({ estado_cuenta: "activa" });
  });

  it("rejectUser pone estado_cuenta = 'rechazada'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "rechazada" }, error: null };
    await rejectUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "rechazada" });
  });

  it("suspendUser pone estado_cuenta = 'suspendida'", async () => {
    state.response = { data: { id: USER, estado_cuenta: "suspendida" }, error: null };
    await suspendUser(TOKEN, USER);
    expect(state.lastUpdate).toMatchObject({ estado_cuenta: "suspendida" });
  });

  it("lanza 404 si el usuario no existe", async () => {
    state.response = { data: null, error: null };
    await expect(rejectUser(TOKEN, USER)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("propaga un error de Supabase como 400", async () => {
    state.response = { data: null, error: { message: "boom" } };
    await expect(suspendUser(TOKEN, USER)).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("admin.service — verificación de egresados FWD", () => {
  const ESTUDIANTE = "660e8400-e29b-41d4-a716-446655440000";

  it("listAllStudents devuelve los estudiantes con sus skills aplanadas", async () => {
    state.byTable = {
      estudiante: {
        data: [
          {
            id: ESTUDIANTE,
            especialidad: "frontend",
            titulo_fwd: "Cohorte 2026",
            estado_verificacion: "verificado",
            usuario: { id: "u1", nombre: "Ana", apellido1: "Soto", correo: "ana@x.com" },
          },
        ],
        error: null,
      },
      student_skills: { data: [{ id_estudiante: ESTUDIANTE, id_skill: "s1" }], error: null },
      skills: { data: [{ id: "s1", nombre: "React" }], error: null },
    };

    const result = await listAllStudents(TOKEN);

    expect(result).toHaveLength(1);
    expect(result[0]?.skills).toEqual(["React"]);
  });

  it("listAllStudents devuelve [] si no hay estudiantes", async () => {
    state.byTable = { estudiante: { data: [], error: null } };
    const result = await listAllStudents(TOKEN);
    expect(result).toEqual([]);
  });

  it("listPendingStudents devuelve la lista de pendientes", async () => {
    state.response = {
      data: [{ id: ESTUDIANTE, titulo_fwd: "Cohorte 2026", estado_verificacion: "pendiente" }],
      error: null,
    };
    const result = await listPendingStudents(TOKEN);
    expect(result).toHaveLength(1);
  });

  it("verifyStudent pone estado_verificacion = 'verificado'", async () => {
    state.response = { data: { id: ESTUDIANTE, estado_verificacion: "verificado" }, error: null };
    const result = await verifyStudent(TOKEN, ESTUDIANTE);
    expect(state.lastUpdate).toMatchObject({ estado_verificacion: "verificado" });
    expect(result).toMatchObject({ estado_verificacion: "verificado" });
  });

  it("rejectStudent pone estado_verificacion = 'rechazado'", async () => {
    state.response = { data: { id: ESTUDIANTE, estado_verificacion: "rechazado" }, error: null };
    await rejectStudent(TOKEN, ESTUDIANTE);
    expect(state.lastUpdate).toMatchObject({ estado_verificacion: "rechazado" });
  });

  it("lanza 404 si el estudiante no existe", async () => {
    state.response = { data: null, error: null };
    await expect(verifyStudent(TOKEN, ESTUDIANTE)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("admin.service — creación de usuarios", () => {
  const BASE_INPUT = { correo: "nuevo@x.com", password: "supersecreta", nombre: "Nuevo" };

  function seedSuccessfulCreate() {
    adminState.byTable["roles"] = { data: { id: "role-id" }, error: null };
    adminState.byTable["users"] = {
      data: { id: "new-user-id", nombre: "Nuevo", correo: "nuevo@x.com" },
      error: null,
    };
  }

  it("crea también la fila `estudiante` cuando el rol es student", async () => {
    seedSuccessfulCreate();
    adminState.byTable["estudiante"] = { data: null, error: null };

    const row = await createUser({ ...BASE_INPUT, rol: "student" });

    expect(adminState.insertedTables).toContain("users");
    expect(adminState.insertedTables).toContain("estudiante");
    expect(adminState.deleteUserCalls).toBe(0);
    expect(row).toMatchObject({ id: "new-user-id" });
  });

  it("hace rollback del auth user si falla el insert de `estudiante`", async () => {
    seedSuccessfulCreate();
    adminState.byTable["estudiante"] = { data: null, error: { message: "rls" } };

    await expect(createUser({ ...BASE_INPUT, rol: "student" })).rejects.toMatchObject({ statusCode: 400 });
    expect(adminState.deleteUserCalls).toBe(1);
  });

  it("no crea fila `estudiante` para roles que no son student", async () => {
    seedSuccessfulCreate();

    await createUser({ ...BASE_INPUT, rol: "admin" });

    expect(adminState.insertedTables).toContain("users");
    expect(adminState.insertedTables).not.toContain("estudiante");
    expect(adminState.deleteUserCalls).toBe(0);
  });
});

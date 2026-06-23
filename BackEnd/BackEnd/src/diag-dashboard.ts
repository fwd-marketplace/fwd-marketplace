import { supabaseAdmin } from "./config/supabase";

console.log(">>> diag start");

async function main() {
  const db = supabaseAdmin();
  console.log(">>> querying...");

  const { data: users, error: usersErr } = await db
    .from("users")
    .select("id, estado_cuenta, role:roles(nombre)");

  if (usersErr) {
    console.error("ERROR leyendo users:", usersErr.message);
    process.exit(1);
  }

  const byRoleState: Record<string, number> = {};
  for (const u of users ?? []) {
    const role = (u as { role?: { nombre?: string } }).role?.nombre ?? "sin_rol";
    const estado = (u as { estado_cuenta?: string }).estado_cuenta ?? "sin_estado";
    const key = `${role} / ${estado}`;
    byRoleState[key] = (byRoleState[key] ?? 0) + 1;
  }

  console.log("=== users por (rol / estado_cuenta) ===");
  console.log(`TOTAL usuarios: ${users?.length ?? 0}`);
  for (const [key, count] of Object.entries(byRoleState).sort()) {
    console.log(`  ${key}: ${count}`);
  }

  const { data: estudiantes, error: estErr } = await db
    .from("estudiante")
    .select("id, estado_verificacion");

  console.log("\n=== estudiante por estado_verificacion ===");
  if (estErr) {
    console.error("ERROR leyendo estudiante:", estErr.message);
  } else {
    const byVer: Record<string, number> = {};
    for (const e of estudiantes ?? []) {
      const v = (e as { estado_verificacion?: string }).estado_verificacion ?? "sin_estado";
      byVer[v] = (byVer[v] ?? 0) + 1;
    }
    console.log(`TOTAL estudiantes: ${estudiantes?.length ?? 0}`);
    for (const [key, count] of Object.entries(byVer).sort()) {
      console.log(`  ${key}: ${count}`);
    }
  }

  const { data: empresas, error: empErr } = await db
    .from("empresario")
    .select("id, tipo");
  console.log("\n=== empresario (total) ===");
  if (empErr) console.error("ERROR leyendo empresario:", empErr.message);
  else console.log(`TOTAL empresarios: ${empresas?.length ?? 0}`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(">>> diag error:", e);
  process.exit(1);
});

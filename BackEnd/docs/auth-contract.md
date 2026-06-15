# Contrato de API — Autenticación, Onboarding y Aprobación

> **Última actualización:** 2026-06-15 · Fase 1 (auth + onboarding + aprobación/rechazo/suspensión) + sesión (refresh / logout).
> Este archivo es la **fuente de verdad** del contrato. Si te pasan una versión nueva,
> **reemplazá el archivo completo** — no fusiones a mano (evita arrastrar frases viejas).

Para el equipo de FrontEnd. Define cómo consumir el BackEnd para registro, login,
onboarding, manejo de sesión y el flujo de aprobación por admin.

- **Base URL:** `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`)
- **Auth:** en rutas protegidas, enviar `Authorization: Bearer <access_token>`.
- **Errores:** siempre `{ "error": "mensaje legible" }` con el status HTTP correspondiente.

## Flujo general

```
1. register (email+password)   -> crea cuenta en Supabase Auth, devuelve sesion (tokens)
2. /register/role  (solo UI)   -> el FE elige junior | empresa | emprendedor
3. onboarding/{rol}  (Bearer)  -> crea el perfil en la BD; la cuenta queda 'pendiente'
4. /done                       -> "Tu cuenta esta en revision"
5. un admin aprueba            -> estado_cuenta = 'activa'
6. login                       -> el FE lee estado_cuenta y rol para enrutar
   durante la sesion: refresh al expirar el token; logout al salir (ver "Manejo de sesion")
```

## Manejo de sesión (httpOnly) — leer con atención

El BackEnd devuelve `session.access_token` y `session.refresh_token` en el JSON de
`register` / `login` / `refresh`. El **route handler de Next** los guarda en cookies
**httpOnly** (el JS del navegador no puede escribir httpOnly) y en cada llamada reenvía
el `access_token` como `Authorization: Bearer <access_token>`.

- **`access_token`**: JWT, dura ~1h, no se revoca (expira solo). Es el que va en `Bearer`.
- **`refresh_token`**: sirve para pedir un `access_token` nuevo; se revoca en logout.

**Ciclo recomendado** (evita mandar al usuario a login cada hora):
1. Una llamada protegida responde `401` ("Token inválido o expirado").
2. El route handler llama `POST /users/refresh` con el `refresh_token` de la cookie.
3. Si `200` → reescribe **ambas** cookies con los tokens nuevos y **reintenta** la llamada original (una sola vez).
4. Si `401` → el refresh ya no sirve → borrar cookies y mandar a `/login`.

**Logout:** llamar `POST /users/logout` con el `refresh_token` y **borrar** las dos cookies.

**Enrutado por estado/rol** (tras login o en `/me`):
- `estado_cuenta = 'pendiente'` -> pantalla "cuenta en revisión".
- `estado_cuenta = 'activa'` -> dashboard según `role`: `student` | `company` | `admin`.
- `estado_cuenta = 'suspendida' | 'rechazada'` -> acceso denegado.
- `profile = null` (en `/me`) -> la cuenta existe en Auth pero falta onboarding -> mandar a `/register/role`.

---

## Endpoints

### POST /api/users/register
Body: `{ "email": string, "password": string }`
→ `201 { user, session }` — `session.access_token` es el JWT a guardar.

### POST /api/users/login
Body: `{ "email": string, "password": string }`
→ `200 { user, session }`

### GET /api/users/me  (Bearer)
→ `200 { user, profile }`
`profile` es `null` si aún no hizo onboarding. Si existe:
```json
{ "id": "...", "nombre": "...", "apellido1": "...", "cedula": "...",
  "correo": "...", "estado_cuenta": "pendiente", "role": { "nombre": "student" } }
```

### POST /api/users/refresh
Renueva la sesión cuando el `access_token` expiró (~1h). **No** lleva Bearer.
Body: `{ "refresh_token": string }`
→ `200 { user, session }` — `session` trae un `access_token` y un `refresh_token` nuevos.
→ `401 { "error": "Refresh token inválido o expirado" }` si el refresh ya no sirve.
Cuándo y cómo usarlo: ver **"Manejo de sesión"** arriba.

### POST /api/users/logout
Revoca el `refresh_token` en Supabase Auth. **No** lleva Bearer.
Body: `{ "refresh_token": string }`
→ `200 { "ok": true }` (idempotente: responde `200` aunque el token ya fuera inválido).
El FE debe además **borrar las cookies** httpOnly. Ver **"Manejo de sesión"** arriba.

### POST /api/users/onboarding/junior  (Bearer)
Crea `users` (estado `pendiente`) + `estudiante` + `student_skills`.
```json
{
  "nombre": "Ana", "apellido1": "Soto", "apellido2": "Jiménez", "cedula": "1-2345-6789",
  "especializacion": "frontend",
  "modalidad": ["remote", "hybrid"],
  "disponibilidad": "immediate",
  "tech_stack": ["React", "TypeScript"],
  "link_github": "https://github.com/ana", "link_linkedin": "", "link_portfolio": "",
  "bio": "..."
}
```
→ `201 { "role": "student", "estado_cuenta": "pendiente" }`

### POST /api/users/onboarding/empresa  (Bearer)
Crea `users` (`pendiente`) + `empresario` (`tipo='empresa'`).
```json
{
  "tipo": "empresa",
  "nombre_empresa": "Acme CR",
  "sector": ["tech", "fintech"],
  "descripcion": "...",
  "datos_legales": { "ruc": "3-101-000000", "direccion": "San José" },
  "tipos_proyecto": ["web", "mobile"]
}
```
→ `201 { "role": "company", "estado_cuenta": "pendiente" }`

### POST /api/users/onboarding/emprendedor  (Bearer)
Crea `users` (`pendiente`) + `empresario` (`tipo='emprendedor'`).
```json
{
  "tipo": "emprendedor",
  "nombre_proyecto": "MiApp",
  "etapa": "mvp",
  "soporte_tecnico": ["web", "ai"],
  "presupuesto": "range_500_1000",
  "descripcion": "..."
}
```
→ `201 { "role": "company", "estado_cuenta": "pendiente" }`

### GET /api/admin/users/pending  (Bearer admin)
→ `200 { users: [...] }` — cuentas en `pendiente`.

### PATCH /api/admin/users/:id/aprobar  (Bearer admin)
→ `200 { user: { id, estado_cuenta: "activa" } }`

### PATCH /api/admin/users/:id/rechazar  (Bearer admin)
Rechaza una cuenta pendiente. → `200 { user: { id, estado_cuenta: "rechazada" } }`

### PATCH /api/admin/users/:id/suspender  (Bearer admin)
Suspende una cuenta activa. → `200 { user: { id, estado_cuenta: "suspendida" } }`

---

## Mapeo de campos (FE → BD)

El BackEnd traduce; el FE conserva sus nombres.

| Campo FE | Columna BD |
| --- | --- |
| `nombre / apellido1 / apellido2 / cedula` | `users.*` (solo junior) |
| `nombre_empresa / nombre_proyecto` | `users.nombre` + `empresario.nombre_comercial` |
| `especializacion` | `estudiante.especialidad` |
| `modalidad[]` | `estudiante.modalidad_preferida` (JSON) |
| `disponibilidad` | `estudiante.disponibilidad` |
| `tech_stack[]` | `student_skills` (match contra `skills`) |
| `link_github / link_linkedin / link_portfolio` | `estudiante.url_github / url_linkedin / url_portfolio` |
| `bio` | `estudiante.descripcion` |
| `sector[]` | `empresario.sector` (JSON) |
| `datos_legales.ruc / .direccion` | `empresario.cedula_juridica / direccion` |
| `tipos_proyecto[]` | `empresario.tipos_proyecto` (JSON) |
| `soporte_tecnico[]` | `empresario.apoyo_tecnico_necesario` (JSON) |
| `etapa / presupuesto` | `empresario.*` |

### Notas
- `tech_stack`: solo se vinculan las tecnologías que existan en el catálogo `skills`
  (match por nombre, sin distinguir mayúsculas). Las desconocidas se ignoran; para
  añadirlas, el admin amplía el catálogo.
- `modalidad`, `sector`, `tipos_proyecto`, `soporte_tecnico` se guardan como **JSON**
  en columnas de texto (MVP); el FE debe parsearlos al leer.
- **Pendiente (Fase 3):** login con Google/GitHub (OAuth).

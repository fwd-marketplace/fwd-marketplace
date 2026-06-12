# Contrato de API — Autenticación, Onboarding y Aprobación

Para el equipo de FrontEnd. Define cómo consumir el BackEnd para registro, login,
onboarding y el flujo de aprobación por admin. Implementado en la Fase 1.

- **Base URL:** `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`)
- **Auth:** en rutas protegidas, enviar `Authorization: Bearer <access_token>`.
- **Errores:** siempre `{ "error": "mensaje legible" }` con el status HTTP correspondiente.

## Flujo general

```
1. register (email+password)      -> crea cuenta en Supabase Auth, devuelve sesión (token)
2. /register/role  (solo UI)      -> el FE elige junior | empresa | emprendedor
3. onboarding/{rol}  (Bearer)     -> crea el perfil en la BD; la cuenta queda 'pendiente'
4. /done                          -> "Tu cuenta está en revisión"
5. un admin aprueba               -> estado_cuenta = 'activa'
6. login                          -> el FE lee estado_cuenta y rol para enrutar
```

**Sesión (httpOnly):** el BackEnd devuelve el `access_token` en el JSON. La cookie
**httpOnly** la setea un **route handler de Next** (el JS del navegador no puede
escribir httpOnly). En cada llamada, Next reenvía ese token como `Authorization: Bearer`.

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

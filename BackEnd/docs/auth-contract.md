# Contrato de API — Autenticación, Onboarding y Aprobación

> **Última actualización:** 2026-06-15 · Fase 1 (auth + onboarding + edición de perfil + aprobación/rechazo/suspensión) + sesión (refresh / logout).
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

> **Rate limiting (auth).** Las rutas sensibles están limitadas por IP. Al exceder el cupo
> responden **`429 { "error": "..." }`** con header **`Retry-After`** (segundos a esperar).
> El FE debe manejar el `429` (mostrar el mensaje y deshabilitar el botón hasta `Retry-After`).
> Cupos actuales: `login` 10/15min · `register` 10/60min · `reset-password` 5/15min ·
> `reset-password/confirm` 10/15min.

### POST /api/users/register
Body: `{ "email": string, "password": string }`
→ `201 { user, session }` — `session.access_token` es el JWT a guardar.

### POST /api/users/login
Body: `{ "email": string, "password": string }`
**2FA OBLIGATORIO:** si la contraseña es correcta, NO devuelve la sesión todavía; manda un
código de 6 dígitos al correo y responde:
→ `200 { "mfa_required": true, "ticket": "uuid" }`
El FrontEnd guarda el `ticket`, pide el código al usuario y lo confirma en el endpoint de abajo.
(El login social Google/GitHub queda EXENTO del 2FA — ver "Login social".)

### POST /api/users/login/verify-otp
Paso 2 del login: valida el código de 6 dígitos enviado por email. **No** lleva Bearer.
Body: `{ "ticket": string, "code": string }`  (`code` = 6 dígitos)
→ `200 { user, session }` — recién aquí se entrega la sesión (el FE setea las cookies httpOnly).
→ `401` si el código es inválido, expiró (10 min) o se agotaron los intentos (5).
→ `400` si falta el ticket o el código no es de 6 dígitos.

### POST /api/users/reset-password
Dispara el correo de recuperación de contraseña (Supabase Auth). **No** lleva Bearer.
Body: `{ "email": string, "locale"?: "es" | "en" }` — el email (no se manda contraseña: quien
la olvidó no la sabe; el usuario fija la nueva desde el enlace del correo) y, opcional, el
`locale` activo para que el enlace del correo abra la página en ese idioma (default `es` si no
se manda o no es soportado).
→ `200 { "ok": true }` — idempotente: responde `200` aunque el email no exista, para no
revelar qué cuentas están registradas.

### GET /api/users/me  (Bearer)
→ `200 { user, profile }`
`profile` es `null` si aún no hizo onboarding. Si existe, trae los campos base de `users` +
el rol y, **según el rol, anida los datos de su perfil** (`estudiante` o `empresario`):

Campos base (siempre que `profile` no sea `null`):
```json
{ "id": "...", "nombre": "...", "apellido1": "...", "apellido2": "...", "cedula": "...",
  "correo": "...", "estado_cuenta": "pendiente", "fecha_registro": "...",
  "role": { "nombre": "student" } }
```
(`apellido1`, `apellido2`, `cedula` pueden ser `null` para empresa/emprendedor.)

Si `role.nombre === "student"` añade `estudiante` (o `estudiante: null` si aún no creó la fila):
```json
{ "...campos base...",
  "estudiante": {
    "descripcion": "...", "especialidad": "...", "modalidad_preferida": "...",
    "disponibilidad": "...", "titulo_fwd": null, "reputacion": 0,
    "url_avatar": null, "url_github": null, "url_linkedin": null, "url_portfolio": null,
    "skills": ["React", "Node"] } }
```

Si `role.nombre === "company"` añade `empresario` (o `empresario: null` si aún no creó la fila):
```json
{ "...campos base...",
  "empresario": {
    "id": "...", "tipo": "empresa", "nombre_comercial": "...", "descripcion": "...",
    "sector": "...", "tipos_proyecto": "...", "apoyo_tecnico_necesario": "...",
    "cedula_juridica": "...", "direccion": "...", "url_sitio_web": "...",
    "etapa": "...", "presupuesto": "...", "url_logo": null } }
```

Para otros roles (p. ej. `admin`) `profile` trae solo los campos base, sin anidar.

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

### Recuperación de contraseña (2 pasos, sin Bearer)

Flujo correcto: pedir el correo → el usuario hace clic en el enlace → define la clave nueva.
```
1. POST /users/reset-password          { email, locale? }     -> Supabase envia el correo
2. el correo lleva a: /{locale}/nueva-contrasena?token_hash=...&type=recovery   (locale: es|en, default es)
3. POST /users/reset-password/confirm  { token_hash, password } -> cambia la clave
```

**POST /api/users/reset-password** — Body `{ "email": string, "locale"?: "es" | "en" }`
→ `200 { "ok": true }` siempre (no revela si el correo existe). El FE muestra "si el correo
existe, te enviamos un enlace". El `locale` (opcional) fija el idioma del enlace del correo;
default `es`.

**POST /api/users/reset-password/confirm** — Body `{ "token_hash": string, "password": string }`
- `token_hash`: viene en la query del enlace del correo (`?token_hash=...`).
- `password`: nueva contraseña (mínimo 8).
→ `200 { "ok": true }`. → `400` si el token es inválido/expiró o la clave es débil.

La página `/{locale}/nueva-contrasena` (p. ej. `/es/...` o `/en/...`) lee `token_hash` de la
URL y llama al confirm. Requiere SMTP configurado en Supabase (Resend) para que el correo llegue.

### Login social (OAuth Google / GitHub)

Flujo mediado por el BackEnd (el FrontEnd no habla con Supabase):
```
1. GET /api/users/oauth/:provider?locale=es   -> { url }   (provider: google | github)
2. el FE redirige el navegador a esa url
3. provider -> Supabase -> redirige a /es/auth/callback#access_token=...&refresh_token=...
4. la pagina /es/auth/callback lee los tokens del fragment, los valida con GET /me,
   setea las cookies httpOnly y enruta:
     - perfil = null  -> onboarding (el usuario de Google entra sin perfil)
     - perfil existe   -> dashboard segun rol/estado
```

**GET /api/users/oauth/:provider** — `provider` debe ser `google` o `github`. Query
opcional `locale` (default `es`) para el callback localizado. **No** lleva Bearer.
→ `200 { "url": "https://..." }` (URL de autorización a la que redirigir el navegador).
→ `400` si el provider no es soportado.

Notas:
- En `auth/callback` los tokens llegan en el **fragment** (`#`), igual que en recuperación:
  el FE los lee del hash y los manda a un server action que valida y setea cookies.
- Un usuario que entra por Google/GitHub queda **sin perfil** → `/me` devuelve `profile:null`
  → mandarlo a onboarding (se puede pre-llenar nombre/correo desde la identidad del provider).

### Valores permitidos en onboarding (enums estrictos) — mandar EXACTO

Estos campos son `enum`: si mandás un valor fuera de la lista, el BackEnd responde `400`.
```
junior.especializacion : "frontend" | "backend" | "fullstack" | "ia"
junior.disponibilidad  : "immediate" | "two_weeks" | "one_month" | "unavailable"
empresa.tipo           : "empresa"        (fijo)
emprendedor.tipo       : "emprendedor"    (fijo)
emprendedor.etapa      : "idea" | "mvp" | "validating" | "scaling"
emprendedor.presupuesto: "under_500" | "range_500_1000" | "range_1000_2500" | "flexible"
```
Los arrays `modalidad`, `tech_stack`, `sector`, `tipos_proyecto`, `soporte_tecnico` son
**libres** (cualquier string, mínimo 1 elemento); no dan `400` por valor, pero usá valores
consistentes. Límites: `nombre/apellido1` 1-100, `cedula` 1-20, `bio` máx 500,
`descripcion` empresa máx 300 / emprendedor máx 400.

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

### GET /api/users/me/perfil  (Bearer)
Devuelve el **propio** perfil para precargar el formulario de edición: el junior su fila
`estudiante`, la empresa o emprendedor su fila `empresario` (el BackEnd elige según el rol).
→ `200 { "perfil": { ...columnas de la fila... } }`, según el rol:
- **estudiante:** `id, descripcion, especialidad, titulo_fwd, modalidad_preferida,
  disponibilidad, url_avatar, url_github, url_linkedin, url_portfolio`.
- **empresario:** `id, tipo, nombre_comercial, descripcion, sector, tipos_proyecto,
  apoyo_tecnico_necesario, cedula_juridica, direccion, url_sitio_web, etapa, presupuesto`.

El GET **no** incluye `skills` (el `PATCH` sí las devuelve al sincronizarlas).
Errores: `403` sin onboarding o rol sin perfil editable (ej. admin); `404` si no existe la fila.
Los arrays (`modalidad_preferida`, `sector`, `tipos_proyecto`, `apoyo_tecnico_necesario`)
vienen como **JSON string** (hay que `JSON.parse()`).

### PATCH /api/users/me/perfil  (Bearer)
El usuario edita su **propio** perfil: el junior su fila `estudiante`, la empresa o
emprendedor su fila `empresario`. El BackEnd elige la tabla según el rol del usuario
(no hace falta mandarlo). Es una **actualización parcial**: mandá solo los campos a
cambiar, pero **al menos uno** (body vacío → `400`). Los enums son los mismos del
onboarding (valor fuera de lista → `400`).

Campos aceptados (todos opcionales, nombres del FE):

- **junior** (se reparten entre `users`, `estudiante` y `student_skills`):
  `nombre`, `apellido1`, `apellido2`, `bio`, `especializacion`, `titulo_fwd`,
  `modalidad[]`, `disponibilidad`, `skills[]`, `link_github`, `link_linkedin`, `link_portfolio`.
- **empresa / emprendedor** (`empresario`):
  `nombre_comercial`, `descripcion`, `sector[]`, `tipos_proyecto[]`, `soporte_tecnico[]`,
  `ruc`, `direccion`, `url_sitio_web`, `etapa`, `presupuesto`.

`skills[]` se sincroniza contra el catálogo `skills` (solo se guardan las que coinciden por
nombre; la respuesta del `PATCH` trae las realmente guardadas). `modalidad` puede ir vacía.

Body de ejemplo (junior):
```json
{ "nombre": "Ana", "bio": "Actualicé mi bio", "skills": ["React", "TypeScript"],
  "link_github": "https://github.com/ana", "modalidad": ["remote"] }
```
→ `200 { "perfil": { ...la fila actualizada (columnas de BD)..., "skills": ["React"] } }`
Los arrays se devuelven como **JSON string** (hay que `JSON.parse()`); `skills` viene como
array de nombres. Errores: `400` body inválido/vacío; `403` sin onboarding o rol sin perfil
editable (ej. admin); `404` si no existe la fila de perfil.

Notas de alcance: edita `users` (`nombre`, `apellido1`, `apellido2`), el perfil
(`estudiante` / `empresario`) y las `skills` del junior. **No** edita `cedula` ni `correo`
(los gestiona Supabase Auth) ni `estado_cuenta`/`estado_verificacion`. La foto de perfil se
sube por el endpoint aparte de abajo.

### POST /api/users/me/perfil/avatar  (Bearer)
Sube la foto de perfil del junior. Es **multipart/form-data** con el archivo en el campo
`file` (imagen, máx. 5 MB). El BackEnd la sube a Cloudinary (la API key/secret viven solo en
el BackEnd) y guarda la URL en `estudiante.url_avatar`.
→ `200 { "perfil": { "url_avatar": "https://..." } }`
Errores: `400` si no llega imagen o el tipo no es imagen; `500` si faltan las variables
`CLOUDINARY_*` en el `.env` del BackEnd.

### GET /api/admin/users/pending  (Bearer admin)
→ `200 { users: [...] }` — cuentas en `pendiente`.

### PATCH /api/admin/users/:id/aprobar  (Bearer admin)
→ `200 { user: { id, estado_cuenta: "activa" } }`

### PATCH /api/admin/users/:id/rechazar  (Bearer admin)
Rechaza una cuenta pendiente. → `200 { user: { id, estado_cuenta: "rechazada" } }`

### PATCH /api/admin/users/:id/suspender  (Bearer admin)
Suspende una cuenta activa. → `200 { user: { id, estado_cuenta: "suspendida" } }`

---

## Pendientes para el FrontEnd

Trabajo de FrontEnd que habilitan los endpoints de arriba (lo construye el grupo de FrontEnd;
el BackEnd ya expone la API). Marcá cada ítem como hecho cuando la pantalla lo consuma.

- **Manejar el `429` (rate limit) en auth.** `login`/`register`/`reset-password` pueden
  responder `429` con header `Retry-After` (segundos). Mostrar el mensaje del `error` y
  deshabilitar el botón hasta que pase ese tiempo, en vez de tratarlo como un error genérico.

- **Edición de perfil.** Pantalla para que el junior edite su perfil (`estudiante`) y la
  empresa/emprendedor el suyo (`empresario`). Precargar el formulario con `GET /api/users/me/perfil`
  y guardar con `PATCH /api/users/me/perfil` (actualización parcial: mandar solo los campos
  cambiados, al menos uno). Usar los mismos enums del onboarding.

- **Almacenamiento de sesión: SOLO cookies httpOnly, nunca localStorage.** El BackEnd
  devuelve los tokens en el JSON (no setea cookies él mismo); decidir dónde se guardan es
  responsabilidad del FrontEnd. Regla del proyecto: `access_token` y `refresh_token` viven
  **únicamente** en cookies **httpOnly** que escribe el route handler de Next (servidor), y
  **nunca** en `localStorage`, `sessionStorage` ni ninguna variable accesible por el JS del
  navegador (mitiga robo de token por XSS). El ejemplo de `fetch` del `BackEnd/README.md` que
  guarda `session.access_token` en una const es **solo ilustrativo del contrato**, no la forma
  de almacenarlo. Ver "Manejo de sesión (httpOnly)" arriba.

- **Recuperación de contraseña ("olvidé mi contraseña").** Pantalla con un input de email
  que llama `POST /api/users/reset-password` con `{ email, locale }` (mandar el `locale` activo
  —`es` o `en`— para que el enlace del correo abra `/{locale}/nueva-contrasena` en el idioma del
  usuario; si se omite, el BackEnd usa `es`) y muestra "te enviamos un correo" sin revelar si la
  cuenta existe. El enlace del correo de Supabase devuelve al usuario al FrontEnd para fijar la
  nueva contraseña (esa pantalla la resuelve el FE con el flujo de Supabase del lado del route
  handler de Next).

- **Registro con confirmación de email: `session` puede venir `null`.** Si el proyecto de
  Supabase tiene la confirmación por email activada (hoy lo está, ver
  `postman/RESULTADOS-PRUEBAS-TOKENS.md`), `POST /register` responde `201` con `session: null`
  (todavía no hay tokens). En ese caso el flujo `register -> onboarding (Bearer)` **no** puede
  seguir de corrido: el usuario debe confirmar el correo y hacer `login` para recién entonces
  tener token y completar el onboarding. La UI debe contemplar el estado "confirmá tu correo"
  tras el registro y no asumir que `register` siempre trae sesión. (Si el equipo decide
  desactivar la confirmación por email en Supabase para el MVP, este ítem desaparece.)

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

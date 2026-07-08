# Cambios de sesión — Edición de perfil, avatar con Cloudinary y recuperación de contraseña

Documento de referencia de los cambios realizados en esta sesión. Cubre tres bloques de
trabajo sobre el monorepo (`FrontEnd/` Next.js 15 + `BackEnd/` Express + Supabase):

1. Edición completa del perfil del estudiante (persistida en la base de datos).
2. Subida de foto de perfil (avatar) a Cloudinary.
3. Página de recuperación de contraseña.

---

## 1. Edición completa del perfil del estudiante

Antes, los formularios de edición del perfil del junior eran solo de estado local (no
persistían). Ahora cada dato se guarda vía la API.

### Campos editables y a qué tabla van

| Campo (UI)            | Columna / tabla en Supabase                 |
| --------------------- | ------------------------------------------- |
| Nombre y apellidos    | `users.nombre`, `apellido1`, `apellido2`    |
| Especialidad          | `estudiante.especialidad` (enum)            |
| Programa / Cohorte    | `estudiante.titulo_fwd`                     |
| Disponibilidad        | `estudiante.disponibilidad` (enum)          |
| Modalidades (badges)  | `estudiante.modalidad_preferida` (JSON)     |
| Biografía             | `estudiante.descripcion`                    |
| Enlaces               | `estudiante.url_github / url_linkedin / url_portfolio` |
| Skills                | `student_skills` (match contra catálogo `skills`) |
| Foto de perfil        | `estudiante.url_avatar` (nueva columna)     |
| Correo                | Solo lectura (lo gestiona Supabase Auth)    |

### BackEnd

- **`PATCH /api/users/me/perfil`** ahora reparte los campos a `users`, `estudiante` y
  `student_skills`. Las skills se sincronizan contra el catálogo `skills` por nombre
  (las que no coinciden no se guardan) y la respuesta devuelve las realmente guardadas.
- Especialidad y disponibilidad se validan como enums (coinciden con los `CHECK` de la BD).
- La modalidad ya no exige al menos un valor (puede quedar vacía al editar).

Archivos:
- `BackEnd/src/validations/perfil.ts` — `PerfilEstudianteSchema` ampliado (nombre,
  apellidos, `titulo_fwd`, `skills`, modalidad opcional).
- `BackEnd/src/services/perfil.service.ts` — reparto a tablas + sincronización de skills.
- `BackEnd/src/services/user.service.ts` — `getMyProfile` ahora devuelve `url_avatar`.
- `BackEnd/src/types/database.types.ts` — columna `url_avatar` añadida al tipo `estudiante`.

### FrontEnd

- `FrontEnd/components/comp-perfil-estudiante/PerfilUsuario.tsx` — formularios conectados
  a la API (estados de carga/error), especialidad y disponibilidad pasan a `select`,
  enlaces con formulario de edición propio, correo de solo lectura.
- `FrontEnd/lib/actions/perfil.ts` — server actions `updateStudentProfile` y
  `uploadStudentAvatar`.
- `FrontEnd/lib/api/types.ts` — tipos `StudentProfileUpdate`, `StudentPerfilResponse`,
  enums de especialidad/disponibilidad y `url_avatar`.
- `FrontEnd/app/[locale]/(public)/perfil-estudiante/page.tsx` y `types.ts` — modelo de
  perfil con partes de nombre, códigos de enum y `avatarUrl`.

---

## 2. Subida de foto de perfil (Cloudinary)

La subida se firma y ejecuta **solo en el BackEnd** (la API key/secret nunca llegan al
FrontEnd). El FrontEnd envía el archivo a la API; la API lo sube a Cloudinary y guarda la
URL pública en la base de datos.

### Endpoint nuevo

- **`POST /api/users/me/perfil/avatar`** (multipart, campo `file`, máx. 5 MB). Devuelve
  `{ perfil: { url_avatar } }`.

### Archivos

- `BackEnd/src/config/cloudinary.ts` — cliente de Cloudinary (configuración perezosa).
- `BackEnd/src/services/upload.service.ts` — subida del buffer vía `upload_stream`.
- `BackEnd/src/services/perfil.service.ts` — `updateMyAvatar` guarda la URL en `url_avatar`.
- `BackEnd/src/controllers/perfil.controller.ts` — `updateAvatar`.
- `BackEnd/src/routes/perfil.routes.ts` — ruta con `multer` (almacenamiento en memoria).
- `FrontEnd/components/layout/app-header.tsx` — muestra la foto o las iniciales.

### Variables de entorno (solo BackEnd)

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Son opcionales para el arranque: si faltan, el endpoint de subida responde 500 con un
mensaje claro y el resto de la API sigue funcionando. Placeholders en `BackEnd/.env.example`.

### Migración de base de datos (paso obligatorio)

`BackEnd/supabase/migrations/0015_estudiante_avatar.sql` agrega la columna `url_avatar`.
**Debe aplicarse en Supabase** (SQL Editor o `supabase db push`) antes de usar el perfil,
porque `GET /users/me` ya selecciona esa columna. Tras aplicarla, conviene regenerar
`database.types.ts` con el generador de Supabase.

### Dependencias nuevas (BackEnd)

`cloudinary`, `multer` y `@types/multer`.

---

## 3. Página de recuperación de contraseña

### Ruta

- `/{locale}/recuperar-contrasena` (grupo `(public)`).

### Archivos

- `FrontEnd/app/[locale]/(public)/recuperar-contrasena/page.tsx` — página (server component).
- `FrontEnd/components/auth/ResetPasswordForm.tsx` — formulario (correo, nueva contraseña
  y confirmación, con mostrar/ocultar), estados de carga/error y panel de éxito. Usa
  tokens FWD e identidad "FWD Talent".
- `FrontEnd/lib/validations/auth.ts` — `ResetPasswordSchema` (+ `MIN_PASSWORD_LENGTH`).
- `FrontEnd/lib/actions/auth.ts` — server action `resetPassword`.
- `FrontEnd/components/auth/LoginForm.tsx` — el enlace "¿Olvidaste tu contraseña?" ahora
  apunta a la nueva ruta.

### BackEnd

- **`POST /api/users/reset-password`** — envía el correo de recuperación con un enlace
  seguro usando `supabase.auth.resetPasswordForEmail`. Compatible con la clave publishable
  (sin service-role). Respuesta uniforme: no revela si el correo existe.
- `BackEnd/src/services/user.service.ts` — `requestPasswordReset`.
- `BackEnd/src/controllers/user.controller.ts` — `resetPassword`.
- `BackEnd/src/routes/user.routes.ts` — ruta pública.

### Nota de seguridad / paso pendiente

El cambio efectivo de la contraseña se confirma desde el enlace del correo. Una página de
aterrizaje ("definir nueva contraseña" con la sesión de recovery) queda como paso pendiente
si se quiere que el cambio sea inmediato desde el formulario.

---

## Internacionalización

Todos los textos viven en `FrontEnd/messages/es.json` y `en.json` (sin strings
hardcodeados). Namespaces nuevos/ampliados: `perfil_junior` (avatar, opciones de
especialidad/disponibilidad/modalidad, enlaces, etc.) y `reset_password`.

---

## Verificación

- BackEnd: `npm run typecheck` limpio y `npm run test` en verde (incluye tests de skills,
  nombre y de los nuevos campos del schema).
- FrontEnd: `npx tsc --noEmit` limpio; tests de `ResetPasswordSchema` en verde.
- Fallos preexistentes y ajenos a estos cambios: `npm run lint` (config de ESLint 9) y el
  test `EmpresaProfileSchema > rejects invalid websiteUrl`.

---

## Cómo probar

1. Aplicar la migración `0015_estudiante_avatar.sql` en Supabase.
2. Configurar las variables `CLOUDINARY_*` en `BackEnd/.env`.
3. Levantar BackEnd (`npm run dev`) y FrontEnd (`npm run dev`).
4. Perfil: iniciar sesión como estudiante, editar datos y subir foto.
5. Recuperación: ir a `/es/recuperar-contrasena` o usar el enlace del login.

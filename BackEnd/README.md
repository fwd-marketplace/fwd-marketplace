# BackEnd — API REST (Express + Supabase)

API independiente que contiene la **lógica de negocio** y la **conexión con Supabase**.
La **base de datos** y la **autenticación** viven en **Supabase**; este BackEnd actúa como
intermediario. El **FrontEnd (Next.js)** lo consume por HTTP mediante `fetch` y nunca habla
con Supabase directamente.

```
┌─────────────────────┐      fetch (HTTP/JSON)      ┌──────────────────────┐      ┌────────────────────┐
│  FrontEnd (Next.js) │ ──────────────────────────► │  BackEnd (Express)   │ ───► │ Supabase           │
│  http://localhost:  │                             │  http://localhost:   │      │  · Auth (JWT)      │
│        3000         │ ◄────────────────────────── │        3001          │ ◄─── │  · Postgres (DB)   │
└─────────────────────┘        respuesta JSON        └──────────────────────┘      └────────────────────┘
```

## Stack

- **Express 5** + **TypeScript** (estricto)
- **@supabase/supabase-js** — DB y **Supabase Auth** (registro, login y validación de JWT)
- **tsx** (dev con recarga) · **tsc** (build a `dist/`)

> La autenticación (hash de contraseñas, emisión y validación de JWT) la gestiona
> **Supabase Auth**. El BackEnd no firma ni verifica tokens a mano.

## Arquitectura por capas

Misma estructura que la referencia (`config / controllers / routes / services`),
más unos pocos apoyos propios de TypeScript:

```
src/
├── server.ts              Arranca el servidor (listen)
├── app.ts                 Configura Express: CORS, JSON, rutas, errores
├── config/
│   ├── env.ts             Lee y valida variables de entorno (fail-fast)
│   └── supabase.ts        Cliente único de Supabase (clave anon)
├── routes/
│   ├── index.ts           Agrega routers bajo /api (+ /health)
│   └── user.routes.ts     /api/users/*
├── controllers/           Reciben req/res, validan lo mínimo, llaman al servicio
│   └── user.controller.ts
├── services/              Lógica + llamadas a Supabase (auth.signUp / signIn / getUser)
│   └── user.service.ts
├── middlewares/
│   ├── auth.middleware.ts  Valida el token con supabase.auth.getUser e inyecta req.user
│   └── error.middleware.ts 404 + manejador central de errores
├── utils/
│   ├── ApiError.ts        Error con código HTTP
│   └── asyncHandler.ts    Envuelve controladores async (sin try/catch repetido)
└── types/
    ├── database.types.ts  Tipos de Supabase (se GENERAN desde el esquema)
    └── express.d.ts       Amplía Request con req.user (usuario de Supabase)
```

> No hay carpeta `models`: el esquema de datos se define directamente en Supabase
> y los tipos se generan desde ahí (ver `types/database.types.ts`).

**Flujo de una petición:** `Route → asyncHandler(Controller) → Service → Supabase`.
Cualquier error (`throw new ApiError(...)`) acaba en `error.middleware` y se devuelve como JSON.

## Puesta en marcha

```bash
cd BackEnd
npm install
cp .env.example .env     # rellena SUPABASE_URL y SUPABASE_KEY (clave anon)
npm run dev              # http://localhost:3001
```

Otros scripts: `npm run build` (compila a `dist/`), `npm start` (producción),
`npm run typecheck` (solo verifica tipos).

> No necesitas crear una tabla de usuarios: Supabase Auth gestiona los usuarios
> en `auth.users`. Si más adelante quieres un perfil público, crea una tabla
> `profiles` en Supabase y regenera `types/database.types.ts`.

## Endpoints

Vista general por grupo. Las **especificaciones completas** (bodies, respuestas y errores)
viven en los contratos de `docs/`:

- `docs/auth-contract.md` — auth, sesión, onboarding, **perfil** y aprobación de cuentas.
- `docs/marketplace-contract.md` — catálogos, proyectos, postulaciones (ofertas) y admin.

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Healthcheck |
| POST | `/api/users/register` | — | Registro (`signUp`) → `{ user, session }` |
| POST | `/api/users/login` | — | Login (`signInWithPassword`) → `{ user, session }` |
| POST | `/api/users/reset-password` | — | Envía el correo de recuperación de contraseña |
| POST | `/api/users/refresh` | — | Renueva la sesión con el `refresh_token` |
| POST | `/api/users/logout` | — | Revoca el `refresh_token` |
| GET | `/api/users/me` | JWT | Usuario autenticado + perfil (`{ user, profile }`) |
| POST | `/api/users/onboarding/junior` | JWT | Onboarding junior (crea `estudiante`) |
| POST | `/api/users/onboarding/empresa` | JWT | Onboarding empresa |
| POST | `/api/users/onboarding/emprendedor` | JWT | Onboarding emprendedor |
| GET | `/api/users/me/perfil` | JWT | Lee el perfil propio (estudiante/empresario) |
| PATCH | `/api/users/me/perfil` | JWT | Edita el perfil propio (parcial) |
| POST | `/api/users/me/perfil/avatar` | JWT | Sube la foto de perfil (multipart → Cloudinary) |
| GET | `/api/catalogs` | JWT | Áreas, skills y estados para selects/filtros |
| GET | `/api/projects` | JWT | Listado de proyectos visibles |
| GET | `/api/projects/mias` | JWT | Proyectos propios de la empresa |
| POST | `/api/projects` | JWT | Publica un proyecto (empresa) |
| GET | `/api/projects/:id` | JWT | Detalle de un proyecto |
| PATCH | `/api/projects/:id/estado` | JWT | Cambia el estado (empresa dueña) |
| POST | `/api/projects/:id/ofertas` | JWT | El junior postula |
| GET | `/api/projects/:id/ofertas` | JWT | Postulaciones recibidas (empresa dueña) |
| GET | `/api/ofertas/mias` | JWT | Mis postulaciones (junior) |
| GET | `/api/ofertas/:id` | JWT | Detalle de postulación con contacto (empresa dueña) |
| PATCH | `/api/ofertas/:id` | JWT | La empresa acepta/rechaza |
| GET | `/api/admin/users/pending` | JWT admin | Cuentas pendientes |
| PATCH | `/api/admin/users/:id/aprobar` | JWT admin | Aprueba una cuenta |
| PATCH | `/api/admin/users/:id/rechazar` | JWT admin | Rechaza una cuenta |
| PATCH | `/api/admin/users/:id/suspender` | JWT admin | Suspende una cuenta |
| GET | `/api/admin/projects` | JWT admin | Todos los proyectos (incluye borradores) |
| PATCH | `/api/admin/projects/:id/cancelar` | JWT admin | Cancela (modera) un proyecto |

El `access_token` que devuelve Supabase en `session` es el que el FrontEnd envía
en las rutas protegidas: `Authorization: Bearer <access_token>`.

> Si en tu proyecto Supabase la confirmación por email está activada, `register`
> devolverá `session: null` hasta que el usuario confirme su correo.

## Cómo consumirlo desde el FrontEnd (fetch)

> Esto es solo documentación de referencia; **no se ha modificado el FrontEnd.**

Define la URL base del BackEnd en el FrontEnd (`FrontEnd/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Login y manejo del token. El almacenamiento de la sesion lo hace el **route handler
de Next** (lado servidor) en **cookies httpOnly**, nunca el JS del navegador ni
`localStorage`. Detalle en `docs/auth-contract.md` ("Manejo de sesion (httpOnly)").
`cookieStore` es `await cookies()` de `next/headers` (disponible en route handlers y
server actions):

```ts
// 1. El route handler de Next pide el login al BackEnd.
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (!res.ok) {
  const { error } = await res.json();
  throw new Error(error);
}

const { user, session } = await res.json(); // user: para enrutar por rol/estado.

// 2. Los tokens NO se guardan en una variable de cliente ni en localStorage:
//    el route handler los escribe en cookies httpOnly (el JS del navegador no
//    las puede leer, lo que mitiga el robo de token por XSS).
cookieStore.set("access_token", session.access_token, { httpOnly: true, secure: true, sameSite: "lax" });
cookieStore.set("refresh_token", session.refresh_token, { httpOnly: true, secure: true, sameSite: "lax" });
```

En una ruta protegida, el `access_token` se lee de la cookie (lado servidor) y se
reenvia como `Bearer`; el navegador nunca lo manipula:

```ts
const accessToken = cookieStore.get("access_token")?.value;
const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```
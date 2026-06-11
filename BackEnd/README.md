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

| Método | Ruta                  | Auth | Descripción                                   |
| ------ | --------------------- | ---- | --------------------------------------------- |
| GET    | `/api/health`         | —    | Healthcheck                                   |
| POST   | `/api/users/register` | —    | `signUp` en Supabase → `{ user, session }`    |
| POST   | `/api/users/login`    | —    | `signInWithPassword` → `{ user, session }`    |
| GET    | `/api/users/me`       | JWT  | Usuario autenticado (`{ user }`)              |

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

Login y uso del token:

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (!res.ok) {
  const { error } = await res.json();
  throw new Error(error);
}

const { user, session } = await res.json();
const accessToken = session.access_token;

// Ruta protegida
const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

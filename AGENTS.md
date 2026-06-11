# AGENTS.md — Reglas del proyecto para todo el equipo (FWD Marketplace)

> **¿Quién debe leer esto?**
> 1. **Cualquier integrante del equipo** (FrontEnd o BackEnd) que vaya a escribir o modificar código.
> 2. **Cualquier herramienta de IA que no sea Claude Code** — Cursor, GitHub Copilot, Gemini, Codex, etc.
>
> Es el **mismo libro de reglas** que `CLAUDE.md`, adaptado para que **no necesites tener Claude**
> instalado. `CLAUDE.md` sigue siendo la **fuente de verdad**; si los dos difieren, manda `CLAUDE.md`.
> Las reglas de producto/identidad/calidad salen del _Brief técnico_ de FWD (v1.0, 2026-05-27).
>
> Lo marcado como **NO NEGOCIABLE** no se cambia. Lo abierto a tu criterio se marca **[LIBRE]**.

Si usás Cursor: este archivo se carga como contexto. Si usás Copilot: apuntá tus instrucciones de
repo acá. Si trabajás sin IA: leelo igual, son las reglas con las que se corrige el proyecto.

---

## Cómo está montado el proyecto (leelo primero)

Es un **monorepo de dos apps** que se hablan por HTTP:

```
FrontEnd/  (Next.js 15)  ──fetch (JSON)──►  BackEnd/  (Express + TypeScript)  ──►  Supabase
  solo UI                  REST                lógica + conexión a Supabase         (Postgres + Auth + RLS + Storage)
:3000                                          :3001
```

- **`FrontEnd/` es solo la interfaz.** NUNCA habla con Supabase directo: hace `fetch` al BackEnd
  usando `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`).
- **`BackEnd/` tiene toda la lógica y la única conexión a Supabase.** Expone una API REST en capas.
- **Supabase** es DB + Auth + RLS + Storage. La autenticación (JWT) la maneja **Supabase Auth**
  desde el cliente del BackEnd.

> **Decisión del equipo:** el Brief sugiere usar Supabase directo desde Next.js, pero este equipo
> separó un BackEnd Express. Esa es la estructura vigente — **no la cambies**. Estas reglas ya
> están adaptadas a ella; todo lo demás del Brief (identidad, stack de frontend, calidad) sigue igual.

---

## 0. Antes de subir tu trabajo (Definition of Done)

Tu cambio **NO está terminado** hasta que TODO esto se cumpla:

- [ ] `npm run typecheck` pasa **sin errores** (en `FrontEnd/` y en `BackEnd/`).
- [ ] `npm run lint` pasa **sin errores** (donde haya lint).
- [ ] `npm run test` pasa; escribiste **tests** para la lógica nueva (FrontEnd `lib/`, BackEnd `services/`).
- [ ] **Cero textos quemados en el FrontEnd**: todo string va en `messages/es.json` y `messages/en.json`.
- [ ] **Cero colores quemados**: solo tokens FWD (nunca `#000`, `#fff` ni hex sueltos).
- [ ] **Cero secretos en el FrontEnd**: la clave de Supabase vive SOLO en `BackEnd/.env`.
- [ ] Accesibilidad básica: se navega por teclado, contraste correcto, `label` en cada input.
- [ ] Probado en **mobile a 375 px**.
- [ ] Commit con **Conventional Commits** (`feat:`, `fix:`, `chore:`, …).
- [ ] **Sin emojis** en código ni en la interfaz.

Si falta uno, no abras el PR todavía.

---

## 1. Stack técnico — NO NEGOCIABLE

### FrontEnd (`FrontEnd/`) — idéntico al de FWD Talent

| Capa | Tecnología | Regla |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) | Server Components por defecto; `'use client'` solo si hay interactividad |
| Lenguaje | **TypeScript** `strict` | con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` |
| UI | **React 19** | viene con Next 15 |
| Estilos | **Tailwind CSS v4** | la de `@theme inline`, **no v3** |
| Componentes | **shadcn/ui** | base fija |
| i18n | **next-intl** (es + en) | mínimo bilingüe |
| Validación | **Zod** | en todas las fronteras |
| Forms | **react-hook-form** + `@hookform/resolvers` | |
| Iconos | **lucide-react** | nunca emojis |
| Tests | **Vitest** (Playwright opcional) | |
| Datos | **`fetch`** al BackEnd | el FrontEnd **no** importa `@supabase/*` |

### BackEnd (`BackEnd/`)

| Capa | Tecnología | Regla |
| --- | --- | --- |
| Runtime | **Node.js 20 LTS+** | |
| Servidor | **Express 5** + **TypeScript** `strict` | API REST en capas (ver §3) |
| DB / Auth | **Supabase** (Postgres + Auth + RLS + Storage) | **única** conexión a Supabase del proyecto |
| Cliente | **@supabase/supabase-js** | nativo. **No Prisma ni otro ORM** |
| Dev | **tsx** (`tsx watch`) | `tsc` para build |

Deploy: **Vercel** para el FrontEnd (URL pública obligatoria). Hosting del BackEnd **[LIBRE]**.
Package manager: **npm**.

### Prohibido / Permitido

- ❌ **Prisma** u otro ORM → cliente Supabase nativo.
- ❌ **Material UI / Chakra / Mantine** → shadcn/ui está fijado.
- ❌ Que el **FrontEnd** lea/escriba Supabase directo → siempre vía BackEnd.
- ❌ Claves de Supabase en `NEXT_PUBLIC_*` o en el bundle del FrontEnd.
- ✅ **Framer Motion** solo si lo necesitás para el 2.0; primero CSS + tokens.
- ✅ IA (Claude / Gemini) para matching, pricing o autocompletar copy.
  **NUNCA** generar la postulación del junior automáticamente — el junior escribe su propia carta.

---

## 2. TypeScript (FrontEnd y BackEnd)

- ❌ **Prohibido `any`.** Si no hay forma, `unknown` + type guard explícito.
- ❌ **Prohibido `@ts-ignore` / `@ts-expect-error`** sin comentario que lo justifique.
- ✅ Tipado estricto en todas las fronteras. Un archivo de tipos por entidad.
- ✅ Los tipos de la BD se **generan** desde Supabase (no a mano):
  `npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts`.

---

## 3. Estructura de carpetas — respetala

### FrontEnd
```
src/
  app/[locale]/(public)/   # landing, login  -> BRAND EXPRESIVO
            (app)/         # app del junior   -> PRODUCT  (marketplace/, applications/)
            (admin)/       # panel admin      -> ADMIN
  app/globals.css          # tokens FWD (NO tocar el bloque base)
  components/ui/ · features/ · layout/
  lib/ api/ (fetch al BackEnd) · marketplace/ · constants/ · i18n/ · utils/ · result.ts
  types/                   # un archivo por entidad
messages/ es.json · en.json
```

### BackEnd (`BackEnd/src/`) — API REST en capas
```
server.ts        # arranca (listen)
app.ts           # Express: CORS, JSON, rutas, errores
config/          # env.ts · supabase.ts (cliente único)
routes/          # define endpoints
controllers/     # reciben req/res, validan, llaman a services
services/        # lógica + llamadas a Supabase
middlewares/     # auth (valida JWT) · errores
utils/ · types/  # ApiError, asyncHandler · database.types.ts, express.d.ts
```
**Flujo:** `Route → Controller → Service → Supabase`. No te saltes capas.

---

## 4. Nombres

- **Archivos:** `kebab-case.ts` (utilidades), `PascalCase.tsx` (componentes). **Carpetas:** `kebab-case`.
- **Componentes** `PascalCase` · **Hooks** `useCamelCase` · **Tipos** `PascalCase` · **Constantes** `SCREAMING_SNAKE_CASE`.
- Nombres completos. **Prohibido** terminar en `data`, `info`, `item`, `temp`, `aux`, `stuff`.
- Booleanos con `is`, `has`, `should`, `can`. Funciones = verbo + sustantivo (`computeMatchScore`).

---

## 5. Qué NO hacer nunca (anti-basura)

- ❌ Código muerto (funciones/imports sin usar).
- ❌ `console.log` en producción → logger estructurado.
- ❌ TODOs sin ticket → `// TODO(issue-N): descripción`.
- ❌ Archivos/bloques comentados → borralos, git guarda el historial.
- ❌ Números/strings mágicos → constantes con nombre.
- ❌ `.then()` anidados → `async/await`.
- ❌ `useEffect` como manejador de estado → server components, react-query o estado derivado.
- ❌ Estilos inline salvo valores dinámicos.
- ❌ `@ts-ignore` para "que compile" → arreglá el tipo.
- ❌ `try/catch` que se traga el error → log + decisión.
- ❌ **Emojis en el repo** (código, comentarios, strings, JSX, commits). Iconos: `lucide-react` o SVG.

---

## 6. Manejo de errores

### FrontEnd
- El cliente `fetch` (`lib/api/`) **siempre** revisa `res.ok` y devuelve un `Result<T, E>`:
  ```ts
  type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E }
  ```
- Al usuario, **copy amigable**, nunca el stack. Error boundary en cada layout principal.

### BackEnd
- La lógica lanza `ApiError(status, mensaje)`; el **middleware central de errores** lo convierte
  en JSON uniforme (`{ "error": "..." }`).
- Los controllers async van envueltos en `asyncHandler` (sin `try/catch` repetido).
- Validá `req.body` antes de pasarlo a un service. Llamadas externas con timeout cuando aplique.

---

## 7. Identidad visual — CRÍTICO (es el 40 % de la nota del MVP) — aplica al FrontEnd

**Todo color, fuente y motion sale de tokens. Nunca valores sueltos.**

### 7.1 Paleta (multicolor por diseño — no la reduzcas a "un color + neutro")

| Token | Hex | Rol |
| --- | --- | --- |
| `--primary` | `#0A6CB9` | Azul FWD · botones, links |
| `--secondary` | `#662D91` | Púrpura · profundidad, headings dark |
| `--accent` | `#20BEC6` | Teal · success |
| `--highlight` | `#FFCB05` | Amarillo · destacar, badges |
| `--warning` | `#F7901E` | Naranja · atención |
| `--magenta` | `#EC008C` | Magenta · error, destructive |

El morado es decisión institucional: las reglas tipo "AI purple ban" **no aplican acá**.

### 7.2 Neutrales
Neutrales `oklch` tintados a 245° (`--canvas`, `--surface`, `--ink-strong`, `--ink`,
`--ink-muted`, `--border`, …). **Nunca `#000` ni `#fff` puros.**

### 7.3 Tipografía
- Titulares: **Archivo Narrow** (`--font-archivo-narrow`), solo Bold/ExtraBold con `tracking-tight`.
- Cuerpo/UI: **Figtree** (`--font-figtree`). Mono: **JetBrains Mono**.
- Importá con `next/font` — **nunca** `<link>` ni `@import` en CSS.

### 7.4 Motion (no negociable)
En transiciones usá tokens: `duration-[var(--duration-fast)] ease-[var(--ease-out)]`
(`--duration-fast` 160ms · `--duration-base` 220ms · `--duration-slow` 320ms).

### 7.5 Patrones a reutilizar
- **`PageTitle`** con `tone="brand"` en cada pantalla principal → el **punto azul** al final del
  título es la firma de marca ("Adelante.").
- **InsightSection** (`rounded-2xl border bg-surface shadow-soft`).
- **Button** variants FWD (`default`, `secondary`, `accent`, `magenta`, `warning`, `highlight`,
  `outline`, `ghost`, `link`). CTAs y pills `rounded-full`.
- **FwdGeoBackdrop** (paralelogramos) solo en pantallas brand expresivas.
- **Status pills** tokenizadas (`bg-success/15 text-success`, etc.).

### 7.6 Tres registros visuales
- **Brand expresivo** (landing, login, celebración): `bg-secondary` + geometría FWD + display grande + CTA `highlight`.
- **Product** (app del junior): `bg-canvas` + cards `bg-surface` + tipografía sobria.
- **Admin**: sidebar oscuro + contenido como el de candidato.

### 7.7 Voz y tono
Cálida, cercana, sin tecnicismos secos, confiada sin gritar, específica. Bilingüe es/en natural.
**Sin emojis.** No suena corporate, ni startup gritada, ni coach motivacional, ni robótica.

### 7.8 Qué NO parecer: Workana, Upwork, Toptal, LinkedIn, SaaS genérico.
### 7.9 Inspiración (no copiar): Linear, Stripe Docs, Vercel, Apple Health.

---

## 8. Base de datos y seguridad (Supabase, vía BackEnd)

- La **única conexión a Supabase** vive en `BackEnd/src/config/supabase.ts`. El FrontEnd no
  importa `@supabase/*` ni conoce las claves.
- **RLS habilitado en TODAS las tablas** de `public`, con políticas explícitas.
- `projects`: lectura pública si `status = 'published'`; escritura solo del owner o admin.
- `applications`: el junior solo ve las suyas; la empresa solo las de sus proyectos.
- Schema y políticas versionados en `supabase/migrations/`.
- Los valores de los `CHECK` en SQL deben coincidir con las constantes del código.
- **Auth = Supabase Auth:** el BackEnd hace `signUp` / `signInWithPassword` y valida el token con
  `supabase.auth.getUser(token)`; el FrontEnd guarda el `access_token` y lo manda como
  `Authorization: Bearer <token>`.
- Env vars:
  - **`BackEnd/.env`:** `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `FRONTEND_URL`.
  - **`FrontEnd/.env.local`:** `NEXT_PUBLIC_API_URL`. **Sin** claves de Supabase.

---

## 9. Alcance del producto

### Obligatorio (MVP — al 28-jun)
- **Junior:** login (Supabase Auth), listado filtrable (stack/duración/modalidad/salario), detalle,
  postular (carta + portfolio, validado con Zod), "mis postulaciones".
- **Empresa:** onboarding, publicar proyecto, ver postulaciones (aceptar/rechazar/contactar).
- **Admin:** dashboard mínimo, aprobar empresas, moderar proyectos.

### Fuera de alcance — NO lo hagas
- ❌ Pagos (Stripe/PayPal). ❌ Contratos firmados digitalmente.
- ❌ Mensajería en tiempo real (WebSockets), salvo X factor justificado del 2.0.
- ❌ Móvil nativo. Solo web responsive.

### [LIBRE] — a criterio del equipo
Features 2.0 (bonus): match algorítmico, notificaciones, chat junior↔empresa, rating bidireccional,
badges, **modo oscuro** (tokens FWD invertidos vía `oklch`, no hardcoded), empty states y motion.
El "X factor" creativo (15 %). **El MVP siempre tiene prioridad.** Hosting del BackEnd.

---

## 10. Comandos

Hay **tres** `package.json`: el de la **raíz** (solo tooling de commits) y el de cada app.
Al clonar, **lo primero** es instalar en la raíz para que se activen los hooks de git:

```bash
# --- Raíz del repo (una sola vez al clonar) ---
npm install         # instala husky + commitlint y ACTIVA los hooks de commit
npm run install:all # atajo opcional: instala raíz + FrontEnd + BackEnd

# --- FrontEnd ---
cd FrontEnd
npm install
npm run dev         # http://localhost:3000
npm run lint        # sin errores
npm run test

# --- BackEnd ---
cd BackEnd
npm install
npm run dev         # http://localhost:3001 (tsx watch)
npm run build       # compila a dist/
npm run typecheck   # sin errores
```

> Si no corrés `npm install` en la raíz, los hooks **no se activan** y tus commits no se
> validan. Hacelo una vez por máquina.

---

## 11. Colaboración

- **Cada miembro hace sus propios commits** (con su `git config user.name` / `user.email`).
  Si solo una persona commitea, se penaliza al equipo. No es firma GPG: es autoría distribuida.
- Conventional Commits obligatorio (lo valida commitlint, automáticamente).
- Podés usar IA, pero **cualquiera del equipo debe poder explicar el código** en la demo.
- Plagiar UI de otro equipo o de competidores (Workana, Upwork) **descalifica**. Inspirarse y citar, sí.

### Validación automática de commits (husky)

Hay hooks de git en la raíz (`.husky/`). Se activan con `npm install` en la raíz (ver §10) y
aplican a FrontEnd y BackEnd:

- **`pre-commit`** → `lint-staged`: corre el `lint` del FrontEnd o el `typecheck` del BackEnd
  según qué tocaste, antes de dejarte commitear.
- **`commit-msg`** → `commitlint`: **rechaza** el commit si el mensaje no cumple el formato.

Formato: `tipo(alcance): descripción` (ej. `feat(frontend): …`, `fix(backend): …`).
Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**Dos formas de commitear (misma regla):**

- **Guiada (recomendada):** `git add .` y luego `npm run commit` → Commitizen te hace preguntas
  y arma el mensaje correcto por vos.
- **Manual:** `git commit -m "feat(frontend): descripción"`. Lo valida commitlint.

---

_Espejo de `CLAUDE.md`, derivado del Brief FWD v1.0 (2026-05-27) y adaptado a la arquitectura
FrontEnd + BackEnd vigente. Si el brief o la arquitectura cambian, se actualiza `CLAUDE.md` primero._

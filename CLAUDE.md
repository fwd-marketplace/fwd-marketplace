# CLAUDE.md — Libro de reglas del proyecto (FWD Marketplace)

> **Para cualquier IA o persona que toque este repo.** Este archivo es la **fuente
> de verdad** sobre qué se puede y qué no se puede hacer. Las reglas de producto,
> identidad y calidad están derivadas del _Brief técnico y de producto_ de Fundación
> Forward Costa Rica (v1.0, 2026-05-27). Antes de escribir o modificar código, **leé
> este documento completo** y respetá cada regla marcada como **no negociable**. Lo
> único abierto a criterio está marcado explícitamente como **[LIBRE]**.

Herramientas como Cursor / Copilot: el mismo contenido aplica; ver `AGENTS.md`.

---

## Arquitectura del proyecto (cómo está montado HOY)

Este repo es un **monorepo de dos aplicaciones** que se comunican por HTTP:

```
FrontEnd/  (Next.js 15)  ──fetch (JSON)──►  BackEnd/  (Express + TypeScript)  ──►  Supabase
  solo UI                  REST                lógica + conexión a Supabase         (Postgres + Auth + RLS + Storage)
http://localhost:3000                        http://localhost:3001
```

- **`FrontEnd/`** es **solo presentación**. Nunca habla con Supabase directamente: hace
  `fetch` al BackEnd usando `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`).
- **`BackEnd/`** contiene **toda la lógica de negocio y la única conexión a Supabase**
  (cliente con la clave de Supabase). Expone una **API REST** en capas.
- **Supabase** sigue siendo DB + Auth + RLS + Storage. La autenticación (hash, emisión y
  validación de JWT) la gestiona **Supabase Auth** a través del cliente del BackEnd.

> **Decisión de arquitectura del equipo.** El Brief sugiere usar Supabase como backend
> directo desde Next.js (server actions). Este equipo decidió separar un **BackEnd Express**
> que centraliza la lógica y la conexión a Supabase, y un **FrontEnd** que solo consume la
> API por `fetch`. Esa separación es deliberada y es la estructura vigente del repo; las
> reglas de abajo están adaptadas a ella. Todo lo demás del Brief (identidad visual, stack
> de frontend, calidad, i18n, Supabase/RLS) se mantiene **igual y no negociable**.

---

## 0. Checklist obligatorio antes de abrir un PR (Definition of Done)

Una feature está terminada **solo si** todo esto se cumple (§6.5 del brief):

- [ ] `npm run typecheck` pasa **sin errores ni warnings** (en `FrontEnd/` y en `BackEnd/`).
- [ ] `npm run lint` pasa **sin errores** (en el lado que tenga lint configurado).
- [ ] `npm run test` pasa; hay **tests unitarios para la lógica nueva** (FrontEnd `lib/`, BackEnd `services/`).
- [ ] **Cero strings hardcodeados en el FrontEnd**: todo texto vive en `messages/es.json` y `messages/en.json`.
- [ ] **Cero colores hardcodeados**: solo tokens FWD (nunca `#000`, `#fff`, ni hex sueltos).
- [ ] **Cero secretos en el FrontEnd**: la clave de Supabase vive **solo** en el BackEnd (`.env`).
- [ ] Accesibilidad básica: navegable por teclado, contraste correcto, `label` en inputs.
- [ ] Verificado en **mobile a 375 px**.
- [ ] Commit limpio con **Conventional Commits** (`feat:`, `fix:`, `chore:`, …).
- [ ] **Sin emojis** en código ni en copy.

Si algo de esto no se cumple, **no está hecho**.

---

## 1. Stack técnico — NO NEGOCIABLE

El stack del **FrontEnd** es **idéntico** al de FWD Talent (`jobs.fwdcostarica.com`) para
permitir la integración futura. No se sustituye ninguna pieza.

### FrontEnd (`FrontEnd/`)

| Capa | Tecnología | Regla |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) | Server Components por defecto; `'use client'` solo donde haga falta interactividad |
| Lenguaje | **TypeScript** `strict` | `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` habilitados |
| UI runtime | **React 19** | Viene con Next 15 |
| Estilos | **Tailwind CSS v4** | La de `@theme inline` en CSS, **no v3** |
| Componentes | **shadcn/ui** | Base de componentes fija |
| i18n | **next-intl** (es + en) | Mínimo bilingüe |
| Validación | **Zod** | En todas las fronteras (forms, respuestas del API) |
| Forms | **react-hook-form** + `@hookform/resolvers` | |
| Iconos | **lucide-react** | Nunca emojis |
| Tests | **Vitest** (+ Playwright opcional para E2E) | |
| Datos | **`fetch`** al BackEnd | El FrontEnd **no** importa `@supabase/*` |

### BackEnd (`BackEnd/`)

| Capa | Tecnología | Regla |
| --- | --- | --- |
| Runtime | **Node.js 20 LTS o superior** | |
| Servidor | **Express 5** + **TypeScript** `strict` | API REST en capas (ver §3) |
| DB / Auth | **Supabase** (Postgres + Auth + RLS + Storage) | **Única** conexión a Supabase de todo el proyecto |
| Cliente Supabase | **@supabase/supabase-js** | Nativo. **No Prisma ni otro ORM** |
| Dev | **tsx** (`tsx watch`) | `tsc` para build a `dist/` |

### Compartido

| Tema | Regla |
| --- | --- |
| Deploy | **Vercel** (FrontEnd) — URL pública obligatoria. BackEnd en el hosting que el equipo defina **[LIBRE]** |
| Package manager | **npm** | Igual que el repo madre |

### Prohibiciones de stack (FAQ §13)

- No — **Prisma** u otro ORM — usar el cliente Supabase nativo.
- No — **Material UI / Chakra / Mantine** — shadcn/ui está fijado.
- No — Que el **FrontEnd** lea/escriba Supabase directamente — siempre pasa por el BackEnd.
- No — Secretos de Supabase en variables `NEXT_PUBLIC_*` ni en el bundle del FrontEnd.
- Sí — **Framer Motion** permitido **solo** si se necesita para el 2.0; preferir CSS + tokens primero.
- Sí — IA (Claude / Gemini) permitida para matching, sugerencia de pricing, autocompletar copy.
  **NUNCA** generar postulaciones de juniors automáticamente — el junior siempre escribe su carta.

---

## 2. Reglas de TypeScript (FrontEnd y BackEnd)

- No — **Prohibido `any`.** Si es inevitable, usar `unknown` + type guard explícito.
- No — **Prohibido `@ts-ignore` / `@ts-expect-error`** sin comentario que lo justifique.
- Sí — Tipado estricto en todas las fronteras. Un archivo de tipos por entidad.
- Sí — Los tipos de la BD se **generan** desde Supabase, no se escriben a mano:
  `npx supabase gen types typescript --project-id <ID> > BackEnd/src/types/database.types.ts`.

---

## 3. Estructura de carpetas — respetarla

### FrontEnd (`FrontEnd/`, §6.1 del brief)

```
src/ (o app/ según el setup actual)
  app/
    [locale]/
      (public)/      # landing, login  → registro BRAND EXPRESIVO
      (app)/         # app autenticada del junior → registro PRODUCT
        marketplace/ # listado y detalle
        applications/# mis postulaciones
      (admin)/       # panel admin → registro ADMIN
      layout.tsx
    globals.css      # tokens FWD (NO modificar el bloque base)
  components/
    ui/              # primitivos shadcn (Button, Card, Input, …)
    features/        # componentes de dominio (marketplace/, applications/, auth/)
    layout/          # AppHeader, AppFooter, PageTitle, …
  lib/
    api/             # cliente fetch hacia el BackEnd (wrappers tipados)
    marketplace/     # lógica pura de UI: filtros, formato, …
    constants/       # WORK_MODE, PROJECT_STATUS, … (SCREAMING_SNAKE_CASE)
    i18n/ · utils/ · result.ts
  types/             # un archivo por entidad: project.ts, application.ts
  i18n/              # config de next-intl
  middleware.ts
messages/
  es.json · en.json
```

### BackEnd (`BackEnd/src/`) — API REST en capas

```
src/
  server.ts          # arranca el servidor (listen)
  app.ts             # configura Express: CORS, JSON, rutas, errores
  config/            # env.ts (valida env) · supabase.ts (cliente único)
  routes/            # define endpoints y los conecta a los controllers
  controllers/       # reciben req/res, validan, llaman a services
  services/          # lógica de negocio + llamadas a Supabase
  middlewares/       # auth (valida JWT de Supabase) · manejo central de errores
  utils/             # ApiError, asyncHandler, …
  types/             # database.types.ts (generado) · express.d.ts
```

**Flujo de una petición en el BackEnd:** `Route → Controller → Service → Supabase`.
No se salta capas (un controller no consulta Supabase directo; un service no lee `req`).

---

## 4. Naming (§6.2) — FrontEnd y BackEnd

- **Archivos:** `kebab-case.ts` para utilidades, `PascalCase.tsx` para componentes.
- **Carpetas:** siempre `kebab-case`.
- **Componentes:** `PascalCase`. **Hooks:** `useCamelCase`. **Tipos:** `PascalCase`.
- **Constantes:** `SCREAMING_SNAKE_CASE`.
- Nombres descriptivos completos — **prohibido** `data`, `info`, `item`, `temp`, `aux`, `stuff`
  como nombres finales.
- Booleanos: prefijo `is`, `has`, `should`, `can`.
- Funciones: verbo + sustantivo (`computeMatchScore`, no `matchScore`).

---

## 5. Anti-basura (§6.3) — qué NO hacer nunca

- No — Código muerto (funciones/imports sin usar).
- No — `console.log` en producción → usar un logger estructurado.
- No — TODOs sin ticket → formato `// TODO(issue-N): descripción`.
- No — Archivos/bloques comentados → git guarda el historial, borralo.
- No — Magic numbers / magic strings → extraer a constantes con nombre.
- No — `.then()` anidados → siempre `async/await`.
- No — `useEffect` como manager de estado → server components, react-query o estado derivado.
- No — Estilos inline salvo valores dinámicos calculados.
- No — `@ts-ignore` para "hacer que compile" → arreglar el tipo.
- No — `try/catch` que silencia errores → siempre log + decisión.
- No — **Emojis en el código** → prohibido en cualquier archivo del repo (identificadores,
  comentarios, strings, JSX, commits). Para iconos usar `lucide-react` o SVG. Ver §0 y §7.7.

---

## 6. Manejo de errores (§6.4)

### FrontEnd
- El cliente `fetch` (en `lib/api/`) **siempre revisa `res.ok`** y traduce el error a un
  `Result<T, E>` tipado (ver `src/lib/result.ts`); nunca asume que la respuesta es correcta.

  ```ts
  type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E }
  ```

- Errores de usuario con **copy amigable**, nunca stack técnico.
- **Error boundaries** en cada layout principal.

### BackEnd
- La lógica lanza `ApiError(status, mensaje)` (ver `src/utils/ApiError.ts`); un **middleware
  central de errores** lo convierte en una respuesta JSON uniforme (`{ "error": "..." }`).
- Los controllers async se envuelven con `asyncHandler` — sin `try/catch` repetido.
- Toda llamada externa con **timeout explícito** cuando aplique.
- Validar las entradas (`req.body`) antes de pasarlas a un service.

---

## 7. Identidad visual — CRÍTICO (§5) — aplica al FrontEnd

> El 40 % del puntaje del MVP es diseño y consistencia con FWD Talent. Esto define
> si el proyecto puede integrarse al producto madre. **Todo color, fuente y motion
> sale de tokens — nunca valores sueltos.**

### 7.1 Paleta (anclada en hex, multicolor por diseño)

| Token | Hex | Rol |
| --- | --- | --- |
| `--primary` | `#0A6CB9` | Azul FWD · botones, links, acento |
| `--secondary` | `#662D91` | Púrpura · profundidad, headings dark |
| `--accent` | `#20BEC6` | Teal · success, complemento |
| `--highlight` | `#FFCB05` | Amarillo · destacar, badges, trophy |
| `--warning` | `#F7901E` | Naranja · atención, entrevistas |
| `--magenta` | `#EC008C` | Magenta · momento, error, destructive |

La paleta es **multicolor por diseño** — no reducir a "un color + neutro". El morado es
decisión institucional: las reglas tipo "AI purple ban" **no aplican**.

### 7.2 Neutrales

Usar siempre los neutrales `oklch` tintados a 245° (`--canvas`, `--surface`,
`--ink-strong`, `--ink`, `--ink-muted`, `--border`, …). **Nunca `#000` ni `#fff` puros.**

### 7.3 Tipografía

- **Display / titulares:** Archivo Narrow (`--font-archivo-narrow`) — solo Bold/ExtraBold con
  `tracking-tight`.
- **Cuerpo / UI:** Figtree (`--font-figtree`).
- **Mono:** JetBrains Mono.
- Importación con `next/font` — **nunca** `<link>` ni `@import` en CSS.
- Escala: `text-xs` 12 · `text-sm` 14 · `text-base` 16 · `text-lg` 18 · `text-2xl` 24 ·
  `text-3xl` 30 · `text-5xl/6xl/7xl` heros.

### 7.4 Motion (no negociable)

Usar siempre tokens en transiciones, no los defaults del browser:

```
duration-[var(--duration-fast)] ease-[var(--ease-out)]
```

`--duration-fast` 160ms (hover/focus) · `--duration-base` 220ms (overlays) ·
`--duration-slow` 320ms.

### 7.5 Patrones visuales canónicos (§5.6) — reutilizar

- **`PageTitle`** con `tone="brand"` en cada pantalla principal → el **punto azul** al final
  del título es la firma de marca (equivalente a "Adelante."). Ver `src/components/layout/PageTitle.tsx`.
- **InsightSection**: wrapper de secciones (`rounded-2xl border bg-surface shadow-soft`).
- **Button**: variants FWD (`default`, `secondary`, `accent`, `magenta`, `warning`,
  `highlight`, `outline`, `ghost`, `link`). CTAs y pills son `rounded-full`.
- **FwdGeoBackdrop**: paralelogramos fast-forward, solo en pantallas brand expresivas.
- **Status pills** tokenizadas (`bg-success/15 text-success`, etc.).

### 7.6 Tres registros visuales (§5.7)

| Registro | Cuándo | Estética |
| --- | --- | --- |
| **Brand expresivo** | landing, login, celebración, empty "wow" | `bg-secondary` + geometría FWD + display `text-6xl+` + CTAs `highlight` |
| **Product** | app autenticada del junior | `bg-canvas` + cards `bg-surface` + tipografía sobria |
| **Admin** | panel admin | sidebar oscuro `oklch(0.18 0.020 270)` + contenido como candidato |

### 7.7 Voz y tono (§5.8)

- Cálida, cercana, amigable (un amigo con buenos consejos, no LinkedIn).
- Sin tecnicismos secos. Confiada sin gritar. Específica y concreta.
- Bilingüe nativo es/en — ambos idiomas suenan naturales, no traducción literal.
- **Sin emojis** en código ni copy. Celebraciones con iconos lucide o SVG geométrico.
- **No** es: corporate, startup gritada, coach motivacional, ni robótica.

### 7.8 Anti-referencias (qué NO parecer): Workana, Upwork, Toptal, LinkedIn, SaaS genérico.

### 7.9 Referencias positivas (inspirarse, no copiar): Linear, Stripe Docs, Vercel, Apple Health.

---

## 8. Base de datos y seguridad (Supabase, vía BackEnd)

- La **única conexión a Supabase** vive en el BackEnd (`BackEnd/src/config/supabase.ts`).
  El FrontEnd nunca importa `@supabase/*` ni conoce las claves.
- **RLS habilitado en todas las tablas** de `public`, con políticas explícitas.
- `projects`: lectura pública si `status = 'published'`; escritura solo del owner o admin.
- `applications`: el junior solo ve las suyas; la empresa solo las de sus proyectos.
- Schema y políticas versionados en `supabase/migrations/` (ver `0001_init.sql`).
- Los valores de `CHECK` en SQL deben coincidir con las constantes de `BackEnd/src/` (y, si se
  comparten al UI, con las del FrontEnd).
- **Autenticación = Supabase Auth.** El BackEnd hace `signUp` / `signInWithPassword` y valida el
  token con `supabase.auth.getUser(token)`; el FrontEnd guarda el `access_token` y lo manda como
  `Authorization: Bearer <token>`.
- Variables de entorno:
  - **BackEnd `.env`:** `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `FRONTEND_URL` (CORS).
  - **FrontEnd `.env.local`:** `NEXT_PUBLIC_API_URL` (URL del BackEnd). **Sin** claves de Supabase.

---

## 9. Alcance del producto

### Features obligatorias (MVP — al 28-jun)

- **Junior:** login (Supabase Auth), listado filtrable (stack/duración/modalidad/salario),
  detalle, postular (carta + portfolio, validado con Zod), "mis postulaciones".
- **Empresa:** onboarding, publicar proyecto, ver postulaciones recibidas (aceptar/rechazar/contactar).
- **Admin:** dashboard mínimo, aprobar empresas, moderar proyectos.

### Fuera de alcance — NO hacer (§3.4)

- No — Procesamiento de pagos (Stripe/PayPal). Pago directo por fuera.
- No — Contratos firmados digitalmente.
- No — Mensajería en tiempo real (WebSockets), salvo X factor justificado del 2.0.
- No — Móvil nativo. Solo web responsive.

### [LIBRE] — abierto a criterio del equipo

- Features deseables 2.0 (bonus): match algorítmico, notificaciones, chat junior↔empresa,
  rating bidireccional, badges, **modo oscuro** (con tokens FWD invertidos vía `oklch`, no hardcoded),
  empty states y motion memorables.
- El "X factor" creativo (15 % del MVP). El MVP del brief tiene prioridad sobre lo creativo.
- Hosting del BackEnd y forma exacta de desplegarlo.

---

## 10. Comandos

Hay **tres** `package.json`: el de la **raíz** (solo tooling de commits) y el de cada app.
Al clonar el repo, **lo primero** es instalar en la raíz para activar los hooks de git:

```bash
# --- Raíz del repo (una sola vez al clonar) ---
npm install         # instala husky + commitlint y ACTIVA los hooks de commit
# atajo opcional para instalar todo de una:
npm run install:all # instala raíz + FrontEnd + BackEnd

# --- FrontEnd ---
cd FrontEnd
npm install
npm run dev         # http://localhost:3000
npm run build
npm run lint        # ESLint (debe pasar sin errores)
npm run test        # Vitest

# --- BackEnd ---
cd BackEnd
npm install
npm run dev         # http://localhost:3001 (tsx watch)
npm run build       # compila a dist/
npm start           # node dist/server.js
npm run typecheck   # tsc --noEmit (debe pasar sin errores)
```

> Si no corrés `npm install` en la raíz, los hooks **no se activan** y tus commits no se
> validan (pero los del resto del equipo sí). Hacelo una vez por máquina.

---

## 11. Reglas de colaboración

- **Commits firmados por cada miembro** del equipo (si solo uno commitea, se penaliza).
  Esto NO es firma GPG: cada quien configura su identidad de git (`git config user.name` /
  `user.email`) para que el historial demuestre que todos participaron.
- Conventional Commits obligatorio (validado por commitlint en `commit-msg`).
- IA permitida, pero **cualquier miembro debe poder explicar el código** en la demo.
- Plagiar UI de otro equipo o de competidores **descalifica**. Inspirarse y citar está bien.

### Validación automática de commits (husky)

El repo tiene hooks de git en la raíz (`.husky/`), configurados en el `package.json` raíz.
Se activan al correr `npm install` en la raíz (ver §10). Funcionan para FrontEnd y BackEnd:

- **`pre-commit`** → corre `lint-staged`: según qué tocaste, ejecuta el `lint` del FrontEnd o el
  `typecheck` del BackEnd antes de dejar commitear (config en `.lintstagedrc.js`).
- **`commit-msg`** → corre `commitlint`: **rechaza** el commit si el mensaje no cumple Conventional
  Commits (config en `commitlint.config.js`).

Formato del mensaje: `tipo(alcance): descripción` — ej. `feat(frontend): …`, `fix(backend): …`.
Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`.

**Dos formas de commitear (la misma regla):**

- **Guiada (recomendada para no memorizar el formato):** `git add .` y luego `npm run commit`
  (Commitizen) → te hace preguntas (tipo, alcance, descripción) y arma el mensaje correcto solo.
- **Manual:** `git commit -m "feat(frontend): descripción"`. Lo valida `commitlint`; si está mal,
  lo rechaza y lo reescribís.

---

_Derivado del Brief FWD v1.0 (2026-05-27), adaptado a la arquitectura FrontEnd + BackEnd vigente
del repo. Si el brief o la arquitectura cambian, este archivo se actualiza primero._

# FWD Marketplace — Frontend

Marketplace de proyectos freelance para juniors egresados de Fundación Forward Costa Rica. Las empresas publican proyectos cortos (1–12 semanas) y los juniors FWD postulan para tomarlos.

> Este frontend forma parte del ecosistema de [FWD Talent](https://jobs.fwdcostarica.com). El código debe poder integrarse al producto real desde el día 1.

**Deploy:** [marketplace-de-proyectos-freelance.vercel.app](https://marketplace-de-proyectos-freelance.vercel.app)

---

## Arquitectura

```
FrontEnd/ (Next.js 15)  ──fetch (JSON)──►  BackEnd/ (Express + TS)  ──►  Supabase
  solo UI                  REST              lógica + DB + Auth            Postgres / Auth / RLS
http://localhost:3000                       http://localhost:3001
```

- El **FrontEnd es solo presentación**. Se comunica con el BackEnd por HTTP (`fetch`).
- El **FrontEnd no importa `@supabase/*` ni conoce las claves de Supabase**. Esa conexión vive únicamente en el BackEnd.
- La IA (matching, sugerencias) también vive en el BackEnd. El FrontEnd solo llama endpoints REST.

---

## Stack técnico (no negociable)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Lenguaje | TypeScript strict | ^5 |
| Estilos | Tailwind CSS v4 + shadcn/ui | ^4 |
| i18n | next-intl | ^4 |
| Validación | Zod | ^4 |
| Formularios | react-hook-form + @hookform/resolvers | ^7 |
| Testing | Vitest (unit) | ^4 |
| Linting | ESLint + Prettier | ^9 / ^3 |
| Commits | Conventional Commits + commitlint + Husky | — |
| Deploy | Vercel | — |

---

## Cómo arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.local.example .env.local
# El valor por defecto ya sirve para desarrollo local

# 3. Arrancar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

> El BackEnd debe estar corriendo en `http://localhost:3001` para que las llamadas API funcionen.

### Otros comandos

```bash
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript sin emitir (tsc --noEmit)
```

---

## Variables de entorno

El FrontEnd necesita una sola variable de entorno:

```env
# URL base del BackEnd (Express). El FrontEnd consume TODO por aquí vía fetch.
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

El archivo `.env.local.example` contiene la plantilla con el valor por defecto para desarrollo local. Copiarlo como `.env.local` (ya ignorado en `.gitignore`).

> **El FrontEnd no usa claves de Supabase, Groq, Gemini, Resend ni Sentry.** Esas variables viven en el BackEnd (`.env` dentro de `BackEnd/`). No agregar `SUPABASE_URL`, `SUPABASE_KEY` ni claves de IA aquí.

---

## Identidad visual FWD (no negociable)

El código debe verse como parte del mismo producto que `jobs.fwdcostarica.com`.

### Paleta oficial

| Token CSS | Hex | Uso |
|---|---|---|
| `--primary` | `#0A6CB9` | Azul FWD — botones, links, punto de firma en H1 |
| `--secondary` | `#662D91` | Púrpura — fondo landing/login/onboarding |
| `--accent` | `#20BEC6` | Teal — success, match 90%+ |
| `--highlight` | `#FFCB05` | Amarillo — CTAs en fondo morado |
| `--warning` | `#F7901E` | Naranja — pendiente, en revisión, match 50-69% |
| `--magenta` | `#EC008C` | Magenta — error, destructive, rechazo, match <50% |

### Neutrales oklch (tintados a 245° azul FWD)

| Token CSS | Valor | Uso |
|---|---|---|
| `--canvas` | `oklch(0.985 0.003 245)` | Fondo de página — nunca `#fff` puro |
| `--surface` | `oklch(1 0 0)` | Cards, contenedores |
| `--surface-sunken` | `oklch(0.97 0.003 245)` | Inputs, skeleton, tabla headers |
| `--ink-strong` | `oklch(0.18 0.01 245)` | Títulos |
| `--ink` | `oklch(0.30 0.01 245)` | Cuerpo principal |
| `--ink-muted` | `oklch(0.52 0.01 245)` | Texto secundario |
| `--ink-subtle` | `oklch(0.65 0.008 245)` | Captions, placeholders |
| `--border` | `oklch(0.92 0.005 245)` | Bordes default |
| `--border-strong` | `oklch(0.85 0.005 245)` | Bordes destacados |

### Tipografía

| Rol | Fuente | Pesos |
|---|---|---|
| Display / titulares | Archivo Narrow (next/font/google) | 700, 800 — tracking-tight |
| Cuerpo / UI | Figtree (next/font/google) | 400, 500, 600, 700 |

> **Regla:** Importar siempre con `next/font`. Nunca `<link>` ni `@import` en CSS.

### Motion tokens

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Apertura general |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Transiciones bidireccionales |
| `--duration-fast` | `160ms` | Hover, focus, tooltips |
| `--duration-base` | `220ms` | Apertura de overlays, sheets |
| `--duration-slow` | `320ms` | Transiciones deliberadas |

### Tres registros visuales

| Registro | Cuándo | Estética |
|---|---|---|
| **Brand Expresivo** | Landing, login, onboarding, celebración | `bg-secondary` (morado) + `FwdGeoBackdrop` + texto display + CTAs highlight amarillo |
| **Product** | App junior: listado, detalle, perfil, postulaciones | `bg-canvas` + cards `bg-surface` + tipografía sobria |
| **Empresa** | Dashboard empresa, matches, postulaciones | Hero azul/morado + subnav horizontal sticky + `bg-canvas` |
| **Admin** | Panel admin FWD | Sidebar `oklch(0.18 0.020 270)` + contenido `bg-canvas` |

---

## Reglas del equipo (penalización directa si no se cumplen)

| Regla | Qué significa en la práctica |
|---|---|
| **Cero strings hardcodeados** | Todo texto va en `messages/es.json` y `messages/en.json`. Nunca en el componente. |
| **Cero colores hardcodeados** | Siempre tokens CSS (`--primary`, `--canvas`, etc.). Nunca `#0A6CB9` directo. |
| **Cero `any` en TypeScript** | Si es inevitable, usar `unknown` con type guard. Prohibido `@ts-ignore` sin comentario. |
| **Punto azul en cada H1** | `<span className="text-primary">.</span>` al final de cada título principal. Firma de marca FWD. |
| **`Result<T,E>` en server actions** | Toda server action devuelve `Result<T,E>`. Nunca lanzar excepciones sin capturar. |
| **FrontEnd no toca Supabase** | Todo `fetch` va al BackEnd. El FrontEnd nunca importa `@supabase/*`. |
| **NUNCA generar postulaciones por IA** | El junior siempre escribe su propia carta. La IA no redacta postulaciones automáticas. |
| **Todos los miembros commitean** | Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`. Penalización si solo una persona commitea. |
| **Cero `console.log` en producción** | Usar `lib/logger.ts`. Prohibido código muerto, imports sin usar, TODOs sin ticket. |
| **Cero emojis en código o copy** | Las celebraciones se hacen con iconos lucide o SVG geométrico. |

### Definition of Done por feature

Una feature está terminada **solo si**:
1. TypeScript compila sin errores (`npm run typecheck`)
2. ESLint pasa sin errores (`npm run lint`)
3. Tests unitarios para la lógica nueva
4. Textos en `es.json` y `en.json` — nada hardcoded
5. Accesibilidad básica: navegable por teclado, contraste WCAG AA, labels en inputs
6. Mobile verificado en 375px sin scroll horizontal
7. Commit limpio con Conventional Commit

---

## Estructura del proyecto

```
src/
  app/
    [locale]/
      (public)/          # landing, login, onboarding
      (app)/             # app autenticada del junior
        marketplace/     # listado y detalle de proyectos
        applications/    # mis postulaciones
      (empresa)/         # portal empresa autenticada
        dashboard/
      (admin)/           # panel admin FWD
  components/
    ui/                  # primitivos shadcn/ui
    features/            # componentes de dominio
      marketplace/
      applications/
      auth/
    layout/              # AppHeader, AppFooter, etc.
  lib/
    api/                 # wrappers fetch tipados hacia el BackEnd
    actions/             # server actions (llaman al BackEnd, nunca a Supabase)
    validations/         # schemas Zod para forms y respuestas de API
    result.ts            # Result<T,E>, ok(), err()
  types/                 # un archivo por entidad
messages/
  es.json
  en.json
```

### Convenciones de naming

- Archivos: `kebab-case.ts` para utilidades, `PascalCase.tsx` para componentes
- Carpetas: siempre `kebab-case`
- Componentes: `PascalCase` | Hooks: `useCamelCase` | Tipos: `PascalCase` | Constantes: `SCREAMING_SNAKE_CASE`
- Variables booleanas: prefijo `is`, `has`, `should`, `can`
- Funciones: verbo + sustantivo (`computeMatchScore`, no `matchScore`)

---

## Convención de PRs

- Rama: `feat/F2-BE01-signup`
- Título del PR: `feat(F2-BE01): signUp con verificación email`
- Sin commits directos a `main` — todo por PR con mínimo 1 reviewer

---

## Servicios externos (FrontEnd)

| Servicio | Para qué | Notas |
|---|---|---|
| Vercel | Hosting Next.js | Gratis para proyectos. SSL automático |

> Supabase, Groq, Gemini, Resend y Sentry son responsabilidad del **BackEnd**. Ver `BackEnd/.env.example` para esas variables.

---

## Decisiones técnicas relevantes

- **`@theme inline` de Tailwind v4:** Los tokens FWD se mapean a variables de color de Tailwind mediante `@theme inline {}` — no usar la sintaxis de v3.
- **Server Components por defecto:** `'use client'` solo donde haga falta interactividad real.
- **`Result<T,E>` en todas las server actions:** Nunca lanzar excepciones sin capturar. El frontend siempre recibe un tipo discriminado.
- **httpOnly cookie para el token:** El BackEnd emite el JWT de Supabase; el FrontEnd lo guarda en una cookie `httpOnly` (sin acceso desde JS). Las server actions leen la cookie con `cookies()` de `next/headers`.
- **sessionStorage para onboarding:** El onboarding usa navegación por URL (un paso = una ruta). React state se resetea en cada navegación; sessionStorage persiste los datos del paso actual hasta el submit final.

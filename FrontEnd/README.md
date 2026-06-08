# FWD Marketplace — Frontend

Marketplace de proyectos freelance para juniors egresados de Fundación Forward Costa Rica. Las empresas publican proyectos cortos (1–12 semanas) y los juniors FWD postulan para tomarlos.

> Este frontend forma parte del ecosistema de [FWD Talent](https://jobs.fwdcostarica.com). El código debe poder integrarse al producto real desde el día 1.

---

## Stack técnico (no negociable)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Lenguaje | TypeScript strict | ^5 |
| Base de datos | Supabase (cliente JS) | ^2 |
| Estilos | Tailwind CSS v4 + shadcn/ui | ^4 |
| i18n | next-intl | ^4 |
| Validación | Zod | ^4 |
| Formularios | react-hook-form + @hookform/resolvers | ^7 |
| Testing | Vitest (unit) | ^4 |
| Linting | ESLint + Prettier | ^9 / ^3 |
| Commits | Conventional Commits + commitlint + Husky | — |
| Deploy | Vercel | — |
| IA primaria | Groq API (Llama 4 Scout / Llama 3.3 70B) | — |
| IA fallback | Gemini 2.5 Flash | — |
| Email | Resend (RESEND_DEV_MODE=true en dev) | — |

---

## Cómo arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Completar las variables en .env.local

# 3. Arrancar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Otros comandos

```bash
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript sin emitir (tsc --noEmit)
```

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Groq (IA primaria — gratis permanente, sin tarjeta)
# Registrarse en console.groq.com — una key por persona
GROQ_API_KEY=

# Gemini (fallback IA — gratis, sin billing activado NUNCA)
# Registrarse en aistudio.google.com
GEMINI_API_KEY=

# Resend (emails — en dev los emails van a consola, cero cuota)
RESEND_API_KEY=
RESEND_DEV_MODE=true
```

> **Importante:** El archivo `.env.local` nunca va al repositorio. Está en `.gitignore`.

---

## Qué se simula (no es integración real)

| Elemento | Cómo se simula |
|---|---|
| Base de egresados FWD | Tabla `fwd_graduates` con datos seed locales — no hay integración externa real |
| Antivirus de archivos | Stub que retorna `"clean"` — documentado, no es funcional |
| Emails en desarrollo | `RESEND_DEV_MODE=true` — los correos se loguean en consola, cero cuota consumida |

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
| **NUNCA generar postulaciones por IA** | El junior siempre escribe su propia carta. La IA no redacta postulaciones automáticas. |
| **Todos los miembros commitean** | Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`. Penalización si solo una persona commitea. |
| **Cero `console.log` en producción** | Usar `lib/logger.ts`. Prohibido código muerto, imports sin usar, TODOs sin ticket. |
| **RLS en todas las tablas** | Responsabilidad del backend — no crear tablas sin RLS ni políticas explícitas. |
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
        postulaciones/   # mis postulaciones
        perfil/          # perfil del junior
        notificaciones/  # centro de notificaciones
      (empresa)/         # portal empresa autenticada
        dashboard/
        proyectos/
      (admin)/           # panel admin FWD
  components/
    ui/                  # primitivos shadcn/ui
    features/            # componentes de dominio
      marketplace/       # ProjectCard, ProjectFilters, etc.
      applications/      # ApplicationRow, StatusPill, etc.
      auth/              # LoginButton, etc.
    layout/              # AppHeader, AppFooter, etc.
  lib/
    supabase/            # clientes server + browser, actions
    ai/                  # provider.ts con Groq + fallback Gemini
    result.ts            # Result<T,E>, ok(), err()
    logger.ts            # logger estructurado (nunca console.log)
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

## Fases del plan de trabajo

| Fase | Semana | Contenido |
|---|---|---|
| **Fase 0** | 0 | Setup, APIs, prerequisites, tokens FWD, fuentes |
| **Fase 1** | 1–2 | Design system: PageTitle, InsightSection, StatusPill, Buttons, layouts |
| **Fase 2** | 2–3 | Autenticación OAuth, landing pública, onboarding Junior y Empresa |
| **Fase 3** | 3–4 | Perfiles: Junior (tabs, stack, portafolio) y Empresa |
| **Fase 4** | 4–6 | Agente conversacional (Groq) + matching de candidatos |
| **Fase 5** | 5–7 | Marketplace: listado, detalle, publicar/editar proyectos |
| **Fase 6** | 7–9 | Postulaciones, adjudicación, mis postulaciones |
| **Fase 7** | 9–11 | Entregables, mensajería, notificaciones (Supabase Realtime) |
| **Fase 8** | 11–13 | Reputación, panel admin, validación egresados FWD |
| **Fase 9** | 13–15 | Calidad, accesibilidad WCAG AA, pulido visual, deploy estable |

---

## Convención de PRs

- Rama: `feat/F2-BE01-signup`
- Título del PR: `feat(F2-BE01): signUp con verificación email`
- Sin commits directos a `main` — todo por PR con mínimo 1 reviewer

---

## Servicios externos (todos gratuitos, sin tarjeta)

| Servicio | Para qué | Límites gratuitos |
|---|---|---|
| Groq API | Agente conversacional + matching | 30 RPM · 6,000 TPM · 14,400 req/día. **Una key por persona en `.env.local`** |
| Gemini 2.5 Flash | Fallback IA. **SIN activar billing nunca** | ~1,000 RPD · 15 RPM |
| Supabase | DB Postgres + RLS + Auth + Storage | 500 MB DB · 1 GB Storage · 50K MAU |
| Resend | Emails transaccionales | 3,000 emails/mes · 100/día. En dev: logs a consola |
| Vercel | Hosting Next.js | Gratis para proyectos. SSL automático |
| Sentry | Error tracking en producción | 5,000 errores/mes |

---

## Decisiones técnicas relevantes

- **Groq como IA primaria (no Anthropic):** Groq tiene free tier permanente sin tarjeta. La API de Anthropic no tiene free tier permanente, por eso no se usa en este proyecto.
- **Skills unificado:** `Habilidad` y `Tecnología` son el mismo concepto. Una sola tabla `skills` con campo `tipo` para que el matching funcione correctamente.
- **Tabla `files` unificada:** Foto de perfil, logo, prototipo y entregable son archivos. Una sola tabla centraliza la lógica de RLS en Supabase Storage.
- **`@theme inline` de Tailwind v4:** Los tokens FWD se mapean a variables de color de Tailwind mediante `@theme inline {}` — no usar la sintaxis de v3.
- **Server Components por defecto:** `'use client'` solo donde haga falta interactividad real.
- **`Result<T,E>` en todas las server actions:** Nunca lanzar excepciones sin capturar. El frontend siempre recibe un tipo discriminado.

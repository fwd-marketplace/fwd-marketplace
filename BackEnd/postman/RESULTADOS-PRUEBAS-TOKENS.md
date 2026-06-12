# Resultados de pruebas de tokens — FWD Marketplace (BackEnd)

Pruebas ejecutadas contra el BackEnd local (`http://localhost:3001`) conectado al
proyecto Supabase `grwzmemhazeahaiyectt`. Objetivo: verificar qué **tipos de token**
se activan en el flujo de autenticación y cómo se comportan las rutas protegidas.

> Los valores de tokens aparecen **enmascarados** (prefijo + longitud). Nunca se
> guardan tokens reales en el repo. El usuario de prueba se eliminó al terminar.

## Entorno
- BackEnd: Express + Supabase (`npm run dev`).
- Usuario de prueba: `fwd.postman.test.****@gmail.com` (creado y confirmado solo para la prueba; eliminado al final).
- Confirmación por email del proyecto: **ACTIVADA**.

---

## Resumen de pruebas

| # | Prueba | Esperado | Obtenido | OK |
|---|--------|----------|----------|----|
| 1 | POST `/api/users/register` | 201, crea usuario | **201**, `session: null` (confirmación pendiente) | ✅ |
| 2 | POST `/api/users/login` (válido) | 200 + tokens | **200**, `access_token` + `refresh_token` | ✅ |
| 3 | Decodificar `access_token` (JWT) | claims del usuario | `role=authenticated`, `sub=<uid>` | ✅ |
| 4 | GET `/api/users/me` SIN token | 401 | **401** | ✅ |
| 5 | GET `/api/users/me` token inválido | 401 | **401** | ✅ |
| 6 | GET `/api/users/me` token válido | 200 + user | **500** (bug RLS, ver abajo) | ❌ |
| 7 | GET `/api/projects` SIN token | 401 | **401** | ✅ |
| 8 | GET `/api/projects` token válido | 200 | **500** (bug RLS, ver abajo) | ❌ |
| 9 | POST `/auth/v1/token` (refresh) | 200 + access_token nuevo | **200**, access_token distinto | ✅ |

---

## Tipos de token activados

### 1. access_token (JWT) — se activa en el LOGIN
- **Formato:** JWT (`eyJhbGciOiJF...`, ~992 caracteres, 3 partes separadas por punto).
- **Vida:** `expires_in = 3600` segundos (1 hora).
- **token_type:** `bearer` → se envía como `Authorization: Bearer <token>`.
- **Claims relevantes (al decodificarlo):**
  - `role: "authenticated"` → el rol con el que Postgres evalúa el RLS.
  - `sub: "1b67...0705b18"` → es el id del usuario; **dentro de Postgres es `auth.uid()`**.
  - `aud: "authenticated"`, `iss: ".../auth/v1"`, `exp`: fecha de expiración.
- **Uso:** es el "carnet" que valida el middleware y que el BackEnd reenvía a Postgres para el RLS.

### 2. refresh_token — se activa en el LOGIN y al refrescar
- **Formato:** cadena opaca (NO es un JWT), vida larga.
- **Uso:** en la prueba #9 se intercambió por un **access_token nuevo** (distinto al original) sin volver a enviar email/password. Confirmado: `distinto_al_original = true`.

### 3. Sin token / token inválido
- Las rutas protegidas responden **401** (pruebas #4, #5, #7). El token es obligatorio y se valida de verdad.

---

## Flujo confirmado por las pruebas

```
register  -> crea usuario, SIN tokens (confirmación pendiente)
login     -> emite access_token (JWT) + refresh_token
me/projects con Bearer <access_token> -> el middleware valida y deja pasar
me/projects sin token o con token falso -> 401
refresh_token -> nuevo access_token
```

Esto demuestra que el BackEnd usa **Supabase Auth** para emitir y validar los tokens,
y que las rutas protegidas exigen el `access_token`.

---

## Hallazgo: bug de RLS (recursión infinita) — pruebas #6 y #8

Con un access_token **válido**, las consultas que tocan la tabla `users` fallan con:

```json
{ "error": "infinite recursion detected in policy for relation \"users\"" }
```

**Causa:** la política `users_admin_ver_todos` (creada en la Sección 4.2 del ERD v4.13)
hace `SELECT ... FROM public.users` **dentro de una política de la propia tabla `users`**.
Postgres detecta la recursión y aborta. Lo mismo aplica a las demás políticas de
"admin" que consultan `users` desde otras tablas.

**Importante:** NO es un problema de tokens. El token autentica correctamente
(las pruebas 4/5/7 lo confirman); el fallo es en la capa de base de datos.

**Fix recomendado:** reemplazar la subconsulta a `users` por una función
`SECURITY DEFINER` (p. ej. `public.is_admin()`) que evite la recursión, o usar
los claims del JWT (`auth.jwt()`), y revisar todas las políticas de tipo "admin".

---

## Notas de seguridad (cómo se hicieron las pruebas)
- El `.env` con la anon key se generó local y está en `.gitignore` (no se sube).
- La `service_role` solo se usó de forma transitoria para confirmar el usuario de prueba; no se guardó.
- El usuario de prueba se **eliminó** de Supabase Auth al terminar.

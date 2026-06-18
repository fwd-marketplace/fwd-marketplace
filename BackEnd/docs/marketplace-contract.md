# Contrato de API — Marketplace (catálogos, proyectos, postulaciones, admin)

> **Última actualización:** 2026-06-15. Fuente de verdad del contrato del marketplace.
> Si te pasan una versión nueva, **reemplazá el archivo completo** (no fusiones a mano).

Complemento de `auth-contract.md` para el equipo de FrontEnd. Mismas reglas:
- Base URL: `NEXT_PUBLIC_API_URL` (ej. `http://localhost:3001/api`).
- Rutas protegidas: enviar `Authorization: Bearer <access_token>`.
- Errores: `{ "error": "mensaje" }` con el status HTTP correspondiente.

## Catálogos

### GET /api/catalogs  (Bearer)
Para selects y filtros (onboarding y marketplace).
```json
{
  "areas":        [{ "id": "uuid", "nombre": "...", "descripcion": "..." }],
  "skills":       [{ "id": "uuid", "nombre": "React", "tipo": "tecnologia", "categoria": "Frontend" }],
  "projectStates":[{ "id": "uuid", "nombre": "en_recepcion", "orden": 2 }]
}
```

## Proyectos

### GET /api/projects  (Bearer)
Listado visible (publicados + los propios de la empresa). Query opcional:
`area` (uuid), `skill` (uuid), `plazoMax` (5-15), `q` (texto en el título).
```json
{ "projects": [{
  "id": "uuid", "titulo": "...", "descripcion": "...", "usa_ia": false,
  "plazo_dias": 10, "fecha_publicacion": "...", "fecha_cierre": "...",
  "estado": { "id": "uuid", "nombre": "en_recepcion" },
  "area":   { "id": "uuid", "nombre": "..." },
  "empresa":{ "id": "uuid", "nombre_comercial": "...", "tipo": "empresa" },
  "skills": [{ "skill": { "id": "uuid", "nombre": "React", "tipo": "tecnologia", "categoria": "Frontend" } }]
}] }
```

### GET /api/projects/mias  (Bearer — empresa)
Solo los proyectos PROPIOS de la empresa, incluyendo borradores. Para "Mis Proyectos".
Misma forma de item que `GET /projects`. → `{ "projects": [ ... ] }`
(403 si el usuario no tiene perfil de empresa).

### GET /api/projects/:id  (Bearer)
→ `{ "project": { ...misma forma que el item de arriba... } }` (404 si no existe/no visible).

### POST /api/projects  (Bearer — empresa con cuenta activa)
```json
{ "titulo": "Landing", "descripcion": "...", "id_area_negocio": "uuid",
  "plazo_dias": 10, "usa_ia": false, "skills": ["uuid"], "publicar": true }
```
- `titulo`: 1-255 caracteres. `descripcion`: mínimo 1.
- `plazo_dias`: entero **entre 5 y 15** (fuera de rango → `400`).
- `id_area_negocio`: uuid del catálogo. `skills`: lista de uuids del catálogo (opcional).
- `publicar: true` → estado `en_recepcion` (visible) y calcula `fecha_cierre`.
- `publicar: false`/omitido → queda en `borrador`.
→ `201 { "project": { "id": "uuid", "titulo": "...", "estado": { "nombre": "en_recepcion" } } }`

### PATCH /api/projects/:id/estado  (Bearer — empresa dueña del proyecto)
La empresa gestiona el ciclo de vida de su proyecto. `estado` debe ser uno de:
`en_recepcion`, `en_evaluacion`, `adjudicado`, `en_desarrollo`, `cerrado`
(NO acepta `borrador` ni `cancelado`; `cancelado` es solo moderación del admin).
```json
{ "estado": "cerrado" }
```
→ `200 { "project": { "id": "uuid", "estado": { "nombre": "cerrado" } } }`
Errores: 403 si el proyecto no es tuyo; 404 si no existe; 400 si el `estado` no es válido.

Nota de flujo: aceptar una postulación (`PATCH /ofertas/:id`) NO cierra el proyecto
automáticamente — la empresa lo cierra con este endpoint cuando ya decidió.

## Postulaciones (ofertas)

### POST /api/projects/:id/ofertas  (Bearer — junior con cuenta activa)
El junior SIEMPRE escribe su carta (la IA nunca la genera).
```json
{ "propuesta": "Texto de la carta (1-5000)", "prototipo_url": "https://..." }
```
→ `201 { "oferta": { "id": "uuid", "fecha_envio": "..." } }`
Errores típicos: 409 si ya postuló o si el proyecto no está en recepción; 403 si no es junior aprobado.

### GET /api/ofertas/mias  (Bearer — junior)
```json
{ "ofertas": [{
  "id": "uuid", "propuesta": "...", "prototipo_url": "...", "fecha_envio": "...",
  "estado": { "nombre": "enviada" },
  "proyecto": { "id": "uuid", "titulo": "..." }
}] }
```

### GET /api/projects/:id/ofertas  (Bearer — empresa dueña del proyecto)
```json
{ "ofertas": [{
  "id": "uuid", "propuesta": "...", "prototipo_url": "...", "fecha_envio": "...",
  "estado": { "nombre": "enviada" },
  "junior": { "id": "uuid", "nombre": "Ana", "apellido1": "Soto" }
}] }
```

### GET /api/ofertas/:id  (Bearer — empresa dueña del proyecto)
Detalle de una postulación con los datos de **contacto** del junior, para que la
empresa pueda escribirle tras adjudicar. Solo la empresa dueña del proyecto al que
pertenece la oferta puede verla (404 si no existe, 403 si no es suya).
```json
{ "oferta": {
  "id": "uuid", "propuesta": "...", "prototipo_url": "...", "fecha_envio": "...",
  "estado": { "nombre": "adjudicada" },
  "proyecto": { "id": "uuid", "titulo": "..." },
  "junior": {
    "id": "uuid", "nombre": "Ana", "apellido1": "Soto", "apellido2": "Jiménez",
    "correo": "ana@example.com",
    "estudiante": {
      "url_github": "https://github.com/ana", "url_linkedin": "", "url_portfolio": ""
    }
  }
} }
```
Los links del `estudiante` pueden venir `null`/`""` si el junior no los completó.

### PATCH /api/ofertas/:id  (Bearer — empresa dueña)
```json
{ "accion": "aceptar" }   // o "rechazar"
```
→ `{ "oferta": { "id": "uuid", "estado": { "nombre": "adjudicada" } } }`
(`aceptar` → `adjudicada`, `rechazar` → `no_seleccionada`).

## Admin

| Endpoint | Recibe | Devuelve |
| --- | --- | --- |
| `GET /api/admin/users/pending` | Bearer admin | `{ users: [...] }` (cuentas pendientes) |
| `PATCH /api/admin/users/:id/aprobar` | Bearer admin | `{ user: {...} }` (estado → activa) |
| `PATCH /api/admin/users/:id/rechazar` | Bearer admin | `{ user: {...} }` (estado → rechazada) |
| `PATCH /api/admin/users/:id/suspender` | Bearer admin | `{ user: {...} }` (estado → suspendida) |
| `GET /api/admin/projects` | Bearer admin | `{ projects: [...] }` (todos, incluye borradores) |
| `PATCH /api/admin/projects/:id/cancelar` | Bearer admin | `{ project: {...} }` (estado → cancelado) |
| `GET /api/admin/students` | Bearer admin | `{ students: [...] }` (TODOS los estudiantes para la vista "Talento": `id, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, estado_verificacion, reputacion, url_avatar, skills: [...], usuario: { nombre, apellido1, correo }`) |
| `GET /api/admin/students/pending` | Bearer admin | `{ students: [...] }` (egresados FWD con `estado_verificacion='pendiente'`; trae `titulo_fwd` + datos del usuario) |
| `PATCH /api/admin/students/:id/verificar` | Bearer admin | `{ student: {...} }` (`estado_verificacion` → `verificado`; lo hace visible a empresas). `:id` = `estudiante.id` |
| `PATCH /api/admin/students/:id/rechazar` | Bearer admin | `{ student: {...} }` (`estado_verificacion` → `rechazado`). `:id` = `estudiante.id` |

> **Verificación de egresados FWD.** El `titulo_fwd` del junior es **auto-declarado** (lo edita
> en su perfil). El admin lo revisa y fija `estudiante.estado_verificacion`. Solo los `verificado`
> son visibles para empresas/admin (RLS). Si el junior **cambia su `titulo_fwd`**, su estado vuelve
> a `pendiente` automáticamente (hay que re-verificarlo). El `estado_verificacion` viene en
> `GET /api/users/me` y `GET /api/users/me/perfil` para que el FE muestre el estado/badge.

## IA — Asistente para crear proyectos

Ayuda a una empresa (a menudo sin perfil técnico) a definir un proyecto en lenguaje
natural: hace preguntas aclaratorias y luego genera una propuesta estructurada que
**prellena el formulario manual** de "Crear proyecto" (el usuario revisa/edita y guarda).

- Ambas rutas son `Bearer` (empresa autenticada) y tienen **rate limit por usuario**:
  20 req/min; al excederlo, `429` + `Retry-After`.
- La key del proveedor vive solo en el BackEnd (`GROQ_API_KEY`). Si no está configurada,
  responde `503`. Siempre debe existir el escape "continuar manualmente" en el FrontEnd.

### POST /api/ai/asistente-proyecto  (Bearer — streaming SSE)
Maneja un turno conversacional. Como la API no tiene memoria, se envía **todo el historial**.
```json
{ "history": [
  { "role": "user", "content": "Quiero una app para agendar citas" },
  { "role": "assistant", "content": "¿Es web o móvil?" },
  { "role": "user", "content": "Web, para mis clientes" }
] }
```
- `role`: `user` o `assistant` (el `system` lo pone el BackEnd; no se envía). `content`: 1-5000.
- Respuesta: `Content-Type: text/event-stream`. Eventos:
  - `event: delta` → `data: { "text": "fragmento" }` (ir concatenando para el efecto "escribiendo").
  - `event: done`  → `data: { "usage": { "promptTokens": n, "completionTokens": n, "totalTokens": n } | null }`.
  - `event: error` → `data: { "error": "mensaje" }` (si el proveedor falla a mitad; degradar a manual).
- Validación del body inválida → `400` (JSON, antes de abrir el stream).

### POST /api/ai/generar-propuesta  (Bearer)
A partir de la conversación (mismo `history`) devuelve el JSON estructurado final, **ya mapeado
al formulario** (con ids resueltos contra el catálogo real).
```json
{ "propuesta": {
  "nombre": "Agenda de citas online",
  "objetivo": "Permitir que los clientes reserven, vean su historial y reciban recordatorios",
  "area_negocio": "Desarrollo Web",
  "id_area_negocio": "uuid | null",
  "plazo_dias": 12,
  "habilidades": [{ "id": "uuid", "nombre": "React" }],
  "usa_ia": false,
  "preguntas_pendientes": ["¿Necesitan pasarela de pagos?"]
} }
```
- `plazo_dias`: entero **acotado a 5-15** (rango del `POST /projects`). Mapear a `plazo_dias`.
- `habilidades`: **solo** habilidades válidas del catálogo (las inventadas se descartan). Usar los
  `id` para precargar las casillas; mapean a `skills: [uuid]` del `POST /projects`.
- `id_area_negocio`: uuid del área o `null` si el modelo no acertó una del catálogo (que el FE
  deje elegir). `nombre`→`titulo`, `objetivo`→`descripcion`, `usa_ia`→toggle "usa IA".
- `preguntas_pendientes`: aspectos sin aclarar (mostrar como avisos; no bloquean el guardado).
- Si el modelo no devuelve algo usable → `502`: el FrontEnd debe **degradar al formulario manual**.

> Flujo FE: propuesta → prellenar el modal "Nuevo proyecto" (editable) → el usuario confirma con
> el `POST /api/projects` de siempre. El asistente nunca crea el proyecto por su cuenta.

## Pendientes para el FrontEnd

Trabajo de FrontEnd que habilitan los endpoints de arriba (lo construye el grupo de FrontEnd;
el BackEnd ya expone la API). Marcá cada ítem como hecho cuando la pantalla lo consuma.

- **Vista "Talento" del admin (`EgresadosView`).** Hoy renderiza datos mock; cablearla a
  `GET /api/admin/students` (como hace `administrador.tsx` con sus server actions) para mostrar
  estudiantes reales. Campos disponibles: nombre/correo (en `usuario`), `especialidad`, `skills`,
  `titulo_fwd`, `estado_verificacion`, `reputacion`, `disponibilidad`, `modalidad_preferida`,
  `url_avatar`. **No existen** en el modelo: estado laboral (contratado/disponible), empresa
  actual ni las stats de empleabilidad — eso requiere decisión de producto + migración aparte.

- **Detalle de postulación con contacto del junior.** En la vista de una postulación recibida
  (empresa), consumir `GET /api/ofertas/:id` para mostrar el contacto del junior (`correo` +
  `url_github` / `url_linkedin` / `url_portfolio`) y un CTA para contactarlo (mailto / abrir
  link). Cierra el paso final del flujo de la empresa tras adjudicar.

## Notas para el FrontEnd

- **Campos de array guardados como JSON string**: `estudiante.modalidad_preferida`,
  `empresario.sector`, `empresario.tipos_proyecto`, `empresario.apoyo_tecnico_necesario`
  llegan como texto JSON. Hay que `JSON.parse()` al leerlos.
- **Estados** (para badges/UI):
  - proyecto: `borrador, en_recepcion, en_evaluacion, adjudicado, en_desarrollo, cerrado, cancelado`.
  - oferta: `enviada, en_revision, adjudicada, no_seleccionada`.
- **Expiración de sesión**: el `access_token` dura ~1h. Si una llamada devuelve `401`
  ("Token inválido o expirado"), intentar `POST /api/users/refresh` con el `refresh_token`
  y reintentar; si el refresh también da `401`, mandar al usuario a login. Detalle en
  `auth-contract.md` (endpoints `refresh` y `logout`).

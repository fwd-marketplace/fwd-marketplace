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

## Pendientes para el FrontEnd

Trabajo de FrontEnd que habilitan los endpoints de arriba (lo construye el grupo de FrontEnd;
el BackEnd ya expone la API). Marcá cada ítem como hecho cuando la pantalla lo consuma.

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

# Contrato de API — Marketplace (catálogos, proyectos, postulaciones, admin)

> **Última actualización:** 2026-06-12. Fuente de verdad del contrato del marketplace.
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

### GET /api/projects/:id  (Bearer)
→ `{ "project": { ...misma forma que el item de arriba... } }` (404 si no existe/no visible).

### POST /api/projects  (Bearer — empresa con cuenta activa)
```json
{ "titulo": "Landing", "descripcion": "...", "id_area_negocio": "uuid",
  "plazo_dias": 10, "usa_ia": false, "skills": ["uuid"], "publicar": true }
```
- `publicar: true` → estado `en_recepcion` (visible) y calcula `fecha_cierre`.
- `publicar: false`/omitido → queda en `borrador`.
→ `201 { "project": { "id": "uuid", "titulo": "...", "estado": { "nombre": "en_recepcion" } } }`

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
| `GET /api/admin/projects` | Bearer admin | `{ projects: [...] }` (todos, incluye borradores) |
| `PATCH /api/admin/projects/:id/cancelar` | Bearer admin | `{ project: {...} }` (estado → cancelado) |

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

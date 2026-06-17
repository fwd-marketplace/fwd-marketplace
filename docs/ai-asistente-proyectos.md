# Feature: Asistente IA para creación de proyectos

> **Para el equipo de BackEnd.** Este documento describe la feature de asistente IA
> que debe implementarse para el formulario de creación de proyectos de empresa.
> El FrontEnd ya tiene el scaffold de la UI listo y esperando la integración.

---

## Contexto y motivación

Las empresas que publican proyectos en FWD Marketplace muchas veces **no tienen
conocimientos técnicos**. Conceptos como "stack tecnológico", "área de negocio" o
"skills requeridas" les resultan ajenos. El asistente IA actúa como un intermediario
que traduce la idea de negocio de la empresa en datos técnicos estructurados que
el sistema puede procesar.

---

## Flujo de usuario

```
1. La empresa abre el modal "Nuevo proyecto"
2. Ve la sección "Asistente IA" en la parte superior
3. Escribe su idea en lenguaje natural (textarea libre)
4. Hace clic en "Rellenar con IA"
5. La IA lee la idea y hace 1-3 preguntas de clarificación
6. La empresa responde cada pregunta en el mismo chat
7. Cuando la IA tiene suficiente información, rellena los campos del formulario:
   - Título del proyecto
   - Descripción detallada
   - Área de negocio (UUID del catálogo)
   - Plazo estimado (días)
   - Usa IA (boolean)
   - Skills requeridas (UUIDs del catálogo)
8. La empresa puede editar cualquier campo manualmente
9. Puede volver a usar la IA para ajustar (el proceso se puede repetir N veces)
10. Cuando está conforme, publica el proyecto normalmente
```

---

## Endpoint requerido: Asistente IA

### `POST /api/ai/project-assistant`

**Autenticación:** requerida (empresa autenticada)

**Request body:**

```ts
{
  // Historial completo de la conversación (rol + contenido)
  conversation: Array<{
    role: "user" | "assistant";
    content: string;
  }>;

  // Estado actual del formulario (opcional, para que la IA sepa qué ya está completo)
  current_form?: {
    titulo?: string;
    descripcion?: string;
    id_area_negocio?: string;
    plazo_dias?: number;
    usa_ia?: boolean;
    skills?: string[]; // UUIDs
  };

  // Catálogos disponibles para que la IA elija IDs correctos
  // El FrontEnd los envía para no tener que mantener una copia en el backend de IA
  catalogs: {
    areas: Array<{ id: string; nombre: string }>;
    skills: Array<{ id: string; nombre: string }>;
  };
}
```

**Response body:**

```ts
{
  // Mensaje de la IA para mostrar en el chat (pregunta o confirmación)
  message: string;

  // true cuando la IA tiene suficiente información para rellenar el formulario
  is_ready: boolean;

  // Solo presente cuando is_ready = true
  // El FrontEnd usa estos valores para poblar los campos del formulario
  suggested_form?: {
    titulo: string;
    descripcion: string;
    id_area_negocio: string; // UUID válido del catálogo recibido
    plazo_dias: number;       // entre 5 y 15
    usa_ia: boolean;
    skills: string[];         // UUIDs válidos del catálogo recibido
  };
}
```

**Comportamiento esperado de la IA:**

1. **Primera llamada** (conversation con 1 mensaje de usuario): la IA analiza la idea
   inicial. Si tiene suficiente contexto, devuelve `is_ready: true` con `suggested_form`.
   Si necesita aclaraciones, devuelve `is_ready: false` con una pregunta como `message`.

2. **Llamadas subsiguientes**: la IA recibe el historial completo de la conversación
   y continúa el diálogo hasta tener suficiente información.

3. **La IA NUNCA inventa IDs**: solo puede usar los IDs que vienen en `catalogs`.
   Si ninguna área o skill coincide exactamente, elige la más aproximada.

4. **Tono**: cálido, no técnico, orientado a alguien de negocio. Evitar jerga.
   Ejemplo de pregunta buena: "¿Los usuarios necesitan crear una cuenta para usar
   la app, o es de acceso libre?"

---

## Feature: Notificación al editar proyecto publicado

### Contexto

Si una empresa edita un proyecto que ya tiene postulaciones activas, los juniors
postulantes deben recibir una notificación y el proyecto debe mostrar un badge
"Editado".

### Cambios en la BD

```sql
-- Agregar campos a la tabla proyecto
ALTER TABLE proyecto
  ADD COLUMN fue_editado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN fecha_ultima_edicion TIMESTAMPTZ;
```

### Endpoint requerido: Editar proyecto

#### `PATCH /api/projects/:id`

**Autenticación:** requerida (dueño del proyecto)

**Request body:** los mismos campos de `CreateProjectInput`, todos opcionales:

```ts
{
  titulo?: string;
  descripcion?: string;
  id_area_negocio?: string;
  plazo_dias?: number;
  usa_ia?: boolean;
  skills?: string[];
}
```

**Lógica de negocio:**

```
1. Verificar que el usuario autenticado es el dueño del proyecto
2. Aplicar los cambios en la tabla `proyecto`
3. Si el estado del proyecto NO es "borrador":
   a. Marcar fue_editado = true, fecha_ultima_edicion = NOW()
   b. Buscar todas las ofertas del proyecto con estado "enviada" o "en_revision"
   c. Por cada oferta, crear un registro en la tabla `notificaciones` para el junior correspondiente
4. Retornar el proyecto actualizado
```

**Response:** el proyecto actualizado (mismo schema que `ApiProject`)

### Tabla de notificaciones (si no existe)

```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,         -- 'proyecto_editado', 'oferta_aceptada', etc.
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,
  leida BOOLEAN NOT NULL DEFAULT false,
  id_referencia UUID,                -- ID del proyecto u oferta relacionada
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: cada usuario solo ve sus propias notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuario_ve_sus_notificaciones"
  ON notificaciones FOR SELECT
  USING (auth.uid() = id_usuario);
```

**Mensaje de notificación sugerido:**

```
Tipo: "proyecto_editado"
Título: "El proyecto '{titulo}' fue actualizado"
Mensaje: "La empresa revisó los detalles del proyecto al que postulaste. Revisá los cambios."
id_referencia: id del proyecto
```

### Badge "Editado" en el FrontEnd

El FrontEnd ya está preparado para mostrar el badge si el campo `fue_editado` viene
en la respuesta de `ApiProject`. Solo es necesario agregar el campo al tipo:

```ts
// En BackEnd/src/types/ y FrontEnd/src/lib/api/types.ts
// Agregar a ApiProject:
fue_editado?: boolean;
fecha_ultima_edicion?: string | null;
```

Y en la respuesta del endpoint `GET /api/projects/mias`, incluir estos campos.

---

## Integración con el FrontEnd

### Punto de integración del asistente IA

**Archivo:** `FrontEnd/components/comp-perfil-empresa/MisProyectos.tsx`

La sección de IA en el modal ya existe visualmente. Para activarla basta con:

1. Crear la función `callAiAssistant(conversation, currentForm, catalogs)` en
   `FrontEnd/lib/api/marketplace.ts` que llame a `POST /api/ai/project-assistant`

2. Crear el action correspondiente en `FrontEnd/lib/actions/marketplace.ts`

3. En `MisProyectos.tsx`, conectar el botón "Rellenar con IA" (actualmente
   `disabled`) a ese action. El estado de conversación y el `is_ready` ya
   están contemplados en el diseño del componente.

### Punto de integración de la edición

Actualmente el formulario de creación es `POST /api/projects`. Para editar
se necesita el endpoint `PATCH /api/projects/:id` y un botón "Editar" en la
vista de detalle del proyecto (tab "Proyecto").

### Badge "Editado"

En `MisProyectos.tsx`, en las cards de la lista y en el header del detalle,
se puede agregar el badge así:

```tsx
{project.fue_editado && (
  <span className="rounded-full bg-warning/15 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-warning">
    Editado
  </span>
)}
```

---

## Stack sugerido para la IA

- **Modelo:** Claude claude-sonnet-4-6 (`claude-sonnet-4-6`) o superior — capacidad de
  razonamiento + contexto largo para manejar conversaciones multi-turno.
- **SDK:** `@anthropic-ai/sdk` (ya disponible como dependencia en el ecosistema).
- **Estrategia:** system prompt fijo que define el rol + catálogos como contexto;
  historial de mensajes del usuario como `messages[]`.

**System prompt sugerido (base):**

```
Sos un asistente amigable de FWD Marketplace que ayuda a empresas sin
conocimientos técnicos a publicar proyectos de desarrollo de software.

Tu objetivo es entender la necesidad de negocio de la empresa y traducirla
a datos técnicos estructurados: título claro, descripción detallada,
área de negocio, skills tecnológicas necesarias, plazo estimado y si el
proyecto usa IA.

Reglas:
- Hacé como máximo 3 preguntas antes de generar los datos.
- Cuando tengas suficiente información, indicá is_ready: true y completá el
  formulario usando SOLO los IDs de áreas y skills del catálogo provisto.
- Tono: cálido, simple, orientado a negocio. Sin jerga técnica.
- Si la empresa menciona una tecnología específica, incluirla en skills
  solo si existe en el catálogo; si no, elegí la más cercana.
```

---

*Documento generado el 2026-06-16. Actualizar si cambia el schema de la BD o los
endpoints existentes.*

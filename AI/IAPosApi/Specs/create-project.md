# SPEC: Crear Proyecto (Nuevo Proyecto)

> Basado en: `AI/IAPosApi/Agent/PosAgent.md`, `Memory/Context.md`, `Specs/projects-dashboard.md`.
>
> **Diseño fuente (Stitch):**
> - Proyecto: `16430592417949720296`
> - Screen: `835eea22fa38490aa2de2420291ba555`
> - Título Stitch: *Tablero Kanban con Formulario de Proyecto*
> - Referencias locales: `Specs/create-project-stitch.html`, `Specs/create-project-stitch.png`

---

## 🎯 Objetivo

Permitir que un usuario autenticado cree un nuevo proyecto desde el dashboard. Al hacer clic en **Nuevo Proyecto** (botón desktop o FAB móvil), se despliega el modal **Crear Nuevo Proyecto** según el mockup de Stitch, se validan los datos y se persisten en Firestore vía API. Tras el éxito, el modal se cierra y el proyecto aparece en el listado.

---

## 📌 Reglas de negocio

### Apertura del formulario

1. Solo con **sesión activa**.
2. Triggers (mismo modal):
   - Botón **Nuevo Proyecto** (header del dashboard).
   - FAB **+** (móvil).
3. Al abrir: formulario vacío con defaults de Prioridad = `Baja` y el usuario actual preseleccionado en el equipo.
4. Overlay semitransparente sobre el dashboard; modal centrado; foco dentro del modal.

### Campos del formulario (Stitch)

| Campo UI              | Campo API / Firestore | Tipo UI                         | Requerido | Default              | Validación                          |
|-----------------------|-----------------------|---------------------------------|-----------|----------------------|-------------------------------------|
| Nombre del Proyecto   | `title`               | text, rounded-full              | Sí        | vacío                | 1–120 caracteres                    |
| Descripción           | `description`         | textarea, rounded-xl, 3 filas   | Sí        | vacío                | 1–2000 caracteres                   |
| Fecha de entrega      | `dueDate`             | input `type="date"`             | No        | vacío                | fecha válida ISO `YYYY-MM-DD` o null |
| Prioridad             | `priority`            | select                          | Sí        | `low` (Baja)         | `low` \| `medium` \| `high`         |
| Seleccionar Equipo    | `teamMemberIds`       | avatares + botón `+`            | Sí        | `[uid actual]`       | array 1–20 UIDs; incluye al owner   |

### Placeholders (Stitch)

- Nombre: `Ej. Rediseño Web`
- Descripción: `Describe los objetivos del proyecto...`
- Fecha: control nativo date (UI `dd/mm/aaaa`)

### Labels de prioridad

| Valor interno | Label UI |
|---------------|----------|
| `low`         | Baja     |
| `medium`      | Media    |
| `high`        | Alta     |

### Valores de sistema al crear (no editables en el form)

| Campo            | Valor                                      |
|------------------|--------------------------------------------|
| `status`         | `planning`                                 |
| `progress`       | `0`                                        |
| `memberCount`    | `teamMemberIds.length`                     |
| `ownerId`        | UID autenticado                            |
| `createdAt`      | now (servidor)                             |
| `updatedAt`      | now (servidor)                             |
| `lastActivityAt` | now (servidor)                             |

### Seleccionar Equipo (MVP)

5. Mostrar avatares seleccionables + botón `+`.
6. El owner (usuario actual) siempre queda seleccionado y no se puede quitar.
7. MVP sin directorio de usuarios real:
   - Lista de candidatos = perfil actual + hasta 2 placeholders visuales **no persistidos** como UIDs inventados, **o**
   - Preferido: solo el usuario actual + el botón `+` abre un mensaje/estado “Próximamente” / deshabilitado para invitaciones.
8. Para cumplir el mockup visual: permitir seleccionar avatares demo **solo si** se mapean a UIDs reales existentes en `users`; si no hay otros usuarios, UI muestra owner + `+` (add deshabilitado o no-op con tooltip).
9. `memberCount` siempre refleja `teamMemberIds.length`.

### Acciones

10. **Crear Proyecto:** valida → `POST /api/projects` → cierra modal → refresca lista.
11. **Cancelar / X / overlay / Escape:** cierra sin guardar; si hay dirty state → *“¿Descartar cambios?”*.
12. Submit en loading: botón primario deshabilitado, texto “Creando…”.
13. Error API: mensaje inline; modal permanece abierto.
14. Éxito: cierra modal; lista actualizada (orden por `lastActivityAt` desc).

### Persistencia y seguridad

15. Auth Firebase ID token en middleware.
16. Backend ignora `ownerId` del body; usa `req.user.uid`.
17. Backend fuerza inclusión de `ownerId` dentro de `teamMemberIds`.
18. Validar payload en backend.
19. Actualizar `firestore.rules` para los campos nuevos (`dueDate`, `priority`, `teamMemberIds`) en create/update.
20. Solo usuarios `isActive = true`.

### Relación con dashboard

21. Extiende `Specs/projects-dashboard.md`: botones dejan de ser no-op.
22. Tarjetas existentes siguen funcionando; campos nuevos no rompen `ProjectCard` (pueden ignorarse en card en MVP).
23. Seed de demos: sin cambio de regla; si el usuario ya tiene proyectos, solo inserta el nuevo.

---

## 🚫 Fuera de alcance (MVP)

- Implementar el tablero Kanban de fondo del mockup Stitch (columnas Pendiente / En progreso / Terminado).
- Invitaciones reales, búsqueda de usuarios, roles por proyecto.
- Edición / borrado de proyecto.
- Subida de avatares o portada.
- Notificaciones al equipo.

---

## 📥 Inputs

### `POST /api/projects`

```json
{
  "title": "string",
  "description": "string",
  "dueDate": "YYYY-MM-DD | null",
  "priority": "low | medium | high",
  "teamMemberIds": ["uid", "..."]
}
```

Header: `Authorization: Bearer <firebaseIdToken>`

---

## 📤 Outputs

| Caso                       | Resultado                                      |
|----------------------------|------------------------------------------------|
| Click Nuevo Proyecto / FAB | Abre modal Stitch                              |
| Submit válido              | `201` + project; modal cierra; lista refresh   |
| Validación UI              | Errores bajo campos; sin request               |
| 401 / 403                  | Mensaje; redirect login si aplica              |
| Error servidor             | Inline en modal                                |
| Cancelar                   | Cierra (con dirty check)                       |

### Respuesta `201`

```json
{
  "project": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "planning",
    "statusLabel": "Planificación",
    "progress": 0,
    "memberCount": 1,
    "priority": "low",
    "priorityLabel": "Baja",
    "dueDate": "YYYY-MM-DD | null",
    "teamMemberIds": ["uid"],
    "lastActivityAt": "ISO-8601",
    "ownerId": "uid",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

---

## 🗄️ Modelo de datos

Colección `projects/{projectId}` — **extensión** del esquema actual:

| Campo            | Tipo           | Notas                                      |
|------------------|----------------|--------------------------------------------|
| title            | string         | Nombre del proyecto                        |
| description      | string         |                                            |
| status           | string         | default `planning` al crear                |
| progress         | int            | default `0`                                |
| memberCount      | int            | derivado de `teamMemberIds.length`         |
| priority         | string         | `low` \| `medium` \| `high`                |
| dueDate          | string \| null | `YYYY-MM-DD` (MVP) o timestamp             |
| teamMemberIds    | list\<string\> | incluye owner                              |
| lastActivityAt   | timestamp      | servidor                                   |
| ownerId          | string         | UID auth                                   |
| createdAt        | timestamp      | servidor                                   |
| updatedAt        | timestamp      | servidor                                   |

Documentos demo antiguos sin `priority` / `dueDate` / `teamMemberIds` siguen listables; el formatter aplica defaults (`priority: medium`, `teamMemberIds: [ownerId]`, `dueDate: null`).

---

## 🖥️ UI esperada (Stitch)

### Modal

- Título: **Crear Nuevo Proyecto** (color primary / magenta).
- Botón `close` arriba derecha.
- Card blanca, bordes muy redondeados, sombra suave.
- Footer con fondo `surface-container-low`: **Cancelar** (outline primary) + **Crear Proyecto** (sólido primary), ambos `rounded-full`.

### Campos

1. **Nombre del Proyecto** — input `rounded-full`, bg `surface-container-low`.
2. **Descripción** — textarea `rounded-xl`.
3. Grid 2 columnas: **Fecha de entrega** | **Prioridad**.
4. **Seleccionar Equipo** — fila de avatares circulares + botón `add`.

### Tokens

- Primary ≈ `#e040a0`
- Tipografía DM Sans + Material Symbols
- Coherente con dashboard/login NariBoard

### Estados UX

- Idle / loading / error inline / éxito (cierre)
- Focus trap, Escape con dirty check

---

## 🔌 API

| Método | Ruta            | Auth | Descripción       |
|--------|-----------------|------|-------------------|
| POST   | `/api/projects` | Sí   | Crea el proyecto  |

| Status | Body |
|--------|------|
| 400 | `{ "error": "Datos inválidos", "fields": { ... } }` |
| 401 | token inválido / ausente |
| 403 | cuenta desactivada |
| 500 | error al crear |

---

## ✅ Criterios de aceptación

1. UI del modal calza con Stitch (campos, labels, placeholders, botones).
2. Click Nuevo Proyecto / FAB abre el modal.
3. No crea sin nombre/descripción válidos.
4. Prioridad default Baja; owner siempre en el equipo.
5. Proyecto aparece en el dashboard tras crear.
6. `ownerId` = UID logueado; `status=planning`, `progress=0`.
7. Cancelar / X cierran correctamente.
8. Responsive usable en desktop y móvil.
9. Reglas Firestore permiten el create con el nuevo esquema.
10. Listado de proyectos viejos no se rompe.

---

## 📎 Dependencias

- `Specs/projects-dashboard.md`
- `Specs/firebase-migration.md`
- `Skills/BackendNode.md`, `Skills/FrontentVue.md`, `Skills/FirebaseMcp.md`
- Stitch screen `835eea22fa38490aa2de2420291ba555`

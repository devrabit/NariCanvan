# SPEC: Eliminar proyecto

> Extiende: `Specs/projects-dashboard.md`, `Specs/create-project.md`, `Memory/Context.md`.
>
> Stack: Vue 3 + Express + Firebase Auth + Cloud Firestore.

---

## Objetivo

Permitir que un usuario autenticado elimine un proyecto desde el dashboard. La tarjeta pide confirmación, borra el documento en Firestore junto con sus tareas, y desaparece del listado al instante.

---

## Reglas de negocio

### Acceso

1. Solo con **sesión activa** y cuenta `isActive = true`.
2. Puede eliminar el **dueño** (`ownerId` = UID autenticado) o un usuario con rol `admin`.
3. Quien no es dueño ni admin recibe `403`. El proyecto permanece en el dashboard.

### Botón en la tarjeta

4. Cada `ProjectCard` muestra un botón **Eliminar** (icono `delete`).
5. La tarjeta es un enlace al tablero (`/projects/:id`). El clic en **Eliminar** no navega: `@click.stop.prevent`.
6. Crear proyecto (botón **Nuevo Proyecto** y FAB) no cambia.

### Confirmación

7. Al pulsar **Eliminar** se abre un diálogo con el título del proyecto: *“¿Eliminar {título}? Esta acción es permanente.”*
8. **Cancelar**, clic en el overlay o Escape cierran el diálogo y no envían la petición.
9. **Confirmar** llama a `DELETE /api/projects/:projectId`.
10. Mientras la petición está en curso, **Confirmar** queda deshabilitado y muestra “Eliminando…”.
11. Si la API falla, el error se muestra en el diálogo y el proyecto sigue en la lista.
12. Si tiene éxito, se quita el proyecto del estado local. El contador y la búsqueda siguen sobre los proyectos que quedan.

### Persistencia

13. El borrado es permanente. No hay papelera ni deshacer.
14. Firestore no borra subcolecciones al borrar el padre. Hay que borrar antes cada documento de `projects/{projectId}/tasks` y después `projects/{projectId}`.
15. Si falla el borrado de una tarea, no se borra el proyecto y se responde error.
16. Header `Authorization: Bearer <firebaseIdToken>`. El backend usa el token del usuario (no ignora las reglas).
17. Las reglas actuales solo dejan borrar el proyecto al dueño. Hay que ampliar `allow delete` de `projects/{projectId}` para que el admin también pueda, igual que `canAccessProject`. El borrado de tareas ya lo permite `canAccessProject`.

---

## Fuera de alcance

- Deshacer la eliminación
- Eliminar varios proyectos a la vez
- Archivar en lugar de borrar (el estado `archived` no sustituye el borrado)
- Editar el proyecto
- Borrar el proyecto desde el tablero Kanban (solo desde la tarjeta del dashboard)

---

## Inputs

### `DELETE /api/projects/:projectId`

Sin body.

| Campo | Origen | Requerido |
|-------|--------|-----------|
| `projectId` | Tarjeta | Sí |
| Token de sesión | Header `Authorization` | Sí |
| Confirmación | Diálogo | Sí |

---

## Outputs

| Caso | Resultado |
|------|-----------|
| Confirmado y autorizado | `204` y la tarjeta desaparece |
| Cancelado | Sin cambios |
| No es dueño ni admin | `403` y mensaje en el diálogo |
| Proyecto inexistente | `404` |
| Sin sesión o token inválido | `401` |
| Cuenta desactivada | `403` |
| Error al borrar tareas o el proyecto | Mensaje en el diálogo; el proyecto permanece si el documento sigue existiendo |

---

## API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `DELETE` | `/api/projects/:projectId` | Sí | Borra las tareas del proyecto y luego el proyecto |

No choca con `DELETE /api/projects/:projectId/tasks/:taskId`.

| Status | Body |
|--------|------|
| 204 | vacío |
| 401 | `{ "error": "Token no proporcionado" }` o token inválido |
| 403 | `{ "error": "No tienes permiso para eliminar este proyecto" }` |
| 404 | `{ "error": "Proyecto no encontrado" }` |
| 500 | `{ "error": "Error al eliminar el proyecto" }` |

---

## Modelo de datos

Colección existente `projects/{projectId}` y subcolección `projects/{projectId}/tasks/{taskId}`.

No hay campos nuevos. Se eliminan el documento del proyecto y todos los documentos de `tasks`.

### Reglas Firestore

En `match /projects/{projectId}`, el `allow delete` pasa a:

- usuario autenticado, y
- `resource.data.ownerId == request.auth.uid` **o** `isAdmin()`

---

## UI esperada

- Botón **Eliminar** en la cabecera de la tarjeta, junto al icono de estado, texto `on-surface-variant` y hover `error`.
- Diálogo centrado, card blanca, `rounded-lg`, sombra suave, por encima del sidebar (`z` mayor que el layout).
- Título: **Eliminar proyecto**.
- Acciones: **Cancelar** y **Eliminar** (`bg-error`, `rounded-full`).
- Misma tipografía y color primary del dashboard NariBoard.

---

## Criterios de aceptación

1. Cada tarjeta del dashboard muestra **Eliminar**.
2. Pulsar **Eliminar** no abre el tablero Kanban.
3. Cancelar deja el proyecto igual.
4. El dueño confirma y el proyecto desaparece del listado y de Firestore, incluidas sus tareas.
5. Un admin puede eliminar un proyecto de otro usuario.
6. Quien no es dueño ni admin ve el error y el proyecto sigue.
7. Un error de API no quita la tarjeta.
8. Crear proyecto, buscar y abrir el tablero de los proyectos que quedan siguen funcionando.

---

## Dependencias

- `Specs/projects-dashboard.md`
- `Specs/create-project.md`
- `Specs/project-tasks-kanban.md`
- `Specs/firebase-migration.md`
- `ProjectCard.vue`, `ProjectsDashboardView.vue`
- `projects.controller.js`, `projects.service.js`, `projectsService.js`
- `firestore.rules`
- `Skills/BackendNode.md`, `Skills/FrontentVue.md`, `Skills/FirebaseMcp.md`

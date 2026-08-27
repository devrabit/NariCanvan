# SPEC: Editar y eliminar tarea (menú ⋮)

> Extiende: `Specs/project-tasks-kanban.md`, `Memory/Context.md`.
>
> UI: menú de opciones en `TaskCard` (icono `more_horiz` / `⋮`).

---

## 🎯 Objetivo

Cuando el usuario autenticado hace clic en el botón de opciones (`⋮`) de una tarjeta de tarea en el Kanban, debe poder **editar** o **eliminar** esa tarea. La edición abre un formulario con los datos actuales; la eliminación pide confirmación y quita la tarea del board y de Firestore.

---

## 📌 Reglas de negocio

### Acceso

1. Solo con **sesión activa** y acceso al proyecto (owner o admin), igual que crear/mover tareas.
2. El menú `⋮` aplica a tareas en **cualquier columna** (Pendiente, En progreso, Terminado). En Terminado el ícono puede seguir siendo `check_circle` en el badge de estado; el menú de opciones usa un botón `more_horiz` independiente para no perder la acción.

### Menú de opciones

3. Clic en `⋮` abre un menú contextual (popover) con:
   - **Editar**
   - **Eliminar** (estilo danger / error)
4. Clic fuera, Escape o elegir una acción cierra el menú.
5. El clic en `⋮` **no** inicia drag de la tarjeta (`@click.stop` / no disparar `dragstart`).

### Editar

6. **Editar** abre un modal (reutilizar patrón de `CreateTaskModal`) prellenado con: `title`, `description`, `priority`, `dueDate`, `status`.
7. Validaciones (mismas que crear):
   - `title`: obligatorio, 1–120
   - `description`: opcional, máx 500
   - `priority`: `low` | `medium` | `high`
   - `dueDate`: `YYYY-MM-DD` o vacío/null
   - `status`: `pending` | `in_progress` | `done` (select en el form de edición)
8. Guardar → `PATCH /api/projects/:projectId/tasks/:taskId` con los campos editables.
9. Éxito: cierra modal; actualiza la tarjeta en el board (si cambió `status`, la tarjeta se mueve de columna).
10. Error API: mensaje inline; modal permanece abierto.
11. Cancelar / X / Escape / overlay: cierra sin guardar; si hay dirty state → *“¿Descartar cambios?”*.

### Eliminar

12. **Eliminar** muestra confirmación: *“¿Eliminar esta tarea? Esta acción no se puede deshacer.”*
13. Confirmar → `DELETE /api/projects/:projectId/tasks/:taskId`.
14. Éxito: quitar la tarea del estado local del board (conteos de columna se actualizan).
15. Cancelar confirmación: no hace nada.
16. Error API: mensaje visible en el board (toast/inline).

### Persistencia y seguridad

17. `PATCH` ya existe; extender uso a edición completa (no solo `status`).
18. Nuevo endpoint `DELETE`; soft-delete no aplica (borrado real del documento Firestore).
19. Reglas Firestore ya permiten `delete` si `canAccessProject`; no hace falta cambio de reglas salvo validación al auditar.
20. No se puede editar/eliminar sin acceso al proyecto (403).

---

## 📥 Inputs

### `PATCH /api/projects/:projectId/tasks/:taskId`

```json
{
  "title": "string",
  "description": "string",
  "priority": "low | medium | high",
  "dueDate": "YYYY-MM-DD | null",
  "status": "pending | in_progress | done"
}
```

Header: `Authorization: Bearer <firebaseIdToken>`

### `DELETE /api/projects/:projectId/tasks/:taskId`

Sin body. Header Bearer.

---

## 📤 Outputs

| Caso | Resultado |
|------|-----------|
| Clic ⋮ | Menú Editar / Eliminar |
| Editar → guardar válido | `200` + `{ task }`; UI actualizada |
| Eliminar → confirmar | `204` o `200` + ok; tarea desaparece del board |
| 404 tarea | Mensaje amigable |
| 401 / 403 | Mensaje; redirect login si aplica |

---

## 🔌 API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `PATCH` | `/api/projects/:projectId/tasks/:taskId` | Sí | Editar campos (ya existe; usar para edición completa) |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Sí | Eliminar tarea |

---

## 🖥️ UI esperada

- Menú pequeño anclado al `⋮` (fondo surface, sombra suave, rounded).
- Modal de edición: título **Editar tarea**; botón primario **Guardar**; campos alineados al crear.
- Confirmación de borrado: `window.confirm` en MVP (aceptable) o dialog simple.

---

## ✅ Criterios de aceptación

- [x] Clic en ⋮ muestra Editar y Eliminar.
- [x] Editar abre modal con datos actuales; guardar persiste y refresca la tarjeta.
- [x] Cambiar status en edición mueve la tarjeta de columna.
- [x] Eliminar con confirmación quita la tarea del board y de Firestore.
- [x] Sin confirmación no se elimina.
- [x] Drag & drop y crear tarea siguen funcionando.
- [x] Usuario sin acceso no puede editar/eliminar (API 403).

---

## 🚫 Fuera de alcance

- Comentarios, subtareas, historial.
- Asignar otros miembros.
- Soft-delete / papelera.
- Redeploy Hostinger automático.

---

## 📎 Dependencias

- `Specs/project-tasks-kanban.md`
- `CreateTaskModal.vue`, `TaskCard.vue`, `ProjectBoardView.vue`
- `tasks.controller.js` / `tasks.service.js` / `tasksService.js`

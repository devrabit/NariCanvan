# PLAN: Editar y eliminar tarea (menú ⋮)

> Ejecutar solo tras aprobación de SPEC + PLAN.
> Skills: `BackendNode.md`, `FrontentVue.md`, `FirebaseMcp.md`.
> SPEC: `Specs/task-edit-delete.md`

---

## 🎯 Objetivo

Habilitar Editar y Eliminar desde el menú `⋮` de cada tarjeta de tarea en el Kanban.

---

## 🪜 Pasos

### 1. Backend

1. `firestore.service.js` — añadir `deleteDocumentByPath(accessToken, documentPath)` si no existe.
2. `tasks.controller.js` — `deleteTask`: loadAccessibleProject → DELETE path `projects/{id}/tasks/{taskId}` → `204` o `{ ok: true }`.
3. `projects.routes.js` — `DELETE /:projectId/tasks/:taskId` → `deleteTask`.
4. Confirmar que `validatePatchTaskPayload` ya acepta title/description/priority/dueDate/status (sí); no hace falta cambio salvo mensajes.

### 2. Frontend

1. `tasksService.js` — `deleteTask(accessToken, projectId, taskId)`.
2. `TaskCard.vue`:
   - Botón `more_horiz` con `@click.stop` abre menú (Editar / Eliminar).
   - Emit `edit` / `delete` (o un solo `action`).
   - Cerrar menú al click fuera / Escape.
3. Extender `CreateTaskModal.vue` a modo edición **o** crear `EditTaskModal.vue`:
   - Props: `open`, `projectId`, `task` (null = create).
   - Prefill; submit → `patchTask`; emit `updated`.
   - Preferido: extender modal existente con prop `task` opcional para no duplicar UI.
4. `ProjectBoardView.vue`:
   - Abrir modal edición con tarea seleccionada.
   - `onTaskUpdated` reemplaza en `tasks`.
   - `onTaskDelete` → confirm → `deleteTask` → filtrar de `tasks`.
5. Cablear eventos desde `KanbanBoard` / `KanbanColumn` → `TaskCard`.

### 3. Integraciones / Firestore

1. Reglas: `allow delete` ya existe en `tasks`; verificar con lectura rápida; **no redeploy** salvo que falte.
2. Actualizar `Memory/Context.md` — “editar/eliminar tarea desde ⋮”.

### 4. Validaciones

- PATCH con campos parciales o completos.
- DELETE 404 si no existe.
- Menú no inicia drag.

### 5. Testing

1. Reiniciar `npm run dev`.
2. Abrir proyecto → ⋮ → Editar → cambiar título/prioridad → Guardar.
3. ⋮ → Eliminar → cancelar (sigue); confirmar (desaparece).
4. Editar status a otra columna → tarjeta cambia de columna.
5. Crear y DnD siguen OK.

---

## ⚙️ Detalle técnico

### Backend

| Método | Ruta | Acción |
|--------|------|--------|
| PATCH | `/api/projects/:projectId/tasks/:taskId` | (existente) edición completa |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | nuevo |

### Frontend

- Menú popover en `TaskCard`.
- Modal create/edit compartido.
- Estado en `ProjectBoardView`.

---

## 🧪 Testing

| Caso | Esperado |
|------|----------|
| Editar título | Persiste al recargar |
| Eliminar | 404 en GET posterior; UI sin tarjeta |
| Sin token | 401 |
| Dirty cancel | No guarda |

---

## 🚨 Reglas

- No saltar SPEC/PLAN.
- No redeploy Hostinger salvo pedido.
- Código modular, reutilizar modal de crear.

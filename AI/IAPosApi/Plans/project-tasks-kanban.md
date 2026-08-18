# PLAN: Detalle de proyecto — Panel de tareas (Kanban)

> Ejecutar solo tras aprobación de SPEC + PLAN.
> Skills: `BackendNode.md`, `FrontentVue.md`, `FirebaseMcp.md`.

---

## 1. Firestore

1. Extender `firestore.rules` con `match /projects/{projectId}/tasks/{taskId}` (CRUD si owner/admin del proyecto).
2. Validar campos de tarea (`title`, `description`, `priority`, `status`, `dueDate`, `assigneeIds`, timestamps).
3. Desplegar reglas (`firebase_deploy --only firestore`).

## 2. Backend

1. `tasks.service.js` — validate/format/build/demoTasks.
2. `tasks.controller.js` — list (seed si vacío), create, updateStatus/patch.
3. `projects.controller.js` — `getProject` por id.
4. Rutas:
   - `GET /api/projects/:projectId`
   - `GET|POST /api/projects/:projectId/tasks`
   - `PATCH /api/projects/:projectId/tasks/:taskId`
5. Helpers Firestore: query subcollection, create, patch (ya hay `createDocument` / `queryCollection`; añadir path anidado o `projects/{id}/tasks`).

## 3. Frontend

1. Router: ` /projects/:projectId` → `ProjectBoardView.vue` (auth).
2. `ProjectCard` → `router-link` o `@click` a detalle.
3. `projectsService.js` + `tasksService.js` (fetch project, list/create/patch tasks).
4. Componentes:
   - `KanbanBoard.vue`
   - `KanbanColumn.vue`
   - `TaskCard.vue`
   - `CreateTaskModal.vue` (mínimo)
5. `ProjectBoardView.vue` — carga proyecto + tareas, búsqueda, DnD / mover, FAB.
6. Ajustar placeholder de search en layout cuando esté en board (prop o override).

## 4. Memoria

1. Actualizar `Memory/Context.md` — funcionalidad “Detalle proyecto + Kanban tareas”.

## 5. Verificación

1. Reiniciar `npm run dev`.
2. Login → clic proyecto → board con columnas.
3. Crear y mover una tarea; confirmar persistencia al recargar.

## 6. Entrega

- SPEC/PLAN/refs Stitch ya en `AI/IAPosApi/Specs/`.
- No push ni Hostinger salvo que el usuario lo pida.

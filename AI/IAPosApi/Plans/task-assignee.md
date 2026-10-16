# PLAN: Asignar responsables de una tarea

> SPEC: `Specs/task-assignee.md`

---

## 🎯 Objetivo

Agregar en la tarjeta de la tarea un botón que abre la lista de usuarios activos y permite sumar o quitar varios responsables en la misma tarea.

---

## 🪜 Pasos

1. Backend: aceptar `assigneeIds` en el PATCH y exponer `GET /api/users`.
2. Reglas Firestore: permitir leer perfiles activos a cualquier usuario autenticado.
3. Frontend: botón en la tarjeta, panel de selección y actualización del avatar con el nombre.
4. Validar en el tablero: agregar más de un responsable, ver sus iniciales y que no se copia la tarea a otro proyecto.

---

## ⚙️ Detalle técnico

### Backend

- `backend/src/services/tasks.service.js`
  - En `validatePatchTaskPayload`, si viene `assigneeIds`: array de 1 a 20 strings distintos y no vacíos (máx. 128 cada uno). Guardar esa lista, sin duplicados.
- `backend/src/services/firestore.service.js`
  - Reutilizar `queryCollection` o `listDocumentsAtPath` para la colección `users`.
- Nuevo `backend/src/controllers/users.controller.js` y `backend/src/routes/users.routes.js`
  - `GET /` con `authMiddleware`.
  - Listar `users`, quedarse con `isActive !== false`, mapear `{ id, fullName, email }`, ordenar por `fullName`.
- `backend/src/index.js`: `app.use('/api/users', usersRoutes)`.

### Firestore

- En `match /users/{userId}`, ampliar `allow read` a:

  `isOwner(userId) || (isAuthenticated() && resource.data.isActive == true)`

- Desplegar las reglas. No cambiar create, update ni delete de `users`.
- No cambiar las reglas de `tasks`: `assigneeIds` ya admite de 1 a 20 ids y el update del dueño o admin ya está permitido.

### Frontend

- `frontend/src/services/usersService.js`: `fetchUsers(accessToken)` → `GET /api/users`.
- `frontend/src/services/tasksService.js`: el `patchTask` existente envía `{ assigneeIds }` con la lista completa (1 a 20).
- `frontend/src/components/TaskAssigneeButton.vue`
  - Botón en la esquina de la tarjeta, con hasta tres iniciales y `+N` si hay más.
  - Al abrir, carga usuarios. Cada fila muestra nombre, correo y si ya está asignada.
  - Clic en una fila no asignada agrega ese uid y hace PATCH. Clic en una ya asignada la quita, salvo que sea la última.
  - A los 20 responsables, las filas libres quedan deshabilitadas.
  - El panel permanece abierto tras guardar. Estado de carga y error dentro del panel.
- `TaskCard.vue`: reemplazar el círculo de iniciales estático por este botón. Las iniciales salen de `fullName` si el padre pasa el mapa de usuarios; si no hay nombre, usar las dos primeras letras del uid.
- `ProjectBoardView.vue`: al montar el tablero, cargar usuarios una vez y pasarlos al board. Al evento `assigned`, reemplazar la tarea en `tasks` igual que en `onTaskUpdated`.
- `KanbanBoard.vue` y `KanbanColumn.vue`: reenviar `assigned`.

---

## 🧪 Testing

1. Clic en **Responsable** abre la lista de cuentas activas (incluye `jessicap.giraldop@gmail.com` y el resto).
2. Elegir dos personas deja ambos uid en `assigneeIds` y la tarjeta muestra las dos iniciales.
3. Quitar a una persona la saca de la lista y deja al resto. No se puede quitar a la última.
4. Con 20 responsables no se puede agregar otro.
5. Cerrar el panel no revierte los cambios ya guardados.
6. Una tarea de un proyecto no aparece en otro.
7. Usuario inactivo no sale en la lista.

---

## 🚨 Reglas

- No ejecutar este plan hasta aprobación del SPEC y del PLAN.

# PLAN: Eliminar proyecto

> Ejecutar solo tras aprobación de SPEC + PLAN.
> Skills: `BackendNode.md`, `FrontentVue.md`, `FirebaseMcp.md`.
> SPEC: `Specs/delete-project.md`

---

## Objetivo

Agregar el borrado permanente de un proyecto desde el dashboard: confirmación en la tarjeta, `DELETE /api/projects/:projectId`, borrado de sus tareas en Firestore y regla para que el dueño o un admin puedan eliminar el documento.

---

## Pasos

### 1. Backend

1. En `firestore.service.js`, hacer que el listado de una subcolección recorra todas las páginas (`nextPageToken`), no solo los primeros 100 documentos. Reutilizarlo para `projects/{projectId}/tasks`.
2. En `projects.service.js`, agregar `canDeleteProject(project, user, profile)`: `true` si `profile.role === 'admin'` o `project.ownerId === user.uid`.
3. En `projects.controller.js`, agregar `deleteProject`:
   - Leer `projects/{projectId}` con el token del usuario.
   - Si no existe → `404`.
   - Si `canDeleteProject` es falso → `403`.
   - Listar `projects/{projectId}/tasks` y borrar cada documento con `deleteDocumentByPath`.
   - Si falla el borrado de una tarea → `500` y no borrar el proyecto.
   - Borrar `projects/{projectId}`.
   - Responder `204` sin body.
4. En `projects.routes.js`, registrar `DELETE /:projectId` con `authMiddleware`, sin alterar `DELETE /:projectId/tasks/:taskId`.
5. El middleware actual ya rechaza token ausente (`401`), token inválido (`401`) y cuenta inactiva (`403`).

### 2. Firestore

1. En `firestore.rules`, cambiar `allow delete` de `projects/{projectId}` para que lo permita el dueño o `isAdmin()`.
2. No cambiar el `allow delete` de `tasks`: `canAccessProject` ya cubre dueño y admin.
3. Desplegar solo Firestore con Firebase MCP (`firebase_deploy`, rules). Revisar las reglas con el auditor antes de darlas por definitivas.

### 3. Frontend

1. En `projectsService.js`, agregar `deleteProject(accessToken, projectId)` contra `DELETE /api/projects/:projectId`. Tratar `204` como éxito. En otro status, lanzar el `error` del JSON.
2. En `ProjectCard.vue`, botón **Eliminar** (icono `delete`) junto al icono de estado. `@click.stop.prevent` y emitir `delete` con el proyecto. El resto de la tarjeta sigue navegando al tablero.
3. En `ProjectsDashboardView.vue`:
   - Estado `projectToDelete`, `deleting`, `deleteError`.
   - Diálogo con `Teleport` a `body`, título **Eliminar proyecto** y el texto *“¿Eliminar {título}? Esta acción es permanente.”*
   - **Cancelar**, overlay y Escape cierran sin llamar al API. No cerrar mientras `deleting` es verdadero.
   - **Confirmar** deshabilitado durante la petición, texto “Eliminando…”.
   - Éxito: quitar el id de `projects` y cerrar el diálogo.
   - Error: mostrarlo en el diálogo y dejar la tarjeta.
4. No tocar **Nuevo Proyecto**, el FAB ni `CreateProjectModal`.

### 4. Validaciones

1. Sin `projectId` o documento inexistente → `404`.
2. Usuario que no es dueño ni admin → `403` con *“No tienes permiso para eliminar este proyecto”*.
3. Cancelar no dispara `fetch`.
4. Un fallo al borrar tareas aborta antes de borrar el proyecto.

### 5. Testing

1. Dueño confirma → la tarjeta sale del dashboard, el contador baja y el documento y sus tareas ya no están en Firestore.
2. Cancelar, overlay y Escape → el proyecto sigue y no hay request.
3. Clic en **Eliminar** no abre `/projects/:id`. Clic en el resto de la tarjeta sí abre el tablero.
4. Usuario que no es dueño ni admin → mensaje `403` y la tarjeta permanece.
5. Admin puede eliminar un proyecto de otro dueño.
6. Error de API → mensaje en el diálogo y la lista no cambia.
7. Crear proyecto, buscar y abrir otro proyecto siguen igual.
8. Reiniciar frontend y backend y repetir el camino del dueño en el navegador.

---

## Detalle técnico

### Backend

- `DELETE /api/projects/:projectId`
- Auth: `authMiddleware` (`req.user.uid`, `req.profile.role`, `req.accessToken`)
- Lectura: `getDocument(accessToken, 'projects', projectId)`
- Tareas: listar `projects/{projectId}/tasks` con paginación y `deleteDocumentByPath` por cada una
- Proyecto: `deleteDocumentByPath(accessToken, 'projects/{projectId}')`
- Respuestas: `204`, `401`, `403`, `404`, `500` según el spec

### Frontend

- `ProjectCard.vue`: botón + evento `delete`
- `ProjectsDashboardView.vue`: diálogo y filtro local `projects.value = projects.value.filter((project) => project.id !== id)`
- `projectsService.js`: `deleteProject`
- UI: botón `text-on-surface-variant` con hover `error`; confirmar `bg-error text-on-error rounded-full`; diálogo por encima del sidebar

### Firestore

```
allow delete: if isAuthenticated() && (
  resource.data.ownerId == request.auth.uid || isAdmin()
);
```

---

## Testing

- Camino feliz del dueño, incluidas las tareas
- Cancelación y clic que no navega
- `403` para quien no es dueño
- Admin
- Fallo de API
- Crear, buscar y abrir un proyecto que queda

---

## Reglas

- Ejecutable sobre el código Firebase actual (`GET`/`POST /api/projects`, Kanban de tareas)
- Sin borrado masivo, sin deshacer y sin borrar desde el tablero
- No implementar hasta aprobar este SPEC y este PLAN

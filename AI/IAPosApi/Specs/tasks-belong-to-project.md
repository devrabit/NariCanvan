# SPEC: Una tarea solo pertenece a su proyecto

> Extiende: `Specs/project-tasks-kanban.md` (regla 13), `Memory/Context.md`.
>
> Sustituye el seed de tareas demo al listar un proyecto vacío.

---

## 🎯 Objetivo

Cada tarea vive solo en el proyecto donde se creó. Abrir o listar un proyecto no debe copiar tareas de ejemplo ni tareas de otro proyecto a su subcolección.

---

## 📌 Reglas de negocio

### Pertenencia

1. Una tarea existe únicamente en `projects/{projectId}/tasks/{taskId}`.
2. `GET /api/projects/:projectId/tasks` devuelve solo los documentos de esa subcolección.
3. `POST /api/projects/:projectId/tasks` crea la tarea solo bajo el `projectId` de la ruta.
4. Editar, mover o eliminar una tarea usa el mismo `projectId` de la ruta. No se crea una copia en otro proyecto.

### Proyecto sin tareas

5. Si la subcolección está vacía, la respuesta es `{ tasks: [], total: 0 }`.
6. No se escriben tareas de ejemplo al listar. El tablero vacío, con los botones `+`, es el estado correcto.
7. Se elimina el seed `demoTasks` de `listTasks`.

### Datos ya copiados

8. Borrar de Firestore las tareas de ejemplo que el seed ya escribió en proyectos reales. Títulos exactos:

   - Diseñar Hero Section
   - Revisión de Iconografía
   - Integración Tailwind
   - Testing de Microinteracciones
   - Definición de Paleta

9. No borrar tareas con otro título. `subier propaganda al grupo` se conserva en los proyectos donde ya está, porque no sale del seed.

### Fuera de alcance

- Mover una tarea de un proyecto a otro.
- Cambiar el seed de proyectos demo del dashboard.

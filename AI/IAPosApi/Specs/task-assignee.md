# SPEC: Asignar responsables de una tarea

> Extiende: `Specs/project-tasks-kanban.md`, `Specs/task-edit-delete.md`, `Memory/Context.md`.
>
> La tarea ya existe. Este cambio agrega el botón para elegir quiénes son los responsables.

---

## 🎯 Objetivo

En cada tarjeta del Kanban hay un botón. Al hacer clic, el usuario agrega una o más personas activas de NariBoard como responsables de esa tarea.

---

## 📌 Reglas de negocio

### Acceso

1. Solo con sesión activa y acceso al proyecto (dueño o admin), igual que editar la tarea.
2. El botón está en la tarjeta, en cualquier columna (Pendiente, En progreso, Terminado).
3. El clic no inicia el arrastre de la tarjeta.

### Botón y elección

4. El botón se llama **Responsable** (ícono `person_add`). Si la tarea ya tiene responsables, muestra hasta tres círculos con sus iniciales y, si hay más, un `+N`. El `aria-label` es *“Agregar responsable”*.
5. Clic abre un panel con las cuentas **activas** (`users` con `isActive == true`): nombre (`fullName`) y correo. Quien ya está en `assigneeIds` aparece marcado.
6. Clic en una persona que no está asignada la **agrega**. `assigneeIds` conserva a los anteriores y suma ese uid, sin duplicados.
7. Clic en una persona ya asignada la **quita**, siempre que quede al menos un responsable.
8. Máximo **20** responsables por tarea. Al llegar a 20, no se puede agregar otro y el panel lo indica.
9. No se escribe un nombre suelto. Cada responsable tiene que ser un usuario de Firebase ya registrado.
10. Cerrar con la X, Escape o clic fuera no descarta los cambios ya guardados; cada clic en una persona se guarda al momento.
11. Éxito: la tarjeta actualiza las iniciales con el nombre (no con el uid) sin cerrar el panel, para poder agregar a otra persona.
12. Error del API: mensaje en el panel; esa persona no entra ni sale de la lista.

### Persistencia

13. `PATCH /api/projects/:projectId/tasks/:taskId` con `{ "assigneeIds": ["<uid>", "<uid>"] }`.
14. El backend acepta `assigneeIds` si es una lista de 1 a 20 uids distintos, cada uno un string no vacío (máx. 128).
15. Lista de personas: `GET /api/users` devuelve `{ users: [{ id, fullName, email }] }` de cuentas activas, ordenadas por nombre.
16. Reglas de Firestore: un usuario autenticado puede **leer** documentos de `users` activos, para poder armar la lista. Crear, editar y borrar perfiles no cambia.
17. La tarea sigue viviendo solo en `projects/{projectId}/tasks/{taskId}`.

### Fuera de alcance

- Invitar a alguien que todavía no tiene cuenta.
- Dejar la tarea sin ningún responsable.

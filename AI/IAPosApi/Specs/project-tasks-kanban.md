# SPEC: Detalle de proyecto — Panel de tareas (Kanban)

> Basado en: `AI/IAPosApi/Agent/PosAgent.md`, `Memory/Context.md`, `Specs/create-project.md`.
>
> **Diseño fuente (Stitch):**
> - Proyecto: `16430592417949720296`
> - Screen: `6a8609f64fd84447a098ba65de692768`
> - Título Stitch: *Tablero Kanban*
> - URL: https://stitch.withgoogle.com/projects/16430592417949720296?node-id=6a8609f64fd84447a098ba65de692768
> - Referencias locales: `Specs/project-tasks-kanban-stitch.html`, `Specs/project-tasks-kanban-stitch.png`

---

## 🎯 Objetivo

Cuando el usuario autenticado entra al **detalle de un proyecto existente**, debe ver el **panel de tareas** en formato Kanban (Stitch), con columnas Pendiente / En progreso / Terminado, reutilizando el layout NariBoard (sidebar + top bar) y datos del proyecto.

---

## 📌 Reglas de negocio

### Navegación

1. Solo con **sesión activa**.
2. Desde el dashboard, al hacer clic en una **tarjeta de proyecto** → ruta `/projects/:projectId`.
3. Si el proyecto no existe o el usuario no es owner (ni admin) → error 404/403 amigable + enlace a volver a Proyectos.
4. Sidebar **Proyectos** permanece activo; clic en Proyectos vuelve a `/`.

### Cabecera de contexto (Stitch)

5. Mostrar en el header (o zona superior del board):
   - `Proyecto: {title}`
   - Progreso: `{progress}% completado` (usar `project.progress`; el texto “Sprint …” del mock es cosmético — MVP: solo `progress%`).
   - Avatar del owner / usuario actual.
6. Buscador del layout en esta vista: placeholder **“Buscar tareas…”** y filtra por título/descripción de tareas en cliente.

### Columnas Kanban

| Columna UI     | `status` interno | Contador | Acción header          |
|----------------|------------------|----------|------------------------|
| Pendiente      | `pending`        | n tasks  | `+` (crear tarea)      |
| En progreso    | `in_progress`    | n tasks  | `+` (crear tarea)      |
| Terminado      | `done`           | n tasks  | check (sin + o +)      |

7. Orden visual fijo: Pendiente → En progreso → Terminado.
8. Scroll horizontal en móvil si no caben las 3 columnas.

### Tarjeta de tarea (Stitch)

| Campo UI              | Campo API/Firestore | Notas                                      |
|-----------------------|---------------------|--------------------------------------------|
| Título                | `title`             | requerido, 1–120                           |
| Descripción breve     | `description`       | opcional, máx 500                          |
| Prioridad             | `priority`          | `low` \| `medium` \| `high`                |
| Fecha límite          | `dueDate`           | `YYYY-MM-DD` o null; UI con ícono reloj    |
| Asignados             | `assigneeIds`       | lista UIDs (MVP: owner por default)        |
| Estado                | `status`            | `pending` \| `in_progress` \| `done`       |

Labels prioridad UI: Alta / Media / Baja (mismo mapeo que proyectos).  
En columna Terminado, badge puede mostrar “Finalizado” y pie “Completado” (Stitch).

9. Menú `⋮` en tarjeta: MVP puede ser no-op o solo “Mover a…”; no bloquear el board.

### Persistencia

10. Colección: `projects/{projectId}/tasks/{taskId}`.
11. Campos sistema: `createdAt`, `updatedAt`, `createdBy` (uid).
12. Reglas Firestore: read/create/update/delete si el usuario puede leer el proyecto padre (owner o admin).
13. Si el proyecto no tiene tareas: seed de **demo** al listar (igual patrón que proyectos) **o** board vacío con CTAs `+`. Preferido: **seed demo solo si count=0** (3–5 tareas de ejemplo ligadas al proyecto), para que el panel no se vea vacío en primera visita.

### Acciones MVP

14. **Ver** board con tareas agrupadas por columna.
15. **Crear tarea** (botón `+` de columna o FAB rosa): modal/form mínimo — título (req), descripción, prioridad, dueDate, status = columna origen. `POST /api/projects/:id/tasks`.
16. **Mover tarea** entre columnas: al soltar o vía acción → `PATCH /api/projects/:id/tasks/:taskId` con `{ status }`. DnD HTML5 nativo o botones “Mover”; Stitch pide simulación visual — implementar **drag & drop básico** entre columnas.
17. Fuera de alcance MVP: edición completa de tarea, comentarios, subtareas, “Añadir nueva columna”, notificaciones campana/engranaje.

### API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/projects/:projectId` | Bearer | Detalle del proyecto |
| `GET` | `/api/projects/:projectId/tasks` | Bearer | Lista tareas (`?search=` opcional) |
| `POST` | `/api/projects/:projectId/tasks` | Bearer | Crear tarea |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId` | Bearer | Actualizar (al menos `status`) |

Respuestas JSON: `{ project }`, `{ tasks, total }`, `{ task }`.

---

## 🎨 UI / diseño

- Reutilizar `DashboardLayout` / tokens existentes (primary pink, rounded-full / Candy).
- Columnas: fondo `surface-container-low`, cards blancas con sombra suave.
- FAB móvil `+` alineado a Stitch (abre crear en Pendiente por default).
- Tipografía alineada al dashboard actual (Material Symbols + fuentes del proyecto).

---

## ✅ Criterios de aceptación

- [ ] Clic en proyecto del dashboard abre `/projects/:id` y muestra Kanban Stitch.
- [ ] Header muestra título y % del proyecto real.
- [ ] Tres columnas con conteos correctos.
- [ ] Tareas se listan desde Firestore vía API.
- [ ] Crear tarea aparece en la columna correcta.
- [ ] Mover tarea actualiza `status` y la UI.
- [ ] Buscar tareas filtra en el board.
- [ ] Usuario sin acceso no ve el board.
- [ ] Reglas Firestore desplegadas para `tasks`.

---

## 🚫 Fuera de alcance

- Websockets / realtime.
- Asignar miembros distintos del owner (salvo UI avatar demo).
- Columnas personalizadas.
- Redesploy Hostinger automático (solo local + push si se pide).

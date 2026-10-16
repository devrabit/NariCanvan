# PLAN: Una tarea solo pertenece a su proyecto

> SPEC: `Specs/tasks-belong-to-project.md`

---

## 🎯 Objetivo

Dejar de copiar tareas de ejemplo al abrir un proyecto vacío, y borrar las que ese seed ya guardó en proyectos reales.

---

## 🪜 Pasos

1. Backend: quitar el seed en el listado de tareas.
2. Datos: borrar en Firestore las tareas demo ya ligadas a proyectos.
3. Frontend: el tablero vacío sigue mostrando las columnas y el botón de crear. No hace falta una vista nueva.
4. Validar el listado vacío y que crear una tarea no la replica en otro proyecto.

---

## ⚙️ Detalle técnico

### Backend

- `backend/src/controllers/tasks.controller.js`
  - En `listTasks`, eliminar el bloque que, si `tasks.length === 0`, llama a `demoTasks` y `createDocumentAtPath`.
  - Devolver la lista filtrada tal cual, aunque esté vacía.
  - Quitar el import de `demoTasks` si ya no se usa.
- `backend/src/services/tasks.service.js`
  - Eliminar `demoTasks` si ningún otro módulo la importa.

### Firestore

Borrar estos documentos (títulos del seed):

| Proyecto | Documento |
|---|---|
| `IEgPc5lnunGTWOk1H9sr` | `MVvMGZh1D8hVFQZjwacN`, `f4z58zal6pN2ktJ9kpw3`, `tN6GeJNDc14likrpYKKo` |
| `bERGni75Ua74JFloclCt` | `67pORBsx8XDsPpqFHY4L`, `NFOeKVHKg3HtZWK59WAU`, `WmM3C2C8ewAfJmbIaKYF`, `ZpvDyjGcyN9xUePLGAnZ` |
| `pfP1dZ5rwPk3hmgnI1m7` | `4I2mCfTIauxYtXbbhxhN`, `bLzzswMolsU0TdwRbCOj`, `mJn8zWl7Q2nCtFf5WYLi`, `sZ4gkKM0XKaPOhgvSKdC`, `tMpSgQdC1HEqPLFCwzG1` |

Conservar `subier propaganda al grupo` en los tres proyectos.

### Frontend

- `ProjectBoardView` ya pinta `KanbanBoard` con la lista que devuelve el API. Con `tasks: []` las columnas quedan vacías y el `+` sigue creando en `route.params.projectId`.
- No cambiar rutas ni el modal.

---

## 🧪 Testing

1. `GET /api/projects/:id/tasks` de un proyecto sin tareas responde `tasks: []` y no crea documentos.
2. Abrir otro proyecto no muestra Diseñar Hero Section, Revisión de Iconografía, Integración Tailwind, Testing de Microinteracciones ni Definición de Paleta.
3. `subier propaganda al grupo` sigue en el proyecto donde ya existía.
4. Crear una tarea en el proyecto A no aparece al abrir el proyecto B.
5. Crear, mover y eliminar una tarea en su propio proyecto sigue funcionando.

---

## 🚨 Reglas

- No ejecutar este plan hasta aprobación del SPEC y del PLAN.
- No borrar tareas cuyo título no esté en la lista del seed.

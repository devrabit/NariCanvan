# PLAN: Crear Proyecto (Nuevo Proyecto)

> Basado en: `AI/IAPosApi/Specs/create-project.md`  
> Diseño: Stitch `projects/16430592417949720296/screens/835eea22fa38490aa2de2420291ba555`

---

## 🎯 Objetivo

Implementar el alta de proyectos con el modal de Stitch (**Crear Nuevo Proyecto**), endpoint `POST /api/projects`, extensión del modelo Firestore y cableado de los botones Nuevo Proyecto / FAB del dashboard. Sin código hasta aprobación de SPEC + PLAN.

---

## 🪜 Pasos

### Fase 1 — Firestore / reglas

1. Extender validación en `firestore.rules` para `projects`:
   - Campos nuevos: `priority`, `dueDate`, `teamMemberIds`
   - Mantener campos existentes: `title`, `description`, `status`, `progress`, `memberCount`, `ownerId`, timestamps
2. Desplegar reglas (`firebase_deploy --only firestore:rules`)
3. (Opcional) índice si más adelante se filtra por `priority`/`dueDate` — no requerido para create/list actual

### Fase 2 — Backend

1. Ampliar `formatProject` con `priority`, `priorityLabel`, `dueDate`, `teamMemberIds` + defaults para docs legacy
2. Añadir `validateCreateProjectPayload(body)` en service
3. Controller `createProject`:
   - Validar body
   - Forzar `ownerId`, incluir owner en `teamMemberIds`
   - Set `status=planning`, `progress=0`, `memberCount`, timestamps
   - `createDocument` en Firestore
   - Responder `201 { project }`
4. Ruta `POST /` en `projects.routes.js` con `authMiddleware`
5. Actualizar seed demo opcionalmente con `priority`/`dueDate` (no bloqueante)

### Fase 3 — Frontend

1. `projectsService.createProject(token, payload)`
2. Componente `CreateProjectModal.vue` calcado a Stitch:
   - Overlay + card
   - Campos: nombre, descripción, fecha, prioridad, equipo
   - Acciones Cancelar / Crear Proyecto
   - Dirty check + Escape + focus
3. Integrar en `ProjectsDashboardView.vue`:
   - Estado `showCreateModal`
   - Wire botón desktop + FAB
   - On success → `loadProjects()` y cerrar
4. Equipo MVP: avatar del usuario actual seleccionado; botón `+` no-op o tooltip “Próximamente”

### Fase 4 — Validaciones

1. Frontend: required title/description; priority enum; dueDate opcional
2. Backend: mismas reglas + sanitizar `teamMemberIds`
3. Mensajes de error en español bajo campos / banner del modal

### Fase 5 — Testing manual

1. Abrir modal desde Nuevo Proyecto y FAB
2. Crear con datos válidos → aparece en lista
3. Validación vacía
4. Cancelar / X / overlay
5. Persistencia: refresh mantiene el proyecto
6. Usuario no autenticado no llega al dashboard
7. Verificar create contra reglas Firestore

### Fase 6 — Arranque

1. Reiniciar `npm run dev`
2. (Opcional) redesplegar a Hostinger si se pide

---

## ⚙️ Detalle técnico

### Backend

```
backend/src/
├── routes/projects.routes.js          # + POST /
├── controllers/projects.controller.js # + createProject
└── services/projects.service.js       # validate + format extendido
```

**`POST /api/projects`**

Body → documento:

```js
{
  title,
  description,
  dueDate: dueDate || null,
  priority, // low|medium|high
  teamMemberIds: unique([ownerId, ...clientIds]),
  memberCount: teamMemberIds.length,
  status: 'planning',
  progress: 0,
  ownerId,
  createdAt: now,
  updatedAt: now,
  lastActivityAt: now,
}
```

### Frontend

```
frontend/src/
├── components/CreateProjectModal.vue
├── services/projectsService.js        # + createProject
└── views/ProjectsDashboardView.vue    # wire modal
```

**Estado modal**

- `open`, `submitting`, `error`
- form: `title`, `description`, `dueDate`, `priority`, `teamMemberIds`

**UI Stitch (clases clave)**

- Modal title primary bold
- Inputs `bg-surface-container-low rounded-full` / textarea `rounded-xl`
- Grid 2 cols fecha | prioridad
- Footer: outline Cancelar + solid Crear Proyecto

### Firestore rules (delta)

En `isValidProject`:

- `priority in ['low','medium','high']`
- `dueDate` null o string fecha / timestamp
- `teamMemberIds` list de strings, size 1–20
- `memberCount == teamMemberIds.size()` (si rules lo permiten; si no, validar solo rangos y confiar en backend)
- Campos permitidos actualizados en `hasOnlyAllowedFields`

### Skills a usar

- `BackendNode.md`
- `FrontentVue.md`
- `FirebaseMcp.md`

---

## 🧪 Testing

| # | Caso | Esperado |
|---|------|----------|
| 1 | Abrir modal (desktop + FAB) | Visible, estilo Stitch |
| 2 | Crear “Rediseño Web” + descripción | 201, card en lista |
| 3 | Título vacío | Error UI, sin POST |
| 4 | Prioridad Alta | Guardado `priority=high` |
| 5 | Sin fecha | `dueDate=null` OK |
| 6 | Cancelar dirty | Confirmación |
| 7 | Listar proyectos legacy | Sin crash |
| 8 | Token inválido | 401 |

---

## 🚨 Reglas de implementación

- No código hasta aprobación SPEC + PLAN
- No inventar Kanban del fondo Stitch en este ticket
- No hardcodear secretos
- Mantener seed/listado existentes
- Tras CODE: reiniciar el sitio

---

## ❓ Bloqueantes

1. Aprobación de SPEC actualizado + este PLAN
2. Confirmación MVP equipo: solo owner + `+` deshabilitado (recomendado)

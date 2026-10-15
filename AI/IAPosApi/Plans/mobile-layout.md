# PLAN: Layout móvil de NariBoard

> Ejecutar solo tras aprobación de SPEC + PLAN.
> Skill: `Skills/FrontentVue.md`.
> SPEC: `Specs/mobile-layout.md`.

---

## 🎯 Objetivo

Adaptar el shell, el dashboard, el Kanban, el login y los modales a viewports `< 768px`, dejando el layout `md+` como está.

---

## 🪜 Pasos

1. Backend — ninguno.
2. Frontend — shell, vistas y tarjetas.
3. Integraciones — ninguna.
4. Validaciones — áreas táctiles y que Mover a reutilice el `PATCH` de status ya existente.
5. Testing — viewport móvil en el navegador y comprobación de que `md` no cambia.

---

## ⚙️ Detalle técnico

### Backend

- Sin endpoints ni lógica nueva. Mover tarea sigue en `PATCH /api/projects/:id/tasks/:taskId`.

### Frontend

1. `DashboardLayout.vue`
   - Estado `navOpen`.
   - Botón menú visible solo bajo `md`.
   - Sidebar: en móvil `fixed` fuera de pantalla (`-translate-x-full`) y `translate-x-0` al abrir, con overlay `bg-on-surface/40`. En `md+` permanece fijo como ahora.
   - Header `left-0 md:left-64`. Main `ml-0 md:ml-64`, padding `p-4 md:p-8`.
   - Contexto del proyecto visible también en móvil (debajo del buscador o en una segunda línea si no cabe al lado).
   - Cerrar cajón en navegación, logout, overlay y Escape.

2. `ProjectsDashboardView.vue`
   - Cabecera en columna en móvil; botón Nuevo Proyecto `hidden md:flex`.
   - Título `text-2xl md:text-4xl`.

3. `ProjectCard.vue`
   - Padding y título de la tarjeta destacada más chicos bajo `md`.
   - Botón Eliminar con hit area ≥ 44 px; texto oculto bajo `sm` si aprieta.

4. `KanbanBoard.vue` / `KanbanColumn.vue`
   - Contenedor con `snap-x snap-mandatory` y `overscroll-x-contain`.
   - Columna `w-[min(20rem,85vw)] snap-start` y alto que quepa bajo la barra (`min-h` menos agresivo en móvil).

5. `TaskCard.vue` + `ProjectBoardView.vue`
   - En el menú `⋮`, entradas Mover a Pendiente / En progreso / Terminado (ocultar la columna actual).
   - Emitir el mismo evento de cambio de status que ya usa el drop.
   - `pb-24` en el board para que el FAB no tape tarjetas.

6. `LoginView.vue`
   - Card `p-6 sm:p-10`. Título de marca `text-3xl sm:text-4xl`.

7. `CreateProjectModal.vue`, `CreateTaskModal.vue`
   - Panel `max-h-[90dvh] overflow-y-auto`.

8. Diálogo eliminar proyecto en `ProjectsDashboardView.vue`
   - Acciones `flex-col-reverse sm:flex-row` para que quepan.

9. `Memory/Context.md`
   - Anotar que el shell es responsive bajo 768 px (cajón + Kanban con scroll y Mover a).

---

## 🧪 Testing

1. 390×844: login, dashboard (abrir cajón, buscar, FAB crear), abrir proyecto, scroll de columnas, Mover a, editar/eliminar tarea, modal de proyecto.
2. 768 px y escritorio: sidebar fija, drag and drop del Kanban, botón Nuevo Proyecto visible, sin cajón.
3. Confirmar que no aparece scroll horizontal en `body`.

---

## 🚨 Reglas

- No tocar backend ni reglas Firestore.
- No cambiar el diseño de escritorio salvo clases con prefijo `md:` / `sm:` que lo dejen igual.
- Reiniciar el sitio al terminar y verificar el flujo en el navegador.

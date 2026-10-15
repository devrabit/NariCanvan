# SPEC: Layout móvil de NariBoard

> Basado en: `AI/IAPosApi/Agent/PosAgent.md`, `Memory/Context.md`, `Specs/projects-dashboard.md`, `Specs/project-tasks-kanban.md`.
>
> Alcance: solo frontend (Vue 3 + Tailwind). Sin cambios de API, Firestore ni auth.

---

## 🎯 Objetivo

Hacer usable NariBoard en pantallas menores de 768 px (teléfono), sin cambiar el aspecto de escritorio desde `md` en adelante. Login, dashboard de proyectos, tablero Kanban y modales deben leerse, tocarse y completarse con el pulgar, sin scroll horizontal de la página.

---

## 📌 Reglas de negocio

### Corte de layout

1. **Móvil:** viewport `< 768px` (breakpoint Tailwind `md`).
2. **Escritorio y tablet ancha:** desde `md` el layout actual se mantiene (sidebar fija de 16 rem, header `left-64`, contenido `ml-64`).
3. No hay lógica de negocio nueva. Misma sesión, mismas rutas, mismos datos.

### Shell autenticado (`DashboardLayout`)

4. En móvil el sidebar deja de ocupar ancho fijo. Queda como **cajón** cerrado por defecto.
5. Un botón menú (ícono `menu`) en la barra superior abre el cajón. Un segundo toque, el botón cerrar, un toque en el fondo oscuro o la tecla Escape lo cierran.
6. Al navegar (Proyectos) o al cerrar sesión, el cajón se cierra.
7. El cajón conserva los mismos ítems: Proyectos, Perfil (sigue sin acción), Cerrar sesión y la ficha del usuario.
8. La barra superior ocupa todo el ancho. Orden: menú, buscador, acciones.
9. En el tablero, el título del proyecto y el `% completado` se ven en móvil. Hoy `contextTitle` está oculto bajo `sm`.
10. Campana y engranaje siguen visibles si caben; si no, se ocultan antes que el buscador y el contexto del proyecto.
11. El contenido principal no tiene margen izquierdo de sidebar. Padding horizontal `px-4`, vertical reducido respecto a `p-8`.
12. El body no genera scroll horizontal (`overflow-x: hidden` se mantiene).

### Dashboard de proyectos

13. Título y subtítulo se apilan. El botón grande **Nuevo Proyecto** se oculta en móvil; el FAB rosa inferior derecho (ya existe, `md:hidden`) es la única acción de crear.
14. El grid sigue en una columna (ya es `grid-cols-1`).
15. La tarjeta destacada reduce padding y tamaño de título para no forzar scroll horizontal.
16. La acción Eliminar de la tarjeta sigue accesible (área táctil mínima ~44 px). El texto “Eliminar” puede quedar solo ícono si el ancho no alcanza.

### Tablero Kanban

17. Las tres columnas siguen en orden Pendiente → En progreso → Terminado.
18. En móvil se desplazan en horizontal con scroll propio del board (`overflow-x-auto`), ancho de columna cercano a `min(20rem, 85vw)`, snap al inicio de cada columna.
19. El scroll de la página no se mueve de lado al deslizar el board.
20. Arrastrar con HTML5 no es fiable en táctil. En móvil, el menú `⋮` de la tarjeta incluye **Mover a** las otras dos columnas, además de Editar y Eliminar. En escritorio el drag and drop actual se conserva.
21. El FAB de nueva tarea no tapa la última tarjeta: el board reserva espacio inferior (`pb`) y el botón respeta el safe area.

### Login y modales

22. Login sigue centrado (`max-w-md`). En móvil el card baja el padding (`p-6` en lugar de `p-10`) y el título de marca no desborda.
23. Modales de crear/editar proyecto y tarea: ancho completo con margen, altura máxima `90dvh` y scroll interno si el teclado o el contenido no caben. Botones de enviar quedan dentro del área visible o al final del scroll del modal.
24. El diálogo de eliminar proyecto ya usa `px-4` y `max-w-md`; los botones pueden apilarse si no caben en una fila.

### Accesibilidad táctil

25. Controles principales (menú, FAB, `⋮`, enviar, cerrar) tienen al menos 44×44 px.
26. El cajón usa `aria-expanded` en el botón menú y se puede cerrar con Escape.

---

## 🎨 UI / diseño

- Mismos tokens (primary pink, superficies Candy, DM Sans, Material Symbols).
- El cajón reutiliza el markup del sidebar actual; solo cambia posición y visibilidad.
- Sin bottom navigation nueva: la navegación sigue siendo la del sidebar.

---

## ✅ Criterios de aceptación

- [x] En 390×844 el sidebar no roba ancho; el dashboard se lee en una columna y el FAB crea un proyecto.
- [x] El menú abre y cierra el cajón; Proyectos navega a `/` y cierra el cajón.
- [x] En el tablero se ven las tres columnas con scroll horizontal y el título del proyecto en la barra.
- [x] En móvil, Mover a cambia el `status` de la tarea igual que el drop de escritorio.
- [x] Login y modales no desbordan el viewport ni quedan cortados por el teclado de forma irrecuperable (scroll interno).
- [x] Desde 768 px el layout de escritorio se ve igual que antes.

---

## 🚫 Fuera de alcance

- App nativa, PWA, gestos de swipe para abrir el cajón.
- Rediseño visual de escritorio.
- Cambios de API, Firestore o despliegue.
- Hacer funcional Perfil, notificaciones o ajustes.

# SPEC: Dashboard de Proyectos

## Objetivo

Tras el login, el usuario ve un dashboard con los proyectos en los que está trabajando.

## Reglas de negocio

1. Post-login → redirect a `/` (dashboard de proyectos)
2. Cada usuario ve sus proyectos; admins ven todos
3. Búsqueda por título en tiempo real
4. Tarjetas muestran: título, descripción, estado, progreso, miembros, última actividad
5. Primer proyecto destacado en formato amplio (bento grid)

# SPEC: Reemplazar Supabase por Firebase

---

## 🎯 Objetivo

Sustituir por completo la integración de Supabase (Auth + PostgreSQL) por Firebase Authentication y Cloud Firestore, manteniendo el mismo comportamiento del POS/tablero: login con email y contraseña, perfil con rol, dashboard de proyectos y rutas protegidas.

La UI no cambia. Cambia el backend de identidad y datos.

---

## 📌 Reglas de negocio

### Alcance de reemplazo

1. Toda autenticación, sesión y persistencia de datos deja de usar Supabase.
2. Se eliminan dependencias, clientes, variables de entorno y skills de agente ligadas a Supabase.
3. El contrato de la app se mantiene:
   - Login email/password
   - Sesión persistente en el navegador
   - `GET /api/auth/me` y `GET /api/projects`
   - Guards de ruta y logout
   - Semilla de proyectos demo si el usuario no tiene ninguno

### Autenticación

4. El login se realiza con **email y contraseña** mediante Firebase Auth (`signInWithEmailAndPassword`).
5. Solo usuarios registrados y activos pueden acceder.
6. La sesión persiste con el SDK de Firebase (ID token + refresh token) hasta logout o expiración.
7. Credenciales inválidas muestran: *"Email o contraseña incorrectos"*.
8. Tras login exitoso, redirigir al dashboard (`/`).
9. El frontend envía el ID token de Firebase en `Authorization: Bearer <idToken>`.
10. El backend valida el token con Firebase Admin SDK (`verifyIdToken`). No se usa el SDK cliente de Firebase en el servidor.

### Autorización y perfil

11. Cada usuario tiene un documento de perfil con rol `admin` o `cashier`.
12. El perfil vive en Firestore `users/{uid}` (equivalente a `profiles` de Supabase).
13. Rutas protegidas requieren sesión activa; sin sesión → `/login`.
14. Usuarios autenticados en `/login` → redirigir a `/`.
15. Si el usuario no tiene perfil, el backend lo crea en el primer request autenticado con `role: cashier` e `isActive: true`.
16. Usuarios con `isActive = false` no pueden iniciar sesión / reciben *"Tu cuenta está desactivada"*.

### Proyectos

17. Los proyectos viven en Firestore `projects/{projectId}`.
18. Cada usuario ve sus proyectos (`ownerId == uid`); admins ven todos.
19. Si el usuario no tiene proyectos, se siembran los mismos 5 proyectos demo actuales.
20. La búsqueda por título se hace en el backend sobre los documentos del usuario.

### Seguridad

21. Credenciales Firebase se configuran por variables de entorno, nunca hardcodeadas.
22. Firestore Rules: un usuario solo lee/escribe su perfil y sus proyectos; `admin` puede leer todos.
23. El Admin SDK del backend usa service account / Application Default Credentials; el frontend usa la config web pública (`apiKey`, `authDomain`, `projectId`).

### Agente y memoria

24. El stack documentado pasa de Supabase a Firebase.
25. La skill `SupabaseMcp.md` se reemplaza por una skill de Firebase MCP.
26. Specs/planes de login existentes se marcan como sustituidos por este SPEC en lo relativo a Auth/DB.

---

## 🚫 Fuera de alcance (MVP)

- Migración de datos reales desde Supabase (no hay datos de producción a preservar)
- Registro público, recuperación de contraseña, OAuth, 2FA
- Cloud Functions (el perfil se crea en el backend Express)
- Hosting / App Hosting de Firebase
- Emuladores locales (fase posterior)

---

## 📥 Inputs

Sin cambio de UI:

| Campo    | Tipo   | Requerido | Validación           |
|----------|--------|-----------|----------------------|
| email    | string | Sí        | Formato email válido |
| password | string | Sí        | Mínimo 6 caracteres  |

### Decisión de proyecto (requerida antes de CODE)

Usar un proyecto Firebase existente o crear uno nuevo.

Proyectos relevantes ya existentes en la cuenta:

| projectId   | displayName |
|-------------|-------------|
| `naricanvan`| NariCanvan  |
| `naripos`   | NariPos     |

**Recomendación:** `naricanvan`.

---

## 📤 Outputs

| Caso             | Resultado                                      |
|------------------|------------------------------------------------|
| Login exitoso    | Sesión Firebase + redirect a `/`               |
| Login fallido    | Mensaje de error en formulario                 |
| Sin sesión       | Redirect a `/login`                            |
| Logout           | Sesión destruida + redirect a `/login`         |
| Usuario inactivo | *"Tu cuenta está desactivada"*                 |
| `GET /api/auth/me` | Perfil desde Firestore                       |
| `GET /api/projects` | Lista de proyectos desde Firestore          |

---

## 🗄️ Modelo de datos (Firestore)

### Colección `users/{uid}`

| Campo     | Tipo     | Notas                         |
|-----------|----------|-------------------------------|
| email     | string   | Email de Auth                 |
| fullName  | string   | Nombre visible                |
| role      | string   | `admin` \| `cashier`          |
| isActive  | boolean  | Default `true`                |
| createdAt | timestamp| Auto                          |
| updatedAt | timestamp| Auto                          |

El `uid` del documento es el UID de Firebase Auth.

### Colección `projects/{projectId}`

| Campo          | Tipo      | Notas                                      |
|----------------|-----------|--------------------------------------------|
| title          | string    |                                            |
| description    | string    |                                            |
| status         | string    | `in_progress` \| `review` \| `planning` \| `archived` |
| progress       | number    | 0–100                                      |
| memberCount    | number    |                                            |
| lastActivityAt | timestamp |                                            |
| ownerId        | string    | UID del dueño                              |
| createdAt      | timestamp |                                            |
| updatedAt      | timestamp |                                            |

---

## 🖥️ UI esperada

Sin cambios visuales. `LoginView` y `ProjectsDashboardView` siguen igual; solo cambia el origen de sesión y datos.

---

## 🔄 Mapeo de reemplazo

| Hoy (Supabase)                         | Destino (Firebase)                          |
|----------------------------------------|---------------------------------------------|
| `@supabase/supabase-js`                | `firebase` (web) + `firebase-admin` (API)   |
| `supabase.auth.signInWithPassword`     | `signInWithEmailAndPassword`                |
| `supabase.auth.getSession` / `onAuthStateChange` | `onAuthStateChanged` + `getIdToken` |
| `supabase.auth.getUser(token)`         | `admin.auth().verifyIdToken(token)`         |
| Tabla `profiles`                       | Colección `users`                           |
| Tabla `projects`                       | Colección `projects`                        |
| RLS PostgreSQL                         | Firestore Security Rules                    |
| `SUPABASE_URL` / `ANON_KEY`            | Config web Firebase + Admin credentials     |
| Skill `SupabaseMcp.md`                 | Skill `FirebaseMcp.md`                      |

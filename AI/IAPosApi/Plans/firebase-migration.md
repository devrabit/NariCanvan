# PLAN: Reemplazar Supabase por Firebase

> Basado en: `AI/IAPosApi/Specs/firebase-migration.md`

---

## 🎯 Objetivo

Quitar Supabase de frontend, backend y documentación del agente, e integrar Firebase Auth + Firestore sin cambiar la UI ni los endpoints públicos actuales.

No se escribe código hasta aprobación de este PLAN y del SPEC, y hasta confirmar el `projectId` de Firebase.

---

## 🪜 Pasos

### Fase 0 — Proyecto Firebase (tras aprobación)

1. Confirmar `projectId` (recomendado: `naricanvan`) o crear uno nuevo
2. `firebase use <projectId>` en `NariCanvan/`
3. Inicializar Auth (email/password) y Firestore vía Firebase MCP / CLI
4. Crear app Web si no existe y obtener SDK config
5. Desplegar Auth config y reglas de Firestore

### Fase 1 — Configuración del workspace

1. Añadir `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`
2. Reemplazar `.env.example` de frontend y backend
3. No commitear `.env` ni service accounts

### Fase 2 — Backend

1. Quitar `@supabase/supabase-js`
2. Añadir `firebase-admin`
3. Reemplazar `config/supabase.js` → `config/firebase.js` (Admin SDK)
4. Reescribir `middleware/auth.js` con `verifyIdToken` + lectura/creación de `users/{uid}`
5. Reescribir `projects.controller.js` para Firestore (listar, filtrar, seed demo)
6. Mantener rutas: `GET /api/health`, `GET /api/auth/me`, `GET /api/projects`

### Fase 3 — Frontend

1. Quitar `@supabase/supabase-js`
2. Añadir `firebase`
3. Reemplazar `services/supabase.js` → `services/firebase.js`
4. Actualizar Pinia `stores/auth.js` (login, logout, `onAuthStateChanged`, ID token)
5. `authService.js` y `projectsService.js` siguen pegándole al Express; solo cambia el token
6. No modificar vistas ni layout

### Fase 4 — Agente / memoria

1. Actualizar `Memory/Context.md` (stack = Firebase)
2. Actualizar `Agent/PosAgent.md` (Firebase en lugar de Supabase)
3. Crear `Skills/FirebaseMcp.md` y eliminar o deprecar `Skills/SupabaseMcp.md`
4. Anotar en specs de login que Auth/DB ahora es Firebase

### Fase 5 — Arranque

1. Instalar dependencias
2. Reiniciar frontend + backend
3. Verificar flujo de login y dashboard

### Fase 6 — Testing manual

Ver sección Testing.

---

## ⚙️ Detalle técnico

### Backend

```
backend/
├── .env.example
└── src/
    ├── index.js
    ├── config/
    │   └── firebase.js          # admin.initializeApp
    ├── middleware/
    │   └── auth.js              # verifyIdToken + users/{uid}
    ├── routes/
    │   ├── auth.routes.js
    │   └── projects.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   └── projects.controller.js
    └── services/
        ├── auth.service.js
        └── projects.service.js
```

**Endpoints (sin cambio de contrato):**

| Método | Ruta            | Auth | Descripción                         |
|--------|-----------------|------|-------------------------------------|
| GET    | /api/health     | No   | Health check                        |
| GET    | /api/auth/me    | Sí   | Perfil Firestore                    |
| GET    | /api/projects   | Sí   | Proyectos Firestore + seed si vacío |

**Middleware `auth.js`:**
- Extrae `Authorization: Bearer <idToken>`
- `admin.auth().verifyIdToken(token)`
- Carga o crea `users/{uid}`
- 401 si token inválido; 403 si `isActive === false`
- Adjunta `req.user` (decoded token) y `req.profile`

**Firestore Admin (proyectos):**
- Query `projects` where `ownerId == uid` (admin: todos)
- Filtro `search` por título en memoria (MVP; evita índice compuesto extra)
- Seed de los 5 demos actuales si no hay documentos del usuario

### Frontend

```
frontend/src/services/firebase.js   # initializeApp + getAuth + getFirestore
frontend/src/stores/auth.js         # signInWithEmailAndPassword, signOut, onAuthStateChanged
frontend/src/services/authService.js
frontend/src/services/projectsService.js
```

**Store `auth.js`:**
- `session` → `{ access_token }` donde `access_token` es el ID token de Firebase
- `user` → `firebase.User`
- `profile` → respuesta de `/api/auth/me`
- `login` → `signInWithEmailAndPassword`
- `logout` → `signOut`
- `initAuth` → `onAuthStateChanged` + `getIdToken()`

### Firebase / reglas

```
firestore.rules
firestore.indexes.json
firebase.json          # firestore + auth
.firebaserc            # default: projectId aprobado
```

Reglas MVP:
- `users/{uid}`: el dueño lee/escribe su documento; admin lee todos
- `projects/{id}`: dueño lee/escribe si `ownerId == request.auth.uid`; admin lee todos
- El backend con Admin SDK bypasea rules (necesario para seed y listado admin)

Auth:
- Provider `emailPassword: true`
- Authorized domain: `localhost`

### Variables de entorno

```env
# Backend
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=   # path local al service account, no commitear
PORT=3000

# Frontend
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:3000
```

Alternativa backend: variables `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` si no se usa archivo JSON.

### Dependencias

**Quitar:** `@supabase/supabase-js` (frontend y backend)

**Añadir:**
- Backend: `firebase-admin`
- Frontend: `firebase`

---

## 🧪 Testing

| # | Caso                                | Resultado esperado              |
|---|-------------------------------------|---------------------------------|
| 1 | Login email/password válidos        | Redirect a `/`, sesión activa   |
| 2 | Contraseña incorrecta               | "Email o contraseña incorrectos"|
| 3 | `/` sin sesión                      | Redirect a `/login`             |
| 4 | `/login` con sesión                 | Redirect a `/`                  |
| 5 | Logout                              | Redirect a `/login`             |
| 6 | Usuario `isActive: false`           | "Tu cuenta está desactivada"    |
| 7 | `GET /api/auth/me` con token válido | Perfil                          |
| 8 | `GET /api/auth/me` sin token        | 401                             |
| 9 | Primer login sin proyectos          | 5 demos en dashboard            |
| 10| Refresh con sesión                  | No pide login de nuevo          |
| 11| No quedan imports de Supabase       | Grep limpio                     |

---

## 🚨 Reglas de implementación

- Seguir skills: `BackendNode.md`, `FrontentVue.md`, Firebase Auth, Firestore
- No generar código hasta aprobación de SPEC + PLAN + `projectId`
- No hardcodear credenciales ni commitear service accounts
- No cambiar UI
- Tras CODE: reiniciar el sitio (`npm run dev`)

---

## ❓ Bloqueantes para ejecutar

1. Aprobación de SPEC y PLAN
2. Elegir proyecto Firebase:
   - Usar existente `naricanvan` (recomendado)
   - Usar otro (`naripos`, etc.)
   - Crear uno nuevo
3. Si Firestore no existe en el proyecto: ubicación (recomendado `southamerica-east1`)

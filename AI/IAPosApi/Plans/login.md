# PLAN: Módulo de Login

> Basado en: `AI/IAPosApi/Specs/login.md`

---

## 🎯 Objetivo

Scaffoldear el proyecto (frontend + backend) e implementar autenticación completa con Supabase Auth: migración de BD, API con middleware JWT, pantalla de login, store Pinia, guards de ruta y logout.

---

## 🪜 Pasos

### Fase 0 — Scaffolding del proyecto

1. Crear estructura base `frontend/` (Vue 3 + Vite + Pinia + Vue Router + Tailwind)
2. Crear estructura base `backend/` (Node.js + Express + cors + dotenv)
3. Crear `.env.example` con variables requeridas
4. Obtener credenciales Supabase vía MCP (`get_project_url`, `get_publishable_keys`)

### Fase 1 — Base de datos (Supabase MCP)

1. `list_tables` — verificar esquema actual
2. `apply_migration` — crear tabla `profiles` + trigger + RLS policies
3. `get_advisors` — verificar seguridad post-migración
4. `generate_typescript_types` — tipos para frontend/backend

### Fase 2 — Backend

1. Configurar cliente Supabase (`@supabase/supabase-js`)
2. Middleware `authMiddleware` — validar JWT del header `Authorization`
3. Rutas:
   - `POST /api/auth/login` — proxy opcional o validación server-side
   - `GET /api/auth/me` — retorna perfil del usuario autenticado
   - `POST /api/auth/logout` — invalidar sesión server-side (opcional MVP)
4. Health check: `GET /api/health`

### Fase 3 — Frontend

1. Configurar cliente Supabase en `services/supabase.js`
2. Store Pinia `stores/auth.js` — session, user, profile, login, logout
3. Componente `views/LoginView.vue` — formulario de login
4. Componente `views/HomeView.vue` — placeholder del Tablero Canvan
5. Router guards — proteger rutas autenticadas
6. Servicio API `services/authService.js`

### Fase 4 — Integración y arranque

1. Configurar proxy Vite → backend en desarrollo
2. Scripts `package.json` raíz para levantar frontend + backend
3. Reiniciar y verificar flujo completo

### Fase 5 — Testing manual

1. Login con credenciales válidas → redirect a `/`
2. Login con credenciales inválidas → mensaje de error
3. Acceso a `/` sin sesión → redirect a `/login`
4. Logout → redirect a `/login`
5. Usuario inactivo → mensaje de cuenta desactivada

---

## ⚙️ Detalle técnico

### Backend

```
backend/
├── package.json
├── .env.example
├── src/
│   ├── index.js              # Express app entry
│   ├── config/
│   │   └── supabase.js       # Supabase admin client
│   ├── middleware/
│   │   └── auth.js           # JWT validation
│   ├── routes/
│   │   └── auth.routes.js
│   ├── controllers/
│   │   └── auth.controller.js
│   └── services/
│       └── auth.service.js
```

**Endpoints:**

| Método | Ruta            | Auth | Descripción                    |
|--------|-----------------|------|--------------------------------|
| GET    | /api/health     | No   | Health check                   |
| GET    | /api/auth/me    | Sí   | Perfil del usuario autenticado |

> Nota: El login se maneja directamente en el frontend con Supabase client (`signInWithPassword`). El backend valida sesiones en rutas protegidas.

**Middleware `auth.js`:**
- Extrae token del header `Authorization: Bearer <token>`
- Valida con `supabase.auth.getUser(token)`
- Adjunta `req.user` y `req.profile` al request
- 401 si token inválido o ausente

### Frontend

```
frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js          # Guards de autenticación
│   ├── stores/
│   │   └── auth.js           # Pinia store
│   ├── services/
│   │   ├── supabase.js       # Cliente Supabase
│   │   └── authService.js    # Llamadas API backend
│   ├── views/
│   │   ├── LoginView.vue
│   │   └── HomeView.vue      # Placeholder Tablero Canvan
│   └── components/
│       └── AppLayout.vue     # Layout con botón logout
```

**Store `auth.js` (estado):**
- `session` — sesión Supabase
- `user` — usuario auth
- `profile` — datos de `profiles`
- `loading` — estado de carga
- `error` — mensaje de error

**Acciones:**
- `login(email, password)` → `supabase.auth.signInWithPassword`
- `logout()` → `supabase.auth.signOut`
- `fetchProfile()` → `GET /api/auth/me`
- `initAuth()` → restaurar sesión al cargar app

**Router guards:**
- `meta.requiresAuth = true` → redirigir a `/login` si no hay sesión
- `/login` con sesión activa → redirigir a `/`

### Base de datos — Migración SQL

```sql
-- Tabla profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Variables de entorno

```env
# Backend (.env)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000

# Frontend (.env)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3000
```

---

## 🧪 Testing

| # | Caso                                      | Resultado esperado                |
|---|-------------------------------------------|-----------------------------------|
| 1 | Login email/password válidos              | Redirect a `/`, sesión activa     |
| 2 | Email inválido                            | Error inline en formulario        |
| 3 | Contraseña incorrecta                     | "Email o contraseña incorrectos"  |
| 4 | Acceder `/` sin sesión                    | Redirect a `/login`               |
| 5 | Acceder `/login` con sesión               | Redirect a `/`                    |
| 6 | Logout                                    | Redirect a `/login`, sin sesión   |
| 7 | Usuario con `is_active = false`           | "Tu cuenta está desactivada"      |
| 8 | `GET /api/auth/me` con token válido       | Retorna perfil del usuario        |
| 9 | `GET /api/auth/me` sin token              | 401 Unauthorized                  |
| 10| Refresh de página con sesión activa       | Mantiene sesión, no pide login    |

---

## 🚨 Reglas de implementación

- Seguir skills: `BackendNode.md`, `FrontentVue.md`, `SupabaseMcp.md`
- No hardcodear credenciales
- Código modular y listo para MVP
- UI con Tailwind, responsive y clara
- Manejo de errores en frontend y backend

---

## 📦 Dependencias

**Backend:**
- express, cors, dotenv, @supabase/supabase-js

**Frontend:**
- vue, vue-router, pinia, @supabase/supabase-js, tailwindcss, vite

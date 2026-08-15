# SPEC: Módulo de Login

> **Actualizado:** Auth y datos viven en Firebase. Ver `Specs/firebase-migration.md`.
> Este documento conserva las reglas de negocio del login; sustituir “Supabase” por Firebase Auth + colección `users`.

---

## 🎯 Objetivo

Implementar autenticación de usuarios para el sistema POS usando Supabase Auth, permitiendo que operadores (cajeros, administradores) inicien sesión de forma segura y accedan solo a las áreas autorizadas de la aplicación.

---

## 📌 Reglas de negocio

### Autenticación

1. El login se realiza con **email y contraseña** mediante Supabase Auth.
2. Solo usuarios registrados y activos pueden acceder al sistema.
3. La sesión persiste en el navegador (refresh token de Supabase) hasta que el usuario cierre sesión o expire.
4. Credenciales inválidas muestran un mensaje genérico: *"Email o contraseña incorrectos"* (sin revelar cuál falló).
5. Tras login exitoso, redirigir al **Tablero Canvan** (`/`).

### Autorización

6. Cada usuario tiene un **rol** almacenado en su perfil: `admin` o `cashier`.
7. El rol se obtiene de la tabla `profiles` vinculada a `auth.users`.
8. Rutas protegidas requieren sesión activa; sin sesión → redirigir a `/login`.
9. Usuarios autenticados que visiten `/login` → redirigir a `/`.

### Perfil de usuario

10. Al registrarse (vía Supabase), se crea automáticamente un registro en `profiles` con: `id`, `email`, `full_name`, `role` (default: `cashier`), `is_active` (default: `true`).
11. Usuarios con `is_active = false` no pueden iniciar sesión.

### Cierre de sesión

12. El usuario puede cerrar sesión desde cualquier vista autenticada.
13. Al cerrar sesión, limpiar estado local y redirigir a `/login`.

### Seguridad

14. Las claves de Supabase (URL + anon key) se configuran vía variables de entorno, nunca hardcodeadas.
15. El backend valida el JWT de Supabase en rutas protegidas mediante middleware.
16. RLS habilitado en `profiles`: cada usuario solo puede leer su propio perfil; admins pueden leer todos.

---

## 🚫 Fuera de alcance (MVP)

- Registro público de usuarios (solo admin crea usuarios vía Supabase dashboard por ahora)
- Recuperación de contraseña (fase 2)
- Login con OAuth (Google, etc.)
- Autenticación de dos factores (2FA)

---

## 📥 Inputs

| Campo      | Tipo     | Requerido | Validación                    |
|------------|----------|-----------|-------------------------------|
| email      | string   | Sí        | Formato email válido          |
| password   | string   | Sí        | Mínimo 6 caracteres           |

---

## 📤 Outputs

| Caso            | Resultado                                      |
|-----------------|------------------------------------------------|
| Login exitoso   | Sesión activa + redirect a `/`                 |
| Login fallido   | Mensaje de error en formulario                 |
| Sin sesión      | Redirect a `/login`                            |
| Logout          | Sesión destruida + redirect a `/login`         |
| Usuario inactivo| Mensaje: *"Tu cuenta está desactivada"*        |

---

## 🗄️ Modelo de datos

### Tabla `profiles`

| Columna     | Tipo        | Notas                              |
|-------------|-------------|------------------------------------|
| id          | uuid (PK)   | FK → `auth.users.id`               |
| email       | text        | Copia del email de auth            |
| full_name   | text        | Nombre visible del operador        |
| role        | text        | `admin` \| `cashier`               |
| is_active   | boolean     | Default `true`                     |
| created_at  | timestamptz | Auto                               |
| updated_at  | timestamptz | Auto                               |

### Trigger

- `on_auth_user_created` → inserta fila en `profiles` al crear usuario en `auth.users`.

---

## 🖥️ UI esperada

Pantalla `/login`:

- Logo o nombre del POS centrado
- Campo email
- Campo contraseña (oculto)
- Botón "Iniciar sesión"
- Mensaje de error inline
- Estado de carga en el botón durante la petición
- Diseño responsive con Tailwind, estilo limpio y profesional

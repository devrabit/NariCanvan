# SPEC: Renombrar variables de entorno (FIREBASE → FB)

---

## 🎯 Objetivo

Renombrar las variables de entorno reemplazando `FIREBASE` por `FB` para evitar que Hostinger las borre o rechace, manteniendo Auth/Firestore.

---

## 📌 Reglas de negocio

1. Ninguna variable de entorno usará el substring `FIREBASE` en su nombre.
2. El prefijo corto será `FB` (backend) y `VITE_FB_` (frontend).
3. El frontend mantiene el prefijo Vite obligatorio `VITE_`.
4. No documentar `PORT` en `.env.example` del backend (Hostinger lo inyecta).
5. Actualizar `.env.example`, `.env` locales y `.env.production` con los nuevos nombres (mismos valores).
6. Documentar el mapeo en Memory/Context.md.

---

## 🔁 Mapeo

| Antes | Después | Ámbito |
|-------|---------|--------|
| `FIREBASE_PROJECT_ID` | `FB_PROJECT_ID` | Backend |
| `VITE_FIREBASE_API_KEY` | `VITE_FB_API_KEY` | Frontend |
| `VITE_FIREBASE_AUTH_DOMAIN` | `VITE_FB_AUTH_DOMAIN` | Frontend |
| `VITE_FIREBASE_PROJECT_ID` | `VITE_FB_PROJECT_ID` | Frontend |
| `VITE_FIREBASE_APP_ID` | `VITE_FB_APP_ID` | Frontend |
| `VITE_API_URL` | `VITE_API_URL` (sin cambio) | Frontend |

---

## ✅ Criterios de aceptación

- [x] Backend usa `process.env.FB_PROJECT_ID` (default `naricanvan` si falta).
- [x] Frontend usa solo `VITE_FB_*`.
- [x] Env examples y locales actualizados.
- [x] App local arranca tras reinicio.

---

## 🚫 Fuera de alcance

- Lógica de Auth/Firestore.
- Redeploy automático a Hostinger.

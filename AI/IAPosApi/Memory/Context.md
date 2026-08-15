# 🧠 CONTEXTO DEL PROYECTO POS

---

## 🏗️ Stack

- Frontend: Vue 3 + Pinia + Tailwind
- Backend: Node.js + Express
- DB: Firebase (Auth + Cloud Firestore)


---

## 📦 Funcionalidades actuales

- Login email/password (Firebase Auth)
- Dashboard de proyectos (Firestore)
- Crear proyecto (modal Stitch + POST /api/projects)

---

## 📌 Reglas importantes

- Tablero Canvan
- UI dinámica basada en specs
- Conectado por medio de mcp a Stitch

---

## 🧩 Arquitectura

- Modular
- Basada en specs (.md)
- Separación frontend/backend
- Escalable

---

## 🔐 Variables de entorno

| Variable | Uso |
|----------|-----|
| `FB_PROJECT_ID` | Backend — project id de Firebase |
| `VITE_FB_API_KEY` | Frontend — web API key |
| `VITE_FB_AUTH_DOMAIN` | Frontend — auth domain |
| `VITE_FB_PROJECT_ID` | Frontend — project id |
| `VITE_FB_APP_ID` | Frontend — app id |
| `VITE_API_URL` | Frontend — base URL del API (`http://localhost:3000` local; URL del sitio en prod) |

En Hostinger (runtime): solo `FB_PROJECT_ID`. No fijar `PORT`. No hace falta `VITE_*` si el build ya está en `backend/public`.
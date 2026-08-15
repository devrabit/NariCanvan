# PLAN: Renombrar variables de entorno (FIREBASE → FB)

---

## 1. Backend

1. `backend/src/config/firebase.js`: `FIREBASE_PROJECT_ID` → `FB_PROJECT_ID`.
2. Actualizar `backend/.env.example` y `backend/.env`.

## 2. Frontend

1. `frontend/src/services/firebase.js`: `VITE_FIREBASE_*` → `VITE_FB_*`.
2. Actualizar `frontend/.env.example`, `frontend/.env`, `frontend/.env.production`.

## 3. Memoria

1. Mapeo en `AI/IAPosApi/Memory/Context.md`.

## 4. Verificación

1. Reiniciar `npm run dev`.
2. Grep: no debe quedar `VITE_FIREBASE` ni `FIREBASE_PROJECT_ID` en código/env activos.

## 5. Hostinger (manual)

```
FB_PROJECT_ID=naricanvan
```

Sin `PORT`. Sin `VITE_*` si el build ya está en `backend/public`.

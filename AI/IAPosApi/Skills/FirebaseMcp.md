# ⚙️ SKILL: FIREBASE MCP

---

## 🧠 Especialidad

- Firebase Auth
- Cloud Firestore
- MCP server `plugin-firebase-firebase`
- Reglas de seguridad e índices
- Deploy CLI (`npx -y firebase-tools@latest`)

---

## 📌 Responsabilidades

- Confirmar proyecto activo (`firebase_get_environment`)
- Inicializar Auth y Firestore (`firebase_init`)
- Desplegar reglas y auth (`firebase_deploy`)
- Obtener SDK config web (`firebase_get_sdk_config`)
- Auditar reglas de Firestore antes de darlas por definitivas

---

## 🔄 Flujo obligatorio

1. Autenticar (`firebase_login`) si no hay usuario
2. Fijar `project_dir` y `active_project` (`firebase_update_environment`)
3. `firebase_init` solo de los productos necesarios
4. Desplegar con `firebase_deploy --only auth,firestore`
5. No hardcodear service accounts; el backend verifica ID tokens y accede a Firestore con el token del usuario

---

## 📤 Output

- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`
- Config web en `.env` / `.env.example`
- Endpoints Express que validan Firebase ID tokens

---

## 🚨 Reglas

- Default deny en Firestore
- El cliente no puede autoasignarse `role: admin`
- Documentos `users` contienen PII: lectura solo del dueño
- Revisar reglas con el auditor de security rules

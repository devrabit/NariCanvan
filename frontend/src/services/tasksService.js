import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || ''

async function getAccessToken(accessToken) {
  if (accessToken) return accessToken
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No hay sesión activa')
  }
  return currentUser.getIdToken()
}

async function request(accessToken, path, options = {}) {
  const token = await getAccessToken(accessToken)
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(data.error || 'Error en tareas')
    err.fields = data.fields || null
    err.status = response.status
    throw err
  }
  return data
}

export function fetchTasks(accessToken, projectId, search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return request(accessToken, `/api/projects/${encodeURIComponent(projectId)}/tasks${params}`)
}

export function createTask(accessToken, projectId, payload) {
  return request(accessToken, `/api/projects/${encodeURIComponent(projectId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function patchTask(accessToken, projectId, taskId, payload) {
  return request(
    accessToken,
    `/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteTask(accessToken, projectId, taskId) {
  const token = await getAccessToken(accessToken)
  const response = await fetch(
    `${API_URL}/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (response.status === 204) return { ok: true }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(data.error || 'Error al eliminar la tarea')
    err.status = response.status
    throw err
  }
  return data
}

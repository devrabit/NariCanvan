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

export async function fetchProjects(accessToken, search = '') {
  const token = await getAccessToken(accessToken)
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const response = await fetch(`${API_URL}/api/projects${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al obtener proyectos')
  }

  return response.json()
}

import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || ''

async function getAccessToken() {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No hay sesión activa')
  }
  return currentUser.getIdToken()
}

export async function fetchProfile(accessToken) {
  const token = accessToken || await getAccessToken()
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const detail = data.detail ? `: ${data.detail}` : ''
    throw new Error(`${data.error || 'Error al obtener perfil'}${detail}`)
  }

  const data = await response.json()
  return data.profile
}

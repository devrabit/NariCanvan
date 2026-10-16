import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function fetchUsers(accessToken) {
  const token = accessToken || await auth.currentUser?.getIdToken()
  if (!token) throw new Error('No hay sesión activa')

  const response = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener usuarios')
  }
  return data
}

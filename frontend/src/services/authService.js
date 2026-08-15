const API_URL = import.meta.env.VITE_API_URL || ''

export async function fetchProfile(accessToken) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al obtener perfil')
  }

  const data = await response.json()
  return data.profile
}

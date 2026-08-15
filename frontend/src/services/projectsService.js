const API_URL = import.meta.env.VITE_API_URL || ''

export async function fetchProjects(accessToken, search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const response = await fetch(`${API_URL}/api/projects${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al obtener proyectos')
  }

  return response.json()
}

import { queryCollection } from '../services/firestore.service.js'

export async function listUsers(req, res) {
  try {
    const documents = await queryCollection(req.accessToken, 'users', {
      where: {
        fieldFilter: {
          field: { fieldPath: 'isActive' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
    })
    const users = documents
      .filter((user) => user.isActive !== false)
      .map((user) => ({
        id: user.id,
        fullName: user.fullName || '',
        email: user.email || '',
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'))

    res.json({ users })
  } catch (error) {
    console.error(error)
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para listar usuarios' : 'Error al obtener usuarios',
      detail: error.message,
    })
  }
}

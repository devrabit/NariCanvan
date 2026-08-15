import { createDocument, queryCollection } from '../services/firestore.service.js'
import {
  buildCreateProjectDocument,
  demoProjects,
  formatProject,
  validateCreateProjectPayload,
} from '../services/projects.service.js'

export async function listProjects(req, res) {
  try {
    const ownerId = req.user.uid
    const isAdmin = req.profile.role === 'admin'

    let projects = await queryCollection(req.accessToken, 'projects', {
      orderBy: [{ field: { fieldPath: 'lastActivityAt' }, direction: 'DESCENDING' }],
      ...(isAdmin
        ? {}
        : {
            where: {
              fieldFilter: {
                field: { fieldPath: 'ownerId' },
                op: 'EQUAL',
                value: { stringValue: ownerId },
              },
            },
          }),
    })

    if (!isAdmin) {
      projects = projects.filter((project) => project.ownerId === ownerId)
    }

    if (!projects.length) {
      const seeded = []
      for (const project of demoProjects(ownerId)) {
        seeded.push(await createDocument(req.accessToken, 'projects', project))
      }
      projects = seeded.sort(
        (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt),
      )
    }

    const search = String(req.query.search || '').trim().toLowerCase()
    const filtered = search
      ? projects.filter((project) => project.title?.toLowerCase().includes(search))
      : projects

    res.json({
      projects: filtered.map(formatProject),
      total: filtered.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener proyectos' })
  }
}

export async function createProject(req, res) {
  try {
    const validation = validateCreateProjectPayload(req.body)
    if (!validation.ok) {
      return res.status(400).json({ error: 'Datos inválidos', fields: validation.fields })
    }

    const document = buildCreateProjectDocument(req.user.uid, validation.data)
    const created = await createDocument(req.accessToken, 'projects', document)

    res.status(201).json({ project: formatProject(created) })
  } catch (error) {
    console.error(error)
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para crear el proyecto' : 'Error al crear el proyecto',
      detail: error.message,
    })
  }
}

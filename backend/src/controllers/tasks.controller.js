import {
  createDocumentAtPath,
  deleteDocumentByPath,
  getDocument,
  listDocumentsAtPath,
  patchDocumentByPath,
} from '../services/firestore.service.js'
import { formatProject } from '../services/projects.service.js'
import {
  buildCreateTaskDocument,
  formatTask,
  validateCreateTaskPayload,
  validatePatchTaskPayload,
} from '../services/tasks.service.js'

function canAccessProject(req, project) {
  return project.ownerId === req.user.uid || req.profile.role === 'admin'
}

async function loadAccessibleProject(req, res) {
  const project = await getDocument(req.accessToken, 'projects', req.params.projectId)
  if (!project) {
    res.status(404).json({ error: 'Proyecto no encontrado' })
    return null
  }
  if (!canAccessProject(req, project)) {
    res.status(403).json({ error: 'No tienes acceso a este proyecto' })
    return null
  }
  return project
}

export async function getProject(req, res) {
  try {
    const project = await loadAccessibleProject(req, res)
    if (!project) return
    res.json({ project: formatProject(project) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener el proyecto' })
  }
}

export async function listTasks(req, res) {
  try {
    const project = await loadAccessibleProject(req, res)
    if (!project) return

    const collectionPath = `projects/${project.id}/tasks`
    const tasks = await listDocumentsAtPath(req.accessToken, collectionPath)

    const search = String(req.query.search || '').trim().toLowerCase()
    const filtered = search
      ? tasks.filter((task) =>
          `${task.title || ''} ${task.description || ''}`.toLowerCase().includes(search),
        )
      : tasks

    res.json({
      tasks: filtered.map(formatTask),
      total: filtered.length,
    })
  } catch (error) {
    console.error(error)
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para listar tareas' : 'Error al obtener tareas',
      detail: error.message,
    })
  }
}

export async function createTask(req, res) {
  try {
    const project = await loadAccessibleProject(req, res)
    if (!project) return

    const validation = validateCreateTaskPayload(req.body, req.body?.status || 'pending')
    if (!validation.ok) {
      return res.status(400).json({ error: 'Datos inválidos', fields: validation.fields })
    }

    const document = buildCreateTaskDocument(req.user.uid, validation.data)
    const created = await createDocumentAtPath(
      req.accessToken,
      `projects/${project.id}/tasks`,
      document,
    )

    res.status(201).json({ task: formatTask(created) })
  } catch (error) {
    console.error(error)
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para crear la tarea' : 'Error al crear la tarea',
      detail: error.message,
    })
  }
}

export async function patchTask(req, res) {
  try {
    const project = await loadAccessibleProject(req, res)
    if (!project) return

    const validation = validatePatchTaskPayload(req.body)
    if (!validation.ok) {
      return res.status(400).json({ error: 'Datos inválidos', fields: validation.fields })
    }

    const updated = await patchDocumentByPath(
      req.accessToken,
      `projects/${project.id}/tasks/${req.params.taskId}`,
      {
        ...validation.data,
        updatedAt: new Date().toISOString(),
      },
    )

    if (!updated) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json({ task: formatTask(updated) })
  } catch (error) {
    console.error(error)
    if (error.status === 404) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para actualizar la tarea' : 'Error al actualizar la tarea',
      detail: error.message,
    })
  }
}

export async function deleteTask(req, res) {
  try {
    const project = await loadAccessibleProject(req, res)
    if (!project) return

    const path = `projects/${project.id}/tasks/${req.params.taskId}`
    try {
      await deleteDocumentByPath(req.accessToken, path)
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
      }
      throw error
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    const status = error.status === 403 ? 403 : 500
    res.status(status).json({
      error: status === 403 ? 'Sin permiso para eliminar la tarea' : 'Error al eliminar la tarea',
      detail: error.message,
    })
  }
}

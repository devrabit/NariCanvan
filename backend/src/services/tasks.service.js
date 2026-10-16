const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Terminado',
}

const PRIORITIES = new Set(['low', 'medium', 'high'])
const STATUSES = new Set(['pending', 'in_progress', 'done'])

export function formatTask(task) {
  const priority = PRIORITIES.has(task.priority) ? task.priority : 'medium'
  const status = STATUSES.has(task.status) ? task.status : 'pending'
  const assigneeIds = Array.isArray(task.assigneeIds) && task.assigneeIds.length
    ? task.assigneeIds
    : task.createdBy
      ? [task.createdBy]
      : []

  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority,
    priorityLabel: PRIORITY_LABELS[priority],
    status,
    statusLabel: status === 'done' ? 'Finalizado' : STATUS_LABELS[status],
    dueDate: task.dueDate ?? null,
    assigneeIds,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

export function validateCreateTaskPayload(body = {}, columnStatus) {
  const fields = {}
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const priority = typeof body.priority === 'string' ? body.priority.trim() : 'medium'
  const statusRaw = typeof body.status === 'string' ? body.status.trim() : columnStatus
  const status = STATUSES.has(statusRaw) ? statusRaw : columnStatus
  const dueDateRaw = body.dueDate
  const dueDate = dueDateRaw === null || dueDateRaw === undefined || dueDateRaw === ''
    ? null
    : String(dueDateRaw).trim()

  if (!title || title.length > 120) {
    fields.title = 'El título es obligatorio (máx. 120 caracteres)'
  }
  if (description.length > 500) {
    fields.description = 'Máximo 500 caracteres'
  }
  if (!PRIORITIES.has(priority)) {
    fields.priority = 'Prioridad inválida'
  }
  if (!STATUSES.has(status)) {
    fields.status = 'Estado inválido'
  }
  if (dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    fields.dueDate = 'Fecha inválida'
  }

  if (Object.keys(fields).length) {
    return { ok: false, fields }
  }

  return {
    ok: true,
    data: { title, description, priority, status, dueDate },
  }
}

export function validatePatchTaskPayload(body = {}) {
  const fields = {}
  const data = {}

  if (body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title || title.length > 120) fields.title = 'El título es obligatorio (máx. 120 caracteres)'
    else data.title = title
  }

  if (body.description !== undefined) {
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    if (description.length > 500) fields.description = 'Máximo 500 caracteres'
    else data.description = description
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.has(body.priority)) fields.priority = 'Prioridad inválida'
    else data.priority = body.priority
  }

  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) fields.status = 'Estado inválido'
    else data.status = body.status
  }

  if (body.dueDate !== undefined) {
    const dueDate = body.dueDate === null || body.dueDate === ''
      ? null
      : String(body.dueDate).trim()
    if (dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      fields.dueDate = 'Fecha inválida'
    } else {
      data.dueDate = dueDate
    }
  }

  if (!Object.keys(data).length) {
    fields.status = 'No hay campos para actualizar'
  }

  if (Object.keys(fields).length) {
    return { ok: false, fields }
  }

  return { ok: true, data }
}

export function buildCreateTaskDocument(uid, payload) {
  const now = new Date().toISOString()
  const document = {
    title: payload.title,
    description: payload.description || '',
    priority: payload.priority,
    status: payload.status,
    assigneeIds: [uid],
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
  }
  if (payload.dueDate) document.dueDate = payload.dueDate
  return document
}

const STATUS_LABELS = {
  in_progress: 'En Progreso',
  review: 'Revisión',
  planning: 'Planificación',
  archived: 'Archivado',
}

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

const PRIORITIES = new Set(['low', 'medium', 'high'])

export function formatProject(project) {
  const ownerId = project.ownerId
  const teamMemberIds = Array.isArray(project.teamMemberIds) && project.teamMemberIds.length
    ? project.teamMemberIds
    : ownerId
      ? [ownerId]
      : []
  const priority = PRIORITIES.has(project.priority) ? project.priority : 'medium'

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    statusLabel: STATUS_LABELS[project.status] || project.status,
    progress: project.progress ?? 0,
    memberCount: project.memberCount ?? teamMemberIds.length,
    priority,
    priorityLabel: PRIORITY_LABELS[priority],
    dueDate: project.dueDate ?? null,
    teamMemberIds,
    lastActivityAt: project.lastActivityAt,
    ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export function validateCreateProjectPayload(body = {}) {
  const fields = {}
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const priority = typeof body.priority === 'string' ? body.priority.trim() : 'low'
  const dueDateRaw = body.dueDate
  const dueDate = dueDateRaw === null || dueDateRaw === undefined || dueDateRaw === ''
    ? null
    : String(dueDateRaw).trim()

  if (!title || title.length > 120) {
    fields.title = 'El nombre es obligatorio (máx. 120 caracteres)'
  }
  if (!description || description.length > 2000) {
    fields.description = 'La descripción es obligatoria (máx. 2000 caracteres)'
  }
  if (!PRIORITIES.has(priority)) {
    fields.priority = 'Prioridad inválida'
  }
  if (dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    fields.dueDate = 'Fecha inválida'
  }

  let teamMemberIds = Array.isArray(body.teamMemberIds)
    ? body.teamMemberIds.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
    : []

  if (teamMemberIds.length > 20) {
    fields.teamMemberIds = 'Máximo 20 miembros'
  }

  if (Object.keys(fields).length) {
    return { ok: false, fields }
  }

  return {
    ok: true,
    data: {
      title,
      description,
      priority,
      dueDate,
      teamMemberIds,
    },
  }
}

export function buildCreateProjectDocument(ownerId, payload) {
  const now = new Date().toISOString()
  const teamMemberIds = [...new Set([ownerId, ...payload.teamMemberIds])]

  const document = {
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    teamMemberIds,
    memberCount: teamMemberIds.length,
    status: 'planning',
    progress: 0,
    ownerId,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  }

  if (payload.dueDate) {
    document.dueDate = payload.dueDate
  }

  return document
}

export function demoProjects(ownerId) {
  const now = Date.now()

  const base = (overrides) => {
    const teamMemberIds = overrides.teamMemberIds || [ownerId]
    const { dueDate, ...rest } = overrides
    const document = {
      priority: 'medium',
      ownerId,
      teamMemberIds,
      memberCount: teamMemberIds.length,
      ...rest,
      teamMemberIds,
      memberCount: (overrides.teamMemberIds || teamMemberIds).length,
    }
    if (dueDate) document.dueDate = dueDate
    return document
  }

  return [
    base({
      title: 'Rediseño Mobile App',
      description: 'Actualización de la interfaz de usuario para la versión 3.0, enfocada en la accesibilidad y el modo oscuro.',
      status: 'in_progress',
      progress: 75,
      priority: 'high',
      lastActivityAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    }),
    base({
      title: 'Sistema de Pagos',
      description: 'Integración de nuevas pasarelas de pago para el mercado europeo.',
      status: 'review',
      progress: 90,
      priority: 'high',
      lastActivityAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    }),
    base({
      title: 'Campaña Verano',
      description: 'Estrategia de contenidos y activos visuales para redes sociales.',
      status: 'planning',
      progress: 15,
      priority: 'low',
      lastActivityAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    base({
      title: 'Q1 Report',
      description: 'Resultados anuales y proyecciones de crecimiento para el segundo cuarto.',
      status: 'archived',
      progress: 100,
      priority: 'medium',
      lastActivityAt: new Date('2024-03-15').toISOString(),
      createdAt: new Date('2024-03-15').toISOString(),
      updatedAt: new Date('2024-03-15').toISOString(),
    }),
    base({
      title: 'Lanzamiento Beta',
      description: 'Pruebas de usuario finales y corrección de errores críticos antes del despliegue.',
      status: 'in_progress',
      progress: 45,
      priority: 'medium',
      lastActivityAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    }),
  ]
}

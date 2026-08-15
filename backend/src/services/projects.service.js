const STATUS_LABELS = {
  in_progress: 'En Progreso',
  review: 'Revisión',
  planning: 'Planificación',
  archived: 'Archivado',
}

export function formatProject(project) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    statusLabel: STATUS_LABELS[project.status] || project.status,
    progress: project.progress,
    memberCount: project.member_count,
    lastActivityAt: project.last_activity_at,
    ownerId: project.owner_id,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  }
}

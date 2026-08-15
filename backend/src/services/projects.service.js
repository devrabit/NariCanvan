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
    memberCount: project.memberCount,
    lastActivityAt: project.lastActivityAt,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export function demoProjects(ownerId) {
  const now = Date.now()

  return [
    {
      title: 'Rediseño Mobile App',
      description: 'Actualización de la interfaz de usuario para la versión 3.0, enfocada en la accesibilidad y el modo oscuro.',
      status: 'in_progress',
      progress: 75,
      memberCount: 6,
      lastActivityAt: new Date(now - 2 * 60 * 60 * 1000),
      ownerId,
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      title: 'Sistema de Pagos',
      description: 'Integración de nuevas pasarelas de pago para el mercado europeo.',
      status: 'review',
      progress: 90,
      memberCount: 2,
      lastActivityAt: new Date(now - 24 * 60 * 60 * 1000),
      ownerId,
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 24 * 60 * 60 * 1000),
    },
    {
      title: 'Campaña Verano',
      description: 'Estrategia de contenidos y activos visuales para redes sociales.',
      status: 'planning',
      progress: 15,
      memberCount: 1,
      lastActivityAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      ownerId,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Q1 Report',
      description: 'Resultados anuales y proyecciones de crecimiento para el segundo cuarto.',
      status: 'archived',
      progress: 100,
      memberCount: 1,
      lastActivityAt: new Date('2024-03-15'),
      ownerId,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
    },
    {
      title: 'Lanzamiento Beta',
      description: 'Pruebas de usuario finales y corrección de errores críticos antes del despliegue.',
      status: 'in_progress',
      progress: 45,
      memberCount: 2,
      lastActivityAt: new Date(now - 1 * 60 * 60 * 1000),
      ownerId,
      createdAt: new Date(now - 1 * 60 * 60 * 1000),
      updatedAt: new Date(now - 1 * 60 * 60 * 1000),
    },
  ]
}

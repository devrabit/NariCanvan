import { createSupabaseClient } from '../config/supabase.js'
import { formatProject } from '../services/projects.service.js'

const DEMO_PROJECTS = [
  {
    title: 'Rediseño Mobile App',
    description: 'Actualización de la interfaz de usuario para la versión 3.0, enfocada en la accesibilidad y el modo oscuro.',
    status: 'in_progress',
    progress: 75,
    member_count: 6,
    last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Sistema de Pagos',
    description: 'Integración de nuevas pasarelas de pago para el mercado europeo.',
    status: 'review',
    progress: 90,
    member_count: 2,
    last_activity_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Campaña Verano',
    description: 'Estrategia de contenidos y activos visuales para redes sociales.',
    status: 'planning',
    progress: 15,
    member_count: 1,
    last_activity_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Q1 Report',
    description: 'Resultados anuales y proyecciones de crecimiento para el segundo cuarto.',
    status: 'archived',
    progress: 100,
    member_count: 1,
    last_activity_at: new Date('2024-03-15').toISOString(),
  },
  {
    title: 'Lanzamiento Beta',
    description: 'Pruebas de usuario finales y corrección de errores críticos antes del despliegue.',
    status: 'in_progress',
    progress: 45,
    member_count: 2,
    last_activity_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

async function seedDemoProjects(userClient, ownerId) {
  const rows = DEMO_PROJECTS.map((p) => ({ ...p, owner_id: ownerId }))
  await userClient.from('projects').insert(rows)
}

export async function listProjects(req, res) {
  const userClient = createSupabaseClient(req.accessToken)

  const { data: existing } = await userClient
    .from('projects')
    .select('id')
    .limit(1)

  if (!existing?.length) {
    await seedDemoProjects(userClient, req.user.id)
  }

  let query = userClient
    .from('projects')
    .select('*')
    .order('last_activity_at', { ascending: false })

  if (req.query.search) {
    query = query.ilike('title', `%${req.query.search}%`)
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error: 'Error al obtener proyectos' })
  }

  res.json({
    projects: data.map(formatProject),
    total: data.length,
  })
}

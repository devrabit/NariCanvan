import { supabase, createSupabaseClient } from '../config/supabase.js'

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.slice(7)

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  const userClient = createSupabaseClient(token)
  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return res.status(401).json({ error: 'Perfil no encontrado' })
  }

  if (!profile.is_active) {
    return res.status(403).json({ error: 'Tu cuenta está desactivada' })
  }

  req.user = user
  req.profile = profile
  req.accessToken = token
  next()
}

import { verifyIdToken } from '../config/firebase.js'
import { getDocument, setDocument } from '../services/firestore.service.js'

function buildProfile(user) {
  const now = new Date()
  return {
    email: user.email,
    fullName: user.name || user.email.split('@')[0] || '',
    role: 'cashier',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.slice(7)

  try {
    const user = await verifyIdToken(token)
    let profile = await getDocument(token, 'users', user.uid)

    if (!profile) {
      const created = buildProfile(user)
      profile = await setDocument(token, 'users', user.uid, created)
    }

    if (!profile.isActive) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada' })
    }

    req.user = user
    req.profile = { id: user.uid, ...profile }
    req.accessToken = token
    next()
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada' })
    }
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

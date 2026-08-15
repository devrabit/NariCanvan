import { verifyIdToken } from '../config/firebase.js'
import { getDocument, createDocumentWithId } from '../services/firestore.service.js'

function buildProfile(user) {
  const now = new Date().toISOString()
  return {
    email: user.email || '',
    fullName: user.name || (user.email ? user.email.split('@')[0] : ''),
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
      try {
        profile = await createDocumentWithId(token, 'users', user.uid, buildProfile(user))
      } catch (createError) {
        // Race: another request may have created it
        profile = await getDocument(token, 'users', user.uid)
        if (!profile) {
          console.error('Firestore profile create failed:', createError.message, createError.details)
          return res.status(403).json({
            error: 'No se pudo crear el perfil en Firestore',
            detail: createError.message,
          })
        }
      }
    }

    if (profile.isActive === false) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada' })
    }

    req.user = user
    req.profile = { id: user.uid, ...profile }
    req.accessToken = token
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message, error.details || '')
    if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED' || error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }
    return res.status(401).json({
      error: 'Token inválido o expirado',
      detail: error.message,
    })
  }
}

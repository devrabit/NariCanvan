import { createRemoteJWKSet, jwtVerify } from 'jose'

const projectId = process.env.FIREBASE_PROJECT_ID || 'naricanvan'

if (!projectId) {
  throw new Error('Missing FIREBASE_PROJECT_ID environment variable')
}

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

export async function verifyIdToken(idToken) {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    clockTolerance: 30,
  })

  return {
    uid: payload.sub,
    email: payload.email || '',
    name: payload.name || '',
  }
}

export function getProjectId() {
  return projectId
}

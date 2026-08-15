import { getProjectId } from '../config/firebase.js'

const BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents`

function toValue(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (typeof value === 'string') {
    // ISO timestamps → Firestore timestamp
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { timestampValue: value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z` }
    }
    return { stringValue: value }
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } }
  if (typeof value === 'object') {
    return { mapValue: { fields: toFields(value) } }
  }
  return { stringValue: String(value) }
}

function toFields(data) {
  const fields = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    fields[key] = toValue(value)
  }
  return fields
}

function fromValue(value) {
  if (!value || typeof value !== 'object') return null
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('mapValue' in value) return fromFields(value.mapValue.fields)
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue)
  return null
}

function fromFields(fields = {}) {
  const data = {}
  for (const [key, value] of Object.entries(fields)) {
    data[key] = fromValue(value)
  }
  return data
}

function parseDocument(doc) {
  const parts = doc.name.split('/')
  return {
    id: parts[parts.length - 1],
    ...fromFields(doc.fields),
  }
}

async function firestoreRequest(accessToken, path, options = {}) {
  const response = await fetch(`${BASE()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (response.status === 404) return null

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = body.error?.message || 'Error de Firestore'
    const error = new Error(message)
    error.status = response.status
    error.details = body
    throw error
  }

  return body
}

export async function getDocument(accessToken, collection, id) {
  const doc = await firestoreRequest(accessToken, `/${collection}/${id}`)
  return doc ? parseDocument(doc) : null
}

export async function setDocument(accessToken, collection, id, data) {
  const fieldPaths = Object.keys(data)
  const mask = fieldPaths.map((p) => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join('&')
  const doc = await firestoreRequest(
    accessToken,
    `/${collection}/${id}?${mask}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ fields: toFields(data) }),
    },
  )
  return parseDocument(doc)
}

export async function createDocumentWithId(accessToken, collection, id, data) {
  const doc = await firestoreRequest(
    accessToken,
    `/${collection}?documentId=${encodeURIComponent(id)}`,
    {
      method: 'POST',
      body: JSON.stringify({ fields: toFields(data) }),
    },
  )
  return parseDocument(doc)
}

export async function createDocument(accessToken, collection, data) {
  const fields = toFields(data)
  try {
    const doc = await firestoreRequest(accessToken, `/${collection}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    })
    return parseDocument(doc)
  } catch (error) {
    console.error('Firestore createDocument failed:', collection, JSON.stringify(fields, null, 2))
    throw error
  }
}

export async function queryCollection(accessToken, collectionId, structuredQuery) {
  const response = await fetch(`${BASE()}:runQuery`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        ...structuredQuery,
      },
    }),
  })

  const rows = await response.json()

  if (!response.ok) {
    const message = rows.error?.message || 'Error al consultar Firestore'
    const error = new Error(message)
    error.status = response.status
    error.details = rows
    throw error
  }

  // Firestore can return an error object inside a 200 array item
  if (Array.isArray(rows) && rows[0]?.error) {
    const message = rows[0].error.message || 'Error al consultar Firestore'
    const error = new Error(message)
    error.status = rows[0].error.code || 500
    error.details = rows[0]
    throw error
  }

  return (Array.isArray(rows) ? rows : [])
    .filter((row) => row.document)
    .map((row) => parseDocument(row.document))
}

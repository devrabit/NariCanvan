import { formatProfile } from '../services/auth.service.js'

export function getMe(req, res) {
  res.json({ profile: formatProfile(req.profile) })
}

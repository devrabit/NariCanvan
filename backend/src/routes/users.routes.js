import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { listUsers } from '../controllers/users.controller.js'

const router = Router()

router.get('/', authMiddleware, listUsers)

export default router

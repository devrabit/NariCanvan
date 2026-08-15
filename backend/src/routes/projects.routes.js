import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { createProject, listProjects } from '../controllers/projects.controller.js'

const router = Router()

router.get('/', authMiddleware, listProjects)
router.post('/', authMiddleware, createProject)

export default router

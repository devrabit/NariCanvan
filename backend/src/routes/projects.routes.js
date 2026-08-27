import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { createProject, getProject, listProjects } from '../controllers/projects.controller.js'
import { createTask, listTasks, patchTask } from '../controllers/tasks.controller.js'

const router = Router()

router.get('/', authMiddleware, listProjects)
router.post('/', authMiddleware, createProject)
router.get('/:projectId', authMiddleware, getProject)
router.get('/:projectId/tasks', authMiddleware, listTasks)
router.post('/:projectId/tasks', authMiddleware, createTask)
router.patch('/:projectId/tasks/:taskId', authMiddleware, patchTask)

export default router

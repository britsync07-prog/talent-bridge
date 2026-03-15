import { Router } from 'express';
import { createTask, getTasksByContract, updateTaskStatus } from '../controllers/task.controller';
import { protect, employer } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', employer, createTask);
router.get('/contract/:contractId', getTasksByContract);
router.patch('/:id/status', updateTaskStatus);

export default router;

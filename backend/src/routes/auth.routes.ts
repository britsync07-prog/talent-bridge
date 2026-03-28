import { Router } from 'express';
import { registerEmployer, registerEngineer, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = Router();

router.post('/register/employer', registerEmployer);
router.post('/register/engineer', registerEngineer);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;

import { Router } from 'express';
import { protect, employer } from '../middleware/auth.middleware';
import { 
    getEmployerProfile, 
    updateEmployerProfile, 
    getEmployerStats, 
    getSavedCandidates, 
    getUpcomingInterviews 
} from '../controllers/employer.controller';

const router: Router = Router();

router.get('/profile', protect, employer, getEmployerProfile);
router.patch('/profile', protect, employer, updateEmployerProfile);
router.get('/stats', protect, employer, getEmployerStats);
router.get('/saved-candidates', protect, employer, getSavedCandidates);
router.get('/interviews', protect, employer, getUpcomingInterviews);

export default router;


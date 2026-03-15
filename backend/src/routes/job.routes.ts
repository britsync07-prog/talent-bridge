import { Router } from 'express';
import { createJob, getAllJobs, getMyJobs, getJobById, hireEngineer, showInterest, withdrawInterest, deleteJob, scheduleCall } from '../controllers/job.controller';
import { protect, employer, admin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllJobs);
router.get('/my-jobs', protect, employer, getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, employer, createJob);
router.post('/interest', protect, employer, showInterest);
router.delete('/interest/:id', protect, employer, withdrawInterest);
router.delete('/:id', protect, employer, deleteJob);
router.patch('/interest/:id/schedule', protect, employer, scheduleCall);

// Admin only onboarding after video call
router.post('/admin/onboard', protect, admin, hireEngineer);

export default router;

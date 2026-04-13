import { Router } from 'express';
import { 
  getEngineers, 
  getEngineerById, 
  matchEngineers, 
  getProfile, 
  updateProfile,
  getEngineerStats,
  getSuggestedJobs,
  getTimesheets,
  getEndorsements,
  deleteCertificate
} from '../controllers/engineer.controller';
import { protect, engineer, optionalProtect } from '../middleware/auth.middleware';
import { upload } from '../utils/multer';

const router: Router = Router();

router.get('/profile', protect, engineer, getProfile);
router.get('/stats', protect, engineer, getEngineerStats);
router.get('/suggested-jobs', protect, engineer, getSuggestedJobs);
router.get('/timesheets', protect, engineer, getTimesheets);
router.get('/endorsements', protect, engineer, getEndorsements);
router.get('/interviews', protect, engineer, getEngineerInterviews);
router.get('/my-employers', protect, engineer, getMyEmployers);
router.patch('/profile', protect, engineer, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'certifications', maxCount: 15 },
  { name: 'profilePic', maxCount: 1 }
]), updateProfile);

router.delete('/certificates/:id', protect, engineer, deleteCertificate);

router.get('/match', optionalProtect, matchEngineers);
router.get('/', optionalProtect, getEngineers);
router.get('/:id', optionalProtect, getEngineerById);

export default router;

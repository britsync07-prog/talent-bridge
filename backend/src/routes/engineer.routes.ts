import { Router } from 'express';
import { getEngineers, getEngineerById, matchEngineers, getProfile, updateProfile } from '../controllers/engineer.controller';
import { protect, engineer } from '../middleware/auth.middleware';
import { upload } from '../utils/multer';

const router: Router = Router();

router.get('/profile', protect, engineer, getProfile);
router.patch('/profile', protect, engineer, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'certifications', maxCount: 1 },
  { name: 'profilePic', maxCount: 1 }
]), updateProfile);

router.get('/match', matchEngineers);
router.get('/', getEngineers);
router.get('/:id', getEngineerById);

export default router;

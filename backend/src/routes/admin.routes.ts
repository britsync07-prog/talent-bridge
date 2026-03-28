import { Router } from 'express';
import { 
    getStats, 
    getActivityLogs, 
    getAllEngineers, 
    getAllEmployers, 
    getAllContracts,
    approveEngineer,
    updateEngineerApprovalStatus,
    toggleEngineerFeature,
    approveEmployer,
    getAllInterests,
    updateInterestStatus,
    deleteInterest,
    createInterestMeeting,
    createEngineerVerificationMeeting
} from '../controllers/admin.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/logs', getActivityLogs);
router.get('/engineers', getAllEngineers);
router.get('/employers', getAllEmployers);
router.get('/contracts', getAllContracts);
router.get('/interests', getAllInterests);
router.post('/interests/:id/meeting', createInterestMeeting);
router.post('/engineers/:id/meeting', createEngineerVerificationMeeting);
router.patch('/interests/:id/status', updateInterestStatus);
router.delete('/interests/:id', deleteInterest);
router.patch('/engineers/:id/approve', approveEngineer);
router.patch('/engineers/:id/status', updateEngineerApprovalStatus);
router.patch('/engineers/:id/feature', toggleEngineerFeature);
router.patch('/employers/:id/approve', approveEmployer);

export default router;

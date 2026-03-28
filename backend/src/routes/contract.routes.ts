import { Router } from 'express';
import { getMyContracts, getContractById, signContract, declineContract } from '../controllers/contract.controller';
import { protect, engineer } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(protect);

router.get('/', getMyContracts);
router.get('/:id', getContractById);
router.patch('/:id/sign', engineer, signContract);
router.patch('/:id/decline', engineer, declineContract);

export default router;

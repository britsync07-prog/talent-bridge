import { Router } from 'express';
import { sendMessage, getMessages, getChatPartners } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:receiverId', getMessages);
router.get('/chat/partners', getChatPartners);

export default router;

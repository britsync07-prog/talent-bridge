import { Router } from 'express';
import { 
    generateInvoice, 
    createCheckoutSession, 
    handleWebhook, 
    getMyInvoices
} from '../controllers/payment.controller';
import { protect, employer } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate-invoice', protect, employer, generateInvoice);
router.post('/create-checkout-session/:invoiceId', protect, employer, createCheckoutSession);
router.get('/invoices', protect, getMyInvoices);
router.post('/webhook', handleWebhook);

export default router;

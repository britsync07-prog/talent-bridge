import { Router } from 'express';
import prisma from '../lib/prisma';
import { protect, employer } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', protect, employer, async (req: any, res) => {
    try {
        const profile = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

import { Router } from 'express';
import prisma from '../lib/prisma';
import { protect, employer } from '../middleware/auth.middleware';

const router: Router = Router();

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

router.patch('/profile', protect, employer, async (req: any, res) => {
    try {
        const { companyName, website, location, industry, size, description } = req.body;

        const updated = await prisma.employerProfile.update({
            where: { userId: req.user.id },
            data: {
                ...(companyName !== undefined && { companyName }),
                ...(website !== undefined && { website }),
                ...(location !== undefined && { location }),
                ...(industry !== undefined && { industry }),
                ...(size !== undefined && { size }),
                ...(description !== undefined && { description }),
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;


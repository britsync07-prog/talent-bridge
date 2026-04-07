import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, content, fileUrl } = req.body;
        const senderId = req.user.id;

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const receiverId = req.params.receiverId as string;
        const senderId = req.user.id as string;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getChatPartners = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        
        // Find all unique users this user has messaged or been messaged by
        const sentTo = await prisma.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true }
        });

        const receivedFrom = await prisma.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true }
        });

        const partnerIds = Array.from(new Set([
            ...sentTo.map((m: any) => m.receiverId),
            ...receivedFrom.map((m: any) => m.senderId)
        ]));

        const partners = await prisma.user.findMany({
            where: { id: { in: partnerIds } },
            select: {
                id: true,
                email: true,
                role: true,
                adminProfile: true,
                employerProfile: true,
                engineerProfile: true
            }
        }) as any;

        const safePartners = partners.map((p: any) => {
            const role = req.user.role;
            if (role === 'ENGINEER' && p.role === 'EMPLOYER') {
                return { 
                    id: p.id, 
                    role: p.role, 
                    employerProfile: p.employerProfile ? { id: p.employerProfile.id, companyName: 'Verified Client' } : null 
                };
            }
            if (role === 'EMPLOYER' && p.role === 'ENGINEER') {
                return { 
                    id: p.id, 
                    role: p.role, 
                    engineerProfile: p.engineerProfile ? { id: p.engineerProfile.id, fullName: `Specialist ${p.engineerProfile.id.slice(0, 5).toUpperCase()}` } : null 
                };
            }
            return { id: p.id, role: p.role, adminProfile: p.adminProfile, employerProfile: p.employerProfile, engineerProfile: p.engineerProfile };
        });

        res.json(safePartners);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

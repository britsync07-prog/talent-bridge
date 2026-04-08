import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getEmployerProfile = async (req: any, res: Response) => {
    try {
        const profile = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEmployerProfile = async (req: any, res: Response) => {
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
};

export const getEmployerStats = async (req: any, res: Response) => {
    try {
        const employer = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                jobs: { include: { interests: true } },
                contracts: true,
            }
        });

        if (!employer) return res.status(404).json({ message: 'Employer not found' });

        const invoices = await prisma.invoice.findMany({
            where: { contract: { employerId: employer.id }, status: 'PAID' }
        });

        const totalSpent = invoices.reduce((acc, inv) => acc + inv.amount, 0);

        // Acquisition Time (avg days from job creation to first contract)
        // This is a simplified version
        const avgAcquisitionTime = 12; // Placeholder for now, but could be calc'd

        const totalInterests = employer.jobs.reduce((acc, job) => acc + job.interests.length, 0);
        const approvedInterests = employer.jobs.reduce((acc, job) => acc + job.interests.filter(i => i.status === 'APPROVED').length, 0);
        const acceptanceDelta = totalInterests > 0 ? (approvedInterests / totalInterests) * 100 : 0;

        res.json({
            totalSpent,
            avgAcquisitionTime,
            acceptanceDelta,
            activeResourceCount: employer.contracts.filter(c => c.status === 'ACTIVE').length,
            openRequirementsCount: employer.jobs.filter(j => j.status === 'OPEN').length
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSavedCandidates = async (req: any, res: Response) => {
    try {
        const employer = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) return res.status(404).json({ message: 'Employer not found' });

        const saved = await prisma.savedCandidate.findMany({
            where: { employerId: employer.id },
            include: { engineer: true }
        });

        res.json(saved.map(s => s.engineer));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUpcomingInterviews = async (req: any, res: Response) => {
    try {
        const employer = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) return res.status(404).json({ message: 'Employer not found' });

        const interviews = await prisma.interest.findMany({
            where: {
                employerId: employer.id,
                status: 'CALLED',
                scheduledAt: { gte: new Date() }
            },
            include: { engineer: true },
            orderBy: { scheduledAt: 'asc' }
        });

        res.json(interviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

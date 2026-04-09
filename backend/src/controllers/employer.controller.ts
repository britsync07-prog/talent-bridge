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
        const contractsWithJobs = await prisma.contract.findMany({
            where: { employerId: employer.id },
            include: { engineer: { include: { interests: { include: { job: true } } } } }
        });

        let totalDays = 0;
        let jobCount = 0;

        contractsWithJobs.forEach(c => {
            const relevantInterest = c.engineer.interests.find(i => i.employerId === employer.id);
            if (relevantInterest && relevantInterest.job) {
                const diff = c.createdAt.getTime() - relevantInterest.job.createdAt.getTime();
                totalDays += diff / (1000 * 60 * 60 * 24);
                jobCount++;
            }
        });

        const avgAcquisitionTime = jobCount > 0 ? Math.round(totalDays / jobCount) : 0;

        const totalInterests = employer.jobs.reduce((acc, job) => acc + job.interests.length, 0);
        const approvedInterests = employer.jobs.reduce((acc, job) => acc + job.interests.filter(i => i.status === 'APPROVED').length, 0);
        const calledInterests = employer.jobs.reduce((acc, job) => acc + job.interests.filter(i => i.status === 'CALLED').length, 0);
        
        const acceptanceDelta = totalInterests > 0 ? (approvedInterests / totalInterests) * 100 : 0;
        const costPerHire = employer.contracts.length > 0 ? totalSpent / employer.contracts.length : 0;

        res.json({
            totalSpent,
            avgAcquisitionTime,
            acceptanceDelta,
            costPerHire,
            pipeline: {
                interests: totalInterests,
                interviews: calledInterests,
                hired: approvedInterests
            },
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

        const isAdmin = req.user?.role === 'ADMIN';

        res.json(saved.map(s => {
            const { hourlyRate, monthlySalaryExpectation, ...rest } = s.engineer;
            return isAdmin ? s.engineer : rest;
        }));
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

        const isAdmin = req.user?.role === 'ADMIN';

        res.json(interviews.map(i => {
            const { hourlyRate, monthlySalaryExpectation, ...rest } = i.engineer;
            return {
                ...i,
                engineer: isAdmin ? i.engineer : rest
            };
        }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

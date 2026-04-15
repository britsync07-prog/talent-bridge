"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingInterviews = exports.getSavedCandidates = exports.getEmployerStats = exports.updateEmployerProfile = exports.getEmployerProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getEmployerProfile = async (req, res) => {
    try {
        const profile = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEmployerProfile = getEmployerProfile;
const updateEmployerProfile = async (req, res) => {
    try {
        const { companyName, website, location, industry, size, description } = req.body;
        const updated = await prisma_1.default.employerProfile.update({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateEmployerProfile = updateEmployerProfile;
const getEmployerStats = async (req, res) => {
    try {
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                jobs: { include: { interests: true } },
                contracts: true,
            }
        });
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        const invoices = await prisma_1.default.invoice.findMany({
            where: { contract: { employerId: employer.id }, status: 'PAID' }
        });
        const totalSpent = invoices.reduce((acc, inv) => acc + inv.amount, 0);
        // Acquisition Time (avg days from job creation to first contract)
        const contractsWithJobs = await prisma_1.default.contract.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEmployerStats = getEmployerStats;
const getSavedCandidates = async (req, res) => {
    try {
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        const saved = await prisma_1.default.savedCandidate.findMany({
            where: { employerId: employer.id },
            include: { engineer: true }
        });
        const isAdmin = req.user?.role === 'ADMIN';
        res.json(saved.map(s => {
            const { hourlyRate, monthlySalaryExpectation, ...rest } = s.engineer;
            const data = isAdmin ? s.engineer : rest;
            return {
                ...data,
                fullName: isAdmin ? s.engineer.fullName : `Elite Operator #${s.engineer.id.slice(0, 4)}`
            };
        }));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSavedCandidates = getSavedCandidates;
const getUpcomingInterviews = async (req, res) => {
    try {
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        const interviews = await prisma_1.default.interest.findMany({
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
            const data = isAdmin ? i.engineer : rest;
            return {
                ...i,
                engineer: {
                    ...data,
                    fullName: isAdmin ? i.engineer.fullName : `Elite Operator #${i.engineer.id.slice(0, 4)}`
                }
            };
        }));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUpcomingInterviews = getUpcomingInterviews;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hireEngineer = exports.getJobById = exports.getMyJobs = exports.getAllJobs = exports.scheduleCall = exports.deleteJob = exports.withdrawInterest = exports.showInterest = exports.createJob = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// POST /api/jobs
const createJob = async (req, res) => {
    try {
        const { title, description, requiredSkills, maxBudget, duration } = req.body;
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Only employers can post jobs' });
        }
        const job = await prisma_1.default.job.create({
            data: {
                employerId: employer.id,
                title,
                description,
                requiredSkills,
                maxBudget: parseFloat(maxBudget),
                duration,
                status: 'PENDING'
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'job posted',
                details: `Job created: ${title}`
            }
        });
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createJob = createJob;
// POST /api/jobs/interest
const showInterest = async (req, res) => {
    try {
        const { jobId, engineerId, type } = req.body;
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Only employers can show interest' });
        }
        // Check if interest already exists
        const existing = await prisma_1.default.interest.findFirst({
            where: { jobId, employerId: employer.id, engineerId }
        });
        if (existing) {
            return res.status(400).json({ message: 'Interest already expressed' });
        }
        const interest = await prisma_1.default.interest.create({
            data: {
                jobId,
                employerId: employer.id,
                engineerId,
                type: type || 'LEASE',
                status: 'PENDING'
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'interest shown',
                details: `Employer interested in engineer for job ${jobId} (${type || 'LEASE'}). Schedule call required.`
            }
        });
        res.status(201).json(interest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.showInterest = showInterest;
// DELETE /api/jobs/interest/:id
const withdrawInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Only employers can withdraw interest' });
        }
        const interest = await prisma_1.default.interest.findUnique({
            where: { id: id }
        });
        if (!interest || interest.employerId !== employer.id) {
            return res.status(404).json({ message: 'Interest not found or unauthorized' });
        }
        await prisma_1.default.interest.delete({
            where: { id: id }
        });
        res.json({ message: 'Interest withdrawn successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.withdrawInterest = withdrawInterest;
// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Only employers can delete jobs' });
        }
        const job = await prisma_1.default.job.findUnique({
            where: { id: id }
        });
        if (!job || job.employerId !== employer.id) {
            return res.status(404).json({ message: 'Job not found or unauthorized' });
        }
        await prisma_1.default.job.delete({
            where: { id: id }
        });
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteJob = deleteJob;
// PATCH /api/jobs/interest/:id/schedule
const scheduleCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledAt } = req.body;
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Only employers can schedule calls' });
        }
        const interest = await prisma_1.default.interest.findUnique({
            where: { id: id }
        });
        if (!interest || interest.employerId !== employer.id) {
            return res.status(404).json({ message: 'Interest not found or unauthorized' });
        }
        const updatedInterest = await prisma_1.default.interest.update({
            where: { id: id },
            data: {
                scheduledAt: new Date(scheduledAt),
                status: 'PENDING' // Ensure it's in pending if it was rejected or approved
            },
            include: {
                engineer: true,
                job: true
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'interest shown',
                details: `Employer scheduled a call for job ${interest.jobId} on ${new Date(scheduledAt).toLocaleString()}`
            }
        });
        res.json(updatedInterest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.scheduleCall = scheduleCall;
// GET /api/jobs
const getAllJobs = async (req, res) => {
    try {
        const rawJobs = await prisma_1.default.job.findMany({
            where: { status: 'OPEN' },
            include: { employer: true },
            orderBy: { createdAt: 'desc' }
        });
        const jobs = rawJobs.map(j => ({
            ...j,
            employer: j.employer ? { id: j.employer.id, companyName: 'Verified Client' } : null
        }));
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllJobs = getAllJobs;
// GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
    try {
        const employer = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!employer) {
            return res.status(403).json({ message: 'Employer profile not found' });
        }
        const jobs = await prisma_1.default.job.findMany({
            where: { employerId: employer.id },
            include: {
                interests: {
                    include: { engineer: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyJobs = getMyJobs;
// GET /api/jobs/:id
const getJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await prisma_1.default.job.findUnique({
            where: { id },
            include: { employer: true }
        });
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.employer) {
            job.employer = { id: job.employer.id, companyName: 'Verified Client' };
        }
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getJobById = getJobById;
// POST /api/jobs/admin/onboard
// Only Admin can call this after the video call
const hireEngineer = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only Admin can onboard after call' });
        }
        const { employerId, engineerId, salary, type, platformFee } = req.body;
        // Check if contract already exists
        const existingContract = await prisma_1.default.contract.findFirst({
            where: { employerId, engineerId, status: { in: ['PENDING', 'ACTIVE'] } }
        });
        if (existingContract) {
            return res.status(400).json({ message: 'A contract already exists for this engagement' });
        }
        const contract = await prisma_1.default.contract.create({
            data: {
                employerId,
                engineerId,
                salary: parseFloat(salary),
                type: type || 'LEASE', // LEASE or FULLTIME
                platformFee: parseFloat(platformFee || "0"),
                status: 'PENDING'
            }
        });
        // Update interest status if exists
        await prisma_1.default.interest.updateMany({
            where: { employerId, engineerId },
            data: { status: 'APPROVED' }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'engineer hired',
                details: `Admin onboarded engineer for contract ${contract.id} (${type})`
            }
        });
        res.status(201).json(contract);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.hireEngineer = hireEngineer;

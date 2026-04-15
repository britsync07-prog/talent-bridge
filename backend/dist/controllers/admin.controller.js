"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disapproveJob = exports.approveJob = exports.getAllJobsForAdmin = exports.updateSystemConfig = exports.getSystemConfig = exports.deleteInterest = exports.updateInterestStatus = exports.getAllInterests = exports.getAllContracts = exports.getActivityLogs = exports.getStats = exports.approveEmployer = exports.getAllEmployers = exports.toggleEngineerFeature = exports.updateEngineerApprovalStatus = exports.approveEngineer = exports.getAllEngineers = exports.createEngineerVerificationMeeting = exports.createInterestMeeting = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const meeting_1 = require("../utils/meeting");
const createInterestMeeting = async (req, res) => {
    try {
        const id = req.params.id;
        const interest = await prisma_1.default.interest.findUnique({
            where: { id },
            include: {
                employer: true,
                engineer: true,
                job: true
            }
        });
        if (!interest) {
            return res.status(404).json({ message: 'Interest record not found' });
        }
        const title = `Interview: ${interest.engineer?.fullName || 'Engineer'} for ${interest.job?.title || 'Job'}`;
        const startTime = interest.scheduledAt?.toISOString() || new Date().toISOString();
        const meetingData = await (0, meeting_1.createLeadHunterMeeting)(title, startTime);
        const updatedInterest = await prisma_1.default.interest.update({
            where: { id },
            data: {
                meetingId: meetingData.meeting_id,
                joinUrl: meetingData.join_url,
                status: 'CALLED'
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'interest shown',
                details: `Admin created meeting for ${interest.engineer?.fullName || 'Engineer'} (ID: ${meetingData.meeting_id})`
            }
        });
        res.json(updatedInterest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createInterestMeeting = createInterestMeeting;
const createEngineerVerificationMeeting = async (req, res) => {
    try {
        const id = req.params.id;
        const engineer = await prisma_1.default.engineerProfile.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!engineer) {
            return res.status(404).json({ message: 'Engineer profile not found' });
        }
        const title = `Verification: ${engineer.fullName || 'Engineer'}`;
        const startTime = new Date().toISOString();
        const meetingData = await (0, meeting_1.createLeadHunterMeeting)(title, startTime);
        const updatedEngineer = await prisma_1.default.engineerProfile.update({
            where: { id },
            data: {
                meetingId: meetingData.meeting_id,
                joinUrl: meetingData.join_url,
                approvalStatus: 'ACCEPTED_FOR_INTERVIEW'
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'engineer hired', // Reusing relevant action or could add 'candidate verified'
                details: `Admin created verification meeting for ${engineer.fullName} (ID: ${meetingData.meeting_id})`
            }
        });
        res.json(updatedEngineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createEngineerVerificationMeeting = createEngineerVerificationMeeting;
const getAllEngineers = async (req, res) => {
    try {
        const engineers = await prisma_1.default.engineerProfile.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true
                    }
                },
                interests: {
                    include: {
                        employer: true
                    }
                }
            }
        });
        const processedEngineers = engineers.map(eng => ({
            ...eng,
            fullName: eng.fullName || 'Unnamed Engineer'
        }));
        res.json(processedEngineers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllEngineers = getAllEngineers;
const approveEngineer = async (req, res) => {
    try {
        const id = req.params.id;
        const { isApproved, disapprovalReason } = req.body;
        // When admin toggles isApproved directly, we should update approvalStatus accordingly
        const data = { isApproved, disapprovalReason: disapprovalReason || null };
        if (isApproved) {
            data.approvalStatus = 'FULLY_APPROVED';
        }
        else {
            data.approvalStatus = 'PENDING';
        }
        const engineer = await prisma_1.default.engineerProfile.update({
            where: { id },
            data
        });
        res.json(engineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.approveEngineer = approveEngineer;
const updateEngineerApprovalStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { approvalStatus } = req.body;
        const updateData = { approvalStatus };
        // Automatically set isApproved to true if FULLY_APPROVED is set
        if (approvalStatus === 'FULLY_APPROVED') {
            updateData.isApproved = true;
        }
        else {
            updateData.isApproved = false;
        }
        const engineer = await prisma_1.default.engineerProfile.update({
            where: { id },
            data: updateData
        });
        res.json(engineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateEngineerApprovalStatus = updateEngineerApprovalStatus;
const toggleEngineerFeature = async (req, res) => {
    try {
        const id = req.params.id;
        const { isFeatured } = req.body;
        const engineer = await prisma_1.default.engineerProfile.update({
            where: { id },
            data: { isFeatured } // Type assertion to bypass TS if generate failed
        });
        res.json(engineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.toggleEngineerFeature = toggleEngineerFeature;
const getAllEmployers = async (req, res) => {
    try {
        const employers = await prisma_1.default.employerProfile.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true
                    }
                },
                interests: {
                    include: {
                        engineer: true
                    }
                }
            }
        });
        const processedEmployers = employers.map(emp => ({
            ...emp,
            companyName: emp.companyName || 'Unnamed Employer'
        }));
        res.json(processedEmployers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllEmployers = getAllEmployers;
const approveEmployer = async (req, res) => {
    try {
        const id = req.params.id;
        const { isApproved, disapprovalReason } = req.body;
        const employer = await prisma_1.default.employerProfile.update({
            where: { id },
            data: { isApproved, disapprovalReason: disapprovalReason || null }
        });
        res.json(employer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.approveEmployer = approveEmployer;
const getStats = async (req, res) => {
    try {
        const [engineersCount, employersCount, jobsCount, contractsCount] = await Promise.all([
            prisma_1.default.engineerProfile.count(),
            prisma_1.default.employerProfile.count(),
            prisma_1.default.job.count(),
            prisma_1.default.contract.count({ where: { status: 'ACTIVE' } })
        ]);
        const revenueAgg = await prisma_1.default.invoice.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' }
        });
        const totalRevenue = revenueAgg._sum.amount ?? 0;
        res.json({
            totalEngineers: engineersCount,
            totalEmployers: employersCount,
            totalJobs: jobsCount,
            activeContracts: contractsCount,
            totalRevenue
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getStats = getStats;
const getActivityLogs = async (req, res) => {
    try {
        const logs = await prisma_1.default.activity_log.findMany({
            include: {
                user: {
                    select: { email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getActivityLogs = getActivityLogs;
const getAllContracts = async (req, res) => {
    try {
        const contracts = await prisma_1.default.contract.findMany({
            include: {
                employer: true,
                engineer: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(contracts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllContracts = getAllContracts;
const getAllInterests = async (req, res) => {
    try {
        const interests = await prisma_1.default.interest.findMany({
            include: {
                employer: true,
                engineer: true,
                job: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const processedInterests = interests.map(interest => ({
            ...interest,
            engineer: interest.engineer ? { ...interest.engineer, fullName: interest.engineer.fullName || 'Unnamed Engineer' } : null,
            employer: interest.employer ? { ...interest.employer, companyName: interest.employer.companyName || 'Unnamed Employer' } : null
        }));
        res.json(processedInterests);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllInterests = getAllInterests;
const updateInterestStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const interest = await prisma_1.default.interest.update({
            where: { id },
            data: { status }
        });
        res.json(interest);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateInterestStatus = updateInterestStatus;
const deleteInterest = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.interest.delete({
            where: { id }
        });
        res.json({ message: 'Interest deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteInterest = deleteInterest;
const getSystemConfig = async (req, res) => {
    try {
        const config = await prisma_1.default.systemConfig.findMany();
        res.json(config);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSystemConfig = getSystemConfig;
const updateSystemConfig = async (req, res) => {
    try {
        const { key, value } = req.body;
        const config = await prisma_1.default.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(config);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateSystemConfig = updateSystemConfig;
const getAllJobsForAdmin = async (req, res) => {
    try {
        const jobs = await prisma_1.default.job.findMany({
            include: { employer: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllJobsForAdmin = getAllJobsForAdmin;
const approveJob = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await prisma_1.default.job.update({
            where: { id },
            data: { status: 'OPEN', disapprovalReason: null }
        });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.approveJob = approveJob;
const disapproveJob = async (req, res) => {
    try {
        const id = req.params.id;
        const { reason } = req.body;
        const job = await prisma_1.default.job.update({
            where: { id },
            data: { status: 'DISAPPROVED', disapprovalReason: reason }
        });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.disapproveJob = disapproveJob;

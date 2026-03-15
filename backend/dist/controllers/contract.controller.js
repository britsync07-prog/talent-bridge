"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineContract = exports.signContract = exports.getContractById = exports.getMyContracts = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET /api/contracts
const getMyContracts = async (req, res) => {
    try {
        let contracts;
        if (req.user.role === 'EMPLOYER') {
            const employer = await prisma_1.default.employerProfile.findUnique({ where: { userId: req.user.id } });
            contracts = await prisma_1.default.contract.findMany({
                where: { employerId: employer?.id },
                include: { engineer: true, tasks: true }
            });
        }
        else if (req.user.role === 'ENGINEER') {
            const engineer = await prisma_1.default.engineerProfile.findUnique({ where: { userId: req.user.id } });
            contracts = await prisma_1.default.contract.findMany({
                where: { engineerId: engineer?.id },
                include: { employer: true, tasks: true }
            });
        }
        res.json(contracts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyContracts = getMyContracts;
// GET /api/contracts/:id
const getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await prisma_1.default.contract.findUnique({
            where: { id: id },
            include: {
                employer: true,
                engineer: true,
                tasks: true,
                invoices: true
            }
        });
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }
        res.json(contract);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getContractById = getContractById;
// PATCH /api/contracts/:id/sign
const signContract = async (req, res) => {
    try {
        const { id } = req.params;
        const engineer = await prisma_1.default.engineerProfile.findUnique({ where: { userId: req.user.id } });
        if (!engineer) {
            return res.status(403).json({ message: 'Only engineers can sign contracts' });
        }
        const contract = await prisma_1.default.contract.findUnique({
            where: { id: id },
        });
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }
        if (contract.engineerId !== engineer.id) {
            return res.status(403).json({ message: 'You are not assigned to this contract' });
        }
        const updatedContract = await prisma_1.default.contract.update({
            where: { id: id },
            data: {
                status: 'ACTIVE',
                startDate: new Date()
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'contract signed',
                details: `Contract ${id} signed by engineer`
            }
        });
        res.json(updatedContract);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.signContract = signContract;
// PATCH /api/contracts/:id/decline
const declineContract = async (req, res) => {
    try {
        const { id } = req.params;
        const engineer = await prisma_1.default.engineerProfile.findUnique({ where: { userId: req.user.id } });
        if (!engineer) {
            return res.status(403).json({ message: 'Only engineers can decline contracts' });
        }
        const contract = await prisma_1.default.contract.findUnique({
            where: { id: id }
        });
        if (!contract || contract.engineerId !== engineer.id) {
            return res.status(404).json({ message: 'Contract not found or unauthorized' });
        }
        if (contract.status !== 'PENDING') {
            return res.status(400).json({ message: 'Only pending contracts can be declined' });
        }
        // We can either delete it or mark it as terminated
        const updatedContract = await prisma_1.default.contract.update({
            where: { id: id },
            data: { status: 'TERMINATED' }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'contract declined',
                details: `Contract ${id} declined by engineer`
            }
        });
        res.json(updatedContract);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.declineContract = declineContract;

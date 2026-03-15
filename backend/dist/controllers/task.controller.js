"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.getTasksByContract = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { contractId, title, description, priority, deadline } = req.body;
        // Verify contract belongs to this employer
        const contract = await prisma_1.default.contract.findUnique({
            where: { id: contractId },
            include: { employer: true }
        });
        if (!contract || contract.employer.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to assign tasks to this contract' });
        }
        const task = await prisma_1.default.task.create({
            data: {
                contractId,
                title,
                description,
                priority: priority || 'MEDIUM',
                deadline: deadline ? new Date(deadline) : null,
                status: 'PENDING'
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'task assigned',
                details: `Task "${title}" assigned to contract ${contractId}`
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createTask = createTask;
// GET /api/tasks/contract/:contractId
const getTasksByContract = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        const tasks = await prisma_1.default.task.findMany({
            where: { contractId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTasksByContract = getTasksByContract;
// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // PENDING, IN_PROGRESS, REVIEW, COMPLETED
        const task = await prisma_1.default.task.findUnique({
            where: { id },
            include: { contract: { include: { engineer: true } } }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Only the engineer assigned to the contract or the employer can update status
        // But per spec: "Engineers must update tasks themselves."
        if (req.user.role === 'ENGINEER' && task.contract.engineer.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this task' });
        }
        const updatedTask = await prisma_1.default.task.update({
            where: { id },
            data: { status }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'task updated',
                details: `Task "${task.title}" status changed to ${status}`
            }
        });
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;

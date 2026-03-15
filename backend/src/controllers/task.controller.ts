import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId, title, description, priority, deadline } = req.body;

    // Verify contract belongs to this employer
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { employer: true }
    });

    if (!contract || contract.employer.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to assign tasks to this contract' });
    }

    const task = await prisma.task.create({
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
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'task assigned',
        details: `Task "${title}" assigned to contract ${contractId}`
      }
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/contract/:contractId
export const getTasksByContract = async (req: AuthRequest, res: Response) => {
  try {
    const contractId = req.params.contractId as string;

    const tasks = await prisma.task.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // PENDING, IN_PROGRESS, REVIEW, COMPLETED

    const task = await prisma.task.findUnique({
      where: { id },
      include: { contract: { include: { engineer: true } } }
    }) as any;

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the engineer assigned to the contract or the employer can update status
    // But per spec: "Engineers must update tasks themselves."
    if (req.user.role === 'ENGINEER' && task.contract.engineer.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'task updated',
        details: `Task "${task.title}" status changed to ${status}`
      }
    });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

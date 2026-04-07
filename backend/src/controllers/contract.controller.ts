import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/contracts
export const getMyContracts = async (req: AuthRequest, res: Response) => {
  try {
    let contracts;

    if (req.user.role === 'EMPLOYER') {
      const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
      contracts = await prisma.contract.findMany({
        where: { employerId: employer?.id },
        include: { engineer: true, tasks: true }
      });
    } else if (req.user.role === 'ENGINEER') {
      const engineer = await prisma.engineerProfile.findUnique({ where: { userId: req.user.id } });
      const rawContracts = await prisma.contract.findMany({
        where: { engineerId: engineer?.id },
        include: { employer: true, tasks: true }
      });
      // Redact employer info
      contracts = rawContracts.map(c => ({
        ...c,
        employer: c.employer ? { id: c.employer.id, companyName: 'Verified Client' } : null
      }));
    }

    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/contracts/:id
export const getContractById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;

    const contract = await prisma.contract.findUnique({
      where: { id: id as string },
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

    if (req.user.role === 'ENGINEER' && contract.employer) {
      (contract as any).employer = { id: contract.employer.id, companyName: 'Verified Client' };
    }

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/contracts/:id/sign
export const signContract = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;

    const engineer = await prisma.engineerProfile.findUnique({ where: { userId: req.user.id } });
    if (!engineer) {
      return res.status(403).json({ message: 'Only engineers can sign contracts' });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: id as string },
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.engineerId !== engineer.id) {
      return res.status(403).json({ message: 'You are not assigned to this contract' });
    }

    const updatedContract = await prisma.contract.update({
      where: { id: id as string },
      data: { 
        status: 'ACTIVE',
        startDate: new Date()
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'contract signed',
        details: `Contract ${id} signed by engineer`
      }
    });

    res.json(updatedContract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/contracts/:id/decline
export const declineContract = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const engineer = await prisma.engineerProfile.findUnique({ where: { userId: req.user.id } });
    if (!engineer) {
      return res.status(403).json({ message: 'Only engineers can decline contracts' });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: id as string }
    });

    if (!contract || contract.engineerId !== engineer.id) {
      return res.status(404).json({ message: 'Contract not found or unauthorized' });
    }

    if (contract.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending contracts can be declined' });
    }

    // We can either delete it or mark it as terminated
    const updatedContract = await prisma.contract.update({
      where: { id: id as string },
      data: { status: 'TERMINATED' }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'contract declined',
        details: `Contract ${id} declined by engineer`
      }
    });

    res.json(updatedContract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

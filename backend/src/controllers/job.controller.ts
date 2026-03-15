import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// POST /api/jobs
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, requiredSkills, maxBudget, duration } = req.body;
    
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title,
        description,
        requiredSkills,
        maxBudget: parseFloat(maxBudget),
        duration,
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'job posted',
        details: `Job created: ${title}`
      }
    });

    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/jobs/interest
export const showInterest = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, engineerId, type } = req.body;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Only employers can show interest' });
    }

    // Check if interest already exists
    const existing = await prisma.interest.findFirst({
        where: { jobId, employerId: employer.id, engineerId }
    });

    if (existing) {
        return res.status(400).json({ message: 'Interest already expressed' });
    }

    const interest = await prisma.interest.create({
      data: {
        jobId,
        employerId: employer.id,
        engineerId,
        type: type || 'LEASE',
        status: 'PENDING'
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'interest shown',
        details: `Employer interested in engineer for job ${jobId} (${type || 'LEASE'}). Schedule call required.`
      }
    });

    res.status(201).json(interest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/interest/:id
export const withdrawInterest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Only employers can withdraw interest' });
    }

    const interest = await prisma.interest.findUnique({
      where: { id: id as string }
    });

    if (!interest || interest.employerId !== employer.id) {
      return res.status(404).json({ message: 'Interest not found or unauthorized' });
    }

    await prisma.interest.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Interest withdrawn successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/:id
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Only employers can delete jobs' });
    }

    const job = await prisma.job.findUnique({
      where: { id: id as string }
    });

    if (!job || job.employerId !== employer.id) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    await prisma.job.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/jobs/interest/:id/schedule
export const scheduleCall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Only employers can schedule calls' });
    }

    const interest = await prisma.interest.findUnique({
      where: { id: id as string }
    });

    if (!interest || interest.employerId !== employer.id) {
      return res.status(404).json({ message: 'Interest not found or unauthorized' });
    }

    const updatedInterest = await prisma.interest.update({
      where: { id: id as string },
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
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'interest shown',
        details: `Employer scheduled a call for job ${interest.jobId} on ${new Date(scheduledAt).toLocaleString()}`
      }
    });

    res.json(updatedInterest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: { employer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/my-jobs
export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      return res.status(403).json({ message: 'Employer profile not found' });
    }

    const jobs = await prisma.job.findMany({
      where: { employerId: employer.id },
      include: { 
        interests: {
            include: { engineer: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/:id
export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.job.findUnique({
      where: { id },
      include: { employer: true }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/jobs/admin/onboard
// Only Admin can call this after the video call
export const hireEngineer = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only Admin can onboard after call' });
    }

    const { employerId, engineerId, salary, type, platformFee } = req.body;

    const contract = await prisma.contract.create({
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
    await prisma.interest.updateMany({
        where: { employerId, engineerId },
        data: { status: 'APPROVED' }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'engineer hired',
        details: `Admin onboarded engineer for contract ${contract.id} (${type})`
      }
    });

    res.status(201).json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

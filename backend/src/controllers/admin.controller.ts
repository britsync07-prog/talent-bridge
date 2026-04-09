import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { createLeadHunterMeeting } from '../utils/meeting';

export const createInterestMeeting = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const interest = await prisma.interest.findUnique({
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

    const title = `Interview: ${(interest as any).engineer?.fullName || 'Engineer'} for ${(interest as any).job?.title || 'Job'}`;
    const startTime = interest.scheduledAt?.toISOString() || new Date().toISOString();

    const meetingData = await createLeadHunterMeeting(title, startTime);

    const updatedInterest = await prisma.interest.update({
      where: { id },
      data: {
        meetingId: meetingData.meeting_id,
        joinUrl: meetingData.join_url,
        status: 'CALLED'
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: (req as any).user.id,
        action: 'interest shown',
        details: `Admin created meeting for ${(interest as any).engineer?.fullName || 'Engineer'} (ID: ${meetingData.meeting_id})`
      }
    });

    res.json(updatedInterest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEngineerVerificationMeeting = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const engineer = await prisma.engineerProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer profile not found' });
    }

    const title = `Verification: ${engineer.fullName || 'Engineer'}`;
    const startTime = new Date().toISOString();

    const meetingData = await createLeadHunterMeeting(title, startTime);

    const updatedEngineer = await prisma.engineerProfile.update({
      where: { id },
      data: {
        meetingId: meetingData.meeting_id,
        joinUrl: meetingData.join_url,
        approvalStatus: 'ACCEPTED_FOR_INTERVIEW'
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: (req as any).user.id,
        action: 'engineer hired', // Reusing relevant action or could add 'candidate verified'
        details: `Admin created verification meeting for ${engineer.fullName} (ID: ${meetingData.meeting_id})`
      }
    });

    res.json(updatedEngineer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEngineers = async (req: Request, res: Response) => {
  try {
    const engineers = await prisma.engineerProfile.findMany({
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
    res.json(engineers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveEngineer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isApproved, disapprovalReason } = req.body;

    // When admin toggles isApproved directly, we should update approvalStatus accordingly
    const data: any = { isApproved, disapprovalReason: disapprovalReason || null };
    if (isApproved) {
      data.approvalStatus = 'FULLY_APPROVED';
    } else {
      data.approvalStatus = 'PENDING';
    }

    const engineer = await prisma.engineerProfile.update({
      where: { id },
      data
    });

    res.json(engineer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEngineerApprovalStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { approvalStatus } = req.body;

    const updateData: any = { approvalStatus };
    
    // Automatically set isApproved to true if FULLY_APPROVED is set
    if (approvalStatus === 'FULLY_APPROVED') {
      updateData.isApproved = true;
    } else {
      updateData.isApproved = false;
    }

    const engineer = await prisma.engineerProfile.update({
      where: { id },
      data: updateData
    });

    res.json(engineer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleEngineerFeature = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isFeatured } = req.body;

    const engineer = await prisma.engineerProfile.update({
      where: { id },
      data: { isFeatured } as any // Type assertion to bypass TS if generate failed
    });

    res.json(engineer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEmployers = async (req: Request, res: Response) => {
  try {
    const employers = await prisma.employerProfile.findMany({
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
    res.json(employers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveEmployer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isApproved, disapprovalReason } = req.body;

    const employer = await prisma.employerProfile.update({
      where: { id },
      data: { isApproved, disapprovalReason: disapprovalReason || null }
    });

    res.json(employer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const [engineersCount, employersCount, jobsCount, contractsCount] = await Promise.all([
      prisma.engineerProfile.count(),
      prisma.employerProfile.count(),
      prisma.job.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } })
    ]);

    const revenueAgg = await prisma.invoice.aggregate({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activity_log.findMany({
      include: {
        user: {
          select: { email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        employer: true,
        engineer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const interests = await prisma.interest.findMany({
      include: {
        employer: true,
        engineer: true,
        job: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(interests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInterestStatus = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
  
      const interest = await prisma.interest.update({
        where: { id },
        data: { status }
      });
  
      res.json(interest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.interest.delete({
      where: { id }
    });
    res.json({ message: 'Interest deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemConfig.findMany();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSystemConfig = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobsForAdmin = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { employer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'OPEN', disapprovalReason: null }
    });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const disapproveJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'DISAPPROVED', disapprovalReason: reason }
    });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
